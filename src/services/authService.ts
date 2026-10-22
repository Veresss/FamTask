import { AuthUser, AuthProvider, isCsabiUser } from '../types/auth.ts';

const STORAGE_KEY_CURRENT_USER = 'famtask_auth_user_v2';
const STORAGE_KEY_USERS = 'famtask_auth_users_v2';
const STORAGE_KEY_PASSWORDS = 'famtask_auth_passwords_v2';

// Pre-seeded family accounts for immediate testing
const INITIAL_USERS: AuthUser[] = [
  {
    id: 'user-csabi',
    email: 'csabi@csalad.hu',
    name: 'Csabi',
    avatarEmoji: '🧑',
    provider: 'google',
    linkedMemberId: 'mem-csabi',
    createdAt: '2026-01-10T10:00:00.000Z',
    lastLoginAt: '2026-10-22T08:00:00.000Z',
  },
  {
    id: 'user-anyu',
    email: 'anyu@csalad.hu',
    name: 'Anyu',
    avatarEmoji: '👩',
    provider: 'email',
    linkedMemberId: 'mem-anyu',
    createdAt: '2026-01-10T10:05:00.000Z',
    lastLoginAt: '2026-10-21T18:30:00.000Z',
  },
  {
    id: 'user-apu',
    email: 'apu@csalad.hu',
    name: 'Apu',
    avatarEmoji: '👨',
    provider: 'email',
    linkedMemberId: 'mem-apu',
    createdAt: '2026-01-10T10:10:00.000Z',
    lastLoginAt: '2026-10-20T19:00:00.000Z',
  },
  {
    id: 'user-botond',
    email: 'botond@csalad.hu',
    name: 'Botond',
    avatarEmoji: '👦',
    provider: 'google',
    linkedMemberId: 'mem-botond',
    createdAt: '2026-01-11T12:00:00.000Z',
    lastLoginAt: '2026-10-21T14:15:00.000Z',
  },
  {
    id: 'user-marica',
    email: 'marica@csalad.hu',
    name: 'Marica',
    avatarEmoji: '👧',
    provider: 'email',
    linkedMemberId: 'mem-marica',
    createdAt: '2026-01-12T09:00:00.000Z',
    lastLoginAt: '2026-10-22T07:45:00.000Z',
  },
  {
    id: 'user-attila',
    email: 'attila@csalad.hu',
    name: 'Attila',
    avatarEmoji: '🧔',
    provider: 'email',
    linkedMemberId: 'mem-attila',
    createdAt: '2026-01-15T16:00:00.000Z',
    lastLoginAt: '2026-10-18T20:00:00.000Z',
  },
  {
    id: 'user-akos',
    email: 'akos@csalad.hu',
    name: 'Ákos',
    avatarEmoji: '🧒',
    provider: 'email',
    linkedMemberId: 'mem-akos',
    createdAt: '2026-01-16T11:00:00.000Z',
    lastLoginAt: '2026-10-22T06:30:00.000Z',
  },
];

