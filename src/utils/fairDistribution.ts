import {
  DayOfWeek,
  DAYS_OF_WEEK,
  FamilyMember,
  PresenceRecord,
  MemberDailyCapacity,
  ChoreDefinition,
  ChoreAssignment,
  MealAttendanceRecord,
} from '../types/notion.ts';

/**
 * Calculates current week Monday to Sunday date strings (YYYY-MM-DD)
 */
export function getCurrentWeekDates(baseDate: Date = new Date()): { day: DayOfWeek; dateStr: string }[] {
  const current = new Date(baseDate);
  const day = current.getDay(); // 0 is Sunday, 1 is Monday
  const distanceToMonday = (day + 6) % 7;
  const monday = new Date(current);
  monday.setDate(current.getDate() - distanceToMonday);

  return DAYS_OF_WEEK.map((dayName, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    const dateStr = d.toISOString().split('T')[0];
    return { day: dayName, dateStr };
  });
}

/**
 * Calculates eaters count per day for Lunch and Dinner
 */
export function calculateDailyMealCounts(
  attendances: MealAttendanceRecord[],
  dayOfWeek: DayOfWeek
): { lunchCount: number; dinnerCount: number; lunchEaters: string[]; dinnerEaters: string[] } {
  const dayRecords = attendances.filter((a) => a.dayOfWeek === dayOfWeek);
  const lunchEaters = dayRecords.filter((a) => a.wantsLunch).map((a) => a.memberId);
  const dinnerEaters = dayRecords.filter((a) => a.wantsDinner).map((a) => a.memberId);

  return {
    lunchCount: lunchEaters.length,
    dinnerCount: dinnerEaters.length,
    lunchEaters,
    dinnerEaters,
  };
}

/**
 * Fair Chore Distribution Algorithm:
 * - NO points or age logic!
 * - Only assigns to members who are home on that day (isHome !== 'nincs_otthon').
 * - Respects time capacity: prioritizes members with positive available time.
 * - Balances total allocated workload (minutes) across the week.
 * - Rotates tasks so uncomfortable/frequent tasks aren't assigned to the same person consecutively.
 */
export function distributeChoresFairly(params: {
  choreDefs: ChoreDefinition[];
  members: FamilyMember[];
  presence: PresenceRecord[];
  capacities: MemberDailyCapacity[];
  weekDates: { day: DayOfWeek; dateStr: string }[];
  existingAssignments?: ChoreAssignment[];
}): ChoreAssignment[] {
  const { choreDefs, members, presence, capacities, weekDates } = params;
  const activeMembers = members.filter((m) => m.active);
  if (activeMembers.length === 0 || choreDefs.length === 0) return [];

  // Track assigned minutes per member over the entire week
  const memberTotalMinutes: Record<string, number> = {};
  activeMembers.forEach((m) => {
    memberTotalMinutes[m.id] = 0;
  });

  const newAssignments: ChoreAssignment[] = [];

  // Separate chores into daily and weekly/others
  const dailyChores = choreDefs.filter((c) => c.isActive && c.frequency === 'napi');
  const weeklyChores = choreDefs.filter((c) => c.isActive && c.frequency === 'heti');

  // Helper: check if a member is home on a given day
  const isMemberHome = (memberId: string, day: DayOfWeek): boolean => {
    const rec = presence.find((p) => p.memberId === memberId && p.dayOfWeek === day);
    if (!rec) return true; // default assume home if not specified
    return rec.isHome !== 'nincs_otthon';
  };

  // Helper: get member capacity on a given day
  const getCapacity = (memberId: string, day: DayOfWeek): number => {
    const cap = capacities.find((c) => c.memberId === memberId && c.dayOfWeek === day);
    return cap !== undefined ? cap.availableMinutes : 30; // default 30 min if unspecified
  };

  // 1. Distribute Daily Chores for each day (Monday - Sunday)
  weekDates.forEach(({ day, dateStr }) => {
    dailyChores.forEach((chore, choreIdx) => {
      // Find candidate members who are home on this day
      const homeMembers = activeMembers.filter((m) => isMemberHome(m.id, day));
      const candidates = homeMembers.length > 0 ? homeMembers : activeMembers;

      // Score candidates: prioritize those with higher daily capacity and lower total assigned minutes
      candidates.sort((a, b) => {
        const capA = getCapacity(a.id, day);
        const capB = getCapacity(b.id, day);

        // If one has 0 capacity, deprioritize them heavily
        if (capA === 0 && capB > 0) return 1;
        if (capB === 0 && capA > 0) return -1;

        const totalA = memberTotalMinutes[a.id] || 0;
        const totalB = memberTotalMinutes[b.id] || 0;

        if (totalA !== totalB) {
          return totalA - totalB; // Pick person with fewer assigned minutes
        }

        // Secondary tie-breaker: deterministic hash based on chore and day for rotation
        const hashA = (choreIdx * 7 + a.id.charCodeAt(a.id.length - 1)) % 13;
        const hashB = (choreIdx * 7 + b.id.charCodeAt(b.id.length - 1)) % 13;
        return hashA - hashB;
      });

      const selected = candidates[0];
      const duration = chore.estimatedMinutes || 15;
      memberTotalMinutes[selected.id] += duration;

      newAssignments.push({
        id: `asgn-daily-${chore.id}-${dateStr}`,
        choreId: chore.id,
        choreTitle: chore.title,
        roomArea: chore.roomArea,
        memberId: selected.id,
        date: dateStr,
        dayOfWeek: day,
        deadline: chore.title.includes('1') || chore.title.includes('Szellőztetés') ? '10:00' : '20:00',
        estimatedMinutes: duration,
        completed: false,
        note: `Napi feladat • ${day}`,
      });
    });
  });

  // 2. Distribute Weekly Chores across the week days (e.g. Wednesday to Saturday/Sunday)
  // Spread weekly chores across the week so days don't get overwhelmed
  weeklyChores.forEach((chore, idx) => {
    // Pick an appropriate day for this weekly chore (e.g. weekend for deep clean, mid-week for laundry)
    const targetDayIndex = (idx * 2 + 2) % 7; // Spread: 2=Szerda, 4=Péntek, 6=Vasárnap, etc.
    const target = weekDates[targetDayIndex];

    const homeMembers = activeMembers.filter((m) => isMemberHome(m.id, target.day));
    const candidates = homeMembers.length > 0 ? homeMembers : activeMembers;

    candidates.sort((a, b) => {
      const capA = getCapacity(a.id, target.day);
      const capB = getCapacity(b.id, target.day);
      if (capA === 0 && capB > 0) return 1;
      if (capB === 0 && capA > 0) return -1;

      return (memberTotalMinutes[a.id] || 0) - (memberTotalMinutes[b.id] || 0);
    });

    const selected = candidates[0];
    const duration = chore.estimatedMinutes || 25;
    memberTotalMinutes[selected.id] += duration;

    newAssignments.push({
      id: `asgn-weekly-${chore.id}-${target.dateStr}`,
      choreId: chore.id,
      choreTitle: chore.title,
      roomArea: chore.roomArea,
      memberId: selected.id,
      date: target.dateStr,
      dayOfWeek: target.day,
      deadline: '18:00',
      estimatedMinutes: duration,
      completed: false,
      note: `Heti feladat • ${target.day}`,
    });
  });

  return newAssignments;
}
