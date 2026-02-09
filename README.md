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

A rendszer egy közös `User` modellt használ, de a kötelező mezők a `role` értékétől függően változnak.

### Közös mezők (Mindenki)
- `name`, `email`, `password`, `phone`

### Szerepkör alapú mezők
| Szerepkör (`role`) | Speciális mezők | Leírás |
| :--- | :--- | :--- |
| **PATIENT** | `tajNumber`, `address` | Alapértelmezett szerepkör, ezek kötelezőek. |
| **DOCTOR** | `specialization` | Csak orvosnál kötelező, nincs lakcím/TAJ. |
| **ADMIN** | - | Teljes hozzáférés a rendszerhez. |



---

## 🔐 Frontend Workflow (Token kezelés)

1. **Bejelentkezés:** Küldj egy `POST` kérést az `/api/users/login` végpontra.
2. **Token tárolása:** A válaszban érkező `token`-t mentsd el (`localStorage` vagy `cookie`).
3. **Autorizáció:** Minden védett kérésnél (pl. `/profile`) küldd el a headert:
   ```javascript
   headers: {
     Authorization: `Bearer ${your_token_here}`
   }