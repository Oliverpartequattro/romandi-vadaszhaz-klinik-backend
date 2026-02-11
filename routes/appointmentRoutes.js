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

// @desc    2. Új időpont igénylése (Páciens vagy Orvos által)
// @route   POST /api/appointments
router.post('/', protect, async (req, res) => {
    try {
        const { doctor_id, service_id, startTime, endTime, referral_type, referred_by } = req.body;

        // Logika: Ha orvos hozza létre, akkor ő a beutaló, ha páciens, akkor SELF
        const final_referral_type = req.user.role === 'DOCTOR' ? 'DOCTOR' : (referral_type || 'SELF');
        const final_referred_by = req.user.role === 'DOCTOR' ? req.user._id : referred_by;

        const newAppointment = new Appointment({
            doctor_id,
            patient_id: req.user.role === 'PATIENT' ? req.user._id : req.body.patient_id,
            service_id,
            startTime,
            endTime,
            status: 'PENDING', // Alapértelmezetten jóváhagyásra vár
            referral_type: final_referral_type,
            referred_by: final_referred_by,
            created_by: req.user._id
        });

        const savedAppointment = await newAppointment.save();
        
        // Visszaküldés előtt populáljuk, hogy a frontend látványos választ kapjon
        const populatedAppointment = await Appointment.findById(savedAppointment._id)
            .populate('doctor_id', 'name specialization')
            .populate('service_id', 'name');

        res.status(201).json(populatedAppointment);
    } catch (error) {
        res.status(400).json({ message: 'Hiba a foglalás létrehozásakor', error: error.message });
    }
});

// @desc    3. Időpont módosítása/válasz (Csak Admin vagy a kijelölt Orvos)
// @route   PUT /api/appointments/:id
router.put('/:id', protect, async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ message: 'Az időpont nem található' });
        }

        // JOGOSULTSÁG ELLENŐRZÉS: 
        // Csak az admin VAGY az az orvos módosíthatja, akihez az időpont szól
        const isOwnerDoctor = appointment.doctor_id.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'ADMIN';

        if (!isOwnerDoctor && !isAdmin) {
            return res.status(403).json({ message: 'Nincs jogosultsága más orvos időpontját módosítani' });
        }

        // Mezők frissítése
        const { startTime, endTime, status, service_id } = req.body;

        if (startTime) appointment.startTime = startTime;
        if (endTime) appointment.endTime = endTime;
        if (service_id) appointment.service_id = service_id;

        // Logika: Ha az orvos változtat az időponton, a státusz PROPOSED lesz, 
        // kivéve ha csak simán elfogadja (CONFIRMED)
        if (status) {
            appointment.status = status;
        } else if (startTime || endTime) {
            appointment.status = 'PROPOSED';
        }

        const updatedAppointment = await appointment.save();

        // Frissített adatok visszaküldése populálva
        const result = await Appointment.findById(updatedAppointment._id)
            .populate('doctor_id', 'name specialization')
            .populate('patient_id', 'name email')
            .populate('service_id', 'name');

        res.json(result);
    } catch (error) {
        res.status(400).json({ message: 'Hiba a módosítás során', error: error.message });
    }
});

export default router;