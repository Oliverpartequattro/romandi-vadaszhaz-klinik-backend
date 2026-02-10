# 🏥 Klinik Backend - Fejlesztői Dokumentáció

Webalapú klinikai időpontfoglaló rendszer backendje. Ez a dokumentáció a frontend fejlesztő munkáját hivatott segíteni.

## 🔗 Elérhetőségek
- **API Base URL:** `https://romandi-vadaszhaz-klinik-backend.vercel.app`
- **Interaktív Dokumentáció:** [/api-docs](https://romandi-vadaszhaz-klinik-backend.vercel.app/api-docs) (Swagger UI)

---

## 🛠 Technológiai Stack
- **Runtime:** Node.js (Express)
- **Adatbázis:** MongoDB Atlas
- **Auth:** JWT (JSON Web Token)
- **Dokumentáció:** Swagger / OpenAPI 3.0

---

## 👤 Felhasználói Modellek & Regisztráció

A rendszer egy közös `User` modellt használ, de a beküldendő mezők a `role` (szerepkör) értékétől függően változnak.

### Közös mezők (Mindenki)
- `name`, `email`, `password`, `phone`

### Szerepkör alapú mezők
| Szerepkör (`role`) | Speciális mezők | Leírás |
| :--- | :--- | :--- |
| **PATIENT** | `tajNumber`, `address` | Alapértelmezett szerepkör, ezek kötelezőek a regisztrációnál. |
| **DOCTOR** | `specialization` | Csak orvosnál kötelező, nincs lakcím/TAJ mezője. |
| **ADMIN** | - | Teljes hozzáférés a rendszerhez. |

---

## 🔐 Frontend Workflow (Token kezelés)

1. **Bejelentkezés:** Küldj egy `POST` kérést az `/api/users/login` végpontra.
2. **Token tárolása:** A válaszban érkező `token`-t mentsd el (`localStorage` vagy `cookie`).
3. **Autorizáció:** Minden védett kérésnél (pl. `/profile`, `/appointments`) küldd el a headert:
   ```javascript
   headers: {
     "Authorization": `Bearer <IDE_MÁSOLD_A_TOKENT>`
   }

**Kijelentkezés:**
Hívd meg a `/api/users/logout` végpontot, majd töröld a tokent a kliens oldalon
(`localStorage.removeItem('token')`).

---

## 📅 Időpontok & Beutalási Rendszer (Appointments)

Az időpontfoglalás összeköti a pácienst, az orvost és a szolgáltatást.

### Fontos mezők az Időpontban

* **startTime / endTime:** Az ellátás pontos kezdete és vége (ISO Date formátum).
* **referral_type:**

  * `"SELF"`: A páciens saját magának foglalt időpontot.
  * `"DOCTOR"`: Egy másik orvos utalta be a pácienst
    (ilyenkor a `referred_by` mező tartalmazza az orvos ID-ját).
* **status:** Alapértelmezett értéke `"BOOKED"`.

---

## 🛠 Leggyakoribb kérések példákkal

### 1. Bejelentkezés (Login)

**POST** `/api/users/login`

```json
{
  "email": "paciens@gmail.com",
  "password": "jelszo123"
}
```

### 2. Saját profil és leletek (Medical Records)

**GET** `/api/users/profile`
(Token szükséges!)

Visszaadja a felhasználó adatait, és a `records` listában az összes eddigi orvosi leletét, orvosi adatokkal együtt.

### 3. Összes időpont lekérése (Csak Admin)

**GET** `/api/appointments`
(Admin Token szükséges!)

Itt az ID-k helyett már kész objektumokat kapsz
(`doctor_id.name`, `patient_id.email`), így nem kell külön lekérdezéseket futtatnod a nevekhez.

---

## ⚠️ Hibakódok, amikre figyelj

* **401 Unauthorized:** Nincs tokened, vagy lejárt. Irányítsd a felhasználót a Login oldalra!
* **403 Forbidden:** Van tokened, de nincs jogod ehhez (pl. betegként akarsz admin listát látni).
* **404 Not Found:** Rossz ID-t küldtél, az adott elem nem létezik.
* **500 Server Error:** Hiba történt a szerveren.
