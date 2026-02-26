import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    doctor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    topic: {
      type: String,
      required: [true, "Téma megadása kötelező (pl. Kardiológia)"],
    },
    description: {
      type: String,
      required: [true, "Leírás megadása kötelező"],
    },
    location: {
      type: String,
      required: [true, "Helyszín megadása kötelező (pl. 102-es vizsgáló)"],
    },
    date: {
      type: Date,
    },
    price: {
      type: String,
      required: [true, "Ár megadása kötelező"],
    },
    patient_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

const Service = mongoose.model("Service", serviceSchema);
export default Service;
