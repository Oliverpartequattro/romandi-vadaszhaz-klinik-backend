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

// @desc    3. Egy adott orvoshoz tartozó szolgáltatások lekérése
// @route   GET /api/services/doctor/:doctorId
router.get('/:doctorId', async (req, res) => {
    try {
        const doctorId = req.params.doctorId;
        
        // Megkeressük az összes olyan szolgáltatást, ahol a doctor_id egyezik
        const services = await Service.find({ doctor_id: doctorId }).sort({ date: 1 });

        if (!services || services.length === 0) {
            return res.status(404).json({ message: 'Ehhez az orvoshoz nem tartoznak szolgáltatások.' });
        }

        res.json(services);
    } catch (error) {
        res.status(500).json({ 
            message: 'Hiba az orvos szolgáltatásainak lekérésekor', 
            error: error.message 
        });
    }
});

// @desc    4. Szolgáltatás módosítása (Admin bármit, Orvos csak a sajátját)
// @route   PUT /api/services/:id
router.put('/:id', protect, async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ message: 'A szolgáltatás nem található' });
        }

        // JOGOSULTSÁG ELLENŐRZÉS: Csak az Admin vagy a szolgáltatást létrehozó orvos módosíthat
        const isOwner = service.doctor_id.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'ADMIN';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Nincs jogosultságod más orvos szolgáltatását módosítani!' });
        }

        // Frissítjük a mezőket a kérés alapján
        const updatedService = await Service.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true } // Az új objektumot adja vissza és futtatja a sémában lévő validációt
        );

        res.json(updatedService);
    } catch (error) {
        res.status(400).json({ message: 'Hiba a módosítás során', error: error.message });
    }
});

// @desc    5. Szolgáltatás törlése (Admin bármit, Orvos csak a sajátját)
// @route   DELETE /api/services/:id
router.delete('/:id', protect, async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ message: 'A szolgáltatás nem található' });
        }

        // JOGOSULTSÁG ELLENŐRZÉS
        const isOwner = service.doctor_id.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'ADMIN';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Nincs jogosultságod más orvos szolgáltatását törölni!' });
        }

        await service.deleteOne();
        res.json({ message: 'Szolgáltatás sikeresen törölve' });
    } catch (error) {
        res.status(500).json({ message: 'Hiba a törlés során', error: error.message });
    }
});

export default router;