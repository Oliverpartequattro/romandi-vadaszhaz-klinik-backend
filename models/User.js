import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
  name: {
      type: String,
      required: [true, "Név megadása kötelező"],
      trim: true,
      minlength: [1, "A névnek legalább 3 karakterből kell állnia"], // Extra biztonság
      maxlength: [1, "A név nem lehet hosszabb 50 karakternél"], // EZT KÉRTED
    },
    email: {
      type: String,
      required: [true, "Email megadása kötelező"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Kérjük, érvényes email címet adjon meg",
      ],
    },
    password: {
      type: String,
      required: [true, "Jelszó megadása kötelező"],
      validate: {
        validator: function (v) {
          if (!this.isModified("password")) return true;
          return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(v);
        },
        message: "A jelszónak legalább 8 karakterből kell állnia, és tartalmaznia kell betűt és számot is",
      },
    },
    phone: {
      type: String,
      required: [true, "Telefonszám megadása kötelező"],
      match: [
        /^(?:\+36|06)(?:20|30|31|70)\d{7}$/,
        "Érvénytelen magyar telefonszám formátum",
      ],
    },
    birthDate: { 
      type: Date, 
      required: [true, "Születési dátum megadása kötelező"],
      validate: {
        validator: function(value) {
          const today = new Date();
          const birthDate = new Date(value);
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          return age >= 0 && age <= 110;
        },
        message: "Érvénytelen születési dátum! A kor nem lehet negatív, és nem haladhatja meg a 110 évet."
      }
    },      
    role: {
      type: String,
      enum: ["ADMIN", "DOCTOR", "PATIENT"],
      default: "PATIENT",
    },
    gender: {
      type: String,
      required: [true, "A nem megadása kötelező"],
      enum: {
        values: ["MALE", "FEMALE"],
        message: "Kérjük, válasszon nemet (MALE vagy FEMALE)"
      }
    },

    // --- CSAK PÁCIENS MEZŐK ---
    tajNumber: {
      type: String,
      required: [function () {
        return this.role === "PATIENT";
      }, "TAJ szám megadása kötelező"],
      validate: {
        validator: function (v) {
          if (!this.isModified("tajNumber")) return true;
          return /^\d{9}$/.test(v);
        },
        message: "A TAJ számnak pontosan 9 számjegyből kell állnia",
      },
    },
    address: {
      type: String,
      required: [function () {
        return this.role === "PATIENT";
      }, "Lakcím megadása kötelező"],
      validate: {
        validator: function(v) {
          if (this.role !== "PATIENT") return true;
          // Regex: 4 számjegy irányítószám, szóköz, majd a cím
          return /^\d{4}\s.{3,}$/.test(v);
        },
        message: "Érvénytelen lakcím! Formátum: 1234 Város, Utca házszám"
      }
    },
    records: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Record",
      },
    ],

    // --- CSAK ORVOS MEZŐK ---
    specialization: {
      type: String,
      required: [function () {
        return this.role === "DOCTOR";
      }, "Specializáció megadása kötelező"],
    },
    // Itt hivatkozunk az elérhetőségekre
    availabilities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Availability",
      }
    ],
  },
  {
    timestamps: true,
  },
);

// Pre-save hook a jelszó titkosításához
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw new Error("Jelszó titkosítási hiba: " + error.message);
  }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;