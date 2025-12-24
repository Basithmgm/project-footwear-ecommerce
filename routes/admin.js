const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
// const { ensureAdmin } = require("../middlewares/authMiddleware");
// const {
//   ensureAdmin,
//   preventLoginWhenAuthenticated,
// } = require("../middlewares/authMiddleware");
const {
  ensureAdmin,
  preventLoginWhenAuthenticated,
} = require("../middlewares/authMiddleware");

// Admin Login/Logout
router.get("/login", adminController.getAdminLogin);
router.post("/login", adminController.postAdminLogin);
router.get("/logout", adminController.adminLogout);
router.get(
  "/login",
  preventLoginWhenAuthenticated,
  adminController.getAdminLogin
);
router.post(
  "/login",
  preventLoginWhenAuthenticated,
  adminController.postAdminLogin
);

// User Management
router.get("/users", ensureAdmin, adminController.getUsers);
router.post("/users/search", ensureAdmin, adminController.searchUsers);
router.post(
  "/users/:id/toggle-block",
  ensureAdmin,
  adminController.toggleUserStatus
);

// Dashboard
router.get("/dashboard", ensureAdmin, adminController.getDashboard);

// Product Management (placeholder - add Product model later)
router.get("/products", ensureAdmin, adminController.getProducts);
router.post("/products", ensureAdmin, adminController.createProduct);

// Order Management (placeholder - add Order model later)
router.get("/orders", ensureAdmin, adminController.getOrders);

module.exports = router;
