// middleware/auth.js
const checkAdmin = async (req, res, next) => {
  // Ensure user is authenticated first
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  // Populate role if not already populated
  if (req.user.role && typeof req.user.role === "string") {
    await req.user.populate("role");
  }

  if (req.user.role.roleName !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

const checkAuthenticated = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Please login first" });
  }
  next();
};

module.exports = { checkAdmin, checkAuthenticated };
