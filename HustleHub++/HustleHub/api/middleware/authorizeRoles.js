const mongoose = require('mongoose');
const User = require('../models/User');

// Role-based access control. Use after verifyToken, e.g.
//   router.post('/', verifyToken, authorizeRoles('freelancer'), createGig);
//
// The role is read from the database on every request rather than trusted from the token,
// so it can only ever come from the database: never from the request body or query, and a
// role change takes effect immediately instead of when the old token expires.
function authorizeRoles(...allowedRoles) {
  return async function checkRole(req, res, next) {
    // Guards against the middleware being mounted before verifyToken by mistake.
    if (!req.user) {
      throw new Error('No token provided');
    }

    const user = mongoose.isObjectIdOrHexString(req.user.id)
      ? await User.findById(req.user.id).select('role')
      : null;
    if (!user) {
      throw new Error('Account no longer exists');
    }

    if (!allowedRoles.includes(user.role)) {
      throw new Error(`Access denied: this action requires one of these roles: ${allowedRoles.join(', ')}`);
    }

    req.user.role = user.role;
    next();
  };
}

module.exports = authorizeRoles;
