import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getWeekId,
  isSunday,
  getPerformanceBadgeAndNote,
  calculateWeeklyEvaluation,
  generateDailyNotificationMessage,
  filterChores,
} from './rules.ts';
import { FamilyMember, Chore } from '../types/index.ts';

test('isSunday correctly identifies Sunday vs weekdays', () => {
  // 2026-10-18 was a Sunday, 2026-10-19 was a Monday
  const sunday = new Date('2026-10-18T10:00:00Z');
  const monday = new Date('2026-10-19T10:00:00Z');

  assert.equal(isSunday(sunday), true);
  assert.equal(isSunday(monday), false);
});

test('getPerformanceBadgeAndNote gives accurate badges and notes', () => {
  const perfect = getPerformanceBadgeAndNote(5, 5, 'Emma');
  assert.equal(perfect.badge, 'Hét Hőse 🏆');
  assert.match(perfect.note, /100%/);

  const great = getPerformanceBadgeAndNote(4, 5, 'Dániel');
  assert.equal(great.badge, 'Megbízható Bajnok ⭐');
  assert.match(great.note, /80%/);

  const moderate = getPerformanceBadgeAndNote(3, 5, 'Péter');
  assert.equal(moderate.badge, 'Szorgos Segítő 🌟');

  const needsWork = getPerformanceBadgeAndNote(1, 5, 'Katalin');
  assert.equal(needsWork.badge, 'Újrapróbálkozó 💪');
});

test('calculateWeeklyEvaluation calculates accurate family rates and MVP', () => {
  const mockMembers: FamilyMember[] = [
    {
      id: 'm1',
      name: 'Anya',
      role: 'Szülő',
      avatar: '👩',
      color: '#6366f1',
      joinedDate: '2026-01-01',
      pointsTotal: 100,
      notificationsEnabled: true,
      notificationTime: '08:00',
    },
    {
      id: 'm2',
      name: 'Peti',
      role: 'Gyerek',
      avatar: '👦',
      color: '#f59e0b',
      joinedDate: '2026-01-01',
      pointsTotal: 150,
      notificationsEnabled: true,
      notificationTime: '08:00',
    },
  ];

  const mockChores: Chore[] = [
    {
      id: 'c1',
      title: 'Mosogatás',
      assignedMemberId: 'm1',
      category: 'konyha',
      frequency: 'napi',
      points: 20,
      isCompleted: true,
      completedAt: '2026-10-18T12:00:00Z',
      completedByMemberId: 'm1',
      dueDate: '2026-10-18',
      createdAt: '2026-10-12',
      weekId: '2026-W42',
    },
    {
      id: 'c2',
      title: 'Porszívózás',
      assignedMemberId: 'm1',
      category: 'takaritas',
      frequency: 'heti',
      points: 30,
      isCompleted: false,
      completedAt: null,
      completedByMemberId: null,
      dueDate: '2026-10-18',
      createdAt: '2026-10-12',
      weekId: '2026-W42',
    },
    {
      id: 'c3',
      title: 'Szobarendrakás',
      assignedMemberId: 'm2',
      category: 'rendrakas',
      frequency: 'heti',
      points: 25,
      isCompleted: true,
      completedAt: '2026-10-18T14:00:00Z',
      completedByMemberId: 'm2',
      dueDate: '2026-10-18',
      createdAt: '2026-10-12',
      weekId: '2026-W42',
    },
    {
      id: 'c4',
      title: 'Kutyasétáltatás',
      assignedMemberId: 'm2',
      category: 'haziallat',
      frequency: 'napi',
      points: 25,
      isCompleted: true,
      completedAt: '2026-10-18T18:00:00Z',
      completedByMemberId: 'm2',
      dueDate: '2026-10-18',
      createdAt: '2026-10-12',
      weekId: '2026-W42',
    },
  ];

  const evalResult = calculateWeeklyEvaluation('2026-W42', mockMembers, mockChores, '2026-10-18');

  assert.equal(evalResult.totalAssigned, 4);
  assert.equal(evalResult.totalCompleted, 3);
  assert.equal(evalResult.overallRate, 75);
  // Peti completed 2 chores, Anya completed 1 -> Peti is MVP
  assert.equal(evalResult.mvpMemberId, 'm2');
  assert.equal(evalResult.mvpMemberName, 'Peti');

  const petiStat = evalResult.memberStats.find((s) => s.memberId === 'm2');
  assert.ok(petiStat);
  assert.equal(petiStat.completedCount, 2);
  assert.equal(petiStat.assignedCount, 2);
  assert.equal(petiStat.completionRate, 100);
  assert.equal(petiStat.pointsEarned, 50);
});

test('generateDailyNotificationMessage formats customized text', () => {
  const member: FamilyMember = {
    id: 'm1',
    name: 'Emma',
    role: 'Gyerek',
    avatar: '👧',
    color: '#ec4899',
    joinedDate: '2026-01-01',
    pointsTotal: 0,
    notificationsEnabled: true,
    notificationTime: '08:00',
  };

  const chores: Chore[] = [
    {
      id: 'c1',
      title: 'Viráglocsolás',
      assignedMemberId: 'm1',
      category: 'kert_kint',
      frequency: 'heti',
      points: 10,
      isCompleted: false,
      completedAt: null,
      completedByMemberId: null,
      dueDate: '2026-10-22',
      createdAt: '2026-10-22',
      weekId: '2026-W43',
    },
  ];

  const msg = generateDailyNotificationMessage(member, chores);
  assert.equal(msg.choreCount, 1);
  assert.match(msg.title, /Emma/);
  assert.match(msg.body, /Viráglocsolás/);
});

test('filterChores filters by member and completion status', () => {
  const chores: Chore[] = [
    {
      id: 'c1',
      title: 'T1',
      assignedMemberId: 'm1',
      category: 'konyha',
      frequency: 'napi',
      points: 10,
      isCompleted: true,
      completedAt: '2026-10-22',
      completedByMemberId: 'm1',
      dueDate: '2026-10-22',
      createdAt: '2026-10-22',
      weekId: '2026-W43',
    },
    {
      id: 'c2',
      title: 'T2',
      assignedMemberId: 'm2',
      category: 'furdo',
      frequency: 'napi',
      points: 10,
      isCompleted: false,
      completedAt: null,
      completedByMemberId: null,
      dueDate: '2026-10-22',
      createdAt: '2026-10-22',
      weekId: '2026-W43',
    },
  ];

  const pendingOnly = filterChores(chores, { status: 'pending' });
  assert.equal(pendingOnly.length, 1);
  assert.equal(pendingOnly[0].id, 'c2');

  const m1Only = filterChores(chores, { memberId: 'm1' });
  assert.equal(m1Only.length, 1);
  assert.equal(m1Only[0].id, 'c1');
});
