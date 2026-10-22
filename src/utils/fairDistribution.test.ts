import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getCurrentWeekDates,
  calculateDailyMealCounts,
  distributeChoresFairly,
} from './fairDistribution.ts';
import {
  FamilyMember,
  PresenceRecord,
  MemberDailyCapacity,
  ChoreDefinition,
  MealAttendanceRecord,
} from '../types/notion.ts';

test('getCurrentWeekDates returns 7 days from Hétfő to Vasárnap', () => {
  const dates = getCurrentWeekDates(new Date('2026-10-22')); // A Thursday
  assert.equal(dates.length, 7);
  assert.equal(dates[0].day, 'Hétfő');
  assert.equal(dates[6].day, 'Vasárnap');
});

test('calculateDailyMealCounts sums lunch and dinner eaters correctly', () => {
  const mockAttendances: MealAttendanceRecord[] = [
    { id: '1', date: '2026-10-19', dayOfWeek: 'Hétfő', memberId: 'm1', wantsLunch: true, wantsDinner: true },
    { id: '2', date: '2026-10-19', dayOfWeek: 'Hétfő', memberId: 'm2', wantsLunch: true, wantsDinner: false },
    { id: '3', date: '2026-10-19', dayOfWeek: 'Hétfő', memberId: 'm3', wantsLunch: false, wantsDinner: true },
    { id: '4', date: '2026-10-19', dayOfWeek: 'Hétfő', memberId: 'm4', wantsLunch: true, wantsDinner: true },
  ];

  const counts = calculateDailyMealCounts(mockAttendances, 'Hétfő');
  assert.equal(counts.lunchCount, 3);
  assert.equal(counts.dinnerCount, 3);
  assert.deepEqual(counts.lunchEaters, ['m1', 'm2', 'm4']);
  assert.deepEqual(counts.dinnerEaters, ['m1', 'm3', 'm4']);
});

test('distributeChoresFairly avoids members who are not home or have 0 capacity', () => {
  const mockMembers: FamilyMember[] = [
    { id: 'm1', name: 'Anyu', active: true, canCook: true },
    { id: 'm2', name: 'Apu', active: true, canCook: false },
    { id: 'm3', name: 'Attila', active: true, canCook: false },
  ];

  const weekDates = [{ day: 'Hétfő' as const, dateStr: '2026-10-19' }];

  // Attila is NOT home on Monday
  const mockPresence: PresenceRecord[] = [
    { id: 'p1', date: '2026-10-19', dayOfWeek: 'Hétfő', memberId: 'm1', isHome: 'otthon', sleepsHome: true },
    { id: 'p2', date: '2026-10-19', dayOfWeek: 'Hétfő', memberId: 'm2', isHome: 'otthon', sleepsHome: true },
    { id: 'p3', date: '2026-10-19', dayOfWeek: 'Hétfő', memberId: 'm3', isHome: 'nincs_otthon', sleepsHome: false },
  ];

  const mockCapacities: MemberDailyCapacity[] = [
    { memberId: 'm1', dayOfWeek: 'Hétfő', availableMinutes: 30 },
    { memberId: 'm2', dayOfWeek: 'Hétfő', availableMinutes: 30 },
    { memberId: 'm3', dayOfWeek: 'Hétfő', availableMinutes: 0 },
  ];

  const mockChores: ChoreDefinition[] = [
    { id: 'c1', title: 'Mosogatógép kipakolása 1', roomArea: 'Konyha', frequency: 'napi', estimatedMinutes: 15, isActive: true, isRecurring: true },
    { id: 'c2', title: 'Mosogatógép bepakolása 1', roomArea: 'Konyha', frequency: 'napi', estimatedMinutes: 15, isActive: true, isRecurring: true },
  ];

  const assignments = distributeChoresFairly({
    choreDefs: mockChores,
    members: mockMembers,
    presence: mockPresence,
    capacities: mockCapacities,
    weekDates,
  });

  assert.equal(assignments.length, 2);
  // Attila (m3) should NOT be assigned any task because he is not home!
  const assignedToAttila = assignments.filter((a) => a.memberId === 'm3');
  assert.equal(assignedToAttila.length, 0);

  // Anyu and Apu should each get one task (fair balance)
  const assignedToAnyu = assignments.filter((a) => a.memberId === 'm1');
  const assignedToApu = assignments.filter((a) => a.memberId === 'm2');
  assert.equal(assignedToAnyu.length, 1);
  assert.equal(assignedToApu.length, 1);
});
