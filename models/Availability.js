import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, "Az orvos azonosítója kötelező"]
  },
  dayOfWeek: {
    type: String,
    required: [true, "A nap megadása kötelező"],
    enum: {
      values: ['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat', 'Vasárnap'],
      message: "Érvénytelen nap: {VALUE}"
    }
  },
  startTime: {
    type: String,
    required: [true, "A rendelés kezdete kötelező"],
    match: [/^([01]\d|2[0-3]):?([0-5]\d)$/, "Kérjük, HH:mm formátumot használjon (pl. 08:00)"]
  },
  endTime: {
    type: String,
    required: [true, "A rendelés vége kötelező"],
    match: [/^([01]\d|2[0-3]):?([0-5]\d)$/, "Kérjük, HH:mm formátumot használjon (pl. 16:00)"]
  },
  slotDuration: {
    type: Number,
    default: 30,
    min: [10, "A vizsgálat legalább 10 perces kell legyen"]
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Megakadályozzuk, hogy egy orvosnak egy napra két rendelési ideje legyen
availabilitySchema.index({ doctor: 1, dayOfWeek: 1 }, { unique: true });

// --- VALIDÁCIÓ: Start és End idő összehasonlítása ---
availabilitySchema.pre('validate', function(next) {
  if (this.startTime && this.endTime) {
    // String összehasonlítás: "08:00" < "16:00" igaz
    if (this.startTime >= this.endTime) {
      return next(new Error("A rendelés vége nem lehet korábbi vagy egyenlő a kezdettel (startTime >= endTime)"));
    }
  }
  next();
});

const Availability = mongoose.model('Availability', availabilitySchema);
export default Availability;