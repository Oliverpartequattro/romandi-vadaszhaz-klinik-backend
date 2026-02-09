import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: [true, "Név megadása kötelező"] 
    },
    email: { 
      type: String, 
      required: [true, "Email megadása kötelező"], 
      unique: true 
    },
    password: { 
      type: String, 
      required: [true, "Jelszó megadása kötelező"] 
    },
    phone: { 
      type: String, 
      required: [true, "Telefonszám megadása kötelező"] 
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
        return this.role === "PATIENT"; // Csak páciensnél kötelező
      },
    },
    address: {
      type: String,
      required: function () {
        return this.role === "PATIENT"; // Csak páciensnél kötelező
      },
    },

    // --- CSAK ORVOS MEZŐK ---
    specialization: {
      type: String,
      required: function () {
        return this.role === "DOCTOR"; // Csak orvosnál kötelező
      },
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    //console.log(this.password);
    //console.log(enteredPassword);
    
    
    return await bcrypt.compare(enteredPassword, this.password);
};



const User = mongoose.model('User', userSchema,);
export default User;