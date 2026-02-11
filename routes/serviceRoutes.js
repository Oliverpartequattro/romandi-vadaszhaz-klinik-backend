import express from 'express';
import Service from '../models/Service.js'; // Feltételezve, hogy létezik a modell
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    1. Összes szolgáltatás lekérése (Mindenki)
// @route   GET /api/services
router.get('/', async (req, res) => {
    try {
        const services = await Service.find({}).sort({ name: 1 });
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: 'Hiba a szolgáltatások lekérésekor', error: error.message });
    }
});

// @desc    2. Új szolgáltatás létrehozása (Admin bárkinek, Orvos csak saját magának)
// @route   POST /api/services
router.post('/', protect, async (req, res) => {
    try {
        const { topic, description, location, date, price, patient_id, doctor_id } = req.body;

        // JOGOSULTSÁG ELLENŐRZÉS
        // Ha nem admin, és az orvos nem a saját ID-ját küldi be
        if (req.user.role !== 'ADMIN' && req.user._id.toString() !== doctor_id) {
            return res.status(403).json({ message: 'Csak a saját nevedben hozhatsz létre szolgáltatást!' });
        }

        const newService = new Service({
            topic,
            description,
            location,
            price,
            date,
            patient_id,
            created_by: req.user._id,
            doctor_id: req.user.role === 'ADMIN' ? doctor_id : req.user._id
        });

        const savedService = await newService.save();
        res.status(201).json(savedService);
    } catch (error) {
        res.status(400).json({ message: 'Hiba a szolgáltatás létrehozásakor', error: error.message });
    }
});

export default router;