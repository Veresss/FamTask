import React from 'react';
import { Chore, FamilyMember } from '../types/index.ts';
import { CATEGORIES_META } from '../utils/categories.ts';
import confetti from 'canvas-confetti';
import { playChimeSound } from '../services/notificationService.ts';
import {
  Check,
  Clock,
  Award,
  Trash2,
  Calendar,
  Repeat,
  Sparkles,
  Utensils,
  Layers,
  Droplets,
  Trees,
  HeartHandshake,
  ShoppingCart,
  CheckSquare,
} from 'lucide-react';

interface ChoreCardProps {
  chore: Chore;
  assignedMember?: FamilyMember;
  currentActiveMember?: FamilyMember;
  onToggleComplete: (choreId: string) => void;
  onDeleteChore: (choreId: string) => void;
}

export const ChoreCard: React.FC<ChoreCardProps> = ({
  chore,
  assignedMember,
  currentActiveMember,
  onToggleComplete,
  onDeleteChore,
}) => {
  const meta = CATEGORIES_META[chore.category] || CATEGORIES_META.egyeb;

  const handleToggle = () => {
    const willBeCompleted = !chore.isCompleted;
    if (willBeCompleted) {
      try {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.7 },
        });
        playChimeSound();
      } catch {
        // silent
      }
    }
    onToggleComplete(chore.id);
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Utensils':
        return <Utensils className="w-3.5 h-3.5" />;
      case 'Sparkles':
        return <Sparkles className="w-3.5 h-3.5" />;
      case 'Layers':
        return <Layers className="w-3.5 h-3.5" />;
      case 'Droplets':
        return <Droplets className="w-3.5 h-3.5" />;
      case 'Trees':
        return <Trees className="w-3.5 h-3.5" />;
      case 'HeartHandshake':
        return <HeartHandshake className="w-3.5 h-3.5" />;
      case 'ShoppingCart':
        return <ShoppingCart className="w-3.5 h-3.5" />;
      default:
        return <CheckSquare className="w-3.5 h-3.5" />;
    }
  };

  const formattedCompletedTime = chore.completedAt
    ? new Date(chore.completedAt).toLocaleTimeString('hu-HU', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div
      className={`group relative rounded-2xl border p-4.5 transition-all duration-200 ${
        chore.isCompleted
          ? 'bg-emerald-50/40 border-emerald-200/80 hover:border-emerald-300'
          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Toggle Checkbox Button */}
        <button
          type="button"
          onClick={handleToggle}
          className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-all cursor-pointer ${
            chore.isCompleted
              ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-500 ring-offset-1'
              : 'border-2 border-slate-300 hover:border-emerald-500 bg-white hover:bg-emerald-50/50'
          }`}
          aria-label={chore.isCompleted ? `Feladat visszavonása: ${chore.title}` : `Feladat befejezése: ${chore.title}`}
          title={chore.isCompleted ? 'Kattints a visszavonáshoz' : 'Kattints a készre jelöléshez'}
        >
          {chore.isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
        </button>

        {/* Details */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={`text-sm font-bold transition-all ${
                chore.isCompleted
                  ? 'text-slate-500 line-through decoration-slate-400'
                  : 'text-slate-900 group-hover:text-indigo-950'
              }`}
            >
              {chore.title}
            </h3>

            <div className="flex items-center gap-1 shrink-0">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/60">
                <Award className="w-3 h-3 text-amber-600" />+{chore.points}p
              </span>
              <button
                type="button"
                onClick={() => onDeleteChore(chore.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all"
                title="Törlés"
                aria-label="Feladat törlése"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {chore.description && (
            <p
              className={`text-xs ${
                chore.isCompleted ? 'text-slate-400' : 'text-slate-600'
              } line-clamp-2 leading-relaxed`}
            >
              {chore.description}
            </p>
          )}

          {/* Badges & Meta row */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            {/* Assigned Member Chip */}
            {assignedMember ? (
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold shadow-2xs"
                style={{
                  backgroundColor: `${assignedMember.color}15`,
                  borderColor: `${assignedMember.color}40`,
                  color: assignedMember.color,
                }}
              >
                <span>{assignedMember.avatar}</span>
                <span>{assignedMember.name}</span>
              </div>
            ) : (
              <span className="text-slate-400 text-xs">Nincs hozzárendelve</span>
            )}

            {/* Category */}
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-medium ${meta.badgeBg} ${meta.badgeText} ${meta.borderClass}`}
            >
              {getCategoryIcon(meta.iconName)}
              {meta.label}
            </span>

            {/* Frequency */}
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
              <Repeat className="w-3 h-3" />
              {chore.frequency === 'napi'
                ? 'Napi'
                : chore.frequency === 'heti'
                ? 'Heti'
                : 'Egyszeri'}
            </span>

            {/* Due date */}
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
              <Calendar className="w-3 h-3 text-slate-400" />
              {chore.dueDate}
            </span>
          </div>

          {/* Shared Completion Notice */}
          {chore.isCompleted && (
            <div className="pt-2 mt-1 border-t border-emerald-100/80 flex items-center justify-between text-[11px] text-emerald-800 font-medium">
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                Készre jelölve a közös felületen!
              </span>
              {formattedCompletedTime && (
                <span className="text-emerald-700/80 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formattedCompletedTime}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
