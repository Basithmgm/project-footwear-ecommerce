const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const path = require("path");
const User = require(path.join(__dirname, "../models/User"));
const UserRole = require("../models/UserRole");

// Helper: Get Role by Name
async function getRoleByName(roleName) {
  const role = await UserRole.findOne({ roleName });
  if (!role) throw new Error(`Role '${roleName}' not found`);
  return role._id;
}

// =====================
// Admin Login / Logout
// =====================
exports.getAdminLogin = (req, res) => {
  const { error, success } = req.query;
  res.render("admin/login", {
    title: "Admin Login",
    error: error || null,
    success: success || null,
  });
};

exports.postAdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.render("admin/login", {
        title: "Admin Login",
        error: "Email and password required",
      });
    }

    const adminRoleId = await getRoleByName("admin");
    const adminUser = await User.findOne({ email, role: adminRoleId })
      .select("+password") // <-- add this line
      .populate("role");

    if (!adminUser || adminUser.status === "blocked" || !adminUser.password) {
      return res.render("admin/login", {
        title: "Admin Login",
        error: "Invalid admin credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, adminUser.password);
    if (!isMatch) {
      return res.render("admin/login", {
        title: "Admin Login",
        error: "Invalid admin credentials",
      });
    }

    req.session.user = {
      id: adminUser._id,
      email: adminUser.email,
      role: adminUser.role.roleName,
      name: adminUser.name,
    };

    adminUser.lastLoginAt = new Date();
    await adminUser.save();
    console.log("DEBUG admin login success, redirecting to /admin/users");
    res.redirect("/admin/users");
  } catch (err) {
    console.error("Admin login error:", err);
    res.render("admin/login", { title: "Admin Login", error: "Server error" });
  }
};

exports.adminLogout = (req, res) => {
  req.session.destroy(() => res.redirect("/admin/login"));
};

// =====================
// User Management
// =====================
exports.getUsers = async (req, res) => {
  try {
    const { success, error } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = (req.query.q || "").trim();
    const sort = req.query.sort || "latest";

    const userRoleId = await getRoleByName("user");

    // Build query
    const usersQuery = { role: userRoleId };
    if (search) {
      const regex = new RegExp(search, "i");
      usersQuery.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }

    // Sort options
    const sortOptions = {};
    if (sort === "latest") {
      sortOptions.createdAt = -1;
    } else if (sort === "oldest") {
      sortOptions.createdAt = 1;
    }

    // Count & fetch
    const totalUsers = await User.countDocuments(usersQuery);
    const totalPages = Math.ceil(totalUsers / limit);

    const users = await User.find(usersQuery)
      .populate("role")
      .sort(sortOptions)
      .limit(limit)
      .skip((page - 1) * limit);

    // Render view with all required variables
    res.render("admin/user-management", {
      title: "Manage Users",
      users,
      success,
      error,
      search, // used as <%= search %> in EJS
      currentPage: page, // used as currentPage in EJS
      totalPages, // used as totalPages in EJS
      totalUsers, // used in Total users line
      sort, // used in <select name="sort">
    });
  } catch (err) {
    console.error("Get users error:", err);
    res.redirect("/admin/users?error=Server error");
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.redirect("/admin/users?error=Invalid user ID");
    }

    const userRoleId = await getRoleByName("user");
    const user = await User.findOne({ _id: userId, role: userRoleId });

    if (!user) return res.redirect("/admin/users?error=User not found");

    user.status = user.status === "active" ? "blocked" : "active";
    await user.save();

    const message =
      user.status === "active" ? "User unblocked" : "User blocked";
    res.redirect(`/admin/users?success=${encodeURIComponent(message)}`);
  } catch (err) {
    console.error("Toggle status error:", err);
    res.redirect("/admin/users?error=Operation failed");
  }
};

exports.searchUsers = exports.getUsers; // Reuse same logic

// =====================
// Dashboard
// =====================
exports.getDashboard = async (req, res) => {
  try {
    const adminRoleId = await getRoleByName("admin");
    const userRoleId = await getRoleByName("user");

    const stats = await Promise.all([
      User.countDocuments({ role: userRoleId, status: "active" }),
      User.countDocuments({ role: userRoleId, status: "blocked" }),
      User.countDocuments({ role: adminRoleId }),
    ]);

    res.render("admin/dashboard", {
      title: "Admin Dashboard",
      stats: {
        activeUsers: stats[0],
        blockedUsers: stats[1],
        admins: stats[2],
      },
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.render("admin/dashboard", { title: "Admin Dashboard", stats: {} });
  }
};

// =====================
// Product Management (Placeholder)
// =====================
exports.getProducts = async (req, res) => {
  res.render("admin/products", {
    title: "Manage Products",
    products: [], // Add Product model later
    message: "Product management coming soon",
  });
};

exports.createProduct = async (req, res) => {
  res.redirect("/admin/products?message=Product creation coming soon");
};

// =====================
// Order Management (Placeholder)
// =====================
exports.getOrders = async (req, res) => {
  res.render("admin/orders", {
    title: "Manage Orders",
    orders: [], // Add Order model later
    message: "Order management coming soon",
  });
};
