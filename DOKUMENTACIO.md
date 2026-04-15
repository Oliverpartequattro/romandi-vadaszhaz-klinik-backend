# Klinikai Időpontfoglaló Rendszer Backendje

## Címoldal

**Projekt neve:** Romandi Vádászhaz Klinik Időpontfoglaló Backend Rendszer

**Készítő:** Önként Említett Fejlesztő

**Szakterület:** Szoftverfejlesztés – Webalkalmazások

**Beadási dátum:** 2026. április 15.

**Verzió:** 1.0.0

---

## Tartalomjegyzék

1. [Bevezetés](#bevezetés)
2. [A projekt feladata és célja](#a-projekt-feladata-és-célja)
3. [Technológiai stack](#technológiai-stack)
4. [Projekt szerkezete](#projekt-szerkezete)
5. [Adatmodellek](#adatmodellek)
6. [API végpontok](#api-végpontok)
7. [Biztonsági megoldások](#biztonsági-megoldások)
8. [Hibakezelés és validáció](#hibakezelés-és-validáció)
9. [Fejlesztési útmutató](#fejlesztési-útmutató)
10. [Tesztelés](#tesztelés)
11. [Üzemeltetés](#üzemeltetés)
12. [Használt technológiák és függőségek](#használt-technológiák-és-függőségek)
13. [Irodalomjegyzék](#irodalomjegyzék)
14. [Mellékletek](#mellékletek)

---

## 1. Bevezetés

A jelen dokumentáció a **Romandi Vádászhaz Klinik Időpontfoglaló Rendszer backendjének** teljes technikai leírása. A rendszer egy webalapú alkalmazás, amely lehetővé teszi a páciensek számára az orvosi időpontok foglalását, az orvosok számára az elérhetőségek kezelését, valamint az adminisztrátorok számára a rendszer felügyeletét.

Ez az dokumentáció a backend fejlesztéseiről nyújt részletes információt, beleértve az architektúrát, az adatmodelleket, az API végpontokat, a biztonsági megoldásokat és az alkalmazott fejlesztési gyakorlatokat.

---

## 2. A projekt feladata és célja

### 2.1 Feladata

A rendszer célja, hogy egy modern, biztonságos és felhasználóbarát webalkalmazást biztosítson az orvosi praktika számára az alábbi funkcionalitásokkal:

- **Felhasználókezelés:** Három szerepkör (admin, orvos, pácienses) támogatása szükséges differenciált hozzáféréssel
- **Időpontfoglalás:** Páciensek számára lehetőség az orvosi időpontok foglalására az orvos szabad helyei alapján
- **Rendelési idők kezelése:** Orvosok számára saját rendelési idők beállítása és módosítása
- **Betegmappa:** Orvosok által készített vizsgálatok és diagnózisok rögzítése
- **Adminisztráció:** Teljes rendszer felügyelete, felhasználók kezelése, műveletek naplózása
- **E-mail értesítések:** Automatikus értesítések főző alapvető felhasználói eseményekről
- **API dokumentáció:** Interaktív Swagger UI dokumentáció az API végpontokról

### 2.2 Célkitűzések

Az alkalmazás fejlesztésének célkitűzései:

1. Biztonságos és skálázható backend infrastruktúra kiépítése
2. Megfelelő adatvédelem és autentikáció implementálása
3. Könnyen karbantartható és bővíthető kódbázis
4. Magas rendelkezésre állás és teljesítmény
5. Felhasználóbarát API interfész
6. Automata tesztelések és minőségbiztosítás

---

## 3. Technológiai stack

### 3.1 Backend keretrendszer

| Komponens | Technológia | Verzió | Leírás |
|-----------|-------------|--------|--------|
| Runtime | Node.js | 18+ | JavaScript futtatási környezet |
| Webkeret | Express.js | 5.2.1 | Minimalist webalkalmazás keretrendszer |
| Modulsystem | ES6 módulok | - | Natív JavaScript modulsystem |
| Adatbázis | MongoDB | 6.3.0 | NoSQL dokumentumalapú adatbázis |
| ORM | Mongoose | 9.1.6 | MongoDB objektum modellezés |

### 3.2 Biztonsági megoldások

| Komponens | Csomag | Verzió | Funkció |
|-----------|--------|--------|---------|
| JWT autentikáció | jsonwebtoken | 9.0.3 | Token alapú hitelesítés |
| Jelszó titkosítás | bcryptjs | 3.0.3 | Biztonságos jelszó háshálózás |
| HTTP fejlécek | helmet | 8.1.0 | Biztonsági HTTP fejlécek |
| Rate limiting | express-rate-limit | 8.2.1 | Brute-force támadások megakadályozása |
| CORS | cors | 2.8.6 | Eltérő forrásból érkező kérések kezelése |

### 3.3 Adatkezelés és formázás

| Komponens | Csomag | Verzió | Funkció |
|-----------|--------|--------|---------|
| Dátumkezelés | date-fns-tz | 3.2.0 | Időzóna-tudatos dátumműveletek |
| PDF generálás | pdfkit | 0.17.2 | PDF fájlok szoftveres előállítása |
| YAML feldolgozás | yamljs | 0.3.0 | YAML fájlok olvasása és feldolgozása |

### 3.4 API dokumentáció

| Komponens | Csomag | Verzió | Funkció |
|-----------|--------|--------|---------|
| Swagger JSDoc | swagger-jsdoc | 6.2.8 | Swagger dokumentáció autómatikus generálása |
| Swagger UI | swagger-ui-express | 5.0.1 | Interaktív API dokumentáció UI |

### 3.5 Email kommunikáció

| Komponens | Csomag | Verzió | Funkció |
|-----------|--------|--------|---------|
| Email küldés | nodemailer | 8.0.1 | SMTP alapú email küldés |

### 3.6 Fejlesztési és tesztelési eszközök

| Komponens | Csomag | Verzió | Leírás |
|-----------|--------|--------|---------|
| Teszt framework | jest | 30.3.0 | JavaScript tesztelési keretrendszer |
| HTTP tesztelés | supertest | 7.2.2 | Express alkalmazások tesztelése |
| In-memory DB | mongodb-memory-server | 11.0.1 | Teszt izolációhoz |
| Fejlesztési szerver | nodemon | - | Kód változásdetektálás és autoreload |

---

## 4. Projekt szerkezete

### 4.1 Könyvtárstruktúra

```
romandi-vadaszhaz-klinik-backend/
├── config/                    # Konfigurációs fájlok
│   └── db.js                 # MongoDB kapcsolatkezelés
├── docs/                      # API dokumentáció (Swagger YAML)
│   ├── user.swagger.yaml     # Felhasználó API def.
│   ├── appointment.swagger.yaml
│   ├── availability.swagger.yaml
│   ├── record.swagger.yaml
│   └── service.swagger.yaml
├── fonts/                     # PDF generáláshoz szükséges fájlok
├── jest/                      # Jest teszt konfigurációk
│   ├── setup.js
│   └── user.test.js
├── mail/                      # Email sablonok és küldés
│   └── mail.js
├── middleware/                # Express middleware-ek
│   ├── authMiddleware.js     # JWT autentikáció
│   └── errorMiddleware.js    # Hibakezelés
├── mock data/                 # Teszt adatok
│   ├── users.jsonl
│   ├── patients.jsonl
│   ├── doctors.jsonl
│   ├── appointments.jsonl
│   ├── services.jsonl
│   ├── records.jsonl
│   └── uploadData.js         # Adatok importálása
├── models/                    # Mongoose adatmodellek
│   ├── User.js               # Felhasználó séma
│   ├── Appointment.js        # Időpont séma
│   ├── Service.js            # Szolgáltatás séma
│   ├── Record.js             # Betegmappa séma
│   └── Availability.js       # Rendelési idők séma
├── pdfGenerator/              # PDF generálás
│   └── pdfGenerator.js
├── routes/                    # API végpontok
│   ├── userRoutes.js         # Felhasználó CRUD
│   ├── appointmentRoutes.js  # Időpont CRUD
│   ├── availabilityRoutes.js # Rendelési idők
│   ├── recordRoutes.js       # Betegmappa
│   ├── serviceRoutes.js      # Szolgáltatások
│   └── adminRoutes.js        # Admin műveletek
├── Schema/                    # Séma definíciók
├── tests/                     # HTTP tesztek (REST Client)
│   ├── userTests.http
│   ├── appointmentTests.http
│   ├── availabilityTests.http
│   ├── recordTests.http
│   ├── serviceTests.http
│   ├── adminTests.http
│   ├── statsTests.http
│   └── forgotPasswordTests.http
├── assets/                    # Statikus fájlok
├── package.json              # Node.js függőségek
├── server.js                 # Alkalmazás belépési pont
├── vercel.json              # Vercel deployment konfigurációja
└── README.md                # Projekt áttekintés
```

### 4.2 Fájlok leírása

**config/db.js:** Az adatbázis kapcsolat inicializálása MongoDB Atlas felé. Enviroment változóból olvassa az URI-t.

**middleware/authMiddleware.js:** JWT alapú autentikáció megvalósítása. A `protect` middleware biztosítja, hogy az API végpontok csak hitelesített felhasználók számára érhetőek el.

**middleware/errorMiddleware.js:** Centralizált hibakezelés. Feldolgozza a Mongoose validációs hibákat, duplikált kulcs lezárásokat és egyéb szerin hibákat.

**models/*.js:** Mongoose sémadefiniók a négy fő entitáshoz (User, Appointment, Service, Record, Availability).

**routes/*.js:** Express route kezelése végpontoknak. Minden route fájl egy entitás CRUD operációit tartalmazza.

**mail/mail.js:** Email sablonok és küldés funkció Nodemailer segítségével.

**jest/setup.js, jest/user.test.js:** Automata tesztek a felhasználói végpontok validálásához.

---

## 5. Adatmodellek

### 5.1 User (Felhasználó) modell

A User modell három szerepkörbe sorolható: ADMIN, DOCTOR és PATIENT. Az egyes szerepkörökhöz különböző kötelező mezők tartoznak.

#### Mezőgyűjtemény

| Mező | Típus | Kötelező | Leírás | Validáció |
|------|-------|----------|--------|-----------|
| `name` | String | Igen | Teljes név | Min. 3 karakter, max. 50 karakter |
| `email` | String | Igen | Email cím | Regex ellenőrzött, egyedi |
| `password` | String | Igen | Jelszó | Min. 8 karakter, betű és szám |
| `phone` | String | Igen | Telefonszám | Magyar formátum: +36 vagy 06 |
| `birthDate` | Date | Igen | Születési dátum | Érvényes dátum, 0-110 év közötti kor |
| `gender` | String | Igen | Nem | MALE vagy FEMALE |
| `role` | String | Igen | Felhasználó típusa | ADMIN, DOCTOR vagy PATIENT |
| `tajNumber` | String | Feltételes | TAJ szám (csak páciensek) | 9 számjegy, csak PATIENT-nél kötelező |
| `address` | String | Feltételes | Lakcím (csak páciensek) | Irányítószám + város, csak PATIENT-nél kötelező |
| `specialization` | String | Feltételes | Szakterület (csak orvosok) | Kötelező DOCTOR-nál |
| `records` | ObjectId[] | Nem | Betegmappa referenciák | Array of Record ObjectId |
| `availabilities` | ObjectId[] | Nem | Rendelési idők referenciái | Array of Availability ObjectId (DOCTOR) |
| `resetPasswordCode` | String | Nem | Jelszó-visszaállítási kód | Ideiglenes kód |
| `resetPasswordExpires` | Date | Nem | Jelszó kód lejárata | Kódhoz tartozó lejárati idő |
| `createdAt` | Date | Auto | Létrehozás dátuma | Automatikus timestamp |
| `updatedAt` | Date | Auto | Utolsó módosítás dátuma | Automatikus timestamp |

#### Validációs szabályok

- **Jelszó minősítés:** Legalább 8 karakter, tartalmaz betűt és számot
- **Email formátum:** Érvényes email cím, egyedi az adatbázisban
- **Telefonszám:** Magyar formátum, a 06 vagy +36 előtaggal kezdődhet
- **Születési dátum:** Az életkor 0 és 110 év között kell legyen
- **Szerep alapú validáció:** Páciensnek TAJ szám és lakcím szükséges, orvosnak szakterület

### 5.2 Appointment (Időpont) modell

Az Appointment modell az orvos és páciense közötti vizsgálati időpontot reprezentálja.

#### Mezőgyűjtemény

| Mező | Típus | Kötelező | Leírás |
|------|-------|----------|--------|
| `doctor_id` | ObjectId | Igen | Az orvos referenciája (User) |
| `patient_id` | ObjectId | Igen | A pácienes referenciája (User) |
| `service_id` | ObjectId | Igen | Az időpont típusa (Service referencia) |
| `startTime` | Date | Igen | Kezdési időpont |
| `endTime` | Date | Nem | Befejezési időpont |
| `status` | String | Igen | Állapot (PENDING, ACCEPTED, REJECTED, PROPOSED, CANCELLED, COMPLETED, CONFIRMED) |
| `referral_type` | String | Igen | Beutalás típusa (SELF vagy DOCTOR) |
| `referred_by` | ObjectId | Nem | Az orvos aki beutalta (csak DOCTOR referral_type esetén) |
| `created_by` | ObjectId | Nem | Az időpontot létrehozó felhasználó |
| `createdAt` | Date | Auto | Létrehozás dátuma |
| `updatedAt` | Date | Auto | Utolsó módosítás dátuma |

#### Állapotok

- **PENDING:** Az időpont beküldésre kerül, orvosra vár az elfogadás
- **CONFIRMED:** Az orvos jóváhagyta az időpontot
- **ACCEPTED:** A pácienes elfogadta az időpontot
- **REJECTED:** Az orvos elutasította az időpontot
- **PROPOSED:** Az orvos módosított az időponton, a páciensnek el kell fogadnia
- **CANCELLED:** Az időpont lemondásra került
- **COMPLETED:** A vizsgálat megtörtént

#### Validációs szabályok

- `startTime` nem lehet a múltban (új időpont esetén)
- `endTime` nagyobb kell legyen, mint `startTime`
- Az időpont nem lehet ütközés másik meglévő időponttal

### 5.3 Service (Szolgáltatás) modell

A Service modell az orvos által meghirdetett vizsgálattípust reprezentálja.

#### Mezőgyűjtemény

| Mező | Típus | Kötelező | Leírás |
|------|-------|----------|--------|
| `doctor_id` | ObjectId | Igen | Az orvos referenciája |
| `topic` | String | Igen | Vizsgálat típusa (pl. Kardiológia) |
| `description` | String | Igen | Részletes leírás |
| `location` | String | Igen | Vizsgálat helyszíne (pl. 204-es vizsgáló) |
| `date` | Date | Nem | Átvett időpontja |
| `price` | String | Igen | Ár (lehet szám vagy szöveg) |
| `patient_id` | ObjectId | Nem | A pácienes (ha már lefoglaltak) |
| `created_by` | ObjectId | Nem | A létrehozó felhasználó |
| `createdAt` | Date | Auto | Létrehozás dátuma |
| `updatedAt` | Date | Auto | Utolsó módosítás dátuma |

### 5.4 Record (Betegmappa) modell

A Record modell egy vizsgálat során feljegyzett adatokat (diagnózis, terrápia) tartalmazza.

#### Mezőgyűjtemény

| Mező | Típus | Kötelező | Leírás |
|------|-------|----------|--------|
| `patient` | ObjectId | Igen | A pácienes referenciája |
| `doctor` | ObjectId | Igen | Az orvos referenciája |
| `appointment_id` | ObjectId | Nem | Az időpont referenciája |
| `service` | ObjectId | Nem | A szolgáltatás referenciája |
| `description` | String | Igen | Vizsgálat leírása/eredménye |
| `createdAt` | Date | Auto | Rögzítés dátuma |
| `updatedAt` | Date | Auto | Utolsó módosítás dátuma |

### 5.5 Availability (Rendelési idők) modell

Az Availability modell az orvos rendelési ideit definiálja heti szinten.

#### Mezőgyűjtemény

| Mező | Típus | Kötelező | Leírás | Validáció |
|------|-------|----------|--------|-----------|
| `doctor` | ObjectId | Igen | Az orvos referenciája | |
| `dayOfWeek` | String | Igen | A nap magyar neve | Hétfő–Vasárnap |
| `startTime` | String | Igen | Rendelés kezdete | HH:mm formátum |
| `endTime` | String | Igen | Rendelés vége | HH:mm formátum |
| `slotDuration` | Number | Nem | Foglalási időköz percben | Min. 10 perc, default 30 |
| `isActive` | Boolean | Nem | Az orvos elérhető? | Default: true |
| `createdAt` | Date | Auto | Létrehozás dátuma | |
| `updatedAt` | Date | Auto | Utolsó módosítás dátuma | |

#### Validációs szabályok

- Egy orvosnak egy napra csak egy rendelési idő lehet (unique index)
- `dayOfWeek` csak érvényes magyar napnév lehet
- Időformátum: HH:mm (pl. 08:00, 16:30)
- `slotDuration` minimum 10 perc

---

## 6. API végpontok

### 6.1 Felhasználó végpontok (/api/users)

#### 6.1.1 Felhasználók listázása

**Végpont:** `GET /api/users`

**Autentikáció szükséges:** Igen (Admin)

**Leírás:** Az összes felhasználó lekérése az adatbázisból.

**Válasz:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Dr. Szabó János",
    "email": "szabo.janos@klinik.hu",
    "phone": "+3630123456",
    "role": "DOCTOR",
    "specialization": "Kardiológia",
    "createdAt": "2026-03-10T10:30:00Z"
  }
]
```

#### 6.1.2 Orvosok listázása

**Végpont:** `GET /api/users/doctors`

**Autentikáció szükséges:** Nem

**Leírás:** Az összes orvos lekérése az elérhetőségek adataival.

**Válasz:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Dr. Szabó János",
    "specialization": "Kardiológia",
    "email": "szabo.janos@klinik.hu",
    "phone": "+3630123456",
    "availabilities": [
      {
        "_id": "607f1f77bcf86cd799439021",
        "dayOfWeek": "Hétfő",
        "startTime": "08:00",
        "endTime": "16:00",
        "slotDuration": 30
      }
    ]
  }
]
```

#### 6.1.3 Páciensek listázása

**Végpont:** `GET /api/users/patients`

**Autentikáció szükséges:** Igen (Doctor vagy Admin)

**Leírás:** Az összes páciense lekérése.

**Válasz:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Nagy Péter",
    "email": "nagy.peter@email.hu",
    "phone": "+3620123456",
    "role": "PATIENT",
    "tajNumber": "123456789",
    "address": "1051 Budapest, Magyar utca 10.",
    "gender": "MALE",
    "birthDate": "1975-06-15T00:00:00Z"
  }
]
```

#### 6.1.4 Regisztráció

**Végpont:** `POST /api/users/register`

**Autentikáció szükséges:** Nem

**Leírás:** Új felhasználó regisztrálása az adatbázisban.

**Kérés törzse:**
```json
{
  "name": "Nagy Péter",
  "email": "nagy.peter@email.hu",
  "password": "Jelszo123",
  "phone": "+3620123456",
  "birthDate": "1975-06-15",
  "gender": "MALE",
  "role": "PATIENT",
  "tajNumber": "123456789",
  "address": "1051 Budapest, Magyar utca 10."
}
```

**Sikeres válasz (201):**
```json
{
  "success": true,
  "_id": "507f1f77bcf86cd799439012",
  "name": "Nagy Péter",
  "email": "nagy.peter@email.hu",
  "role": "PATIENT",
  "token": "eyJhbGc..."
}
```

**Hiba válasz (400):**
```json
{
  "success": false,
  "message": "Validációs hiba",
  "errors": {
    "tajNumber": "A TAJ számnak pontosan 9 számjegyből kell állnia",
    "password": "A jelszónak legalább 8 karakterből kell állnia, és tartalmaznia kell betűt és számot is"
  }
}
```

#### 6.1.5 Bejelentkezés

**Végpont:** `POST /api/users/login`

**Autentikáció szükséges:** Nem

**Leírás:** Felhasználó bejelentkezése JWT token generálásával.

**Kérés törzse:**
```json
{
  "email": "nagy.peter@email.hu",
  "password": "Jelszo123"
}
```

**Sikeres válasz (200):**
```json
{
  "success": true,
  "_id": "507f1f77bcf86cd799439012",
  "name": "Nagy Péter",
  "email": "nagy.peter@email.hu",
  "role": "PATIENT",
  "token": "eyJhbGc..."
}
```

**Hiba válasz (401):**
```json
{
  "success": false,
  "message": "Érvénytelen email vagy jelszó"
}
```

#### 6.1.6 Saját profil lekérése

**Végpont:** `GET /api/users/profile`

**Autentikáció szükséges:** Igen

**Leírás:** A bejelentkezett felhasználó teljes profil adatainak lekérése. Páciensek számára az összes betegmappa és időpont információ is megérkezik.

**Válasz:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Nagy Péter",
  "email": "nagy.peter@email.hu",
  "phone": "+3620123456",
  "role": "PATIENT",
  "tajNumber": "123456789",
  "address": "1051 Budapest, Magyar utca 10.",
  "birthDate": "1975-06-15T00:00:00Z",
  "records": [
    {
      "_id": "607f1f77bcf86cd799439025",
      "description": "Szívultrahang normális. Nincs eltérés.",
      "doctor": {
        "name": "Dr. Szabó János",
        "specialization": "Kardiológia"
      },
      "createdAt": "2026-04-10T14:00:00Z"
    }
  ],
  "appointments": [
    {
      "_id": "707f1f77bcf86cd799439026",
      "doctor_id": {...},
      "startTime": "2026-04-20T10:00:00Z",
      "status": "CONFIRMED"
    }
  ]
}
```

#### 6.1.7 Profil módosítása

**Végpont:** `PUT /api/users/profile`

**Autentikáció szükséges:** Igen

**Leírás:** A bejelentkezett felhasználó profiljának módosítása.

**Fontos:** Csak azokat a mezőket küldjük el, amiket módosítani szeretnénk. Ha a jelszó üres, a szerver nem futtat validációt rá.

**Kérés törzse (részleges frissítés):**
```json
{
  "name": "Nagy Péter Új",
  "phone": "+3620123457"
}
```

**Sikeres válasz (200):**
```json
{
  "success": true,
  "message": "Profil sikeresen frissítve",
  "user": {...}
}
```

#### 6.1.8 Jelszó módosítása

**Végpont:** `PUT /api/users/change-password`

**Autentikáció szükséges:** Igen

**Leírás:** A bejelentkezett felhasználó jelszavának módosítása.

**Kérés törzse:**
```json
{
  "oldPassword": "RégiJelszo123",
  "newPassword": "UjJelszo456"
}
```

**Sikeres válasz (200):**
```json
{
  "success": true,
  "message": "Jelszó sikeresen módosítva"
}
```

#### 6.1.9 Kijelentkezés

**Végpont:** `POST /api/users/logout`

**Autentikáció szükséges:** Igen

**Leírás:** Felhasználó kijelentkezése. A kliensoldali token-t törölni kell a localStorage-ből.

**Sikeres válasz (200):**
```json
{
  "success": true,
  "message": "Sikeresen kijelentkeztél"
}
```

### 6.2 Időpont végpontok (/api/appointments)

#### 6.2.1 Összes időpont lekérése

**Végpont:** `GET /api/appointments`

**Autentikáció szükséges:** Igen (Admin)

**Leírás:** Az összes időpont lekérése az adatbázisból részletes információkkal.

**Válasz:**
```json
[
  {
    "_id": "707f1f77bcf86cd799439026",
    "doctor_id": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Dr. Szabó János",
      "specialization": "Kardiológia"
    },
    "patient_id": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Nagy Péter",
      "email": "nagy.peter@email.hu"
    },
    "service_id": {...},
    "startTime": "2026-04-20T10:00:00Z",
    "endTime": "2026-04-20T10:30:00Z",
    "status": "CONFIRMED",
    "referral_type": "SELF",
    "createdAt": "2026-04-15T16:30:00Z"
  }
]
```

#### 6.2.2 Új időpont foglalása

**Végpont:** `POST /api/appointments`

**Autentikáció szükséges:** Igen

**Leírás:** Pácienes vagy orvos által új időpont foglalása. A rendszer automatikusan ellenőrzi az orvos rendelési idejét és az ütközéseket.

**Kérés törzse:**
```json
{
  "doctor_id": "507f1f77bcf86cd799439011",
  "service_id": "607f1f77bcf86cd799439023",
  "startTime": "2026-04-20T10:00:00Z",
  "endTime": "2026-04-20T10:30:00Z",
  "referral_type": "SELF"
}
```

**Sikeres válasz (201):**
```json
{
  "success": true,
  "appointment": {
    "_id": "707f1f77bcf86cd799439026",
    "doctor_id": "507f1f77bcf86cd799439011",
    "patient_id": "507f1f77bcf86cd799439012",
    "startTime": "2026-04-20T10:00:00Z",
    "status": "PENDING",
    "createdAt": "2026-04-15T16:30:00Z"
  }
}
```

**Hiba válasz (400):**
```json
{
  "message": "Az időpont nem lehet a múltban!"
}
```

#### 6.2.3 Időpont státusza módosítása

**Végpont:** `PUT /api/appointments/{appointmentId}`

**Autentikáció szükséges:** Igen

**Leírás:** Az orvos által az időpont státusza módosítható (elfogadás, elutasítás, módosítás).

**Kérés törzse:**
```json
{
  "status": "CONFIRMED"
}
```

**Sikeres válasz (200):**
```json
{
  "success": true,
  "message": "Időpont státusza frissítve"
}
```

#### 6.2.4 Időpont lemondása

**Végpont:** `DELETE /api/appointments/{appointmentId}`

**Autentikáció szükséges:** Igen

**Leírás:** Időpont lemondása (státusz CANCELLED-re állítása).

**Sikeres válasz (200):**
```json
{
  "success": true,
  "message": "Időpont sikeresen lemondva"
}
```

### 6.3 Rendelési idők végpontok (/api/availability)

#### 6.3.1 Saját rendelési idők lekérése

**Végpont:** `GET /api/availability`

**Autentikáció szükséges:** Igen (Doctor)

**Leírás:** Az orvos saját rendelési idejét kéri le.

**Válasz:**
```json
[
  {
    "_id": "607f1f77bcf86cd799439021",
    "dayOfWeek": "Hétfő",
    "startTime": "08:00",
    "endTime": "16:00",
    "slotDuration": 30,
    "isActive": true,
    "createdAt": "2026-02-01T09:00:00Z"
  },
  {
    "_id": "607f1f77bcf86cd799439022",
    "dayOfWeek": "Szerda",
    "startTime": "09:00",
    "endTime": "17:00",
    "slotDuration": 30,
    "isActive": true
  }
]
```

#### 6.3.2 Rendelési idő létrehozása

**Végpont:** `POST /api/availability`

**Autentikáció szükséges:** Igen (Doctor)

**Leírás:** Az orvos létrehozza saját rendelési idejét egy adott napra.

**Kérés törzse:**
```json
{
  "dayOfWeek": "Hétfő",
  "startTime": "08:00",
  "endTime": "16:00",
  "slotDuration": 30
}
```

**Sikeres válasz (201):**
```json
{
  "success": true,
  "_id": "607f1f77bcf86cd799439021",
  "message": "Rendelési idő sikeresen létrehozva"
}
```

**Hiba válasz (400):**
```json
{
  "message": "Validációs hiba",
  "errors": {
    "dayOfWeek": "Érvénytelen nap: Valamelyik"
  }
}
```

#### 6.3.3 Rendelési idő módosítása

**Végpont:** `PUT /api/availability/{availabilityId}`

**Autentikáció szükséges:** Igen (Doctor)

**Leírás:** A rendelési idő adatainak módosítása.

**Kérés törzse:**
```json
{
  "startTime": "09:00",
  "endTime": "17:00",
  "isActive": false
}
```

**Sikeres válasz (200):**
```json
{
  "success": true,
  "message": "Rendelési idő frissítve"
}
```

#### 6.3.4 Rendelési idő törlése

**Végpont:** `DELETE /api/availability/{availabilityId}`

**Autentikáció szükséges:** Igen (Doctor/Admin)

**Leírás:** A rendelési idő teljes törlése.

**Sikeres válasz (200):**
```json
{
  "success": true,
  "message": "Rendelési idő sikeresen törölve"
}
```

### 6.4 Betegmappa végpontok (/api/records)

#### 6.4.1 Saját betegmappák lekérése

**Végpont:** `GET /api/records`

**Autentikáció szükséges:** Igen

**Leírás:** 
- Páciensek: saját betegmappák
- Orvosok: összes páciensa betegmappái

**Válasz:**
```json
[
  {
    "_id": "607f1f77bcf86cd799439025",
    "patient": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Nagy Péter"
    },
    "doctor": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Dr. Szabó János"
    },
    "description": "Szívultrahang normális. Nincs eltérés.",
    "createdAt": "2026-04-10T14:00:00Z"
  }
]
```

#### 6.4.2 Új betegmappa rögzítése

**Végpont:** `POST /api/records`

**Autentikáció szükséges:** Igen (Doctor)

**Leírás:** Az orvos egy vizsgálat után rögzít egy betegmappát.

**Kérés törzse:**
```json
{
  "patient": "507f1f77bcf86cd799439012",
  "appointment_id": "707f1f77bcf86cd799439026",
  "service": "607f1f77bcf86cd799439023",
  "description": "Szívultrahang normális. Nincs eltérés. Terrápia: pravasztatin 20mg naponta 1x"
}
```

**Sikeres válasz (201):**
```json
{
  "success": true,
  "record": {
    "_id": "607f1f77bcf86cd799439025",
    "patient": "507f1f77bcf86cd799439012",
    "doctor": "507f1f77bcf86cd799439011",
    "description": "Szívultrahang normális. Nincs eltérés.",
    "createdAt": "2026-04-10T14:00:00Z"
  }
}
```

#### 6.4.3 Betegmappa módosítása

**Végpont:** `PUT /api/records/{recordId}`

**Autentikáció szükséges:** Igen (Doctor)

**Leírás:** Betegmappa adatainak módosítása.

**Kérés törzse:**
```json
{
  "description": "Szívultrahang normális. Nincs eltérés. Terrápia módosítva: pravasztatin 40mg naponta 1x"
}
```

**Sikeres válasz (200):**
```json
{
  "success": true,
  "message": "Betegmappa sikeresen frissítve"
}
```

#### 6.4.4 Betegmappa törlése

**Végpont:** `DELETE /api/records/{recordId}`

**Autentikáció szükséges:** Igen (Doctor/Admin)

**Leírás:** Betegmappa törlése.

**Sikeres válasz (200):**
```json
{
  "success": true,
  "message": "Betegmappa sikeresen törölve"
}
```

### 6.5 Szolgáltatások végpontok (/api/services)

#### 6.5.1 Összes szolgáltatás lekérése

**Végpont:** `GET /api/services`

**Autentikáció szükséges:** Nem

**Leírás:** Az összes szolgáltatás lekérése az adatbázisból.

**Válasz:**
```json
[
  {
    "_id": "607f1f77bcf86cd799439023",
    "doctor_id": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Dr. Szabó János"
    },
    "topic": "Kardiológia",
    "description": "Szívultrahang és konzultáció",
    "location": "204-es vizsgáló",
    "date": "2026-04-20T10:00:00Z",
    "price": "25000",
    "createdAt": "2026-04-10T09:00:00Z"
  }
]
```

#### 6.5.2 Új szolgáltatás létrehozása

**Végpont:** `POST /api/services`

**Autentikáció szükséges:** Igen (Doctor/Admin)

**Leírás:** Új szolgáltatás (vizsgálattípus) létrehozása.

**Kérés törzse:**
```json
{
  "topic": "Kardiológia",
  "description": "Szívultrahang és konzultáció",
  "location": "204-es vizsgáló",
  "date": "2026-04-20T10:00:00Z",
  "price": "25000"
}
```

**Sikeres válasz (201):**
```json
{
  "success": true,
  "service": {
    "_id": "607f1f77bcf86cd799439023",
    "topic": "Kardiológia",
    "description": "Szívultrahang és konzultáció",
    "location": "204-es vizsgáló",
    "price": "25000",
    "createdAt": "2026-04-10T09:00:00Z"
  }
}
```

#### 6.5.3 Szolgáltatás módosítása

**Végpont:** `PUT /api/services/{serviceId}`

**Autentikáció szükséges:** Igen (Doctor/Admin)

**Leírás:** Szolgáltatás adatainak módosítása.

**Kérés törzse:**
```json
{
  "price": "30000",
  "description": "Szívultrahang, EKG és konzultáció"
}
```

**Sikeres válasz (200):**
```json
{
  "success": true,
  "message": "Szolgáltatás sikeresen frissítve"
}
```

#### 6.5.4 Szolgáltatás törlése

**Végpont:** `DELETE /api/services/{serviceId}`

**Autentikáció szükséges:** Igen (Doctor/Admin)

**Leírás:** Szolgáltatás törlése.

**Sikeres válasz (200):**
```json
{
  "success": true,
  "message": "Szolgáltatás sikeresen törölve"
}
```

### 6.6 Admin végpontok (/api/admin)

#### 6.6.1 Statisztikák lekérése

**Végpont:** `GET /api/admin/stats`

**Autentikáció szükséges:** Igen (Admin)

**Leírás:** Az alkalmazás statisztikai adatai (felhasználók száma, időpontok száma, stb.).

**Válasz:**
```json
{
  "totalUsers": 35,
  "totalDoctors": 5,
  "totalPatients": 30,
  "totalAppointments": 120,
  "appointmentsByStatus": {
    "PENDING": 5,
    "CONFIRMED": 85,
    "COMPLETED": 25,
    "CANCELLED": 5
  },
  "totalRecords": 110,
  "totalServices": 40
}
```

#### 6.6.2 Felhasználó törlése

**Végpont:** `DELETE /api/admin/users/{userId}`

**Autentikáció szükséges:** Igen (Admin)

**Leírás:** Admin által felhasználó teljes törlése az adatbázisból.

**Sikeres válasz (200):**
```json
{
  "success": true,
  "message": "Felhasználó sikeresen törölve"
}
```

---

## 7. Biztonsági megoldások

### 7.1 Autentikáció

Az alkalmazás JWT (JSON Web Token) alapú autentikációt használ. A bejelentkezés után a felhasználó egy token-t kap, amelyet minden védett API kérésnél az `Authorization` fejlécben kell elküldenie.

**Token generálása:**
```javascript
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};
```

**Token ellenőrzése (Middleware):**
```javascript
export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        next();
    } else {
        res.status(401).json({ message: 'Nincs jogosultság, nincs token' });
    }
};
```

**Felhasználás az API-ban:**
```
Authorization: Bearer eyJhbGc...
```

### 7.2 Szerepalapú hozzáférés kontrollja (RBAC)

Az alkalmazás három szerepkört támogat: ADMIN, DOCTOR, PATIENT. Az egyes szerepkörökhöz különféle middleware-ek biztosítják a hozzáférés-ellenőrzést.

**Admin middleware:**
```javascript
export const admin = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        res.status(403).json({ message: 'Nincs jogosultságod, nem vagy admin!' });
    }
};
```

**Orvos vagy Admin middleware:**
```javascript
export const doctorOrAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'DOCTOR' || req.user.role === 'ADMIN')) {
        next();
    } else {
        res.status(403).json({ message: 'Nincs jogosultságod!' });
    }
};
```

### 7.3 Jelszó titkosítása

A felhasználói jelszavak bcryptjs segítségével titkosított (hash) formában tárolódnak az adatbázisban. A titkosítás 10-es salt szinttel történik.

**Pre-save hook:**
```javascript
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw new Error("Jelszó titkosítási hiba: " + error.message);
  }
});
```

**Jelszó ellenőrzése:**
```javascript
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
```

### 7.4 Rate Limiting (Brute-force védelem)

Az Express Rate Limit middleware korlátozza az API hívások számát IP címenként, megakadályozva a brute-force támadásokat.

**Konfiguráció:**
```javascript
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 perc
    max: 100, // IP-nként maximum 100 kérés az időablakban
    message: "Túl sok kérés érkezett erről az IP címről...",
});

app.use("/api", limiter);
```

### 7.5 HTTP biztonsági fejlécek (Helmet)

A Helmet middleware biztonsági HTTP fejléceket állít be, védelmet nyújtva az XSS, clickjacking és más támadások ellen.

**Konfiguráció:**
```javascript
app.use(helmet({
    contentSecurityPolicy: false,
}));
```

### 7.6 CORS (Cross-Origin Resource Sharing)

A CORS middleware kezeli az eltérő forrásból érkező kéréseket.

**Konfiguráció:**
```javascript
app.use(cors());
```

### 7.7 Validáció és Szanitáció

**Mongoose sémák validációja:**
- Email címek regex ellenőrzése
- Jelszó összetettségi követelmények
- Telefonszámok formátuma
- TAJ számok hossza és természete
- Születési dátum validációja

**Enviroment változók:**
Az érzékeny adatok (JWT_SECRET, MONGO_URI, email jelszó) enviroment változóban tárolódnak, nem a forráskódban.

---

## 8. Hibakezelés és validáció

### 8.1 Centralizált hibakezelés

Az alkalmazás centralizált hibakezelési rendszert használ az `errorMiddleware.js` segítségével.

**ErrorResponse osztály:**
```javascript
class ErrorResponse extends Error {
    constructor(message, statusCode, errors = null) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
    }
}
```

**Error Handler Middleware:**
```javascript
const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Szerver hiba történt';
    let errors = err.errors || null;

    // Mongoose validációs hiba kezelése
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = "Validációs hiba";
        errors = {};
        
        Object.values(err.errors).forEach(val => {
            errors[val.path] = val.message;
        });
    }

    // Duplikált kulcs hiba (pl. email)
    if (err.code === 11000) {
        statusCode = 400;
        message = "Validációs hiba";
        const field = Object.keys(err.keyValue)[0];
        errors = { [field]: `Ez a(z) ${field} már foglalt!` };
    }

    res.status(statusCode).json({
        success: false,
        message: message,
        errors: errors
    });
};
```

### 8.2 Validációs hibák struktúrája

**Szűkség szerű válasz:**
```json
{
  "success": false,
  "message": "Validációs hiba",
  "errors": {
    "tajNumber": "A TAJ számnak pontosan 9 számjegyből kell állnia",
    "password": "A jelszónak legalább 8 karakterből kell állnia, és tartalmaznia kell betűt és számot is",
    "email": "Ez az email cím már foglalt."
  }
}
```

### 8.3 Jellemző hibakódok

| HTTP kód | Leírás | Gyakori okok |
|----------|--------|-------------|
| 200 | OK | Sikeres kérés |
| 201 | Created | Sikeres erőforrás létrehozás |
| 400 | Bad Request | Validációs hiba, hiányzó mező |
| 401 | Unauthorized | Hiányzó vagy érvénytelen token |
| 403 | Forbidden | Nincs megfelelő jogosultság |
| 404 | Not Found | Erőforrás nem található |
| 409 | Conflict | Ütközés (pl. már foglalt időpont) |
| 500 | Internal Server Error | Szerver oldali hiba |

---

## 9. Fejlesztési útmutató

### 9.1 Fejlesztési környezet beállítása

#### 9.1.1 Előfeltételek

- Node.js 18+ verzió
- MongoDB Atlas fiók és adatbázis
- Git verziókezelő
- Visual Studio Code vagy más kódszerkesztő

#### 9.1.2 Telepítés és indítás

1. **Repó klónozása:**
```bash
git clone https://github.com/user/romandi-vadaszhaz-klinik-backend.git
cd romandi-vadaszhaz-klinik-backend
```

2. **Függőségek telepítése:**
```bash
npm install
```

3. **.env fájl létrehozása:**
```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/klinik?retryWrites=true&w=majority
JWT_SECRET=szupertitkosjelszorelyegvagybarmitehetsz
JWT_EXPIRE=30d
GMAIL_USER=email@gmail.com
GMAIL_PASS=app-specific-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

4. **Development szerver elindítása:**
```bash
npm run dev
```

A szerver alapértelmezetten `http://localhost:5000` porton fut.

### 9.2 Kódszervezés és konvenciók

#### 9.2.1 Fájlszerkezet

- **Models:** Mongoose sémák egy fájlban
- **Routes:** Express route kezelés, CRUD operációkkal
- **Middleware:** Autentikáció, hibakezelés, loggolás
- **Utils:** Segédfüggvények (e-mail küldés, PDF generálás, stb.)
- **Tests:** Jest tesztek és HTTP teszt fájlok

#### 9.2.2 Elnevezési konvenciók

- **Fájlok:** PascalCase (User.js, Appointment.js)
- **Függvények:** camelCase (getUserById, createAppointment)
- **Állandók:** UPPERCASE_WITH_UNDERSCORES (MAX_LOGIN_ATTEMPTS)
- **Szövegezés:** HUNGARIAN (magyar nyelvű kódkommentek)

### 9.3 Kódpéldák

#### 9.3.1 Új endpoint hozzáadása

```javascript
// routes/exampleRoutes.js
import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET - Lekérés
router.get('/', protect, async (req, res, next) => {
    try {
        // Logika itt
        res.json({ success: true });
    } catch (error) {
        next(error); // Error middleware-nek továbbítás
    }
});

// POST - Létrehozás
router.post('/', protect, admin, async (req, res, next) => {
    try {
        // Logika itt
        res.status(201).json({ success: true });
    } catch (error) {
        next(error);
    }
});

export default router;
```

#### 9.3.2 Új Mongoose modell

```javascript
// models/Example.js
import mongoose from 'mongoose';

const exampleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Név megadása kötelező"],
        trim: true
    },
    email: {
        type: String,
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Érvényes email szükséges"]
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const Example = mongoose.model('Example', exampleSchema);
export default Example;
```

### 9.4 Tesztelés

#### 9.4.1 Jest tesztek futtatása

```bash
npm test
```

#### 9.4.2 HTTP tesztek (REST Client)

A `tests/` mappában talál HTTP tesztfájlokat (.http kiterjesztés). Ezek VS Code REST Client bővítménnyel futtathatók.

**Minta tesztfájl (tests/userTests.http):**
```http
### Regisztráció
POST http://localhost:5000/api/users/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "TestPassword123",
  "phone": "+3620123456",
  "birthDate": "1990-01-01",
  "gender": "MALE",
  "role": "PATIENT",
  "tajNumber": "123456789",
  "address": "1051 Budapest, Test street 1."
}

### Bejelentkezés
POST http://localhost:5000/api/users/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "TestPassword123"
}

### Profil lekérése
GET http://localhost:5000/api/users/profile
Authorization: Bearer YOUR_TOKEN_HERE
```

### 9.5 Git workflow

```bash
# Új feature branch
git checkout -b feature/new-feature

# Módosítások commitolása
git add .
git commit -m "feat: leírás a módosításról"

# Push a remote-ra
git push origin feature/new-feature

# Pull Request létrehozása GitHub-on
```

---

## 10. Tesztelés

### 10.1 Jest tesztek

Az alkalmazás Jest tesztelési keretrendszert használ. A tesztek az `jest/` mappában találhatók.

**Teszt fájl struktúrája:**
```javascript
import request from 'supertest';
import app from '../server.js';

describe('User Endpoints', () => {
    test('Új felhasználó regisztrálása', async () => {
        const response = await request(app)
            .post('/api/users/register')
            .send({
                name: 'Test User',
                email: 'test@example.com',
                password: 'Password123',
                // ... egyéb mezők
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.success).toBe(true);
    });

    test('Duplikált email elutasítása', async () => {
        const response = await request(app)
            .post('/api/users/register')
            .send({
                email: 'existing@example.com', // Már létezik
                // ... egyéb mezők
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toHaveProperty('email');
    });
});
```

### 10.2 Tesztfedettség

Ajánlott legalább 80%-os tesztfedettség az alábbi területeken:

- Autentikációs middleware
- Validációs logika
- Adatbázis műveletek (CRUD)
- Hibakezelés

**Tesztfedettség megtekintése:**
```bash
npm test -- --coverage
```

### 10.3 E2E tesztek

A `tests/` mappában HTTP tesztfájlok érhetők el, amelyek az API vépontokat tesztelik a teljes workflow-n keresztül.

---

## 11. Üzemeltetés

### 11.1 Production deployment (Vercel)

Az alkalmazás Vercel platformon fut. A `vercel.json` fájl tartalmazza a deployment konfigurációt.

**Deployment folyamat:**

1. **GitHub push:**
```bash
git push origin main
```

2. **Vercel automatikus deployment:** A GitHub integráció miatt a Vercel automatikusan telepíti az alkalmazást.

3. **Environment variables beállítása a Verceln:**
   - Lépj a Vercel Dashboard-ra
   - Projektválasztása
   - Settings → Environment Variables
   - Adj meg MONGO_URI, JWT_SECRET, email beállítások, stb.

**Éles API URL:** `https://romandi-vadaszhaz-klinik-backend.vercel.app`

### 11.2 MongoDB Atlas beállítások

1. **Adatbázis létrehozása:**
   - MongoDB Atlas weboldalán bejelentkezés
   - "Build a Cluster" gombra kattintás
   - Cluster konfigurálása

2. **Database User létrehozása:**
   - Security → Database Access
   - Jelszó generálása, felhasználó létrehozása

3. **Connection String:**
   - Clusters → Connect → Connect your application
   - Connection string másolása environment variable-ként

### 11.3 Email konfigurációs (Gmail SMTP)

1. **Gmail App Password generálása:**
   - Google Account settings
   - Security → App passwords
   - Gmail és Device választása
   - App password másolása

2. **Environment variables:**
```
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-password
```

### 11.4 Monitorozás és Logging

Az alkalmazás alapvető naplózást végez a konzolon. Production környezetben javasoltabb egy professzionális logging megoldás (pl. Winston, Sentry).

---

## 12. Használt technológiák és függőségek

### 12.1 Runtime és Framework

- **Node.js:** 18.0.0+
- **Express.js:** 5.2.1

### 12.2 Adatbázis

- **MongoDB:** 6.3.0+
- **Mongoose:** 9.1.6

### 12.3 Biztonsági csomagok

- **jsonwebtoken:** 9.0.3
- **bcryptjs:** 3.0.3
- **helmet:** 8.1.0
- **express-rate-limit:** 8.2.1
- **cors:** 2.8.6

### 12.4 Egyéb függőségek

- **dotenv:** 17.2.4 (Environment változók)
- **nodemailer:** 8.0.1 (Email küldés)
- **pdfkit:** 0.17.2 (PDF generálás)
- **date-fns-tz:** 3.2.0 (Dátumkezelés, időzóna)
- **yamljs:** 0.3.0 (YAML feldolgozás)

### 12.5 API dokumentáció

- **swagger-jsdoc:** 6.2.8
- **swagger-ui-express:** 5.0.1

### 12.6 Tesztelés

- **jest:** 30.3.0
- **supertest:** 7.2.2
- **mongodb-memory-server:** 11.0.1

---

## 13. Irodalomjegyzék

1. **Express.js Official Documentation.** (2024). Express - Node.js web application framework. Elérhető: https://expressjs.com/ (Utolsó ellenőrzés: 2026. április 15.)

2. **MongoDB University.** (2024). MongoDB - The Most Popular NoSQL Database. Elérhető: https://learn.mongodb.com/ (Utolsó ellenőrzés: 2026. április 15.)

3. **Mongoose.js Documentation.** (2024). Mongoose ODM v9.1.6 - Elegant mongodb object modeling for node.js. Elérhető: https://mongoosejs.com/ (Utolsó ellenőrzés: 2026. április 15.)

4. **JWT.io.** (2024). JSON Web Tokens - JWT.io. Elérhető: https://jwt.io/ (Utolsó ellenőrzés: 2026. április 15.)

5. **Node.js Official Documentation.** (2024). Node.js - Runtime and Everything. Elérhető: https://nodejs.org/ (Utolsó ellenőrzés: 2026. április 15.)

6. **OpenAPI/Swagger Specification.** (2024). OpenAPI 3.0.0 Specification. Elérhető: https://swagger.io/specification/ (Utolsó ellenőrzés: 2026. április 15.)

7. **OWASP – Open Web Application Security Project.** (2024). OWASP Top 10. Elérhető: https://owasp.org/www-project-top-ten/ (Utolsó ellenőrzés: 2026. április 15.)

8. **Jest Testing Framework.** (2024). Jest - Delightful JavaScript Testing Framework. Elérhető: https://jestjs.io/ (Utolsó ellenőrzés: 2026. április 15.)

---

## 14. Mellékletek

### 14.1 A. Felhasznált függőségek teljes listája (package.json)

```json
{
  "name": "romandi-vadaszhaz-klinik-backend",
  "version": "1.0.0",
  "description": "Webalapú klinikai időpontfoglaló rendszer",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js --runInBand --detectOpenHandles"
  },
  "dependencies": {
    "bcryptjs": "^3.0.3",
    "cors": "^2.8.6",
    "date-fns-tz": "^3.2.0",
    "dotenv": "^17.2.4",
    "express": "^5.2.1",
    "express-rate-limit": "^8.2.1",
    "helmet": "^8.1.0",
    "jsonwebtoken": "^9.0.3",
    "mongodb": "^6.3.0",
    "mongoose": "^9.1.6",
    "nodemailer": "^8.0.1",
    "pdfkit": "^0.17.2",
    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-express": "^5.0.1",
    "yamljs": "^0.3.0"
  },
  "devDependencies": {
    "@types/node": "^25.2.3",
    "jest": "^30.3.0",
    "mongodb-memory-server": "^11.0.1",
    "supertest": "^7.2.2"
  }
}
```

### 14.2 B. Environment változók minta (.env.example)

```plaintext
# Környezet beállítások
NODE_ENV=development

# Szerver beállítások
PORT=5000

# Adatbázis beállítások
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/klinik?retryWrites=true&w=majority

# JWT beállítások
JWT_SECRET=meget-hosszu-es-bozongy-jelszovelyeghezhasznalhato
JWT_EXPIRE=30d

# Email beállítások
GMAIL_USER=email@gmail.com
GMAIL_PASS=app-specific-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 14.3 C. Mongoose validációs sémapéldák

```javascript
// Felhasználó séma validáció
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Email megadása kötelező"],
        unique: true,
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            "Kérjük, érvényes email címet adjon meg",
        ],
    },
    password: {
        type: String,
        required: [true, "Jelszó megadása kötelező"],
        validate: {
            validator: function (v) {
                if (!this.isModified("password")) return true;
                return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(v);
            },
            message: "A jelszónak legalább 8 karakterből kell állnia, és tartalmaznia kell betűt és számot is",
        },
    },
    phone: {
        type: String,
        required: [true, "Telefonszám megadása kötelező"],
        match: [
            /^(?:\+36|06)(?:20|30|31|70)\d{7}$/,
            "Érvénytelen magyar telefonszám formátum",
        ],
    },
});
```

### 14.4 D. API Swagger dokumentáció szerkezete

```yaml
# docs/user.swagger.yaml
openapi: 3.0.0
info:
  title: Felhasználó API
  version: 1.0.0

paths:
  /api/users/register:
    post:
      summary: Új felhasználó regisztrálása
      tags:
        - Users
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string
                email:
                  type: string
                password:
                  type: string
              required:
                - name
                - email
                - password
      responses:
        '201':
          description: Sikeres regisztráció
        '400':
          description: Validációs hiba
```

### 14.5 E. Middleware példák

```javascript
// Egyéni middleware autentikáció
export const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'Token hiányzik' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ message: 'Érvénytelen token' });
    }
};
```

### 14.6 F. Tesztfájl minta

```javascript
// jest/user.test.js
describe('Felhasználó API', () => {
    test('Regisztráció a helyes adatokkal', async () => {
        const response = await request(app)
            .post('/api/users/register')
            .send({
                name: 'Test User',
                email: 'test@example.com',
                password: 'Password123'
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('token');
    });

    test('Regisztráció rossz email-lel', async () => {
        const response = await request(app)
            .post('/api/users/register')
            .send({
                name: 'Test User',
                email: 'invalid-email',
                password: 'Password123'
            });

        expect(response.status).toBe(400);
    });
});
```

### 14.7 G. Email sablonok (mail.js)

```javascript
// mail/mail.js
export const sendWelcomeEmail = (userEmail, userName) => {
    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: userEmail,
        subject: 'Üdvözlünk a Klinikánk Rendszerében!',
        html: `
            <h1>Üdvözöljük, ${userName}!</h1>
            <p>Sikeresen regisztráltál a Romandi Vádászhaz Klinika Rendszerébe.</p>
            <p>Mostantól foglalhatod az orvosi időpontokat.</p>
            <a href="${process.env.FRONTEND_URL}/login">Bejelentkezés</a>
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Email hiba:', error);
        } else {
            console.log('Email elküldve:', info.response);
        }
    });
};
```

---

## Végegyzet

Ez a dokumentáció a Romandi Vádászhaz Klinika Időpontfoglaló Rendszer backendjének teljes és részletes leírása. Az alkalmazás modern technológiákon alapul, biztonságos és skálázható megoldásokat kínál az orvosi gyakorlat számára. A dokumentáció célja, hogy segítséget nyújtson a fejlesztőknek, üzemeltetőknek és a projektet fenntartóknak.

Az alkalmazás továbbfejlesztésére javasolt területek:

- Logarítási és monitoring rendszer kiépítése
- GraphQL API implementáció
- Automatizált telemedicina funkciók
- Mesterséges intelligencia alapú orvosi ajánlásrendszer
- Továbbfejlesztett adatanalitika és riportok

---

**Dokumentáció készítésének dátuma:** 2026. április 15.
**Verzió:** 1.0.0
**Szerző:** Fejlesztő Team
