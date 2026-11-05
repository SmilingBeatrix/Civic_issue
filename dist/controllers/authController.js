import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
const JWT_SECRET = process.env.JWT_SECRET || "civic_pulse_secret_key_123";
export const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({ error: "Please provide all required fields" });
            return;
        }
        const existing = await User.findOne({ email });
        if (existing) {
            res.status(400).json({ error: "Email already registered" });
            return;
        }
        const assignedRole = role === "worker" ? "worker" : "citizen";
        const passwordHash = await bcrypt.hash(password, 10);
        const user = new User({ name, email, passwordHash, role: assignedRole });
        await user.save();
        const token = jwt.sign({ id: user._id, name: user.name, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to register user" });
    }
};
export const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            res.status(400).json({ error: "Invalid email or password" });
            return;
        }
        // Role check prevents citizens logging into staff panel or staff logging into citizen portal incorrectly
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
        const token = jwt.sign({ id: user._id, name: user.name, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
        res.status(200).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to log in" });
    }
};
