import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isCsabiUser, AuthUser } from '../types/auth.ts';
import { ChoreDefinition, FamilyMember, PresenceRecord, MemberDailyCapacity } from '../types/notion.ts';
import { distributeChoresFairly, getCurrentWeekDates } from './fairDistribution.ts';

test('isCsabiUser accurately checks for Csabi admin role', () => {
  const csabiUser: AuthUser = {
    id: 'user-1',
    name: 'Csabi',
    email: 'csabi@csalad.hu',
    provider: 'google',
    linkedMemberId: 'mem-csabi',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  const anyuUser: AuthUser = {
    id: 'user-2',
    name: 'Anyu',
    email: 'anyu@csalad.hu',
    provider: 'email',
    linkedMemberId: 'mem-anyu',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  const unlinkedUser: AuthUser = {
    id: 'user-3',
    name: 'Vendég',
    email: 'vendeg@gmail.com',
    provider: 'google',
    linkedMemberId: null,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  assert.equal(isCsabiUser(csabiUser), true, 'Csabi user should have admin rights');
  assert.equal(isCsabiUser(anyuUser), false, 'Anyu should not have admin rights');
  assert.equal(isCsabiUser(unlinkedUser), false, 'Unlinked guest should not have admin rights');
  assert.equal(isCsabiUser(null), false, 'Null user should not have admin rights');
});

test('distributeChoresFairly incorporates customized chore definitions', () => {
  const customChores: ChoreDefinition[] = [
    {
      id: 'custom-daily-1',
      title: 'Egyedi reggeli konyhapult fertőtlenítés',
      roomArea: 'Konyha',
      frequency: 'napi',
      estimatedMinutes: 10,
      isActive: true,
      isRecurring: true,
    },
    {
      id: 'custom-weekly-1',
      title: 'Autó belső takarítás',
      roomArea: 'Kültér',
      frequency: 'heti',
      estimatedMinutes: 45,
      isActive: true,
      isRecurring: true,
    },
    {
      id: 'inactive-chore',
      title: 'Kikapcsolt feladat',
      roomArea: 'Közös terek',
      frequency: 'heti',
      estimatedMinutes: 30,
      isActive: false,
      isRecurring: true,
    },
  ];

  const members: FamilyMember[] = [
    { id: 'mem-csabi', name: 'Csabi', active: true, canCook: false },
    { id: 'mem-anyu', name: 'Anyu', active: true, canCook: true },
  ];

  const weekDates = getCurrentWeekDates();
  const presence: PresenceRecord[] = [];
  const capacities: MemberDailyCapacity[] = [];

  weekDates.forEach(({ day, dateStr }) => {
    members.forEach((m) => {
      presence.push({
        id: `p-${m.id}-${day}`,
        date: dateStr,
        dayOfWeek: day,
        memberId: m.id,
        isHome: 'otthon',
        sleepsHome: true,
      });
      capacities.push({
        memberId: m.id,
        dayOfWeek: day,
        availableMinutes: 60,
      });
    });
  });

  const assignments = distributeChoresFairly({
    choreDefs: customChores,
    members,
    presence,
    capacities,
    weekDates,
  });

  // Verify that the custom daily chore was assigned for every day (7 days)
  const dailyAssigned = assignments.filter((a) => a.choreTitle === 'Egyedi reggeli konyhapult fertőtlenítés');
  assert.equal(dailyAssigned.length, 7, 'Custom daily chore should be assigned across 7 days');

  // Verify that the weekly custom chore was assigned
  const weeklyAssigned = assignments.filter((a) => a.choreTitle === 'Autó belső takarítás');
  assert.equal(weeklyAssigned.length, 1, 'Custom weekly chore should be assigned once');

  // Verify that inactive chore was NOT assigned
  const inactiveAssigned = assignments.filter((a) => a.choreTitle === 'Kikapcsolt feladat');
  assert.equal(inactiveAssigned.length, 0, 'Inactive chore must not be assigned');
});

