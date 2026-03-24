import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
    doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    service_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    startTime: { 
        type: Date, 
        required: [true, "Kezdési időpont megadása kötelező"],
        validate: {
            validator: function(value) {
                // HA NEM ÚJ a dokumentum ÉS NEM módosult a startTime (pl. csak státusz update)
                // AKKOR engedjük át a validációt akkor is, ha a múltban van.
                if (!this.isNew && !this.isModified('startTime')) {
                    return true;
                }
                // Minden más esetben (POST vagy dátum módosítás) kötelező a jövőbeli időpont
                return value > new Date();
            },
            message: "Az időpont nem lehet a múltban!"
        }
    },
    endTime: { 
        type: Date, 
        validate: {
            validator: function(value) {
                if (value != null) {
                    return value > this.startTime;
                }
                return true;
            },
            message: "A befejezési időpontnak később kell lennie, mint a kezdésnek!"
        }
    },
    status: { 
        type: String,
        enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'PROPOSED', 'CANCELLED', 'COMPLETED', 'CONFIRMED'], 
        default: 'PENDING' 
    },
    referral_type: { 
        type: String, 
        enum: ['SELF', 'DOCTOR'], 
        default: 'SELF' 
    },
    referred_by: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        default: null 
    },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;