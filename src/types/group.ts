export interface Group {
  groupId: string;
  name: string;
  members: string[];
  createdBy: string;
  createdAt: number;
  currency: string;
}

export interface GroupMember {
  uid: string;
  displayName: string;
  photoURL: string | null;
  email: string;
}
