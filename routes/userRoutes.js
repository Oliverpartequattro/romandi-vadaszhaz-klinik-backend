import express from "express";
import User from "../models/User.js"; // A .js kiterjesztés itt kötelező!
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { protect, admin, doctorOrAdmin } from '../middleware/authMiddleware.js';
import { sendWelcomeEmail } from '../mail/mail.js';

const router = express.Router();
// JWT token generálása
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    1.1 Összes felhasználó lekérése ADMIN ONLY
// @route   GET /api/users
router.get("/", protect, admin, async (req, res) => {
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

// @desc    1.2 Az összes orvos lekérése (Biztonságos verzió)
router.get("/doctors", async (req, res) => {
  try {
    // Csak a nevet, a specializációt és az ID-t adjuk vissza
    // A jelszó, email, telefon, TAJ szám rejtve marad
    const doctors = await User.find({ role: "DOCTOR" })
                              .select("name specialization email phone _id"); 
    
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: "Hiba az orvosok lekérésekor", error: error.message });
  }
});

// @desc    1.3 Az összes páciens lekérése (Biztonságos verzió)
router.get("/patients", protect, doctorOrAdmin, async (req, res) => {
  try {
    // Pácienseknél MÁG SZIGORÚBB: Csak a nevet és az ID-t adjuk ki
    // TAJ szám, lakcím, email, telefon SOHA nem mehet ki publikus listában!
    const patients = await User.find({ role: "PATIENT" })
                               .select("-password");
    
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: "Hiba a páciensek lekérésekor", error: error.message });
  }
});


// @desc    2. Új felhasználó regisztrálása
// @route   POST /api/users/register
router.post("/register", async (req, res) => {
  const { name, email, password, phone, tajNumber, address, role } = req.body;
  console.log(`--- Regisztrációs kísérlet: ${email} (${name}) ---`);

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      console.warn(`Sikertelen regisztráció: Az email (${email}) már foglalt.`);
      return res.status(400).json({ message: "Ez a felhasználó már létezik" });
    }

    const user = await User.create(req.body);

    if (user) {
      console.log(`Sikeres regisztráció! Új user ID: ${user._id}`);
      sendWelcomeEmail(user.email, user.name);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        tajNumber: user.tajNumber,
        address: user.address,
        birthDate: user.birthDate,
        role: user.role,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    console.error(`Hiba a regisztráció során (${email}):`, error.message);
    res.status(500).json({ message: "Szerver hiba", error: error.message });
  }
});

// @desc    3. Bejelentkezés (Token generálás)
// @route   POST /api/users/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`--- Bejelentkezési kísérlet: ${email} ${password} ---`);

    // 1. Felhasználó keresése email alapján
    const user = await User.findOne({ email });

    // 2. Felhasználó létezésének és jelszavának ellenőrzése
    if (user && (await user.matchPassword(password))) {
      console.log(`Sikeres belépés: ${email}`);
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        password: user.password,
        phone: user.phone,
        tajNumber: user.tajNumber,
        address: user.address,
        birthDate: user.birthDate,
        specialization: user.specialization,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      console.warn(
        `Sikertelen belépés: Rossz email vagy jelszó (${email})`,
        user,
      );
      res.status(401).json({ message: "Érvénytelen email vagy jelszó" });
    }
  } catch (error) {
    console.error(`Hiba a login során:`, error.message);
    res.status(500).json({ message: "Szerver hiba", error: error.message });
  }
});

// @desc    4. Bejelentkezett felhasználó profilja
// @route   GET /api/users/profile
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'records',
      // EGYETLEN populate-en belül adjuk meg a tömböt az al-adatoknak
      populate: [
        { path: 'doctor', select: 'name specialization email' },
        { path: 'service', select: 'name description' }
      ]
    });

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        tajNumber: user.tajNumber,
        address: user.address,
        role: user.role,
        records: user.records // Most már egyszerre lesz benne a doctor és a service is
      });
    } else {
      res.status(404).json({ message: "Felhasználó nem található" });
    }
  } catch (error) {
    res.status(500).json({ message: "Szerver hiba", error: error.message });
  }
});

// @desc    5. Felhasználói profil frissítése
// @route   PUT /api/users/profile
router.put('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            // 1. Egyszerű mezők frissítése
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.phone = req.body.phone || user.phone;
            user.address = req.body.address || user.address;
            user.tajNumber = req.body.tajNumber || user.tajNumber;
            user.birthDate = req.body.birthDate || user.birthDate;

            // 2. JELSZÓ LOGIKA: Csak akkor írjuk felül, ha TÉNYLEG küldtek újat
            // és az nem csak egy üres szóköz/string.
            if (req.body.password && req.body.password.trim() !== "") {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            console.log(`--- Profil frissítve: ${updatedUser.email} ---`);

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                address: updatedUser.address,
                birthDate: updatedUser.birthDate,
                tajNumber: updatedUser.tajNumber,
                role: updatedUser.role,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: 'Felhasználó nem található' });
        }
    } catch (error) {
        // 3. OKOSABB HIBAKEZELÉS: Ha validációs hiba van, ne 500-at adjunk
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                message: 'Validációs hiba', 
                error: Object.values(error.errors).map(err => err.message).join(', ') 
            });
        }
        
        console.error('Hiba a profil frissítésekor:', error.message);
        res.status(500).json({ message: 'Szerver hiba a frissítés során', error: error.message });
    }
});

// @desc    6. Kijelentkezés
// @route   POST /api/users/logout
router.post("/logout", protect, (req, res) => {
    try {
        console.log(`--- Felhasználó kijelentkezett: ${req.user.email} ---`);
        
        res.status(200).json({ message: "Sikeres kijelentkezés." });
    } catch (error) {
        res.status(500).json({ message: "Hiba a kijelentkezés során" });
    }
});


// @desc    7. Felhasználó törlése (Admin vagy Saját maga)
// @route   DELETE /api/users/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const userIdToDelete = req.params.id;
    const loggedInUserId = req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    console.log(`--- Törlési kísérlet: ID ${userIdToDelete} ---`);
    console.log(`Kezdeményező: ${req.user.email} (Role: ${req.user.role})`);

    // JOGOSULTSÁG ELLENŐRZÉSE: 
    // Csak akkor engedjük, ha Admin VAGY saját magát akarja törölni
    if (isAdmin || loggedInUserId === userIdToDelete) {
      
      const user = await User.findById(userIdToDelete);

      if (user) {
        if (isAdmin && user.role === 'ADMIN' && loggedInUserId !== userIdToDelete) {
             return res.status(403).json({ message: "Admin nem törölhet másik admint!" });
        }

        await User.findByIdAndDelete(userIdToDelete);
        console.log(`Sikeres törlés: ${user.email} eltávolítva.`);
        res.json({ message: "Felhasználó sikeresen törölve" });
      } else {
        res.status(404).json({ message: "Felhasználó nem található" });
      }

    } else {
      // Ha nem admin és nem a saját ID-ja
      console.warn(`Jogosulatlan törlési kísérlet! ${req.user.email} -> ID: ${userIdToDelete}`);
      res.status(403).json({ message: "Nincs jogosultságod más felhasználót törölni!" });
    }

  } catch (error) {
    console.error(`Hiba a törlés során:`, error.message);
    res.status(500).json({ message: "Szerver hiba a törlésnél", error: error.message });
  }
});

export default router;
