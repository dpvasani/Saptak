const jwt = require('jsonwebtoken');
const User = require('../models/User');
const DataActivity = require('../models/DataActivity');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists and is active
    const user = await User.findById(decoded.userId).select('-password');
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    req.user = { userId: decoded.userId, ...user.toObject() };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// Middleware to log user activity
const logUserActivity = (action, category) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const originalSend = res.send;
    const startTime = Date.now();

    res.send = function(data) {
      // Log the activity after the response is sent
      setImmediate(async () => {
        try {
          const duration = Date.now() - startTime;
          const success = res.statusCode >= 200 && res.statusCode < 400;

          const activityData = {
            user: req.user.userId,
            action,
            category,
            itemId: req.params.id || req.body._id,
            itemName: req.body.name?.value || req.query.name,
            details: {
              searchQuery: req.query.name,
              aiProvider: req.query.aiProvider,
              aiModel: req.query.aiModel,
              fieldsModified: req.body.fieldsModified,
              fieldsVerified: req.body.fieldsVerified,
              exportFormat: req.query.format
            },
            metadata: {
              ipAddress: req.ip || req.connection.remoteAddress,
              userAgent: req.get('User-Agent'),
              sessionId: req.sessionID,
              duration,
              success,
              errorMessage: success ? null : 'Request failed'
            }
          };

          // Remove undefined fields
          Object.keys(activityData.details).forEach(key => {
            if (activityData.details[key] === undefined) {
              delete activityData.details[key];
            }
          });

          await DataActivity.create(activityData);

          // Update user activity counters
          const updateData = {};
          if (action === 'search') updateData['activity.searchCount'] = 1;
          if (action === 'verify') updateData['activity.verificationCount'] = 1;
          if (success) updateData['activity.contributionScore'] = 1;

          if (Object.keys(updateData).length > 0) {
            await User.findByIdAndUpdate(
              req.user.userId,
              { $inc: updateData },
              { new: true }
            );
          }
        } catch (error) {
          console.error('Error logging activity:', error);
        }
      });

      originalSend.call(this, data);
    };

    next();
  };
};
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive) {
        req.user = { userId: decoded.userId, ...user.toObject() };
      }
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

module.exports = {
  authenticateToken,
  logUserActivity,
  requireRole,
  optionalAuth
};