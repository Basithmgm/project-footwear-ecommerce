// app.js

const path = require("path");
const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config(); // Load .env variables

// Routes
const adminRoutes = require("./routes/admin");
// Later you can add:
// const userRoutes = require('./routes/user');
// const authRoutes = require('./routes/auth');

const app = express();

// =====================
// MongoDB Connection
// =====================
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/footware";

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected (footware database)"))
  .catch((err) => console.error("MongoDB connection error:", err));

// =====================
// View Engine (EJS)
// =====================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// =====================
// Middleware
// =====================

// Parse form data & JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static files (CSS, JS, images)
// Example: /css/admin.css, /js/sweetalert2.all.min.js
app.use(express.static(path.join(__dirname, "public")));

// Session middleware (for login, admin auth, etc.)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 }, // 1 hour
  })
);

// Disable caching so back button cannot show protected pages after logout
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

// Make logged-in user available in all EJS views (optional but useful)
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

// =====================
// Routes
// =====================

// Root: redirect to home or login (you can change this later)
app.get("admin", (req, res) => {
  res.redirect("/admin/signup"); // for now, go to admin login
});

// Admin routes (login, users, block/unblock, etc.)
app.use("/admin", adminRoutes);

// Later, add:
// app.use('/', authRoutes);
// app.use('/', userRoutes);
app.use("/admin", adminRoutes); // /admin/login → routes/admin.js
// 404 handler
app.use((req, res) => {
  res.status(404).send("404 Not Found");
});

// =====================
// Start Server
// =====================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
