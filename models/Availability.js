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
    default: 30, // Alapértelmezett 30 perces vizsgálatok
    min: [10, "A vizsgálat legalább 10 perces kell legyen"]
  },
  isActive: {
    type: Boolean,
    default: true // Ha az orvos beteg, ezt false-ra állítva kikapcsolható a foglalás
  }
}, { timestamps: true });


const Availability = mongoose.model('Availability', availabilitySchema);
export default Availability;