// routes/appointmentRoutes.js
import express from 'express';
import Appointment from '../models/Appointment.js';
import Availability from '../models/Availability.js'; // Be kell importálni!
import { protect, admin } from '../middleware/authMiddleware.js';
import { sendBookEmail } from '../mail/mail.js';

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

// @desc    2. Új időpont igénylése
router.post('/', protect, async (req, res) => {
    try {
        const { doctor_id, service_id, startTime, endTime, referral_type, referred_by } = req.body;

        // 1. Dátum objektummá alakítás és a nap kinyerése
        const requestedDate = new Date(startTime);
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = days[requestedDate.getDay()];

        // Kinyerjük az időt HH:mm formátumban az összehasonlításhoz
        const requestedTimeStr = requestedDate.toTimeString().substring(0, 5); 

        // 2. Orvos elérhetőségének ellenőrzése
        const availability = await Availability.findOne({
            doctor: doctor_id,
            dayOfWeek: dayName,
            isActive: true
        });

        if (!availability) {
            return res.status(400).json({ 
                message: `Az orvos nem rendel ezen a napon (${dayName})` 
            });
        }

        // 3. Időintervallum ellenőrzése (startTime >= availability.startTime ÉS < availability.endTime)
        if (requestedTimeStr < availability.startTime || requestedTimeStr >= availability.endTime) {
            return res.status(400).json({ 
                message: `A választott időpont (${requestedTimeStr}) kívül esik az orvos rendelési idején (${availability.startTime} - ${availability.endTime})` 
            });
        }

        // 4. Foglaltság ellenőrzése (Ütközés vizsgátlat)
        const existingAppointment = await Appointment.findOne({
            doctor_id,
            startTime: requestedDate,
            status: { $ne: 'CANCELLED' } // A lemondott időpontok nem számítanak ütközésnek
        });

        if (existingAppointment) {
            return res.status(400).json({ message: 'Ez az időpont már foglalt' });
        }

        // --- HA MINDEN OKÉ, JÖHET A MENTÉS ---

        const final_referral_type = req.user.role === 'DOCTOR' ? 'DOCTOR' : (referral_type || 'SELF');
        const final_referred_by = req.user.role === 'DOCTOR' ? req.user._id : referred_by;

        const newAppointment = new Appointment({
            doctor_id,
            patient_id: req.user.role === 'PATIENT' ? req.user._id : req.body.patient_id,
            service_id,
            startTime,
            endTime: endTime || null, // Itt érdemes lenne kiszámolni a slotDuration alapján!
            status: 'PENDING',
            referral_type: final_referral_type,
            referred_by: final_referred_by,
            created_by: req.user._id
        });

        const savedAppointment = await newAppointment.save();

        // --- POPULÁLÁS ÉS EMAIL (Változatlan...) ---
        const populatedAppointment = await Appointment.findById(savedAppointment._id)
            .populate('doctor_id', 'name specialization')
            .populate('service_id', 'topic location price');

        const formattedDate = new Date(populatedAppointment.startTime).toLocaleString('hu-HU', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        sendBookEmail(
            req.user.email, 
            req.user.name,
            formattedDate,
            populatedAppointment.service_id?.topic || "Általános vizsgálat",
            populatedAppointment.doctor_id?.name || "Klinikai orvos"
        ).catch(err => console.error("Email hiba:", err.message));

        res.status(201).json(populatedAppointment);

    } catch (error) {
        console.error("Foglalási hiba:", error);
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

        // --- JOGOSULTSÁG ELLENŐRZÉS ---
        const isOwnerDoctor = appointment.doctor_id.toString() === req.user._id.toString();
        const isOwnerPatient = appointment.patient_id.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'ADMIN';

        // Ha egyik sem igaz, akkor dobunk 403-at
        if (!isOwnerDoctor && !isOwnerPatient && !isAdmin) {
            return res.status(403).json({ message: 'Nincs jogosultsága ehhez az időponthoz' });
        }

        // --- MEZŐK FRISSÍTÉSE ---
        const { startTime, endTime, status, service_id } = req.body;

        if (startTime) appointment.startTime = startTime;
        if (endTime) appointment.endTime = endTime;
        if (service_id) appointment.service_id = service_id;

        // --- OKOS STÁTUSZ LOGIKA ---
        if (status) {
            // Megszorítás: A páciens csak CONFIRMED-re (elfogadás) vagy CANCELLED-re (lemondás) válthat
            if (isOwnerPatient && !['CONFIRMED', 'CANCELLED'].includes(status) && !isAdmin) {
                return res.status(403).json({ message: 'Páciensként csak elfogadni vagy lemondani tudod az időpontot' });
            }
            appointment.status = status;
        } else if ((startTime || endTime) && (isOwnerDoctor || isAdmin)) {
            // Ha az orvos módosít időt, az státuszváltással jár
            appointment.status = 'PROPOSED';
        }

        const updatedAppointment = await appointment.save();

        // Frissített adatok visszaküldése (topic-ot használunk name helyett, ahogy a sémádban van!)
        const result = await Appointment.findById(updatedAppointment._id)
            .populate('doctor_id', 'name specialization')
            .populate('patient_id', 'name email')
            .populate('service_id', 'topic location price'); // Itt javítottam 'topic'-ra

        res.json(result);
    } catch (error) {
        res.status(400).json({ message: 'Hiba a módosítás során', error: error.message });
    }
});

// @desc    4. Bejelentkezett felhasználó saját időpontjainak lekérése
// @route   GET /api/appointments/my
router.get('/my', protect, async (req, res) => {
    try {
        let filter = {};

        // Ha páciens, akkor a saját foglalásait látja
        if (req.user.role === 'PATIENT') {
            filter = { patient_id: req.user._id };
        } 
        // Ha orvos, akkor a hozzá érkező foglalásokat látja
        else if (req.user.role === 'DOCTOR') {
            filter = { doctor_id: req.user._id };
        } 
        // Admin esetén hagyhatjuk üresen is (mindent lát), vagy korlátozhatjuk

        const myAppointments = await Appointment.find(filter)
            .populate('doctor_id', 'name specialization phone')
            .populate('patient_id', 'name email phone')
            .populate('service_id', 'topic location price')
            .sort({ startTime: 1 }); // Időrendben: legközelebbi legelöl

        res.json(myAppointments);
    } catch (error) {
        res.status(500).json({ message: 'Hiba a saját időpontok lekérésekor', error: error.message });
    }
});

export default router;