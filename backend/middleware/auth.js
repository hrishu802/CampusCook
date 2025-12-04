const jwt = require('jsonwebtoken');

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Authentication Error',
        message: 'Access token is required'
      });
    }

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({
            error: 'Authentication Error',
            message: 'Token expired. Please log in again.'
          });
        }
        
        if (err.name === 'JsonWebTokenError') {
          return res.status(401).json({
            error: 'Authentication Error',
            message: 'Invalid token'
          });
        }

        return res.status(401).json({
          error: 'Authentication Error',
          message: 'Token verification failed'
        });
      }

      // Attach user info to request
      req.user = decoded;
      next();
    });

  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred during authentication'
    });
  }
};

// Middleware to authorize based on user role
const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication Error',
        message: 'User not authenticated'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Authorization Error',
        message: 'You do not have permission to perform this action'
      });
    }

    next();
  };
};

// Optional authentication - doesn't fail if no token provided
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      // No token provided, continue without user info
      return next();
    }

    // Verify token if provided
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (!err) {
        // Valid token, attach user info
        req.user = decoded;
      }
      // Continue regardless of token validity
      next();
    });

  } catch (error) {
    // Continue even if error occurs
    next();
  }
};

module.exports = {
  authenticateToken,
  authorizeRole,
  optionalAuth
};
