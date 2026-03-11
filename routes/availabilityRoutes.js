import express from "express";
import Availability from "../models/Availability.js";
import User from "../models/User.js";
import { protect, doctorOrAdmin } from "../middleware/authMiddleware.js";
import { ErrorResponse } from "../middleware/errorMiddleware.js";
// Segédfüggvény a napok lefordításához
const translateDayToHungarian = (dateInput) => {
  // Ha a frontend csak egy stringet küld (pl. "Monday"), azt is kezeljük, 
  // de ha egy teljes dátumot (ISO string), akkor a getDay() a biztos.
  const days = [
    "Vasárnap", "Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat"
  ];
  
  const date = new Date(dateInput);
  
  // Ha érvénytelen a dátum (mert pl. eleve "Hétfő" string jött), 
  // akkor adjuk vissza az eredeti értéket
  if (isNaN(date.getTime())) return dateInput; 

  return days[date.getDay()];
};
const router = express.Router();

// @desc    1. Új rendelési idő hozzáadása
// @route   POST /api/availability
// @access  Private (Orvos vagy Admin)
router.post("/", protect, doctorOrAdmin, async (req, res, next) => {
  try {
    let { dayOfWeek, startTime, endTime, slotDuration } = req.body;
    const doctorId = req.user._id;

    // --- JAVÍTÁS: Fordítás magyarra ---
    dayOfWeek = translateDayToHungarian(dayOfWeek);

    // Ellenőrizzük, van-e már beállítva rendelési idő erre a napra
    const existingAvailability = await Availability.findOne({
      doctor: doctorId,
      dayOfWeek,
    });

    if (existingAvailability) {
      return next(new ErrorResponse(`${dayOfWeek} napra már van beállított rendelési időd!`, 400));
    }

    // Létrehozás (már a magyar névvel)
    const availability = await Availability.create({
      doctor: doctorId,
      dayOfWeek,
      startTime,
      endTime,
      slotDuration,
    });

    // ... (User frissítése változatlan)
    await User.findByIdAndUpdate(doctorId, {
      $push: { availabilities: availability._id },
    });

    res.status(201).json({ success: true, data: availability });
  } catch (error) {
    next(error);
  }
});

// @desc    2. Bejelentkezett orvos összes rendelési idejének lekérése
// @route   GET /api/availability/my
router.get("/my", protect, doctorOrAdmin, async (req, res, next) => {
  try {
    const availabilities = await Availability.find({ doctor: req.user._id });
    res.json({
      success: true,
      count: availabilities.length,
      data: availabilities,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    3. Rendelési idő törlése
// @route   DELETE /api/availability/:id
router.delete("/:id", protect, doctorOrAdmin, async (req, res, next) => {
  try {
    const availability = await Availability.findById(req.params.id);

    if (!availability) {
      return next(new ErrorResponse("Ez a rendelési idő nem található", 404));
    }

    // Csak a sajátját törölheti az orvos (kivéve ha admin)
    if (availability.doctor.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return next(new ErrorResponse("Nincs jogosultságod más orvos naptárát törölni", 403));
    }

    // 1. Töröljük a hivatkozást az orvos User modelljéből
    await User.findByIdAndUpdate(availability.doctor, {
      $pull: { availabilities: availability._id },
    });

    // 2. Töröljük magát a dokumentumot
    await availability.deleteOne();

    res.json({
      success: true,
      message: "Rendelési idő sikeresen törölve",
    });
  } catch (error) {
    next(error);
  }
});

export default router;