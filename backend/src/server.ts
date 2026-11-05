import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import path from "path"

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

const __dirname = path.resolve();

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

app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);

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

app.use(express.static(path.join(__dirname, "/frontend/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
