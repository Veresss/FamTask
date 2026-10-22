import React from 'react';
import {
  DayOfWeek,
  DAYS_OF_WEEK,
  FamilyMember,
  MealAttendanceRecord,
} from '../../types/notion.ts';
import { calculateDailyMealCounts } from '../../utils/fairDistribution.ts';
import { Utensils, RotateCcw, Check, X, Users, AlertCircle } from 'lucide-react';

interface MealAttendanceViewProps {
  members: FamilyMember[];
  mealAttendances: MealAttendanceRecord[];
  onToggleMeal: (memberId: string, day: DayOfWeek, mealType: 'wantsLunch' | 'wantsDinner') => void;
  onResetDefaults: () => void;
}

export const MealAttendanceView: React.FC<MealAttendanceViewProps> = ({
  members,
  mealAttendances,
  onToggleMeal,
  onResetDefaults,
}) => {
  const getRecord = (memberId: string, day: DayOfWeek): MealAttendanceRecord | undefined => {
    return mealAttendances.find((a) => a.memberId === memberId && a.dayOfWeek === day);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-7 space-y-6 text-slate-800">
      {/* Title */}
      <div className="border-b border-[#e9e9e7] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-3xl mb-1">🍱</div>
          <h1 className="text-2xl font-bold font-serif text-slate-900">
            Étkezési Igények (Ebéd & Vacsora)
          </h1>
          <p className="text-xs text-slate-500">
            Adatbázis: Meal Attendance • Csak Ebéd és Vacsora (Reggeli nincs) • Automatikus adagszámítás
          </p>
        </div>

        <button
          onClick={onResetDefaults}
          className="px-3 py-1.5 rounded-md border border-[#e2e2e0] bg-[#fbfbfa] hover:bg-[#efefed] text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs self-start"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          Alapértelmezett étkezési minták
        </button>
      </div>

      {/* Notion Callout Box */}
      <div className="p-3.5 bg-[#f7f6f3] border border-[#e8e7e3] rounded-lg text-xs space-y-1">
        <p className="font-bold text-slate-800">🍱 Elviteles ebéd és meleg vacsora logika:</p>
        <p className="text-slate-600">
          A rendszer soha nem feltételezi, hogy mindenki otthon eszik. Kattints a pipákra az étkezési igény módosításához. A fejlécekben azonnal látszik, hány főre kell főzni!
        </p>
      </div>

      {/* Daily Summary Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {DAYS_OF_WEEK.map((day) => {
          const counts = calculateDailyMealCounts(mealAttendances, day);
          return (
            <div key={day} className="p-2.5 rounded-lg border border-[#e9e9e7] bg-white text-center shadow-2xs space-y-1">
              <span className="text-xs font-bold text-slate-900 block">{day}</span>
              <div className="text-[11px] font-mono text-amber-800 bg-amber-50 rounded py-0.5 border border-amber-200/50">
                🍱 Ebéd: <strong>{counts.lunchCount} fő</strong>
              </div>
              <div className="text-[11px] font-mono text-indigo-800 bg-indigo-50 rounded py-0.5 border border-indigo-200/50">
                🍽️ Vacsi: <strong>{counts.dinnerCount} fő</strong>
              </div>
            </div>
          );
        })}
      </div>

      {/* Attendance Matrix Table */}
      <div className="overflow-x-auto rounded-lg border border-[#e9e9e7] bg-white shadow-2xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#f7f7f5] border-b border-[#e9e9e7] text-slate-600 font-semibold">
              <th className="p-3 border-r border-[#e9e9e7] w-36">Családtag</th>
              {DAYS_OF_WEEK.map((day) => {
                const counts = calculateDailyMealCounts(mealAttendances, day);
                return (
                  <th key={day} className="p-2 text-center border-r border-[#e9e9e7] last:border-r-0 min-w-[125px]">
                    <div>{day}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5 font-normal">
                      🍱 {counts.lunchCount} • 🍽️ {counts.dinnerCount}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#efefed]">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-[#fafaf9] transition-colors">
                <td className="p-3 border-r border-[#e9e9e7] font-bold text-slate-900 bg-[#fbfbfa]">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{member.avatarEmoji || '👤'}</span>
                    <div>
                      <p className="leading-tight">{member.name}</p>
                      <p className="text-[10px] text-slate-400 font-normal">
                        {member.note?.split('•')[0] || ''}
                      </p>
                    </div>
                  </div>
                </td>

                {DAYS_OF_WEEK.map((day) => {
                  const rec = getRecord(member.id, day);
                  const wantsLunch = rec ? rec.wantsLunch : false;
                  const wantsDinner = rec ? rec.wantsDinner : false;

                  return (
                    <td
                      key={day}
                      className="p-2 border-r border-[#e9e9e7] last:border-r-0 text-center"
                    >
                      <div className="flex flex-col gap-1.5 items-center">
                        {/* Lunch toggle button */}
                        <button
                          onClick={() => onToggleMeal(member.id, day, 'wantsLunch')}
                          className={`w-full py-1 px-1.5 rounded text-[11px] font-semibold border flex items-center justify-between cursor-pointer transition-colors ${
                            wantsLunch
                              ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                              : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                          }`}
                          title="Ebéd igénylése"
                        >
                          <span>🍱 Ebéd</span>
                          {wantsLunch ? (
                            <Check className="w-3 h-3 text-amber-700 stroke-[3]" />
                          ) : (
                            <X className="w-3 h-3 text-slate-300" />
                          )}
                        </button>

                        {/* Dinner toggle button */}
                        <button
                          onClick={() => onToggleMeal(member.id, day, 'wantsDinner')}
                          className={`w-full py-1 px-1.5 rounded text-[11px] font-semibold border flex items-center justify-between cursor-pointer transition-colors ${
                            wantsDinner
                              ? 'bg-indigo-50 text-indigo-900 border-indigo-300 hover:bg-indigo-100'
                              : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                          }`}
                          title="Vacsora igénylése"
                        >
                          <span>🍽️ Vacsi</span>
                          {wantsDinner ? (
                            <Check className="w-3 h-3 text-indigo-700 stroke-[3]" />
                          ) : (
                            <X className="w-3 h-3 text-slate-300" />
                          )}
                        </button>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
