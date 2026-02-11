# 🏥 Klinik Backend - Fejlesztői Dokumentáció

Webalapú klinik időpontfoglaló rendszer backendje. Ez a dokumentáció a frontend fejlesztő munkáját hivatott segíteni a pontos mezőkkel és workflow-kkal.

## 🔗 Elérhetőségek

* **API Base URL:** `https://romandi-vadaszhaz-klinik-backend.vercel.app`
* **Interaktív Dokumentáció:** [/api-docs](https://romandi-vadaszhaz-klinik-backend.vercel.app/api-docs) (Swagger UI)

---

## 🛠 Technológiai Stack

* **Runtime:** Node.js (Express)
* **Adatbázis:** MongoDB Atlas
* **Auth:** JWT (JSON Web Token)
* **Validáció:** Mongoose Schemas & Custom Validators

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

*Utolsó frissítés: 2026. február 11.*
