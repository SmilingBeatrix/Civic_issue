import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "civic_pulse_secret_key_123";

// ⬇️ Env se admin email uthao — sirf isi email ko worker login allowed
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();

// ==========================================
// REGISTER — sirf citizen ban sakta hai
// ==========================================
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: "Please provide all required fields" });
      return;
    }

    // ❌ Koi worker register nahi kar sakta
    if (role === "worker") {
      res.status(403).json({
        error:
          "Admin accounts cannot be registered. Contact the system administrator.",
      });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    // ❌ ADMIN_EMAIL se register karne ki koshish block karo
    if (ADMIN_EMAIL && cleanEmail === ADMIN_EMAIL) {
      res.status(403).json({
        error: "This email is reserved. Please use a different email.",
      });
      return;
    }

    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      res.status(400).json({ error: "Email already registered" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      role: "citizen", // ⬅️ hamesha citizen
    });
    await user.save();

    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" },
    );
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to register user" });
  }
};

// ==========================================
// LOGIN — worker login sirf ADMIN_EMAIL ke liye
// ==========================================
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password required" });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    // ⬇️ ADMIN CHECK — sirf ADMIN_EMAIL worker login kar sakta
    if (role === "worker") {
      if (!ADMIN_EMAIL) {
        res
          .status(500)
          .json({ error: "Server misconfigured: ADMIN_EMAIL not set" });
        return;
      }
      if (cleanEmail !== ADMIN_EMAIL) {
        res.status(403).json({
          error: "Only the authorized administrator can log in as staff.",
        });
        return;
      }
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      res.status(400).json({ error: "Invalid email or password" });
      return;
    }

    if (role && user.role !== role) {
      res
        .status(403)
        .json({ error: `Account exists, but is not registered as a ${role}` });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ error: "Invalid email or password" });
      return;
    }

    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" },
    );
    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to log in" });
  }
};
