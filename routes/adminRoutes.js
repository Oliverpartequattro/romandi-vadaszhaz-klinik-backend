// import express from 'express';
// import User from '../models/User.js';
// import Appointment from '../models/Appointment.js';
// import Record from '../models/Record.js';
// import Service from '../models/Service.js';

// const router = express.Router();

// router.delete('/reset-db', async (req, res) => {
//     try {
//         console.log("--- ⚠️ DETAILED DATABASE RESET STARTED ---");

//         const models = [
//             { name: 'User', schema: User },
//             { name: 'Appointment', schema: Appointment },
//             { name: 'Record', schema: Record },
//             { name: 'Service', schema: Service }
//         ];

//         let summary = {};

//         for (const model of models) {
//             const items = await model.schema.find({});
//             console.log(`\n--- Deleting ${model.name}s (${items.length} found) ---`);
            
//             summary[model.name] = items.length;

//             for (const item of items) {
//                 await model.schema.findByIdAndDelete(item._id);
//                 // Itt írjuk ki egyenként a törölt adatokat
//                 console.log(`🗑️ Deleted ${model.name}: ID ${item._id} ${item.name || item.topic || ''}`);
//             }
//         }

//         console.log("\n--- ✅ DETAILED RESET COMPLETED ---");

//         res.status(200).json({
//             message: "Database wiped item by item.",
//             summary: summary
//         });
//     } catch (error) {
//         console.error("❌ Reset Error:", error.message);
//         res.status(500).json({ message: "Error during reset", error: error.message });
//     }
// });

// router.post('/seed', async (req, res) => {
//     try {
//         console.log("--- 🌱 MEGA-ADATBÁZIS FELTÖLTÉSE ---");

//         // 0. TISZTÍTÁS
//         await User.deleteMany({});
//         await Service.deleteMany({});
//         await Appointment.deleteMany({});
//         await Record.deleteMany({});

//         // 1. Felhasználók (Admin, 3 Orvos, 3 Páciens)
//         const usersData = [
//             { name: "Admin Olivér", email: "admin@gmail.com", password: "doktorcigany2", role: "ADMIN", phone: "06301111111", birthDate: "1985-01-01", gender: "MALE" },
//             { name: "Dr. Szemethy Levente", email: "doktor@gmail.com", password: "doktorcigany2", role: "DOCTOR", specialization: "Proktológia", phone: "06701111111", birthDate: "1970-05-15", gender: "MALE" },
//             { name: "Dr. Süke Benedek", email: "suke@gmail.com", password: "doktorcigany2", role: "DOCTOR", specialization: "Ortopédia", phone: "06702222222", birthDate: "1980-10-10", gender: "MALE" },
//             { name: "Dr. Csöngető Csongor", email: "csongeto@gmail.com", password: "doktorcigany2", role: "DOCTOR", specialization: "Onkológia", phone: "06703333333", birthDate: "1975-12-12", gender: "MALE" },
//             { name: "Páciens Szemethy", email: "paciens@gmail.com", password: "doktorcigany2", role: "PATIENT", tajNumber: "111222333", address: "9021 Győr, Fő utca 1.", phone: "06201111111", birthDate: "1995-03-20", gender: "MALE" },
//             { name: "Tófalvi Zalán", email: "tofalvi@gmail.com", password: "doktorcigany2", role: "PATIENT", tajNumber: "444555666", address: "9444 Fertőszentmiklós, Új út 5.", phone: "06202222222", birthDate: "2000-08-15", gender: "MALE" },
//             { name: "Kovács Katalin", email: "kata@gmail.com", password: "doktorcigany2", role: "PATIENT", tajNumber: "777888999", address: "1111 Budapest, Teszt u. 10.", phone: "06203333333", birthDate: "1990-11-05", gender: "FEMALE" }
//         ];

//         const createdUsers = await User.create(usersData);
//         const [admin, doc1, doc2, doc3, pat1, pat2, pat3] = createdUsers;

//         // 2. Szolgáltatások (Több opció orvosonként)
//         const servicesData = [
//             { doctor_id: doc1._id, topic: "Végbéltükrözés", description: "Vastagbél alsó szakaszának vizsgálata.", location: "B8 Szoba", price: "45000 Ft", created_by: admin._id },
//             { doctor_id: doc1._id, topic: "Aranyér konzultáció", description: "Szakorvosi tanácsadás.", location: "B8 Szoba", price: "25000 Ft", created_by: admin._id },
//             { doctor_id: doc2._id, topic: "Lábvizsgálat", description: "Lúdtalp és tartáshiba szűrés.", location: "A101 Szoba", price: "15000 Ft", created_by: admin._id },
//             { doctor_id: doc3._id, topic: "Onkológiai szűrés", description: "Teljes körű rákszűrés.", location: "C404 Szoba", price: "60000 Ft", created_by: admin._id }
//         ];
//         const createdServices = await Service.insertMany(servicesData);

//         // 3. IDŐPONTOK (Különböző időpontok és státuszok)
//         const now = new Date();
//         const appointmentsData = [
//             // MÚLTBELI (már lezajlott)
//             { doctor_id: doc1._id, patient_id: pat1._id, service_id: createdServices[0]._id, startTime: new Date(Date.now() + 1000 * 60 * 60 * 5), status: 'COMPLETED', referral_type: 'SELF', created_by: pat1._id },
//             { doctor_id: doc2._id, patient_id: pat1._id, service_id: createdServices[2]._id, startTime: new Date(Date.now() + 1000 * 60 * 60 *   5), status: 'COMPLETED', referral_type: 'SELF', created_by: pat1._id },
            
