import React, { useState, useEffect } from 'react';
import { FamilyMember, Chore, WeeklyEvaluation, InAppNotification } from './types/index.ts';
import { INITIAL_MEMBERS, INITIAL_CHORES, INITIAL_EVALUATIONS } from './data/initialData.ts';
import { getWeekId, isSunday, filterChores, generateDailyNotificationMessage } from './utils/rules.ts';
import { Header } from './components/Header.tsx';
import { FamilySummaryBanner } from './components/FamilySummaryBanner.tsx';
import { ChoreCard } from './components/ChoreCard.tsx';
import { ChoreModal } from './components/ChoreModal.tsx';
import { MemberManagementModal } from './components/MemberManagementModal.tsx';
import { SundayEvaluationModal } from './components/SundayEvaluationModal.tsx';
import { PushNotificationModal } from './components/PushNotificationModal.tsx';
import { InAppNotificationToast } from './components/InAppNotificationToast.tsx';
import { sendBrowserNotification, playChimeSound } from './services/notificationService.ts';
import {
  Users,
  Plus,
  Trophy,
  Bell,
  CheckCircle2,
  Calendar,
  Sparkles,
  Inbox,
  UserCheck,
} from 'lucide-react';

const STORAGE_KEY_MEMBERS = 'csalad_hazimunka_members_v1';
const STORAGE_KEY_CHORES = 'csalad_hazimunka_chores_v1';
const STORAGE_KEY_EVALUATIONS = 'csalad_hazimunka_evals_v1';
const STORAGE_KEY_NAME = 'csalad_hazimunka_name_v1';

