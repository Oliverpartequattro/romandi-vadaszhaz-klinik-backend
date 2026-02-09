import express from "express";
import User from "../models/User.js"; // A .js kiterjesztés itt kötelező!
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();
// JWT token generálása
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    1.1 Összes felhasználó lekérése
// @route   GET /api/users
router.get("/", async (req, res) => {
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

// @desc    1.2 Az összes orvos lekérése
// @route   GET /api/users/doctors
router.get("/doctors", async (req, res) => {
  try {
    console.log("--- Orvosok listázása ---");
    // Csak azokat keressük, ahol a role 'DOCTOR'
    // A jelszót (-password) és az isActive mezőt most is kihagyjuk a válaszból
    const doctors = await User.find({ role: "DOCTOR" }).select("-password");
    res.json(doctors);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Hiba az orvosok lekérésekor", error: error.message });
  }
});

// @desc    1.3 Az összes páciens lekérése
// @route   GET /api/users/patients
router.get("/patients", async (req, res) => {
  try {
    console.log("--- Páciensek listázása ---");
    // Csak azokat keressük, ahol a role 'PATIENT'
    const patients = await User.find({ role: "PATIENT" }).select("-password");
    res.json(patients);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Hiba a páciensek lekérésekor", error: error.message });
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
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        tajNumber: user.tajNumber,
        address: user.address,
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
// A 'protect' middleware-t a route és a függvény közé tesszük
router.get("/profile", protect, async (req, res) => {
  // Mivel a middleware már kikereste a usert és betette a req.user-be:
  if (req.user) {
    res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      tajNumber: req.user.tajNumber,
      address: req.user.address,
      role: req.user.role,
    });
  } else {
    res.status(404).json({ message: "Felhasználó nem található" });
  }
});

// @desc    5. Felhasználói profil frissítése
// @route   PUT /api/users/profile
router.put('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            // Csak azokat a mezőket frissítjük, amik jönnek a kérésben, 
            // különben megtartjuk a régit
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.phone = req.body.phone || user.phone;
            user.address = req.body.address || user.address;
            user.tajNumber = req.body.tajNumber || user.tajNumber;

            // Ha új jelszó érkezik, beállítjuk (a User.js pre-save hookja hashelni fogja!)
            if (req.body.password) {
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
                tajNumber: updatedUser.tajNumber,
                role: updatedUser.role,
                token: generateToken(updatedUser._id), // Új tokent adunk vissza
            });
        } else {
            res.status(404).json({ message: 'Felhasználó nem található' });
        }
    } catch (error) {
        console.error('Hiba a profil frissítésekor:', error.message);
        res.status(500).json({ message: 'Szerver hiba a frissítés során', error: error.message });
    }
});


// @desc    6. Felhasználó törlése (Admin vagy Saját maga)
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
