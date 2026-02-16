import express from 'express';
import Record from '../models/Record.js';
import User from '../models/User.js';
import { protect, admin, doctorOrAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    1.1 Összes ellátási adat lekérése (ADMIN ONLY)
// @route   GET /api/records
router.get('/', protect, admin, async (req, res) => {
    try {
        console.log("--- Összes rekord lekérése (Admin) ---");
        
        // A .populate() segítségével az ID-k helyett a neveket is látjuk a válaszban
        const records = await Record.find({})
            .populate('patient', 'name email tajNumber')
            .populate('doctor', 'name specialization');

        res.json(records);
    } catch (error) {
        res.status(500).json({ 
            message: "Hiba a rekordok lekérésekor", 
            error: error.message 
        });
    }
});

// @desc    1.2 Egy adott páciens összes rekordja (Orvos/Admin mindent, Páciens csak a sajátját)
// @route   GET /api/records/patient/:patientId
router.get('/patient/:patientId', protect, async (req, res) => {
    try {
        const targetPatientId = req.params.patientId;
        const currentUser = req.user;

        // JOGOSULTSÁG ELLENŐRZÉSE:
        // Csak akkor mehet tovább, ha:
        // 1. Admin VAGY Orvos
        // 2. Ő maga a páciens (saját ID-ját kéri le)
        const isStaff = currentUser.role === 'ADMIN' || currentUser.role === 'DOCTOR';
        const isSelf = currentUser._id.toString() === targetPatientId;

        if (!isStaff && !isSelf) {
            return res.status(403).json({ 
                message: "Nincs jogosultságod más páciens kórtörténetét megtekinteni!" 
            });
        }

        const history = await Record.find({ patient: targetPatientId })
            .populate('doctor', 'name specialization')
            .populate('service', 'name price')
            .sort({ createdAt: -1 });

        res.json(history);
    } catch (error) {
        res.status(500).json({ message: "Hiba a lekéréskor", error: error.message });
    }
});

// @desc    1.3 Bejelentkezett felhasználó saját rekordjainak lekérése
// @route   GET /api/records/my
router.get('/my', protect, async (req, res) => {
    try {
        let filter = {};

        // Ha páciens: a saját leleteit látja
        if (req.user.role === 'PATIENT') {
            filter = { patient: req.user._id };
        } 
        // Ha orvos: az általa kiállított leleteket látja
        else if (req.user.role === 'DOCTOR') {
            filter = { doctor: req.user._id };
        }
        // Admin: láthat mindent, vagy üresen hagyva a saját "orvosi" rekordjait (ha van ilyen)

        const myRecords = await Record.find(filter)
            .populate('patient', 'name email tajNumber')
            .populate('doctor', 'name specialization')
            .populate('service', 'topic location')
            .sort({ createdAt: -1 }); // A legfrissebb lelet legfelül

        res.json(myRecords);
    } catch (error) {
        res.status(500).json({ 
            message: "Hiba a saját rekordok lekérésekor", 
            error: error.message 
        });
    }
});

// @desc    2. Új ellátási rekord létrehozása (Orvos vagy Admin)
// @route   POST /api/records
router.post('/', protect, doctorOrAdmin, async (req, res) => {
    try {
        // Figyelem: A req.body-ból service néven jön az ID
        const { patient, appointment_id, service, description } = req.body;

        // 1. Ellenőrizzük, hogy a páciens létezik-e
        const patientExists = await User.findById(patient);
        if (!patientExists || patientExists.role !== 'PATIENT') {
            return res.status(404).json({ message: "A megadott páciens nem található." });
        }

        // 2. Rekord létrehozása
        const newRecord = new Record({
            patient,
            doctor: req.user._id, // A bejelentkezett orvos
            appointment_id,
            service: service, // Itt rendeljük hozzá a kapott service ID-t
            description
        });

        const savedRecord = await newRecord.save();

        // 3. FRISSÍTÉS: Beírjuk a rekord ID-ját a páciens (User) records tömbjébe
        await User.findByIdAndUpdate(patient, {
            $push: { records: savedRecord._id }
        });

        // 4. POPULÁLÁS: Kikérjük a neveket az ID-k helyett a válaszhoz és az emailhez
        const populatedRecord = await Record.findById(savedRecord._id)
            .populate('doctor', 'name')
            .populate('service', 'topic location');

        // 5. EMAIL KÜLDÉS: Értesítés a páciensnek
        // Importáld a sendDoctorResponseEmail-t a mail.js-ből!
        const { sendDoctorResponseEmail } = await import('../mail/mail.js'); // Vagy a fájl tetején importáld
        
        sendDoctorResponseEmail(
            patientExists.email,
            patientExists.name,
            populatedRecord.service?.topic || "Orvosi vizsgálat",
            populatedRecord.doctor?.name || req.user.name
        ).catch(err => console.error("❌ Email hiba a leletnél:", err.message));

        console.log(`--- ✅ Új rekord mentve és értesítés elküldve: ${patientExists.name} ---`);

        // A válaszban már a teljes, kifejtett objektum megy vissza
        res.status(201).json(populatedRecord);

    } catch (error) {
        console.error("❌ Hiba a rekord mentésekor:", error);
        res.status(500).json({ 
            message: "Hiba a rekord mentésekor", 
            error: error.message 
        });
    }
});

export default router;