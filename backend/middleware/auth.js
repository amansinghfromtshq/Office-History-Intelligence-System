const jwt = require('jsonwebtoken');
const { supabaseAdmin } = require('../config/supabase');

/**
 * JWT Authentication Middleware
 * Verifies the token and attaches user info to req.user
 */
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch fresh user data
        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('id, name, email, role, department, is_active')
            .eq('id', decoded.id)
            .single();

        if (error || !user) {
            return res.status(401).json({ success: false, message: 'Invalid token. User not found.' });
        }

        if (!user.is_active) {
            return res.status(403).json({ success: false, message: 'Account deactivated.' });
        }

        req.user = user;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Token expired.' });
        }
        return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
};

module.exports = { authenticate };
