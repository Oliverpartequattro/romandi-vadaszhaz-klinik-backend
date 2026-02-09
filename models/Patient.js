import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    birthDate: { type: Date, required: true },
    phone: { type: String, required: true },
    address: { type: String }
});

const Patient = mongoose.model('Patient', patientSchema);
export default Patient;