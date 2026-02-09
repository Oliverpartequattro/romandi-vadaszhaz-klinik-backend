import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
    doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    topic: { type: String, required: true }, // pl. SZŰRÉS, KONTROLL
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: { type: String, enum: ['FREE', 'BOOKED'], default: 'FREE' },
    patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Service = mongoose.model('Service', serviceSchema);
export default Service;