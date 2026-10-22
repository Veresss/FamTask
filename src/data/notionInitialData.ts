import {
  DayOfWeek,
  FamilyMember,
  PresenceRecord,
  MealAttendanceRecord,
  Recipe,
  WeeklyMealPlanItem,
  ShoppingItem,
  PantryItem,
  ChoreDefinition,
  ChoreAssignment,
  MemberDailyCapacity,
  CookingScheduleItem,
  DAYS_OF_WEEK,
} from '../types/notion.ts';
import { getCurrentWeekDates } from '../utils/fairDistribution.ts';

// 1. Family Members (7 members, strictly NO age properties)
export const INITIAL_NOTION_MEMBERS: FamilyMember[] = [
  { id: 'mem-anyu', name: 'Anyu', active: true, canCook: true, note: 'Hétköznap általában otthon', color: '#6366f1', avatarEmoji: '👩' },
  { id: 'mem-apu', name: 'Apu', active: true, canCook: true, note: 'Pénteken általában csak vacsorázik otthon', color: '#059669', avatarEmoji: '👨' },
  { id: 'mem-botond', name: 'Botond', active: true, canCook: true, note: 'Változó jelenlét és étkezés', color: '#d97706', avatarEmoji: '👦' },
  { id: 'mem-marica', name: 'Marica', active: true, canCook: true, note: 'Tud főzni • Változó heti beosztás', color: '#ec4899', avatarEmoji: '👧' },
  { id: 'mem-csabi', name: 'Csabi', active: true, canCook: true, note: 'Változó jelenlét és étkezés', color: '#8b5cf6', avatarEmoji: '🧑' },
  { id: 'mem-attila', name: 'Attila', active: true, canCook: true, note: 'Általában nincs otthon, hétvégén vagy ritkábban jön haza', color: '#0ea5e9', avatarEmoji: '🧑' },
  { id: 'mem-akos', name: 'Ákos', active: true, canCook: true, note: 'Általában otthon van', color: '#10b981', avatarEmoji: '🧒' },
];

