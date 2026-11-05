import { Router } from "express";
import {
  createComplaint,
  getComplaintById,
  getAllComplaints,
  updateComplaintStatus,
  deleteComplaint,
  getComplaintsByUser,
} from "../controllers/complaintController.js";

const router = Router();

// Routes definition (Order matters: /user/:email must be above /:complaintId)
router.get("/", getAllComplaints);
router.post("/", createComplaint);
router.get("/user/:email", getComplaintsByUser);
router.get("/:complaintId", getComplaintById);
router.patch("/:complaintId/status", updateComplaintStatus);
router.delete("/:complaintId", deleteComplaint);

export default router;
