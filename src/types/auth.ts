export type AuthProvider = 'email' | 'google';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  avatarEmoji?: string;
  provider: AuthProvider;
  linkedMemberId: string | null; // e.g. 'mem-csabi', 'mem-anyu', etc.
  createdAt: string;
  lastLoginAt: string;
}

export interface AuthCredentials {
  email: string;
  password?: string;
  name?: string;
}

/**
 * Returns true if the user is Csabi (the system admin).
 * Csabi can be identified by linkedMemberId === 'mem-csabi'
 * or having 'csabi' in their email or name.
 */
export function isCsabiUser(user: AuthUser | null | undefined): boolean {
  if (!user) return false;
  if (user.linkedMemberId === 'mem-csabi') return true;
  const emailLower = user.email.toLowerCase();
  const nameLower = user.name.toLowerCase();
  return emailLower.includes('csabi') || nameLower.includes('csabi');
}

