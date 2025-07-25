// fe/src/config/session.js
const session = require('express-session');

const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'spopa-session-secret-key-change-in-production-please',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        httpOnly: true, // Prevents XSS attacks
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'lax' // CSRF protection
    },
    name: 'spopa.session.id' // Custom session name
};

// In production, you might want to use a database store
// const MongoStore = require('connect-mongo');
// if (process.env.MONGODB_URI) {
//   sessionConfig.store = MongoStore.create({
//     mongoUrl: process.env.MONGODB_URI
//   });
// }

console.log('Session configuration loaded:', {
    secure: sessionConfig.cookie.secure,
    maxAge: sessionConfig.cookie.maxAge,
    name: sessionConfig.name
});

module.exports = sessionConfig;