//             // JELENLEGI / MAI
//             { doctor_id: doc3._id, patient_id: pat1._id, service_id: createdServices[3]._id, startTime: new Date(now.getTime() + 3600000 * 2), status: 'ACCEPTED', referral_type: 'DOCTOR', referred_by: doc1._id, created_by: doc1._id },

//             // JÖVŐBELI
//             { doctor_id: doc1._id, patient_id: pat1._id, service_id: createdServices[1]._id, startTime: new Date(now.getTime() + 86400000 * 1), status: 'ACCEPTED', referral_type: 'SELF', created_by: pat1._id },
//             { doctor_id: doc2._id, patient_id: pat2._id, service_id: createdServices[2]._id, startTime: new Date(now.getTime() + 86400000 * 3), status: 'PENDING', referral_type: 'SELF', created_by: pat2._id },
//             { doctor_id: doc1._id, patient_id: pat1._id, service_id: createdServices[0]._id, startTime: new Date(now.getTime() + 86400000 * 7), status: 'PROPOSED', referral_type: 'SELF', created_by: doc1._id },
            
//             // LEMONDOTT
//             { doctor_id: doc3._id, patient_id: pat3._id, service_id: createdServices[3]._id, startTime: new Date(now.getTime() + 86400000 * 10), status: 'CANCELLED', referral_type: 'SELF', created_by: pat3._id }
//         ];
//         const createdAppointments = await Appointment.insertMany(appointmentsData);

//         // 4. LELETEK (Hogy legyen mit mutatni a timeline-on)
//         const recordsData = [
//             {
//                 patient: pat1._id, doctor: doc1._id, service: createdServices[0]._id, appointment_id: createdAppointments[0]._id,
//                 description: "Vizsgálat sikeresen lezajlott. Gyulladás jelei nem láthatók. Éves kontroll javasolt.",
//                 createdAt: new Date(now.getTime() - 86400000 * 5)
//             },
//             {
//                 patient: pat1._id, doctor: doc2._id, service: createdServices[2]._id, appointment_id: createdAppointments[1]._id,
//                 description: "Enyhe lúdtalp észlelhető. Speciális cipőbetét hordása javasolt napi 8 órában.",
//                 createdAt: new Date(now.getTime() - 86400000 * 2)
//             }
//         ];
//         const createdRecords = await Record.insertMany(recordsData);

//         // 5. FRISSÍTÉS: Páciens rekord tömbjének feltöltése
//         await User.findByIdAndUpdate(pat1._id, { $set: { records: createdRecords.map(r => r._id) } });

//         res.status(201).json({
//             success: true,
//             message: "Mega-Seed sikeres! 7 User, 4 Service, 7 Appointment, 2 Record generálva.",
//             summary: { users: 7, appointments: 7, records: 2, services: 4 }
//         });

//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// });

// router.get('/stats', async (req, res) => {
//     try {
//         // 1. Összes felhasználó száma (szerepkörönként bontva is hasznos)
//         const totalUsers = await User.countDocuments();
//         const patientCount = await User.countDocuments({ role: 'PATIENT' });
//         const doctorCount = await User.countDocuments({ role: 'DOCTOR' });

//         // 2. Mai időpontok száma
//         const startOfToday = new Date();
//         startOfToday.setHours(0, 0, 0, 0);
        
//         const endOfToday = new Date();
//         endOfToday.setHours(23, 59, 59, 999);

//         const appointmentsToday = await Appointment.countDocuments({
//             startTime: { $gte: startOfToday, $lte: endOfToday }
//         });

//         // 3. Legnépszerűbb szolgáltatások (Aggregáció az időpontok alapján)
//         const topServices = await Appointment.aggregate([
//             { $group: { _id: "$service_id", count: { $sum: 1 } } },
//             { $sort: { count: -1 } },
//             { $limit: 3 },
//             {
//                 $lookup: {
//                     from: "services", // A kollekció neve az adatbázisban (többnyire kisbetűs többesszám)
//                     localField: "_id",
//                     foreignField: "_id",
//                     as: "serviceInfo"
//                 }
//             },
//             { $unwind: "$serviceInfo" },
//             { $project: { topic: "$serviceInfo.topic", count: 1 } }
//         ]);

//         // 4. Havi bevétel számítása (Tisztítani kell a "25000 Ft" típusú Stringeket)
//         const allServices = await Service.find({});
//         const monthlyRevenue = allServices.reduce((total, service) => {
//             // Csak a számokat tartjuk meg a stringből (pl "25000 Ft" -> 25000)
//             const priceValue = parseInt(service.price.replace(/[^0-9]/g, '')) || 0;
//             return total + priceValue;
//         }, 0);

//         res.status(200).json({
//             success: true,
//             stats: {
//                 users: {
//                     total: totalUsers,
//                     patients: patientCount,
//                     doctors: doctorCount
//                 },
//                 activity: {
//                     appointmentsToday: appointmentsToday
//                 },
//                 business: {
//                     totalRevenueEstimate: monthlyRevenue,
//                     currency: "Ft",
//                     topServices: topServices
//                 }
//             }
//         });

//     } catch (error) {
//         console.error("❌ Stats Error:", error.message);
//         res.status(500).json({ message: "Hiba a statisztikák lekérésekor", error: error.message });
//     }
// });

// export default router;