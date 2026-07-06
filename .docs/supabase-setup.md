# Supabase Setup Guide

## Prerequisites

- A Supabase account at https://supabase.com
- A Google Cloud Console account at https://console.cloud.google.com

---

## Step 1: Create a Supabase Project

1. Go to https://supabase.com and sign in
2. Click **New project**
3. Fill in:
   - **Name**: `splitr` (or any name)
   - **Database password**: Generate a strong password and save it
   - **Region**: Choose the closest to your users
4. Click **Create new project** and wait ~2 minutes for provisioning

---

## Step 2: Get API Credentials

1. In your Supabase dashboard, go to **Project Settings** → **API**
2. Copy these two values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public key** (starts with `eyJ...`)
3. Open the `.env` file in the project root and update:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key...
```

> The "anon" key is safe for client-side use. Never use the `service_role` key in the app.

---

## Step 3: Run Database Migrations

Open your Supabase project's **SQL Editor** and run each of the following scripts in order.

### 3.1 — Core Tables

```sql
-- Create profiles table (mirrors auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  email TEXT NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create groups table
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  currency TEXT DEFAULT 'USD',
  member_ids UUID[] DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create group_members join table
CREATE TABLE IF NOT EXISTS group_members (
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (group_id, user_id)
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  total_amount NUMERIC(12, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  category TEXT DEFAULT 'other',
  paid_by UUID NOT NULL REFERENCES profiles(id),
  split_type TEXT DEFAULT 'equal',
  splits JSONB DEFAULT '[]',
  receipt_image_url TEXT,
  ocr_items JSONB DEFAULT '[]',
  locked BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create expense_splits table
CREATE TABLE IF NOT EXISTS expense_splits (
  expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  PRIMARY KEY (expense_id, user_id)
);

-- Create settlements table
CREATE TABLE IF NOT EXISTS settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  from_user UUID NOT NULL REFERENCES profiles(id),
  to_user UUID NOT NULL REFERENCES profiles(id),
  amount NUMERIC(12, 2) NOT NULL,
  settled_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.2 — Auto-Create Profile Trigger

This trigger creates a `profiles` row automatically when a user signs up:

```sql
-- Function to handle new user sign-ups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, email, photo_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.email, ''),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Trigger the function every time a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## Step 4: Set Up Row Level Security (RLS)

Run these SQL commands in the SQL Editor to enable and configure RLS:

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read any profile, update only their own
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Groups: members can read groups they belong to
CREATE POLICY "Members can view their groups"
  ON groups FOR SELECT
  TO authenticated
  USING (
    auth.uid() = ANY (member_ids)
    OR auth.uid() = created_by
  );

CREATE POLICY "Members can create groups"
  ON groups FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creator can update group"
  ON groups FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Creator can delete group"
  ON groups FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Group members: users can read their memberships, insert if invited
CREATE POLICY "Members can view group members"
  ON group_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_members.group_id
        AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join groups"
  ON group_members FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Expenses: members of a group can read/write expenses
CREATE POLICY "Members can read group expenses"
  ON expenses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = expenses.group_id
        AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can create expenses"
  ON expenses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = expenses.group_id
        AND gm.user_id = auth.uid()
    )
  );

-- Expense splits: members can read, only the payer can update
CREATE POLICY "Members can read expense splits"
  ON expense_splits FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM expenses e
      JOIN group_members gm ON gm.group_id = e.group_id
      WHERE e.id = expense_splits.expense_id
        AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can create expense splits"
  ON expense_splits FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM expenses e
      JOIN group_members gm ON gm.group_id = e.group_id
      WHERE e.id = expense_splits.expense_id
        AND gm.user_id = auth.uid()
    )
  );

-- Settlements: members can read, participants can create
CREATE POLICY "Members can read settlements"
  ON settlements FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = settlements.group_id
        AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Participants can create settlements"
  ON settlements FOR INSERT
  TO authenticated
  WITH CHECK (
    from_user = auth.uid()
    OR to_user = auth.uid()
  );
```

---

## Step 5: Configure Google OAuth

### 5.1 — Get Google OAuth Credentials

1. Go to https://console.cloud.google.com
2. Create a new project (or use an existing one)
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. For **Application type**, select **Web application**
6. Add these **Authorized redirect URIs**:
   - `https://<your-project>.supabase.co/auth/v1/callback` (replace `<your-project>` with your Supabase project ID)
   - `splitr://auth/callback`
   - `exp://127.0.0.1:8081/--/auth/callback` (for Expo dev)
7. Click **Create**
8. Copy the **Client ID** and **Client Secret**

### 5.2 — Enable Google Provider in Supabase

1. In your Supabase dashboard, go to **Authentication** → **Providers**
2. Click **Google**
3. Toggle **Enabled** to ON
4. Paste the **Client ID** and **Client Secret** from Google Cloud Console
5. Save

### 5.3 — Add Redirect URLs in Supabase Auth

1. Go to **Authentication** → **URL Configuration**
2. Under **Redirect URLs**, add:
   - `splitr://auth/callback`
   - `exp://127.0.0.1:8081/--/auth/callback`
3. Under **Site URL**, enter: `splitr://auth/callback`
4. Save

---

## Step 6: Configure App Deep Linking

The URL scheme `splitr://` is already configured in `app.json`:

```json
{
  "expo": {
    "scheme": "splitr"
  }
}
```

For production builds, ensure your app's custom URL scheme is also configured in the native project config (auto-generated by Expo).

---

## Step 7: Verify the Setup

1. **Restart Expo**: Press `Ctrl+C` in the terminal, then run `npx expo start --clear`
2. If Supabase env vars are set correctly (not placeholder values), the auth screen appears on launch
3. **Test email/password**: Create an account → check that a `profiles` row was auto-created in the Supabase Table Editor
4. **Test Google OAuth**: Tap "Continue with Google" → authenticate → verify you're redirected back to the dashboard
5. **Test persistence**: Close and reopen the app — the session should be restored from SecureStore

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| App shows loading spinner forever | Auth state never resolves because Supabase isn't configured | Set real env vars in `.env`, or leave placeholder values for mock mode |
| "Supabase not configured" error | Env vars are placeholders or missing | Update `.env` with real Supabase URL and anon key |
| Google sign-in does nothing | OAuth redirect URL not configured | Add `splitr://auth/callback` to both Google Cloud and Supabase Auth settings |
| "Invalid login credentials" | Wrong email/password or user doesn't exist | Check Supabase Auth Users table — user must be confirmed |
| Sign-up succeeds but profile is empty | Auto-create trigger not set up | Run the trigger SQL from Step 3.2 |
| RLS policy error on queries | RLS not configured or wrong policy | Run all RLS policies from Step 4 |

---

## Resetting to Mock Mode

To go back to offline/mock mode (no Supabase required), either:
- Leave placeholder values in `.env` (the current `isValidSupabaseConfig` check rejects them)
- Or remove the environment variables entirely
