import React from 'react';
import {
  Home,
  Calendar,
  Users,
  MapPin,
  Utensils,
  ChefHat,
  BookOpen,
  ShoppingCart,
  Package,
  CheckSquare,
  User,
  Smartphone,
  ChevronRight,
  Menu,
  X,
  ShieldCheck,
  LogOut,
  LogIn,
  UserCheck,
} from 'lucide-react';
import { AuthUser, isCsabiUser } from '../../types/auth.ts';

export type NotionPageId =
  | 'home'
  | 'week_plan'
  | 'presence'
  | 'meal_attendance'
  | 'meal_plan'
  | 'recipes'
  | 'shopping'
  | 'chores'
  | 'personal'
  | 'pantry'
  | 'mobile_today'
  | 'family_members'
  | 'admin';

interface NotionSidebarProps {
  activePage: NotionPageId;
  onSelectPage: (page: NotionPageId) => void;
  isOpenMobile: boolean;
  onToggleMobile: () => void;
  selectedMemberName?: string;
  currentUser?: AuthUser | null;
  onOpenAuthModal?: () => void;
  onOpenMemberPicker?: () => void;
  onLogout?: () => void;
}

export const NotionSidebar: React.FC<NotionSidebarProps> = ({
  activePage,
  onSelectPage,
  isOpenMobile,
  onToggleMobile,
  selectedMemberName,
  currentUser,
  onOpenAuthModal,
  onOpenMemberPicker,
  onLogout,
}) => {
  const isCsabi = isCsabiUser(currentUser);

  const navItems: Array<{
    id: NotionPageId;
    label: string;
    icon: React.ReactNode;
    badge?: string;
    section?: string;
    badgeColor?: string;
  }> = [
    { id: 'home', label: '🏠 Főoldal — Családi Otthon', icon: <Home className="w-4 h-4" /> },
    { id: 'mobile_today', label: '📱 MA — Gyors mobilnézet', icon: <Smartphone className="w-4 h-4 text-emerald-600" />, badge: 'Fókusz' },
    { id: 'week_plan', label: '📅 E Heti Családi Terv', icon: <Calendar className="w-4 h-4" />, section: 'Tervezés & Jelenlét' },
    { id: 'presence', label: '📍 Otthonlét Mátrix', icon: <MapPin className="w-4 h-4" /> },
    { id: 'meal_attendance', label: '🍱 Étkezési Igények (Ebéd & Vacsora)', icon: <Utensils className="w-4 h-4" /> },
    { id: 'meal_plan', label: '👩‍🍳 Heti Menü & Főzés Beosztás', icon: <ChefHat className="w-4 h-4" />, section: 'Konyha & Étkezés' },
    { id: 'recipes', label: '📖 Receptek (20+ családi recept)', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'shopping', label: '🛒 Bevásárlólista', icon: <ShoppingCart className="w-4 h-4" /> },
    { id: 'pantry', label: '📦 Háztartási Készlet', icon: <Package className="w-4 h-4" /> },
    { id: 'chores', label: '🧹 Házimunka & Igazságos Beosztás', icon: <CheckSquare className="w-4 h-4" />, section: 'Házimunka & Család' },
    { id: 'personal', label: `👤 Saját Feladataim${selectedMemberName ? ` (${selectedMemberName})` : ''}`, icon: <User className="w-4 h-4 text-indigo-600" /> },
    { id: 'family_members', label: '👨‍👩‍👧‍👦 Családtagok (7 fő)', icon: <Users className="w-4 h-4" /> },
    {
      id: 'admin',
      label: '⚙️ Adminisztráció (Csabi)',
      icon: <ShieldCheck className="w-4 h-4 text-purple-600" />,
      badge: isCsabi ? 'Engedélyezve' : 'Csabi',
      badgeColor: isCsabi ? 'bg-purple-100 text-purple-800' : 'bg-slate-200 text-slate-700',
      section: 'Rendszer Adminisztráció',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
          onClick={onToggleMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-72 bg-[#fbfbfa] border-r border-[#e9e9e7] flex flex-col transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Workspace Brand Header */}
        <div className="px-4 py-3.5 border-b border-[#e9e9e7] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-slate-800 text-white flex items-center justify-center text-sm font-bold shadow-2xs">
              🏠
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 leading-tight">Családi Otthon</h2>
              <p className="text-[11px] text-slate-400 font-medium">Notion Rendszer • 7 fős család</p>
            </div>
          </div>

          <button
            onClick={onToggleMobile}
            className="md:hidden p-1 text-slate-400 hover:text-slate-700 rounded-md"
            aria-label="Menü bezárása"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <React.Fragment key={item.id}>
                {item.section && (
                  <div className="pt-3 pb-1 px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {item.section}
                  </div>
                )}
                <button
                  onClick={() => {
                    onSelectPage(item.id);
                    if (isOpenMobile) onToggleMobile();
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer text-left ${
                    isActive
                      ? 'bg-[#e8e8e5] text-slate-900 font-semibold shadow-2xs'
                      : 'text-slate-600 hover:bg-[#efefed] hover:text-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <span className="text-slate-500 shrink-0">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </span>

                  {item.badge && (
                    <span
                      className={`ml-1 text-[10px] px-1.5 py-0.2 rounded font-bold shrink-0 ${
                        item.badgeColor || 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* User Session Footer Card */}
        <div className="p-3 border-t border-[#e9e9e7] bg-[#f7f7f5] text-xs space-y-2">
          {currentUser ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-900 flex items-center justify-center text-sm font-bold shrink-0">
                    {currentUser.avatarEmoji || '👤'}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 text-xs truncate flex items-center gap-1">
                      <span>{currentUser.name}</span>
                      {isCsabi && (
                        <span className="px-1 rounded text-[9px] bg-purple-100 text-purple-800 font-bold">
                          Admin
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate font-mono">
                      {currentUser.provider === 'google' ? '🌐 Google' : '✉️ Email'} • {currentUser.email}
                    </div>
                  </div>
                </div>

                {onLogout && (
                  <button
                    onClick={onLogout}
                    title="Kijelentkezés"
                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {onOpenMemberPicker && (
                <button
                  onClick={onOpenMemberPicker}
                  className="w-full py-1 px-2 rounded bg-white hover:bg-[#efefed] border border-[#d8d8d6] text-[11px] font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <UserCheck className="w-3 h-3 text-indigo-600" />
                  <span>Családi profil módosítása</span>
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Bejelentkezés / Belépés</span>
            </button>
          )}

          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
            <span>Család: 7 fő</span>
            <span className="text-emerald-700 font-semibold">Igazságos elosztás</span>
          </div>
        </div>
      </aside>
    </>
  );
};
