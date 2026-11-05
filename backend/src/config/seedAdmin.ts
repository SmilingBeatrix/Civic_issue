import bcrypt from "bcryptjs";
import User from "../models/User.js";

export const seedAdmin = async (): Promise<void> => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME || "Administrator";

  if (!adminEmail || !adminPassword) {
    console.warn(
      "⚠️  ADMIN_EMAIL or ADMIN_PASSWORD not set in .env — skipping admin seed",
    );
    return;
  }

  const cleanEmail = adminEmail.trim().toLowerCase();
  const existing = await User.findOne({ email: cleanEmail });

  if (existing) {
    // Agar exist karta hai par role galat hai, toh fix karo
    if (existing.role !== "worker") {
      existing.role = "worker";
      await existing.save();
      console.log(`✅ Existing user upgraded to admin: ${cleanEmail}`);
    } else {
      console.log(`✅ Admin already exists: ${cleanEmail}`);
    }
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await User.create({
    name: adminName,
    email: cleanEmail,
    passwordHash,
    role: "worker",
  });

  console.log(`🎉 Admin account auto-created: ${cleanEmail}`);
};
