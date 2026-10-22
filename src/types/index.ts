export type MemberRole = 'Szülő' | 'Gyerek' | 'Egyéb';

export interface FamilyMember {
  id: string;
  name: string;
  role: MemberRole;
  avatar: string; // Emoji or avatar identifier
  color: string; // Hex or Tailwind color class identifier
  joinedDate: string;
  pointsTotal: number;
  notificationsEnabled: boolean;
  notificationTime: string; // e.g. "08:00"
}

export type ChoreCategory =
  | 'konyha'
  | 'rendrakas'
  | 'takaritas'
  | 'furdo'
  | 'kert_kint'
  | 'haziallat'
  | 'bevasarlas'
  | 'egyeb';

export type ChoreFrequency = 'egyszeri' | 'napi' | 'heti';

export interface Chore {
  id: string;
  title: string;
  description?: string;
  assignedMemberId: string;
  category: ChoreCategory;
  frequency: ChoreFrequency;
  points: number;
  isCompleted: boolean;
  completedAt: string | null;
  completedByMemberId: string | null;
  dueDate: string; // YYYY-MM-DD
  createdAt: string;
  weekId: string; // e.g. "2026-W42"
}

export interface MemberWeeklyStat {
  memberId: string;
  memberName: string;
  memberAvatar: string;
  assignedCount: number;
  completedCount: number;
  completionRate: number; // 0 - 100
  pointsEarned: number;
  badge: string;
  summaryNote: string;
}

export interface WeeklyEvaluation {
  id: string;
  weekId: string; // e.g. "2026-W42"
  title: string; // e.g. "2026. 42. heti vasárnapi értékelés"
  startDate: string;
  endDate: string; // Sunday date
  evaluatedAt: string;
  totalAssigned: number;
  totalCompleted: number;
  overallRate: number;
  mvpMemberId: string;
  mvpMemberName: string;
  memberStats: MemberWeeklyStat[];
  celebrationNote: string;
}

export interface InAppNotification {
  id: string;
  memberId: string | 'all';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'daily_reminder' | 'task_completed' | 'weekly_summary' | 'member_joined';
}
