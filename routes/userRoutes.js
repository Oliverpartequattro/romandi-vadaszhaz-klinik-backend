const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @desc    Összes felhasználó lekérése
// @route   GET /api/users
router.get('/', async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Szerver hiba a lekéréskor" });
    }
});

module.exports = router;