class AuthService {
  private getStoredUsers(): AuthUser[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USERS);
      if (saved) return JSON.parse(saved);
      // Initialize with pre-seeded users
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  }

  private saveUsers(users: AuthUser[]) {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  }

  private getStoredPasswords(): Record<string, string> {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PASSWORDS);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }

  private savePassword(email: string, pass: string) {
    const passwords = this.getStoredPasswords();
    passwords[email.toLowerCase()] = pass;
    localStorage.setItem(STORAGE_KEY_PASSWORDS, JSON.stringify(passwords));
  }

  public getCurrentUser(): AuthUser | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
      if (saved) {
        return JSON.parse(saved);
      }
      return null;
    } catch {
      return null;
    }
  }

  public setCurrentUser(user: AuthUser | null): void {
    if (user) {
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    }
  }

  public getRegisteredUsers(): AuthUser[] {
    return this.getStoredUsers();
  }

  public registerWithEmail(
    email: string,
    password: string,
    name: string
  ): { success: boolean; user?: AuthUser; error?: string } {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      return { success: false, error: 'Kérlek adj meg egy érvényes email címet!' };
    }
    if (!password || password.length < 4) {
      return { success: false, error: 'A jelszónak legalább 4 karakter hosszúnak kell lennie!' };
    }
    if (!trimmedName) {
      return { success: false, error: 'Kérlek add meg a nevedet!' };
    }

    const users = this.getStoredUsers();
    if (users.some((u) => u.email.toLowerCase() === trimmedEmail)) {
      return {
        success: false,
        error: 'Ezzel az email címmel már regisztráltak fiókot! Jelentkezz be.',
      };
    }

    // Determine initial avatar emoji based on name if matches
    let avatarEmoji = '👤';
    let defaultMemberId: string | null = null;
    const lowerName = trimmedName.toLowerCase();
    if (lowerName.includes('csabi')) {
      avatarEmoji = '🧑';
      defaultMemberId = 'mem-csabi';
    } else if (lowerName.includes('anyu')) {
      avatarEmoji = '👩';
      defaultMemberId = 'mem-anyu';
    } else if (lowerName.includes('apu')) {
      avatarEmoji = '👨';
      defaultMemberId = 'mem-apu';
    } else if (lowerName.includes('botond')) {
      avatarEmoji = '👦';
      defaultMemberId = 'mem-botond';
    } else if (lowerName.includes('marica')) {
      avatarEmoji = '👧';
      defaultMemberId = 'mem-marica';
    } else if (lowerName.includes('attila')) {
      avatarEmoji = '🧔';
      defaultMemberId = 'mem-attila';
    } else if (lowerName.includes('ákos') || lowerName.includes('akos')) {
      avatarEmoji = '🧒';
      defaultMemberId = 'mem-akos';
    }

    const newUser: AuthUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      email: trimmedEmail,
      name: trimmedName,
      avatarEmoji,
      provider: 'email',
      linkedMemberId: defaultMemberId, // will be confirmed or chosen by user
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    users.push(newUser);
    this.saveUsers(users);
    this.savePassword(trimmedEmail, password);
    this.setCurrentUser(newUser);

    return { success: true, user: newUser };
  }

  public loginWithEmail(
    email: string,
    password: string
  ): { success: boolean; user?: AuthUser; error?: string } {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      return { success: false, error: 'Add meg az email címedet!' };
    }

    const users = this.getStoredUsers();
    const existing = users.find((u) => u.email.toLowerCase() === trimmedEmail);

    if (!existing) {
      return {
        success: false,
        error: 'Nincs ilyen regisztrált email cím a rendszerben. Kérlek regisztrálj!',
      };
    }

    // Check password if stored, or allow preseeded users with any pass or matching pass
    const passwords = this.getStoredPasswords();
    if (passwords[trimmedEmail] && passwords[trimmedEmail] !== password) {
      return { success: false, error: 'Hibás jelszó! Kérlek próbáld újra.' };
    }

    const updatedUser: AuthUser = {
      ...existing,
      lastLoginAt: new Date().toISOString(),
    };

    const updatedList = users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
    this.saveUsers(updatedList);
    this.setCurrentUser(updatedUser);

    return { success: true, user: updatedUser };
  }

  public loginWithGoogle(options?: {
    email?: string;
    name?: string;
    avatarUrl?: string;
    memberId?: string;
  }): { success: boolean; user: AuthUser } {
    const googleEmail = options?.email?.trim().toLowerCase() || 'csabi.csalad@gmail.com';
    const googleName = options?.name?.trim() || (googleEmail.includes('csabi') ? 'Csabi' : 'Google Felhasználó');

    const users = this.getStoredUsers();
    let user = users.find((u) => u.email.toLowerCase() === googleEmail);

    if (user) {
      user = {
        ...user,
        provider: 'google',
        lastLoginAt: new Date().toISOString(),
        avatarUrl: options?.avatarUrl || user.avatarUrl,
      };
      if (options?.memberId) {
        user.linkedMemberId = options.memberId;
      }
      const updatedList = users.map((u) => (u.id === user!.id ? user! : u));
      this.saveUsers(updatedList);
    } else {
      // Auto-detect memberId if matching name or email
      let linkedMemberId: string | null = options?.memberId || null;
      let avatarEmoji = '🌐';
      if (googleEmail.includes('csabi') || googleName.toLowerCase().includes('csabi')) {
        linkedMemberId = 'mem-csabi';
        avatarEmoji = '🧑';
      } else if (googleEmail.includes('botond') || googleName.toLowerCase().includes('botond')) {
        linkedMemberId = 'mem-botond';
        avatarEmoji = '👦';
      } else if (googleEmail.includes('marica') || googleName.toLowerCase().includes('marica')) {
        linkedMemberId = 'mem-marica';
        avatarEmoji = '👧';
      } else if (googleEmail.includes('anyu') || googleName.toLowerCase().includes('anyu')) {
        linkedMemberId = 'mem-anyu';
        avatarEmoji = '👩';
      }

      user = {
        id: `user-g-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        email: googleEmail,
        name: googleName,
        avatarEmoji,
        avatarUrl: options?.avatarUrl,
        provider: 'google',
        linkedMemberId,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
      users.push(user);
      this.saveUsers(users);
    }

    this.setCurrentUser(user);
    return { success: true, user };
  }

  public linkUserToMember(userId: string, memberId: string): AuthUser | null {
    const users = this.getStoredUsers();
    const target = users.find((u) => u.id === userId);
    if (!target) return null;

    const updated: AuthUser = {
      ...target,
      linkedMemberId: memberId,
    };

    const updatedList = users.map((u) => (u.id === userId ? updated : u));
    this.saveUsers(updatedList);

    const current = this.getCurrentUser();
    if (current && current.id === userId) {
      this.setCurrentUser(updated);
    }

    return updated;
  }

  public updateUser(userId: string, updates: Partial<AuthUser>): AuthUser | null {
    const users = this.getStoredUsers();
    const target = users.find((u) => u.id === userId);
    if (!target) return null;

    const updated: AuthUser = {
      ...target,
      ...updates,
    };

    const updatedList = users.map((u) => (u.id === userId ? updated : u));
    this.saveUsers(updatedList);

    const current = this.getCurrentUser();
    if (current && current.id === userId) {
      this.setCurrentUser(updated);
    }

    return updated;
  }

  public deleteUser(userId: string): void {
    const users = this.getStoredUsers().filter((u) => u.id !== userId);
    this.saveUsers(users);
    const current = this.getCurrentUser();
    if (current && current.id === userId) {
      this.setCurrentUser(null);
    }
  }

  public logout(): void {
    this.setCurrentUser(null);
  }

  public isCsabi(user: AuthUser | null | undefined): boolean {
    return isCsabiUser(user);
  }
}

export const authService = new AuthService();

