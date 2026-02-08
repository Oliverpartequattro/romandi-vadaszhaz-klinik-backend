const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Itt hash-elt jelszó lesz
    role: { type: String, enum: ['ADMIN', 'DOCTOR', 'PATIENT'], default: 'PATIENT' },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);