// 2. 20+ Sample Recipes (15-45 perc, egészséges, családbarát, előző este elkészíthető, jól szállítható)
export const INITIAL_NOTION_RECIPES: Recipe[] = [
  {
    id: 'rec-1',
    name: 'Zöldséges csirkeragu bulgurral',
    category: 'csirkés',
    prepTimeMinutes: 30,
    difficulty: 'könnyű',
    portions: 6,
    isLunchFriendly: true,
    isDinnerFriendly: true,
    prepNightBefore: true,
    goodNextDay: true,
    portable: true,
    isFavorite: true,
    ingredients: [
      { item: 'Csirkemellfilé', amount: '800 g', category: '🥩 Hús' },
      { item: 'Bulgur', amount: '400 g', category: '🍚 Szárazáru' },
      { item: 'Cukkini', amount: '2 db', category: '🥬 Zöldség' },
      { item: 'Sárgarépa', amount: '3 db', category: '🥬 Zöldség' },
      { item: 'Póréhagyma', amount: '1 szál', category: '🥬 Zöldség' },
      { item: 'Olívaolaj & fűszerek', amount: 'ízlés szerint', category: '🧂 Egyéb élelmiszer' },
    ],
    instructions: 'A csirkemellet kockázzuk, pirítjuk, hozzáadjuk a szeletelt zöldségeket, pároljuk. A bulgurt kétszeres forró sós vízzel felöntjük és lefedve hagyjuk puhulni.',
    note: 'Kiváló dobozos elviteles ebéd, melegítve is szaftos marad.',
  },
  {
    id: 'rec-2',
    name: 'Vöröslencsés bolognai durum spagettivel',
    category: 'tésztás',
    prepTimeMinutes: 25,
    difficulty: 'könnyű',
    portions: 7,
    isLunchFriendly: true,
    isDinnerFriendly: true,
    prepNightBefore: true,
    goodNextDay: true,
    portable: true,
    ingredients: [
      { item: 'Durum spagetti', amount: '500 g', category: '🍚 Szárazáru' },
      { item: 'Vöröslencse', amount: '250 g', category: '🍚 Szárazáru' },
      { item: 'Hámozott paradicsom konzerv', amount: '2 doboz', category: '🥫 Konzerv' },
      { item: 'Fokhagyma, vöröshagyma', amount: '2-2 fej', category: '🥬 Zöldség' },
      { item: 'Reszelt sajt (Trapista/Parmezán)', amount: '150 g', category: '🥛 Tejtermék' },
      { item: 'Bazsalikom, oregánó', amount: '1 csomag', category: '🧂 Egyéb élelmiszer' },
    ],
    instructions: 'A hagymát pirítjuk, hozzáadjuk az átöblített vöröslencsét és a paradicsomszószt. 15 perc alatt puhára főzzük, kifőtt spagettivel összeforgatjuk.',
    note: 'Gyors és tápláló növényi fehérjében gazdag fogás.',
  },
  {
    id: 'rec-3',
    name: 'Tejszínes lazacos penne bébispenóttal',
    category: 'halas',
    prepTimeMinutes: 20,
    difficulty: 'könnyű',
    portions: 6,
    isLunchFriendly: true,
    isDinnerFriendly: true,
    prepNightBefore: false,
    goodNextDay: true,
    portable: true,
    ingredients: [
      { item: 'Lazacfilé (vagy fagyasztott vadlazac)', amount: '500 g', category: '🐟 Hal' },
      { item: 'Penne tészta', amount: '500 g', category: '🍚 Szárazáru' },
      { item: 'Főzőtejszín', amount: '400 ml', category: '🥛 Tejtermék' },
      { item: 'Friss bébispenót', amount: '200 g', category: '🥬 Zöldség' },
      { item: 'Citrom és fokhagyma', amount: '1 db / 2 gerezd', category: '🍎 Gyümölcs' },
    ],
    instructions: 'A penét megfőzzük. A felkockázott lazacot serpenyőben pár perc alatt megpirítjuk, tejszínnel felöntjük, a spenótot belefonnyasztjuk és összeforgatjuk a tésztával.',
    note: 'Villámgyors 20 perces vacsora.',
  },
  {
    id: 'rec-4',
    name: 'Sütőtökös csicseriborsó curry jázminrizzsel',
    category: 'vegetáriánus',
    prepTimeMinutes: 35,
    difficulty: 'könnyű',
    portions: 7,
    isLunchFriendly: true,
    isDinnerFriendly: true,
    prepNightBefore: true,
    goodNextDay: true,
    portable: true,
    ingredients: [
      { item: 'Csicseriborsó konzerv', amount: '2 doboz', category: '🥫 Konzerv' },
      { item: 'Sütőtök (felkockázva)', amount: '600 g', category: '🥬 Zöldség' },
      { item: 'Kókusztej', amount: '400 ml', category: '🥫 Konzerv' },
      { item: 'Jázminrizs', amount: '400 g', category: '🍚 Szárazáru' },
      { item: 'Curry paszta & gyömbér', amount: '2 ek', category: '🧂 Egyéb élelmiszer' },
    ],
    instructions: 'A tökkockákat megpirítjuk, hozzáadjuk a curryt, csicseriborsót és a kókusztejet. 20 percig pároljuk míg a tök megpuhul. Párolt rizzsel tálaljuk.',
    note: 'Előző este elkészítve még jobban összeérnek az ízek!',
  },
  {
    id: 'rec-5',
    name: 'Mézes-mustáros csirkemell párolt zöldségekkel és rizzsel',
    category: 'csirkés',
    prepTimeMinutes: 30,
    difficulty: 'könnyű',
    portions: 7,
    isLunchFriendly: true,
    isDinnerFriendly: true,
    prepNightBefore: true,
    goodNextDay: true,
    portable: true,
    ingredients: [
      { item: 'Csirkemellfilé', amount: '900 g', category: '🥩 Hús' },
      { item: 'Mustár & Méz', amount: '3-3 ek', category: '🧂 Egyéb élelmiszer' },
      { item: 'Brokkoli és sárgarépa', amount: '500 g', category: '🥬 Zöldség' },
      { item: 'Barna vagy fehér rizs', amount: '450 g', category: '🍚 Szárazáru' },
    ],
    instructions: 'A csirkemellet mézes-mustáros pácba forgatjuk, serpenyőben megsütjük. Mellé brokkolit és répát párolunk.',
    note: 'Klasszikus kedvenc, dobozolva tökéletesen szállítható.',
  },
  {
    id: 'rec-6',
    name: 'Tepsis zöldséges pulykafasírt édesburgonyával',
    category: 'húsos',
    prepTimeMinutes: 40,
    difficulty: 'könnyű',
    portions: 7,
    isLunchFriendly: true,
    isDinnerFriendly: true,
    prepNightBefore: true,
    goodNextDay: true,
    portable: true,
    ingredients: [
      { item: 'Darált pulykahús', amount: '800 g', category: '🥩 Hús' },
      { item: 'Tojás', amount: '2 db', category: '🥚 Tojás' },
      { item: 'Zabpehely', amount: '100 g', category: '🍚 Szárazáru' },
      { item: 'Édesburgonya', amount: '1 kg', category: '🥬 Zöldség' },
      { item: 'Reszelt cukkini', amount: '1 db', category: '🥬 Zöldség' },
    ],
    instructions: 'A darált húst a fűszerekkel, tojással, zabpehellyel és reszelt cukkinivel összekeverjük, golyókat formázunk és sütőben a felvágott édesburgonyával együtt megsütjük.',
    note: 'Tepsiben egyszerre elkészül az egész család adagja, nem olajszagú.',
  },
  {
    id: 'rec-7',
    name: 'Zöldborsós rizseshús csirkemellből',
    category: 'rizses',
    prepTimeMinutes: 35,
    difficulty: 'könnyű',
    portions: 7,
    isLunchFriendly: true,
    isDinnerFriendly: true,
    prepNightBefore: true,
    goodNextDay: true,
    portable: true,
    ingredients: [
      { item: 'Csirkemell', amount: '700 g', category: '🥩 Hús' },
      { item: 'Rizs', amount: '400 g', category: '🍚 Szárazáru' },
      { item: 'Zsenge zöldborsó (fagyasztott)', amount: '400 g', category: '🧊 Fagyasztott' },
      { item: 'Vöröshagyma & pirospaprika', amount: '1 fej / 1 ek', category: '🥬 Zöldség' },
    ],
    instructions: 'Hagymás pörköltalapot készítünk a csirkéből, majd hozzáadjuk a rizst és a zöldborsót, kétszeres vízzel lefedve puhára pároljuk.',
    note: 'Tipikus kiadós elviteles ebéd, csemegeuborkával kitűnő.',
  },
  {
    id: 'rec-8',
    name: 'Tartalmas toszkán zöldségleves (Minestrone)',
    category: 'leves',
    prepTimeMinutes: 30,
    difficulty: 'könnyű',
    portions: 7,
    isLunchFriendly: true,
    isDinnerFriendly: true,
    prepNightBefore: true,
    goodNextDay: true,
    portable: true,
    ingredients: [
      { item: 'Fehérbab konzerv', amount: '2 doboz', category: '🥫 Konzerv' },
      { item: 'Sárgarépa, szárzeller, cukkini', amount: 'vegyesen 600 g', category: '🥬 Zöldség' },
      { item: 'Apró durumleves tészta', amount: '150 g', category: '🍚 Szárazáru' },
      { item: 'Paradicsompüré', amount: '150 g', category: '🥫 Konzerv' },
      { item: 'Zöldségalaplé', amount: '1.5 liter', category: '🧂 Egyéb élelmiszer' },
    ],
    instructions: 'A zöldségeket felaprítjuk, olívaolajon megfuttatjuk, paradicsompürével és alaplével felöntjük, tésztát és a babot belefőzve sűrű levest kapunk.',
    note: 'Termoszban vagy dobozban is tökéletes ebéd.',
  },
  {
    id: 'rec-9',
    name: 'Színes mediterrán tonhalsaláta tojással és quinoával',
    category: 'saláta',
    prepTimeMinutes: 20,
    difficulty: 'könnyű',
    portions: 6,
    isLunchFriendly: true,
    isDinnerFriendly: true,
    prepNightBefore: true,
    goodNextDay: true,
    portable: true,
    ingredients: [
      { item: 'Tonhalkonzerv (natúr/olívaolajos)', amount: '3 doboz', category: '🐟 Hal' },
      { item: 'Quinoa (vagy kuszkusz)', amount: '250 g', category: '🍚 Szárazáru' },
      { item: 'Tojás', amount: '5 db', category: '🥚 Tojás' },
      { item: 'Kukorica konzerv', amount: '1 doboz', category: '🥫 Konzerv' },
      { item: 'Koktélparadicsom & uborka', amount: '400 g', category: '🥬 Zöldség' },
      { item: 'Olívabogyó', amount: '1 üveg', category: '🥫 Konzerv' },
    ],
    instructions: 'A quinoát és a tojásokat megfőzzük. A zöldségeket felaprítjuk, tonhallal, kukoricával, olívabogyóval és kevés citromos olívaolajjal összeforgatjuk.',
    note: 'Hidegen fogyasztható, nem igényel melegítést.',
  },
  {
    id: 'rec-10',
    name: 'Spenótos-ricottás gnocchi paradicsomszószban',
    category: 'gyors vacsora',
    prepTimeMinutes: 20,
    difficulty: 'könnyű',
    portions: 6,
    isLunchFriendly: true,
    isDinnerFriendly: true,
    prepNightBefore: false,
    goodNextDay: true,
    portable: true,
    ingredients: [
      { item: 'Burgonya gnocchi', amount: '800 g', category: '🍚 Szárazáru' },
      { item: 'Ricotta (vagy túró)', amount: '250 g', category: '🥛 Tejtermék' },
      { item: 'Passzírozott paradicsom (Passata)', amount: '500 ml', category: '🥫 Konzerv' },
      { item: 'Bébispenót', amount: '150 g', category: '🥬 Zöldség' },
      { item: 'Mozzarella', amount: '200 g', category: '🥛 Tejtermék' },
    ],
    instructions: 'A gnocchit kifőzzük (2 perc). A paradicsomszószba belekeverjük a ricottát és a spenótot, összeforgatjuk a gnocchival és mozzarellával megszórva tálaljuk.',
    note: 'Gyors 20 perces családi kedvenc.',
  },
  {
    id: 'rec-11',
    name: 'Teljes kiőrlésű tortilla tekercs csirkemellel és zöldségekkel',
    category: 'elviteles ebéd',
    prepTimeMinutes: 25,
    difficulty: 'könnyű',
    portions: 7,
    isLunchFriendly: true,
    isDinnerFriendly: true,
    prepNightBefore: true,
    goodNextDay: true,
    portable: true,
    ingredients: [
      { item: 'Tortilla lapok (teljes kiőrlésű)', amount: '7-8 db', category: '🍞 Pékáru' },
      { item: 'Sült csirkemell csíkok', amount: '600 g', category: '🥩 Hús' },
      { item: 'Jégsaláta', amount: '1 fej', category: '🥬 Zöldség' },
      { item: 'Paradicsom & Kaliforniai paprika', amount: '3-3 db', category: '🥬 Zöldség' },
      { item: 'Natúr joghurt & fokhagyma (öntet)', amount: '300 g', category: '🥛 Tejtermék' },
    ],
    instructions: 'A csirkecsíkokat megpirítjuk. A tortillákat vékonyan megkenjük joghurtos öntettel, megtöltjük salátával, csirkével és zöldségekkel, majd szorosan feltekerjük és fóliázzuk.',
    note: 'Nem kell melegíteni, kézzel könnyen fogyasztható!',
  },
  {
    id: 'rec-12',
    name: 'Egylábasos mexikói babos rizs pulykahússal',
    category: 'egytálétel',
    prepTimeMinutes: 30,
    difficulty: 'könnyű',
    portions: 7,
    isLunchFriendly: true,
    isDinnerFriendly: true,
    prepNightBefore: true,
    goodNextDay: true,
    portable: true,
    ingredients: [
      { item: 'Darált pulyka vagy marhahús', amount: '600 g', category: '🥩 Hús' },
      { item: 'Vörösbab konzerv', amount: '2 doboz', category: '🥫 Konzerv' },
      { item: 'Kukorica konzerv', amount: '1 doboz', category: '🥫 Konzerv' },
      { item: 'Rizs', amount: '350 g', category: '🍚 Szárazáru' },
      { item: 'Passzírozott paradicsom', amount: '400 ml', category: '🥫 Konzerv' },
    ],
    instructions: 'A húst hagymán megpirítjuk, belekeverjük a rizst, babot, kukoricát és a paradicsomot. Vízzel felöntve 20 perc alatt készre pároljuk.',
    note: 'Előző este elkészítve másnap még finomabb.',
  },
  {
    id: 'rec-13',
    name: 'Tepsis lazac zöldbabbal és újburgonyával',
    category: 'halas',
    prepTimeMinutes: 30,
    difficulty: 'könnyű',
    portions: 6,
    isLunchFriendly: true,
    isDinnerFriendly: true,
    prepNightBefore: false,
    goodNextDay: true,
    portable: true,
    ingredients: [
      { item: 'Lazacpatkó vagy filé', amount: '6 szelet', category: '🐟 Hal' },
      { item: 'Zöldbab (fagyasztott)', amount: '450 g', category: '🧊 Fagyasztott' },
      { item: 'Kisebb szemű burgonya', amount: '1 kg', category: '🥬 Zöldség' },
      { item: 'Vaj, citrom és fokhagyma', amount: 'ízlés szerint', category: '🥛 Tejtermék' },
    ],
    instructions: 'A burgonyát és a zöldbabot tepsire fektetjük olívaolajjal, a lazacszeleteket a tetejére tesszük és 20 perc alatt készre sütjük.',
    note: 'Tiszta, minimális mosogatással járó vacsora.',
  },
  {
    id: 'rec-14',
    name: 'Maradékmentő pirított rizs tojással és zöldségekkel',
    category: 'maradékmentő',
    prepTimeMinutes: 15,
    difficulty: 'könnyű',
    portions: 6,
    isLunchFriendly: true,
    isDinnerFriendly: true,
    prepNightBefore: false,
    goodNextDay: true,
    portable: true,
    ingredients: [
      { item: 'Főtt rizs (előző napi maradék)', amount: '600 g', category: '🍚 Szárazáru' },
      { item: 'Tojás', amount: '5 db', category: '🥚 Tojás' },
      { item: 'Fagyasztott zöldségkeverék (borsó, répa, kukorica)', amount: '350 g', category: '🧊 Fagyasztott' },
      { item: 'Szójaszósz és szezámolaj', amount: '3-3 ek', category: '🧂 Egyéb élelmiszer' },
      { item: 'Újhagyma', amount: '1 csokor', category: '🥬 Zöldség' },
    ],
    instructions: 'Wokban vagy serpenyőben felverjük a tojásokat, hozzáadjuk a zöldségeket, belekeverjük a hideg főtt rizst és szójaszósszal átpirítjuk.',
    note: '15 perces életmentő gyors vacsora vagy ebéd.',
  },
  {
    id: 'rec-15',
    name: 'Zöldséges lepény (Quiche) túróval és póréhagymával',
    category: 'vegetáriánus',
    prepTimeMinutes: 40,
    difficulty: 'könnyű',
    portions: 8,
    isLunchFriendly: true,
    isDinnerFriendly: true,
    prepNightBefore: true,
    goodNextDay: true,
    portable: true,
    ingredients: [
      { item: 'Leveles tészta', amount: '1 csomag', category: '🧊 Fagyasztott' },
      { item: 'Félzsíros tehéntúró', amount: '400 g', category: '🥛 Tejtermék' },
      { item: 'Tojás', amount: '4 db', category: '🥚 Tojás' },
      { item: 'Póréhagyma & kaliforniai paprika', amount: '1-1 db', category: '🥬 Zöldség' },
      { item: 'Tejföl', amount: '200 g', category: '🥛 Tejtermék' },
    ],
    instructions: 'A tésztát piteformába simítjuk. A túrót a tojásokkal, tejföllel és dinsztelt hagymával kikeverjük, belesimítjuk és 35 percig sütjük.',
    note: 'Hidegen és melegen is finom, szeletelhető ebéd.',
  },
  {
    id: 'rec-16',
    name: 'Krémleves sült sárgarépából és gyömbérből pirított magvakkal',
    category: 'leves',
    prepTimeMinutes: 25,
    difficulty: 'könnyű',
    portions: 7,
    isLunchFriendly: true,
    isDinnerFriendly: true,
    prepNightBefore: true,
    goodNextDay: true,
    portable: true,
    ingredients: [
      { item: 'Sárgarépa', amount: '1 kg', category: '🥬 Zöldség' },
      { item: 'Friss gyömbér', amount: '1 diónyi', category: '🥬 Zöldség' },
      { item: 'Burgonya', amount: '2 db', category: '🥬 Zöldség' },
      { item: 'Kókusztej vagy tejszín', amount: '200 ml', category: '🥛 Tejtermék' },
      { item: 'Tökmag / napraforgómag', amount: '100 g', category: '🍚 Szárazáru' },
    ],
    instructions: 'A répát és krumplit puhára főzzük gyömbérrel, botmixerrel pürésítjük a tejszínnel, pirított magvakkal tálaljuk.',
    note: 'Laktató, melengető hétköznapi leves.',
  },
  {
    id: 'rec-17',
    name: 'Teriyaki csirkemell zöldbabbal és jázminrizzsel',
    category: 'csirkés',
    prepTimeMinutes: 25,
    difficulty: 'könnyű',
    portions: 7,
    isLunchFriendly: true,
    isDinnerFriendly: true,
    prepNightBefore: true,
    goodNextDay: true,
    portable: true,
    ingredients: [
      { item: 'Csirkemellfilé', amount: '800 g', category: '🥩 Hús' },
      { item: 'Teriyaki szósz', amount: '1 üveg', category: '🧂 Egyéb élelmiszer' },
      { item: 'Zöldhüvelyű ceruzabab', amount: '400 g', category: '🥬 Zöldség' },
      { item: 'Jázminrizs', amount: '450 g', category: '🍚 Szárazáru' },
      { item: 'Szezámmag', amount: '2 ek', category: '🍚 Szárazáru' },
    ],
    instructions: 'A csirkét csíkokra vágjuk, serpenyőben pirítjuk a zöldbabbal együtt, ráöntjük a teriyaki szószt és rizzsel dobozoljuk.',
    note: 'Gyors és rendkívül népszerű a család körében.',
  },
  {
    id: 'rec-18',
    name: 'Görög citromos tepsis csirkecombok burgonyával',
    category: 'csirkés',
    prepTimeMinutes: 45,
    difficulty: 'könnyű',
    portions: 7,
    isLunchFriendly: true,
    isDinnerFriendly: true,
    prepNightBefore: true,
    goodNextDay: true,
    portable: true,
    ingredients: [
      { item: 'Csirke felsőcomb', amount: '8 db', category: '🥩 Hús' },
      { item: 'Burgonya', amount: '1.2 kg', category: '🥬 Zöldség' },
      { item: 'Citrom & Fokhagyma', amount: '2 db / 4 gerezd', category: '🍎 Gyümölcs' },
      { item: 'Oregánó & Olívaolaj', amount: '2 ek', category: '🧂 Egyéb élelmiszer' },
    ],
    instructions: 'A combokat és cikkekre vágott krumplit oregánós, citromos, olívaolajos fűszerkeverékkel összeforgatjuk és tepsiben ropogósra sütjük.',
    note: 'Hétvégi vagy pénteki gazdag családi étel.',
  },
  {
    id: 'rec-19',
    name: 'Zöldborsós csicseriborsó főzelék pulykavirsli feltéttel',
    category: 'egytálétel',
    prepTimeMinutes: 25,
    difficulty: 'könnyű',
    portions: 7,
    isLunchFriendly: true,
    isDinnerFriendly: true,
    prepNightBefore: true,
    goodNextDay: true,
    portable: true,
    ingredients: [
      { item: 'Zöldborsó', amount: '600 g', category: '🧊 Fagyasztott' },
      { item: 'Csicseriborsó konzerv', amount: '1 doboz', category: '🥫 Konzerv' },
      { item: 'Natúr joghurt vagy tejföl habaráshoz', amount: '250 g', category: '🥛 Tejtermék' },
      { item: 'Pulykavirsli', amount: '1 csomag (7 db)', category: '🥩 Hús' },
      { item: 'Friss petrezselyem', amount: '1 csokor', category: '🥬 Zöldség' },
    ],
    instructions: 'A borsót és csicseriborsót sós vízben megfőzzük, egy részét pürésítjük a habarással sűrítésként, a virsliket megfőzzük/megpirítjuk mellé.',
    note: 'Egészséges, lisztmentesen is sűríthető főzelék.',
  },
  {
    id: 'rec-20',
    name: 'Színes zöldséges kuszkusz grillezett sajttal (Halloumi)',
    category: 'vegetáriánus',
    prepTimeMinutes: 20,
    difficulty: 'könnyű',
    portions: 6,
    isLunchFriendly: true,
    isDinnerFriendly: true,
    prepNightBefore: true,
    goodNextDay: true,
    portable: true,
    ingredients: [
      { item: 'Kuszkusz', amount: '350 g', category: '🍚 Szárazáru' },
      { item: 'Grillsajt / Halloumi', amount: '400 g', category: '🥛 Tejtermék' },
      { item: 'Kápia paprika & cukkini', amount: '2-2 db', category: '🥬 Zöldség' },
      { item: 'Aszalt paradicsom', amount: '1 kis üveg', category: '🥫 Konzerv' },
      { item: 'Citromlé & menta', amount: 'ízlés szerint', category: '🍎 Gyümölcs' },
    ],
    instructions: 'A kuszkuszt forró sós vízzel felöntjük 5 percre. A zöldségeket és grillsajtot serpenyőben átpirítjuk, összeforgatjuk a citromos kuszkusszal.',
    note: '20 perces könnyű mediterrán étel.',
  },
];

