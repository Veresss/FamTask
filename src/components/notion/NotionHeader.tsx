import React from 'react';
import { Menu, ChevronRight, Wand2, RefreshCw, ShoppingCart, User } from 'lucide-react';
import { FamilyMember } from '../../types/notion.ts';

interface NotionHeaderProps {
  onToggleMobileMenu: () => void;
  pageTitle: string;
  pageIcon: string;
  members: FamilyMember[];
  activeMemberId: string;
  onSelectMember: (id: string) => void;
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
  onApplyDefaults,
  onRunFairDistribution,
  onGenerateShoppingList,
}) => {
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

        {/* Right: Quick actions toolbar */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Active Family Member Selector for "Saját feladataim" */}
          <div className="flex items-center bg-[#f1f1ef] px-2 py-1 rounded-md text-xs border border-[#e2e2e0]">
            <User className="w-3.5 h-3.5 text-slate-500 mr-1.5" />
            <span className="text-slate-500 text-[11px] font-medium mr-1 hidden sm:inline">Ki vagyok én:</span>
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

          {/* Quick Action: Fair distribution */}
          {onRunFairDistribution && (
            <button
              onClick={onRunFairDistribution}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-2xs cursor-pointer"
              title="Házimunkák igazságos beosztása a jelenlét és szabadidő alapján"
            >
              <Wand2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Igazságos beosztás</span>
            </button>
          )}

          {/* Quick Action: Apply defaults */}
          {onApplyDefaults && (
            <button
              onClick={onApplyDefaults}
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-[#f7f7f5] text-slate-600 border border-[#e2e2e0] hover:bg-[#efefed] transition-colors cursor-pointer"
              title="Alapértelmezett heti jelenlét és étkezési minták betöltése"
            >
              <RefreshCw className="w-3 h-3 text-slate-400" />
              <span>Alapértelmezések</span>
            </button>
          )}

          {/* Quick Action: Menu to shopping */}
          {onGenerateShoppingList && (
            <button
              onClick={onGenerateShoppingList}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100 transition-colors shadow-2xs cursor-pointer"
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
