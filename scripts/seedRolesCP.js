const mongoose = require("mongoose");
const UserRole = require("../models/UserRole");

mongoose
  .connect("mongodb://localhost/footware")
  .then(async () => {
    console.log("Connected to MongoDB");

    const roles = [
      { roleName: "admin", description: "Administrator", permissions: ["all"] },
      {
        roleName: "user",
        description: "Regular user",
        permissions: ["view_products", "create_order"],
      },
    ];

    for (const roleData of roles) {
      const existing = await UserRole.findOne({ roleName: roleData.roleName });
      if (!existing) {
        await UserRole.create(roleData);
        console.log(`Created role: ${roleData.roleName}`);
      } else {
        console.log(`Role exists: ${roleData.roleName}`);
      }
    }

    console.log("Roles check complete!");
    process.exit();
  })
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
