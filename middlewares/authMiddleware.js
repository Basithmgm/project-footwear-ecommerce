// middlewares/authMiddleware.js

// Ensure user is logged in (any role)
function ensureAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  // If request is for admin area, send to admin login
  if (req.originalUrl.startsWith("/admin")) {
    return res.redirect("/admin/login");
  }
  // Otherwise, send to normal user login (adjust path if needed)
  return res.redirect("/user/login");
}

// Ensure user is logged in AND role = 'admin'
// function ensureAdmin(req, res, next) {
//   if (req.session && req.session.user && req.session.user.role === 'admin') {
//     return next();
//   }
//   // Not an admin → redirect to admin login
//   return res.redirect('/admin/login');
// }
function ensureAdmin(req, res, next) {
  if (
    req.session &&
    req.session.user &&
    (req.session.user.role === "admin" ||
      req.session.user.role?.roleName === "admin")
  ) {
    return next();
  }
  return res.redirect("/admin/login");
}

// Ensure user is logged in AND role = 'user'
function ensureUser(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === "user") {
    return next();
  }
  // Not a normal user → redirect to user login
  return res.redirect("/user/login");
}

function preventLoginWhenAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    // Already logged in: redirect based on role
    if (req.session.user.role === "admin") {
      return res.redirect("/admin/users");
    }
    return res.redirect("/dashboard"); // adjust for normal users
  }
  return next();
}

module.exports = {
  ensureAuthenticated,
  ensureAdmin,
  ensureUser,
  preventLoginWhenAuthenticated,
};
