import { Request, Response } from "express";
import Complaint from "../models/Complaint";

// Generate short readable ID (e.g. CIVIC-123456)
const generateComplaintId = () => {
  return "CIVIC-" + Math.floor(100000 + Math.random() * 900000);
};

// 1. Submit a complaint
export const createComplaint = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { title, description, category, imageUrl, userEmail } = req.body;

    // ⬇️ userEmail is now REQUIRED — no more silent ""
    if (
      !title ||
      !description ||
      !category ||
      !imageUrl ||
      !userEmail ||
      !userEmail.trim()
    ) {
      res.status(400).json({
        error: "All fields are required (including userEmail).",
      });
      return;
    }

    const complaint = new Complaint({
      complaintId: generateComplaintId(),
      userEmail: userEmail.trim().toLowerCase(), // ⬅️ no fallback to ""
      title,
      description,
      category,
      imageUrl,
      status: "Pending",
    });

    await complaint.save();
    res.status(201).json(complaint);
  } catch (error) {
    res.status(500).json({ error: "Failed to create complaint." });
  }
};

// 2. Dual Lookup: Track by ID OR by Email
export const getComplaintById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const raw = req.params.complaintId ? req.params.complaintId.trim() : "";
    if (!raw) {
      res.status(400).json({ error: "Tracking ID or email is required." });
      return;
    }

    const complaint = await Complaint.findOne({
      $or: [
        { complaintId: raw.toUpperCase() }, // CIVIC-XXXXXX is always uppercase
        { userEmail: raw.toLowerCase() }, // emails are stored lowercase
      ],
    }).sort({ createdAt: -1 });

    if (!complaint) {
      res
        .status(404)
        .json({ error: "No complaint found matching that ID or Email." });
      return;
    }

    res.status(200).json(complaint);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch complaint." });
  }
};

// 3. Get all complaints for Worker / Staff Dashboard
export const getAllComplaints = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.status(200).json(complaints);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch complaints." });
  }
};

// 4. Get complaints filed by a specific user email
// 4. Get complaints filed by a specific user email
export const getComplaintsByUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const email = req.params.email ? req.params.email.trim().toLowerCase() : "";
    const myComplaints = await Complaint.find({ userEmail: email })
      .sort({ createdAt: -1 });

    res.status(200).json(myComplaints);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user complaints." });
  }
};

// 5. Update Status
export const updateComplaintStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { status } = req.body;
    const complaint = await Complaint.findOneAndUpdate(
      { complaintId: req.params.complaintId },
      { status },
      { new: true },
    );

    if (!complaint) {
      res.status(404).json({ error: "Complaint not found." });
      return;
    }

    res.status(200).json(complaint);
  } catch (error) {
    res.status(500).json({ error: "Failed to update complaint." });
  }
};

// 6. Delete Complaint
export const deleteComplaint = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const deleted = await Complaint.findOneAndDelete({
      complaintId: req.params.complaintId,
    });
    if (!deleted) {
      res.status(404).json({ error: "Complaint not found." });
      return;
    }
    res.status(200).json({ message: "Complaint deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete complaint." });
  }
};
