import React, { useState } from 'react';
import {
  ChoreDefinition,
  ChoreAssignment,
  FamilyMember,
  DayOfWeek,
  DAYS_OF_WEEK,
  ChoreFrequency,
} from '../../types/notion.ts';
import { AuthUser, isCsabiUser } from '../../types/auth.ts';
import { authService } from '../../services/authService.ts';
import { ChoreDefModal } from './ChoreDefModal.tsx';
import { ChoreAssignmentModal } from './ChoreAssignmentModal.tsx';
import {
  ShieldAlert,
  ShieldCheck,
  Plus,
  Pencil,
  Trash2,
  Wand2,
  CheckCircle2,
  XCircle,
  Filter,
  Search,
  Sparkles,
  User,
  Users,
  ChefHat,
  RotateCcw,
  Clock,
  Layers,
  ArrowRight,
  LogOut,
  Sliders,
} from 'lucide-react';

interface AdminViewProps {
  currentUser: AuthUser | null;
  members: FamilyMember[];
  choreDefs: ChoreDefinition[];
  assignments: ChoreAssignment[];
  onAddChoreDef: (def: ChoreDefinition) => void;
  onUpdateChoreDef: (id: string, updates: Partial<ChoreDefinition>) => void;
  onDeleteChoreDef: (id: string) => void;
  onResetDefaultChoreDefs: () => void;
  onAddAssignment: (asgn: ChoreAssignment) => void;
  onUpdateAssignment: (id: string, updates: Partial<ChoreAssignment>) => void;
  onDeleteAssignment: (id: string) => void;
  onRunFairDistribution: () => void;
  onToggleCanCook: (memberId: string) => void;
  onToggleMemberActive: (memberId: string) => void;
  onUpdateMemberNote: (memberId: string, note: string) => void;
  onSwitchToCsabi: () => void;
  onNavigateHome: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  currentUser,
  members,
  choreDefs,
  assignments,
  onAddChoreDef,
  onUpdateChoreDef,
  onDeleteChoreDef,
  onResetDefaultChoreDefs,
  onAddAssignment,
  onUpdateAssignment,
  onDeleteAssignment,
  onRunFairDistribution,
  onToggleCanCook,
  onToggleMemberActive,
  onUpdateMemberNote,
  onSwitchToCsabi,
  onNavigateHome,
}) => {
  const isCsabi = isCsabiUser(currentUser);

  // Sub-tabs in Admin page
  const [activeTab, setActiveTab] = useState<'catalog' | 'assignments' | 'members' | 'users'>('catalog');

  // Filter & Search states for Catalog
  const [searchQuery, setSearchQuery] = useState('');
  const [frequencyFilter, setFrequencyFilter] = useState<string>('all');
  const [roomFilter, setRoomFilter] = useState<string>('all');

  // Filter states for Assignments
  const [assignmentDayFilter, setAssignmentDayFilter] = useState<string>('all');
  const [assignmentMemberFilter, setAssignmentMemberFilter] = useState<string>('all');

  // Modal states
  const [isChoreDefModalOpen, setIsChoreDefModalOpen] = useState(false);
  const [editingChoreDef, setEditingChoreDef] = useState<ChoreDefinition | null>(null);

  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<ChoreAssignment | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // -------------------------------------------------------------
  // GUARD: If not Csabi, show explicit 403 Forbidden screen
  // -------------------------------------------------------------
  if (!isCsabi) {
    const currentMemberName =
      members.find((m) => m.id === currentUser?.linkedMemberId)?.name ||
      currentUser?.name ||
      'Vendég';

    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center animate-in fade-in duration-200">
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-rose-200 shadow-xl space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 shadow-inner">
            <ShieldAlert className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300">
              403 • Hozzáférés Megtagadva
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 mt-2">
              Ez az oldal kizárólag Csabi számára érhető el!
            </h1>
            <p className="text-sm text-slate-600 max-w-lg mx-auto">
              A rendszer adminisztrációs felülete és a feladatok globális katalógusának kezelése zárolt jogkör, melyhez kizárólag <strong>Csabi</strong> férhet hozzá.
            </p>
          </div>

          {/* Current session info */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-md mx-auto text-xs text-slate-600 text-left space-y-1.5">
            <div className="font-semibold text-slate-700 flex items-center justify-between">
              <span>Jelenleg bejelentkezve:</span>
              <span className="font-bold text-slate-900">{currentUser?.name || 'Nincs bejelentkezve'}</span>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span>Email:</span>
              <span className="font-mono">{currentUser?.email || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span>Családi profil:</span>
              <span className="font-medium text-indigo-600">{currentMemberName}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onNavigateHome}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold cursor-pointer transition-colors"
            >
              Vissza a főoldalra
            </button>
            <button
              onClick={onSwitchToCsabi}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm hover:shadow cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Bejelentkezés Csabiként (Admin)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // ADMIN DASHBOARD (Csabi is authenticated)
  // -------------------------------------------------------------

  // Filter chore definitions
  const filteredDefs = choreDefs.filter((def) => {
    const matchesSearch =
      def.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (def.note && def.note.toLowerCase().includes(searchQuery.toLowerCase())) ||
      def.roomArea.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFreq = frequencyFilter === 'all' || def.frequency === frequencyFilter;
    const matchesRoom = roomFilter === 'all' || def.roomArea === roomFilter;

    return matchesSearch && matchesFreq && matchesRoom;
  });

  // Filter assignments
  const filteredAssignments = assignments.filter((asgn) => {
    const matchesDay = assignmentDayFilter === 'all' || asgn.dayOfWeek === assignmentDayFilter;
    const matchesMember = assignmentMemberFilter === 'all' || asgn.memberId === assignmentMemberFilter;
    return matchesDay && matchesMember;
  });

  const allRoomAreas = Array.from(new Set(choreDefs.map((c) => c.roomArea)));
  const registeredUsers = authService.getRegisteredUsers();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-7 space-y-6 text-slate-800 animate-in fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-slate-900 text-white rounded-2xl shadow-xl flex items-center gap-3 text-xs animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-purple-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-400/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-purple-400" />
                <span>Rendszergazda Felület</span>
              </span>
              <span className="text-xs text-indigo-200">Csabi hozzáférése</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight">
              ⚙️ FamTask Adminisztráció & Feladat-Kezelés
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl">
              Itt tudod teljesen testreszabni a feladatok katalógusát, új teendőket hozzáadni, meglévőket szerkeszteni vagy törölni, és kézivezérléssel kezelni a heti beosztást.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
            <button
              onClick={() => {
                onRunFairDistribution();
                showToast('Házimunkák igazságos beosztása sikeresen újraszámolva!');
              }}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition-all active:scale-95"
            >
              <Wand2 className="w-4 h-4" />
              <span>Beosztás Újraszámolása</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10 text-xs">
          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <div className="text-[11px] text-slate-400">Összes feladat (Katalógus)</div>
            <div className="text-xl font-bold font-mono text-purple-300">{choreDefs.length} db</div>
          </div>
          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <div className="text-[11px] text-slate-400">Aktív heti feladatok</div>
            <div className="text-xl font-bold font-mono text-emerald-300">
              {choreDefs.filter((c) => c.isActive && c.frequency === 'heti').length} db
            </div>
          </div>
          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <div className="text-[11px] text-slate-400">E heti kiosztott feladat</div>
            <div className="text-xl font-bold font-mono text-amber-300">{assignments.length} db</div>
          </div>
          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <div className="text-[11px] text-slate-400">Családtagok száma</div>
            <div className="text-xl font-bold font-mono text-white">{members.length} fő</div>
          </div>
        </div>
      </div>

        {/* Admin Navigation Tabs */}
      <div className="flex border-b border-[#e9e9e7] gap-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'catalog'
              ? 'border-purple-600 text-purple-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>🧹 Feladatkatalógus Testreszabása ({choreDefs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('assignments')}
          className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'assignments'
              ? 'border-purple-600 text-purple-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>📋 Heti Beosztások & Kiosztás ({assignments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'members'
              ? 'border-purple-600 text-purple-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>👨‍👩‍👧‍👦 Családi Jogosultságok ({members.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'users'
              ? 'border-purple-600 text-purple-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4" />
          <span>👥 Fiókok & Belépések ({registeredUsers.length})</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: Feladatkatalógus Testreszabása                     */}
      {/* ========================================================= */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          {/* Actions & Filters Bar */}
          <div className="p-4 rounded-2xl bg-white border border-[#e9e9e7] shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Keresés feladat, helyiség vagy megjegyzés szerint..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    setEditingChoreDef(null);
                    setIsChoreDefModalOpen(true);
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Új Feladat Hozzáadása</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm('Biztosan visszaállítod az alapértelmezett 32 családi feladatot?')) {
                      onResetDefaultChoreDefs();
                      showToast('Alapértelmezett feladatkatalógus visszaállítva!');
                    }
                  }}
                  className="px-3 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Alapértelmezett katalógus visszaállítása"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Alapértelmezések</span>
                </button>
              </div>
            </div>

            {/* Filter pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-400 text-[11px] font-semibold flex items-center gap-1">
                <Filter className="w-3 h-3" /> Gyakoriság:
              </span>
              {(['all', 'napi', 'heti', 'havi', '2-3 havi', 'szezonális'] as const).map((freq) => (
                <button
                  key={freq}
                  onClick={() => setFrequencyFilter(freq)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                    frequencyFilter === freq
                      ? 'bg-purple-600 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {freq === 'all' ? 'Mind' : freq}
                </button>
              ))}

              <span className="text-slate-400 text-[11px] font-semibold ml-2">Helyiség:</span>
              <select
                value={roomFilter}
                onChange={(e) => setRoomFilter(e.target.value)}
                className="px-2 py-1 text-xs border border-slate-300 rounded-lg bg-white font-medium focus:outline-none cursor-pointer"
              >
                <option value="all">Minden helyiség</option>
                {allRoomAreas.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Chore Definitions List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredDefs.map((def) => (
              <div
                key={def.id}
                className={`p-4 rounded-2xl border transition-all duration-150 bg-white hover:shadow-md space-y-2.5 relative ${
                  def.isActive ? 'border-slate-200' : 'border-slate-200 bg-slate-50/70 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm">{def.title}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          def.frequency === 'napi'
                            ? 'bg-amber-100 text-amber-800'
                            : def.frequency === 'heti'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {def.frequency}
                      </span>
                      {!def.isActive && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-rose-100 text-rose-700 font-bold">
                          Inaktív
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span>
                        Helyiség: <strong>{def.roomArea}</strong>
                      </span>
                      <span className="font-mono text-purple-700 font-semibold">
                        ⏱️ {def.estimatedMinutes} perc
                      </span>
                    </div>
                  </div>

                  {/* Actions for this chore */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() =>
                        onUpdateChoreDef(def.id, { isActive: !def.isActive })
                      }
                      title={def.isActive ? 'Inaktiválás' : 'Aktiválás'}
                      className={`p-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                        def.isActive
                          ? 'border-slate-200 text-emerald-600 hover:bg-emerald-50'
                          : 'border-slate-300 text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      {def.isActive ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => {
                        setEditingChoreDef(def);
                        setIsChoreDefModalOpen(true);
                      }}
                      title="Szerkesztés"
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Biztosan törlöd a "${def.title}" feladatot a katalógusból?`)) {
                          onDeleteChoreDef(def.id);
                          showToast(`"${def.title}" feladat törölve!`);
                        }
                      }}
                      title="Törlés"
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {def.note && (
                  <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg italic">
                    {def.note}
                  </p>
                )}
              </div>
            ))}
          </div>

          {filteredDefs.length === 0 && (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl text-slate-500 text-xs">
              Nem található feladat a megadott szűrőkkel.
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: Heti Beosztások & Kiosztás                        */}
      {/* ========================================================= */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-[#e9e9e7] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 text-[11px] font-semibold">Nap:</span>
              <select
                value={assignmentDayFilter}
                onChange={(e) => setAssignmentDayFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-xl bg-white font-medium focus:outline-none cursor-pointer"
              >
                <option value="all">Minden nap</option>
                {DAYS_OF_WEEK.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              <span className="text-slate-400 text-[11px] font-semibold ml-2">Családtag:</span>
              <select
                value={assignmentMemberFilter}
                onChange={(e) => setAssignmentMemberFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-xl bg-white font-medium focus:outline-none cursor-pointer"
              >
                <option value="all">Mindenki</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setEditingAssignment(null);
                  setIsAssignmentModalOpen(true);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>+ Egyedi Feladat Kiosztása</span>
              </button>
            </div>
          </div>

          {/* Assignments list */}
          <div className="bg-white rounded-2xl border border-[#e9e9e7] divide-y divide-[#efefed] overflow-hidden shadow-2xs">
            {filteredAssignments.map((asgn) => {
              const assignedMember = members.find((m) => m.id === asgn.memberId);

              return (
                <div
                  key={asgn.id}
                  className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#fafaf9] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                      style={{ backgroundColor: `${assignedMember?.color || '#8b5cf6'}18` }}
                    >
                      {assignedMember?.avatarEmoji || '👤'}
                    </div>

                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-xs ${asgn.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {asgn.choreTitle}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ({asgn.roomArea} • {asgn.estimatedMinutes} perc)
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="font-semibold text-indigo-700">{asgn.dayOfWeek}</span>
                        <span>•</span>
                        <span className="font-mono text-slate-600">{asgn.deadline}</span>
                        {asgn.note && (
                          <>
                            <span>•</span>
                            <span className="italic text-slate-400">{asgn.note}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {/* Reassign select */}
                    <select
                      value={asgn.memberId}
                      onChange={(e) => onUpdateAssignment(asgn.id, { memberId: e.target.value })}
                      className="px-2 py-1 text-xs font-semibold bg-white border border-slate-300 rounded-lg focus:outline-none cursor-pointer"
                    >
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => {
                        setEditingAssignment(asgn);
                        setIsAssignmentModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 cursor-pointer"
                      title="Szerkesztés"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Törlöd ezt a feladatot: "${asgn.choreTitle}"?`)) {
                          onDeleteAssignment(asgn.id);
                          showToast('Beosztás törölve!');
                        }
                      }}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                      title="Törlés"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredAssignments.length === 0 && (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl text-slate-500 text-xs">
              Nincs megjeleníthető beosztás a kiválasztott szűrőkkel.
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: Családi Jogosultságok                             */}
      {/* ========================================================= */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Itt állíthatod be, hogy ki tud főzni (csak ők kaphatnak főzési beosztást a heti menüben), valamint ki aktív a háztartásban.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.map((m) => {
              const isCsabiMember = m.id === 'mem-csabi';

              return (
                <div
                  key={m.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-inner"
                        style={{ backgroundColor: `${m.color || '#6366f1'}18` }}
                      >
                        {m.avatarEmoji || '👤'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{m.name}</span>
                          {isCsabiMember && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                              Admin
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">ID: {m.id}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onToggleMemberActive(m.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                          m.active
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {m.active ? 'Aktív' : 'Inaktív'}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">Tud főzni (Heti menü készítése):</span>
                    <button
                      onClick={() => onToggleCanCook(m.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1 ${
                        m.canCook
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      <ChefHat className="w-3.5 h-3.5" />
                      <span>{m.canCook ? 'Igen, tud főzni' : 'Nem főz'}</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Családi megjegyzés / heti rutin:
                    </label>
                    <input
                      type="text"
                      defaultValue={m.note || ''}
                      onBlur={(e) => onUpdateMemberNote(m.id, e.target.value)}
                      placeholder="pl. Pénteken csak vacsorázik otthon..."
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: Regisztrált Felhasználók                          */}
      {/* ========================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Az email címmel vagy Google fiókkal regisztrált felhasználók és az általuk választott családi profilok listája.
          </p>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="p-3">Felhasználó</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Belépési Mód</th>
                  <th className="p-3">Összekapcsolt Családtag</th>
                  <th className="p-3">Regisztráció ideje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {registeredUsers.map((u) => {
                  const linkedMember = members.find((m) => m.id === u.linkedMemberId);

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70">
                      <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                        <span>{u.avatarEmoji || '👤'}</span>
                        <span>{u.name}</span>
                        {isCsabiUser(u) && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-purple-100 text-purple-800 font-bold">
                            Admin
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-slate-600">{u.email}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            u.provider === 'google'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {u.provider}
                        </span>
                      </td>
                      <td className="p-3">
                        {linkedMember ? (
                          <span className="font-semibold text-indigo-700 flex items-center gap-1">
                            <span>{linkedMember.avatarEmoji}</span>
                            <span>{linkedMember.name}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Nincs összekapcsolva</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-400 font-mono text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString('hu-HU')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <ChoreDefModal
        isOpen={isChoreDefModalOpen}
        onClose={() => {
          setIsChoreDefModalOpen(false);
          setEditingChoreDef(null);
        }}
        initialChoreDef={editingChoreDef}
        onSave={(savedDef) => {
          if (editingChoreDef) {
            onUpdateChoreDef(savedDef.id, savedDef);
            showToast(`"${savedDef.title}" feladat módosítva!`);
          } else {
            onAddChoreDef(savedDef);
            showToast(`"${savedDef.title}" új feladat hozzáadva a katalógushoz!`);
          }
        }}
      />

      <ChoreAssignmentModal
        isOpen={isAssignmentModalOpen}
        onClose={() => {
          setIsAssignmentModalOpen(false);
          setEditingAssignment(null);
        }}
        initialAssignment={editingAssignment}
        members={members}
        choreDefs={choreDefs}
        onSave={(savedAsgn) => {
          if (editingAssignment) {
            onUpdateAssignment(savedAsgn.id, savedAsgn);
            showToast('Házimunka beosztás sikeresen frissítve!');
          } else {
            onAddAssignment(savedAsgn);
            showToast('Új egyedi házimunka sikeresen kiosztva a hétre!');
          }
        }}
      />
    </div>
  );
};

