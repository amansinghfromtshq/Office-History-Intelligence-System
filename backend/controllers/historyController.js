const { supabaseAdmin } = require('../config/supabase');
const { chunkText, processAndStoreEmbeddings } = require('../services/embeddingService');
const { paginate, createAuditLog } = require('../utils/helpers');

// Create history entry
exports.createEntry = async (req, res) => {
    try {
        const { title, description, department, category, event_date, persons_involved } = req.body;

        if (!title || !description || !event_date) {
            return res.status(400).json({ success: false, message: 'Title, description, and event_date are required.' });
        }

        const persons = persons_involved ? (typeof persons_involved === 'string' ? persons_involved.split(',').map(p => p.trim()) : persons_involved) : [];

        const { data, error } = await supabaseAdmin
            .from('office_history')
            .insert({ title, description, department: department || null, category: category || 'event', event_date, persons_involved: persons, created_by: req.user.id })
            .select()
            .single();

        if (error) throw error;

        // Create embedding for the history entry
        const fullText = `${title}. ${description}. Persons involved: ${persons.join(', ')}. Date: ${event_date}`;
        const chunks = chunkText(fullText);
        processAndStoreEmbeddings(supabaseAdmin, chunks, data.id, 'history').catch(console.error);

        await createAuditLog(supabaseAdmin, {
            userId: req.user.id, userName: req.user.name, action: 'CREATE',
            entityType: 'history', entityId: data.id, details: { title }, ipAddress: req.ip
        });

        res.status(201).json({ success: true, message: 'History entry created.', data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// List history entries
exports.listEntries = async (req, res) => {
    try {
        const { page, limit, department, category, search, from: dateFrom, to: dateTo } = req.query;
        const { from, to } = paginate(page, limit);

        let query = supabaseAdmin.from('office_history')
            .select('*, departments(name), users!created_by(name)', { count: 'exact' })
            .order('event_date', { ascending: false })
            .range(from, to);

        if (department) query = query.eq('department', department);
        if (category) query = query.eq('category', category);
        if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
        if (dateFrom) query = query.gte('event_date', dateFrom);
        if (dateTo) query = query.lte('event_date', dateTo);

        const { data, error, count } = await query;
        if (error) throw error;

        res.json({ success: true, data, total: count, page: parseInt(page) || 1 });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get single entry
exports.getEntry = async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin.from('office_history')
            .select('*, departments(name), users!created_by(name)')
            .eq('id', req.params.id).single();

        if (error || !data) return res.status(404).json({ success: false, message: 'Entry not found.' });
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Update entry
exports.updateEntry = async (req, res) => {
    try {
        const { title, description, department, category, event_date, persons_involved } = req.body;
        const updates = {};
        if (title) updates.title = title;
        if (description) updates.description = description;
        if (department) updates.department = department;
        if (category) updates.category = category;
        if (event_date) updates.event_date = event_date;
        if (persons_involved) updates.persons_involved = typeof persons_involved === 'string' ? persons_involved.split(',').map(p => p.trim()) : persons_involved;

        const { data, error } = await supabaseAdmin.from('office_history')
            .update(updates).eq('id', req.params.id).select().single();

        if (error) throw error;
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Delete entry
exports.deleteEntry = async (req, res) => {
    try {
        const { error } = await supabaseAdmin.from('office_history').delete().eq('id', req.params.id);
        if (error) throw error;

        await createAuditLog(supabaseAdmin, {
            userId: req.user.id, userName: req.user.name, action: 'DELETE',
            entityType: 'history', entityId: req.params.id, ipAddress: req.ip
        });

        res.json({ success: true, message: 'History entry deleted.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get timeline data
exports.getTimeline = async (req, res) => {
    try {
        const { department, category, from: dateFrom, to: dateTo } = req.query;

        let query = supabaseAdmin.from('office_history')
            .select('*, departments(name), users!created_by(name)')
            .order('event_date', { ascending: false })
            .limit(50);

        if (department) query = query.eq('department', department);
        if (category) query = query.eq('category', category);
        if (dateFrom) query = query.gte('event_date', dateFrom);
        if (dateTo) query = query.lte('event_date', dateTo);

        const { data, error } = await query;
        if (error) throw error;

        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
