import React, { useState } from 'react';
import { FamilyMember, Chore, WeeklyEvaluation } from '../types/index.ts';
import { calculateWeeklyEvaluation, getWeekId, isSunday } from '../utils/rules.ts';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Award,
  Calendar,
  CheckCircle2,
  BookmarkCheck,
  History,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Flame,
  X,
} from 'lucide-react';

interface SundayEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: FamilyMember[];
  chores: Chore[];
  evaluations: WeeklyEvaluation[];
  onSaveEvaluation: (evaluation: WeeklyEvaluation) => void;
}

export const SundayEvaluationModal: React.FC<SundayEvaluationModalProps> = ({
  isOpen,
  onClose,
  members,
  chores,
  evaluations,
  onSaveEvaluation,
}) => {
  const [activeTab, setActiveTab] = useState<'current' | 'archive'>('current');
  const [selectedArchiveId, setSelectedArchiveId] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  if (!isOpen) return null;

  const currentWeekId = getWeekId();
  const todayIsSunday = isSunday();

  // Current live evaluation calculated from chores
  const currentEvaluation = calculateWeeklyEvaluation(currentWeekId, members, chores);

  // Check if current week already has a saved evaluation
  const alreadySaved = evaluations.some((e) => e.weekId === currentWeekId);

  const handleSaveCurrent = () => {
    onSaveEvaluation(currentEvaluation);
    setJustSaved(true);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // silent
    }

    setTimeout(() => setJustSaved(false), 4000);
  };

  const selectedArchive = evaluations.find((e) => e.id === selectedArchiveId) || evaluations[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-xs shadow-inner">
              <Trophy className="w-5 h-5 text-amber-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">Vasárnapi Heti Értékelő</h2>
                {todayIsSunday && (
                  <span className="px-2 py-0.5 rounded-full bg-white/25 text-[11px] font-bold text-amber-50 uppercase tracking-wide animate-pulse">
                    Ma Vasárnap Van! 🌟
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-100">
                Kiadott és elvégzett házimunkák összegzése és elmentett értékelése
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            aria-label="Bezárás"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-6 pt-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('current')}
              className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === 'current'
                  ? 'border-amber-600 text-amber-800'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Aktuális heti összefoglaló ({currentWeekId})
            </button>
            <button
              onClick={() => {
                setActiveTab('archive');
                if (evaluations.length > 0 && !selectedArchiveId) {
                  setSelectedArchiveId(evaluations[0].id);
                }
              }}
              className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === 'archive'
                  ? 'border-amber-600 text-amber-800'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Mentett Vasárnapok Archívuma ({evaluations.length})
            </button>
          </div>

          <div className="text-[11px] text-slate-500 pb-3 hidden sm:block">
            Minden vasárnap összegzi a hét feladatait
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeTab === 'current' ? (
            <div className="space-y-6">
              {/* Overall Family Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 shadow-xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                      Családi Heti Eredmény
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                      <span>{currentEvaluation.overallRate}%</span>
                      <span className="text-sm font-semibold text-slate-600">
                        ({currentEvaluation.totalCompleted} / {currentEvaluation.totalAssigned} feladat elvégezve)
                      </span>
                    </h3>
                    <p className="text-xs text-amber-900 mt-1">{currentEvaluation.celebrationNote}</p>
                  </div>

                  <div className="p-3.5 bg-white/90 rounded-xl border border-amber-200 shadow-xs flex items-center gap-3 shrink-0">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-xl">
                      🏆
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-amber-700 uppercase">A Hét Hőse (MVP)</p>
                      <p className="text-sm font-extrabold text-slate-900">
                        {currentEvaluation.mvpMemberName}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4 w-full h-3 bg-amber-200/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                    style={{ width: `${currentEvaluation.overallRate}%` }}
                  ></div>
                </div>
              </div>

              {/* Individual Members Breakdown */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-600" />
                  Családtagok személyes teljesítménye és kiértékelése
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {currentEvaluation.memberStats.map((stat) => (
                    <div
                      key={stat.memberId}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 shadow-xs transition-all space-y-2.5"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{stat.memberAvatar}</span>
                          <div>
                            <h5 className="text-sm font-bold text-slate-900">{stat.memberName}</h5>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                              {stat.badge}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-lg font-black text-slate-900">
                            {stat.completionRate}%
                          </span>
                          <p className="text-[11px] text-slate-500">
                            {stat.completedCount} / {stat.assignedCount} feladat
                          </p>
                        </div>
                      </div>

                      {/* Mini progress bar */}
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${stat.completionRate}%` }}
                        ></div>
                      </div>

                      <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                        &quot;{stat.summaryNote}&quot;
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                        <span className="flex items-center gap-1 font-medium text-amber-700">
                          <Flame className="w-3.5 h-3.5 text-amber-500" />
                          +{stat.pointsEarned} szerzett pont ezen a héten
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save & Archive Action */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Vasárnapi Értékelés Mentése
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {alreadySaved
                      ? 'Ez a heti értékelés már szerepel a mentett archívumban, de bármikor felülírható a legújabb állással.'
                      : 'Mentsd el ezt a vasárnapi összesítést az archívumba, hogy a család visszanézhesse a fejlődést!'}
                  </p>
                </div>

                <button
                  onClick={handleSaveCurrent}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-2 transition-all shrink-0 active:scale-95"
                >
                  <BookmarkCheck className="w-4 h-4" />
                  {alreadySaved ? 'Értékelés frissítése' : 'Vasárnapi értékelés elmentése'}
                </button>
              </div>

              {justSaved && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>A heti vasárnapi értékelés sikeresen elmentve az archívumba!</span>
                </div>
              )}
            </div>
          ) : (
            /* Archive Tab */
            <div className="space-y-4">
              {evaluations.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <p className="text-sm text-slate-600 font-medium">
                    Még nincs elmentett vasárnapi értékelés.
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Válts az &quot;Aktuális heti összefoglaló&quot; fülre és mentsd el a hét eredményeit!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* List of past weeks */}
                  <div className="space-y-2 md:col-span-1 border-r border-slate-100 pr-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Elmentett hetek ({evaluations.length})
                    </p>
                    {evaluations.map((evalItem) => (
                      <button
                        key={evalItem.id}
                        onClick={() => setSelectedArchiveId(evalItem.id)}
                        className={`w-full text-left p-3 rounded-xl border transition-all ${
                          selectedArchive?.id === evalItem.id
                            ? 'border-amber-600 bg-amber-50/60 shadow-xs font-semibold'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-900 font-bold">{evalItem.title}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                            {evalItem.overallRate}%
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                          <Trophy className="w-3 h-3 text-amber-500" />
                          Hét hőse: {evalItem.mvpMemberName}
                        </p>
                      </button>
                    ))}
                  </div>

                  {/* Selected past week details */}
                  <div className="md:col-span-2 space-y-4">
                    {selectedArchive ? (
                      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                          <div>
                            <h4 className="text-sm font-extrabold text-slate-900">
                              {selectedArchive.title}
                            </h4>
                            <p className="text-xs text-slate-500">
                              Lezárva: {new Date(selectedArchive.evaluatedAt).toLocaleDateString('hu-HU')}
                            </p>
                          </div>
                          <span className="text-xl font-black text-amber-600 bg-white px-3 py-1 rounded-xl border border-amber-200 shadow-xs">
                            {selectedArchive.overallRate}%
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
                          {selectedArchive.celebrationNote}
                        </p>

                        <div className="space-y-2">
                          <p className="text-xs font-bold text-slate-600 uppercase">
                            Családtagok akkori eredményei:
                          </p>
                          <div className="space-y-2">
                            {selectedArchive.memberStats.map((stat) => (
                              <div
                                key={stat.memberId}
                                className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between text-xs"
                              >
                                <div className="flex items-center gap-2">
                                  <span>{stat.memberAvatar}</span>
                                  <div>
                                    <span className="font-bold text-slate-800">{stat.memberName}</span>
                                    <span className="ml-2 text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                      {stat.badge}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="font-extrabold text-slate-900">
                                    {stat.completedCount} / {stat.assignedCount} ({stat.completionRate}%)
                                  </span>
                                  <span className="ml-2 text-amber-600 font-bold">
                                    +{stat.pointsEarned} pont
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">Válassz ki egy hetet a listából!</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {todayIsSunday ? '📅 Ma vasárnap van' : '💡 Vasárnap automatikus összefoglaló jelenik meg'}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Bezárás
          </button>
        </div>
      </div>
    </div>
  );
};
