import React from 'react';
import {
  DayOfWeek,
  DAYS_OF_WEEK,
  FamilyMember,
  PresenceRecord,
  HomePresenceStatus,
} from '../../types/notion.ts';
import { MapPin, Moon, Sun, Clock, RotateCcw, Check, X } from 'lucide-react';

interface PresenceMatrixViewProps {
  members: FamilyMember[];
  presence: PresenceRecord[];
  onUpdatePresence: (
    memberId: string,
    day: DayOfWeek,
    field: 'isHome' | 'sleepsHome' | 'arrival' | 'departure' | 'note',
    value: any
  ) => void;
  onResetDefaults: () => void;
}

export const PresenceMatrixView: React.FC<PresenceMatrixViewProps> = ({
  members,
  presence,
  onUpdatePresence,
  onResetDefaults,
}) => {
  const getRecord = (memberId: string, day: DayOfWeek): PresenceRecord | undefined => {
    return presence.find((p) => p.memberId === memberId && p.dayOfWeek === day);
  };

  const cyclePresenceStatus = (current: HomePresenceStatus): HomePresenceStatus => {
    if (current === 'otthon') return 'csak_este';
    if (current === 'csak_este') return 'nincs_otthon';
    return 'otthon';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-7 space-y-6 text-slate-800">
      {/* Title */}
      <div className="border-b border-[#e9e9e7] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-3xl mb-1">📍</div>
          <h1 className="text-2xl font-bold font-serif text-slate-900">Otthonlét Mátrix</h1>
          <p className="text-xs text-slate-500">
            Adatbázis: Presence / Otthonlét • Családtagok heti jelenlétének és ott alvásának beállítása
          </p>
        </div>

        <button
          onClick={onResetDefaults}
          className="px-3 py-1.5 rounded-md border border-[#e2e2e0] bg-[#fbfbfa] hover:bg-[#efefed] text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs self-start"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          Alapértelmezett minta betöltése
        </button>
      </div>

      {/* Notion Callout Box */}
      <div className="p-3.5 bg-[#f7f6f3] border border-[#e8e7e3] rounded-lg text-xs space-y-1">
        <p className="font-bold text-slate-800">💡 Hogyan működik?</p>
        <p className="text-slate-600">
          Kattints az <strong>Otthon van?</strong> állapotra a váltáshoz (Otthon van ➔ Csak este ➔ Nincs otthon), és a <strong>Hold ikonra</strong> az ott alvás jelöléséhez. Az aktuális heti adatok határozzák meg a házimunkák kiosztását!
        </p>
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto rounded-lg border border-[#e9e9e7] bg-white shadow-2xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#f7f7f5] border-b border-[#e9e9e7] text-slate-600 font-semibold">
              <th className="p-3 border-r border-[#e9e9e7] w-36">Családtag</th>
              {DAYS_OF_WEEK.map((day) => (
                <th key={day} className="p-2.5 text-center border-r border-[#e9e9e7] last:border-r-0 min-w-[110px]">
                  {day}
                </th>
              ))}
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
                        {member.canCook ? 'Tud főzni' : 'Nem főz'}
                      </p>
                    </div>
                  </div>
                </td>

                {DAYS_OF_WEEK.map((day) => {
                  const rec = getRecord(member.id, day);
                  const isHome = rec ? rec.isHome : 'otthon';
                  const sleepsHome = rec ? rec.sleepsHome : true;

                  return (
                    <td
                      key={day}
                      className="p-2 text-center border-r border-[#e9e9e7] last:border-r-0 align-top"
                    >
                      <div className="space-y-1.5 flex flex-col items-center">
                        {/* Toggle Home Status */}
                        <button
                          onClick={() =>
                            onUpdatePresence(
                              member.id,
                              day,
                              'isHome',
                              cyclePresenceStatus(isHome)
                            )
                          }
                          className={`w-full py-1 px-1.5 rounded text-[11px] font-semibold border cursor-pointer transition-all ${
                            isHome === 'otthon'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                              : isHome === 'csak_este'
                              ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                              : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                          }`}
                          title="Kattints az állapot váltásához"
                        >
                          {isHome === 'otthon'
                            ? 'Otthon'
                            : isHome === 'csak_este'
                            ? 'Csak este'
                            : 'Nincs'}
                        </button>

                        {/* Toggle Sleeps Home */}
                        <button
                          onClick={() =>
                            onUpdatePresence(member.id, day, 'sleepsHome', !sleepsHome)
                          }
                          className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded cursor-pointer ${
                            sleepsHome
                              ? 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100'
                              : 'text-slate-400 bg-slate-50 hover:bg-slate-100'
                          }`}
                          title={sleepsHome ? 'Itt alszik (kattints a váltáshoz)' : 'Nem alszik itt'}
                        >
                          <Moon className="w-2.5 h-2.5" />
                          <span>{sleepsHome ? 'Itt alszik' : 'Nem alszik'}</span>
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
