import mongoose, { Schema } from "mongoose";
const ComplaintSchema = new Schema({
    complaintId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    userEmail: {
        type: String,
        required: true, // ⬅️ no more silent ""
        lowercase: true, // ⬅️ schema-level normalization
        trim: true,
        index: true, // ⬅️ history query is now O(log n)
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true, index: true },
    imageUrl: { type: String, required: true },
    status: {
        type: String,
        enum: ["Pending", "In Progress", "Resolved"],
        default: "Pending",
        index: true,
    },
}, { timestamps: true });
export default mongoose.model("Complaint", ComplaintSchema);
