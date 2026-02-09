import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    specialization: { type: String, required: true },
    phone: { type: String },
    isActive: { type: Boolean, default: true }
});

const Doctor = mongoose.model('Doctor', doctorSchema);
export default Doctor;