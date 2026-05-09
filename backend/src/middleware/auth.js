// middleware/auth.js - JWT Authentication & Authorization

// These middleware functions protect routes:
//   - protect()    → checks if user is logged in (valid JWT)
//   - authorize()  → checks if user has the right role
// Usage in routes: router.get("/", protect, authorize("admin"), handler)


const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ── Protect: Verify JWT Token ─────────────────────────────────
// Reads token from Authorization header, verifies it, and
// attaches the logged-in user to req.user for use in route handlers
const protect = async (req, res, next) => {
  let token;

  // Check for Bearer token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized, no token" });
  }

  try {
    // Verify the token using our secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the user from DB and attach to request
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    next(); // Proceed to the next middleware/route handler
  } catch (error) {
    return res.status(401).json({ success: false, message: "Token is invalid or expired" });
  }
};

// ── Authorize: Role-Based Access Control ──────────────────────
// Accepts a list of allowed roles and blocks users who don't match.
// Must come AFTER protect() since it needs req.user
// Example roles: "superadmin", "schooladmin", "teacher", "student"
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

// ── Tenant Guard: Multi-Tenancy Isolation ─────────────────────
// Ensures a user can only access data from their own school.
// Attaches schoolId to the request for use in queries.
const tenantGuard = (req, res, next) => {
  // Try to determine schoolId from query or body if not present on user
  const requestedSchoolId = req.query.schoolId || req.query.school || (req.body && req.body.schoolId);
  
  // SuperAdmin can access all schools
  if (req.user.role === "superadmin") {
    req.schoolId = requestedSchoolId || null;
    return next();
  }

  // For other roles, restrict to their school only
  if (!req.user.school) {
    return res.status(403).json({
      success: false,
      message: "User is not associated with any school",
    });
  }

  // Attach schoolId to req so route handlers can filter by it
  req.schoolId = req.user.school;
  next();
};

module.exports = { protect, authorize, tenantGuard };