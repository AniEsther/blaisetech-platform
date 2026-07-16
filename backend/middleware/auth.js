// middleware/auth.js — checks that a request has a valid login token (JWT)
// and that the logged-in user is allowed to do what they're asking to do.

const jwt = require('jsonwebtoken');

// 1) Checks that the user is logged in AND that their account is still
// active. We deliberately look the user up fresh on every request rather
// than trusting only what's in the token — a token issued before an
// account was deactivated (e.g. a technician who resigned) would
// otherwise keep working until it expires. This one extra lookup is what
// makes "revoke access" actually immediate.
async function protect(req, res, next) {
  const authHeader = req.headers.authorization; // expects "Bearer <token>"

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized. Please log in.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Required here (not at the top of the file) to avoid a circular
    // require between models/index.js and this middleware.
    const { User } = require('../models');
    const user = await User.findByPk(decoded.id, { attributes: ['id', 'role', 'email', 'fullName', 'isActive'] });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'This account no longer has access. Please contact the admin.' });
    }

    req.user = { id: user.id, role: user.role, email: user.email, fullName: user.fullName };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

// 2) Checks that the logged-in user has the right role (e.g. only admins)
function restrictTo(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to do this.' });
    }
    next();
  };
}

module.exports = { protect, restrictTo };
