const DataActivity = require('../models/DataActivity');

const logActivity = (action, category) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    const startTime = Date.now();

    res.send = function(data) {
      // Log the activity after the response is sent
      setImmediate(async () => {
        try {
          if (req.user && req.user.userId) {
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

module.exports = { logActivity };