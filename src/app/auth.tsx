import { useState, useCallback } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LogIn, Mail, UserPlus } from 'lucide-react-native';
import { Button } from '@/components/ui';
import { signIn, signInWithGoogle, signUp } from '@/services';

type AuthMode = 'signin' | 'signup';

export default function AuthScreen() {
  const insets = useSafeAreaInsets();

  const [mode, setMode] = useState<AuthMode>('signin');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSignIn = mode === 'signin';

  const handleSubmit = useCallback(async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    if (!trimmedEmail || !trimmedPassword) return;
    if (!isSignIn && !displayName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      if (isSignIn) {
        await signIn(trimmedEmail, trimmedPassword);
      } else {
        await signUp(trimmedEmail, trimmedPassword, displayName.trim());
      }
      router.replace('/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }, [email, password, displayName, isSignIn]);

  const toggleMode = useCallback(() => {
    setMode(isSignIn ? 'signup' : 'signin');
    setError(null);
  }, [isSignIn]);

  return (
    <View className="flex-1 bg-surface-black">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{ paddingTop: insets.top + 60, paddingBottom: insets.bottom + 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="items-center mb-12">
            <View className="w-16 h-16 rounded-pill bg-brand-lime items-center justify-center mb-6">
              <Text className="font-display text-[28px] text-brand-lime-ink">S</Text>
            </View>
            <Text className="font-body text-[28px] leading-[34px] text-white text-center">
              Welcome to <Text className="font-display">Splitr</Text>
            </Text>
            <Text className="font-body text-[28px] leading-[34px] text-white text-center">
              Split <Text className="font-display">expenses</Text>
            </Text>
            <Text className="text-sm text-white/50 text-center mt-3 px-6">
              Scan receipts, split bills, and settle debts with friends
            </Text>
          </View>

          <View className="gap-4">
            {!isSignIn && (
              <View className="bg-[rgba(255,255,255,0.08)] border border-white/10 rounded-pill h-14 px-5 justify-center">
                <TextInput
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Full name"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  className="text-white text-[15px] font-medium"
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
            )}

            <View className="bg-[rgba(255,255,255,0.08)] border border-white/10 rounded-pill h-14 px-5 justify-center">
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email address"
                placeholderTextColor="rgba(255,255,255,0.4)"
                className="text-white text-[15px] font-medium"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View className="bg-[rgba(255,255,255,0.08)] border border-white/10 rounded-pill h-14 px-5 justify-center">
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="rgba(255,255,255,0.4)"
                className="text-white text-[15px] font-medium"
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            {error && (
              <Text className="text-danger text-sm font-medium text-center">{error}</Text>
            )}

            <Button
              variant="primary"
              label={loading ? 'Please wait...' : isSignIn ? 'Sign In' : 'Create Account'}
              onPress={handleSubmit}
              disabled={loading || !email.trim() || !password.trim() || (!isSignIn && !displayName.trim())}
            />

            <View className="flex-row items-center gap-3">
              <View className="flex-1 h-px bg-white/10" />
              <Text className="text-xs text-white/30 font-heading uppercase tracking-wide">or</Text>
              <View className="flex-1 h-px bg-white/10" />
            </View>

            <Pressable
              className="flex-row items-center justify-center gap-3 bg-white rounded-pill h-14 active:opacity-90"
              onPress={async () => {
                setLoading(true);
                setError(null);
                try {
                  await signInWithGoogle();
                  router.replace('/(tabs)');
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Google sign-in failed');
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Sign in with Google"
            >
              <Text className="font-heading text-[15px] text-ink">Continue with Google</Text>
            </Pressable>
          </View>

          <View className="flex-row items-center justify-center gap-1.5 mt-8">
            <Text className="text-sm text-white/40">
              {isSignIn ? "Don't have an account?" : 'Already have an account?'}
            </Text>
            <Pressable onPress={toggleMode} accessibilityRole="button">
              <Text className="font-heading text-[14px] text-brand-lime">
                {isSignIn ? 'Sign Up' : 'Sign In'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
