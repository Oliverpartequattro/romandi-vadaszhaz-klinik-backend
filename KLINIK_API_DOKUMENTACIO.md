# 🏥 ROMANDI VADASZHAZ KLINIK - API DOKUMENTÁCIÓ

## Verzió: 1.0.0
## Dátum: 2026. február 12.
---

## 📋 TARTALOMJEGYZÉK

1. [Bevezetés](#bevezetés)
2. [Technológiai Stack](#technológiai-stack)
3. [Alapvető Információk](#alapvető-információk)
4. [Autentikáció és Autorizáció](#autentikáció-és-autorizáció)
5. [Adatmodellek](#adatmodellek)
6. [API Végpontok](#api-végpontok)
   - [Felhasználók (Users)](#felhasználók-users)
   - [Szolgáltatások (Services)](#szolgáltatások-services)
   - [Időpontfoglalások (Appointments)](#időpontfoglalások-appointments)
   - [Ellátási Adatok (Records)](#ellátási-adatok-records)
7. [Hibakezelés](#hibakezelés)
8. [Workflow Leírások](#workflow-leírások)

---

## BEVEZETÉS

A **Romandi Vadaszhaz Klinika** webalapú időpontfoglaló és ellátási dokumentációs rendszere. Ez az API dokumentáció a frontendes csapatnak szól, hogy minden szükséges információ rendelkezésére álljon az integráció során.

### Fő Funkciók:
- 👥 Felhasználói regisztráció és bejelentkezés (Páciens, Orvos, Admin)
- 📅 Orvosi időpontok meghirdetése és foglalása
- 🩺 Ellátási adatok (kórtörténet) rögzítése
- 🔐 JWT alapú autentikáció

---

## TECHNOLÓGIAI STACK

| Komponens | Technológia |
|-----------|------------|
| **Runtime** | Node.js (Express.js 5.2.1) |
| **Adatbázis** | MongoDB Atlas |
| **Hitelesítés** | JWT (JSON Web Token) |
| **Jelszó Titkosítás** | bcryptjs (salted hash) |
| **API Dokumentáció** | Swagger/OpenAPI 3.0.0 |
| **Deployment** | Vercel |

---

## ALAPVETŐ INFORMÁCIÓK

### API Base URL

```
https://romandi-vadaszhaz-klinik-backend.vercel.app
```

### Interaktív API Dokumentáció

```
https://romandi-vadaszhaz-klinik-backend.vercel.app/api-docs
```
*Swagger UI felülettel lehet tesztelni az összes végpontot interaktívan.*

### Response Formátum

Az API JSON formátumban válaszol. Minden sikeresen végrehajtott kéréshez a szerver egy JSON objektumot küld vissza.

**Sikeres válasz (200-201 status):**
```json
{
  "_id": "ObjectId",
  "name": "...",
  "email": "...",
  ...
}
```

**Hiba válasz (4xx-5xx status):**
```json
{
  "message": "Emberi olvasható hibaüzenet",
  "error": "Részletes technikai információ (ha van)"
}
```

---

## AUTENTIKÁCIÓ ÉS AUTORIZÁCIÓ

### JWT Token Kezelés

1. **Token Generálás:**
   - Bejelentkezéskor (`/api/users/login`) a szerver egy JWT tokent küld vissza.
   - Ez a token 30 napig érvényes.

2. **Token Tárolása (Frontend):**
   - Tárold a tokent a **localStorage**-ban: `localStorage.setItem('token', token)`
   - **NEM SZABAD** a jelszót tárolni!

3. **Token Használata:**
   - Minden autentikációt igénylő kérésnél add meg a `Authorization` headert:
   ```
   Authorization: Bearer <YOUR_JWT_TOKEN>
   ```

4. **Token Lejárta:**
   - Ha a token lejár, a szerver 401 Unauthorized választ ad.
   - Ilyenkor a felhasználónak újra be kell jelentkeznie.

### Felhasználói Szerepek (Role-Based Access Control)

Három különböző szint létezik:

| Role | Leírás | Jogosultságok |
|------|--------|-------------|
| **ADMIN** | Rendszergazda | Összes felhasználó/adat megtekintése, módosítása, törlése |
| **DOCTOR** | Orvos | Saját időpontok rögzítése, páciensek adatainak megtekintése, ellátási adatok írása |
| **PATIENT** | Páciens | Saját profil megtekintése, időpont foglalása, saját ellátási adatok megtekintése |

---

## ADATMODELLEK

### 1. USER (Felhasználó Modell)

Az alapvető felhasználói adatok. A **role** mező határozza meg, hogy mely adatok kötelezőek.

#### Mezők:

| Mező | Típus | Kötelező | Leírás | Validáció |
|------|-------|----------|--------|-----------|
| `_id` | ObjectId | ✅ | MongoDB azonosító | Automatikus |
| `name` | String | ✅ | Felhasználó teljes neve | Min. 1 karakter |
| `email` | String | ✅ | Egyedi email cím | Regex validáció + unique |
| `password` | String | ✅ | Jelszó | Min. 8 kar., 1 betű + 1 szám, titkosított |
| `phone` | String | ✅ | Telefonszám | Magyar formátum (`+36` vagy `06`) |
| `birthDate` | Date | ✅ | Születési dátum | ISO 8601 formátum |
| `role` | String | ✅ | Felhasználó típusa | Enum: `ADMIN`, `DOCTOR`, `PATIENT` |
| `tajNumber` | String | 🔴 PATIENT-nél | Társadalombiztosítási szám | Pontosan 9 számjegy (csak PATIENT) |
| `address` | String | 🔴 PATIENT-nél | Lakcím | Szabad szöveg (csak PATIENT) |
| `specialization` | String | 🔴 DOCTOR-nél | Szakterület (pl. Kardiológia) | Szabad szöveg (csak DOCTOR) |
| `records` | ObjectId[] | ❌ | Kapcsolódó ellátási adatok | Ref: Record |
| `createdAt` | Date | ✅ | Létrehozás dátuma | Automatikus |
| `updatedAt` | Date | ✅ | Utolsó módosítás dátuma | Automatikus |

#### Jelszó Validáció:
```
❌ "12345678"    → Nincs betű
❌ "abcdefgh"    → Nincs szám
❌ "Abc1"        → Túl rövid (7 kar)
✅ "Abc12345"    → Jó (8 kar, 1 betű + 1 szám)
✅ "MyPass2024"  → Jó
```

#### Telefonszám Validáció:
```
❌ "0630123456"        → Nem megfelelő formátum
❌ "+36630123456"      → Rossz hosszúság
✅ "+36201234567"      → Jó (11 számjegy)
✅ "06201234567"       → Jó (11 számjegy)
✅ "+36301234567"      → Jó (mobil)
✅ "+36701234567"      → Jó (mobil)
```

#### Regisztrációs JSON Példa - PÁCIENS:
```json
{
  "name": "Kiss Márta",
  "email": "kiss.marta@email.com",
  "password": "BiztonsegesJelszo123",
  "phone": "+36201234567",
  "birthDate": "1990-05-15T00:00:00Z",
  "tajNumber": "123456789",
  "address": "Budapest, Bem J. u. 1.",
  "role": "PATIENT"
}
```

#### Regisztrációs JSON Példa - ORVOS:
```json
{
  "name": "Dr. Nagy János",
  "email": "nagy.janos@email.com",
  "password": "OrvosPass2024",
  "phone": "+36301234567",
  "birthDate": "1970-03-20T00:00:00Z",
  "specialization": "Kardiológia",
  "role": "DOCTOR"
}
```

---

### 2. SERVICE (Szolgáltatás / Időpontslot Modell)

Egy **szabad időpont**, amit az orvos meghirdet, és amit a páciens lemezhet foglalni.

#### Mezők:

| Mező | Típus | Kötelező | Leírás | Validáció |
|------|-------|----------|--------|-----------|
| `_id` | ObjectId | ✅ | MongoDB azonosító | Automatikus |
| `doctor_id` | ObjectId | ✅ | Az orvos ID-ja | Ref: User (DOCTOR role) |
| `topic` | String | ✅ | Szakterület (pl. "Kardiológia") | Min. 1 karakter |
| `description` | String | ✅ | Részletes leírás | Min. 1 karakter |
| `location` | String | ✅ | Helyszín (pl. "102-es vizsgáló") | Min. 1 karakter |
| `date` | Date | ✅ | Időpont kezdete | ISO 8601, jövőbeli dátum |
| `price` | String | ✅ | Ár (szöveg vagy szám) | Szabad szöveg, pl. "2500 Ft" vagy "25000" |
| `patient_id` | ObjectId | ❌ | Fog foglalni a páciens ID-ja | Ref: User (PATIENT role) |
| `created_by` | ObjectId | ✅ | Ki hozta létre | Ref: User |
| `createdAt` | Date | ✅ | Létrehozás dátuma | Automatikus |
| `updatedAt` | Date | ✅ | Utolsó módosítás dátuma | Automatikus |

#### Létrehozás JSON Példa:
```json
{
  "doctor_id": "65abc123def456789ghi0123",
  "topic": "Kardiológia",
  "description": "Szívultrahang-vizsgálat és konzultáció",
  "location": "204-es vizsgáló",
  "date": "2026-05-20T10:00:00.000Z",
  "price": "2500 Ft"
}
```

**Megjegyzés:** A `patient_id` automatikusan töltődik be, amikor a páciens foglal egy időpontot.

---

### 3. APPOINTMENT (Időpontfoglalás)

Az a kapcsolat, amit a páciens vagy az orvos létrehoz, hogy egy megadott időpontban találkozzanak.

#### Mezők:

| Mező | Típus | Kötelező | Leírás | Validáció |
|------|-------|----------|--------|-----------|
| `_id` | ObjectId | ✅ | MongoDB azonosító | Automatikus |
| `doctor_id` | ObjectId | ✅ | Az orvos ID-ja | Ref: User (DOCTOR role) |
| `patient_id` | ObjectId | ✅ | A páciens ID-ja | Ref: User (PATIENT role) |
| `service_id` | ObjectId | ✅ | Melyik szabad időpont? | Ref: Service |
| `startTime` | Date | ✅ | Kezdés időpontja | ISO 8601, jövőbeli |
| `endTime` | Date | ❌ | Befejezés időpontja | ISO 8601, startTime után |
| `status` | String | ✅ | Foglalás státusza | Enum: `PENDING`, `CONFIRMED`, `PROPOSED`, `CANCELLED` |
| `referral_type` | String | ✅ | Bejelentkezés típusa | Enum: `SELF` (saját), `DOCTOR` (beutaló) |
| `referred_by` | ObjectId | ❌ | Ki írta a beutalót? | Ref: User (DOCTOR role), csak ha `referral_type = DOCTOR` |
| `created_by` | ObjectId | ✅ | Ki hozta létre a foglalást? | Ref: User |
| `createdAt` | Date | ✅ | Létrehozás dátuma | Automatikus |
| `updatedAt` | Date | ✅ | Utolsó módosítás dátuma | Automatikus |

#### Status Leírások:

| Status | Leírás | Ki változtathat rá? |
|--------|--------|-------------------|
| **PENDING** | Frissen létrehozva, az orvos még válaszol | Admin, Orvos |
| **CONFIRMED** | Az orvos vagy a páciens jóváhagyta | Admin, Páciens, Orvos |
| **PROPOSED** | Az orvos más időpontot javasol | Admin, Orvos |
| **CANCELLED** | A foglalás lemondva | Admin, Páciens, Orvos |

#### Referral Type:

| Típus | Leírás |
|-------|--------|
| **SELF** | A páciens maga foglalta az időpontot |
| **DOCTOR** | Egy másik orvos ajánlotta ezt a szakembert |

#### Foglalás Létrehozás JSON Példa (PÁCIENS):
```json
{
  "doctor_id": "65abc123def456789ghi0124",
  "service_id": "65abc123def456789ghi0125",
  "startTime": "2026-05-20T10:00:00.000Z",
  "endTime": "2026-05-20T11:00:00.000Z",
  "referral_type": "SELF"
}
```

#### Foglalás Létrehozás JSON Példa (ORVOS ÁLTAL BEUTALÁSBÓL):
```json
{
  "patient_id": "65abc123def456789ghi0126",
  "doctor_id": "65abc123def456789ghi0127",
  "service_id": "65abc123def456789ghi0128",
  "startTime": "2026-06-10T14:30:00.000Z",
  "referral_type": "DOCTOR",
  "referred_by": "65abc123def456789ghi0129"
}
```

---

### 4. RECORD (Ellátási Adat / Kórtörténet)

Egy az egy ellátási esemény dokumentációja (pl. egy vizsgálat után az orvos megjegyzéseit).

#### Mezők:

| Mező | Típus | Kötelező | Leírás | Validáció |
|------|-------|----------|--------|-----------|
| `_id` | ObjectId | ✅ | MongoDB azonosító | Automatikus |
| `patient` | ObjectId | ✅ | Páciens ID-ja | Ref: User (PATIENT role) |
| `doctor` | ObjectId | ✅ | Orvos ID-ja | Ref: User (DOCTOR role) |
| `appointment_id` | ObjectId | ❌ | Melyik foglaláshoz? | Ref: Appointment |
| `service` | ObjectId | ❌ | Melyik szolgáltatáshoz? | Ref: Service |
| `description` | String | ✅ | Ellátás leírása | Min. 1 karakter, pl. lelet, ajánlás |
| `createdAt` | Date | ✅ | Létrehozás dátuma | Automatikus |
| `updatedAt` | Date | ✅ | Utolsó módosítás dátuma | Automatikus |

#### Record Létrehozás JSON Példa:
```json
{
  "patient": "65abc123def456789ghi0130",
  "appointment_id": "65abc123def456789ghi0131",
  "service_id": "65abc123def456789ghi0132",
  "description": "Normális szívzörej, nyomásviszonyok rendben. Kontrollvizsgálat 3 hónap múlva ajánlott."
}
```

---

## API VÉGPONTOK

### FELHASZNÁLÓK (Users)

#### 1. **Felhasználó Regisztrálása**
- **Endpoint:** `POST /api/users/register`
- **Autentikáció:** ❌ Nem szükséges
- **Leírás:** Új felhasználó létrehozása. Role-alapú validáció: PATIENT-nek TAJ szám és cím kell, DOCTOR-nak szakterület.

**Request Body:**
```json
{
  "name": "Kiss Márta",
  "email": "kiss.marta@email.com",
  "password": "BiztonsegesJelszo123",
  "phone": "+36201234567",
  "birthDate": "1990-05-15T00:00:00Z",
  "role": "PATIENT",
  "tajNumber": "123456789",
  "address": "Budapest, Bem J. u. 1."
}
```

**Response (201 Created):**
```json
{
  "_id": "65abc123def456789ghi0140",
  "name": "Kiss Márta",
  "email": "kiss.marta@email.com",
  "phone": "+36201234567",
  "role": "PATIENT",
  "tajNumber": "123456789",
  "address": "Budapest, Bem J. u. 1.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Hibalehetőségek:**
- 400 Bad Request - Email már foglalt
- 400 Bad Request - Validációs hiba (pl. jelszó túl rövid, rossz email formátum)

---

#### 2. **Bejelentkezés**
- **Endpoint:** `POST /api/users/login`
- **Autentikáció:** ❌ Nem szükséges
- **Leírás:** Felhasználó bejelentkezése, JWT token generálása.

**Request Body:**
```json
{
  "email": "kiss.marta@email.com",
  "password": "BiztonsegesJelszo123"
}
```

**Response (200 OK):**
```json
{
  "_id": "65abc123def456789ghi0140",
  "name": "Kiss Márta",
  "email": "kiss.marta@email.com",
  "phone": "+36201234567",
  "role": "PATIENT",
  "tajNumber": "123456789",
  "address": "Budapest, Bem J. u. 1.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Hibalehetőségek:**
- 401 Unauthorized - Rossz email vagy jelszó

---

#### 3. **Bejelentkezett Felhasználó Profilja**
- **Endpoint:** `GET /api/users/profile`
- **Autentikáció:** ✅ Szükséges (JWT Token)
- **Leírás:** Az aktuálisan bejelentkezett felhasználó teljes profilja + ellátási adatai.

**Request Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**
```json
{
  "_id": "65abc123def456789ghi0140",
  "name": "Kiss Márta",
  "email": "kiss.marta@email.com",
  "phone": "+36201234567",
  "role": "PATIENT",
  "tajNumber": "123456789",
  "address": "Budapest, Bem J. u. 1.",
  "records": [
    {
      "_id": "65abc123def456789ghi0150",
      "doctor": {
        "_id": "65abc123def456789ghi0124",
        "name": "Dr. Nagy János",
        "specialization": "Kardiológia"
      },
      "service": {
        "_id": "65abc123def456789ghi0125",
        "name": "Szívultrahang",
        "description": "..."
      },
      "description": "Normális szívzörej...",
      "createdAt": "2026-02-01T10:00:00.000Z"
    }
  ]
}
```

**Hibalehetőségek:**
- 401 Unauthorized - Hiányzó vagy érvénytelen token
- 404 Not Found - Felhasználó nem található

---

#### 4. **Profil Frissítése**
- **Endpoint:** `PUT /api/users/profile`
- **Autentikáció:** ✅ Szükséges (JWT Token)
- **Leírás:** A bejelentkezett felhasználó profil adatainak módosítása.

**⚠️ FONTOS:** Csak azokat a mezőket küldd el, amiket módosítanál! Ha a jelszó mező üres, a szerver nem fogja módosítani.

**Request Body (Példa - csak a módosított mezők):**
```json
{
  "name": "Kiss Márta Magdolna",
  "phone": "+36301234567",
  "password": "UjJelszo2024"
}
```

**Response (200 OK):**
```json
{
  "_id": "65abc123def456789ghi0140",
  "name": "Kiss Márta Magdolna",
  "email": "kiss.marta@email.com",
  "phone": "+36301234567",
  "role": "PATIENT",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Hibalehetőségek:**
- 401 Unauthorized - Hiányzó vagy érvénytelen token
- 400 Bad Request - Validációs hiba
- 404 Not Found - Felhasználó nem található

---

#### 5. **Összes Felhasználó Lekérése**
- **Endpoint:** `GET /api/users`
- **Autentikáció:** ✅ Szükséges (JWT Token + ADMIN role)
- **Leírás:** Admin csak - az összes felhasználó listázása.

**Request Headers:**
```
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

**Response (200 OK):**
```json
[
  {
    "_id": "65abc123def456789ghi0140",
    "name": "Kiss Márta",
    "email": "kiss.marta@email.com",
    "role": "PATIENT",
    "createdAt": "2026-01-15T08:00:00.000Z"
  },
  {
    "_id": "65abc123def456789ghi0124",
    "name": "Dr. Nagy János",
    "email": "nagy.janos@email.com",
    "role": "DOCTOR",
    "specialization": "Kardiológia",
    "createdAt": "2025-12-10T09:30:00.000Z"
  }
]
```

**Hibalehetőségek:**
- 401 Unauthorized - Hiányzó vagy érvénytelen token
- 403 Forbidden - Nem admin user

---

#### 6. **Összes Orvos Lekérése**
- **Endpoint:** `GET /api/users/doctors`
- **Autentikáció:** ❌ Nem szükséges
- **Leírás:** A páciensek által elérhető összes orvos listázása (név, szakterület, email, telefon).

**Response (200 OK):**
```json
[
  {
    "_id": "65abc123def456789ghi0124",
    "name": "Dr. Nagy János",
    "specialization": "Kardiológia",
    "email": "nagy.janos@email.com",
    "phone": "+36301234567"
  },
  {
    "_id": "65abc123def456789ghi0141",
    "name": "Dr. Kovács Erzsébet",
    "specialization": "Reumatológia",
    "email": "kovacs.erzsebet@email.com",
    "phone": "+36302345678"
  }
]
```

---

#### 7. **Összes Páciens Lekérése**
- **Endpoint:** `GET /api/users/patients`
- **Autentikáció:** ✅ Szükséges (JWT Token + DOCTOR vagy ADMIN role)
- **Leírás:** Orvosok és adminok által elérhető páciensek listázása.

**Request Headers:**
```
Authorization: Bearer <DOCTOR_OR_ADMIN_JWT_TOKEN>
```

**Response (200 OK):**
```json
[
  {
    "_id": "65abc123def456789ghi0140",
    "name": "Kiss Márta",
    "email": "kiss.marta@email.com",
    "phone": "+36201234567",
    "birthDate": "1990-05-15T00:00:00Z",
    "role": "PATIENT"
  }
]
```

**Hibalehetőségek:**
- 401 Unauthorized - Hiányzó vagy érvénytelen token
- 403 Forbidden - Nem orvos vagy admin

---

#### 8. **Kijelentkezés**
- **Endpoint:** `GET /api/users/logout`
- **Autentikáció:** ✅ Szükséges (JWT Token)
- **Leírás:** Felhasználó kijelentkezése (frontend: töröld a tokent a localStorage-ből).

**Request Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**
```json
{
  "message": "Sikeres kijelentkezés"
}
```

---

### SZOLGÁLTATÁSOK (Services)

#### 1. **Összes Szolgáltatás Lekérése**
- **Endpoint:** `GET /api/services`
- **Autentikáció:** ❌ Nem szükséges
- **Leírás:** Az összes meghirdetett szabad időpont listázása.

**Response (200 OK):**
```json
[
  {
    "_id": "65abc123def456789ghi0125",
    "doctor_id": "65abc123def456789ghi0124",
    "topic": "Kardiológia",
    "description": "Szívultrahang-vizsgálat és konzultáció",
    "location": "204-es vizsgáló",
    "date": "2026-05-20T10:00:00.000Z",
    "price": "2500 Ft",
    "patient_id": null,
    "createdAt": "2026-02-01T08:00:00.000Z"
  }
]
```

---

#### 2. **Új Szolgáltatás Létrehozása**
- **Endpoint:** `POST /api/services`
- **Autentikáció:** ✅ Szükséges (JWT Token + DOCTOR vagy ADMIN role)
- **Leírás:** Orvos meghirdet egy szabad időpontot / szolgáltatást.

**Request Headers:**
```
Authorization: Bearer <DOCTOR_OR_ADMIN_JWT_TOKEN>
```

**Request Body:**
```json
{
  "topic": "Kardiológia",
  "description": "Szívultrahang-vizsgálat és konzultáció",
  "location": "204-es vizsgáló",
  "date": "2026-05-20T10:00:00.000Z",
  "price": "2500 Ft",
  "doctor_id": "65abc123def456789ghi0124"
}
```

**Response (201 Created):**
```json
{
  "_id": "65abc123def456789ghi0125",
  "doctor_id": "65abc123def456789ghi0124",
  "topic": "Kardiológia",
  "description": "Szívultrahang-vizsgálat és konzultáció",
  "location": "204-es vizsgáló",
  "date": "2026-05-20T10:00:00.000Z",
  "price": "2500 Ft",
  "patient_id": null,
  "created_by": "65abc123def456789ghi0124",
  "createdAt": "2026-02-01T08:00:00.000Z"
}
```

**Hibalehetőségek:**
- 401 Unauthorized - Hiányzó vagy érvénytelen token
- 403 Forbidden - Nem orvos vagy admin
- 400 Bad Request - Validációs hiba

---

### IDŐPONTFOGLALÁSOK (Appointments)

#### 1. **Összes Időpont Lekérése**
- **Endpoint:** `GET /api/appointments`
- **Autentikáció:** ✅ Szükséges (JWT Token + ADMIN role)
- **Leírás:** Admin csak - az összes időpontfoglalás listázása.

**Request Headers:**
```
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

**Response (200 OK):**
```json
[
  {
    "_id": "65abc123def456789ghi0160",
    "doctor_id": {
      "_id": "65abc123def456789ghi0124",
      "name": "Dr. Nagy János",
      "specialization": "Kardiológia"
    },
    "patient_id": {
      "_id": "65abc123def456789ghi0140",
      "name": "Kiss Márta",
      "email": "kiss.marta@email.com",
      "phone": "+36201234567"
    },
    "service_id": {
      "_id": "65abc123def456789ghi0125",
      "name": "Szívultrahang"
    },
    "startTime": "2026-05-20T10:00:00.000Z",
    "endTime": "2026-05-20T11:00:00.000Z",
    "status": "PENDING",
    "referral_type": "SELF",
    "referred_by": null,
    "createdAt": "2026-02-01T09:15:00.000Z"
  }
]
```

---

#### 2. **Saját Időpontok Lekérése**
- **Endpoint:** `GET /api/appointments/my`
- **Autentikáció:** ✅ Szükséges (JWT Token)
- **Leírás:** 
  - Páciensnél: Az összes saját foglalás
  - Orvosban: Az összes hozzá érkezett foglalás

**Request Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK) - PÁCIENS nézete:**
```json
[
  {
    "_id": "65abc123def456789ghi0160",
    "doctor_id": {
      "_id": "65abc123def456789ghi0124",
      "name": "Dr. Nagy János",
      "specialization": "Kardiológia",
      "phone": "+36301234567"
    },
    "patient_id": {...},
    "service_id": {
      "_id": "65abc123def456789ghi0125",
      "topic": "Kardiológia",
      "location": "204-es vizsgáló",
      "price": "2500 Ft"
    },
    "startTime": "2026-05-20T10:00:00.000Z",
    "endTime": "2026-05-20T11:00:00.000Z",
    "status": "PENDING",
    "referral_type": "SELF",
    "createdAt": "2026-02-01T09:15:00.000Z"
  }
]
```

---

#### 3. **Új Időpont Foglalása**
- **Endpoint:** `POST /api/appointments`
- **Autentikáció:** ✅ Szükséges (JWT Token)
- **Leírás:** Páciens vagy orvos foglal egy időpontot.

**Request Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request Body - PÁCIENS által:**
```json
{
  "doctor_id": "65abc123def456789ghi0124",
  "service_id": "65abc123def456789ghi0125",
  "startTime": "2026-05-20T10:00:00.000Z",
  "endTime": "2026-05-20T11:00:00.000Z",
  "referral_type": "SELF"
}
```

**Request Body - ORVOS által (beutalásra):**
```json
{
  "patient_id": "65abc123def456789ghi0140",
  "doctor_id": "65abc123def456789ghi0127",
  "service_id": "65abc123def456789ghi0128",
  "startTime": "2026-06-10T14:30:00.000Z",
  "referral_type": "DOCTOR",
  "referred_by": "65abc123def456789ghi0124"
}
```

**Response (201 Created):**
```json
{
  "_id": "65abc123def456789ghi0160",
  "doctor_id": {
    "_id": "65abc123def456789ghi0124",
    "name": "Dr. Nagy János",
    "specialization": "Kardiológia"
  },
  "patient_id": "65abc123def456789ghi0140",
  "service_id": {
    "_id": "65abc123def456789ghi0125",
    "topic": "Kardiológia",
    "location": "204-es vizsgáló",
    "price": "2500 Ft"
  },
  "startTime": "2026-05-20T10:00:00.000Z",
  "endTime": "2026-05-20T11:00:00.000Z",
  "status": "PENDING",
  "referral_type": "SELF",
  "createdAt": "2026-02-01T09:15:00.000Z"
}
```

**Hibalehetőségek:**
- 401 Unauthorized - Hiányzó vagy érvénytelen token
- 400 Bad Request - Validációs hiba (pl. múltbeli időpont)

---

#### 4. **Időpont Módosítása**
- **Endpoint:** `PUT /api/appointments/:id`
- **Autentikáció:** ✅ Szükséges (JWT Token)
- **Leírás:** Az orvos módosíthatja az időt, a páciens elfogadhat vagy lemondhat.

**Request Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request Body - PÁCIENS jóváhagyása:**
```json
{
  "status": "CONFIRMED"
}
```

**Request Body - PÁCIENS lemondása:**
```json
{
  "status": "CANCELLED"
}
```

**Request Body - ORVOS időpontmódosítása:**
```json
{
  "startTime": "2026-05-20T11:00:00.000Z",
  "endTime": "2026-05-20T12:00:00.000Z"
}
```
*Megjegyzés: A status automatikusan `PROPOSED`-ra váltott.*

**Request Body - ORVOS státuszváltoztatása:**
```json
{
  "status": "CONFIRMED"
}
```

**Response (200 OK):**
```json
{
  "_id": "65abc123def456789ghi0160",
  "doctor_id": {
    "_id": "65abc123def456789ghi0124",
    "name": "Dr. Nagy János",
    "specialization": "Kardiológia"
  },
  "patient_id": {
    "_id": "65abc123def456789ghi0140",
    "name": "Kiss Márta",
    "email": "kiss.marta@email.com"
  },
  "service_id": {
    "_id": "65abc123def456789ghi0125",
    "topic": "Kardiológia",
    "location": "204-es vizsgáló",
    "price": "2500 Ft"
  },
  "startTime": "2026-05-20T11:00:00.000Z",
  "endTime": "2026-05-20T12:00:00.000Z",
  "status": "PROPOSED",
  "referral_type": "SELF"
}
```

**Hibalehetőségek:**
- 401 Unauthorized - Hiányzó vagy érvénytelen token
- 403 Forbidden - Nincs jogosultság
- 404 Not Found - Időpont nem található
- 400 Bad Request - Validációs hiba

---

### ELLÁTÁSI ADATOK (Records)

#### 1. **Összes Ellátási Adat Lekérése**
- **Endpoint:** `GET /api/records`
- **Autentikáció:** ✅ Szükséges (JWT Token + ADMIN role)
- **Leírás:** Admin csak - az összes ellátási adat listázása.

**Request Headers:**
```
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

**Response (200 OK):**
```json
[
  {
    "_id": "65abc123def456789ghi0170",
    "patient": {
      "_id": "65abc123def456789ghi0140",
      "name": "Kiss Márta",
      "email": "kiss.marta@email.com",
      "tajNumber": "123456789"
    },
    "doctor": {
      "_id": "65abc123def456789ghi0124",
      "name": "Dr. Nagy János",
      "specialization": "Kardiológia"
    },
    "appointment_id": "65abc123def456789ghi0160",
    "service": "65abc123def456789ghi0125",
    "description": "Normális szívzörej, nyomásviszonyok rendben. Kontrollvizsgálat 3 hónap múlva.",
    "createdAt": "2026-02-05T14:00:00.000Z"
  }
]
```

---

#### 2. **Egy Páciens Ellátási Adatai**
- **Endpoint:** `GET /api/records/patient/:patientId`
- **Autentikáció:** ✅ Szükséges (JWT Token)
- **Leírás:** 
  - Admin/Orvos: Bármely páciens ellátási adatait megtekintheti
  - Páciens: Csak saját adatait

**Request Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**URL Paraméter:**
- `patientId` - A páciens MongoDB ID-ja

**Response (200 OK):**
```json
[
  {
    "_id": "65abc123def456789ghi0170",
    "patient": "65abc123def456789ghi0140",
    "doctor": {
      "_id": "65abc123def456789ghi0124",
      "name": "Dr. Nagy János",
      "specialization": "Kardiológia"
    },
    "appointment_id": "65abc123def456789ghi0160",
    "service": {
      "_id": "65abc123def456789ghi0125",
      "name": "Szívultrahang",
      "price": "2500 Ft"
    },
    "description": "Normális szívzörej...",
    "createdAt": "2026-02-05T14:00:00.000Z"
  }
]
```

**Hibalehetőségek:**
- 401 Unauthorized - Hiányzó vagy érvénytelen token
- 403 Forbidden - Nincs jogosultság más páciens adataihoz

---

#### 3. **Új Ellátási Adat Rögzítése**
- **Endpoint:** `POST /api/records`
- **Autentikáció:** ✅ Szükséges (JWT Token + DOCTOR vagy ADMIN role)
- **Leírás:** Az orvos egy vizsgálat után dokumentálja az ellátást.

**Request Headers:**
```
Authorization: Bearer <DOCTOR_OR_ADMIN_JWT_TOKEN>
```

**Request Body:**
```json
{
  "patient": "65abc123def456789ghi0140",
  "appointment_id": "65abc123def456789ghi0160",
  "service_id": "65abc123def456789ghi0125",
  "description": "Normális szívzörej, nyomásviszonyok rendben. Kontrollvizsgálat 3 hónap múlva ajánlott. Diurétikum dózisa változatlan marad."
}
```

**Response (201 Created):**
```json
{
  "_id": "65abc123def456789ghi0170",
  "patient": "65abc123def456789ghi0140",
  "doctor": "65abc123def456789ghi0124",
  "appointment_id": "65abc123def456789ghi0160",
  "service_id": "65abc123def456789ghi0125",
  "description": "Normális szívzörej, nyomásviszonyok rendben...",
  "createdAt": "2026-02-05T14:00:00.000Z"
}
```

**Hibalehetőségek:**
- 401 Unauthorized - Hiányzó vagy érvénytelen token
- 403 Forbidden - Nem orvos vagy admin
- 404 Not Found - Páciens nem található
- 400 Bad Request - Validációs hiba

---

## HIBAKEZELÉS

### HTTP Status Kódok

| Kód | Leírás | Mit tegyél |
|-----|--------|-----------|
| **200** | OK | Sikeres kérés |
| **201** | Created | Sikeres létrehozás |
| **400** | Bad Request | Validációs hiba - nézd meg a hibaüzenetet |
| **401** | Unauthorized | Hiányzik vagy rossz a token - jelentkezz be újra |
| **403** | Forbidden | Nincs jogosultság ehhez az erőforráshoz |
| **404** | Not Found | Az erőforrás nem található |
| **500** | Internal Server Error | Szerverhiba - próbáld később |

### Hibaválasz Formátum

```json
{
  "message": "Emberi olvasható hibaüzenet",
  "error": "Technikai információ (opcionális)"
}
```

### Gyakori Hibák

#### 1. Email már foglalt
```json
{
  "message": "Ez a felhasználó már létezik"
}
```

#### 2. Rossz jelszó formátum
```json
{
  "message": "Szerver hiba",
  "error": "A jelszónak legalább 8 karakterből kell állnia, és tartalmaznia kell betűt és számot is"
}
```

#### 3. Hiányzó token
```json
{
  "message": "Nincs autorizáció, token hiányzik"
}
```

#### 4. Múltbeli időpont
```json
{
  "message": "Hiba a foglalás létrehozásakor",
  "error": "Az időpont nem lehet a múltban!"
}
```

---

## WORKFLOW LEÍRÁSOK

### 1. Regisztrációs Workflow

```
Frontend                              Backend
  |                                      |
  |--- POST /api/users/register ------->|
  |  (név, email, jelszó, telefon, birthDate)
  |                                      |---> Validáció
  |                                      |---> Email duplikáció ellenőrzés
  |                                      |---> Jelszó titkosítás (bcryptjs)
  |                                      |---> Felhasználó mentés
  |<------ 201 + User + Token ----------|
  |                                      |
  |--- localStorage.setItem('token', ...) (FRONTEND!)
```

### 2. Bejelentkezési Workflow

```
Frontend                              Backend
  |                                      |
  |--- POST /api/users/login ---------->|
  |  (email, jelszó)                      |
  |                                      |---> Email alapján keresés
  |                                      |---> Jelszó összevetés (bcryptjs)
  |                                      |---> JWT token generálás (30 nap)
  |<------ 200 + User + Token ----------|
  |                                      |
  |--- localStorage.setItem('token', ...) (FRONTEND!)
```

### 3. Autentikált Kérés Workflow

```
Frontend                              Backend
  |                                      |
  |--- GET /api/users/profile -------->|
  | with Authorization: Bearer <token>  |
  |                                      |---> JWT dekódolás
  |                                      |---> User ID kibontás
  |                                      |---> Felhasználó keresés
  |                                      |---> Records populate
  |<------ 200 + User + Records -------|
  |                                      |
```

### 4. Időpontfoglalási Workflow (Páciens → Orvos)

```
Frontend (Páciens)                    Backend                      Frontend (Orvos)
  |                                      |                              |
  |--- POST /api/appointments -------->|                              |
  | (doctor_id, service_id, startTime) |---> Validáció                |
  |                                      |---> Mentés (status=PENDING) |
  |<------ 201 + Appointment --------|                              |
  |                                      |                              |
  |                              (Orvos nézi a saját /my végpontot)   |
  |                                      |<---- GET /api/appointments/my |
  |                                      |---> PENDING státuszú foglalások|
  |                                      |------> Orvos látja --------->|
  |                                      |                              |
  |                                      |                    Orvos: PUT /api/appointments/:id
  |                                      |<------ status = CONFIRMED --| 
  |                                      |---> Mentés                  |
  |<----- Notification (frontend logic) -| (Status=CONFIRMED)          |
  |                                      |                              |
```

### 5. Beutalás Workflow (Orvos → Orvos)

```
Frontend (Orvos 1)                   Backend
  |                                      |
  |--- POST /api/appointments -------->|
  | (patient_id, doctor_id, referral_type="DOCTOR", referred_by=orvos1)
  |                                      |---> Mentés (status=PENDING)
  |<------ 201 + Appointment --------|
  |                                      |
  |                              (Orvos 2 lát egy PENDING foglalást a saját /my-jában)
  |                                      |
  |                                      |---- PUT /api/appointments/:id
  |                                      |     status = CONFIRMED
  |                                      |---> Mentés
```

### 6. Ellátási Adat Rögzítési Workflow

```
Frontend (Orvos után a vizsgálat után)                     Backend
  |                                                          |
  |--- POST /api/records -------------------------------->|
  | (patient, appointment_id, service_id, description)    |
  |                                                          |---> Validáció
  |                                                          |---> Record mentés
  |                                                          |---> User.records Update
  |<------ 201 + Record ------------------------------|
  |                                                          |
  |                      (Páciens később GET /api/users/profile)
  |                                                          |<---- GET /api/users/profile
  |                                                          |---> Records megjelenítése
  |                                                          |------> Páciens lát -------->|
```

---

## LEKÉRDEZÉSI GYAKORLATOK (Frontend Integrációs Tippek)

### JavaScript/Fetch Példák

#### Regisztráció
```javascript
const register = async (userData) => {
  const response = await fetch(
    'https://romandi-vadaszhaz-klinik-backend.vercel.app/api/users/register',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    }
  );
  const data = await response.json();
  if (response.ok) {
    localStorage.setItem('token', data.token);
    return data;
  }
  throw new Error(data.message);
};
```

#### Autentikált Kérés
```javascript
const getProfile = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(
    'https://romandi-vadaszhaz-klinik-backend.vercel.app/api/users/profile',
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );
  const data = await response.json();
  if (response.ok) return data;
  throw new Error(data.message);
};
```

#### Axios-szal
```javascript
import axios from 'axios';

const API_BASE_URL = 'https://romandi-vadaszhaz-klinik-backend.vercel.app';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Interceptor a token hozzáadásához
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Felhasználás
const profile = await api.get('/api/users/profile');
const myAppointments = await api.get('/api/appointments/my');
```

---

## BIZTONSÁGI MEGJEGYZÉSEK

1. **Soha ne tárolj jelszót a frontend-en!**
2. **Mindig HTTPS-en keresztül kommunikálj az API-val!**
3. **A tokent a localStorage-ban tárolva: egyéb XSS támadások ellen biztosítsd az oldal biztonságát!**
4. **Logout-nál töröld a tokent: `localStorage.removeItem('token')`**
5. **Szenzitív adatokat (TAJ szám, jelszó) soha ne loggolj a konzolba éles környezetben!**

---

## TOVÁBBI SEGÉDANYAGOK

- **Swagger UI (Interaktív tesztelés):** https://romandi-vadaszhaz-klinik-backend.vercel.app/api-docs
- **MongoDB Dokumentáció:** https://docs.mongodb.com
- **JWT.io (Token debugger):** https://jwt.io
- **Postman Collection:** (Frontend csapattól igényelhetitek)

---

**Dokumentáció készítésének dátuma: 2026. február 12.**

**Utolsó frissítés: 2026. február 12.**

