import express from "express";
import User from "../models/User.js";
import Appointment from "../models/Appointment.js";
import Availability from "../models/Availability.js";
import Record from "../models/Record.js";
import Service from "../models/Service.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { protect, admin, doctorOrAdmin } from '../middleware/authMiddleware.js';
import { sendWelcomeEmail, sendDeleteEmail, sendModifyEmail, sendResetCodeEmail } from '../mail/mail.js';
import { ErrorResponse } from '../middleware/errorMiddleware.js';

const router = express.Router();

// JWT token generálása
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    1.1 Összes felhasználó lekérése ADMIN ONLY
router.get("/", protect, admin, async (req, res, next) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// @desc    1.2 Az összes orvos lekérése (Most már rendelési idővel!)
router.get("/doctors", async (req, res, next) => {
  try {
    const doctors = await User.find({ role: "DOCTOR" })
      .select("name specialization email phone _id availabilities")
      .populate("availabilities"); // Így a frontend megkapja a napokat és órákat is
    
    res.json(doctors);
  } catch (error) {
    next(error);
  }
});

// @desc    1.3 Az összes páciens lekérése
router.get("/patients", protect, doctorOrAdmin, async (req, res, next) => {
  try {
    const patients = await User.find({ role: "PATIENT" }).select("-password");
    res.json(patients);
  } catch (error) {
    next(error);
  }
});

// @desc    2. Új felhasználó regisztrálása
router.post("/register", async (req, res, next) => {
  try {
    const { email } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
      // Itt manuálisan dobunk hibát, az objektum szerkezete illeszkedik a kérésedhez
      return next(new ErrorResponse("Validációs hiba", 400, { email: "Ez az email cím már foglalt." }));
    }

    const user = await User.create(req.body);

    if (user) {
      sendWelcomeEmail(user.email, user.name);
      res.status(201).json({
        success: true,
       _id: user._id,

        name: user.name,

        email: user.email,

        phone: user.phone,

        tajNumber: user.tajNumber,

        address: user.address,

        birthDate: user.birthDate,

        gender: user.gender,

        role: user.role,

        token: generateToken(user._id),
      });
    }
  } catch (error) {
    // A Mongoose ValidationError ide fut be, a middleware pedig szétszedi mezőkre
    next(error);
  }
});

// @desc    3. Bejelentkezés
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
       _id: user._id,

        name: user.name,

        email: user.email,

        phone: user.phone,

        tajNumber: user.tajNumber,

        address: user.address,

        birthDate: user.birthDate,

        gender: user.gender,

        role: user.role,
        
        specialization: user.specialization,

        token: generateToken(user._id),
      });
    } else {
      return next(new ErrorResponse("Érvénytelen email vagy jelszó", 401));
    }
  } catch (error) {
    next(error);
  }
});

// @desc    4. Bejelentkezett felhasználó profilja
router.get("/profile", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'records',
        populate: [
          { path: 'doctor', select: 'name specialization email' },
          { path: 'service', select: 'name description' }
        ]
      })
      .populate('availabilities'); // Ha orvos az illető, lássa a saját táblázatát

    if (!user) {
      return next(new ErrorResponse("Felhasználó nem található", 404));
    }

    res.json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      tajNumber: user.tajNumber,
      address: user.address,
      birthDate: user.birthDate,
      gender: user.gender,
      role: user.role,
      specialization: user.specialization, // Orvosnál fontos
      records: user.records,
      availabilities: user.availabilities, // Itt lesznek a rendelési idők
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
});

// @desc    5. Felhasználói profil frissítése
router.put('/profile', protect, async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return next(new ErrorResponse("Felhasználó nem található", 404));
        }

        // Mezők frissítése - kiegészítve a specialization-nel
        const fields = ['name', 'email', 'phone', 'address', 'tajNumber', 'birthDate', 'gender', 'specialization'];
        fields.forEach(field => {
            if (req.body[field] !== undefined) user[field] = req.body[field];
        });

        if (req.body.password && req.body.password.trim() !== "") {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();
        await sendModifyEmail(updatedUser.email, updatedUser.name);

        res.json({
            success: true,
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            tajNumber: updatedUser.tajNumber,
            address: updatedUser.address,
            birthDate: updatedUser.birthDate,
            gender: updatedUser.gender,
            role: updatedUser.role,
            specialization: updatedUser.specialization,
            token: generateToken(updatedUser._id),
        });
    } catch (error) {
        next(error);
    }
});

