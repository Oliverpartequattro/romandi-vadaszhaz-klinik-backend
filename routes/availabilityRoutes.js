import express from "express";
import Availability from "../models/Availability.js";
import User from "../models/User.js";
import { protect, doctorOrAdmin } from "../middleware/authMiddleware.js";
import { ErrorResponse } from "../middleware/errorMiddleware.js";

const router = express.Router();

/**
 * Segédfüggvény: Dátum vagy angol napnév konvertálása magyar napnévre
 */
export const getHungarianDay = (input) => {
  const days = ["Vasárnap", "Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat"];
  
  // Megpróbáljuk dátummá alakítani az inputot
  const date = new Date(input);
  
  // Ha érvényes dátum, a getDay() alapján visszaadjuk a magyar napot
  if (!isNaN(date.getTime())) {
    return days[date.getDay()];
  }
  
  // Ha nem dátum, de esetleg angol napnév (pl. "Monday")
  const englishToHungarian = {
    "monday": "Hétfő", "tuesday": "Kedd", "wednesday": "Szerda", 
    "thursday": "Csütörtök", "friday": "Péntek", "saturday": "Szombat", "sunday": "Vasárnap"
  };
  
  const lowerInput = input.toLowerCase();
  return englishToHungarian[lowerInput] || input; // Ha nincs találat, visszaadjuk az eredetit
};
// @desc    1. Rendelési idő hozzáadása vagy frissítése (Upsert)
// @route   POST /api/availability
// @access  Private (Orvos vagy Admin)
router.post("/", protect, doctorOrAdmin, async (req, res, next) => {
  try {
    let { dayOfWeek, startTime, endTime, slotDuration } = req.body;
    const doctorId = req.user._id;

    // --- Átalakítás magyar napra ---
    dayOfWeek = getHungarianDay(dayOfWeek);

    // 1. Megnézzük, létezik-e már az adott napra időpont
    const existingAvailability = await Availability.findOne({
      doctor: doctorId,
      dayOfWeek,
    });

    if (existingAvailability) {
      // --- FRISSÍTÉS ---
      // A .set() és .save() metódusok elindítják a Mongoose validátorokat is
      existingAvailability.set({
        startTime,
        endTime,
        slotDuration,
      });
      
      await existingAvailability.save();

      res.status(200).json({
        success: true,
        message: "Rendelési idő frissítve.",
        data: existingAvailability,
      });

    } else {
      // --- LÉTREHOZÁS ---
      const availability = await Availability.create({
        doctor: doctorId,
        dayOfWeek,
        startTime,
        endTime,
        slotDuration,
      });

      // $addToSet: csak akkor adja hozzá, ha még nincs benne az ID (duplikáció megelőzése)
      await User.findByIdAndUpdate(doctorId, {
        $addToSet: { availabilities: availability._id },
      });

      res.status(201).json({
        success: true,
        message: "Rendelési idő létrehozva.",
        data: availability,
      });
    }
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

// @desc    2.1 Egy konkrét orvos rendelési idejének lekérése ID alapján
// @route   GET /api/availability/doctor/:doctorId
// @access  Public (vagy Private, igény szerint)
router.get("/doctor/:doctorId", async (req, res, next) => {
  try {
    const availabilities = await Availability.find({ doctor: req.params.doctorId });

    if (!availabilities || availabilities.length === 0) {
      // Opcionális: eldöntheted, hogy 404-et dobsz, vagy csak üres tömböt adsz vissza
      return res.json({
        success: true,
        count: 0,
        data: []
      });
    }

    res.json({
      success: true,
      count: availabilities.length,
      data: availabilities,
    });
  } catch (error) {
    // Kezeli, ha érvénytelen a formátuma a doctorId-nak (mongoose CastError)
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