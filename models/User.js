import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Itt hash-elt jelszó lesz
    role: { type: String, enum: ['ADMIN', 'DOCTOR', 'PATIENT'], default: 'PATIENT' },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

userSchema.methods.matchPassword = async function(enteredPassword) {
    console.log(this.password);
    console.log(enteredPassword)
    
    return enteredPassword == this.password;
};

const User = mongoose.model('User', userSchema,);
export default User;