/**
 * Utility helper functions
 */

// Paginate query results
const paginate = (page = 1, limit = 20) => {
    const p = Math.max(1, parseInt(page));
    const l = Math.min(100, Math.max(1, parseInt(limit)));
    const from = (p - 1) * l;
    const to = from + l - 1;
    return { from, to, page: p, limit: l };
};

// Format file size
const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Sanitize filename
const sanitizeFilename = (name) => {
    return name.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 255);
};

// Validate email format
const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Create audit log entry
const createAuditLog = async (supabaseAdmin, { userId, userName, action, entityType, entityId, details, ipAddress }) => {
    try {
        await supabaseAdmin.from('audit_logs').insert({
            user_id: userId,
            user_name: userName,
            action,
            entity_type: entityType,
            entity_id: entityId,
            details: details || {},
            ip_address: ipAddress
        });
    } catch (err) {
        console.error('Audit log error:', err.message);
    }
};

module.exports = { paginate, formatFileSize, sanitizeFilename, isValidEmail, createAuditLog };
