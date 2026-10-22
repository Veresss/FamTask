import { ChoreCategory } from '../types/index.ts';

export interface CategoryMeta {
  id: ChoreCategory;
  label: string;
  iconName: string;
  badgeBg: string;
  badgeText: string;
  borderClass: string;
}

export const CATEGORIES_META: Record<ChoreCategory, CategoryMeta> = {
  konyha: {
    id: 'konyha',
    label: 'Konyha',
    iconName: 'Utensils',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/40',
    badgeText: 'text-amber-700 dark:text-amber-300',
    borderClass: 'border-amber-200 dark:border-amber-800',
  },
  rendrakas: {
    id: 'rendrakas',
    label: 'Rendrakás',
    iconName: 'Sparkles',
    badgeBg: 'bg-purple-50 dark:bg-purple-950/40',
    badgeText: 'text-purple-700 dark:text-purple-300',
    borderClass: 'border-purple-200 dark:border-purple-800',
  },
  takaritas: {
    id: 'takaritas',
    label: 'Takarítás',
    iconName: 'Layers',
    badgeBg: 'bg-blue-50 dark:bg-blue-950/40',
    badgeText: 'text-blue-700 dark:text-blue-300',
    borderClass: 'border-blue-200 dark:border-blue-800',
  },
  furdo: {
    id: 'furdo',
    label: 'Fürdőszoba',
    iconName: 'Droplets',
    badgeBg: 'bg-cyan-50 dark:bg-cyan-950/40',
    badgeText: 'text-cyan-700 dark:text-cyan-300',
    borderClass: 'border-cyan-200 dark:border-cyan-800',
  },
  kert_kint: {
    id: 'kert_kint',
    label: 'Kert & Kint',
    iconName: 'Trees',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    borderClass: 'border-emerald-200 dark:border-emerald-800',
  },
  haziallat: {
    id: 'haziallat',
    label: 'Háziállat',
    iconName: 'HeartHandshake',
    badgeBg: 'bg-rose-50 dark:bg-rose-950/40',
    badgeText: 'text-rose-700 dark:text-rose-300',
    borderClass: 'border-rose-200 dark:border-rose-800',
  },
  bevasarlas: {
    id: 'bevasarlas',
    label: 'Bevásárlás',
    iconName: 'ShoppingCart',
    badgeBg: 'bg-indigo-50 dark:bg-indigo-950/40',
    badgeText: 'text-indigo-700 dark:text-indigo-300',
    borderClass: 'border-indigo-200 dark:border-indigo-800',
  },
  egyeb: {
    id: 'egyeb',
    label: 'Egyéb',
    iconName: 'CheckSquare',
    badgeBg: 'bg-slate-100 dark:bg-slate-800',
    badgeText: 'text-slate-700 dark:text-slate-300',
    borderClass: 'border-slate-200 dark:border-slate-700',
  },
};
