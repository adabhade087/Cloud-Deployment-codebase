/**
 * Role-Based Access Control Middleware
 * @param {string[]} allowedRoles - Array of allowed role names (e.g. ['admin', 'developer'])
 */
const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const userRole = req.user.role || "developer";

    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have permission to access this resource",
        requiredRoles: allowedRoles,
        currentRole: userRole,
      });
    }

    next();
  };
};

module.exports = authorize;
