import React, { useState } from 'react';
import { FamilyMember, Chore, ChoreCategory, ChoreFrequency } from '../types/index.ts';
import { CATEGORIES_META } from '../utils/categories.ts';
import { getWeekId, formatDateYMD } from '../utils/rules.ts';
import { CheckSquare, Calendar, Award, User, Tag, PlusCircle, X } from 'lucide-react';

interface ChoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: FamilyMember[];
  onAddChore: (chore: Omit<Chore, 'id' | 'createdAt' | 'isCompleted' | 'completedAt' | 'completedByMemberId' | 'weekId'>) => void;
  initialMemberId?: string;
}

const POINT_OPTIONS = [10, 15, 20, 25, 30, 50];

export const ChoreModal: React.FC<ChoreModalProps> = ({
  isOpen,
  onClose,
  members,
  onAddChore,
  initialMemberId,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedMemberId, setAssignedMemberId] = useState(initialMemberId || members[0]?.id || '');
  const [category, setCategory] = useState<ChoreCategory>('konyha');
  const [frequency, setFrequency] = useState<ChoreFrequency>('napi');
  const [dueDate, setDueDate] = useState(formatDateYMD());
  const [points, setPoints] = useState(20);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Add meg a házimunka nevét!');
      return;
    }
    if (!assignedMemberId) {
      setError('Válassz ki egy családtagot, akihez a feladat tartozik!');
      return;
    }

    onAddChore({
      title: title.trim(),
      description: description.trim() || undefined,
      assignedMemberId,
      category,
      frequency,
      dueDate,
      points,
    });

    setTitle('');
    setDescription('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Új Házimunka Kiosztása</h2>
              <p className="text-xs text-emerald-100">
                Rendelj feladatot egy családtaghoz határidővel és pontértékkel
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

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Feladat megnevezése *
            </label>
            <input
              type="text"
              placeholder="pl. Mosogatógép kipakolása, Porszívózás..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Leírás vagy instrukciók (opcionális)
            </label>
            <textarea
              placeholder="pl. Tabletta behelyezése, tiszta tányérok a felső polcra..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                Felelős Családtag *
              </label>
              <select
                value={assignedMemberId}
                onChange={(e) => setAssignedMemberId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-semibold"
                required
              >
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.avatar} {member.name} ({member.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-600" />
                Kategória
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ChoreCategory)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              >
                {Object.values(CATEGORIES_META).map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                Határidő napja
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gyakoriság
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as ChoreFrequency)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white"
              >
                <option value="napi">Napi rendszeres</option>
                <option value="heti">Heti teendő</option>
                <option value="egyszeri">Egyszeri feladat</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              Sikeres teljesítésért járó pont:
            </label>
            <div className="flex flex-wrap gap-2">
              {POINT_OPTIONS.map((pt) => (
                <button
                  key={pt}
                  type="button"
                  onClick={() => setPoints(pt)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    points === pt
                      ? 'border-amber-500 bg-amber-500 text-white shadow-xs scale-105'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  +{pt} pont
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Mégse
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-2 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              Feladat kiosztása
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
