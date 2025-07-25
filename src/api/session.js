// fe/src/api/session.js
const express = require('express');
const { auth } = require('express-oauth2-jwt-bearer');

const router = express.Router();

// Load auth config - handle the case where it might not exist
let authConfig;
try {
    authConfig = require('../auth_config.json');
} catch (error) {
    console.warn('auth_config.json not found, using environment variables');
    authConfig = {
        domain: process.env.AUTH0_DOMAIN,
        audience: process.env.AUTH0_AUDIENCE
    };
}

// JWT validation middleware - only if we have proper config
let checkJwt;
if (authConfig.domain && authConfig.audience) {
    checkJwt = auth({
        audience: authConfig.audience,
        issuerBaseURL: `https://${authConfig.domain}/`,
        algorithms: ["RS256"],
    });
} else {
    // Fallback middleware for development
    checkJwt = (req, res, next) => {
        console.warn('Auth0 config missing, skipping JWT validation in development');
        next();
    };
}

// Get current session data
router.get('/session', (req, res) => {
    console.log('GET /session - Session ID:', req.sessionID);
    console.log('GET /session - Session data:', req.session);

    if (!req.session.user) {
        return res.status(401).json({
            authenticated: false,
            message: 'No active session'
        });
    }

    res.json({
        authenticated: true,
        user: req.session.user,
        userType: req.session.userType,
        sessionId: req.sessionID
    });
});

// Initialize session after Auth0 authentication
router.post('/session/init', (req, res) => {
    console.log('POST /session/init - Request body:', req.body);
    console.log('POST /session/init - Current session:', req.session);

    try {
        const { user, userType } = req.body;

        if (!user || !user.sub) {
            return res.status(400).json({
                error: 'Invalid user data provided'
            });
        }

        // Store user data in session
        req.session.user = {
            sub: user.sub,
            name: user.name,
            email: user.email,
            picture: user.picture,
            email_verified: user.email_verified
        };

        if (userType) {
            req.session.userType = userType;
        }

        // Save session
        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                return res.status(500).json({
                    error: 'Failed to save session'
                });
            }

            console.log('Session saved successfully:', req.sessionID);

            res.json({
                success: true,
                message: 'Session initialized successfully',
                sessionId: req.sessionID,
                user: req.session.user,
                userType: req.session.userType
            });
        });

    } catch (error) {
        console.error('Session initialization error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// Update user type in session
router.put('/session/usertype', (req, res) => {
    console.log('PUT /session/usertype - Request body:', req.body);

    if (!req.session.user) {
        return res.status(401).json({
            error: 'No active session'
        });
    }

    const { userType } = req.body;
    const validUserTypes = ['Estudiante', 'Administrativo', 'Empresa'];

    if (!userType || !validUserTypes.includes(userType)) {
        return res.status(400).json({
            error: 'Invalid user type provided',
            validTypes: validUserTypes
        });
    }

    req.session.userType = userType;

    req.session.save((err) => {
        if (err) {
            console.error('Session update error:', err);
            return res.status(500).json({
                error: 'Failed to update session'
            });
        }

        res.json({
            success: true,
            message: 'User type updated successfully',
            userType: req.session.userType
        });
    });
});

// Destroy session (logout)
router.delete('/session', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Session destruction error:', err);
            return res.status(500).json({
                error: 'Failed to destroy session'
            });
        }

        res.clearCookie('spopa.session.id');
        res.json({
            success: true,
            message: 'Session destroyed successfully'
        });
    });
});

// Test endpoint to verify API is working
router.get('/session/test', (req, res) => {
    res.json({
        success: true,
        message: 'Session API is working',
        timestamp: new Date().toISOString(),
        sessionId: req.sessionID,
        hasSession: !!req.session.user
    });
});

// Check if user is authenticated middleware
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({
            error: 'Authentication required'
        });
    }
    next();
};

// Check user type middleware
const requireUserType = (allowedTypes) => {
    return (req, res, next) => {
        if (!req.session.user) {
            return res.status(401).json({
                error: 'Authentication required'
            });
        }

        if (!req.session.userType || !allowedTypes.includes(req.session.userType)) {
            return res.status(403).json({
                error: 'Insufficient permissions',
                required: allowedTypes,
                current: req.session.userType
            });
        }

        next();
    };
};

module.exports = {
    router,
    requireAuth,
    requireUserType
};