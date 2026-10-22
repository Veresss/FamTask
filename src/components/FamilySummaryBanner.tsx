import React from 'react';
import { FamilyMember, Chore } from '../types/index.ts';
import { CATEGORIES_META } from '../utils/categories.ts';
import {
  CheckCircle2,
  Clock,
  Award,
  Search,
  Filter,
  Flame,
  CalendarCheck2,
  Sparkles,
} from 'lucide-react';

interface FamilySummaryBannerProps {
  familyName: string;
  members: FamilyMember[];
  chores: Chore[];
  activeMemberId: string | 'all';
  statusFilter: 'all' | 'pending' | 'completed';
  onChangeStatusFilter: (status: 'all' | 'pending' | 'completed') => void;
  categoryFilter: string;
  onChangeCategoryFilter: (cat: string) => void;
  searchQuery: string;
  onChangeSearchQuery: (query: string) => void;
  onOpenSundayModal: () => void;
  isSundayToday: boolean;
  onToggleSimulatedSunday: () => void;
  isSimulatedSunday: boolean;
}

export const FamilySummaryBanner: React.FC<FamilySummaryBannerProps> = ({
  familyName,
  members,
  chores,
  activeMemberId,
  statusFilter,
  onChangeStatusFilter,
  categoryFilter,
  onChangeCategoryFilter,
  searchQuery,
  onChangeSearchQuery,
  onOpenSundayModal,
  isSundayToday,
  onToggleSimulatedSunday,
  isSimulatedSunday,
}) => {
  const filteredForMetrics =
    activeMemberId === 'all'
      ? chores
      : chores.filter((c) => c.assignedMemberId === activeMemberId);

  const totalCount = filteredForMetrics.length;
  const completedCount = filteredForMetrics.filter((c) => c.isCompleted).length;
  const pendingCount = totalCount - completedCount;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const totalPoints = filteredForMetrics
    .filter((c) => c.isCompleted)
    .reduce((sum, c) => sum + (c.points || 0), 0);

  const activeMember = members.find((m) => m.id === activeMemberId);

  return (
    <div className="space-y-4">
      {/* Sunday Highlight Notification Banner */}
      {(isSundayToday || isSimulatedSunday) && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0 text-xl">
              🏆
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold">
                  Vasárnapi Heti Kiértékelés Napja!
                </h3>
                {isSimulatedSunday && (
                  <span className="text-[10px] bg-white/25 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                    Szimulált Mód
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-100">
                A héten kiadott feladatok összegzése készen áll. Nézd meg a családtagok heti elvégzett munkáját és mentsd el az értékelést!
              </p>
            </div>
          </div>

          <button
            onClick={onOpenSundayModal}
            className="px-4 py-2 bg-white text-amber-900 hover:bg-amber-50 text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0"
          >
            Vasárnapi Összegzés Megnyitása
          </button>
        </div>
      )}

      {/* Main Family KPI Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Title & Status */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wider uppercase text-indigo-600 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {activeMember ? `${activeMember.name} feladatlistája` : 'Közös Családi Áttekintés'}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500">
                {new Date().toLocaleDateString('hu-HU', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {completedCount} a(z) {totalCount} feladatból befejezve ({completionRate}%)
            </h2>

            {/* Progress bar */}
            <div className="w-full sm:max-w-md h-3 bg-slate-100 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-3 gap-3 shrink-0">
            <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl text-center">
              <span className="text-xs font-semibold text-slate-500 block">Függőben</span>
              <span className="text-lg font-black text-slate-800 flex items-center justify-center gap-1">
                <Clock className="w-4 h-4 text-amber-500" />
                {pendingCount}
              </span>
            </div>

            <div className="p-3 bg-emerald-50/70 border border-emerald-200/70 rounded-xl text-center">
              <span className="text-xs font-semibold text-emerald-700 block">Kész</span>
              <span className="text-lg font-black text-emerald-800 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {completedCount}
              </span>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl text-center">
              <span className="text-xs font-semibold text-amber-700 block">Pontok</span>
              <span className="text-lg font-black text-amber-800 flex items-center justify-center gap-1">
                <Flame className="w-4 h-4 text-amber-500" />
                {totalPoints}p
              </span>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
            <button
              onClick={() => onChangeStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'hover:text-slate-900'
              }`}
            >
              Összes ({totalCount})
            </button>
            <button
              onClick={() => onChangeStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'pending'
                  ? 'bg-white text-amber-800 shadow-2xs'
                  : 'hover:text-slate-900'
              }`}
            >
              Függőben ({pendingCount})
            </button>
            <button
              onClick={() => onChangeStatusFilter('completed')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'completed'
                  ? 'bg-white text-emerald-800 shadow-2xs'
                  : 'hover:text-slate-900'
              }`}
            >
              Kész ({completedCount})
            </button>
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Keresés a feladatok közt..."
                value={searchQuery}
                onChange={(e) => onChangeSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => onChangeCategoryFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 border border-slate-200 rounded-xl bg-white focus:outline-none cursor-pointer"
            >
              <option value="all">Minden kategória</option>
              {Object.values(CATEGORIES_META).map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>

            {/* Sunday mode simulator button */}
            <button
              type="button"
              onClick={onToggleSimulatedSunday}
              className={`px-2.5 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                isSimulatedSunday
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
              title="Tesztelés: vasárnapi kiértékelési nap szimulálása"
            >
              {isSimulatedSunday ? '⚡ Vasárnap teszt: BE' : '📅 Vasárnap teszt'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