// @desc    6. Kijelentkezés
router.post("/logout", protect, (req, res) => {
    res.status(200).json({ success: true, message: "Sikeres kijelentkezés." });
});

// @desc    7. Felhasználó törlése
router.delete("/:id", protect, async (req, res, next) => {
  try {
    const userIdToDelete = req.params.id;
    const loggedInUserId = req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (isAdmin || loggedInUserId === userIdToDelete) {
      const user = await User.findById(userIdToDelete);

      if (!user) {
        return next(new ErrorResponse("Felhasználó nem található", 404));
      }

      if (isAdmin && user.role === 'ADMIN' && loggedInUserId !== userIdToDelete) {
        return next(new ErrorResponse("Admin nem törölhet másik admint!", 403));
      }

      await User.findByIdAndDelete(userIdToDelete);
      sendDeleteEmail(user.email, user.name);
      res.json({ success: true, message: "Felhasználó sikeresen törölve" });
    } else {
      return next(new ErrorResponse("Nincs jogosultságod a művelethez!", 403));
    }
  } catch (error) {
    next(error);
  }
});

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "Nincs ilyen felhasználó!" });

    // 6 jegyű véletlen kód generálása
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 percig érvényes
    await user.save();

    // Email küldése (használd a már meglévő mail.js-edet)
    sendResetCodeEmail(user.email, resetCode);
    res.json({ message: "Jelszó visszaállító kód elküldve!" });
});

router.post('/reset-password', async (req, res) => {
    const { email, code, newPassword } = req.body;

    const user = await User.findOne({
        email,
        resetPasswordCode: code,
        resetPasswordExpires: { $gt: Date.now() } // Ellenőrizzük, hogy nem járt-e le
    });

    if (!user) {
        return res.status(400).json({ message: "Érvénytelen vagy lejárt kód!" });
    }

    // Új jelszó beállítása (a pre-save hook titkosítani fogja!)
    user.password = newPassword;
    user.resetPasswordCode = undefined; // Töröljük a használt kódot
    user.resetPasswordExpires = undefined;
    
    await user.save();

    res.json({ message: "Jelszó sikeresen megváltoztatva!" });
});

// @desc    Személyre szabott statisztikák (Admin, Orvos, Páciens)
// @route   GET /api/users/stats/me
// @access  Private
router.get('/stats/me', protect, async (req, res, next) => {
    try {
        const userId = req.user._id;
        const role = req.user.role;
        let personalStats = {};

        if (role === 'ADMIN') {
            // A korábbi globális admin statisztika jön ide
            const [totalUsers, appointmentsToday] = await Promise.all([
                User.countDocuments(),
                Appointment.countDocuments({ startTime: { $gte: new Date().setHours(0,0,0,0) } })
            ]);
            personalStats = { totalUsers, appointmentsToday, type: 'System Overview' };

        } else if (role === 'DOCTOR') {
            // Orvosi statisztika: Saját páciensek és lezárt vizitek
            const [myPatients, completedAppointments] = await Promise.all([
                Appointment.distinct('patient_id', { doctor_id: userId }),
                Appointment.countDocuments({ doctor_id: userId, status: 'COMPLETED' })
            ]);
            personalStats = { 
                uniquePatients: myPatients.length, 
                totalTreatments: completedAppointments,
                type: 'Medical Performance' 
            };

        } else if (role === 'PATIENT') {
            // Páciens statisztika: Saját leletek és elköltött összeg (becsült)
            const [myRecords, myAppointments] = await Promise.all([
                User.findById(userId).select('records'),
                Appointment.find({ patient_id: userId, status: 'COMPLETED' }).populate('service_id')
            ]);
            
            const moneySpent = myAppointments.reduce((sum, app) => {
                const price = parseInt(app.service_id?.price?.replace(/[^0-9]/g, '')) || 0;
                return sum + price;
            }, 0);

            personalStats = { 
                totalRecords: myRecords.records.length, 
                estimatedHealthInvestment: moneySpent,
                currency: "Ft",
                type: 'Personal Health Summary' 
            };
        }

        res.status(200).json({ success: true, stats: personalStats });
    } catch (error) {
        next(new ErrorResponse("Statisztika hiba", 500));
    }
});

export default router;