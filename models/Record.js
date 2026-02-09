import mongoose from 'mongoose';

const recordSchema = new mongoose.Schema({
    patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    appointment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    service_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
    description: { type: String, required: true }, 
}, { timestamps: true });

const Record = mongoose.model('Record', recordSchema);
export default Record;