import React, { useState, useEffect } from 'react';
import {
  ChoreAssignment,
  ChoreDefinition,
  FamilyMember,
  DayOfWeek,
  DAYS_OF_WEEK,
} from '../../types/notion.ts';
import { getCurrentWeekDates } from '../../utils/fairDistribution.ts';
import { X, Check, Calendar, User, Clock, AlertCircle } from 'lucide-react';

interface ChoreAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (assignment: ChoreAssignment) => void;
  members: FamilyMember[];
  choreDefs: ChoreDefinition[];
  initialAssignment?: ChoreAssignment | null;
}

export const ChoreAssignmentModal: React.FC<ChoreAssignmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  members,
  choreDefs,
  initialAssignment,
}) => {
  const [selectedChoreDefId, setSelectedChoreDefId] = useState<string>('custom');
  const [choreTitle, setChoreTitle] = useState('');
  const [roomArea, setRoomArea] = useState('Konyha');
  const [memberId, setMemberId] = useState<string>(members[0]?.id || 'mem-csabi');
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>('Hétfő');
  const [deadline, setDeadline] = useState('19:00');
  const [estimatedMinutes, setEstimatedMinutes] = useState(15);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const weekDates = getCurrentWeekDates();

  useEffect(() => {
    if (initialAssignment) {
      const match = choreDefs.find((d) => d.id === initialAssignment.choreId);
      if (match) {
        setSelectedChoreDefId(match.id);
      } else {
        setSelectedChoreDefId('custom');
      }
      setChoreTitle(initialAssignment.choreTitle);
      setRoomArea(initialAssignment.roomArea);
      setMemberId(initialAssignment.memberId);
      setDayOfWeek(initialAssignment.dayOfWeek);
      setDeadline(initialAssignment.deadline);
      setEstimatedMinutes(initialAssignment.estimatedMinutes);
      setNote(initialAssignment.note || '');
    } else {
      setSelectedChoreDefId('custom');
      setChoreTitle('');
      setRoomArea('Konyha');
      setMemberId(members[0]?.id || 'mem-csabi');
      setDayOfWeek('Hétfő');
      setDeadline('19:00');
      setEstimatedMinutes(15);
      setNote('');
    }
    setError(null);
  }, [initialAssignment, isOpen]);

  if (!isOpen) return null;

  const handleChoreDefSelect = (defId: string) => {
    setSelectedChoreDefId(defId);
    if (defId === 'custom') {
      return;
    }
    const def = choreDefs.find((d) => d.id === defId);
    if (def) {
      setChoreTitle(def.title);
      setRoomArea(def.roomArea);
      setEstimatedMinutes(def.estimatedMinutes);
      if (def.note) setNote(def.note);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!choreTitle.trim()) {
      setError('Kérlek add meg a feladat megnevezését!');
      return;
    }
    if (!memberId) {
      setError('Válassz ki egy felelős családtagot!');
      return;
    }

    const dayObj = weekDates.find((w) => w.day === dayOfWeek);
    const dateStr = dayObj ? dayObj.dateStr : new Date().toISOString().split('T')[0];

    const assignment: ChoreAssignment = {
      id: initialAssignment ? initialAssignment.id : `asgn-custom-${Date.now()}`,
      choreId: selectedChoreDefId !== 'custom' ? selectedChoreDefId : `chore-adhoc-${Date.now()}`,
      choreTitle: choreTitle.trim(),
      roomArea: roomArea || 'Közös terek',
      memberId,
      date: dateStr,
      dayOfWeek,
      deadline: deadline.trim() || '19:00',
      estimatedMinutes: Math.max(5, estimatedMinutes),
      completed: initialAssignment ? initialAssignment.completed : false,
      completedAt: initialAssignment ? initialAssignment.completedAt : undefined,
      note: note.trim() || undefined,
    };

    onSave(assignment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-lg shadow-2xs">
              📋
            </div>
            <div>
              <h3 className="font-bold text-base">
                {initialAssignment ? 'Házimunka Beosztás Módosítása' : 'Új Feladat Kiosztása a Héten'}
              </h3>
              <p className="text-[11px] text-slate-300">
                Rendeld hozzá egy családtaghoz adott napra és időpontra
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-slate-800 overflow-y-auto max-h-[80vh]">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick select from catalog */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Válassz a katalógusból (vagy írj be egyedit)
            </label>
            <select
              value={selectedChoreDefId}
              onChange={(e) => handleChoreDefSelect(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
            >
              <option value="custom">✏️ Egyedi új feladat megadása...</option>
              <optgroup label="Házimunka Katalógus:">
                {choreDefs.map((def) => (
                  <option key={def.id} value={def.id}>
                    {def.title} ({def.roomArea} • {def.estimatedMinutes} perc • {def.frequency})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Feladat megnevezése *
            </label>
            <input
              type="text"
              value={choreTitle}
              onChange={(e) => setChoreTitle(e.target.value)}
              placeholder="pl. Mosogatógép elindítása..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Felelős Családtag *
              </label>
              <select
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer font-bold text-slate-900"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.avatarEmoji || '👤'} {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nap a héten *
              </label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value as DayOfWeek)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer font-semibold"
              >
                {DAYS_OF_WEEK.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Határidő / Időpont
              </label>
              <input
                type="text"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                placeholder="pl. 19:00, reggel, vacsora előtt"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Helyiség / Terület
              </label>
              <input
                type="text"
                value={roomArea}
                onChange={(e) => setRoomArea(e.target.value)}
                placeholder="pl. Konyha, Fürdő..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">
                Becsült idő: <span className="text-emerald-600 font-bold">{estimatedMinutes} perc</span>
              </label>
            </div>
            <input
              type="range"
              min={5}
              max={90}
              step={5}
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(parseInt(e.target.value) || 15)}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Megjegyzés / Részletek (opcionális)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="pl. Csak ha nem esik az eső..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer transition-colors"
            >
              Mégse
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs hover:shadow cursor-pointer transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{initialAssignment ? 'Mentés' : 'Kiosztás a Hétre'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

