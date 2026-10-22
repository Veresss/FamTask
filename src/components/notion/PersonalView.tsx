import React from 'react';
import {
  DayOfWeek,
  DAYS_OF_WEEK,
  FamilyMember,
  ChoreAssignment,
  WeeklyMealPlanItem,
  MealAttendanceRecord,
  PresenceRecord,
  Recipe,
} from '../../types/notion.ts';
import {
  User,
  CheckCircle2,
  Circle,
  Calendar,
  ChefHat,
  Utensils,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react';

interface PersonalViewProps {
  members: FamilyMember[];
  activeMemberId: string;
  onSelectMember: (id: string) => void;
  assignments: ChoreAssignment[];
  mealPlan: WeeklyMealPlanItem[];
  mealAttendances: MealAttendanceRecord[];
  presence: PresenceRecord[];
  recipes: Recipe[];
  onToggleChoreComplete: (id: string) => void;
}

export const PersonalView: React.FC<PersonalViewProps> = ({
  members,
  activeMemberId,
  onSelectMember,
  assignments,
  mealPlan,
  mealAttendances,
  presence,
  recipes,
  onToggleChoreComplete,
}) => {
  const member = members.find((m) => m.id === activeMemberId) || members[0];

  const jsDay = new Date().getDay();
  const dayIndex = (jsDay + 6) % 7;
  const currentDayOfWeek = DAYS_OF_WEEK[dayIndex];

  // My chores for the whole week
  const myChores = assignments.filter((a) => a.memberId === member.id);
  const myTodayChores = myChores.filter((a) => a.dayOfWeek === currentDayOfWeek);
  const myPendingChores = myChores.filter((a) => !a.completed);
  const myCompletedChores = myChores.filter((a) => a.completed);

  // My cooking assignments
  const myCookingTasks = mealPlan.filter((p) => p.cookMemberId === member.id);

  // My meal attendance
  const myAttendances = mealAttendances.filter((a) => a.memberId === member.id);

  const getRecipe = (id: string) => recipes.find((r) => r.id === id);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-7 space-y-7 text-slate-800">
      {/* Title & Member Selector */}
      <div className="border-b border-[#e9e9e7] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#f7f7f5] border border-[#e2e2e0] flex items-center justify-center text-2xl shadow-2xs">
            {member.avatarEmoji || '👤'}
          </div>
          <div>
            <h1 className="text-2xl font-bold font-serif text-slate-900">
              Saját Nézet: {member.name}
            </h1>
            <p className="text-xs text-slate-500">
              Csak a saját feladataid, főzési beosztásod és heti étkezéseid
            </p>
          </div>
        </div>

        {/* Member dropdown */}
        <div className="flex items-center gap-2 bg-[#f1f1ef] p-1 rounded-md border border-[#e2e2e0] text-xs">
          <span className="text-slate-500 font-medium px-2">Családtag:</span>
          <select
            value={member.id}
            onChange={(e) => onSelectMember(e.target.value)}
            className="bg-white px-3 py-1 rounded font-bold text-slate-800 text-xs shadow-2xs border border-[#d8d8d6] focus:outline-none cursor-pointer"
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} {m.canCook ? '(Főzhet 🍳)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 1. Mai feladataim (Focus) */}
      <div className="bg-white rounded-lg border border-[#e9e9e7] p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#f1f1ef] pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-lg">🧹</span>
            <h3 className="text-sm font-bold text-slate-900">
              Mai Házimunkám ({currentDayOfWeek})
            </h3>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
            {myTodayChores.filter((c) => !c.completed).length} függőben
          </span>
        </div>

        {myTodayChores.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center">
            Mára nincsenek neked kiosztott házimunkák.
          </p>
        ) : (
          <div className="space-y-2">
            {myTodayChores.map((chore) => (
              <div
                key={chore.id}
                onClick={() => onToggleChoreComplete(chore.id)}
                className={`p-3 rounded-md border flex items-center justify-between text-xs cursor-pointer transition-all ${
                  chore.completed
                    ? 'bg-slate-50/70 border-slate-200 text-slate-400 line-through'
                    : 'bg-white border-[#e9e9e7] hover:border-emerald-300 text-slate-900 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {chore.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-300 hover:text-emerald-500 shrink-0" />
                  )}
                  <span className="font-semibold">{chore.choreTitle}</span>
                  <span className="text-[11px] text-slate-400">({chore.roomArea})</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Határidő: {chore.deadline} • {chore.estimatedMinutes}p
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Heti házimunkám (Teljes hét) */}
      <div className="bg-white rounded-lg border border-[#e9e9e7] p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#f1f1ef] pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-lg">📋</span>
            <h3 className="text-sm font-bold text-slate-900">
              Összes Heti Házimunkám ({myCompletedChores.length} / {myChores.length} kész)
            </h3>
          </div>
        </div>

        {myPendingChores.length === 0 ? (
          <p className="text-xs text-emerald-700 py-3 text-center font-medium bg-emerald-50 rounded">
            ✨ Az összes heti feladatodat teljesítetted!
          </p>
        ) : (
          <div className="space-y-2">
            {myPendingChores.map((chore) => (
              <div
                key={chore.id}
                onClick={() => onToggleChoreComplete(chore.id)}
                className="p-2.5 rounded-md border border-[#e9e9e7] bg-white hover:border-emerald-300 flex items-center justify-between text-xs cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Circle className="w-4 h-4 text-slate-300 hover:text-emerald-500 shrink-0" />
                  <span className="font-semibold text-slate-800 truncate">{chore.choreTitle}</span>
                  <span className="text-[10px] text-slate-400">({chore.roomArea})</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 text-[11px] text-slate-500">
                  <span className="font-mono bg-[#f7f7f5] px-2 py-0.5 rounded">
                    {chore.dayOfWeek}
                  </span>
                  <span>{chore.estimatedMinutes} perc</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Főzési feladataim (ha tud főzni) */}
      <div className="bg-white rounded-lg border border-[#e9e9e7] p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#f1f1ef] pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-lg">👩‍🍳</span>
            <h3 className="text-sm font-bold text-slate-900">
              Főzési Beosztásom ({myCookingTasks.length} alkalom ezen a héten)
            </h3>
          </div>
        </div>

        {myCookingTasks.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center">
            {member.canCook
              ? 'Ezen a héten nem vagy beosztva főzésre.'
              : 'Nincs beállítva főzési jogosultság a profilodban.'}
          </p>
        ) : (
          <div className="space-y-2.5">
            {myCookingTasks.map((task) => {
              const recipe = getRecipe(task.recipeId);
              return (
                <div
                  key={task.id}
                  className="p-3 rounded-lg border border-[#efefed] bg-[#fbfbfa] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 font-mono">{task.dayOfWeek}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                        {task.mealType === 'ebéd' ? '🍱 Elviteles ebéd' : '🍽️ Vacsora'}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5">
                      {recipe ? recipe.name : 'Recept'}
                    </p>
                  </div>

                  <div className="text-right text-[11px] text-slate-500">
                    <p className="font-mono font-medium text-amber-800">
                      Határidő: {task.deadlineTime}
                    </p>
                    <p>Étkezők: {task.eaterMemberIds.length} fő</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Étkezéseim ezen a héten */}
      <div className="bg-white rounded-lg border border-[#e9e9e7] p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#f1f1ef] pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-lg">🍱</span>
            <h3 className="text-sm font-bold text-slate-900">
              Étkezéseim ezen a héten (Kérek ebédet / vacsorát)
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {DAYS_OF_WEEK.map((d) => {
            const att = myAttendances.find((a) => a.dayOfWeek === d);
            return (
              <div key={d} className="p-2.5 rounded border border-[#efefed] bg-[#fbfbfa] text-center text-xs space-y-1">
                <span className="font-bold text-slate-800 block text-[11px]">{d}</span>
                <span className={`block text-[10px] py-0.5 rounded ${att?.wantsLunch ? 'bg-amber-100 text-amber-800 font-bold' : 'text-slate-400'}`}>
                  🍱 Ebéd: {att?.wantsLunch ? 'Kér' : 'Nem'}
                </span>
                <span className={`block text-[10px] py-0.5 rounded ${att?.wantsDinner ? 'bg-indigo-100 text-indigo-800 font-bold' : 'text-slate-400'}`}>
                  🍽️ Vacsi: {att?.wantsDinner ? 'Kér' : 'Nem'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