export default function App() {
  // State with LocalStorage fallbacks
  const [familyName, setFamilyName] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_NAME) || 'Kovács Család';
  });

  const [members, setMembers] = useState<FamilyMember[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_MEMBERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_MEMBERS;
  });

  const [chores, setChores] = useState<Chore[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CHORES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_CHORES;
  });

  const [evaluations, setEvaluations] = useState<WeeklyEvaluation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_EVALUATIONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_EVALUATIONS;
  });

  const [inAppNotifications, setInAppNotifications] = useState<InAppNotification[]>([
    {
      id: 'init-notif-1',
      memberId: 'all',
      title: 'Üdvözöl a Családi Házimunka Kiosztó! 👋',
      message: 'Osszátok be a mai teendőket, pipáljátok ki ha készen vagytok, és vasárnap nézzétek meg az értékelést!',
      timestamp: 'Ma reggel',
      read: false,
      type: 'daily_reminder',
    },
  ]);

  // View perspectives & filters
  const [activeMemberId, setActiveMemberId] = useState<string | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSimulatedSunday, setIsSimulatedSunday] = useState<boolean>(false);

  // Modals state
  const [isChoreModalOpen, setIsChoreModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [isSundayModalOpen, setIsSundayModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_NAME, familyName);
  }, [familyName]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CHORES, JSON.stringify(chores));
  }, [chores]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_EVALUATIONS, JSON.stringify(evaluations));
  }, [evaluations]);

  const isTodaySunday = isSunday();

  // Handlers
  const handleToggleCompleteChore = (choreId: string) => {
    setChores((prevChores) => {
      return prevChores.map((chore) => {
        if (chore.id !== choreId) return chore;

        const nextCompleted = !chore.isCompleted;
        const completedAt = nextCompleted ? new Date().toISOString() : null;
        const completedByMemberId = nextCompleted
          ? activeMemberId !== 'all'
            ? activeMemberId
            : chore.assignedMemberId
          : null;

        // Recalculate points for member
        if (chore.assignedMemberId) {
          setMembers((prevMembers) =>
            prevMembers.map((m) => {
              if (m.id !== chore.assignedMemberId) return m;
              const pointDelta = nextCompleted ? chore.points : -chore.points;
              return {
                ...m,
                pointsTotal: Math.max(0, (m.pointsTotal || 0) + pointDelta),
              };
            })
          );
        }

        // Add in-app notification if marked complete
        if (nextCompleted) {
          const assignee = members.find((m) => m.id === chore.assignedMemberId);
          setInAppNotifications((prev) => [
            {
              id: `completed-${Date.now()}`,
              memberId: 'all',
              title: `✅ Feladat elvégezve: ${chore.title}`,
              message: `${assignee ? assignee.name : 'Valaki'} elvégezte a feladatot (+${chore.points} pont)!`,
              timestamp: new Date().toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' }),
              read: false,
              type: 'task_completed',
            },
            ...prev,
          ]);
        }

        return {
          ...chore,
          isCompleted: nextCompleted,
          completedAt,
          completedByMemberId,
        };
      });
    });
  };

  const handleAddChore = (
    choreData: Omit<Chore, 'id' | 'createdAt' | 'isCompleted' | 'completedAt' | 'completedByMemberId' | 'weekId'>
  ) => {
    const currentWeek = getWeekId(choreData.dueDate);
    const newChore: Chore = {
      ...choreData,
      id: `chore-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      isCompleted: false,
      completedAt: null,
      completedByMemberId: null,
      weekId: currentWeek,
    };

    setChores((prev) => [newChore, ...prev]);

    // Send push notification to assigned member about the new chore
    const assignee = members.find((m) => m.id === choreData.assignedMemberId);
    if (assignee) {
      sendBrowserNotification(`Új feladatod van: ${newChore.title}`, {
        body: `Kiosztva a(z) ${familyName} házimunka tábláján (+${newChore.points} pont).`,
      });

      setInAppNotifications((prev) => [
        {
          id: `new-chore-${Date.now()}`,
          memberId: assignee.id,
          title: `Új feladat kiosztva neked: ${newChore.title}`,
          message: `${newChore.description || 'Elvégzendő feladat'} (+${newChore.points} pont)`,
          timestamp: new Date().toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' }),
          read: false,
          type: 'daily_reminder',
        },
        ...prev,
      ]);
    }
  };

  const handleDeleteChore = (choreId: string) => {
    setChores((prev) => prev.filter((c) => c.id !== choreId));
  };

  const handleAddMember = (
    memberData: Omit<FamilyMember, 'id' | 'joinedDate' | 'pointsTotal'>
  ) => {
    const newMember: FamilyMember = {
      ...memberData,
      id: `mem-${Date.now()}`,
      joinedDate: new Date().toISOString().split('T')[0],
      pointsTotal: 0,
    };

    setMembers((prev) => [...prev, newMember]);

    setInAppNotifications((prev) => [
      {
        id: `welcome-${newMember.id}`,
        memberId: 'all',
        title: `👋 Új családtag csatlakozott!`,
        message: `${newMember.name} mostantól a család tagja. Üdvözlünk a házimunka csapatban!`,
        timestamp: new Date().toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' }),
        read: false,
        type: 'member_joined',
      },
      ...prev,
    ]);
  };

  const handleRemoveMember = (memberId: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    if (activeMemberId === memberId) {
      setActiveMemberId('all');
    }
  };

  const handleSaveEvaluation = (evaluation: WeeklyEvaluation) => {
    setEvaluations((prev) => {
      const existsIndex = prev.findIndex((e) => e.weekId === evaluation.weekId);
      if (existsIndex >= 0) {
        const copy = [...prev];
        copy[existsIndex] = evaluation;
        return copy;
      }
      return [evaluation, ...prev];
    });

    setInAppNotifications((prev) => [
      {
        id: `eval-notif-${Date.now()}`,
        memberId: 'all',
        title: `🏆 Vasárnapi értékelés elmentve: ${evaluation.title}`,
        message: `A család elérte a ${evaluation.overallRate}%-os eredményt! Hét hőse: ${evaluation.mvpMemberName}.`,
        timestamp: new Date().toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' }),
        read: false,
        type: 'weekly_summary',
      },
      ...prev,
    ]);
  };

  const handleAddInAppNotification = (notif: InAppNotification) => {
    setInAppNotifications((prev) => [notif, ...prev]);
  };

  const handleDismissNotification = (id: string) => {
    setInAppNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleClearAllNotifications = () => {
    setInAppNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleUpdateMemberNotificationTime = (
    memberId: string,
    time: string,
    enabled: boolean
  ) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === memberId
          ? { ...m, notificationTime: time, notificationsEnabled: enabled }
          : m
      )
    );
  };

  // Filtered chores for display
  const displayedChores = filterChores(chores, {
    memberId: activeMemberId,
    status: statusFilter,
    category: categoryFilter,
    searchQuery,
  });

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex flex-col font-sans">
      {/* Header */}
      <Header
        familyName={familyName}
        onChangeFamilyName={setFamilyName}
        members={members}
        activeMemberId={activeMemberId}
        onSelectActiveMember={setActiveMemberId}
        onOpenChoreModal={() => setIsChoreModalOpen(true)}
        onOpenMembersModal={() => setIsMembersModalOpen(true)}
        onOpenSundayModal={() => setIsSundayModalOpen(true)}
        onOpenNotificationsModal={() => setIsNotificationsModalOpen(true)}
        notifications={inAppNotifications}
        isSundayToday={isTodaySunday || isSimulatedSunday}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Family Member Quick Avatars Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setActiveMemberId('all')}
            className={`px-3 py-2 rounded-2xl border flex items-center gap-2 text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeMemberId === 'all'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Közös felület ({chores.length})</span>
          </button>

          {members.map((member) => {
            const memberChoresCount = chores.filter((c) => c.assignedMemberId === member.id).length;
            const isSelected = activeMemberId === member.id;

            return (
              <button
                key={member.id}
                onClick={() => setActiveMemberId(member.id)}
                className={`px-3 py-1.5 rounded-2xl border flex items-center gap-2.5 text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'ring-2 ring-indigo-500 bg-white border-transparent shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
                style={{
                  borderLeftColor: member.color,
                  borderLeftWidth: 4,
                }}
              >
                <span className="text-xl">{member.avatar}</span>
                <div className="text-left">
                  <p className="font-bold text-slate-900 leading-tight">{member.name}</p>
                  <p className="text-[11px] text-slate-500">
                    {memberChoresCount} feladat • {member.pointsTotal || 0}p
                  </p>
                </div>
              </button>
            );
          })}

          <button
            onClick={() => setIsMembersModalOpen(true)}
            className="px-3 py-2 rounded-2xl border border-dashed border-slate-300 hover:border-indigo-400 bg-white/50 text-slate-500 hover:text-indigo-600 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Új tag felvétele</span>
          </button>
        </div>

        {/* Family Summary & KPIs Banner */}
        <FamilySummaryBanner
          familyName={familyName}
          members={members}
          chores={chores}
          activeMemberId={activeMemberId}
          statusFilter={statusFilter}
          onChangeStatusFilter={setStatusFilter}
          categoryFilter={categoryFilter}
          onChangeCategoryFilter={setCategoryFilter}
          searchQuery={searchQuery}
          onChangeSearchQuery={setSearchQuery}
          onOpenSundayModal={() => setIsSundayModalOpen(true)}
          isSundayToday={isTodaySunday}
          onToggleSimulatedSunday={() => setIsSimulatedSunday(!isSimulatedSunday)}
          isSimulatedSunday={isSimulatedSunday}
        />

        {/* Chores Grid / List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {activeMemberId === 'all'
                ? 'Összes kiadott családi feladat'
                : `${members.find((m) => m.id === activeMemberId)?.name} feladatai`}
              <span className="text-xs font-normal text-slate-400">
                ({displayedChores.length} feladat)
              </span>
            </h2>

            <button
              onClick={() => setIsChoreModalOpen(true)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              Új feladat hozzáadása
            </button>
          </div>

          {displayedChores.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                <Inbox className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-700">
                Nincs megjeleníthető feladat ebben a nézetben
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Minden feladat készen van, vagy módosítsd a szűrőket. Adj hozzá új házimunkát a családtagokhoz!
              </p>
              <button
                onClick={() => setIsChoreModalOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                + Új feladat kiosztása
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3.5">
              {displayedChores.map((chore) => {
                const assignedMember = members.find((m) => m.id === chore.assignedMemberId);
                const currentActiveMember =
                  activeMemberId !== 'all'
                    ? members.find((m) => m.id === activeMemberId)
                    : undefined;

                return (
                  <ChoreCard
                    key={chore.id}
                    chore={chore}
                    assignedMember={assignedMember}
                    currentActiveMember={currentActiveMember}
                    onToggleComplete={handleToggleCompleteChore}
                    onDeleteChore={handleDeleteChore}
                  />
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-4 px-4 text-center text-xs text-slate-500">
        <p>
          {familyName} • Családi Házimunka Kiosztó Rendszer • Heti vasárnapi kiértékelés & Napi push értesítések
        </p>
      </footer>

      {/* Floating In-App Push Notification Toasts */}
      <InAppNotificationToast
        notifications={inAppNotifications}
        onDismiss={handleDismissNotification}
        onClearAll={handleClearAllNotifications}
      />

      {/* Modals */}
      <ChoreModal
        isOpen={isChoreModalOpen}
        onClose={() => setIsChoreModalOpen(false)}
        members={members}
        onAddChore={handleAddChore}
        initialMemberId={activeMemberId !== 'all' ? activeMemberId : undefined}
      />

      <MemberManagementModal
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        members={members}
        onAddMember={handleAddMember}
        onRemoveMember={handleRemoveMember}
      />

      <SundayEvaluationModal
        isOpen={isSundayModalOpen}
        onClose={() => setIsSundayModalOpen(false)}
        members={members}
        chores={chores}
        evaluations={evaluations}
        onSaveEvaluation={handleSaveEvaluation}
      />

      <PushNotificationModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
        members={members}
        chores={chores}
        onAddInAppNotification={handleAddInAppNotification}
        onUpdateMemberNotificationTime={handleUpdateMemberNotificationTime}
      />
    </div>
  );
}
