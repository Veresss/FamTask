import React, { useState } from 'react';
import { FamilyMember, InAppNotification } from '../types/index.ts';
import {
  Users,
  Bell,
  Trophy,
  Plus,
  Home,
  CheckCircle,
  Sparkles,
  Edit2,
  Check,
} from 'lucide-react';

interface HeaderProps {
  familyName: string;
  onChangeFamilyName: (name: string) => void;
  members: FamilyMember[];
  activeMemberId: string | 'all';
  onSelectActiveMember: (id: string | 'all') => void;
  onOpenChoreModal: () => void;
  onOpenMembersModal: () => void;
  onOpenSundayModal: () => void;
  onOpenNotificationsModal: () => void;
  notifications: InAppNotification[];
  isSundayToday: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  familyName,
  onChangeFamilyName,
  members,
  activeMemberId,
  onSelectActiveMember,
  onOpenChoreModal,
  onOpenMembersModal,
  onOpenSundayModal,
  onOpenNotificationsModal,
  notifications,
  isSundayToday,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(familyName);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleSaveName = () => {
    if (tempName.trim()) {
      onChangeFamilyName(tempName.trim());
    }
    setIsEditingName(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3.5 gap-3">
          {/* Logo & Family name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white shadow-sm ring-2 ring-indigo-100">
              <Home className="w-5 h-5" />
            </div>

            <div>
              {isEditingName ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="text-base font-bold text-slate-900 border border-indigo-400 rounded-lg px-2 py-0.5 focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                    title="Mentés"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 group cursor-pointer" onClick={() => setIsEditingName(true)}>
                  <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {familyName}
                  </h1>
                  <Edit2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
              )}
              <p className="text-xs text-slate-500 font-medium">
                Családi Házimunka Kiosztó & Értékelő
              </p>
            </div>
          </div>

          {/* User selector & Actions toolbar */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Perspective Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <span className="text-[11px] font-semibold text-slate-500 px-2 hidden lg:inline">
                Nézet:
              </span>
              <button
                type="button"
                onClick={() => onSelectActiveMember('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  activeMemberId === 'all'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Közös felület (Mindenki)
              </button>

              <div className="h-4 w-px bg-slate-300 mx-1"></div>

              <select
                value={activeMemberId}
                onChange={(e) => onSelectActiveMember(e.target.value)}
                className="bg-transparent font-semibold text-slate-700 focus:outline-none text-xs py-1 px-1.5 cursor-pointer"
                title="Személyes nézet választása"
              >
                <option value="all">Saját nézet váltása...</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.avatar} {m.name} feladatai
                  </option>
                ))}
              </select>
            </div>

            {/* Sunday Evaluation Button */}
            <button
              type="button"
              onClick={onOpenSundayModal}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                isSundayToday
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-600 shadow-xs animate-pulse ring-2 ring-amber-300'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200'
              }`}
              title="Vasárnapi heti összegzés és archívum"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              <span>Vasárnapi Értékelő</span>
              {isSundayToday && (
                <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
              )}
            </button>

            {/* Push Notifications Button */}
            <button
              type="button"
              onClick={onOpenNotificationsModal}
              className="relative px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all"
              title="Napi push értesítések beállítása és tesztelése"
            >
              <Bell className="w-3.5 h-3.5 text-indigo-600" />
              <span>Napi Értesítések</span>
              {unreadCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Members Button */}
            <button
              type="button"
              onClick={onOpenMembersModal}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all"
              title="Családtagok kezelése"
            >
              <Users className="w-3.5 h-3.5 text-slate-600" />
              <span>Családtagok ({members.length})</span>
            </button>

            {/* Add Chore Primary Button */}
            <button
              type="button"
              onClick={onOpenChoreModal}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Új Feladat</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
