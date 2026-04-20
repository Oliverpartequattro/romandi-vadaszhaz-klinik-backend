# Admin Útmutató - Romándi Vadászház Klinik

## Bevezetés

Ez az átfogó útmutató bemutatja az adminisztrátori funkciókat a Romándi Vadászház Klinik backend rendszerében. Az összes admin végpont védett, csak hitelesített adminisztrátorok számára elérhető.

## Előfeltételek

- **Hitelesítés szükséges**: Minden admin művelet előtt be kell jelentkezni adminisztrátori fiókkal.
- **API Base URL**: `http://localhost:5000/api/admin` (fejlesztési környezetben)
- **Autentikációs token**: A `Authorization: Bearer <token>` header szükséges minden kérésnél.

## Általános használati útmutató

### 1. Bejelentkezés
Először jelentkezzen be adminisztrátori fiókkal a `/api/users/login` végponton keresztül:

```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@gmail.com", "password": "doktorcigany2"}'
```

A válaszban kapott `token`-t használja minden további admin kérésnél.

### 2. API kérések formátuma
Minden admin kérés tartalmazza:
- `Authorization: Bearer <token>` header
- JSON formátumú body (PUT és POST kéréseknél)

### 3. Hibakezelés
- **401 Unauthorized**: Nincs hitelesítés vagy nem admin felhasználó
- **400 Bad Request**: Hibás adatok
- **500 Internal Server Error**: Szerverhiba

## Admin Végpontok Részletes Leírása

### 1. Adatbázis Visszaállítása
**Végpont:** `DELETE /api/admin/reset-db`  
**Leírás:** Teljes adatbázis visszaállítása. Törli az összes felhasználót, időpontot, leletet és szolgáltatást, kivéve az adminisztrátorokat.  
**Használat:** Csak fejlesztési környezetben vagy teszteléskor használja!  
**Példa kérés:**
```bash
curl -X DELETE http://localhost:5000/api/admin/reset-db \
  -H "Authorization: Bearer <token>"
```
**Válasz példa:**
```json
{
  "message": "Database wiped, admins preserved.",
  "summary": {
    "User": { "deleted": 5, "skipped": 1 },
    "Appointment": { "deleted": 10, "skipped": 0 },
    "Record": { "deleted": 8, "skipped": 0 },
    "Service": { "deleted": 4, "skipped": 0 }
  }
}
```

### 2. Adatbázis Feltöltése Mintaadatokkal
**Végpont:** `POST /api/admin/seed`  
**Leírás:** Feltölti az adatbázist mintaadatokkal: 7 felhasználó (1 admin, 3 orvos, 3 páciens), 4 szolgáltatás, 7 időpont és 2 lelet.  
**Használat:** Teszteléshez vagy demonstrációhoz.  
**Példa kérés:**
```bash
curl -X POST http://localhost:5000/api/admin/seed \
  -H "Authorization: Bearer <token>"
```
**Válasz példa:**
```json
{
  "success": true,
  "message": "Mega-Seed sikeres! 7 User, 4 Service, 7 Appointment, 2 Record generálva.",
  "summary": {
    "users": 7,
    "appointments": 7,
    "records": 2,
    "services": 4
  }
}
```

### 3. Statisztikák Lekérése
**Végpont:** `GET /api/admin/stats`  
**Leírás:** Rendszerstatisztikák megjelenítése: felhasználók száma, mai időpontok, legnépszerűbb szolgáltatások, becsült bevétel.  
**Példa kérés:**
```bash
curl -X GET http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer <token>"
```
**Válasz példa:**
```json
{
  "success": true,
  "stats": {
    "users": {
      "total": 7,
      "patients": 3,
      "doctors": 3
    },
    "activity": {
      "appointmentsToday": 1
    },
    "business": {
      "totalRevenueEstimate": 145000,
      "currency": "Ft",
      "topServices": [
        { "topic": "Végbéltükrözés", "count": 2 },
        { "topic": "Lábvizsgálat", "count": 2 },
        { "topic": "Aranyér konzultáció", "count": 1 }
      ]
    }
  }
}
```

## Felhasználók Kezelése

### 4. Összes Felhasználó Listázása
**Végpont:** `GET /api/admin/users`  
**Leírás:** Az összes felhasználó listázása jelszavakkal együtt (csak debug célból!).  
**Figyelem:** Éles környezetben ne használja, mert tartalmazza a jelszavakat!  
**Példa kérés:**
```bash
curl -X GET http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer <token>"
```

