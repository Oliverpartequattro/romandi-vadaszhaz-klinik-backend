// routes/appointmentRoutes.js
import express from 'express';
import Appointment from '../models/Appointment.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc   1.1 Összes időpont lekérése (Csak Admin)
// @route   GET /api/appointments
router.get('/', protect, admin, async (req, res) => {
    try {
        const appointments = await Appointment.find({})
            .populate('doctor_id', 'name specialization')
            .populate('patient_id', 'name email phone')
            .populate('service_id', 'name')
            .populate('referred_by', 'name specialization') // Beutaló orvos adatai
            .sort({ startTime: 1 }); // Időrendbe szedve

        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Hiba az időpontok lekérésekor', error: error.message });
    }
});

export default router;