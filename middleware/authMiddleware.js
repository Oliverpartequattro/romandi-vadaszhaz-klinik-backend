import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    let token;

    // Megnézzük, hogy jön-e token az Authorization fejlécben
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // A token kinyerése: "Bearer <token>"
            token = req.headers.authorization.split(' ')[1];

            // Token dekódolása
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // A felhasználó kikeresése (jelszó nélkül) és hozzáadása a request objektumhoz
            req.user = await User.findById(decoded.id).select('-password');

            next();
        } catch (error) {
            console.error('Token hiba:', error);
            res.status(401).json({ message: 'Nincs jogosultság, rossz token' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Nincs jogosultság, nincs token' });
    }
};