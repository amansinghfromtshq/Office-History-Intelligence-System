const { supabaseAdmin } = require('../config/supabase');

exports.getStats = async (req, res) => {
    try {
        const [docs, users, history, chats] = await Promise.all([
            supabaseAdmin.from('documents').select('id', { count: 'exact', head: true }),
            supabaseAdmin.from('users').select('id', { count: 'exact', head: true }),
            supabaseAdmin.from('office_history').select('id', { count: 'exact', head: true }),
            supabaseAdmin.from('chatbot_logs').select('id', { count: 'exact', head: true })
        ]);

        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const { count: recentUploads } = await supabaseAdmin.from('documents')
            .select('id', { count: 'exact', head: true }).gte('created_at', weekAgo);

        res.json({
            success: true,
            data: {
                totalDocuments: docs.count || 0,
                totalEmployees: users.count || 0,
                totalHistory: history.count || 0,
                aiQueries: chats.count || 0,
                recentUploads: recentUploads || 0
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getChartData = async (req, res) => {
    try {
        const { data: deptDocs } = await supabaseAdmin.from('documents').select('department, departments(name)');
        const deptActivity = {};
        (deptDocs || []).forEach(d => {
            const name = d.departments?.name || 'Unassigned';
            deptActivity[name] = (deptActivity[name] || 0) + 1;
        });

        const { data: histData } = await supabaseAdmin.from('office_history').select('category');
        const categories = {};
        (histData || []).forEach(h => { categories[h.category] = (categories[h.category] || 0) + 1; });

        res.json({
            success: true,
            data: {
                departmentActivity: { labels: Object.keys(deptActivity), values: Object.values(deptActivity) },
                historyCategories: { labels: Object.keys(categories), values: Object.values(categories) }
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getRecentActivity = async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin.from('audit_logs')
            .select('*').order('created_at', { ascending: false }).limit(15);
        if (error) throw error;
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
