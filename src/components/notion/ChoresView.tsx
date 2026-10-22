import React, { useState } from 'react';
import {
  DayOfWeek,
  DAYS_OF_WEEK,
  FamilyMember,
  ChoreDefinition,
  ChoreAssignment,
  MemberDailyCapacity,
} from '../../types/notion.ts';
import { ChoreDefModal } from './ChoreDefModal.tsx';
import { ChoreAssignmentModal } from './ChoreAssignmentModal.tsx';
import {
  CheckSquare,
  Wand2,
  Clock,
  CheckCircle2,
  Circle,
  RotateCw,
  Users,
  Sliders,
  Calendar,
  Layers,
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  Search,
  Filter,
} from 'lucide-react';

interface ChoresViewProps {
  choreDefs: ChoreDefinition[];
  assignments: ChoreAssignment[];
  members: FamilyMember[];
  capacities: MemberDailyCapacity[];
  onToggleAssignmentComplete: (id: string) => void;
  onRunFairDistribution: () => void;
  onUpdateCapacity: (memberId: string, day: DayOfWeek, minutes: number) => void;
  onReassignChore: (assignmentId: string, newMemberId: string) => void;
  onAddChoreDef?: (def: ChoreDefinition) => void;
  onUpdateChoreDef?: (id: string, updates: Partial<ChoreDefinition>) => void;
  onDeleteChoreDef?: (id: string) => void;
  onAddAssignment?: (asgn: ChoreAssignment) => void;
  onUpdateAssignment?: (id: string, updates: Partial<ChoreAssignment>) => void;
  onDeleteAssignment?: (id: string) => void;
}

