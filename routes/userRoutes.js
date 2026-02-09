import express from "express";
import User from "../models/User.js"; // A .js kiterjesztés itt kötelező!
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
// JWT token generálása
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Összes felhasználó lekérése
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

// @desc    Az összes orvos lekérése
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

// @desc    Az összes páciens lekérése
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

// @desc    Bejelentkezett felhasználó profilja
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

// @desc    Felhasználó törlése ID alapján
// @route   DELETE /api/users/:id
router.delete("/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    console.log(`--- Törlési kísérlet: ID ${userId} ---`);

    const user = await User.findById(userId);

    if (user) {
      await User.findByIdAndDelete(userId);
      console.log(`Sikeres törlés: ${user.email} eltávolítva.`);
      res.json({ message: "Felhasználó sikeresen törölve" });
    } else {
      console.warn(
        `Törlés sikertelen: Nem található felhasználó ezzel az ID-val: ${userId}`,
      );
      res.status(404).json({ message: "Felhasználó nem található" });
    }
  } catch (error) {
    console.error(`Hiba a törlés során:`, error.message);
    res
      .status(500)
      .json({ message: "Szerver hiba a törlésnél", error: error.message });
  }
});

// @desc    Új felhasználó regisztrálása
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

// @desc    Bejelentkezés (Token generálás)
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

export default router;
