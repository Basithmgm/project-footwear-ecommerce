// scripts/createAdmin.js
const mongoose = require("mongoose");
const path = require("path");
const bcrypt = require("bcrypt");
const User = require(path.join(__dirname, "../models/User"));
const UserRole = require(path.join(__dirname, "../models/UserRole"));

mongoose.connect("mongodb://localhost/footware");

const createAdmin = async () => {
  try {
    // Find existing admin role (created by seedRoles.js)
    const adminRole = await UserRole.findOne({ roleName: "admin" });
    if (!adminRole) {
      throw new Error("Run 'node scripts/seedRoles.js' first to create roles");
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@footware.com" });
    if (existingAdmin) {
      console.log("Admin already exists:", existingAdmin.email);
      process.exit(0);
    }

    // Create admin user with existing role ObjectId
    const plainPassword = "admin123"; // password you will use to login

    const hashedPassword = await bcrypt.hash(plainPassword, 10); // <-- hash it
    const adminUser = await User.create({
      name: "Admin",
      email: "admin@footware.com",
      password: hashedPassword,
      phone: "1234567890",
      role: adminRole._id,
      isVerified: true,
      isBlocked: false,
    });

    console.log("Admin created:", adminUser.email);
    console.log("Role ID:", adminRole._id);
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

createAdmin();