// 3. Complete Chores List (7 NAPI + 20 HETI + Havi / Szezonális, strictly NO points/munkapontok)
export const INITIAL_NOTION_CHORE_DEFS: ChoreDefinition[] = [
  // 7 NAPI HÁZIMUNKA (Exact matches from Section 11)
  { id: 'chore-d1', title: 'Mosogatógép kipakolása 1', roomArea: 'Konyha', frequency: 'napi', estimatedMinutes: 10, isActive: true, isRecurring: true, note: 'Reggeli tiszta edények elrakása a szekrénybe' },
  { id: 'chore-d2', title: 'Mosogatógép bepakolása 1', roomArea: 'Konyha', frequency: 'napi', estimatedMinutes: 10, isActive: true, isRecurring: true, note: 'Napközbeni szennyes edények behelyezése' },
  { id: 'chore-d3', title: 'Mosogatógép kipakolása 2', roomArea: 'Konyha', frequency: 'napi', estimatedMinutes: 10, isActive: true, isRecurring: true, note: 'Délutáni / vacsora előtti tiszta edények elrakása' },
  { id: 'chore-d4', title: 'Mosogatógép bepakolása 2', roomArea: 'Konyha', frequency: 'napi', estimatedMinutes: 10, isActive: true, isRecurring: true, note: 'Vacsora utáni edények bepakolása + tabletta és indítás' },
  { id: 'chore-d5', title: 'Konyhai lapos felületek tisztítása', roomArea: 'Konyha', frequency: 'napi', estimatedMinutes: 15, isActive: true, isRecurring: true, note: 'Pultok, főzőlap áttörlése zsíroldóval és fertőtlenítés' },
  { id: 'chore-d6', title: 'Tiszta, üres konyhaasztal', roomArea: 'Konyha', frequency: 'napi', estimatedMinutes: 10, isActive: true, isRecurring: true, note: 'Étkezőasztal lepakolása, morzsátlanítás, letörlés' },
  { id: 'chore-d7', title: 'Szellőztetés', roomArea: 'Közös terek', frequency: 'napi', estimatedMinutes: 5, isActive: true, isRecurring: true, note: 'Reggeli és esti 5 perces kereszthuzatos átszellőztetés' },

  // 20 HETI HÁZIMUNKA (Exact matches from Section 12)
  { id: 'chore-w1', title: 'Összes tükör lemosása', roomArea: 'Fürdő', frequency: 'heti', estimatedMinutes: 20, isActive: true, isRecurring: true, note: 'Fürdőszobai és előszobai tükrök tisztítása' },
  { id: 'chore-w2', title: 'Folyosók felsöprése / porszívózása', roomArea: 'Közös terek', frequency: 'heti', estimatedMinutes: 15, isActive: true, isRecurring: true, note: 'Földszinti és emeleti folyosók' },
  { id: 'chore-w3', title: 'Folyosók felmosása', roomArea: 'Közös terek', frequency: 'heti', estimatedMinutes: 20, isActive: true, isRecurring: true, note: 'Nedves felmosás a porszívózás után' },
  { id: 'chore-w4', title: 'Teregetés 1', roomArea: 'Mosás', frequency: 'heti', estimatedMinutes: 15, isActive: true, isRecurring: true, note: '1. mosási adag kiteregetése' },
  { id: 'chore-w5', title: 'Ruhahajtogatás 1', roomArea: 'Mosás', frequency: 'heti', estimatedMinutes: 20, isActive: true, isRecurring: true, note: '1. száraz adag hajtogatása' },
  { id: 'chore-w6', title: 'Teregetés 2', roomArea: 'Mosás', frequency: 'heti', estimatedMinutes: 15, isActive: true, isRecurring: true, note: '2. mosási adag kiteregetése' },
  { id: 'chore-w7', title: 'Ruhahajtogatás 2', roomArea: 'Mosás', frequency: 'heti', estimatedMinutes: 20, isActive: true, isRecurring: true, note: '2. száraz adag hajtogatása' },
  { id: 'chore-w8', title: 'Teregetés 3', roomArea: 'Mosás', frequency: 'heti', estimatedMinutes: 15, isActive: true, isRecurring: true, note: '3. mosási adag kiteregetése' },
  { id: 'chore-w9', title: 'Ruhahajtogatás 3', roomArea: 'Mosás', frequency: 'heti', estimatedMinutes: 20, isActive: true, isRecurring: true, note: '3. száraz adag hajtogatása' },
  { id: 'chore-w10', title: 'Kukák kiürítése', roomArea: 'Háztartás', frequency: 'heti', estimatedMinutes: 15, isActive: true, isRecurring: true, note: 'Szobák és fürdőszobák kukáinak ürítése, új szemeteszsák' },
  { id: 'chore-w11', title: 'Locsolás', roomArea: 'Kültér', frequency: 'heti', estimatedMinutes: 20, isActive: true, isRecurring: true, note: 'Benti szobanövények és kinti cserepek meglocsolása' },
  { id: 'chore-w12', title: 'Fürdőszoba mosdókagyló takarítása', roomArea: 'Fürdő', frequency: 'heti', estimatedMinutes: 15, isActive: true, isRecurring: true, note: 'Csaptelepek vízkőtelenítése, mosdó súrolása' },
  { id: 'chore-w13', title: 'Fürdőkád takarítása', roomArea: 'Fürdő', frequency: 'heti', estimatedMinutes: 20, isActive: true, isRecurring: true, note: 'Kád alapos lemosása és csempék áttörlése' },
  { id: 'chore-w14', title: 'Törölközőcsere', roomArea: 'Fürdő', frequency: 'heti', estimatedMinutes: 10, isActive: true, isRecurring: true, note: 'Kéz- és fürdőtörölközők cseréje tiszta darabokra' },
  { id: 'chore-w15', title: 'Két WC takarítása', roomArea: 'Fürdő', frequency: 'heti', estimatedMinutes: 25, isActive: true, isRecurring: true, note: 'Ülőkék, kagylók és padló fertőtlenítése mindkét WC-ben' },
  { id: 'chore-w16', title: 'Gáztűzhely takarítása', roomArea: 'Konyha', frequency: 'heti', estimatedMinutes: 25, isActive: true, isRecurring: true, note: 'Rácsok és gázrózsák zsírtalanítása' },
  { id: 'chore-w17', title: 'Konyha felsöprése / porszívózása', roomArea: 'Konyha', frequency: 'heti', estimatedMinutes: 15, isActive: true, isRecurring: true, note: 'Konyhai padló alapos portalanítása' },
  { id: 'chore-w18', title: 'Konyha felmosása', roomArea: 'Konyha', frequency: 'heti', estimatedMinutes: 20, isActive: true, isRecurring: true, note: 'Konyhakő zsíroldós forró vizes felmosása' },
  { id: 'chore-w19', title: 'Vásárlás 1', roomArea: 'Háztartás', frequency: 'heti', estimatedMinutes: 45, isActive: true, isRecurring: true, note: 'Heti nagybevásárlás 1. rész (szárazáru, zöldség)' },
  { id: 'chore-w20', title: 'Vásárlás 2', roomArea: 'Háztartás', frequency: 'heti', estimatedMinutes: 30, isActive: true, isRecurring: true, note: 'Hétvégi frissáru beszerzés (hús, pékáru, tejtermék)' },

  // HAVI, 2-3 HAVI ÉS SZEZONÁLIS FELADATOK
  { id: 'chore-m1', title: 'Hűtő alapos tisztítása', roomArea: 'Konyha', frequency: 'havi', estimatedMinutes: 40, isActive: true, isRecurring: true, note: 'Polcok kimosása, lejárati idők ellenőrzése' },
  { id: 'chore-m2', title: 'Sütő és mikró kitakarítása', roomArea: 'Konyha', frequency: 'havi', estimatedMinutes: 35, isActive: true, isRecurring: true, note: 'Belső falak zsírtalanítása' },
  { id: 'chore-m3', title: 'Kamra és élelmiszeres szekrény átnézése', roomArea: 'Konyha', frequency: 'havi', estimatedMinutes: 30, isActive: true, isRecurring: true, note: 'Rendrakás, molycsapdák' },
  { id: 'chore-s1', title: 'Ablakpucolás', roomArea: 'Közös terek', frequency: 'szezonális', estimatedMinutes: 90, isActive: true, isRecurring: true, note: 'Ablakok és redőnyök tavaszi/őszi lemosása' },
  { id: 'chore-s2', title: 'Függönymosás és visszarakás', roomArea: 'Szobák', frequency: '2-3 havi', estimatedMinutes: 60, isActive: true, isRecurring: true, note: 'Kímélő mosás és nedvesen felfüggesztés' },
];

