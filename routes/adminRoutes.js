import express from 'express';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import Record from '../models/Record.js';
import Service from '../models/Service.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- VÉDELEM: Minden itt következő route ADMIN jogot igényel ---
router.use(protect, admin);

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
            
            summary[model.name] = { deleted: 0, skipped: 0 };

            for (const item of items) {
                // ITT A VÉDELEM: Ha User modellről van szó és ADMIN, akkor kihagyjuk a törlést
                if (model.name === 'User' && item.role === 'ADMIN') {
                    console.log(`🛡️ SKIPPED Admin: ${item.name} (${item._id})`);
                    summary[model.name].skipped++;
                    continue; // Ugrás a következő elemre
                }

                await model.schema.findByIdAndDelete(item._id);
                summary[model.name].deleted++;
                console.log(`🗑️ Deleted ${model.name}: ID ${item._id} ${item.name || item.topic || ''}`);
            }
        }

        console.log("\n--- ✅ DETAILED RESET COMPLETED ---");

        res.status(200).json({
            message: "Database wiped, admins preserved.",
            summary: summary
        });
    } catch (error) {
        console.error("❌ Reset Error:", error.message);
        res.status(500).json({ message: "Error during reset", error: error.message });
    }
});

router.post('/seed', async (req, res) => {
    try {
        console.log("--- 🌱 MEGA-ADATBÁZIS FELTÖLTÉSE ---");

        // 0. TISZTÍTÁS
        await User.deleteMany({});
        await Service.deleteMany({});
        await Appointment.deleteMany({});
        await Record.deleteMany({});

        // 1. Felhasználók (Admin, 3 Orvos, 3 Páciens)
        const usersData = [
            // { name: "Admin Olivér", email: "admin@gmail.com", password: "doktorcigany2", role: "ADMIN", phone: "06301111111", birthDate: "1985-01-01", gender: "MALE" },
            { name: "Dr. Szemethy Levente", email: "doktor@gmail.com", password: "doktorcigany2", role: "DOCTOR", specialization: "Proktológia", phone: "06701111111", birthDate: "1970-05-15", gender: "MALE" },
            { name: "Dr. Süke Benedek", email: "suke@gmail.com", password: "doktorcigany2", role: "DOCTOR", specialization: "Ortopédia", phone: "06702222222", birthDate: "1980-10-10", gender: "MALE" },
            { name: "Dr. Csöngető Csongor", email: "csongeto@gmail.com", password: "doktorcigany2", role: "DOCTOR", specialization: "Onkológia", phone: "06703333333", birthDate: "1975-12-12", gender: "MALE" },
            { name: "Páciens Szemethy", email: "paciens@gmail.com", password: "doktorcigany2", role: "PATIENT", tajNumber: "111222333", address: "9021 Győr, Fő utca 1.", phone: "06201111111", birthDate: "1995-03-20", gender: "MALE" },
            { name: "Tófalvi Zalán", email: "tofalvi@gmail.com", password: "doktorcigany2", role: "PATIENT", tajNumber: "444555666", address: "9444 Fertőszentmiklós, Új út 5.", phone: "06202222222", birthDate: "2000-08-15", gender: "MALE" },
            { name: "Kovács Katalin", email: "kata@gmail.com", password: "doktorcigany2", role: "PATIENT", tajNumber: "777888999", address: "1111 Budapest, Teszt u. 10.", phone: "06203333333", birthDate: "1990-11-05", gender: "FEMALE" }
        ];

        const createdUsers = await User.create(usersData);
        const [admin, doc1, doc2, doc3, pat1, pat2, pat3] = createdUsers;

        // 2. Szolgáltatások (Több opció orvosonként)
        const servicesData = [
            { doctor_id: doc1._id, topic: "Végbéltükrözés", description: "Vastagbél alsó szakaszának vizsgálata.", location: "B8 Szoba", price: "45000 Ft", created_by: admin._id },
            { doctor_id: doc1._id, topic: "Aranyér konzultáció", description: "Szakorvosi tanácsadás.", location: "B8 Szoba", price: "25000 Ft", created_by: admin._id },
            { doctor_id: doc2._id, topic: "Lábvizsgálat", description: "Lúdtalp és tartáshiba szűrés.", location: "A101 Szoba", price: "15000 Ft", created_by: admin._id },
            { doctor_id: doc3._id, topic: "Onkológiai szűrés", description: "Teljes körű rákszűrés.", location: "C404 Szoba", price: "60000 Ft", created_by: admin._id }
        ];
        const createdServices = await Service.insertMany(servicesData);

        // 3. IDŐPONTOK (Különböző időpontok és státuszok)
        const now = new Date();
        const appointmentsData = [
            // MÚLTBELI (már lezajlott)
            { doctor_id: doc1._id, patient_id: pat1._id, service_id: createdServices[0]._id, startTime: new Date(Date.now() + 1000), status: 'ACCEPTED', referral_type: 'SELF', created_by: pat1._id },
            { doctor_id: doc2._id, patient_id: pat1._id, service_id: createdServices[2]._id, startTime: new Date(Date.now() + 1000), status: 'ACCEPTED', referral_type: 'SELF', created_by: pat1._id },
            
            // JELENLEGI / MAI
            { doctor_id: doc3._id, patient_id: pat1._id, service_id: createdServices[3]._id, startTime: new Date(now.getTime() + 3600000 * 2), status: 'ACCEPTED', referral_type: 'DOCTOR', referred_by: doc1._id, created_by: doc1._id },

            // JÖVŐBELI
            { doctor_id: doc1._id, patient_id: pat1._id, service_id: createdServices[1]._id, startTime: new Date(now.getTime() + 86400000 * 1), status: 'ACCEPTED', referral_type: 'SELF', created_by: pat1._id },
            { doctor_id: doc2._id, patient_id: pat2._id, service_id: createdServices[2]._id, startTime: new Date(now.getTime() + 86400000 * 3), status: 'PENDING', referral_type: 'SELF', created_by: pat2._id },
            { doctor_id: doc1._id, patient_id: pat1._id, service_id: createdServices[0]._id, startTime: new Date(now.getTime() + 86400000 * 7), status: 'PROPOSED', referral_type: 'SELF', created_by: doc1._id },
            
            // LEMONDOTT
            { doctor_id: doc3._id, patient_id: pat3._id, service_id: createdServices[3]._id, startTime: new Date(now.getTime() + 86400000 * 10), status: 'CANCELLED', referral_type: 'SELF', created_by: pat3._id }
        ];
        const createdAppointments = await Appointment.insertMany(appointmentsData);

        // 4. LELETEK (Hogy legyen mit mutatni a timeline-on)
        const recordsData = [
            {
                patient: pat1._id, doctor: doc1._id, service: createdServices[0]._id, appointment_id: createdAppointments[0]._id,
                description: "Vizsgálat sikeresen lezajlott. Gyulladás jelei nem láthatók. Éves kontroll javasolt.",
                createdAt: new Date(now.getTime() - 86400000 * 5)
            },
            {
                patient: pat1._id, doctor: doc2._id, service: createdServices[2]._id, appointment_id: createdAppointments[1]._id,
                description: "Enyhe lúdtalp észlelhető. Speciális cipőbetét hordása javasolt napi 8 órában.",
                createdAt: new Date(now.getTime() - 86400000 * 2)
            }
        ];
        const createdRecords = await Record.insertMany(recordsData);

        // 5. FRISSÍTÉS: Páciens rekord tömbjének feltöltése
        await User.findByIdAndUpdate(pat1._id, { $set: { records: createdRecords.map(r => r._id) } });

        res.status(201).json({
            success: true,
            message: "Mega-Seed sikeres! 7 User, 4 Service, 7 Appointment, 2 Record generálva.",
            summary: { users: 7, appointments: 7, records: 2, services: 4 }
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
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

// --- 2. FELHASZNÁLÓKEZELÉS (CRUD) ---
// Összes felhasználó jelszóval (DEBUG ONLY!)
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({}).select('+password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Hiba a felhasználók listázásakor" });
    }
});

// Felhasználó szerkesztése
router.put('/users/:id', async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: "Hiba a módosítás során" });
    }
});

