const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabaseAdmin } = require('../config/supabase');
const { isValidEmail, createAuditLog } = require('../utils/helpers');

// Register new user
exports.register = async (req, res) => {
    try {
        const { name, email, password, department, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
        }
        if (!isValidEmail(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email format.' });
        }
        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
        }

        // Check if email already exists
        const { data: existing } = await supabaseAdmin.from('users').select('id').eq('email', email).single();
        if (existing) {
            return res.status(409).json({ success: false, message: 'Email already registered.' });
        }

        const password_hash = await bcrypt.hash(password, 10);

        const { data: user, error } = await supabaseAdmin
            .from('users')
            .insert({ name, email, password_hash, department: department || null, role: role || 'employee' })
            .select('id, name, email, role, department, created_at')
            .single();

        if (error) throw error;

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

        await createAuditLog(supabaseAdmin, { userId: user.id, userName: user.name, action: 'REGISTER', entityType: 'user', entityId: user.id, ipAddress: req.ip });

        res.status(201).json({ success: true, message: 'Registration successful.', data: { user, token } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required.' });
        }

        const { data: user, error } = await supabaseAdmin.from('users').select('*').eq('email', email).single();
        if (error || !user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }
        if (!user.is_active) {
            return res.status(403).json({ success: false, message: 'Account deactivated. Contact admin.' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        // Update last login
        await supabaseAdmin.from('users').update({ last_login: new Date().toISOString() }).eq('id', user.id);

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

        await createAuditLog(supabaseAdmin, { userId: user.id, userName: user.name, action: 'LOGIN', entityType: 'user', entityId: user.id, ipAddress: req.ip });

        const { password_hash, ...safeUser } = user;
        res.json({ success: true, message: 'Login successful.', data: { user: safeUser, token } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get profile
exports.getProfile = async (req, res) => {
    try {
        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('id, name, email, role, department, avatar_url, is_active, last_login, created_at, departments(name)')
            .eq('id', req.user.id)
            .single();

        if (error) throw error;
        res.json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Update profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, avatar_url } = req.body;
        const updates = {};
        if (name) updates.name = name;
        if (avatar_url) updates.avatar_url = avatar_url;

        const { data, error } = await supabaseAdmin
            .from('users')
            .update(updates)
            .eq('id', req.user.id)
            .select('id, name, email, role, department, avatar_url')
            .single();

        if (error) throw error;
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