### 5. Felhasználó Szerkesztése
**Végpont:** `PUT /api/admin/users/:id`  
**Leírás:** Felhasználó adatainak módosítása.  
**Paraméterek:**  
- `id`: Felhasználó azonosítója  
**Body példa:**
```json
{
  "name": "Új Név",
  "email": "uj.email@example.com",
  "role": "DOCTOR"
}
```
**Példa kérés:**
```bash
curl -X PUT http://localhost:5000/api/admin/users/60f1b2b3c4d5e6f7g8h9i0j1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Új Név", "email": "uj.email@example.com"}'
```

### 6. Felhasználó Törlése
**Végpont:** `DELETE /api/admin/users/:id`  
**Leírás:** Felhasználó törlése az adatbázisból.  
**Figyelem:** Ez a művelet visszafordíthatatlan!  
**Példa kérés:**
```bash
curl -X DELETE http://localhost:5000/api/admin/users/60f1b2b3c4d5e6f7g8h9i0j1 \
  -H "Authorization: Bearer <token>"
```
**Válasz:**
```json
{
  "message": "Felhasználó törölve"
}
```

## Szolgáltatások Kezelése

### 7. Összes Szolgáltatás Listázása
**Végpont:** `GET /api/admin/services`  
**Leírás:** Az összes szolgáltatás listázása orvos adatokkal együtt.  
**Példa kérés:**
```bash
curl -X GET http://localhost:5000/api/admin/services \
  -H "Authorization: Bearer <token>"
```

### 8. Szolgáltatás Szerkesztése
**Végpont:** `PUT /api/admin/services/:id`  
**Leírás:** Szolgáltatás adatainak módosítása.  
**Body példa:**
```json
{
  "topic": "Új szolgáltatás",
  "description": "Leírás",
  "price": "30000 Ft"
}
```

### 9. Szolgáltatás Törlése
**Végpont:** `DELETE /api/admin/services/:id`  
**Leírás:** Szolgáltatás törlése.  
**Figyelem:** Ha aktív időpontok tartoznak hozzá, gondolja át!  

## Időpontok Kezelése

### 10. Összes Időpont Listázása
**Végpont:** `GET /api/admin/appointments`  
**Leírás:** Az összes időpont listázása páciens, orvos és szolgáltatás adatokkal.  

### 11. Időpont Szerkesztése
**Végpont:** `PUT /api/admin/appointments/:id`  
**Leírás:** Időpont adatainak módosítása (státusz, idő, stb.).  
**Body példa:**
```json
{
  "status": "ACCEPTED",
  "startTime": "2024-01-15T10:00:00Z"
}
```

### 12. Időpont Törlése
**Végpont:** `DELETE /api/admin/appointments/:id`  
**Leírás:** Időpont törlése.  

## Biztonsági Figyelmeztetések

1. **Adatbázis visszaállítása**: Csak fejlesztési környezetben használja! Éles adatok elvesznek.
2. **Felhasználók jelszavai**: A `/users` végpont éles környezetben tilos.
3. **Törlési műveletek**: Mindig ellenőrizze, hogy nincs-e függő adat.
4. **Token kezelés**: Soha ne ossza meg az autentikációs tokent.
5. **Naplózás**: Minden admin művelet naplózásra kerül a szerveren.

## Hibaelhárítás

- **401 hiba**: Ellenőrizze a token érvényességét és admin jogosultságokat.
- **400 hiba**: Ellenőrizze a kérés formátumát és adatokat.
- **500 hiba**: Lásd a szerver logokat részletes hibaüzenetért.

## Kapcsolódó Dokumentáció

- [Felhasználói API](user.swagger.yaml)
- [Időpont API](appointment.swagger.yaml)
- [Szolgáltatás API](service.swagger.yaml)
- [Lelet API](record.swagger.yaml)
- [Elérhetőség API](availability.swagger.yaml)

---

**Verzió:** 1.0  
**Frissítve:** 2026. április 20.  
**Szerző:** Klinik Adminisztrációs Rendszer</content>
<parameter name="filePath">d:\Programozás\Klinik\romandi-vadaszhaz-klinik-backend\docs\adminUtmutato.md