// Helper to generate initial presence for current week based on defaults
export function generateInitialPresence(): PresenceRecord[] {
  const weekDates = getCurrentWeekDates();
  const records: PresenceRecord[] = [];

  weekDates.forEach(({ day, dateStr }) => {
    INITIAL_NOTION_MEMBERS.forEach((m) => {
      let isHome: 'otthon' | 'csak_este' | 'nincs_otthon' = 'otthon';
      let sleepsHome = true;
      let arrival: string | undefined = undefined;
      let departure: string | undefined = undefined;

      if (m.name === 'Attila') {
        // Attila: általában nincs otthon
        if (day === 'Péntek' || day === 'Szombat') {
          isHome = 'csak_este';
          sleepsHome = true;
          arrival = '19:00';
        } else {
          isHome = 'nincs_otthon';
          sleepsHome = false;
        }
      } else if (m.name === 'Apu') {
        // Apu: pénteken későn jön
        if (day === 'Péntek') {
          isHome = 'csak_este';
          arrival = '18:30';
        }
      } else if (m.name === 'Botond' || m.name === 'Csabi') {
        // Változó
        if (day === 'Szerda') {
          isHome = 'csak_este';
          arrival = '17:00';
        }
      }

      records.push({
        id: `pres-${m.id}-${day}`,
        date: dateStr,
        dayOfWeek: day,
        memberId: m.id,
        isHome,
        sleepsHome,
        arrival,
        departure,
      });
    });
  });

  return records;
}

