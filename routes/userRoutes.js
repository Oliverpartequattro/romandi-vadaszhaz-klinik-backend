import express from 'express';
import User from '../models/User.js'; // A .js kiterjesztés itt kötelező!
import mongoose from 'mongoose';

const router = express.Router();

// @desc    Összes felhasználó lekérése
// @route   GET /api/users
router.get('/', async (req, res) => {
    try {
        const dbName = mongoose.connection.name; // Megnézzük melyik DB-ben vagyunk
        console.log(`Lekérdezés az adatbázisból: ${dbName}`);
        
        const users = await User.find({});
        console.log(`Talált userek száma: ${users.length}`);
        
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;