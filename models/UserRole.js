// models/UserRole.js
const mongoose = require("mongoose");

const ROLE_NAMES = ["admin", "user"]; // can extend later: ['admin', 'user', 'seller', 'support']

const userRoleSchema = new mongoose.Schema(
  {
    roleName: {
      type: String,
      required: true,
      unique: true, // creates a unique index in MongoDB
      enum: ROLE_NAMES, // keeps data consistent with allowed roles
      trim: true,
    },
    description: {
      type: String,
      default: "User role",
      trim: true,
    },
    // Simple, extensible permission strings; e.g. 'view_products', 'manage_users'
    permissions: {
      type: [String],
      default: [],
    },
    isDefault: {
      type: Boolean,
      default: false, // set true only for the default role (e.g. 'user')
    },
    isSystemRole: {
      type: Boolean,
      default: true, // protects core roles like admin/user from accidental deletion
    },
  },
  {
    timestamps: true, // createdAt / updatedAt, matches your User schema design [web:15]
    versionKey: false, // removes __v field for cleaner documents [web:24]
  }
);

// Optional compound index for faster queries by role + status in future
// userRoleSchema.index({ roleName: 1 });

module.exports = mongoose.model("UserRole", userRoleSchema);
