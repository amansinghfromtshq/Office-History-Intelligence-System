const { supabaseAdmin } = require('../config/supabase');
const { paginate, createAuditLog } = require('../utils/helpers');

exports.listUsers = async (req, res) => {
    try {
        const { page, limit, role, search } = req.query;
        const { from, to } = paginate(page, limit);
        let query = supabaseAdmin.from('users')
            .select('id, name, email, role, department, is_active, last_login, created_at, departments(name)', { count: 'exact' })
            .order('created_at', { ascending: false }).range(from, to);
        if (role) query = query.eq('role', role);
        if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
        const { data, error, count } = await query;
        if (error) throw error;
        res.json({ success: true, data, total: count });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateUser = async (req, res) => {
    try {
        const { role, is_active, department } = req.body;
        const updates = {};
        if (role) updates.role = role;
        if (typeof is_active === 'boolean') updates.is_active = is_active;
        if (department) updates.department = department;
        const { data, error } = await supabaseAdmin.from('users').update(updates).eq('id', req.params.id).select().single();
        if (error) throw error;
        await createAuditLog(supabaseAdmin, { userId: req.user.id, userName: req.user.name, action: 'UPDATE_USER', entityType: 'user', entityId: req.params.id, details: updates, ipAddress: req.ip });
        res.json({ success: true, data });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.listDepartments = async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin.from('departments').select('*').order('name');
        if (error) throw error;
        res.json({ success: true, data });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createDepartment = async (req, res) => {
    try {
        const { name, description, head_officer } = req.body;
        if (!name) return res.status(400).json({ success: false, message: 'Name required.' });
        const { data, error } = await supabaseAdmin.from('departments').insert({ name, description, head_officer }).select().single();
        if (error) throw error;
        res.status(201).json({ success: true, data });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateDepartment = async (req, res) => {
    try {
        const { name, description, head_officer } = req.body;
        const { data, error } = await supabaseAdmin.from('departments').update({ name, description, head_officer }).eq('id', req.params.id).select().single();
        if (error) throw error;
        res.json({ success: true, data });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.deleteDepartment = async (req, res) => {
    try {
        const { error } = await supabaseAdmin.from('departments').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ success: true, message: 'Department deleted.' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getAuditLogs = async (req, res) => {
    try {
        const { page, limit, action, user_id } = req.query;
        const { from, to } = paginate(page, limit);
        let query = supabaseAdmin.from('audit_logs').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(from, to);
        if (action) query = query.eq('action', action);
        if (user_id) query = query.eq('user_id', user_id);
        const { data, error, count } = await query;
        if (error) throw error;
        res.json({ success: true, data, total: count });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getAIMonitoring = async (req, res) => {
    try {
        const { data: logs, error } = await supabaseAdmin.from('chatbot_logs').select('*').order('created_at', { ascending: false }).limit(50);
        if (error) throw error;
        const totalQueries = logs.length;
        const avgResponseTime = logs.length > 0 ? Math.round(logs.reduce((s, l) => s + (l.response_time_ms || 0), 0) / logs.length) : 0;
        res.json({ success: true, data: { logs, stats: { totalQueries, avgResponseTime } } });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
