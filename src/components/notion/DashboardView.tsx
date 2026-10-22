import React, { useState } from 'react';
import {
  DayOfWeek,
  DAYS_OF_WEEK,
  FamilyMember,
  PresenceRecord,
  MealAttendanceRecord,
  WeeklyMealPlanItem,
  Recipe,
  ShoppingItem,
  ChoreAssignment,
} from '../../types/notion.ts';
import { calculateDailyMealCounts } from '../../utils/fairDistribution.ts';
import {
  Calendar,
  Users,
  Utensils,
  ChefHat,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  ShoppingBag,
  CheckSquare,
  User,
  ArrowRight,
  Sun,
  Moon,
  Box,
  Flame,
} from 'lucide-react';

interface DashboardViewProps {
  members: FamilyMember[];
  presence: PresenceRecord[];
  mealAttendances: MealAttendanceRecord[];
  mealPlan: WeeklyMealPlanItem[];
  recipes: Recipe[];
  shoppingList: ShoppingItem[];
  choreAssignments: ChoreAssignment[];
  activeMemberId: string;
  onToggleChoreComplete: (assignmentId: string) => void;
  onToggleShoppingItem: (itemId: string) => void;
  onNavigatePage: (page: any) => void;
  onSelectMember: (memberId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  members,
  presence,
  mealAttendances,
  mealPlan,
  recipes,
  shoppingList,
  choreAssignments,
  activeMemberId,
  onToggleChoreComplete,
  onToggleShoppingItem,
  onNavigatePage,
  onSelectMember,
}) => {
  // Current day in Hungarian
  const jsDay = new Date().getDay(); // 0 is Sunday, 1 is Monday
  const dayIndex = (jsDay + 6) % 7;
  const currentDayOfWeek = DAYS_OF_WEEK[dayIndex];

  const [selectedDayTab, setSelectedDayTab] = useState<DayOfWeek>(currentDayOfWeek);

  const activeMember = members.find((m) => m.id === activeMemberId) || members[0];

  // Helper to find recipe
  const getRecipe = (recipeId: string): Recipe | undefined => {
    return recipes.find((r) => r.id === recipeId);
  };

  // Helper to find member
  const getMember = (memberId: string): FamilyMember | undefined => {
    return members.find((m) => m.id === memberId);
  };

  // Daily calculations for selected tab
  const dayMealCounts = calculateDailyMealCounts(mealAttendances, selectedDayTab);
  const dayLunchPlan = mealPlan.find((p) => p.dayOfWeek === selectedDayTab && p.mealType === 'ebéd');
  const dayDinnerPlan = mealPlan.find((p) => p.dayOfWeek === selectedDayTab && p.mealType === 'vacsora');

  const lunchRecipe = dayLunchPlan ? getRecipe(dayLunchPlan.recipeId) : undefined;
  const dinnerRecipe = dayDinnerPlan ? getRecipe(dayDinnerPlan.recipeId) : undefined;
  const lunchCook = dayLunchPlan ? getMember(dayLunchPlan.cookMemberId) : undefined;
  const dinnerCook = dayDinnerPlan ? getMember(dayDinnerPlan.cookMemberId) : undefined;

  // Presence for selected day
  const dayPresence = presence.filter((p) => p.dayOfWeek === selectedDayTab);

  // Today's chores (for current real day or selected tab)
  const todaysChores = choreAssignments.filter((a) => a.dayOfWeek === selectedDayTab);

  // Personal chores for active member
  const myChores = choreAssignments.filter((a) => a.memberId === activeMemberId);
  const myPendingChores = myChores.filter((a) => !a.completed);
  const myCompletedChores = myChores.filter((a) => a.completed);

  // Shopping list pending items
  const pendingShopping = shoppingList.filter((s) => s.needsBuying && !s.purchased);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-7 space-y-8 text-slate-800">
      {/* Notion Page Cover Title */}
      <div className="space-y-2 border-b border-[#e9e9e7] pb-6">
        <div className="text-4xl">🏠</div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-serif">
          Családi Otthon — Heti Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
          Központi áttekintés a 7 fős család heti otthonlétéről, étkezési igényeiről, elviteles ebédjeiről, vacsoráiról és az igazságosan beosztott házimunkákról.
        </p>
      </div>

      {/* Notion Callout Box: Current Focus */}
      <div className="p-4 rounded-lg bg-[#f7f6f3] border border-[#e8e7e3] flex items-start gap-3 shadow-2xs">
        <div className="text-xl">📌</div>
        <div className="space-y-1 text-xs">
          <div className="font-bold text-slate-900 flex items-center gap-2">
            <span>Rendszer Alapelvi Irányelv:</span>
            <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono font-medium">
              Aktuális heti állapot • Nincs pontozás
            </span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Minden családtag teljes mértékben képes a házimunkákra. Az ebéd elviteles, ezért <strong>reggelre vagy előző este készen kell lennie!</strong> A feladatok kiosztása a heti valós jelenlét és szabadidő alapján történik.
          </p>
        </div>
      </div>

      {/* 📅 E HETI TERV: Day Selector Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 font-mono">
            <Calendar className="w-4 h-4 text-slate-600" />
            📅 E HETI TERV (Hétfő – Vasárnap)
          </h2>
          <span className="text-xs text-slate-400">
            Kattints a napokra a részletek megtekintéséhez
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 p-1 bg-[#efefed] rounded-lg border border-[#e2e2e0]">
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = selectedDayTab === day;
            const isToday = currentDayOfWeek === day;
            const counts = calculateDailyMealCounts(mealAttendances, day);

            return (
              <button
                key={day}
                onClick={() => setSelectedDayTab(day)}
                className={`py-2 px-1 rounded-md text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white text-slate-900 font-bold shadow-xs ring-1 ring-slate-300'
                    : 'text-slate-600 hover:bg-[#e4e4e2] hover:text-slate-900'
                }`}
              >
                <div className="text-xs sm:text-sm font-semibold flex items-center justify-center gap-1">
                  <span>{day.substring(0, 2)}</span>
                  {isToday && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Mai nap"></span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 hidden sm:block">
                  🍱 {counts.lunchCount} • 🍽️ {counts.dinnerCount}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2 COLUMN GRID: Ki van otthon? & Étkezések az adott napon */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 👨‍👩‍👧‍👦 KI VAN OTTHON? */}
        <div className="bg-white rounded-lg border border-[#e9e9e7] p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#f1f1ef] pb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">👨‍👩‍👧‍👦</span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Ki van otthon?</h3>
                <p className="text-xs text-slate-400">{selectedDayTab}i jelenlét és ott alvás</p>
              </div>
            </div>
            <button
              onClick={() => onNavigatePage('presence')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
            >
              Mátrix szerkesztése <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {members.map((member) => {
              const rec = dayPresence.find((p) => p.memberId === member.id);
              const isHome = rec ? rec.isHome : 'otthon';
              const sleepsHome = rec ? rec.sleepsHome : true;

              return (
                <div key={member.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{member.avatarEmoji || '👤'}</span>
                    <div>
                      <span className="font-semibold text-slate-900">{member.name}</span>
                      {rec?.arrival && (
                        <span className="ml-1 text-[11px] text-slate-400">
                          (Érk: {rec.arrival})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Home Status Pill */}
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                        isHome === 'otthon'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : isHome === 'csak_este'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      {isHome === 'otthon'
                        ? 'Otthon van'
                        : isHome === 'csak_este'
                        ? 'Csak este'
                        : 'Nincs otthon'}
                    </span>

                    {/* Sleeps Home Pill */}
                    <span
                      className={`px-1.5 py-0.5 rounded text-[11px] flex items-center gap-1 ${
                        sleepsHome
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                      title={sleepsHome ? 'Otthon alszik' : 'Nem alszik otthon'}
                    >
                      <Moon className="w-3 h-3" />
                      <span className="text-[10px]">{sleepsHome ? 'Igen' : 'Nem'}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 🍱 EBÉD & 🍽️ VACSORA CARDS */}
        <div className="space-y-4">
          {/* 🍱 EBÉD — REGGELRE KÉSZ / ELVITEL KÖVETELMÉNY */}
          <div className="bg-white rounded-lg border border-[#e9e9e7] p-5 shadow-2xs space-y-3">
            <div className="flex items-start justify-between border-b border-[#f1f1ef] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-lg">🍱</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">Ebéd — {selectedDayTab}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                      {dayMealCounts.lunchCount} FŐRE KÉSZÜL
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-700 font-medium">
                    ⚠️ Elviteles: reggelre készen kell lennie (előző este készítve!)
                  </p>
                </div>
              </div>
            </div>

            {lunchRecipe ? (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">{lunchRecipe.name}</span>
                  <span className="text-slate-500 font-mono text-[11px]">
                    ⏱️ {lunchRecipe.prepTimeMinutes} perc
                  </span>
                </div>

                <div className="p-2.5 bg-[#fbfbfa] rounded border border-[#efefed] space-y-1.5">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>👩‍🍳 <strong>Ki készíti:</strong> {lunchCook ? lunchCook.name : 'Nincs beosztva'}</span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Határidő: Reggel 07:00-ig
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    <strong>Kik viszik magukkal:</strong>{' '}
                    {dayMealCounts.lunchEaters.length > 0
                      ? dayMealCounts.lunchEaters
                          .map((id) => getMember(id)?.name)
                          .filter(Boolean)
                          .join(', ')
                      : 'Senki'}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Nincs ebéd megadva erre a napra.</p>
            )}
          </div>

          {/* 🍽️ VACSORA */}
          <div className="bg-white rounded-lg border border-[#e9e9e7] p-5 shadow-2xs space-y-3">
            <div className="flex items-start justify-between border-b border-[#f1f1ef] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-lg">🍽️</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">Vacsora — {selectedDayTab}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                      {dayMealCounts.dinnerCount} FŐRE KÉSZÜL
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">Közös meleg családi vacsora</p>
                </div>
              </div>
            </div>

            {dinnerRecipe ? (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">{dinnerRecipe.name}</span>
                  <span className="text-slate-500 font-mono text-[11px]">
                    ⏱️ {dinnerRecipe.prepTimeMinutes} perc
                  </span>
                </div>

                <div className="p-2.5 bg-[#fbfbfa] rounded border border-[#efefed] space-y-1.5">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>👩‍🍳 <strong>Ki készíti:</strong> {dinnerCook ? dinnerCook.name : 'Nincs beosztva'}</span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Határidő: Este 19:00
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    <strong>Kik kérnek vacsorát:</strong>{' '}
                    {dayMealCounts.dinnerEaters.length > 0
                      ? dayMealCounts.dinnerEaters
                          .map((id) => getMember(id)?.name)
                          .filter(Boolean)
                          .join(', ')
                      : 'Senki'}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Nincs vacsora megadva erre a napra.</p>
            )}
          </div>
        </div>
      </div>

      {/* 🧹 MAI HÁZIMUNKA & 👤 SAJÁT FELADATAIM */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 🧹 MAI HÁZIMUNKA */}
        <div className="bg-white rounded-lg border border-[#e9e9e7] p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#f1f1ef] pb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🧹</span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Mai Házimunkák ({selectedDayTab})
                </h3>
                <p className="text-xs text-slate-400">
                  {todaysChores.length} kiosztott feladat erre a napra
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigatePage('chores')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
            >
              Összes beosztás <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {todaysChores.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">Nincs házimunka beosztva mára.</p>
          ) : (
            <div className="space-y-2">
              {todaysChores.map((chore) => {
                const assigned = getMember(chore.memberId);
                return (
                  <div
                    key={chore.id}
                    onClick={() => onToggleChoreComplete(chore.id)}
                    className={`p-2.5 rounded-md border flex items-center justify-between gap-3 text-xs transition-all cursor-pointer ${
                      chore.completed
                        ? 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                        : 'bg-white border-[#e9e9e7] hover:border-slate-300 text-slate-800 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {chore.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-300 hover:text-emerald-500 shrink-0" />
                      )}
                      <div className="truncate">
                        <span className="font-semibold text-slate-900">{chore.choreTitle}</span>
                        <span className="ml-2 text-[10px] text-slate-400">({chore.roomArea})</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#efefed] text-slate-700">
                        {assigned ? assigned.name : 'N/A'}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {chore.estimatedMinutes}p
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 👤 SAJÁT FELADATAIM (Személyre szabott nézet) */}
        <div className="bg-white rounded-lg border border-[#e9e9e7] p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#f1f1ef] pb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">👤</span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Saját Feladataim — {activeMember.name}
                </h3>
                <p className="text-xs text-slate-400">
                  {myPendingChores.length} teendő hátra a héten
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 text-[11px]">Váltás:</span>
              <select
                value={activeMemberId}
                onChange={(e) => onSelectMember(e.target.value)}
                className="font-semibold text-slate-800 bg-[#f1f1ef] px-2 py-0.5 rounded text-xs border border-[#e2e2e0]"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {myPendingChores.length === 0 ? (
              <div className="p-6 text-center text-xs text-emerald-700 bg-emerald-50/50 rounded-lg border border-emerald-100">
                🎉 Minden feladatodat elvégezted {activeMember.name}! Szép munka!
              </div>
            ) : (
              myPendingChores.map((chore) => (
                <div
                  key={chore.id}
                  onClick={() => onToggleChoreComplete(chore.id)}
                  className="p-2.5 rounded-md border border-[#e9e9e7] bg-white hover:border-emerald-300 flex items-center justify-between gap-3 text-xs cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Circle className="w-4 h-4 text-slate-300 hover:text-emerald-500 shrink-0" />
                    <div className="truncate">
                      <p className="font-semibold text-slate-900 truncate">{chore.choreTitle}</p>
                      <p className="text-[10px] text-slate-400">
                        {chore.dayOfWeek} • Határidő: {chore.deadline} • {chore.roomArea}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono shrink-0">
                    {chore.estimatedMinutes} perc
                  </span>
                </div>
              ))
            )}

            {myCompletedChores.length > 0 && (
              <div className="pt-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Befejezett feladatok ({myCompletedChores.length}):
                </p>
                {myCompletedChores.slice(0, 3).map((c) => (
                  <div
                    key={c.id}
                    onClick={() => onToggleChoreComplete(c.id)}
                    className="p-1.5 text-xs text-slate-400 line-through flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{c.choreTitle} ({c.dayOfWeek})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🛒 BEVÁSÁRLÓLISTA WIDGET */}
      <div className="bg-white rounded-lg border border-[#e9e9e7] p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#f1f1ef] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🛒</span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Aktuális Heti Bevásárlólista</h3>
              <p className="text-xs text-slate-400">
                {pendingShopping.length} megvásárolandó tétel
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigatePage('shopping')}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
          >
            Teljes lista kategóriák szerint <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {pendingShopping.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center">
            Minden szükséges termék megvan otthon vagy megvásárolva!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {pendingShopping.slice(0, 6).map((item) => (
              <div
                key={item.id}
                onClick={() => onToggleShoppingItem(item.id)}
                className="p-2 rounded-md border border-[#efefed] bg-[#fbfbfa] hover:bg-white flex items-center justify-between text-xs cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  <Circle className="w-3.5 h-3.5 text-slate-300 hover:text-emerald-500 shrink-0" />
                  <span className="font-semibold text-slate-800 truncate">{item.item}</span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono shrink-0 ml-1">
                  {item.quantity} {item.unit}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
