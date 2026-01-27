/**
 * Authentication Middleware using Clerk
 * This file handles user authentication and attaches user data to requests
 */

const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');
const User = require('../models/User');

/**
 * Clerk JWT verification middleware
 * Verifies the JWT token sent from the frontend
 */
const authMiddleware = ClerkExpressRequireAuth({
  secretKey: process.env.CLERK_SECRET_KEY,
});

/**
 * Attach user to request after Clerk verification
 * This finds or creates the user in our MongoDB database
 */
const attachUser = async (req, res, next) => {
  try {
    // Skip if no authentication (for public routes)
    if (!req.auth || !req.auth.userId) {
      return next();
    }

    const clerkId = req.auth.userId;

    // Find user in our database
    let user = await User.findOne({ clerkId });

    if (!user) {
      // Create new user if doesn't exist
      const sessionClaims = req.auth.sessionClaims || {};
      
      user = await User.create({
        clerkId,
        email: sessionClaims.email || sessionClaims.email_address || '',
        name: `${sessionClaims.first_name || ''} ${sessionClaims.last_name || ''}`.trim(),
        imageUrl: sessionClaims.image_url || sessionClaims.profile_image_url || '',
      });

      console.log(`[Auth] ✓ Created new user: ${user.email}`);
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('[Auth] ✗ Error:', error.message);
    res.status(500).json({ 
      error: 'Authentication failed',
      message: error.message 
    });
  }
};

/**
 * Combined middleware for protected routes
 * Use this on any route that requires authentication
 */
const requireAuth = [authMiddleware, attachUser];

module.exports = {
  authMiddleware,
  attachUser,
  requireAuth
};