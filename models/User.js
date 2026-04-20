import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// --- SANITIZE + VALIDATION HELPERS ---

const sanitizeString = (value) => {
  if (!value) return value;

  return value
    .normalize("NFKC")
    .replace(/[\u0300-\u036f]/g, "") // zalgo
    .replace(/[\u{1F600}-\u{1F6FF}]/gu, "") // emoji
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, "")
    .replace(/[\u{1F900}-\u{1F9FF}]/gu, "")
    .replace(/[\u{2600}-\u{26FF}]/gu, "")
    .replace(/[\u{2700}-\u{27BF}]/gu, "")
    .replace(/[^\p{L}\p{N}\s.,\-@]/gu, "")
    .trim();
};

const safeTextRegex = /^[\p{L}\p{N}\s.,\-@]+$/u;

const userSchema = new mongoose.Schema(
  {
    resetPasswordCode: String,
    resetPasswordExpires: Date,

    name: {
      type: String,
      required: [true, "Név megadása kötelező"],
      trim: true,
      set: sanitizeString,
      minlength: [3, "A névnek legalább 3 karakterből kell állnia. Példa: Kovács János"],
      maxlength: [50, "A név nem lehet hosszabb 50 karakternél"],
      validate: {
        validator: (v) => safeTextRegex.test(v),
        message: "Érvénytelen karakter a névben. Példa: Kovács János"
      }
    },

    email: {
      type: String,
      required: [true, "Email megadása kötelező"],
      unique: true,
      lowercase: true,
      set: sanitizeString,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i,
        "Érvénytelen email. Példa: teszt@email.hu"
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
        message: "A jelszó legalább 8 karakter, tartalmazzon betűt és számot. Példa: Teszt1234"
      },
    },

    phone: {
      type: String,
      required: [true, "Telefonszám megadása kötelező"],
      match: [
        /^(?:\+36|06)(?:20|30|31|70)\d{7}$/,
        "Érvénytelen telefonszám. Példa: +36301234567"
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
        message: "Érvénytelen születési dátum. Példa: 1990-05-14"
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
        message: "Érvénytelen nem. Példa: MALE"
      }
    },

    // --- PATIENT ---
    tajNumber: {
      type: String,
      set: sanitizeString,
      required: [function () {
        return this.role === "PATIENT";
      }, "TAJ szám megadása kötelező"],
      validate: {
        validator: function (v) {
          return /^\d{9}$/.test(v);
        },
        message: "Érvénytelen TAJ szám. Példa: 123456789"
      },
    },

    address: {
      type: String,
      set: sanitizeString,
      required: [function () {
        return this.role === "PATIENT";
      }, "Lakcím megadása kötelező"],
      validate: {
        validator: function(v) {
          return /^\d{4}\s[\p{L}\s.,\-0-9]+$/u.test(v);
        },
        message: "Érvénytelen cím. Példa: 9024 Győr, Szent István út 12"
      }
    },

    records: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Record",
      },
    ],

    // --- DOCTOR ---
    specialization: {
      type: String,
      set: sanitizeString,
      required: [function () {
        return this.role === "DOCTOR";
      }, "Specializáció megadása kötelező. Példa: Kardiológus"],
    },

    availabilities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Availability",
      }
    ],
  },
  {
    timestamps: true,
  }
);

// GLOBAL SANITIZE
userSchema.pre("save", function () {
  for (let key in this._doc) {
    if (typeof this[key] === "string") {
      this[key] = sanitizeString(this[key]);
    }
  }
});

// PASSWORD HASH
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// PASSWORD CHECK
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;