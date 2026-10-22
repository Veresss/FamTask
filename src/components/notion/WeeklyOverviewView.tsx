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
import { Calendar, Users, Utensils, ChefHat, CheckSquare, ShoppingCart } from 'lucide-react';

interface WeeklyOverviewViewProps {
  members: FamilyMember[];
  presence: PresenceRecord[];
  mealAttendances: MealAttendanceRecord[];
  mealPlan: WeeklyMealPlanItem[];
  recipes: Recipe[];
  shoppingList: ShoppingItem[];
  assignments: ChoreAssignment[];
}

export const WeeklyOverviewView: React.FC<WeeklyOverviewViewProps> = ({
  members,
  presence,
  mealAttendances,
  mealPlan,
  recipes,
  shoppingList,
  assignments,
}) => {
  const getRecipe = (id: string) => recipes.find((r) => r.id === id);
  const getMember = (id: string) => members.find((m) => m.id === id);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-7 space-y-8 text-slate-800">
      {/* Title */}
      <div className="border-b border-[#e9e9e7] pb-4">
        <div className="text-3xl mb-1">📅</div>
        <h1 className="text-2xl font-bold font-serif text-slate-900">
          E Heti Családi Terv (Hétfő – Vasárnap)
        </h1>
        <p className="text-xs text-slate-500">
          Teljes heti összefoglaló: Otthonlét, Ebédek, Vacsorák, Főzési és Házimunka-beosztás
        </p>
      </div>

      {/* 1. 🍱 EBÉD ÉS 🍽️ VACSORA HETI TÁBLÁZAT */}
      <div className="bg-white rounded-lg border border-[#e9e9e7] p-5 shadow-2xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Utensils className="w-4 h-4 text-amber-600" />
          Heti Étkezések & Főzés (Hétfő – Vasárnap)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#f7f7f5] border-b border-[#e9e9e7] text-slate-600 font-semibold">
                <th className="p-2.5 w-28">Nap</th>
                <th className="p-2.5">🍱 Ebéd (Elviteles, reggelre kész)</th>
                <th className="p-2.5 text-center w-20">Ebéd Fő</th>
                <th className="p-2.5">Ebéd Főző</th>
                <th className="p-2.5 border-l border-[#e9e9e7]">🍽️ Vacsora</th>
                <th className="p-2.5 text-center w-20">Vacsi Fő</th>
                <th className="p-2.5">Vacsi Főző</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efefed]">
              {DAYS_OF_WEEK.map((day) => {
                const counts = calculateDailyMealCounts(mealAttendances, day);
                const lunch = mealPlan.find((p) => p.dayOfWeek === day && p.mealType === 'ebéd');
                const dinner = mealPlan.find((p) => p.dayOfWeek === day && p.mealType === 'vacsora');

                const lunchR = lunch ? getRecipe(lunch.recipeId) : undefined;
                const dinnerR = dinner ? getRecipe(dinner.recipeId) : undefined;
                const lunchCook = lunch ? getMember(lunch.cookMemberId) : undefined;
                const dinnerCook = dinner ? getMember(dinner.cookMemberId) : undefined;

                return (
                  <tr key={day} className="hover:bg-[#fafaf9]">
                    <td className="p-2.5 font-bold text-slate-900 font-mono">{day}</td>

                    {/* Lunch */}
                    <td className="p-2.5 font-semibold text-amber-950">
                      {lunchR ? lunchR.name : '-'}
                    </td>
                    <td className="p-2.5 text-center font-mono font-bold text-amber-800">
                      {counts.lunchCount} fő
                    </td>
                    <td className="p-2.5 text-slate-600">
                      {lunchCook ? lunchCook.name : '-'}
                    </td>

                    {/* Dinner */}
                    <td className="p-2.5 font-semibold text-indigo-950 border-l border-[#e9e9e7]">
                      {dinnerR ? dinnerR.name : '-'}
                    </td>
                    <td className="p-2.5 text-center font-mono font-bold text-indigo-800">
                      {counts.dinnerCount} fő
                    </td>
                    <td className="p-2.5 text-slate-600">
                      {dinnerCook ? dinnerCook.name : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. 👨‍👩‍👧‍👦 HETI JELENLÉT ÁTTEKINTŐ */}
      <div className="bg-white rounded-lg border border-[#e9e9e7] p-5 shadow-2xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-600" />
          Heti Jelenlét (Ki van otthon a 7 nap során)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2.5">
          {DAYS_OF_WEEK.map((day) => {
            const dayP = presence.filter((p) => p.dayOfWeek === day);
            const homeList = dayP.filter((p) => p.isHome === 'otthon').map((p) => getMember(p.memberId)?.name);
            const eveningOnly = dayP.filter((p) => p.isHome === 'csak_este').map((p) => getMember(p.memberId)?.name);
            const awayList = dayP.filter((p) => p.isHome === 'nincs_otthon').map((p) => getMember(p.memberId)?.name);

            return (
              <div key={day} className="p-2.5 rounded-lg border border-[#efefed] bg-[#fbfbfa] text-xs space-y-1.5">
                <span className="font-bold text-slate-900 font-mono block text-center border-b pb-1">
                  {day}
                </span>

                <div>
                  <span className="text-[10px] text-emerald-800 font-bold block">Otthon:</span>
                  <p className="text-[11px] text-slate-700 leading-tight">
                    {homeList.length > 0 ? homeList.join(', ') : 'Senki'}
                  </p>
                </div>

                {eveningOnly.length > 0 && (
                  <div>
                    <span className="text-[10px] text-amber-800 font-bold block">Csak este:</span>
                    <p className="text-[11px] text-slate-600 leading-tight">
                      {eveningOnly.join(', ')}
                    </p>
                  </div>
                )}

                {awayList.length > 0 && (
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Nincs otthon:</span>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      {awayList.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. 🧹 HÁZIMUNKA HETI ELOSZLÁS TAGONKÉNT */}
      <div className="bg-white rounded-lg border border-[#e9e9e7] p-5 shadow-2xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-emerald-600" />
          Házimunkák Eloszlása Családtagok Között (Igazságos terhelés)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {members.map((member) => {
            const memberChores = assignments.filter((a) => a.memberId === member.id);
            const totalMins = memberChores.reduce((s, c) => s + c.estimatedMinutes, 0);
            const completed = memberChores.filter((c) => c.completed).length;

            return (
              <div key={member.id} className="p-3 rounded-lg border border-[#efefed] bg-[#fbfbfa] space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <span>{member.avatarEmoji || '👤'}</span>
                    <span>{member.name}</span>
                  </div>
                  <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded font-mono">
                    {totalMins} perc
                  </span>
                </div>

                <div className="text-[11px] text-slate-500">
                  {completed} / {memberChores.length} feladat elvégezve
                </div>

                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: `${memberChores.length > 0 ? (completed / memberChores.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
