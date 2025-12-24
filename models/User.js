// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't return password in queries by default
    },
    phone: {
      type: String,
      // If you want phone unique & optional later:
      // unique: true,
      // sparse: true,
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserRole",
      required: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    // OTP Verification Fields
    otp: {
      type: String,
      default: null,
      select: false, // Don't return OTP in queries
    },
    otpExpiresAt: {
      type: Date,
      default: null,
      select: false, // Don't return expiry in queries
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    // Auto-manage createdAt and updatedAt
    timestamps: true,
  }
);

// Index for OTP expiry cleanup (optional but recommended)
userSchema.index({ otpExpiresAt: 1 }, { expireAfterSeconds: 0 });

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  // bcrypt.hash(this.password, 12, (err, hash) => {
  //   if (err) {
  //     return next(err);
  //   }
  //   this.password = hash;
  //   next();
  // });
  const hash = await bcrypt.hash(this.password, 12);
  this.password = hash;
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if OTP is valid
userSchema.methods.isOTPValid = function (otp) {
  return this.otp === otp && this.otpExpiresAt > new Date();
};

// Clear OTP after verification
userSchema.methods.clearOTP = function () {
  this.otp = null;
  this.otpExpiresAt = null;
  this.isVerified = true;
};

module.exports = mongoose.model("User", userSchema);
