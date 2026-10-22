# 🛠️ FamTask — Fejlesztői Dokumentáció (Developer Documentation)

Ez a dokumentum a **FamTask** (Családi Házimunka Kiosztó & Értékelő Rendszer) technológiai felépítését, belső működését, adatmodelljeit, üzleti logikáját, tesztelését és bővítési lehetőségeit részletezi mérnökök és fejlesztők számára.

---

## 1. Architektúra & Technológiai Verem (Architecture & Tech Stack)

A projekt egy kliensoldali, egyoldalas webalkalmazás (Single Page Application - SPA), amely modern webes szabványokra épül, minimális külső futásidejű függőséggel.

```
┌────────────────────────────────────────────────────────┐
│                   Böngésző Kliens                      │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │             React 19 + TypeScript                │  │
│  │   ┌──────────────────────────────────────────┐   │  │
│  │   │          App.tsx (Root State)            │   │  │
│  │   └──────┬───────────────┬────────────────┬──┘   │  │
│  │          │               │                │      │  │
│  │     UI Komponensek   Üzleti Logika    Szolgáltatás│  │
│  │    (Modals, Cards)    (rules.ts)    (Audio/Push) │  │
│  └──────────┬───────────────────────────────────────┘  │
│             │                                          │
│             ▼                                          │
│     LocalStorage API (Adatperzisztencia)               │
│     Web Audio API (Hangjelzések)                       │
│     Notification API (Böngésző Push értesítések)       │
└────────────────────────────────────────────────────────┘
```

