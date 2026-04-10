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

// @desc    4. Bejelentkezett felhasználó profilja (Dashboard aggregációval)
router.get("/profile", protect, async (req, res, next) => {
  try {
    // 1. User és Leletek lekérése (Rendezve a legfrissebbtől)
    const user = await User.findById(req.user._id)
      .populate({
        path: 'records',
        options: { sort: { createdAt: -1 } }, // Szemethy kérte: legfrissebb elöl
        populate: [
          { path: 'doctor', select: 'name specialization email' },
          { path: 'service', select: 'name description topic' }
        ]
      })
      .populate('availabilities');

    if (!user) {
      return next(new ErrorResponse("Felhasználó nem található", 404));
    }

    // 2. Időpontok lekérése (Mivel a user modellben nincs direkt link az összesre)
    const allAppointments = await Appointment.find({ patient_id: req.user._id })
      .populate('doctor_id', 'name specialization')
      .populate('service_id', 'topic location')
      .sort({ startTime: 1 }); // Időrendben növekvő

    // 3. Logika: Következő vizit meghatározása
    const now = new Date();
    const nextAppointment = allAppointments.find(app => 
      app.status === 'ACCEPTED' && new Date(app.startTime) > now
    ) || null;

    // 4. Statisztikák kiszámítása (Ahogy az issue-ban kérték)
    const stats = {
      totalVisits: user.records ? user.records.length : 0,
      activeAppointments: allAppointments.filter(app => 
        new Date(app.startTime) > now && ['PENDING', 'ACCEPTED', 'PROPOSED'].includes(app.status)
      ).length,
      lastVisitDate: user.records && user.records.length > 0 
        ? user.records[0].createdAt 
        : null
    };

    // 5. Válasz küldése a kért struktúrában
    res.json({
      success: true,
      user: {
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
      },
      nextAppointment, 
      appointments: allAppointments,
      records: user.records || [],
      availabilities: user.availabilities, 
      stats,
      token: generateToken(user._id), // Marad a token frissítés, ha szükséges
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
    await sendResetCodeEmail(user.email, resetCode);
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

// @desc    Személyre szabott statisztikák (Orvos, Páciens)
// @route   GET /api/users/stats/me
// @access  Private
router.get('/stats/me', protect, async (req, res, next) => {
    try {
        const userId = req.user._id;
        const role = req.user.role;
        const now = new Date();
        let personalStats = {};

        if (role === 'PATIENT') {
            // 1. Összes foglalás lekérése adatokkal
            const allApps = await Appointment.find({ patient_id: userId })
                .populate('doctor_id', 'name specialization')
                .populate('service_id', 'topic location price')
                .sort({ startTime: 1 });

            // 2. Szűrések a kért kategóriák szerint
            const completedApps = allApps.filter(app => app.status === 'COMPLETED');
            const activeApps = allApps.filter(app => 
                new Date(app.startTime) > now && ['PENDING', 'ACCEPTED', 'PROPOSED'].includes(app.status)
            );
            
            // 3. Következő időpont meghatározása
            const nextApp = allApps.find(app => 
                new Date(app.startTime) > now && app.status === 'ACCEPTED'
            );

            // 4. Páciens specifikus stat objektum
            personalStats = {
                type: 'Patient Dashboard Summary',
                totalCompleted: completedApps.length,
                totalActive: activeApps.length,
                nextAppointment: nextApp ? {
                    date: nextApp.startTime,
                    doctor: nextApp.doctor_id?.name,
                    specialization: nextApp.doctor_id?.specialization,
                    location: nextApp.service_id?.location,
                    topic: nextApp.service_id?.topic
                } : null,
                // Becsült költés (ha van árazás a szolgáltatásnál)
                healthInvestment: completedApps.reduce((sum, app) => {
                    const price = parseInt(app.service_id?.price?.replace(/[^0-9]/g, '')) || 0;
                    return sum + price;
                }, 0)
            };

        } else if (role === 'DOCTOR') {
            // 1. Orvos összes foglalása
            const allApps = await Appointment.find({ doctor_id: userId })
                .populate('patient_id', 'name phone email')
                .populate('service_id', 'topic location')
                .sort({ startTime: 1 });

            // 2. Szűrések
            const completedApps = allApps.filter(app => app.status === 'COMPLETED');
            const activeApps = allApps.filter(app => 
                new Date(app.startTime) > now && ['PENDING', 'ACCEPTED', 'PROPOSED'].includes(app.status)
            );
            const uniquePatients = await Appointment.distinct('patient_id', { doctor_id: userId });

            // 3. Következő páciens
            const nextApp = allApps.find(app => 
                new Date(app.startTime) > now && app.status === 'ACCEPTED'
            );

            // 4. Legutóbbi vizit
            const lastApp = [...allApps]
                .reverse()
                .find(app => app.status === 'COMPLETED' || new Date(app.startTime) < now);

            // 5. Orvos specifikus stat objektum
            personalStats = {
                type: 'Doctor Dashboard Summary',
                totalPatients: uniquePatients.length,
                totalCompleted: completedApps.length,
                totalActive: activeApps.length,
                nextPatient: nextApp ? {
                    date: nextApp.startTime,
                    patientName: nextApp.patient_id?.name,
                    topic: nextApp.service_id?.topic,
                    location: nextApp.service_id?.location
                } : null,
                lastVisit: lastApp ? {
                    date: lastApp.startTime,
                    patientName: lastApp.patient_id?.name,
                    topic: lastApp.service_id?.topic
                } : null
            };
        } else if (role === 'ADMIN') {
             // Admin marad a régi vagy bővíthető, ha szükséges
             const [totalUsers, appointmentsToday] = await Promise.all([
                User.countDocuments(),
                Appointment.countDocuments({ startTime: { $gte: new Date().setHours(0,0,0,0) } })
            ]);
            personalStats = { totalUsers, appointmentsToday, type: 'System Overview' };
        }

        res.status(200).json({ 
            success: true, 
            role: role,
            stats: personalStats 
        });

    } catch (error) {
        next(new ErrorResponse("Hiba a statisztikák előállítása során", 500));
    }
});

export default router;