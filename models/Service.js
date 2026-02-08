const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    topic: { type: String, required: true }, // pl. SZŰRÉS, KONTROLL
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: { type: String, enum: ['FREE', 'BOOKED'], default: 'FREE' },
    patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', default: null },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);