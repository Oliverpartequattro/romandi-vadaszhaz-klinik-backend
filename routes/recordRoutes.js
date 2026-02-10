import express from 'express';
import Record from '../models/Record.js';
import User from '../models/User.js';
import { protect, admin, doctorOrAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    1. Összes ellátási adat lekérése (ADMIN ONLY)
// @route   GET /api/records
router.get('/', protect, admin, async (req, res) => {
    try {
        console.log("--- Összes rekord lekérése (Admin) ---");
        
        // A .populate() segítségével az ID-k helyett a neveket is látjuk a válaszban
        const records = await Record.find({})
            .populate('patient_id', 'name email tajNumber')
            .populate('doctor_id', 'name specialization');

        res.json(records);
    } catch (error) {
        res.status(500).json({ 
            message: "Hiba a rekordok lekérésekor", 
            error: error.message 
        });
    }
});

// @desc   2. Új ellátási rekord létrehozása (Orvos vagy Admin)
// @route   POST /api/records
router.post('/', protect, doctorOrAdmin, async (req, res) => {
    try {
        const { patient_id, appointment_id, service_id, description } = req.body;

        // 1. Ellenőrizzük, hogy a páciens létezik-e
        const patientExists = await User.findById(patient_id);
        if (!patientExists || patientExists.role !== 'PATIENT') {
            return res.status(404).json({ message: "A megadott páciens nem található." });
        }

        // 2. Rekord létrehozása
        // A doctor_id-t automatikusan a bejelentkezett felhasználótól (req.user) vesszük
        const newRecord = new Record({
            patient_id,
            doctor_id: req.user._id, // Aki be van jelentkezve (orvos/admin)
            appointment_id,
            service_id,
            description
        });

        const savedRecord = await newRecord.save();
        
        console.log(`--- Új rekord mentve: Páciens: ${patientExists.name}, Orvos: ${req.user.name} ---`);
        
        res.status(201).json(savedRecord);
    } catch (error) {
        res.status(500).json({ 
            message: "Hiba a rekord mentésekor", 
            error: error.message 
        });
    }
});

export default router;