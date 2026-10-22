import React, { useState } from 'react';
import { FamilyMember, MemberRole } from '../types/index.ts';
import { Users, UserPlus, Trash2, Shield, Heart, Sparkles, Check, X } from 'lucide-react';

interface MemberManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: FamilyMember[];
  onAddMember: (member: Omit<FamilyMember, 'id' | 'joinedDate' | 'pointsTotal'>) => void;
  onRemoveMember: (id: string) => void;
}

const AVATAR_OPTIONS = ['👩', '👨', '👧', '👦', '👵', '👴', '👶', '🦸‍♂️', '🦸‍♀️', '🐱', '🐶', '⭐'];
const COLOR_OPTIONS = [
  { name: 'Indigo', hex: '#6366f1' },
  { name: 'Smaragd', hex: '#059669' },
  { name: 'Borostyán', hex: '#d97706' },
  { name: 'Rózsaszín', hex: '#db2777' },
  { name: 'Lila', hex: '#9333ea' },
  { name: 'Türkiz', hex: '#0891b2' },
  { name: 'Kék', hex: '#2563eb' },
];

export const MemberManagementModal: React.FC<MemberManagementModalProps> = ({
  isOpen,
  onClose,
  members,
  onAddMember,
  onRemoveMember,
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState<MemberRole>('Gyerek');
  const [avatar, setAvatar] = useState(AVATAR_OPTIONS[0]);
  const [color, setColor] = useState(COLOR_OPTIONS[0].hex);
  const [notificationTime, setNotificationTime] = useState('08:00');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Kérjük, add meg a családtag nevét!');
      return;
    }

    onAddMember({
      name: name.trim(),
      role,
      avatar,
      color,
      notificationTime,
      notificationsEnabled,
    });

    setName('');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Családtagok Kezelése</h2>
              <p className="text-xs text-indigo-100">
                Új családtag felvétele és meglévő tagok beállításai
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Add member form */}
          <form onSubmit={handleSubmit} className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/40 space-y-4">
            <h3 className="text-sm font-bold text-indigo-950 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-indigo-600" />
              Új családtag hozzáadása a családhoz
            </h3>

            {error && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Név vagy becenév *
                </label>
                <input
                  type="text"
                  placeholder="pl. Lili, Nagyi, Bence..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Szerepkör
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as MemberRole)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                >
                  <option value="Szülő">Szülő</option>
                  <option value="Gyerek">Gyerek</option>
                  <option value="Egyéb">Egyéb (pl. Nagyszülő, Vendég)</option>
                </select>
              </div>
            </div>

            {/* Avatar & Color Pickers */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Válassz avatart:
              </label>
              <div className="flex flex-wrap gap-2">
                {AVATAR_OPTIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setAvatar(item)}
                    className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border transition-all ${
                      avatar === item
                        ? 'border-indigo-600 bg-white ring-2 ring-indigo-500 scale-105 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Családtag színe:
              </label>
              <div className="flex flex-wrap gap-2 items-center">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-7 h-7 rounded-full transition-all border border-black/10 flex items-center justify-center text-white ${
                      color === c.hex ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110 shadow-xs' : ''
                    }`}
                    title={c.name}
                  >
                    {color === c.hex && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Napi értesítés ideje:
                </label>
                <input
                  type="time"
                  value={notificationTime}
                  onChange={(e) => setNotificationTime(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={(e) => setNotificationsEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                  />
                  <span>Push értesítések engedélyezése</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors active:scale-98"
            >
              <UserPlus className="w-4 h-4" />
              Családtag hozzáadása a családhoz
            </button>
          </form>

          {/* Current Members List */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              Jelenlegi családtagok ({members.length})
            </h3>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-xs"
                      style={{ backgroundColor: `${member.color}20`, borderColor: member.color, borderWidth: 1 }}
                    >
                      {member.avatar}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{member.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-slate-100 text-slate-700">
                          {member.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Értesítés: {member.notificationTime || '08:00'} • Összpontszám: {member.pointsTotal || 0} pont
                      </p>
                    </div>
                  </div>

                  {members.length > 1 && (
                    <button
                      onClick={() => onRemoveMember(member.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title={`${member.name} törlése`}
                      aria-label={`${member.name} törlése`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Kész, bezárás
          </button>
        </div>
      </div>
    </div>
  );
};
