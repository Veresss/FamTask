import React from 'react';
import {
  Menu,
  ChevronRight,
  Wand2,
  RefreshCw,
  ShoppingCart,
  User,
  ShieldCheck,
  LogOut,
  LogIn,
  UserCheck,
} from 'lucide-react';
import { FamilyMember } from '../../types/notion.ts';
import { AuthUser, isCsabiUser } from '../../types/auth.ts';

interface NotionHeaderProps {
  onToggleMobileMenu: () => void;
  pageTitle: string;
  pageIcon: string;
  members: FamilyMember[];
  activeMemberId: string;
  onSelectMember: (id: string) => void;
  currentUser?: AuthUser | null;
  onOpenAuthModal?: () => void;
  onOpenMemberPicker?: () => void;
  onLogout?: () => void;
  onNavigateToAdmin?: () => void;
  onApplyDefaults?: () => void;
  onRunFairDistribution?: () => void;
  onGenerateShoppingList?: () => void;
}

export const NotionHeader: React.FC<NotionHeaderProps> = ({
  onToggleMobileMenu,
  pageTitle,
  pageIcon,
  members,
  activeMemberId,
  onSelectMember,
  currentUser,
  onOpenAuthModal,
  onOpenMemberPicker,
  onLogout,
  onNavigateToAdmin,
  onApplyDefaults,
  onRunFairDistribution,
  onGenerateShoppingList,
}) => {
  const isCsabi = isCsabiUser(currentUser);
  const activeMember = members.find((m) => m.id === activeMemberId);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#e9e9e7] px-4 sm:px-6 py-2.5">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Mobile hamburger + Notion Breadcrumb */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 text-slate-500 hover:text-slate-800 hover:bg-[#efefed] rounded-md transition-colors"
            aria-label="Menü megnyitása"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 truncate">
            <span className="hover:text-slate-700 cursor-pointer flex items-center gap-1">
              🏠 Családi Otthon
            </span>
            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-300" />
            <span className="font-semibold text-slate-800 truncate flex items-center gap-1">
              <span>{pageIcon}</span>
              <span>{pageTitle}</span>
            </span>
          </div>
        </div>

        {/* Right: Quick actions toolbar & User info */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Admin shortcut button if Csabi is logged in */}
          {isCsabi && onNavigateToAdmin && (
            <button
              onClick={onNavigateToAdmin}
              className="hidden md:flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 transition-colors shadow-2xs cursor-pointer"
              title="Csabi Adminisztrációs Központ megnyitása"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>Admin Panel</span>
            </button>
          )}

          {/* Active Family Member Selector for "Saját feladataim" */}
          <div className="flex items-center bg-[#f1f1ef] px-2 py-1 rounded-md text-xs border border-[#e2e2e0]">
            <User className="w-3.5 h-3.5 text-slate-500 mr-1.5" />
            <span className="text-slate-500 text-[11px] font-medium mr-1 hidden lg:inline">Családtag:</span>
            <select
              value={activeMemberId}
              onChange={(e) => onSelectMember(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 text-xs focus:outline-none cursor-pointer"
              title="Válassz ki egy családtagot a személyes nézethez"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} {m.canCook ? '🍳' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* User Account / Auth Status Badge */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 pl-1">
              <button
                onClick={onOpenMemberPicker}
                className="flex items-center gap-1.5 py-1 px-2 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-700 font-semibold cursor-pointer transition-colors"
                title="Kattints ide a családtag profilod módosításához"
              >
                <span>{currentUser.avatarEmoji || '👤'}</span>
                <span className="hidden sm:inline max-w-[80px] truncate">{currentUser.name}</span>
                {isCsabi && (
                  <span className="hidden sm:inline text-[9px] px-1 py-0.2 rounded bg-purple-100 text-purple-800 font-bold">
                    Admin
                  </span>
                )}
              </button>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                  title="Kijelentkezés"
                  aria-label="Kijelentkezés"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            onOpenAuthModal && (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Belépés</span>
              </button>
            )
          )}

          {/* Quick Action: Fair distribution */}
          {onRunFairDistribution && (
            <button
              onClick={onRunFairDistribution}
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-2xs cursor-pointer"
              title="Házimunkák igazságos beosztása a jelenlét és szabadidő alapján"
            >
              <Wand2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Igazságos beosztás</span>
            </button>
          )}

          {/* Quick Action: Menu to shopping */}
          {onGenerateShoppingList && (
            <button
              onClick={onGenerateShoppingList}
              className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100 transition-colors shadow-2xs cursor-pointer"
              title="Alapanyagok hozzáadása a heti menüből a bevásárlólistára"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-indigo-600" />
              <span>Menü ➔ Lista</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
