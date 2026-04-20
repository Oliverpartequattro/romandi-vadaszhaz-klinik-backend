# 🏥 Klinik Backend - Fejlesztői Dokumentáció

Webalapú klinik időpontfoglaló rendszer backendje. Ez a dokumentáció a frontend fejlesztő munkáját hivatott segíteni a pontos mezőkkel és workflow-kkal.

## 🔗 Elérhetőségek

* **API Base URL:** `https://romandi-vadaszhaz-klinik-backend.vercel.app`
* **Interaktív Dokumentáció:** [/api-docs](https://romandi-vadaszhaz-klinik-backend.vercel.app/api-docs) (Swagger UI)
* **Éles frontend url:** [Frontend](https://romandi-vadaszhaz-klinik-frontend-4.vercel.app)

---

## 🛠 Technológiai Stack

* **Runtime:** Node.js (Express) - ES6 Module System
* **Adatbázis:** MongoDB Atlas
* **Auth:** JWT (JSON Web Token)
* **Validáció:** Mongoose Schemas & Custom Validators
* **ORM:** Mongoose (MongoDB object modeling)

---

## 👤 Felhasználói Kezelés (Users)

### Regisztráció és Mezők

A rendszer közös modellt használ, de a validáció intelligens: a `role` alapján dől el, mi kötelező.

| Mező | Típus | Leírás | Validáció |
| --- | --- | --- | --- |
| `name` | String | Teljes név | Kötelező |
| `email` | String | Egyedi email | Regex ellenőrzött |
| `password` | String | Minimum 8 karakter | Min. 1 betű + 1 szám |
| `phone` | String | Magyar tel. szám | `+36` vagy `06` formátum |
| `tajNumber` | String | 9 számjegy | **Csak PATIENT esetén** kötelező |
| `address` | String | Lakcím | **Csak PATIENT esetén** kötelező |
| `specialization` | String | Szakterület | **Csak DOCTOR esetén** kötelező |

### 🔄 Profil Frissítés (PUT `/api/users/profile`)

**Fontos szabály:** Csak azokat a mezőket küldd el, amiket a felhasználó ténylegesen módosított!

* Ha a jelszó mező üres az űrlapon, **ne küldd el** a kérésben.
* A szerver csak akkor futtat validációt és titkosítást, ha a mező értéke változott.

---

## 👨‍💼 Admin Funkciók

Az admin végpontok csak adminisztrátori jogosultsággal elérhető funkciókat biztosítanak az adatbázis és rendszer kezeléséhez.

**Admin végpontok base URL:** `POST/GET/PUT/DELETE /api/admin/*`

### Admin Végpontok Áttekintése

| Végpont | Módszer | Leírás |
|---------|---------|--------|
| `/reset-db` | DELETE | Adatbázis teljes törlése (adminok megmaradnak) |
| `/seed` | POST | Mintaadatok feltöltése (7 user, 4 service, 7 appointment) |
| `/stats` | GET | Rendszerstatisztikák (felhasználók, mai időpontok, bevétel) |
| `/users` | GET | Összes felhasználó listázása |
| `/users/:id` | PUT | Felhasználó szerkesztése |
| `/users/:id` | DELETE | Felhasználó törlése |
| `/services` | GET | Összes szolgáltatás listázása |
| `/services/:id` | PUT | Szolgáltatás szerkesztése |
| `/services/:id` | DELETE | Szolgáltatás törlése |
| `/appointments` | GET | Összes időpont listázása |
| `/appointments/:id` | PUT | Időpont szerkesztése |
| `/appointments/:id` | DELETE | Időpont törlése |

### Admin Funkciók Részletesen

**1. Adatbázis Visszaállítása**
```bash
DELETE /api/admin/reset-db
```
Törli az összes adatot, kivéve az admin felhasználókat. Csak fejlesztésben és tesztelésben használjuk!

**2. Mintaadatok Feltöltése**
```bash
POST /api/admin/seed
```
Feltölti az adatbázist 7 felhasználóval (1 admin, 3 orvos, 3 páciens), 4 szolgáltatással, 7 időponttal és 2 lelete

**3. Rendszer Statisztikák**
```bash
GET /api/admin/stats
```
Lekéri az alapvető rendszerstatisztikákat: felhasználók száma, mai időpontok, legnépszerűbb szolgáltatások, becsült bevétel.

**4-12. Felhasználók, Szolgáltatások és Időpontok CRUD Operációi**

Admin teljes hozzáféréssel rendelkezik az összes adat módosításához és törléséhez.

📖 **Teljes admin dokumentáció:** Lásd [Admin Útmutató](docs/adminUtmutato.md)

---

## 🩺 Szolgáltatások és Idősávok (Services)

A `Service` nálad nem egy statikus lista, hanem az orvosok által meghirdetett **szabad időpontok**.

### Szolgáltatás létrehozása (POST `/api/services`)

Orvosként vagy Adminként tudsz új idősávot rögzíteni.

```json
{
  "doctor_id": "698a3e705cf74c640c1f4b1c",
  "topic": "Kardiológia",
  "description": "Szívultrahang és konzultáció",
  "location": "204-es vizsgáló",
  "date": "2026-05-20T10:00:00.000Z",
  "price": "1 lélek" 
}

```

*Megjegyzés: A `price` mező String, így elfogad számot ("25000") vagy egyedi szöveget is.*

---

## 🔐 Frontend Workflow & Auth

1. **Token tárolása:** Bejelentkezés után a kapott `token`-t `localStorage`-ba tedd.
2. **Autorizáció:** Minden védett kérésnél add meg: `Authorization: Bearer <token>`.
3. **Kijelentkezés:** Töröld a tokent a kliens oldalon, és hívd meg a `/api/users/logout` végpontot.

---

## 📅 Időpontfoglalás (Appointments)

Az időpontfoglalás (Appointment) összeköti a pácienst egy konkrét `Service`-szel.

* **referral_type:** `"SELF"` (saját) vagy `"DOCTOR"` (beutaló).
* **status:** - `PENDING`: Beküldve, orvosra vár.
* `CONFIRMED`: Az orvos jóváhagyta.
* `PROPOSED`: Az orvos módosított az időponton, a páciensnek el kell fogadnia.



---

## ⚠️ Hibakezelés (Frontend Tippek)

A backend most már részletes hibaüzeneteket küld a `400 Bad Request` mellé:

```json
{
  "message": "Validációs hiba",
  "error": "A TAJ számnak pontosan 9 számjegyből kell állnia, A jelszónak legalább 8 karakterből kell állnia..."
}

```

* **401 Unauthorized:** Irányíts a Loginra!
* **403 Forbidden:** Nincs jogosultsága (pl. beteg akar idősávot törölni).
* **400 Bad Request:** Formátum hiba vagy hiányzó kötelező mező.

---

---

## 📦 Projekt Szerkezet

```
romandi-vadaszhaz-klinik-backend/
├── models/              # Mongoose Schemas (ES6 modules)
│   ├── User.js
│   ├── Doctor.js
│   ├── Patient.js
│   ├── Appointment.js
│   ├── Record.js
│   └── Service.js
├── routes/              # API végpontok
│   ├── userRoutes.js
│   └── adminRoutes.js
├── config/              # Konfigurációs fájlok
│   └── db.js
├── mock data/           # Test adatok JSON-L formátumban
├── server.js            # Express szerver belépési pontja
└── package.json
```

---

## 🔄 ES6 Module Rendszer

A projekt ES6 `import/export` szintaxist használ:

```javascript
// Models importálása
import User from './models/User.js';
import Service from './models/Service.js';
import Appointment from './models/Appointment.js';

// Model definiálása
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    // ... mezők
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
```

---

## 📋 Modellek és Kötelező Mezők

### **User Model**

**Kötelező mezők (mindenkire):**
| Mező | Típus | Validáció |
|------|-------|-----------|
| `name` | String | 3-50 karakter |
| `email` | String | Egyedi, regex validáció |
| `password` | String | Min 8 kar, betű + szám szükséges |
| `phone` | String | Magyar telefonszám (+36 vagy 06) |
| `birthDate` | Date | 0-110 év közötti kor |
| `gender` | String | MALE vagy FEMALE |
| `role` | String | ADMIN, DOCTOR, PATIENT |

**Kondicionális kötelezők (csak PATIENT):**
| Mező | Típus | Validáció |
|------|-------|-----------|
| `tajNumber` | String | Pontosan 9 számjegy |
| `address` | String | Formátum: 1234 Város, Utca |

**Kondicionális kötelezők (csak DOCTOR):**
| Mező | Típus | Validáció |
|------|-------|-----------|
| `specialization` | String | Kötelező orvosoknak |

**Opcionális mezők:**
- `resetPasswordCode` - String
- `resetPasswordExpires` - Date
- `records` - Array (Record-okra való hivatkozások)
- `availabilities` - Array (Availability-kra való hivatkozások)

---

### **Service Model**

**Kötelező mezők:**
| Mező | Típus | Leírás |
|------|-------|--------|
| `doctor_id` | ObjectId | User referencia (orvos) |
| `topic` | String | Pl. Kardiológia, Ortopédia |
| `description` | String | Szolgáltatás leírása |
| `location` | String | Helyszín (pl. 102-es vizsgáló) |
| `price` | String | Ár (számadat vagy szöveg) |

**Opcionális mezők:**
- `date` - Date (konkrét időpont)
- `patient_id` - ObjectId (User referencia, default: null)
- `created_by` - ObjectId (User referencia)

---

### **Appointment Model**

**Kötelező mezők:**
| Mező | Típus | Validáció |
|------|-------|-----------|
| `doctor_id` | ObjectId | User referencia |
| `patient_id` | ObjectId | User referencia |
| `service_id` | ObjectId | Service referencia |
| `startTime` | Date | Múltbeli nem lehet, jövő dátum szükséges |
| `status` | String | PENDING, ACCEPTED, REJECTED, PROPOSED, CANCELLED, COMPLETED |

**Opcionális mezők:**
- `endTime` - Date (nagyobb kell legyen, mint startTime)
- `referral_type` - String (SELF vagy DOCTOR, default: SELF)
- `referred_by` - ObjectId (User referencia, DOCTOR referral esetén)
- `created_by` - ObjectId (User referencia)

---

### **Availability Model**

**Kötelező mezők:**
| Mező | Típus | Validáció |
|------|-------|-----------|
| `doctor` | ObjectId | User referencia |
| `dayOfWeek` | String | Hétfő-Vasárnap |
| `startTime` | String | HH:mm formátum (pl. 08:00) |
| `endTime` | String | HH:mm formátum (pl. 16:00) |

**Opcionális mezők:**
- `slotDuration` - Number (default: 30 perc, minimum: 10)
- `isActive` - Boolean (default: true, orvos betegszabadság kezeléshez)

**Speciális szabály:** Egy orvosnak egy napra csak egy rendelési ideje lehet (unique index: `doctor + dayOfWeek`)

---

### **Record Model**

**Kötelező mezők:**
| Mező | Típus | Leírás |
|------|-------|--------|
| `patient` | ObjectId | User referencia (páciens) |
| `doctor` | ObjectId | User referencia (orvos) |
| `description` | String | Vizsgálat/kezelés leírása |

**Opcionális mezők:**
- `appointment_id` - ObjectId (Appointment referencia)
- `service` - ObjectId (Service referencia)

---

## 📚 Dokumentációs Fájlok

- **Admin Útmutató:** [adminUtmutato.md](docs/adminUtmutato.md) - Teljes admin funkciókat leíró útmutató magyar nyelven
- **Admin Routes API:** [adminRoutes.md](docs/adminRoutes.md) - Admin végpontok API dokumentációja

---

*Utolsó frissítés: 2026. április 20.*
