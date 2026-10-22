import React from 'react';
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
  Smartphone,
  Users,
  Utensils,
  ChefHat,
  CheckCircle2,
  Circle,
  ShoppingCart,
  Clock,
  Sparkles,
} from 'lucide-react';

interface MobileTodayViewProps {
  members: FamilyMember[];
  presence: PresenceRecord[];
  mealAttendances: MealAttendanceRecord[];
  mealPlan: WeeklyMealPlanItem[];
  recipes: Recipe[];
  shoppingList: ShoppingItem[];
  choreAssignments: ChoreAssignment[];
  activeMemberId: string;
  onSelectMember: (id: string) => void;
  onToggleChoreComplete: (id: string) => void;
  onToggleShoppingItem: (id: string) => void;
}

export const MobileTodayView: React.FC<MobileTodayViewProps> = ({
  members,
  presence,
  mealAttendances,
  mealPlan,
  recipes,
  shoppingList,
  choreAssignments,
  activeMemberId,
  onSelectMember,
  onToggleChoreComplete,
  onToggleShoppingItem,
}) => {
  const jsDay = new Date().getDay();
  const dayIndex = (jsDay + 6) % 7;
  const todayDayOfWeek = DAYS_OF_WEEK[dayIndex];

  const activeMember = members.find((m) => m.id === activeMemberId) || members[0];
  const mealCounts = calculateDailyMealCounts(mealAttendances, todayDayOfWeek);

  const todayLunch = mealPlan.find((p) => p.dayOfWeek === todayDayOfWeek && p.mealType === 'ebéd');
  const todayDinner = mealPlan.find((p) => p.dayOfWeek === todayDayOfWeek && p.mealType === 'vacsora');

  const lunchRecipe = todayLunch ? recipes.find((r) => r.id === todayLunch.recipeId) : undefined;
  const dinnerRecipe = todayDinner ? recipes.find((r) => r.id === todayDinner.recipeId) : undefined;

  const lunchCook = todayLunch ? members.find((m) => m.id === todayLunch.cookMemberId) : undefined;
  const dinnerCook = todayDinner ? members.find((m) => m.id === todayDinner.cookMemberId) : undefined;

  const todayPresence = presence.filter((p) => p.dayOfWeek === todayDayOfWeek);

  // My chores today
  const myChoresToday = choreAssignments.filter(
    (a) => a.memberId === activeMember.id && a.dayOfWeek === todayDayOfWeek
  );

  // Urgent shopping items
  const urgentShopping = shoppingList.filter((s) => s.needsBuying && !s.purchased).slice(0, 5);

  return (
    <div className="max-w-md mx-auto px-4 py-5 space-y-4 text-slate-800">
      {/* Mobile Header Card */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider font-mono text-emerald-400 font-bold flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5" />
            🏠 MA — {todayDayOfWeek}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {new Date().toISOString().split('T')[0]}
          </span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div>
            <h1 className="text-xl font-black font-serif">Szia {activeMember.name}!</h1>
            <p className="text-xs text-slate-300">Itt van minden fontos mai otthoni teendőd.</p>
          </div>

          <select
            value={activeMember.id}
            onChange={(e) => onSelectMember(e.target.value)}
            className="bg-slate-800 text-white text-xs border border-slate-700 rounded-lg px-2 py-1 font-semibold focus:outline-none"
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 1. Ki van otthon ma? */}
      <div className="bg-white rounded-xl border border-[#e9e9e7] p-3.5 shadow-2xs space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800 border-b border-slate-100 pb-1.5">
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-indigo-600" />
            Ki van otthon ma?
          </span>
          <span className="text-[11px] text-slate-400 font-normal">
            {todayPresence.filter((p) => p.isHome === 'otthon').length} / 7 tag
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {members.map((m) => {
            const p = todayPresence.find((pr) => pr.memberId === m.id);
            const isHome = p ? p.isHome : 'otthon';
            return (
              <span
                key={m.id}
                className={`text-[11px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${
                  isHome === 'otthon'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : isHome === 'csak_este'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'bg-slate-100 text-slate-400 line-through'
                }`}
              >
                <span>{m.avatarEmoji || '👤'}</span>
                <span>{m.name}</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* 2. Mi az ebéd? (Reggelre készen elvitelre) */}
      <div className="bg-white rounded-xl border border-amber-200 p-3.5 shadow-2xs space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-amber-950 border-b border-amber-100 pb-1.5">
          <span className="flex items-center gap-1.5">
            <Utensils className="w-4 h-4 text-amber-600" />
            🍱 Mi az ebéd? ({mealCounts.lunchCount} adag)
          </span>
          <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">
            Elviteles
          </span>
        </div>

        {lunchRecipe ? (
          <div className="text-xs space-y-1">
            <p className="font-bold text-slate-900 text-sm">{lunchRecipe.name}</p>
            <p className="text-slate-500 text-[11px]">
              👩‍🍳 Készíti: <strong>{lunchCook ? lunchCook.name : 'N/A'}</strong> • Reggel 07:00-ig készen
            </p>
          </div>
        ) : (
          <p className="text-xs text-slate-400">Nincs ebéd megadva mára.</p>
        )}
      </div>

      {/* 3. Mi a vacsora és ki főz? */}
      <div className="bg-white rounded-xl border border-indigo-200 p-3.5 shadow-2xs space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-indigo-950 border-b border-indigo-100 pb-1.5">
          <span className="flex items-center gap-1.5">
            <ChefHat className="w-4 h-4 text-indigo-600" />
            🍽️ Mi a vacsora? ({mealCounts.dinnerCount} adag)
          </span>
          <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-bold">
            Este 19:00
          </span>
        </div>

        {dinnerRecipe ? (
          <div className="text-xs space-y-1">
            <p className="font-bold text-slate-900 text-sm">{dinnerRecipe.name}</p>
            <p className="text-slate-500 text-[11px]">
              👩‍🍳 Főzi: <strong>{dinnerCook ? dinnerCook.name : 'N/A'}</strong> (⏱️ {dinnerRecipe.prepTimeMinutes} perc)
            </p>
          </div>
        ) : (
          <p className="text-xs text-slate-400">Nincs vacsora megadva mára.</p>
        )}
      </div>

      {/* 4. Mi az én mai házimunkám? */}
      <div className="bg-white rounded-xl border border-[#e9e9e7] p-3.5 shadow-2xs space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800 border-b border-slate-100 pb-1.5">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Mi az én mai házimunkám?
          </span>
          <span className="text-[11px] text-slate-400 font-mono font-normal">
            {myChoresToday.length} feladat
          </span>
        </div>

        {myChoresToday.length === 0 ? (
          <p className="text-xs text-emerald-700 bg-emerald-50/70 p-2.5 rounded-lg text-center font-medium">
            Mára nincs házimunkád, pihenj! 🌟
          </p>
        ) : (
          <div className="space-y-1.5">
            {myChoresToday.map((c) => (
              <div
                key={c.id}
                onClick={() => onToggleChoreComplete(c.id)}
                className={`p-2.5 rounded-lg border flex items-center justify-between text-xs cursor-pointer ${
                  c.completed ? 'bg-slate-50 text-slate-400 line-through' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {c.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                  )}
                  <span className="font-semibold">{c.choreTitle}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{c.estimatedMinutes}p</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Mit kell venni? (Gyors lista) */}
      <div className="bg-white rounded-xl border border-[#e9e9e7] p-3.5 shadow-2xs space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800 border-b border-slate-100 pb-1.5">
          <span className="flex items-center gap-1.5">
            <ShoppingCart className="w-4 h-4 text-slate-600" />
            Mit kell venni a boltban?
          </span>
          <span className="text-[11px] text-slate-400 font-normal">
            {urgentShopping.length} tétel
          </span>
        </div>

        <div className="space-y-1">
          {urgentShopping.map((s) => (
            <div
              key={s.id}
              onClick={() => onToggleShoppingItem(s.id)}
              className="p-1.5 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 rounded"
            >
              <div className="flex items-center gap-2">
                <Circle className="w-3.5 h-3.5 text-slate-300" />
                <span className="font-medium text-slate-800">{s.item}</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {s.quantity} {s.unit}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
