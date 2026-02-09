import express from 'express';
import User from '../models/User.js'; // A .js kiterjesztés itt kötelező!
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

const router = express.Router();
// JWT token generálása
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

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

// @desc    Új felhasználó regisztrálása
// @route   POST /api/users/register
router.post('/register', async (req, res) => {
    const { email, name } = req.body;
    console.log(`--- Regisztrációs kísérlet: ${email} (${name}) ---`);

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            console.warn(`Sikertelen regisztráció: Az email (${email}) már foglalt.`);
            return res.status(400).json({ message: 'Ez a felhasználó már létezik' });
        }

        const user = await User.create(req.body);

        if (user) {
            console.log(`Sikeres regisztráció! Új user ID: ${user._id}`);
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            });
        }
    } catch (error) {
        console.error(`Hiba a regisztráció során (${email}):`, error.message);
        res.status(500).json({ message: 'Szerver hiba', error: error.message });
    }
});

export default router;