// Felhasználó törlése
router.delete('/users/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "Felhasználó törölve" });
    } catch (error) {
        res.status(500).json({ message: "Hiba a törlés során" });
    }
});

// --- 3. SZOLGÁLTATÁSOK KEZELÉSE (CRUD) ---
router.get('/services', async (req, res) => {
    try {
        const services = await Service.find({}).populate('doctor_id', 'name');
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: "Hiba a szolgáltatások listázásakor" });
    }
});

router.put('/services/:id', async (req, res) => {
    try {
        const updatedService = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedService);
    } catch (error) {
        res.status(400).json({ message: "Hiba a szolgáltatás módosításakor" });
    }
});

router.delete('/services/:id', async (req, res) => {
    try {
        await Service.findByIdAndDelete(req.params.id);
        res.json({ message: "Szolgáltatás törölve" });
    } catch (error) {
        res.status(500).json({ message: "Hiba a törlés során" });
    }
});

// --- 4. IDŐPONTOK KEZELÉSE (CRUD) ---
router.get('/appointments', async (req, res) => {
    try {
        const apps = await Appointment.find({}).populate('patient_id doctor_id service_id');
        res.json(apps);
    } catch (error) {
        res.status(500).json({ message: "Hiba az időpontok listázásakor" });
    }
});

router.put('/appointments/:id', async (req, res) => {
    try {
        const updatedApp = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedApp);
    } catch (error) {
        res.status(400).json({ message: "Hiba az időpont módosításakor" });
    }
});

router.delete('/appointments/:id', async (req, res) => {
    try {
        await Appointment.findByIdAndDelete(req.params.id);
        res.json({ message: "Időpont törölve" });
    } catch (error) {
        res.status(500).json({ message: "Hiba a törlés során" });
    }
});

export default router;