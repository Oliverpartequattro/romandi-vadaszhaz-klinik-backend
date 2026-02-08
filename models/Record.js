const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
    patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    appointment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    service_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
    description: { type: String, required: true }, 
}, { timestamps: true });

module.exports = mongoose.model('Record', recordSchema);