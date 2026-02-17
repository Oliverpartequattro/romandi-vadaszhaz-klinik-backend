import express from 'express';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import Record from '../models/Record.js';
import Service from '../models/Service.js';

const router = express.Router();

router.delete('/reset-db', async (req, res) => {
    try {
        console.log("--- ⚠️ DETAILED DATABASE RESET STARTED ---");

        const models = [
            { name: 'User', schema: User },
            { name: 'Appointment', schema: Appointment },
            { name: 'Record', schema: Record },
            { name: 'Service', schema: Service }
        ];

        let summary = {};

        for (const model of models) {
            const items = await model.schema.find({});
            console.log(`\n--- Deleting ${model.name}s (${items.length} found) ---`);
            
            summary[model.name] = items.length;

            for (const item of items) {
                await model.schema.findByIdAndDelete(item._id);
                // Itt írjuk ki egyenként a törölt adatokat
                console.log(`🗑️ Deleted ${model.name}: ID ${item._id} ${item.name || item.topic || ''}`);
            }
        }

        console.log("\n--- ✅ DETAILED RESET COMPLETED ---");

        res.status(200).json({
            message: "Database wiped item by item.",
            summary: summary
        });
    } catch (error) {
        console.error("❌ Reset Error:", error.message);
        res.status(500).json({ message: "Error during reset", error: error.message });
    }
});

router.post('/seed', async (req, res) => {
    try {
        console.log("--- 🌱 ADATBÁZIS FELTÖLTÉSE FOLYAMATBAN ---");

        // 1. Felhasználók létrehozása (Admin, Orvos, Páciens)
        // A jelszó megfelel a regexnek: legalább 8 karakter, betű és szám is van benne.
        const usersData = [
            {
                name: "Admin Szemethy",
                email: "admin@gmail.com",
                password: "doktorcigany2",
                phone: "06301111111",
                birthDate: new Date("1985-05-10"),
                role: "ADMIN"
            },
            {
                name: "Dr. Doktor Szemethy Levente",
                email: "doktor@gmail.com",
                password: "doktorcigany2",
                phone: "06702222222",
                birthDate: new Date("1975-11-20"),
                role: "DOCTOR",
                specialization: "Végbéltan"
            },
            {
                name: "Páciens Szemethy",
                email: "paciens@gmail.com",
                password: "doktorcigany2",
                phone: "06203333333",
                birthDate: new Date("1992-03-15"),
                role: "PATIENT",
                gender: "MALE",
                tajNumber: "123456789",
                address: "9021 Győr, Putrifészek utca 2."
            }
        ];

        // A Mongoose 'save' hook-ja fogja titkosítani a jelszavakat, 
        // ezért a create-et használjuk az insertMany helyett a biztonság kedvéért.
        const createdUsers = await User.create(usersData);
        const admin = createdUsers[0];
        const doctor = createdUsers[1];
        const patient = createdUsers[2];

        console.log("✅ Felhasználók létrehozva");

        // 2. Szolgáltatások létrehozása
        const servicesData = [
            {
                doctor_id: doctor._id,
                topic: "Végbéltükrözés",
                description: "Teljes körű kardiológiai kivizsgálás EKG-val.",
                location: "B épület, 204-es szoba",
                date: new Date(Date.now() + 172800000), // 2 nap múlva
                price: "25000 Ft",
                created_by: admin._id
            },
            {
                doctor_id: doctor._id,
                topic: "Herecsavarás",
                description: "Szakorvosi tanácsadás és állapotfelmérés.",
                location: "B épület, 101-es szoba",
                date: new Date(Date.now() + 86400000), // Holnap
                price: "15000 Ft",
                created_by: admin._id
            }
        ];

        const createdServices = await Service.insertMany(servicesData);
        console.log("✅ Szolgáltatások létrehozva");

        // 3. Teszt Időpont (Appointment)
        // A startTime-nak jövőbelinek kell lennie a validátorod miatt!
        const appointment = await Appointment.create({
            doctor_id: doctor._id,
            patient_id: patient._id,
            service_id: createdServices[0]._id,
            startTime: new Date(Date.now() + 172800000), // 2 nap múlva (megegyezik a szervizzel)
            status: 'PENDING',
            referral_type: 'SELF',
            created_by: patient._id
        });
        console.log("✅ Teszt időpont létrehozva");

        // 4. Teszt Ellátási Rekord (Record)
        const record = await Record.create({
            patient: patient._id,
            doctor: doctor._id,
            appointment_id: appointment._id,
            service: createdServices[0]._id,
            description: "Végbélrák."
        });

        // A rekord ID-ját hozzáadjuk a pácienshez is, ahogy a route-odban is van
        await User.findByIdAndUpdate(patient._id, {
            $push: { records: record._id }
        });
        console.log("✅ Teszt ellátási rekord létrehozva");

        console.log("--- 🌱 ADATBÁZIS FELTÖLTÉSE SIKERES ---");

        res.status(201).json({
            message: "A magyar nyelvű tesztadatok sikeresen feltöltve!",
            summary: {
                users: createdUsers.length,
                services: createdServices.length,
                appointments: 1,
                records: 1
            }
        });

    } catch (error) {
        console.error("❌ Seed hiba:", error.message);
        res.status(500).json({ message: "Hiba a feltöltés során", error: error.message });
    }
});

export default router;