const mongoose = require("mongoose");
const UserRole = require("../models/UserRole");

mongoose.connect("mongodb://localhost/footware"); // Your DB URI

const seedRoles = async () => {
  await UserRole.create([
    { roleName: "admin", description: "Administrator", permissions: ["all"] },
    {
      roleName: "user",
      description: "Regular user",
      permissions: ["view_products", "create_order"],
    },
  ]);
  console.log("Roles seeded!");
  process.exit();
};
seedRoles();
