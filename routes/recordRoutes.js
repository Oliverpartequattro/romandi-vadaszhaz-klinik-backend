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
        const { patient, appointment_id, service_id, description } = req.body;

        // 1. Ellenőrizzük, hogy a páciens létezik-e
        const patientExists = await User.findById(patient);
        if (!patientExists || patientExists.role !== 'PATIENT') {
            return res.status(404).json({ message: "A megadott páciens nem található." });
        }

        // 2. Rekord létrehozása
        const newRecord = new Record({
            patient,
            doctor: req.user._id, // Aki be van jelentkezve
            appointment_id,
            service_id,
            description
        });

        const savedRecord = await newRecord.save();

        // 3. FRISSÍTÉS: Beírjuk a rekord ID-ját a páciens (User) records tömbjébe
        await User.findByIdAndUpdate(patient, {
            $push: { records: savedRecord._id }
        });
        
        console.log(`--- Új rekord mentve és hozzáfűzve a pácienshez: ${patientExists.name} ---`);
        
        res.status(201).json(savedRecord);
    } catch (error) {
        res.status(500).json({ 
            message: "Hiba a rekord mentésekor", 
            error: error.message 
        });
    }
});

export default router;