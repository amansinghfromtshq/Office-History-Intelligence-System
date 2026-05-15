const rateLimit = require('express-rate-limit');

// General API rate limiter
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    message: { success: false, message: 'Too many requests. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false
});

// Stricter limiter for AI endpoints
const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: { success: false, message: 'AI query limit reached. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false
});

// Auth rate limiter (prevent brute force)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, message: 'Too many login attempts. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = { generalLimiter, aiLimiter, authLimiter };