// Helper to generate initial meal attendances based on defaults
export function generateInitialMealAttendances(): MealAttendanceRecord[] {
  const weekDates = getCurrentWeekDates();
  const records: MealAttendanceRecord[] = [];

  weekDates.forEach(({ day, dateStr }) => {
    INITIAL_NOTION_MEMBERS.forEach((m) => {
      let wantsLunch = true;
      let wantsDinner = true;

      if (m.name === 'Attila') {
        // Attila csak hétvégén ha otthon van
        wantsLunch = day === 'Szombat' || day === 'Vasárnap';
        wantsDinner = day === 'Péntek' || day === 'Szombat';
      } else if (m.name === 'Apu') {
        // Pénteken általában csak vacsora
        if (day === 'Péntek') {
          wantsLunch = false;
        }
      } else if (m.name === 'Botond' || m.name === 'Csabi') {
        if (day === 'Kedd' || day === 'Csütörtök') {
          wantsLunch = true;
          wantsDinner = true;
        }
      }

      records.push({
        id: `att-${m.id}-${day}`,
        date: dateStr,
        dayOfWeek: day,
        memberId: m.id,
        wantsLunch,
        wantsDinner,
      });
    });
  });

  return records;
}

// Initial member daily capacities (minutes)
export function generateInitialCapacities(): MemberDailyCapacity[] {
  const capacities: MemberDailyCapacity[] = [];
  DAYS_OF_WEEK.forEach((day) => {
    INITIAL_NOTION_MEMBERS.forEach((m) => {
      let mins = 30;
      if (day === 'Szombat' || day === 'Vasárnap') mins = 60;
      if (m.name === 'Attila' && day !== 'Péntek' && day !== 'Szombat') mins = 0;
      capacities.push({
        memberId: m.id,
        dayOfWeek: day,
        availableMinutes: mins,
      });
    });
  });
  return capacities;
}

