import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
    doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    service_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    startTime: { 
        type: Date, 
        required: [true, "Kezdési időpont megadása kötelező"],
        // Validátor: Ne lehessen múltbeli időpontot foglalni
        validate: {
            validator: function(value) {
                return value > new Date();
            },
            message: "Az időpont nem lehet a múltban!"
        }
    },
    endTime: { 
        type: Date, 
        // Validátor: A befejezésnek a kezdés után kell lennie
        validate: {
            validator: function(value) {
                if(value != null) { // Csak akkor ellenőrizzük, ha van megadva endTime
                    return value > this.startTime;
                }
            },
            message: "A befejezési időpontnak később kell lennie, mint a kezdésnek!"
        }
    },
    status: { type: String,
        enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'PROPOSED', 'CANCELLED'], 
        default: 'PENDING' },
    
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