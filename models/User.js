import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Név megadása kötelező"],
      trim: true,
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
      // Egyedi validátor, hogy PUT-nál ne akadjon el
      validate: {
        validator: function (v) {
          // Ha nem módosult a jelszó (pl. profil frissítés), hagyjuk jóvá automatikusan
          if (!this.isModified("password")) return true;
          // Ha módosult, akkor fusson a Regex
          return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(v);
        },
        message:
          "A jelszónak legalább 8 karakterből kell állnia, és tartalmaznia kell betűt és számot is",
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
    },
    role: {
      type: String,
      enum: ["ADMIN", "DOCTOR", "PATIENT"],
      default: "PATIENT",
    },

    // --- CSAK PÁCIENS MEZŐK ---
    tajNumber: {
      type: String,
      required: function () {
        return this.role === "PATIENT";
      },
      // Egyedi validátor, hogy PUT-nál ne akadjon el
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
      required: function () {
        return this.role === "PATIENT";
      },
    },
    records: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Record",
      },
    ],
    gender: {
      type: String,
      enum: ["MALE", "FEMALE"],
      default: "MALE",
    },

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

// Jelszó ellenőrző metódus
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