// Initial Shopping List
export const INITIAL_NOTION_SHOPPING: ShoppingItem[] = [
  { id: 's-1', item: 'Csirkemellfilé', quantity: '1.5', unit: 'kg', category: '🥩 Hús', inStock: false, needsBuying: true, purchased: false, buyerMemberId: 'mem-apu', store: 'Hentes' },
  { id: 's-2', item: 'Brokkoli és sárgarépa', quantity: '1', unit: 'kg', category: '🥬 Zöldség', inStock: false, needsBuying: true, purchased: false, buyerMemberId: 'mem-marica', store: 'Zöldséges' },
  { id: 's-3', item: 'Durum spagetti', quantity: '2', unit: 'csomag', category: '🍚 Szárazáru', inStock: true, needsBuying: false, purchased: false },
  { id: 's-4', item: 'Tojás', quantity: '20', unit: 'db', category: '🥚 Tojás', inStock: false, needsBuying: true, purchased: false, buyerMemberId: 'mem-anyu', store: 'Piac' },
  { id: 's-5', item: 'Jázminrizs', quantity: '1', unit: 'kg', category: '🍚 Szárazáru', inStock: true, needsBuying: false, purchased: false },
  { id: 's-6', item: 'Főzőtejszín', quantity: '3', unit: 'doboz', category: '🥛 Tejtermék', inStock: false, needsBuying: true, purchased: false },
  { id: 's-7', item: 'Alma és banán', quantity: '2', unit: 'kg', category: '🍎 Gyümölcs', inStock: false, needsBuying: true, purchased: false },
  { id: 's-8', item: 'Mosogatógép tabletta', quantity: '1', unit: 'doboz', category: '🧼 Háztartás', inStock: false, needsBuying: true, purchased: false, store: 'DM' },
  { id: 's-9', item: 'Toalettpapír', quantity: '24', unit: 'tekercs', category: '🧻 Papíráru', inStock: true, needsBuying: false, purchased: false },
];

