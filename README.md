# 🏡 FamTask — Családi Házimunka Kiosztó & Értékelő Rendszer

[![React](https://img.shields.io/badge/React-19.0-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x%20%2F%207.x-3178c6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646cff.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8.svg)](https://tailwindcss.com/)

Egy modern, reszponzív, játékosított (gamified) családi házimunka- és feladatkezelő webalkalmazás. Segít a családtagok közötti igazságos feladatelosztásban, pontgyűjtéssel motiválja a gyerekeket és felnőtteket, napi push értesítésekkel emlékeztet a teendőkre, valamint heti vasárnapi kiértékeléssel és archívummal ünnepli a közös sikereket.

---

## 📑 Dokumentációk / Documentations

| Dokumentum | Leírás / Description |
| :--- | :--- |
| **[README.md](README.md)** | Telepítés, indítás, parancsok és gyors áttekintés |
| **[DEVELOPER.md](DEVELOPER.md)** | Fejlesztői architektúra, típusok, üzleti logika, tesztelés és bővítés |
| **[USER_GUIDE.md](USER_GUIDE.md)** | Felhasználói kézikönyv lépésről lépésre, illusztrált útmutatóval |

---

## 🚀 Hogyan indítsd el a projektet? / How to Start

### 1. Előfeltételek (Prerequisites)

Győződj meg róla, hogy a számítógépeden telepítve van az alábbiak egyike:
- **Node.js**: v18.0.0 vagy újabb (ajánlott: Node.js 20 LTS vagy 22) és **npm** (v9+)
- *vagy* **Bun**: v1.0.0 vagy újabb (a projekt tartalmaz `bun.lock` fájlt is)
- *vagy* **pnpm** / **yarn**

Ellenőrzés a terminálban:
```bash
node -v
npm -v
# vagy
bun -v
```

> **Megjegyzés Windows felhasználóknak:** Amennyiben a `node` vagy `npm` parancs nem található, töltsd le és telepítsd a legfrissebb LTS verziót a hivatalos weboldalról: [https://nodejs.org/](https://nodejs.org/) (vagy Bun esetén: `powershell -c "irm bun.sh/install.ps1 | iex"`).

---

### 2. A projekt könyvtár megnyitása

Nyiss meg egy terminált (PowerShell, Command Prompt, Git Bash vagy VS Code beépített terminál), majd navigálj a projekt mappájába:
```bash
cd e:\Users\vcsab\Documents\FamTask
# vagy a saját elérési utad:
# cd /path/to/FamTask
```

---

### 3. Függőségek telepítése (Install Dependencies)

Futtasd az alábbi parancsot a szükséges csomagok letöltéséhez:

**npm használatával:**
```bash
npm install
```

**vagy Bun használatával:**
```bash
bun install
```

**vagy pnpm / yarn használatával:**
```bash
pnpm install
# vagy
yarn install
```

---

### 4. Környezeti változók (Opcionális)

A projekt a böngésző helyi tárhelyét (`localStorage`) használja a feladatok és tagok tárolásához, így **alapértelmezetten semmilyen külső API-kulcs vagy adatbázis nem szükséges az azonnali működéshez**.

Ha szeretnél egyedi `.env` beállításokat:
```bash
# Windows PowerShell:
Copy-Item .env.example .env

# Linux / macOS / Git Bash:
cp .env.example .env
```

---

### 5. Fejlesztői szerver indítása (Start Dev Server)

Indítsd el a Vite fejlesztői szervert:

**npm használatával:**
```bash
npm run dev
```

**vagy Bun használatával:**
```bash
bun run dev
```

Sikeres indítás esetén az alábbihoz hasonló kimenetet fogsz látni a konzolon:
```text
  VITE v8.3.0  ready in 280 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.x.x:3000/
  ➜  press h + enter to show help
```

Nyisd meg a böngésződben a megjelenő címet:
👉 **[http://localhost:3000](http://localhost:3000)**

---

### 6. További hasznos parancsok (Available Scripts)

| Parancs | Leírás |
| :--- | :--- |
| `npm run dev` | Fejlesztői szerver indítása HMR-rel (Hot Module Replacement) a 3000-es porton |
| `npm test` | Üzleti logikai egységtesztek futtatása (`tsx --test src/utils/rules.test.ts`) |
| `npm run lint` | TypeScript típusellenőrzés futtatása hibakereséshez (`tsc --noEmit`) |
| `npm run build` | Éles (production) csomag fordítása a `dist/` mappába |
| `npm run preview` | A lefordított éles verzió helyi előnézete a böngészőben |
| `npm run clean` | A fordítási kimenetek (`dist/`, `server.js`) törlése |

---

## ✨ Főbb funkciók (Key Features)

- 👥 **Családtagok kezelése**: Személyre szabott avatárok (emoji), szerepkörök (Szülő, Gyerek, Egyéb), egyedi színkódok és névre szóló pontszámlálók.
- 🧹 **Házimunka kiosztás kategóriákkal**: Konyha, Rendrakás, Takarítás, Fürdőszoba, Kert & Kint, Háziállat, Bevásárlás, Egyéb kategóriák ikonokkal és gyakorisággal (egyszeri, napi, heti).
- 🏆 **Játékosítás & Pontrendszer**: Elvégzett feladatok után konfetti animáció és kellemes hangjelzés (Web Audio API), azonnali pontjóváírással.
- 📅 **Vasárnapi Értékelő & Archívum**: Heti zárás, automatikus vagy szimulálható vasárnapi összegzés, a „Hét Hőse” (MVP) megválasztása, teljesítési jelvények és elmenthető heti történeti archívum.
- 🔔 **Push és belső értesítések**: Böngészős Web Notifications API támogatás, személyre szabott napi emlékeztető szövegek, egyéni értesítési idők beállítása, és azonnali lebegő (toast) értesítések.
- 🔍 **Részletes szűrés és keresés**: Családtag szerinti gyorsváltás, állapot szerinti szűrés (Összes / Függőben / Kész), kategória szűrő és szöveges keresőmező.
- 💾 **Perzisztens mentés**: Minden adat automatikusan mentésre kerül a böngésző `localStorage` tárhelyébe, így az oldal újratöltésekor sem vesznek el a teendők és pontok.

---

## 📂 Mappaszerkezet (Project Structure)

```text
FamTask/
├── .aistudio/                  # AI Studio konfigurációk és metaadatok
├── src/
│   ├── components/             # React felhasználói felület komponensek
│   │   ├── ChoreCard.tsx       # Egyedi házimunka kártya (kipipálás, konfetti, törlés)
│   │   ├── ChoreModal.tsx      # Új házimunka hozzáadása dialógus
│   │   ├── FamilySummaryBanner.tsx # Családi statisztikák, szűrők, vasárnapi szimuláció
│   │   ├── Header.tsx          # Felső fejléc, családnév szerkesztés, perspektíva váltó
│   │   ├── InAppNotificationToast.tsx # Lebegő push értesítés értesítőbuborékok
│   │   ├── MemberManagementModal.tsx # Családtag hozzáadása/törlése dialógus
│   │   ├── PushNotificationModal.tsx # Napi push értesítések küldése és beállításai
│   │   └── SundayEvaluationModal.tsx # Vasárnapi heti értékelő és archívum
│   ├── data/
│   │   └── initialData.ts      # Kezdeti mintaadatok (Kovács Család minta feladatokkal)
│   ├── services/
│   │   └── notificationService.ts # Hangjelzés generátor (Web Audio) és Push Notification API
│   ├── types/
│   │   └── index.ts            # TypeScript típusdefiníciók (Tag, Feladat, Értékelés stb.)
│   ├── utils/
│   │   ├── categories.ts       # Házimunka kategóriák, színek és ikon metaadatok
│   │   ├── rules.ts            # Üzleti logika: hét azonosítás, értékelés, jelvények, szűrés
│   │   └── rules.test.ts       # Node beépített tesztjei az üzleti logikára
│   ├── App.tsx                 # Fő alkalmazás komponens (állapotkezelés, LocalStorage)
│   ├── index.css               # Globális stílusok és Tailwind direktívák
│   └── main.tsx                # React gyökér mountolása
├── .env.example                # Környezeti változó sablon
├── bun.lock                    # Bun csomagkezelő zárolási fájl
├── index.html                  # HTML5 belépési pont
├── metadata.json               # Alkalmazás leíró metaadatok
├── package.json                # Függőségek és futtatható szkriptek
├── tsconfig.json               # TypeScript fordítási konfiguráció
├── vite.config.ts              # Vite konfiguráció (Tailwind v4 és React plugin)
├── DEVELOPER.md                # 🛠️ Részletes Fejlesztői Dokumentáció
└── USER_GUIDE.md               # 📖 Részletes Felhasználói Útmutató
```

---

## ❓ Gyakran Ismételt Kérdések a szerver indításáról (Troubleshooting)

### A port már foglalt (`Port 3000 is in use`)
Ha a 3000-es portot egy másik folyamat használja, indítsd el a Vite-ot másik porttal:
```bash
npx vite --port 3001
# vagy Bun-nal:
bun x vite --port 3001
```

### Nem működnek a hangok vagy az értesítések?
- **Hangok**: A modern böngészők megkövetelik a felhasználói interakciót (pl. egy kattintást az oldalon), mielőtt engedélyeznék a Web Audio API hangok lejátszását. Az első kattintás után a hang automatikusan megszólal.
- **Push értesítések**: Kattints a jobb felső harang (`Push Értesítések`) gombra, majd az **Értesítések engedélyezése** gombra, és válaszd az *Engedélyezés* (Allow) opciót a böngésző felugró ablakában.

### Szeretném visszaállítani a kezdeti mintaadatokat
Nyisd meg a böngésző fejlesztői eszköztárát (F12) -> `Application` (Alkalmazás) fül -> `Local Storage` -> töröld a `csalad_hazimunka_` kezdetű kulcsokat, majd töltsd újra az oldalt.

---

Jó munkát és kellemes családi összefogást a **FamTask** használatával! 🌟

