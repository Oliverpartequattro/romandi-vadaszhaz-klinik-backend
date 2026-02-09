import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true }, 
    tajNumber: { type: String, required: true, unique: true }, // A TAJ is egyedi kell legyen
    address: { type: String, required: true },
    password: { type: String, required: true }, // Itt hash-elt jelszó lesz de meg nincs
    role: { type: String, enum: ['ADMIN', 'DOCTOR', 'PATIENT'], default: 'PATIENT' },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

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