// Initial Pantry Items
export const INITIAL_NOTION_PANTRY: PantryItem[] = [
  { id: 'p-1', item: 'Olívaolaj', category: '🧂 Egyéb élelmiszer', inStock: true, quantity: '2 üveg', minQuantity: '1 üveg' },
  { id: 'p-2', item: 'Só & bors', category: '🧂 Egyéb élelmiszer', inStock: true, quantity: 'elegendő', minQuantity: '1 csomag' },
  { id: 'p-3', item: 'Búzadara / Bulgur', category: '🍚 Szárazáru', inStock: true, quantity: '800 g', minQuantity: '500 g' },
  { id: 'p-4', item: 'Zabpehely', category: '🍚 Szárazáru', inStock: true, quantity: '1 kg', minQuantity: '500 g' },
  { id: 'p-5', item: 'Hámozott paradicsom konzerv', category: '🥫 Konzerv', inStock: true, quantity: '4 doboz', minQuantity: '2 doboz' },
  { id: 'p-6', item: 'Szemeteszsák (60L)', category: '🧼 Háztartás', inStock: true, quantity: '2 tekercs', minQuantity: '1 tekercs' },
];

// Initial Weekly Meal Plan for the 7 days
export function generateInitialMealPlan(): WeeklyMealPlanItem[] {
  const weekDates = getCurrentWeekDates();
  const plan: WeeklyMealPlanItem[] = [];

  const mealMap: Record<DayOfWeek, { lunchRecipeId: string; dinnerRecipeId: string; cookLunchId: string; cookDinnerId: string }> = {
    'Hétfő': { lunchRecipeId: 'rec-1', dinnerRecipeId: 'rec-2', cookLunchId: 'mem-anyu', cookDinnerId: 'mem-marica' },
    'Kedd': { lunchRecipeId: 'rec-5', dinnerRecipeId: 'rec-10', cookLunchId: 'mem-marica', cookDinnerId: 'mem-anyu' },
    'Szerda': { lunchRecipeId: 'rec-7', dinnerRecipeId: 'rec-3', cookLunchId: 'mem-anyu', cookDinnerId: 'mem-marica' },
    'Csütörtök': { lunchRecipeId: 'rec-11', dinnerRecipeId: 'rec-4', cookLunchId: 'mem-marica', cookDinnerId: 'mem-anyu' },
    'Péntek': { lunchRecipeId: 'rec-17', dinnerRecipeId: 'rec-14', cookLunchId: 'mem-anyu', cookDinnerId: 'mem-marica' },
    'Szombat': { lunchRecipeId: 'rec-18', dinnerRecipeId: 'rec-9', cookLunchId: 'mem-marica', cookDinnerId: 'mem-anyu' },
    'Vasárnap': { lunchRecipeId: 'rec-8', dinnerRecipeId: 'rec-15', cookLunchId: 'mem-anyu', cookDinnerId: 'mem-anyu' },
  };

  weekDates.forEach(({ day, dateStr }) => {
    const config = mealMap[day];

    // Lunch: IMPORTANT - Packed in morning, prepared the evening before or early morning!
    plan.push({
      id: `plan-lunch-${day}`,
      date: dateStr,
      dayOfWeek: day,
      mealType: 'ebéd',
      recipeId: config.lunchRecipeId,
      eaterMemberIds: ['mem-anyu', 'mem-apu', 'mem-botond', 'mem-marica', 'mem-csabi', 'mem-akos'],
      cookMemberId: config.cookLunchId,
      isTakeaway: true,
      deadlineTime: 'Előző este vagy legkésőbb reggel 07:00 (dobozolva)',
      isLeftover: false,
      note: 'Elviteles ebéd: reggelre készen kell lennie!',
    });

    // Dinner
    plan.push({
      id: `plan-dinner-${day}`,
      date: dateStr,
      dayOfWeek: day,
      mealType: 'vacsora',
      recipeId: config.dinnerRecipeId,
      eaterMemberIds: ['mem-anyu', 'mem-apu', 'mem-botond', 'mem-marica', 'mem-csabi', 'mem-akos'],
      cookMemberId: config.cookDinnerId,
      isTakeaway: false,
      deadlineTime: 'Aznap este 19:00 (frissen tálalva)',
      isLeftover: false,
      note: 'Közös családi vacsora',
    });
  });

  return plan;
}
