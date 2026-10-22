import React, { useState } from 'react';
import {
  DayOfWeek,
  DAYS_OF_WEEK,
  FamilyMember,
  WeeklyMealPlanItem,
  Recipe,
  MealAttendanceRecord,
} from '../../types/notion.ts';
import { calculateDailyMealCounts } from '../../utils/fairDistribution.ts';
import { ChefHat, Utensils, Clock, Check, AlertCircle, Sparkles, BookOpen } from 'lucide-react';

interface MealPlanAndCookingViewProps {
  mealPlan: WeeklyMealPlanItem[];
  recipes: Recipe[];
  members: FamilyMember[];
  mealAttendances: MealAttendanceRecord[];
  onUpdateMealPlan: (planId: string, updates: Partial<WeeklyMealPlanItem>) => void;
  onOpenRecipeModal: (recipe: Recipe) => void;
}

export const MealPlanAndCookingView: React.FC<MealPlanAndCookingViewProps> = ({
  mealPlan,
  recipes,
  members,
  mealAttendances,
  onUpdateMealPlan,
  onOpenRecipeModal,
}) => {
  // Filter eligible cooks: canCook === true
  const eligibleCooks = members.filter((m) => m.canCook && m.active);

  const [activeDayFilter, setActiveDayFilter] = useState<string>('all');

  const filteredPlan = activeDayFilter === 'all'
    ? mealPlan
    : mealPlan.filter((p) => p.dayOfWeek === activeDayFilter);

  const getRecipe = (id: string): Recipe | undefined => recipes.find((r) => r.id === id);
  const getMember = (id: string): FamilyMember | undefined => members.find((m) => m.id === id);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-7 space-y-6 text-slate-800">
      {/* Title */}
      <div className="border-b border-[#e9e9e7] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-3xl mb-1">👩‍🍳</div>
          <h1 className="text-2xl font-bold font-serif text-slate-900">
            Heti Menüterv & Főzés Beosztása
          </h1>
          <p className="text-xs text-slate-500">
            Adatbázisok: Weekly Meal Plan & Cooking Schedule • Főzők beosztása és elviteles ebédek kezelése
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-1 bg-[#efefed] p-1 rounded-md text-xs border border-[#e2e2e0]">
          <button
            onClick={() => setActiveDayFilter('all')}
            className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
              activeDayFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            Minden nap
          </button>
          {DAYS_OF_WEEK.map((d) => (
            <button
              key={d}
              onClick={() => setActiveDayFilter(d)}
              className={`px-2 py-1 rounded text-xs font-semibold cursor-pointer hidden md:inline ${
                activeDayFilter === d ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              {d.substring(0, 2)}
            </button>
          ))}
        </div>
      </div>

      {/* Notion Callout Box: Special Lunch Rule */}
      <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-lg text-xs space-y-1.5 text-amber-900">
        <div className="flex items-center gap-2 font-bold text-amber-950">
          <Clock className="w-4 h-4 text-amber-700" />
          <span>⏰ Különleges Ebéd Logika: Reggelre Készen Kell Lennie!</span>
        </div>
        <p className="leading-relaxed">
          Mivel a családtagok magukkal viszik az ebédet munkába/iskolába, az ebédnek <strong>reggelre dobozolva készen kell lennie</strong>. Ezért a főzés beosztásánál az ebédet mindig <strong>előző este (pl. 20:00-ig) vagy kora reggel (07:00-ig)</strong> kell elkészíteni. Főzőként csak azok választhatók, akiknek a profiljában be van állítva a &quot;Tud főzni&quot; jogosultság (alap: Anyu, Marica).
        </p>
      </div>

      {/* Meal Plan List/Table */}
      <div className="space-y-4">
        {filteredPlan.map((planItem) => {
          const isLunch = planItem.mealType === 'ebéd';
          const recipe = getRecipe(planItem.recipeId);
          const cook = getMember(planItem.cookMemberId);
          const mealCounts = calculateDailyMealCounts(mealAttendances, planItem.dayOfWeek);
          const eaterCount = isLunch ? mealCounts.lunchCount : mealCounts.dinnerCount;
          const eaterIds = isLunch ? mealCounts.lunchEaters : mealCounts.dinnerEaters;

          return (
            <div
              key={planItem.id}
              className={`p-4 rounded-xl border bg-white shadow-2xs transition-all ${
                isLunch ? 'border-amber-200/90' : 'border-indigo-200/90'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Meal header & Tag */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 font-mono">
                      {planItem.dayOfWeek}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                        isLunch
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {isLunch ? '🍱 Ebéd (Elviteles)' : '🍽️ Vacsora (Közös)'}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {eaterCount} adag / fő
                    </span>
                  </div>

                  {/* Recipe select & details */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <select
                      value={planItem.recipeId}
                      onChange={(e) => onUpdateMealPlan(planItem.id, { recipeId: e.target.value })}
                      className="text-sm font-bold text-slate-900 bg-[#fbfbfa] border border-[#d8d8d6] rounded-md px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      {recipes.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.prepTimeMinutes}p, {r.category})
                        </option>
                      ))}
                    </select>

                    {recipe && (
                      <button
                        onClick={() => onOpenRecipeModal(recipe)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        Recept & Hozzávalók megtekintése
                      </button>
                    )}
                  </div>
                </div>

                {/* Cook & Deadline controls */}
                <div className="flex flex-wrap items-center gap-3 bg-[#fbfbfa] p-3 rounded-lg border border-[#e9e9e7]">
                  {/* Cook selector */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-0.5">
                      👩‍🍳 Ki főzi? (Tud főzni)
                    </label>
                    <select
                      value={planItem.cookMemberId}
                      onChange={(e) => onUpdateMealPlan(planItem.id, { cookMemberId: e.target.value })}
                      className="text-xs font-semibold text-slate-800 bg-white border border-[#d8d8d6] rounded px-2 py-1 focus:outline-none"
                    >
                      {eligibleCooks.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Deadline */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-0.5">
                      ⏰ Elkészítési határidő
                    </label>
                    <input
                      type="text"
                      value={planItem.deadlineTime}
                      onChange={(e) => onUpdateMealPlan(planItem.id, { deadlineTime: e.target.value })}
                      className="text-xs font-mono text-slate-700 bg-white border border-[#d8d8d6] rounded px-2 py-1 w-48 focus:outline-none"
                      placeholder="pl. Előző este 20:00"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Eater details */}
              <div className="mt-3 pt-2 border-t border-[#f1f1ef] flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
                <div>
                  <strong>{isLunch ? 'Elviteles ebédet kérők:' : 'Vacsorát kérők:'}</strong>{' '}
                  {eaterIds.length > 0
                    ? eaterIds
                        .map((id) => getMember(id)?.name)
                        .filter(Boolean)
                        .join(', ')
                    : 'Nincs igénylő erre az étkezésre'}
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-600">
                    <input
                      type="checkbox"
                      checked={planItem.isLeftover}
                      onChange={(e) => onUpdateMealPlan(planItem.id, { isLeftover: e.target.checked })}
                      className="rounded text-indigo-600"
                    />
                    <span>Maradékmentő / előző napi adag</span>
                  </label>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
