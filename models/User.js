import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: [true, "Név megadása kötelező"],
      trim: true
    },
    email: { 
      type: String, 
      required: [true, "Email megadása kötelező"], 
      unique: true,
      lowercase: true,
      // Regex: Standard email formátum ellenőrzése
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Kérjük, érvényes email címet adjon meg"]
    },
    password: { 
      type: String, 
      required: [true, "Jelszó megadása kötelező"],
      // Regex: Minimum 8 karakter, legalább egy betű és egy szám
      match: [/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, "A jelszónak legalább 8 karakterből kell állnia, és tartalmaznia kell betűt és számot is"]
    },
    phone: { 
      type: String, 
      required: [true, "Telefonszám megadása kötelező"],
      // Regex: Magyar formátum (+36... vagy 06...)
      match: [/^(?:\+36|06)(?:20|30|31|70)\d{7}$/, "Érvénytelen magyar telefonszám formátum"]
    },
    role: { 
      type: String, 
      enum: ["ADMIN", "DOCTOR", "PATIENT"], 
      default: "PATIENT" 
    },

    // --- CSAK PÁCIENS MEZŐK ---
    tajNumber: {
      type: String,
      required: function () {
        return this.role === "PATIENT";
      },
      // Regex: Pontosan 9 számjegy
      match: [/^\d{9}$/, "A TAJ számnak pontosan 9 számjegyből kell állnia"]
    },
    address: {
      type: String,
      required: function () {
        return this.role === "PATIENT";
      },
    },
    records: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Record'
      }
    ],

    // --- CSAK ORVOS MEZŐK ---
    specialization: {
      type: String,
      required: function () {
        return this.role === "DOCTOR";
      },
    },
  },
  {
    timestamps: true,
  }
);



userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;