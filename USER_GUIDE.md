# 📖 FamTask — Részletes Felhasználói Útmutató (User Guide)

Üdvözlünk a **FamTask (Családi Házimunka Kiosztó & Értékelő)** rendszerében! Ez az útmutató bemutatja, hogyan teheti az alkalmazás egyszerűbbé, átláthatóbbá és szórakoztatóbbá az otthoni teendők megszervezését az egész család számára.

---

## 🎯 Tartalomjegyzék

1. [Mi az a FamTask?](#1-mi-az-a-famtask)
2. [Kezdő lépések & Család testreszabása](#2-kezdő-lépések--család-testreszabása)
3. [Családtagok kezelése](#3-családtagok-kezelése)
4. [Házimunkák kiosztása és szerkesztése](#4-házimunkák-kiosztása-és-szerkesztése)
5. [Feladatok elvégzése & Pontgyűjtés](#5-feladatok-elvégzése--pontgyűjtés)
6. [Nézetek, Szűrés és Keresés](#6-nézetek-szűrés-és-keresés)
7. [Vasárnapi Heti Értékelő & Archívum](#7-vasárnapi-heti-értékelő--archívum)
8. [Push és Belső Értesítések beállítása](#8-push-és-belső-értesítések-beállítása)
9. [Családi motivációs ötletek & Tippek](#9-családi-motivációs-ötletek--tippek)

---

## 1. Mi az a FamTask?

A FamTask egy modern családi feladatkezelő webalkalmazás, amely játékos formában ösztönzi az együttműködést:
- **Átláthatóság**: Mindenki látja, kinek mi a dolga mára vagy a hétre.
- **Játékosítás (Gamification)**: A feladatokért pontok járnak, elvégzésükkor konfetti és vidám hangjelzés jutalmaz.
- **Vasárnapi közös lezárás**: A hét végén kiértékelést tart a rendszer, ahol kihirdeti a **„Hét Hősét” (MVP)** és rangokat oszt.
- **Napi emlékeztetők**: Push értesítések segítik, hogy senki ne feledkezzen meg a vállalt feladatairól.

---

## 2. Kezdő lépések & Család testreszabása

Amikor először megnyitod az alkalmazást a böngésződben (pl. `http://localhost:3000`), a rendszer előre feltöltött mintaadatokkal (Kovács Család: Katalin, Péter, Dániel és Emma) mutatja be a működést.

### A család nevének átírása:
1. A képernyő bal felső részén keresd meg a családnevet (alapértelmezetten: **Kovács Család**).
2. Kattints a név melletti kis ceruza ✏️ ikonra (vagy magára a névre).
3. Írd be a saját családotok nevét (pl. *Nagy Család*, *Bajnok Család*).
4. Nyomj a zöld pipa gombra vagy nyomj **Enter**-t. A név azonnal elmentődik!

---

## 3. Családtagok kezelése

A családtagokat a felső sávban található **Családtagok** gombra kattintva, vagy a gyorsválasztó sáv végén lévő **„+ Új tag felvétele”** gombbal érheted el.

### Új családtag felvétele:
1. Kattints az **Új tag felvétele** gombra.
2. Töltsd ki az adatokat a felugró ablakban:
   - **Név**: A családtag keresztneve (pl. *Zsófi* vagy *Nagyi*).
   - **Szerepkör**: Válaszd ki: *Szülő*, *Gyerek* vagy *Egyéb*.
   - **Avatár (Emoji)**: Válassz egy szimpatikus figurát (👩, 👨, 👧, 👦, 👵, 👴, 🦸‍♂️, 🐱, 🐶 stb.).
   - **Egyedi Színkód**: Válaszd ki a tag saját színét (ezzel a színnel jelennek majd meg a feladatkártyái).
   - **Napi push értesítés ideje**: Hány órakor kapjon reggeli emlékeztetőt (pl. `08:00`).
   - **Értesítések engedélyezése**: Kapcsoló be/ki.
3. Kattints a zöld **„Családtag hozzáadása”** gombra.

### Családtag törlése:
A Családtagok kezelése ablak alján megtalálod a meglévő tagok listáját. A piros kuka 🗑️ ikonra kattintva bármelyik tag eltávolítható.

---

## 4. Házimunkák kiosztása és szerkesztése

Új teendőt a fejlécben lévő zöld **„+ Új feladat”** gombra vagy a feladatlista tetején lévő linkre kattintva vehetsz fel.

### A feladat űrlap mezői:
- **Feladat megnevezése** *(kötelező)*: Pl. *Mosogatógép bepakolása*, *Kutyasétáltatás*, *Portörlés*.
- **Részletes leírás / instrukciók** *(opcionális)*: Pl. *„Kérlek a szűrőt is öblítsd ki utána!”*
- **Felelős családtag**: Kihez tartozik a feladat? (A lenyíló menüből kiválasztható).
- **Kategória**:
  - 🍽️ **Konyha**: Főzés, mosogatás, asztalterítés.
  - ✨ **Rendrakás**: Szobarend, játékok elpakolása, ágybevetés.
  - 🧼 **Takarítás**: Porszívózás, felmosás, portörlés.
  - 🚿 **Fürdőszoba**: Csempe, mosdó, tükörtisztítás.
  - 🌳 **Kert & Kint**: Fűnyírás, viráglocsolás, sepregetés.
  - 🐾 **Háziállat**: Kutyasétáltatás, alomtakarítás, etetés.
  - 🛒 **Bevásárlás**: Heti bevásárlás, kenyérhozatal.
  - 📌 **Egyéb**: Minden egyéb háztartási teendő.
- **Gyakoriság**:
  - *Egyszeri*: Adott napra szóló egyedi feladat.
  - *Napi*: Mindennap ismétlődő kötelezettség.
  - *Heti*: Heti egyszer elvégzendő nagytakarítási feladat.
- **Határidő**: Melyik napig kell elkészülnie (alapértelmezett a mai nap).
- **Jutalompont**: 10, 15, 20, 25, 30 vagy 50 pont a nehézségtől függően.

Az **„Új feladat kiosztása”** gombra kattintva a feladat azonnal megjelenik a táblán, a felelős pedig kap egy belső értesítést.

---

## 5. Feladatok elvégzése & Pontgyűjtés

A feladatok kártyaként jelennek meg a felületen.

### Teendő kipipálása (Befejezés):
- Kattints a kártya bal oldalán található **kerek pipa gombra**.
- **Mi történik ekkor?**
  1. 🎊 **Konfetti eső** robban ki a képernyőn!
  2. 🔔 Megszólal egy **kellemes, vidám csengettyű hang**.
  3. A kártya átszíneződik zöldre és megjelenik rajta az elvégzés pontos ideje.
  4. A megadott pontszám **azonnal hozzáadódik** a családtag pontszámlálójához.
  5. Egy lebegő értesítés jelenik meg a jobb alsó sarokban, hogy mindenki értesüljön a sikerről!

### Feladat visszavonása:
Ha véletlenül pipáltál ki egy feladatot, kattints újra a zöld pipára. A rendszer visszavonja a befejezett állapotot, és levonja a tévesen jóváírt pontokat.

### Feladat törlése:
A kártya jobb felső sarkában lévő kis kuka 🗑️ ikonra kattintva a feladat véglegesen törölhető.

---

## 6. Nézetek, Szűrés és Keresés

A képernyő tetején található szűrősávval mindig pontosan azt láthatod, amire kíváncsi vagy:

### 1. Családtag szerinti nézőpont (Perspektíva)
- **Közös felület**: Az egész család összes feladatát mutatja egyben.
- **Egyéni nézet**: Kattints bármelyik családtag avatárjára a felső csíkban! Ekkor a tábla kizárólag az ő feladataira és személyes statisztikáira szűkül le.

### 2. Állapot szerinti szűrés
- **Összes**: Minden kiosztott feladat.
- **Függőben**: Csak az elvégzésre váró feladatok.
- **Kész**: A már sikeresen kipipált teendők.

### 3. Kategória szűrő
A lenyíló menüből kiválaszthatsz egy adott kategóriát (pl. csak a *Háziállat* vagy csak a *Konyha* feladatok).

### 4. Szöveges keresés
Kezdj el gépelni a nagyító melletti keresőmezőbe! A rendszer azonnal szűri a feladatokat mind a címben, mind a leírásban szereplő kulcsszavak alapján.

---

## 7. Vasárnapi Heti Értékelő & Archívum

A hét lezárásának csúcspontja a **Vasárnapi Értékelő**, ahol a család közösen áttekintheti az elért eredményeket.

### Mikor nyílik meg?
- **Vasárnaponként automatikusan**: Vasárnap a fejlécben és a bannerben egy ragyogó arany sáv jelenik meg: *„Ma Vasárnap Van! Kattints a heti értékelő megnyitásához!”*.
- **Hétköznapokon teszteléshez**: A családi banner jobb oldalán található **„Vasárnapi szimuláció”** gombbal bármikor bekapcsolhatod a vasárnapi módot, hogy megnézd, hogyan áll a család a hét közepén!

### Mit tartalmaz a heti értékelés?
1. **Családi Összteljesítmény**: Hány százalék készült el az összes kiadott feladatból (pl. 85%).
2. **A Hét Hőse (MVP) 🏆**: Az a családtag, aki a legtöbb feladatot végezte el a héten (holtverseny esetén a szerzett pontok döntenek).
3. **Személyes Teljesítmény Jelvények**:
   - 🏆 **Hét Hőse**: 100%-os elvégzés minden saját feladatra.
   - ⭐ **Megbízható Bajnok**: 80% vagy magasabb teljesítés.
   - 🌟 **Szorgos Segítő**: 50% feletti teljesítés.
   - 💪 **Újrapróbálkozó**: 50% alatti arány, bátorító üzenettel a következő hétre.
   - 🌴 **Pihenő Hét**: Ha a családtagnak nem volt kiosztott teendője.
4. **Heti Értékelés Elmentése**: A zöld gombra kattintva az értékelés elmentődik a történeti **Archívumba**, a képernyőn pedig konfetti ünneplés indul!
5. **Archívum fül**: Bármikor visszanézhetitek a korábbi hetek eredményeit, felidézve, ki hányszor volt a hét bajnoka.

---

## 8. Push és Belső Értesítések beállítása

A jobb felső sarokban található kék **harang 🔔 ikonra** kattintva nyílik meg az értesítési központ.

### 1. Böngésző Push engedélyezése:
1. Kattints az **„Értesítések engedélyezése a böngészőben”** gombra.
2. A böngésződ felugró ablakában válaszd az **„Engedélyezés”** (Allow) lehetőséget.
3. Ezután a rendszer akkor is tud értesítést küldeni, ha a böngésző lap épp a háttérben fut.

### 2. Napi emlékeztető küldése egy kattintással:
- **Egy tagnak**: Válaszd ki a tagot a listából, majd kattints a kék **„Napi értesítés küldése neki”** gombra.
- **Az egész családnak**: Kattints a **„Mindenkinek küldés”** gombra! Minden családtag kap egy összefoglalót a mára esedékes teendőiről.

### 3. Lebegő értesítő buborékok:
Minden feladatkiadásról, elvégzésről és heti értékelésről egy diszkrét buborék jelenik meg a jobb alsó sarokban. Ezek 6 másodperc után maguktól eltűnnek, de az **X** gombbal azonnal be is zárhatók.

---

## 9. Családi motivációs ötletek & Tippek

Hogyan hozzátok ki a legtöbbet a FamTaskból a mindennapokban?

1. **Közös vasárnapi megbeszélés (Családi Tanács)**:
   Vasárnap este üljetek le közösen 10 percre, nyissátok meg a **Vasárnapi Értékelőt**, tapsoljátok meg a Hét Hősét, majd osszátok be a következő hét fontos teendőit!
2. **Pontbeváltási jutalmak**:
   Találjatok ki a pontokhoz kézzelfogható családi élményeket! Például:
   - 100 pont: Extra 30 perc képernyőidő vagy esti mese.
   - 250 pont: Kedvenc ebéd választása vasárnapra.
   - 500 pont: Családi mozi- vagy állatkerti kirándulás.
3. **Konyhai vagy nappali közös kijelző**:
   Nyissátok meg az alkalmazást egy konyhai tableten vagy laptopon teljes képernyőn, így a gyerekek napközben bármikor odamehetnek büszkén kipipálni az elvégzett házimunkát!

---

Jó közös munkát és sok sikeres, tiszta hetet kívánunk a **FamTask**-kal! 🌟