### Főbb technológiák:
- **Keretrendszer**: [React 19](https://react.dev/) funkcionális komponensekkel és React Hook-okkal (`useState`, `useEffect`, `useMemo`).
- **Nyelv**: [TypeScript 5 / 7](https://www.typescriptlang.org/) szigorú típusbiztonsággal (`strict: true`).
- **Építőeszköz (Bundler)**: [Vite 8](https://vitejs.dev/) villámgyors HMR-rel (Hot Module Replacement) és ESM alapú fejlesztői kiszolgálóval.
- **Formázás (Styling)**: [Tailwind CSS v4](https://tailwindcss.com/) a `@tailwindcss/vite` beépülő modullal konfigurálva.
- **Ikonkészlet**: [lucide-react](https://lucide.dev/) (modern, fa-rázható SVG ikonok).
- **Animáció & Interakció**: [canvas-confetti](https://www.npmjs.com/package/canvas-confetti) és [motion](https://motion.dev/).
- **Hangok**: Natív HTML5 **Web Audio API** szintetizált frekvenciákkal (nincs szükség külső `.mp3` vagy `.wav` audio fájlokra).
- **Tesztelés**: Beépített **Node.js Test Runner** (`node:test`, `node:assert/strict`) a [tsx](https://github.com/privatenumber/tsx) segítségével TypeScript közvetlen futtatásához.

---

## 2. Könyvtárszerkezet és Komponens Hierarchia

```text
src/
├── components/                     # Megjelenítési komponensek (UI)
│   ├── ChoreCard.tsx               # Teendő kártya: státuszváltás, pontmegjelenítés, törlés
│   ├── ChoreModal.tsx              # Új teendő űrlap: felelős, kategória, gyakoriság, pont
│   ├── FamilySummaryBanner.tsx     # Családi heti metrikák, szűrősáv, vasárnapi kiemelés
│   ├── Header.tsx                  # Fejléc: családnév inline szerkesztés, perspektíva választó
│   ├── InAppNotificationToast.tsx  # Lebegő értesítések auto-dismiss időzítővel
│   ├── MemberManagementModal.tsx   # Családtag hozzáadása/törlése, avatár és színválasztó
│   ├── PushNotificationModal.tsx   # Napi push üzenetek tesztelése és kiküldése
│   └── SundayEvaluationModal.tsx   # Vasárnapi heti záró összegző és archívum böngésző
├── data/
│   └── initialData.ts              # Alapértelmezett mintaadatok az első indításhoz
├── services/
│   └── notificationService.ts      # Audio szintetizálás és Browser Notification kezelés
├── types/
│   └── index.ts                    # Központi TypeScript típusdefiníciók
├── utils/
│   ├── categories.ts               # Kategória címkék, színek és metaadatok
│   ├── rules.ts                    # Üzleti szabályok, hét- és pontszámítási algoritmusok
│   └── rules.test.ts               # Üzleti logika egységtesztjei
├── App.tsx                         # Fő komponens, állapot és LocalStorage szinkronizáció
├── index.css                       # Globális CSS stílusok
└── main.tsx                        # React DOM belépési pont
```

---

## 3. Adatmodellek & Típusdefiníciók (`src/types/index.ts`)

### `FamilyMember` (Családtag)
```typescript
export type MemberRole = 'Szülő' | 'Gyerek' | 'Egyéb';

export interface FamilyMember {
  id: string;                     // Egyedi azonosító, pl. "mem-1" vagy "mem-1729000000"
  name: string;                   // Családtag neve, pl. "Katalin (Anya)"
  role: MemberRole;               // Szerepkör a családban
  avatar: string;                 // Emoji azonosító, pl. "👩", "👦", "🐱"
  color: string;                  // Hex színkód vagy stílusosztály, pl. "#6366f1"
  joinedDate: string;             // Csatlakozás dátuma (YYYY-MM-DD)
  pointsTotal: number;            // Aktuálisan összegyűjtött pontok száma
  notificationsEnabled: boolean;  // Push értesítések bekapcsolva vannak-e
  notificationTime: string;       // Napi értesítés időpontja (HH:MM formátum, pl. "08:00")
}
```

### `Chore` (Házimunka / Feladat)
```typescript
export type ChoreCategory =
  | 'konyha'
  | 'rendrakas'
  | 'takaritas'
  | 'furdo'
  | 'kert_kint'
  | 'haziallat'
  | 'bevasarlas'
  | 'egyeb';

export type ChoreFrequency = 'egyszeri' | 'napi' | 'heti';

export interface Chore {
  id: string;                     // Egyedi azonosító, pl. "chore-1"
  title: string;                  // Feladat megnevezése
  description?: string;           // Részletes leírás (opcionális)
  assignedMemberId: string;       // A hozzárendelt családtag azonosítója
  category: ChoreCategory;        // Teendő kategóriája
  frequency: ChoreFrequency;      // Ismétlődés jellege
  points: number;                 // Elvégzésért járó jutalompont (pl. 10, 20, 50)
  isCompleted: boolean;           // Kész van-e a feladat
  completedAt: string | null;     // Befejezés időbélyege (ISO formátum)
  completedByMemberId: string | null; // Ki fejezte be ténylegesen
  dueDate: string;                // Határidő dátuma (YYYY-MM-DD)
  createdAt: string;              // Létrehozás időbélyege
  weekId: string;                 // ISO hét azonosítója, pl. "2026-W43"
}
```

### `WeeklyEvaluation` & `MemberWeeklyStat` (Vasárnapi Értékelés)
```typescript
export interface MemberWeeklyStat {
  memberId: string;
  memberName: string;
  memberAvatar: string;
  assignedCount: number;          // Hétre kiosztott feladatok száma
  completedCount: number;         // Elvégzett feladatok száma
  completionRate: number;         // Teljesítési arány százalékban (0 - 100)
  pointsEarned: number;           // Hét alatt szerzett pontok
  badge: string;                  // Elnyert jelvény (pl. "Hét Hőse 🏆")
  summaryNote: string;            // Személyre szabott bátorító üzenet
}

export interface WeeklyEvaluation {
  id: string;                     // Pl. "eval-2026-W42-1729000000"
  weekId: string;                 // "2026-W42"
  title: string;                  // Pl. "2026. 42. heti vasárnapi értékelés"
  startDate: string;
  endDate: string;                // Vasárnapi zárónap dátuma
  evaluatedAt: string;            // Mentés időbélyege
  totalAssigned: number;          // Családi összes kiosztott feladat
  totalCompleted: number;         // Családi összes elvégzett feladat
  overallRate: number;            // Családi össz-teljesítmény (százalék)
  mvpMemberId: string;            // A hét legszorgalmasabb tagjának ID-ja
  mvpMemberName: string;          // A hét legszorgalmasabb tagjának neve
  memberStats: MemberWeeklyStat[];// Tagonkénti bontás
  celebrationNote: string;        // Családi összegző dicséret
}
```

### `InAppNotification` (Belső Értesítés)
```typescript
export interface InAppNotification {
  id: string;
  memberId: string | 'all';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'daily_reminder' | 'task_completed' | 'weekly_summary' | 'member_joined';
}
```

---

## 4. Állapotkezelés & Adatperzisztencia (`App.tsx`)

Az alkalmazás állapota az `App.tsx` gyökérkomponensben él React Hook-okkal kezelve. Az adatok minden módosuláskor automatikusan elmentődnek a böngésző `window.localStorage` felületére.

### Helyi tárhely kulcsok (LocalStorage Keys):
| Kulcs | Típus | Leírás |
| :--- | :--- | :--- |
| `csalad_hazimunka_name_v1` | `string` | A család egyedi neve (pl. "Kovács Család") |
| `csalad_hazimunka_members_v1` | `JSON.stringify(FamilyMember[])` | Családtagok listája és pontszámaik |
| `csalad_hazimunka_chores_v1` | `JSON.stringify(Chore[])` | Minden kiadott és teljesített feladat |
| `csalad_hazimunka_evals_v1` | `JSON.stringify(WeeklyEvaluation[])` | Elmentett heti vasárnapi értékelések archívuma |

### Inicializálási logika:
```typescript
const [members, setMembers] = useState<FamilyMember[]>(() => {
  const saved = localStorage.getItem('csalad_hazimunka_members_v1');
  if (saved) {
    try { return JSON.parse(saved); } catch {}
  }
  return INITIAL_MEMBERS; // Fallback az initialData.ts-re
});
```

Ha a felhasználó első alkalommal nyitja meg az alkalmazást (vagy kiüríti a tárhelyet), az `INITIAL_MEMBERS`, `INITIAL_CHORES` és `INITIAL_EVALUATIONS` minták automatikusan betöltődnek.

---

## 5. Üzleti Logika & Algoritmusok (`src/utils/rules.ts`)

### 1. ISO-8601 Hét Azonosító (`getWeekId`)
Kiszámítja az adott dátum ISO szabvány szerinti évét és hetét (pl. `"2026-W43"`):
```typescript
export function getWeekId(dateInput: Date | string = new Date()): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : new Date(dateInput.getTime());
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}
```

### 2. Vasárnap detektálás (`isSunday`)
Megvizsgálja, hogy a mai nap vasárnap-e (`d.getDay() === 0`). A felületen elérhető egy **„Vasárnapi szimuláció”** kapcsoló is a fejlesztési és tesztelési célokra.

### 3. Jelvény- és dicséret-kiosztási szabályok (`getPerformanceBadgeAndNote`)
A teljesítési arány alapján automatikus rangot és magyar nyelvű értékelést generál:
- **0 kiosztott feladat**: `Pihenő Hét 🌴`
- **100%**: `Hét Hőse 🏆` („Fantasztikus! X az összes feladatát (100%) maradéktalanul elvégezte!”)
- **80% - 99%**: `Megbízható Bajnok ⭐` („Kiváló munka! X a feladatok Y%-át elvégezte...”)
- **50% - 79%**: `Szorgos Segítő 🌟` („Jó teljesítmény! X a feladatok felét megcsinálta...”)
- **0% - 49%**: `Újrapróbálkozó 💪` („X még Z feladatot hagyott hátra. Jövő héten közösen belehúzunk!”)

### 4. Heti Vasárnapi Összegzés & MVP számítás (`calculateWeeklyEvaluation`)
1. Kiszűri az aktuális `weekId`-hez tartozó feladatokat.
2. Tagonként kiszámítja az elvégzett / kiosztott darabszámot, arányt és a hét során gyűjtött pontokat.
3. Kiszámítja a családi összteljesítményt (`overallRate = totalCompleted / totalAssigned * 100`).
4. **MVP meghatározása**:
   - Elsődleges rendezési szempont: legtöbb elvégzett feladat (`completedCount`).
   - Holtverseny (tie-break) esetén: a szerzett pontok összege (`pointsEarned`).
5. Generál egy családi ünnepi szöveget (85% felett, 60-84% között és 60% alatt eltérő bátorítás).

### 5. Napi Push Értesítés Generáló (`generateDailyNotificationMessage`)
A megadott családtag még el nem végzett teendőit összesíti szöveges formában a natív értesítéshez:
- Ha nincs feladata: „Jó reggelt! Mára nincsenek elvégzendő házi feladataid. Élvezd a szabadidődet!”
- Ha van feladata: Megjeleníti a feladatok számát és az első 3 teendő nevét.

---

## 6. Értesítési és Audio Alrendszer (`src/services/notificationService.ts`)

### Szintetizált Hangjelzés (`playChimeSound`)
Külső médiafájlok helyett natív **Web Audio API** szintetizátort használ:
- **1. Oszcillátor (Szinusz hullám)**: D5 (587.33 Hz) $\to$ exponenciális felfutás A5 (880 Hz)-re 150 ms alatt.
- **2. Oszcillátor (Háromszög hullám)**: A5 (880 Hz) $\to$ exponenciális felfutás D6 (1174.66 Hz)-re 200 ms alatt.
- **Gain (Hangerő burkológörbe)**: 0.15 hangerőről exponenciális csillapítás 0.001-re 500 ms alatt.
- Eredmény: Tiszta, barátságos, modern csengő hangzás, amely nem igényel hálózati letöltést és azonnal megszólal.

### Push Értesítések (`sendBrowserNotification`)
- Lekéri és kezeli a böngésző engedélyt (`Notification.requestPermission()`).
- Támogatja az egyedi ikonokat és jelvényeket (`icon`, `badge`, `tag`).
- Párhuzamosan kezeli az asztali böngésző értesítést és a felületen megjelenő lebegő (`InAppNotificationToast`) buborékokat.

---

## 7. Tesztelés (Testing Guide)

A projekt a Node.js 18+ beépített tesztfuttatóját használja a `tsx` segédprogrammal kombinálva. A tesztek a `src/utils/rules.test.ts` fájlban találhatók.

### Tesztek futtatása:
```bash
npm test
# vagy közvetlenül:
npx tsx --test src/utils/rules.test.ts
# vagy Bun esetén:
bun test src/utils/rules.test.ts
```

### Lefedett tesztesetek:
- `isSunday`: Vasárnapi dátumok és hétköznapok helyes megkülönböztetése.
- `getPerformanceBadgeAndNote`: Jelvények és százalékos határok (100%, 80%, 50%, <50%).
- `calculateWeeklyEvaluation`: Családi átlag, tagonkénti bontás, és holtverseny esetén az MVP kiválasztása pontszám alapján.
- `generateDailyNotificationMessage`: Névre szóló értesítő szöveg és feladatlista összeállítása.
- `filterChores`: Szűrés tag, státusz (függőben/kész), kategória és szabadszavas keresés alapján.

---

## 8. Stílus és UI Konvenciók

- **Tailwind CSS v4**: `@tailwindcss/vite` plugin integráció, közvetlenül az `index.css`-ben.
- **Reszponzivitás**: Mobil-első megközelítés (Mobile First), rugalmas rácsrendszer (`grid-cols-1 md:grid-cols-2 lg:grid-cols-2`), érintőképernyő-barát vezérlőkkel.
- **Konzisztens Színkódok**: Minden családtaghoz egyedi szín tartozik (kártya bal oldali csíkja, avatár háttere), valamint minden feladat-kategóriához dedikált pasztell címkeszín (`CATEGORIES_META`).
- **Mikrointerakciók**: Kattintáskor finom animációk, azonnali vizuális visszajelzés (konfetti robbanás feladat pipálásakor és heti értékelés mentésekor).

---

## 9. Élesítés & Csomagolás (Production Deployment)

### Éles verzió készítése:
```bash
npm run build
```
A kimenet a `dist/` mappába kerül, amely tiszta, optimalizált statikus HTML/CSS/JS fájlokat tartalmaz.

### Telepítési lehetőségek:
1. **Statikus tárhelyek**: Vercel, Netlify, Cloudflare Pages, GitHub Pages vagy Firebase Hosting.
2. **Nginx / Apache**:
   Bármilyen webszerveren kiszolgálható a `dist/` mappa tartalma. SPA routing miatt minden kérést az `index.html`-re kell irányítani:
   ```nginx
   location / {
       try_files $uri $uri/ /index.html;
   }
   ```
3. **Docker Konténer**:
   ```dockerfile
   FROM node:20-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run build

   FROM nginx:alpine
   COPY --from=builder /app/dist /usr/share/nginx/html
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

---

## 10. Jövőbeli Bővítési Lehetőségek (Roadmap)

1. **Valós idejű szinkronizáció**: Kliensek közötti azonnali frissítés Supabase, Firebase vagy WebSockets segítségével.
2. **Google Gemini AI integráció**:
   - Házimunka ajánló a családtagok kora és preferenciái alapján.
   - Heti vasárnapi vicces vagy motiváló dicsérő vers/mese generálása a család heti munkájáról.
3. **PWA (Progressive Web App)**: Service Worker hozzáadása az offline működéshez és kezdőképernyőre való közvetlen telepítéshez.

