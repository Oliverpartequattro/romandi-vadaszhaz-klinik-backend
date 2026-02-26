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
        const usersData = [
            {
                name: "Admin",
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
                gender: "MALE",
                specialization: "Végbéltan"
            }, 
            {
                name: "Dr. Süke Benedek",
                email: "suke.benedek@students.jedlik.eu",
                password: "doktorcigany2",
                phone: "06709471885",
                birthDate: new Date("1975-11-20"),
                role: "DOCTOR",
                gender: "MALE",
                specialization: "Lábászat"
            },
            {
                name: "Dr. Csöngető Csongor",
                email: "csongeto.csongor@students.jedlik.eu",
                password: "doktorcigany2",
                phone: "06709471885",
                birthDate: new Date("1975-11-20"),
                role: "DOCTOR",
                gender: "MALE",
                specialization: "Végbélrákászat"
            },
            
            {
                name: "Páciens Szemethy",
                email: "paciens@gmail.com",
                password: "doktorcigany2",
                phone: "062039185238",
                birthDate: new Date("1992-03-15"),
                role: "PATIENT",
                gender: "MALE",
                tajNumber: "936185927",
                address: "9021 Győr, Putrifészek utca 2."
            },
            {
                name: "Szemethy Levente",
                email: "szemethy.levente@students.jedlik.eu",
                password: "doktorcigany2",
                phone: "06203942855",
                birthDate: new Date("1952-02-11"),
                role: "PATIENT",
                gender: "MALE",
                tajNumber: "229462946",
                address: "9021 Győr, Jáki utca 11."
            },
            {
                name: "Tófalvi Zalán",
                email: "tofalvi.zalan@students.jedlik.eu",
                password: "doktorcigany2",
                phone: "06203924866",
                birthDate: new Date("2003-12-22"),
                role: "PATIENT",
                gender: "MALE",
                tajNumber: "947273852",
                address: "9444 Fertőszentmiklós, Lukinich Mihály utca 4."
            },
        ];

        // A Mongoose 'save' hook-ja fogja titkosítani a jelszavakat, 
        // ezért a create-et használjuk az insertMany helyett a biztonság kedvéért.
        const createdUsers = await User.create(usersData);
        const admin = createdUsers[0];
        const doctor1 = createdUsers[1];
        const doctor2 = createdUsers[2];
        const doctor3 = createdUsers[3];
        const patient = createdUsers[4];

        console.log("✅ Felhasználók létrehozva");

        // 2. Szolgáltatások létrehozása
        const servicesData = [
            {
                doctor_id: doctor1._id,
                topic: "Végbéltükrözés",
                description: "Végbéltükrözés, amely során egy vékony, hajlékony csövet vezetünk be a végbélen keresztül, hogy megvizsgáljuk a végbél és a vastagbél alsó szakaszát. Ez segít az esetleges rendellenességek, gyulladások vagy daganatok felismerésében.",
                location: "B épület, B8-as szoba",
                price: "50000 Ft",
                created_by: admin._id
            },
            {
                doctor_id: doctor1._id,
                topic: "Végbél szűrés",
                description: "Végbél szűrés, amely során egy egyszerű vizsgálattal ellenőrizzük a végbélnyílás és a környező terület állapotát, hogy időben felismerjük a rendellenességeket vagy a rákos elváltozásokat. Ez a szűrés különösen fontos azok számára, akiknek családjában előfordult végbélrák, vagy akiknek már voltak végbélproblémáik.",
                location: "B épület, B8-as szoba",
                price: "25000 Ft",
                created_by: admin._id
            },
            {
                doctor_id: doctor2._id,
                topic: "Lábvizsgálat",
                description: "Teljes körű lábvizsgálat, beleértve a vérkeringés és idegek állapotának ellenőrzését. Ez a vizsgálat különösen fontos cukorbetegek számára, akik hajlamosak a lábproblémákra, valamint azoknak, akiknek már voltak lábproblémáik, hogy megelőzzék a további komplikációkat.",
                location: "B épület, 101-es szoba",
                price: "500 Ft",
                created_by: admin._id
            },
            {
                doctor_id: doctor2._id,
                topic: "Lábnyomásmérés",
                description: "Lábnyomásmérés, amely során egy speciális eszközzel (nyelv) megmérjük a lábak vérnyomását. Ez segít az érrendszeri problémák, például a perifériás artériás betegség felismerésében, amely gyakran előfordulhat cukorbetegeknél és időseknél.",
                location: "B épület, 101-es szoba",
                price: "2500 Ft",
                created_by: admin._id
            },
            {
                doctor_id: doctor3._id,
                topic: "Végbélrák szűrés",
                description: "Végbélrák szűrés, amely magában foglalja a végbél és a környező szövetek alapos vizsgálatát, hogy időben felismerjük a rákos elváltozásokat vagy azok előjeleit.",
                location: "B épület, 102-es szoba",
                price: "35000 Ft",
                created_by: admin._id
            },
            {
                doctor_id: doctor3._id,
                topic: "Végbélrák nagyműtét",
                description: "Végbélrák nagyműtét, amely során a rákos szöveteket eltávolítjuk a testből. Ez a műtét különösen fontos, ha a rák korai stádiumban van.",
                location: "B épület, 102-es szoba",
                price: "150000 Ft",
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

router.get('/stats', async (req, res) => {
    try {
        // 1. Összes felhasználó száma (szerepkörönként bontva is hasznos)
        const totalUsers = await User.countDocuments();
        const patientCount = await User.countDocuments({ role: 'PATIENT' });
        const doctorCount = await User.countDocuments({ role: 'DOCTOR' });

        // 2. Mai időpontok száma
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        const appointmentsToday = await Appointment.countDocuments({
            startTime: { $gte: startOfToday, $lte: endOfToday }
        });

        // 3. Legnépszerűbb szolgáltatások (Aggregáció az időpontok alapján)
        const topServices = await Appointment.aggregate([
            { $group: { _id: "$service_id", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 3 },
            {
                $lookup: {
                    from: "services", // A kollekció neve az adatbázisban (többnyire kisbetűs többesszám)
                    localField: "_id",
                    foreignField: "_id",
                    as: "serviceInfo"
                }
            },
            { $unwind: "$serviceInfo" },
            { $project: { topic: "$serviceInfo.topic", count: 1 } }
        ]);

        // 4. Havi bevétel számítása (Tisztítani kell a "25000 Ft" típusú Stringeket)
        const allServices = await Service.find({});
        const monthlyRevenue = allServices.reduce((total, service) => {
            // Csak a számokat tartjuk meg a stringből (pl "25000 Ft" -> 25000)
            const priceValue = parseInt(service.price.replace(/[^0-9]/g, '')) || 0;
            return total + priceValue;
        }, 0);

        res.status(200).json({
            success: true,
            stats: {
                users: {
                    total: totalUsers,
                    patients: patientCount,
                    doctors: doctorCount
                },
                activity: {
                    appointmentsToday: appointmentsToday
                },
                business: {
                    totalRevenueEstimate: monthlyRevenue,
                    currency: "Ft",
                    topServices: topServices
                }
            }
        });

    } catch (error) {
        console.error("❌ Stats Error:", error.message);
        res.status(500).json({ message: "Hiba a statisztikák lekérésekor", error: error.message });
    }
});

export default router;