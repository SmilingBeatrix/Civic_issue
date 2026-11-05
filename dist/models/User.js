import mongoose, { Schema } from "mongoose";
const UserSchema = new Schema({
    name: { type: String, required: true, trim: true },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true, // ⬅️ can't accidentally create John@x.com + john@x.com
        trim: true,
        index: true,
    },
    passwordHash: { type: String, required: true },
    role: {
        type: String,
        enum: ["citizen", "worker"],
        default: "citizen",
        index: true,
    },
}, { timestamps: true });
export default mongoose.model("User", UserSchema);
