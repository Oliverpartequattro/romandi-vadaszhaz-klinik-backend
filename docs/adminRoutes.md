# Admin Routes Documentation

This document describes the admin-only API endpoints for the Romándi Vadászház Klinik backend system. All these routes require authentication and admin privileges.

## Authentication
All admin routes are protected by the `protect` and `admin` middleware, ensuring only authenticated admin users can access them.

## Endpoints

### 1. Database Reset
**Endpoint:** `DELETE /api/admin/reset-db`  
**Description:** Resets the database by deleting all records from User, Appointment, Record, and Service collections, while preserving admin users.  
**Response:**  
```json
{
  "message": "Database wiped, admins preserved.",
  "summary": {
    "User": { "deleted": 0, "skipped": 0 },
    "Appointment": { "deleted": 0, "skipped": 0 },
    "Record": { "deleted": 0, "skipped": 0 },
    "Service": { "deleted": 0, "skipped": 0 }
  }
}
```

### 2. Seed Database
**Endpoint:** `POST /api/admin/seed`  
**Description:** Seeds the database with sample data including 7 users (1 admin, 3 doctors, 3 patients), 4 services, 7 appointments, and 2 records.  
**Response:**  
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

### 3. Get Statistics
**Endpoint:** `GET /api/admin/stats`  
**Description:** Retrieves system statistics including user counts, today's appointments, top services, and estimated monthly revenue.  
**Response:**  
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

### 4. Get All Users
**Endpoint:** `GET /api/admin/users`  
**Description:** Retrieves all users including their passwords (for debugging purposes only).  
**Response:** Array of user objects.

### 5. Update User
**Endpoint:** `PUT /api/admin/users/:id`  
**Description:** Updates a user by ID.  
**Parameters:**  
- `id` (URL): User ID  
**Body:** User fields to update (e.g., name, email, role, etc.)  
**Response:** Updated user object.

### 6. Delete User
**Endpoint:** `DELETE /api/admin/users/:id`  
**Description:** Deletes a user by ID.  
**Parameters:**  
- `id` (URL): User ID  
**Response:**  
```json
{
  "message": "Felhasználó törölve"
}
```

### 7. Get All Services
**Endpoint:** `GET /api/admin/services`  
**Description:** Retrieves all services with populated doctor information.  
**Response:** Array of service objects with doctor details.

### 8. Update Service
**Endpoint:** `PUT /api/admin/services/:id`  
**Description:** Updates a service by ID.  
**Parameters:**  
- `id` (URL): Service ID  
**Body:** Service fields to update (e.g., topic, description, price, etc.)  
**Response:** Updated service object.

### 9. Delete Service
**Endpoint:** `DELETE /api/admin/services/:id`  
**Description:** Deletes a service by ID.  
**Parameters:**  
- `id` (URL): Service ID  
**Response:**  
```json
{
  "message": "Szolgáltatás törölve"
}
```

### 10. Get All Appointments
**Endpoint:** `GET /api/admin/appointments`  
**Description:** Retrieves all appointments with populated patient, doctor, and service information.  
**Response:** Array of appointment objects with full details.

### 11. Update Appointment
**Endpoint:** `PUT /api/admin/appointments/:id`  
**Description:** Updates an appointment by ID.  
**Parameters:**  
- `id` (URL): Appointment ID  
**Body:** Appointment fields to update (e.g., status, startTime, etc.)  
**Response:** Updated appointment object.

### 12. Delete Appointment
**Endpoint:** `DELETE /api/admin/appointments/:id`  
**Description:** Deletes an appointment by ID.  
**Parameters:**  
- `id` (URL): Appointment ID  
**Response:**  
```json
{
  "message": "Időpont törölve"
}
```

## Error Handling
All endpoints return appropriate HTTP status codes and error messages in case of failures. Common errors include 400 for bad requests, 500 for server errors, and authentication errors for unauthorized access.</content>
<parameter name="filePath">d:\Programozás\Klinik\romandi-vadaszhaz-klinik-backend\docs\adminRoutes.md