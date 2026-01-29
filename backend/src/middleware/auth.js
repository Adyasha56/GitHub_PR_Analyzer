/**
 * Authentication Middleware using Clerk
 * This file handles user authentication and attaches user data to requests
 */

const { getAuth, requireAuth: clerkRequireAuth } = require('@clerk/express');
const User = require('../models/User');

/**
 * Attach user to request after Clerk verification
 * This finds or creates the user in our MongoDB database
 */
const attachUser = async (req, res, next) => {
  try {
    // Get auth from request using @clerk/express
    const auth = getAuth(req);

    // Skip if no authentication (for public routes)
    if (!auth || !auth.userId) {
      return next();
    }

    const clerkId = auth.userId;

    // Find user in our database
    let user = await User.findOne({ clerkId });

    if (!user) {
      // Create new user if doesn't exist
      const sessionClaims = auth.sessionClaims || {};

      // Extract email from various possible locations in Clerk session
      const email =
        sessionClaims.email ||
        sessionClaims.email_address ||
        sessionClaims.primaryEmailAddress?.emailAddress ||
        sessionClaims.emailAddresses?.[0]?.emailAddress ||
        sessionClaims.email_addresses?.[0]?.email_address ||
        `user_${clerkId}@placeholder.com`; // Fallback email

      // Extract name
      const firstName = sessionClaims.first_name || sessionClaims.firstName || '';
      const lastName = sessionClaims.last_name || sessionClaims.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim() || 'User';

      // Extract image
      const imageUrl =
        sessionClaims.image_url ||
        sessionClaims.profile_image_url ||
        sessionClaims.imageUrl ||
        '';

    const created = await User.create({
        clerkId,
        email,
        name: fullName,
        imageUrl,
      });

      
      // Re-fetch from Mongo so indexes + doc are fully ready
      user = await User.findById(created._id);
    }
    

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({
      error: 'Authentication failed',
      message: error.message
    });
  }
};

/**
 * Combined middleware for protected routes
 * Use clerkRequireAuth() first, then attachUser
 */
const requireAuth = (req, res, next) => {
  // First run Clerk's requireAuth
  const clerkAuth = clerkRequireAuth();
  clerkAuth(req, res, (err) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized', message: err.message });
    }
    // Then run attachUser
    attachUser(req, res, next);
  });
};

module.exports = {
  attachUser,
  requireAuth
};