export const ChoresView: React.FC<ChoresViewProps> = ({
  choreDefs,
  assignments,
  members,
  capacities,
  onToggleAssignmentComplete,
  onRunFairDistribution,
  onUpdateCapacity,
  onReassignChore,
  onAddChoreDef,
  onUpdateChoreDef,
  onDeleteChoreDef,
  onAddAssignment,
  onUpdateAssignment,
  onDeleteAssignment,
}) => {
  const [activeTab, setActiveTab] = useState<'assignments' | 'capacity' | 'catalog'>('assignments');
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('all');
  const [justDistributedToast, setJustDistributedToast] = useState(false);

  // Catalog filters & search
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogFreqFilter, setCatalogFreqFilter] = useState('all');

  // Modals state
  const [isChoreDefModalOpen, setIsChoreDefModalOpen] = useState(false);
  const [editingChoreDef, setEditingChoreDef] = useState<ChoreDefinition | null>(null);

  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<ChoreAssignment | null>(null);

  const handleRunAlgorithm = () => {
    onRunFairDistribution();
    setJustDistributedToast(true);
    setTimeout(() => setJustDistributedToast(false), 4000);
  };

  const getCapacity = (memberId: string, day: DayOfWeek): number => {
    const rec = capacities.find((c) => c.memberId === memberId && c.dayOfWeek === day);
    return rec ? rec.availableMinutes : 30;
  };

  const filteredAssignments = selectedDayFilter === 'all'
    ? assignments
    : assignments.filter((a) => a.dayOfWeek === selectedDayFilter);

  const filteredCatalog = choreDefs.filter((def) => {
    const matchesSearch =
      def.title.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      def.roomArea.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      (def.note && def.note.toLowerCase().includes(catalogSearch.toLowerCase()));
    const matchesFreq = catalogFreqFilter === 'all' || def.frequency === catalogFreqFilter;
    return matchesSearch && matchesFreq;
  });

  const completedCount = assignments.filter((a) => a.completed).length;
  const totalCount = assignments.length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-7 space-y-6 text-slate-800">
      {/* Title */}
      <div className="border-b border-[#e9e9e7] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-3xl mb-1">🧹</div>
          <h1 className="text-2xl font-bold font-serif text-slate-900">
            Házimunkák & Igazságos Beosztás
          </h1>
          <p className="text-xs text-slate-500">
            Adatbázisok: Chores & Chore Assignments • Jelenlét és időkapacitás alapján, pontozás nélkül!
          </p>
        </div>

        <div className="flex items-center gap-2 self-start flex-wrap">
          {onAddAssignment && (
            <button
              onClick={() => {
                setEditingAssignment(null);
                setIsAssignmentModalOpen(true);
              }}
              className="px-3 py-2 rounded-md bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-800 text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Feladat Kiosztása</span>
            </button>
          )}

          <button
            onClick={handleRunAlgorithm}
            className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition-all active:scale-95"
          >
            <Wand2 className="w-4 h-4" />
            <span>⚖️ Igazságos Beosztás Újraszámolása</span>
          </button>
        </div>
      </div>

      {justDistributedToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            A heti házimunka-beosztás sikeresen elkészült! A feladatok a valós otthonlét és szabadidő szerint lettek igazságosan szétosztva a 7 családtag között.
          </span>
        </div>
      )}

      {/* Notion Callout Box: No Points Principle */}
      <div className="p-3.5 bg-[#f7f6f3] border border-[#e8e7e3] rounded-lg text-xs space-y-1">
        <p className="font-bold text-slate-800">⚖️ Igazságos beosztás elve (Pontozás NÉLKÜL):</p>
        <p className="text-slate-600 leading-relaxed">
          1. <strong>Otthonlét:</strong> Csak az kap feladatot, aki aznap otthon van. • 2. <strong>Időkapacitás:</strong> Figyelembe veszi, kinek mennyi ideje van az adott napon. • 3. <strong>Terhelés kiegyenlítés:</strong> A feladatok egyenletesen oszlanak el a hét során. • 4. <strong>Rotáció:</strong> Mindenki kiveszi a részét a különböző helyiségek teendőiből.
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center justify-between border-b border-[#e9e9e7] text-xs">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('assignments')}
            className={`pb-2.5 px-3 font-semibold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'assignments'
                ? 'border-slate-800 text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            📋 Heti Beosztás ({completedCount}/{totalCount} kész)
          </button>
          <button
            onClick={() => setActiveTab('capacity')}
            className={`pb-2.5 px-3 font-semibold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'capacity'
                ? 'border-slate-800 text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            ⏱️ Napi Időkapacitás Beállítása
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`pb-2.5 px-3 font-semibold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'catalog'
                ? 'border-slate-800 text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            🗂️ Feladatok Katalógusa ({choreDefs.length} tétel)
          </button>
        </div>
      </div>

      {/* TAB 1: Assignments */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          {/* Day Filter */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1 bg-[#efefed] p-1 rounded-md border border-[#e2e2e0] overflow-x-auto">
              <button
                onClick={() => setSelectedDayFilter('all')}
                className={`px-3 py-1 rounded font-semibold cursor-pointer ${
                  selectedDayFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Egész hét ({assignments.length})
              </button>
              {DAYS_OF_WEEK.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDayFilter(d)}
                  className={`px-2.5 py-1 rounded font-medium cursor-pointer ${
                    selectedDayFilter === d ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            {onAddAssignment && (
              <button
                onClick={() => {
                  setEditingAssignment(null);
                  setIsAssignmentModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Új feladat a héthez</span>
              </button>
            )}
          </div>

          {/* Assignments List */}
          <div className="bg-white rounded-lg border border-[#e9e9e7] divide-y divide-[#efefed] shadow-2xs">
            {filteredAssignments.map((asgn) => {
              const assignedMember = members.find((m) => m.id === asgn.memberId);

              return (
                <div
                  key={asgn.id}
                  className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#fafaf9] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => onToggleAssignmentComplete(asgn.id)}
                      className="cursor-pointer text-slate-400 hover:text-emerald-600 transition-colors shrink-0"
                    >
                      {asgn.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300" />
                      )}
                    </button>

                    <div className="truncate">
                      <span className={`font-semibold ${asgn.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {asgn.choreTitle}
                      </span>
                      <span className="ml-2 text-[10px] text-slate-400 font-mono">
                        ({asgn.roomArea} • {asgn.estimatedMinutes} perc)
                      </span>
                      {asgn.note && (
                        <span className="block text-[10px] text-slate-400 italic">{asgn.note}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <span className="text-[11px] font-mono text-slate-500 bg-[#f7f7f5] px-2 py-0.5 rounded">
                      {asgn.dayOfWeek} • {asgn.deadline}
                    </span>

                    {/* Member reassign dropdown */}
                    <select
                      value={asgn.memberId}
                      onChange={(e) => onReassignChore(asgn.id, e.target.value)}
                      className="px-2 py-1 bg-white border border-[#d8d8d6] rounded font-semibold text-slate-800 text-xs focus:outline-none cursor-pointer"
                    >
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>

                    {/* Edit & Delete if provided */}
                    {onUpdateAssignment && (
                      <button
                        onClick={() => {
                          setEditingAssignment(asgn);
                          setIsAssignmentModalOpen(true);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100 cursor-pointer"
                        title="Beosztás szerkesztése"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {onDeleteAssignment && (
                      <button
                        onClick={() => {
                          if (confirm(`Biztosan törlöd a "${asgn.choreTitle}" feladatot?`)) {
                            onDeleteAssignment(asgn.id);
                          }
                        }}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100 cursor-pointer"
                        title="Beosztás törlése"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredAssignments.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400">
                Nincs megjeleníthető feladat az adott napon.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Capacity Matrix */}
      {activeTab === 'capacity' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Itt állíthatod be, hogy az adott héten melyik napon hány perc szabadidővel rendelkezik egy-egy családtag házimunkára. Ha valaki 0 percet ad meg vagy nincs otthon, arra a napra nem kap feladatot.
          </p>

          <div className="overflow-x-auto rounded-lg border border-[#e9e9e7] bg-white shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#f7f7f5] border-b border-[#e9e9e7] text-slate-600 font-semibold">
                  <th className="p-3 border-r border-[#e9e9e7] w-36">Családtag</th>
                  {DAYS_OF_WEEK.map((d) => (
                    <th key={d} className="p-2.5 text-center border-r border-[#e9e9e7] last:border-r-0 min-w-[95px]">
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#efefed]">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-[#fafaf9]">
                    <td className="p-3 border-r border-[#e9e9e7] font-bold text-slate-900 bg-[#fbfbfa]">
                      <div className="flex items-center gap-2">
                        <span>{m.avatarEmoji || '👤'}</span>
                        <span>{m.name}</span>
                      </div>
                    </td>
                    {DAYS_OF_WEEK.map((d) => {
                      const mins = getCapacity(m.id, d);
                      return (
                        <td key={d} className="p-2 text-center border-r border-[#e9e9e7] last:border-r-0">
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              min={0}
                              max={300}
                              step={15}
                              value={mins}
                              onChange={(e) =>
                                onUpdateCapacity(m.id, d, parseInt(e.target.value) || 0)
                              }
                              className="w-14 px-1.5 py-1 text-center font-mono text-xs border border-[#d8d8d6] rounded bg-white focus:outline-none"
                            />
                            <span className="text-[10px] text-slate-400">p</span>
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
      )}

      {/* TAB 3: Chore Definitions Catalog */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#fbfbfa] p-3 rounded-lg border border-[#e9e9e7]">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                placeholder="Keresés a katalógusban..."
                className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded bg-white focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={catalogFreqFilter}
                onChange={(e) => setCatalogFreqFilter(e.target.value)}
                className="px-2.5 py-1 text-xs border border-slate-300 rounded bg-white cursor-pointer font-medium"
              >
                <option value="all">Minden gyakoriság</option>
                <option value="napi">Napi</option>
                <option value="heti">Heti</option>
                <option value="havi">Havi</option>
                <option value="2-3 havi">2-3 havi</option>
                <option value="szezonális">Szezonális</option>
              </select>

              {onAddChoreDef && (
                <button
                  onClick={() => {
                    setEditingChoreDef(null);
                    setIsChoreDefModalOpen(true);
                  }}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Új feladat hozzáadása</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredCatalog.map((def) => (
              <div
                key={def.id}
                className={`p-3.5 rounded-lg border bg-white shadow-2xs space-y-1.5 transition-all ${
                  def.isActive ? 'border-[#e9e9e7]' : 'border-slate-200 bg-slate-50/70 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">{def.title}</span>
                    {!def.isActive && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-rose-100 text-rose-700 font-bold">
                        Inaktív
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        def.frequency === 'napi'
                          ? 'bg-amber-100 text-amber-800'
                          : def.frequency === 'heti'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {def.frequency}
                    </span>

                    {/* Edit & Delete actions */}
                    {onUpdateChoreDef && (
                      <button
                        onClick={() => {
                          setEditingChoreDef(def);
                          setIsChoreDefModalOpen(true);
                        }}
                        className="p-1 text-slate-400 hover:text-indigo-600 cursor-pointer"
                        title="Feladat szerkesztése"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {onDeleteChoreDef && (
                      <button
                        onClick={() => {
                          if (confirm(`Biztosan törlöd a "${def.title}" feladatot a katalógusból?`)) {
                            onDeleteChoreDef(def.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                        title="Feladat törlése"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    Helyiség: <strong>{def.roomArea}</strong>
                  </span>
                  <span className="font-mono">Becsült idő: {def.estimatedMinutes} perc</span>
                </div>

                {def.note && (
                  <p className="text-[10px] text-slate-400 italic pt-0.5">{def.note}</p>
                )}
              </div>
            ))}
          </div>

          {filteredCatalog.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400 bg-white border border-slate-200 rounded-lg">
              Nincs találat a keresési feltételeknek megfelelően.
            </div>
          )}
        </div>
      )}

      {/* Shared Modals */}
      {onAddChoreDef && onUpdateChoreDef && (
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
            } else {
              onAddChoreDef(savedDef);
            }
          }}
        />
      )}

      {onAddAssignment && onUpdateAssignment && (
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
            } else {
              onAddAssignment(savedAsgn);
            }
          }}
        />
      )}
    </div>
  );
};
