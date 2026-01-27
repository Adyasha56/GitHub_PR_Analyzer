/**
 * Authentication Middleware
 * Uses Clerk for JWT verification
 */

const { clerkMiddleware, getAuth, clerkClient } = require('@clerk/express');
const User = require('../models/User');

/**
 * Clerk middleware - validates JWT tokens
 */
const authMiddleware = clerkMiddleware();

/**
 * Require authentication - returns 401 if not authenticated
 */
const requireAuth = async (req, res, next) => {
  try {
    const auth = getAuth(req);
    
    if (!auth || !auth.userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    req.auth = auth;
    next();
  } catch (error) {
    console.error('[Auth] Error:', error.message);
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid authentication token'
    });
  }
};

/**
 * Get or create user from Clerk data
 * Syncs user info to MongoDB
 */
const syncUser = async (req, res, next) => {
  try {
    const auth = getAuth(req);
    
    if (!auth || !auth.userId) {
      return next();
    }

    // Check if user exists in our DB
    let user = await User.findOne({ clerkId: auth.userId });

    if (!user) {
      // Fetch user details from Clerk
      try {
        const clerkUser = await clerkClient.users.getUser(auth.userId);
        
        user = await User.create({
          clerkId: auth.userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
          imageUrl: clerkUser.imageUrl || ''
        });
        
        console.log(`[Auth] New user created: ${user.email}`);
      } catch (clerkError) {
        console.error('[Auth] Error fetching Clerk user:', clerkError.message);
        // Create minimal user record
        user = await User.create({
          clerkId: auth.userId,
          email: 'unknown@example.com',
          name: 'Unknown User'
        });
      }
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('[Auth] Sync user error:', error.message);
    next(error);
  }
};

module.exports = {
  authMiddleware,
  requireAuth,
  syncUser
};
