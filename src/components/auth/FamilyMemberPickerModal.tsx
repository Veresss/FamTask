import React from 'react';
import { FamilyMember } from '../../types/notion.ts';
import { AuthUser } from '../../types/auth.ts';
import { ShieldCheck, UserCheck, Check, Sparkles, ChefHat } from 'lucide-react';

interface FamilyMemberPickerModalProps {
  isOpen: boolean;
  currentUser: AuthUser | null;
  members: FamilyMember[];
  onSelectMember: (memberId: string) => void;
  onClose?: () => void;
  isMandatory?: boolean;
}

export const FamilyMemberPickerModal: React.FC<FamilyMemberPickerModalProps> = ({
  isOpen,
  currentUser,
  members,
  onSelectMember,
  onClose,
  isMandatory = false,
}) => {
  if (!isOpen || !currentUser) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl shadow-inner">
              👨‍👩‍👧‍👦
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif tracking-tight">
                Ki vagy te a családból?
              </h2>
              <p className="text-xs text-indigo-200">
                Jelöld be a saját profilodat a 7 családtag közül a személyre szabott jelenléthez és feladatokhoz!
              </p>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="px-6 py-3 bg-indigo-50 border-b border-indigo-100 flex items-center gap-2 text-xs text-indigo-900">
          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            Bejelentkezve mint: <strong>{currentUser.name}</strong> ({currentUser.email})
            {currentUser.linkedMemberId && ' • Jelenleg kiválasztott profil változtatható'}
          </span>
        </div>

        {/* Member cards grid */}
        <div className="p-6 overflow-y-auto space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {members.map((member) => {
              const isSelected = currentUser.linkedMemberId === member.id;
              const isCsabi = member.id === 'mem-csabi';

              return (
                <button
                  key={member.id}
                  onClick={() => onSelectMember(member.id)}
                  type="button"
                  className={`relative p-4 rounded-xl border text-left transition-all duration-150 cursor-pointer flex items-start gap-3.5 group hover:shadow-md ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20'
                      : isCsabi
                      ? 'border-purple-200 bg-purple-50/30 hover:border-purple-400 hover:bg-purple-50/60'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: `${member.color || '#6366f1'}15` }}
                  >
                    {member.avatarEmoji || '👤'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm">{member.name}</span>
                      {isCsabi && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                          <ShieldCheck className="w-3 h-3 text-purple-600" />
                          <span>Admin / Rendszergazda</span>
                        </span>
                      )}
                      {member.canCook && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800">
                          <ChefHat className="w-2.5 h-2.5" />
                          <span>Főzhet</span>
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                      {member.note || 'Családtag'}
                    </p>
                  </div>

                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            A választott családtag profil bármikor módosítható a felső sávból.
          </span>
          {!isMandatory && onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer font-medium"
            >
              Mégse
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

