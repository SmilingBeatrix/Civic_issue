import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { connectDB } from "./config/db.js";
import { seedAdmin } from "./config/seedAdmin.js"; // ⬅️ NEW
import complaintRoutes from "./routes/complaintRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const __dirname = path.resolve();

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "https://civic-issue-e82d.onrender.com",
    ],
    credentials: true,
  }),
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);

// Error handler
interface CustomError extends Error {
  status?: number;
}

app.use(
  (err: CustomError, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Global Server Error Caught:", err.message);
    res
      .status(err.status || 500)
      .json({ error: err.message || "Internal Server Error" });
  },
);

// Serve frontend build (static files)
app.use(express.static(path.join(__dirname, "/frontend/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
});

// ⬇️ IMPORTANT: Server start karne ka sahi tareeka
// Pehle DB connect, phir admin seed, phir listen
const startServer = async () => {
  try {
    await connectDB(); // 1. DB connect
    await seedAdmin(); // 2. Admin seed (agar already exists toh skip)
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
