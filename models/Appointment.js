import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
    doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    service_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: { type: String, default: 'BOOKED' },
    
    // Új mezők a beutalóhoz
    referral_type: { 
        type: String, 
        enum: ['SELF', 'DOCTOR'], 
        default: 'SELF' 
    },
    referred_by: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        default: null // Ha SELF, akkor null marad
    },
    
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;