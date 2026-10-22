export type DayOfWeek = 'Hétfő' | 'Kedd' | 'Szerda' | 'Csütörtök' | 'Péntek' | 'Szombat' | 'Vasárnap';

export const DAYS_OF_WEEK: DayOfWeek[] = ['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat', 'Vasárnap'];

export interface FamilyMember {
  id: string;
  name: string; // Anyu, Apu, Botond, Marica, Csabi, Attila, Ákos
  active: boolean;
  canCook: boolean; // Anyu: igen, Marica: igen, others customizable
  note?: string;
  color?: string;
  avatarEmoji?: string;
}

export type HomePresenceStatus = 'otthon' | 'csak_este' | 'nincs_otthon';

export interface PresenceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  dayOfWeek: DayOfWeek;
  memberId: string;
  isHome: HomePresenceStatus;
  sleepsHome: boolean;
  arrival?: string; // e.g. "18:00"
  departure?: string; // e.g. "07:30"
  note?: string;
}

export interface MealAttendanceRecord {
  id: string;
  date: string;
  dayOfWeek: DayOfWeek;
  memberId: string;
  wantsLunch: boolean;
  wantsDinner: boolean;
}

export type RecipeCategory =
  | 'csirkés'
  | 'húsos'
  | 'halas'
  | 'vegetáriánus'
  | 'tésztás'
  | 'rizses'
  | 'saláta'
  | 'leves'
  | 'egytálétel'
  | 'gyors vacsora'
  | 'elviteles ebéd'
  | 'maradékmentő';

export interface Recipe {
  id: string;
  name: string;
  category: RecipeCategory;
  prepTimeMinutes: number; // 15 - 45 min
  difficulty: 'könnyű' | 'közepes';
  portions: number;
  isLunchFriendly: boolean; // Elviteles ebédre alkalmas
  isDinnerFriendly: boolean;
  prepNightBefore: boolean; // Előző este elkészíthető
  goodNextDay: boolean; // Másnap is finom
  portable: boolean; // Jól szállítható dobozban
  isFavorite?: boolean;
  ingredients: Array<{ item: string; amount: string; category?: ShoppingCategory }>;
  instructions: string;
  note?: string;
}

export interface WeeklyMealPlanItem {
  id: string;
  date: string;
  dayOfWeek: DayOfWeek;
  mealType: 'ebéd' | 'vacsora';
  recipeId: string;
  eaterMemberIds: string[]; // Who wants this meal
  cookMemberId: string; // Who is assigned to cook (must have canCook: true)
  isTakeaway: boolean; // For lunch: packed in boxes for morning
  deadlineTime: string; // e.g. "Előző este 20:00" or "Hétfő reggel 07:00"
  isLeftover: boolean; // Maradék?
  note?: string;
}

export type ShoppingCategory =
  | '🥬 Zöldség'
  | '🍎 Gyümölcs'
  | '🥩 Hús'
  | '🐟 Hal'
  | '🥛 Tejtermék'
  | '🥚 Tojás'
  | '🍞 Pékáru'
  | '🍚 Szárazáru'
  | '🥫 Konzerv'
  | '🧊 Fagyasztott'
  | '🧂 Egyéb élelmiszer'
  | '🧼 Háztartás'
  | '🧴 Tisztítószer'
  | '🧻 Papíráru';

export interface ShoppingItem {
  id: string;
  item: string;
  quantity: string;
  unit: string;
  category: ShoppingCategory;
  relatedRecipeId?: string;
  inStock: boolean;
  needsBuying: boolean;
  purchased: boolean;
  buyerMemberId?: string;
  store?: string;
  note?: string;
}

export interface PantryItem {
  id: string;
  item: string;
  category: ShoppingCategory;
  inStock: boolean;
  quantity: string;
  minQuantity: string;
  note?: string;
}

export type ChoreFrequency = 'napi' | 'heti' | 'havi' | '2-3 havi' | 'szezonális';

export interface ChoreDefinition {
  id: string;
  title: string;
  roomArea: string; // Konyha, Fürdő, Mosás, Szobák, Közös terek, Kültér, Háztartás
  frequency: ChoreFrequency;
  estimatedMinutes: number;
  isActive: boolean;
  isRecurring: boolean;
  note?: string;
}

export interface ChoreAssignment {
  id: string;
  choreId: string;
  choreTitle: string;
  roomArea: string;
  memberId: string; // Anyu, Apu, Botond, Marica, Csabi, Attila, Ákos
  date: string;
  dayOfWeek: DayOfWeek;
  deadline: string; // e.g. "19:00" or "reggel"
  estimatedMinutes: number;
  completed: boolean;
  completedAt?: string;
  note?: string;
}

export interface MemberDailyCapacity {
  memberId: string;
  dayOfWeek: DayOfWeek;
  availableMinutes: number; // e.g. 30, 0, 60
}

export interface CookingScheduleItem {
  id: string;
  date: string;
  dayOfWeek: DayOfWeek;
  mealType: 'ebéd' | 'vacsora';
  recipeId: string;
  recipeName: string;
  cookMemberId: string;
  eaterCount: number;
  prepTimeMinutes: number;
  deadline: string; // e.g. "Előző este 20:00"
  completed: boolean;
  note?: string;
}
