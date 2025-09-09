// src/middleware/auth.js
// Authentication middleware

// Simple authentication middleware (to be expanded with JWT or other auth methods)
function authenticate(req, res, next) {
  // In a real implementation, you would check for a valid token
  // For now, we'll add a simple check
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing' });
  }
  
  // Check if it's a Bearer token
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Invalid authorization header format' });
  }
  
  // In a real implementation, you would verify the token here
  // For now, we'll just check if it's not empty
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  
  if (!token) {
    return res.status(401).json({ error: 'Token missing' });
  }
  
  // Add user info to request object
  // In a real implementation, this would come from token verification
  req.user = {
    id: 1,
    role: 'admin'
  };
  
  next();
}

// Authorization middleware
function authorize(roles = []) {
  // roles param can be a single role string or an array of roles
  if (typeof roles === 'string') {
    roles = [roles];
  }
  
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // If roles array is empty, accept any authenticated user
    if (roles.length === 0) {
      return next();
    }
    
    // Check if user's role is in the allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
}

module.exports = {
  authenticate,
  authorize
};