import { Chore, FamilyMember, MemberWeeklyStat, WeeklyEvaluation } from '../types/index.ts';

/**
 * Returns ISO week format like "2026-W42"
 */
export function getWeekId(dateInput: Date | string = new Date()): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : new Date(dateInput.getTime());
  // ISO-8601 week number calculation
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

/**
 * Checks if a given date is Sunday (0 in JS getDay())
 */
export function isSunday(dateInput: Date | string = new Date()): boolean {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return d.getDay() === 0;
}

/**
 * Formats date as YYYY-MM-DD
 */
export function formatDateYMD(dateInput: Date | string = new Date()): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Assigns performance badge and friendly Hungarian praise based on completion rate
 */
export function getPerformanceBadgeAndNote(
  completed: number,
  assigned: number,
  memberName: string
): { badge: string; note: string } {
  if (assigned === 0) {
    return {
      badge: 'Pihenő Hét 🌴',
      note: `${memberName} ezen a héten pihent, nem kapott kiosztott feladatot.`,
    };
  }

  const rate = Math.round((completed / assigned) * 100);

  if (rate === 100) {
    return {
      badge: 'Hét Hőse 🏆',
      note: `Fantasztikus! ${memberName} az összes feladatát (100%) maradéktalanul elvégezte!`,
    };
  }
  if (rate >= 80) {
    return {
      badge: 'Megbízható Bajnok ⭐',
      note: `Kiváló munka! ${memberName} a feladatok ${rate}%-át elvégezte, óriási segítség a családnak.`,
    };
  }
  if (rate >= 50) {
    return {
      badge: 'Szorgos Segítő 🌟',
      note: `Jó teljesítmény! ${memberName} a feladatok felét (${rate}%) megcsinálta, jövő héten még jobb lesz!`,
    };
  }
  return {
    badge: 'Újrapróbálkozó 💪',
    note: `${memberName} még ${assigned - completed} feladatot hagyott hátra (${rate}%). Jövő héten közösen belehúzunk!`,
  };
}

/**
 * Evaluates chores for a week and produces Sunday evaluation record
 */
export function calculateWeeklyEvaluation(
  weekId: string,
  members: FamilyMember[],
  chores: Chore[],
  sundayDateStr: string = formatDateYMD()
): WeeklyEvaluation {
  // Filter chores for this week
  const weekChores = chores.filter((c) => c.weekId === weekId);

  let totalAssigned = 0;
  let totalCompleted = 0;

  const memberStats: MemberWeeklyStat[] = members.map((member) => {
    const memberChores = weekChores.filter((c) => c.assignedMemberId === member.id);
    const assignedCount = memberChores.length;
    const completedChores = memberChores.filter((c) => c.isCompleted);
    const completedCount = completedChores.length;
    const completionRate = assignedCount > 0 ? Math.round((completedCount / assignedCount) * 100) : 0;
    const pointsEarned = completedChores.reduce((sum, c) => sum + (c.points || 0), 0);
    const { badge, note } = getPerformanceBadgeAndNote(completedCount, assignedCount, member.name);

    totalAssigned += assignedCount;
    totalCompleted += completedCount;

    return {
      memberId: member.id,
      memberName: member.name,
      memberAvatar: member.avatar,
      assignedCount,
      completedCount,
      completionRate,
      pointsEarned,
      badge,
      summaryNote: note,
    };
  });

  const overallRate = totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0;

  // Determine MVP: Highest completed count, tie break by points
  let mvpMember = members[0];
  let maxCompleted = -1;
  let maxPoints = -1;

  for (const stat of memberStats) {
    if (stat.completedCount > maxCompleted || (stat.completedCount === maxCompleted && stat.pointsEarned > maxPoints)) {
      maxCompleted = stat.completedCount;
      maxPoints = stat.pointsEarned;
      const found = members.find((m) => m.id === stat.memberId);
      if (found) mvpMember = found;
    }
  }

  // Week number display
  const weekNumber = weekId.split('-W')[1] || 'Heti';

  let celebrationNote = '';
  if (overallRate >= 85) {
    celebrationNote = `🎉 Fantasztikus családi összefogás! A feladatok ${overallRate}%-a elkészült. A hét legszorgalmasabb tagja: ${mvpMember?.name || 'Mindenki'}!`;
  } else if (overallRate >= 60) {
    celebrationNote = `👏 Szép hét volt! A feladatok ${overallRate}%-át sikeresen elvégeztétek. Köszönjük a közös munkát!`;
  } else {
    celebrationNote = `💪 Ezen a héten a feladatok ${overallRate}%-a készült el. Vasárnap pihenjetek egy jót, és hétfőn újult erővel vágjunk bele!`;
  }

  return {
    id: `eval-${weekId}-${Date.now()}`,
    weekId,
    title: `${weekId.replace('-W', '. ')}. heti vasárnapi értékelés`,
    startDate: '', // optional representation
    endDate: sundayDateStr,
    evaluatedAt: new Date().toISOString(),
    totalAssigned,
    totalCompleted,
    overallRate,
    mvpMemberId: mvpMember ? mvpMember.id : '',
    mvpMemberName: mvpMember ? mvpMember.name : 'Mindenki',
    memberStats,
    celebrationNote,
  };
}

/**
 * Generates personalized daily push notification message for a member
 */
export function generateDailyNotificationMessage(
  member: FamilyMember,
  todayChores: Chore[]
): { title: string; body: string; choreCount: number } {
  const memberChores = todayChores.filter(
    (c) => c.assignedMemberId === member.id && !c.isCompleted
  );

  if (memberChores.length === 0) {
    return {
      title: `Jó reggelt, ${member.name}! ☀️`,
      body: 'Mára nincsenek elvégzendő házi feladataid. Élvezd a szabadidődet és pihenj!',
      choreCount: 0,
    };
  }

  const choreListNames = memberChores.slice(0, 3).map((c) => c.title).join(', ');
  const remainder = memberChores.length > 3 ? ` és még ${memberChores.length - 3} további` : '';

  return {
    title: `🔔 Napi feladatok: ${member.name}`,
    body: `Ma ${memberChores.length} feladat vár rád: ${choreListNames}${remainder}. Ne felejtsd el bejelölni ha készen vagy!`,
    choreCount: memberChores.length,
  };
}

/**
 * Filter chores for given criteria
 */
export function filterChores(
  chores: Chore[],
  options: {
    memberId?: string | 'all';
    status?: 'all' | 'pending' | 'completed';
    category?: string | 'all';
    searchQuery?: string;
  }
): Chore[] {
  return chores.filter((c) => {
    if (options.memberId && options.memberId !== 'all' && c.assignedMemberId !== options.memberId) {
      return false;
    }
    if (options.status === 'pending' && c.isCompleted) return false;
    if (options.status === 'completed' && !c.isCompleted) return false;
    if (options.category && options.category !== 'all' && c.category !== options.category) {
      return false;
    }
    if (options.searchQuery && options.searchQuery.trim().length > 0) {
      const q = options.searchQuery.toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchDesc = c.description?.toLowerCase().includes(q) ?? false;
      if (!matchTitle && !matchDesc) return false;
    }
    return true;
  });
}
