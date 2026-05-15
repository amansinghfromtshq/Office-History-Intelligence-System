const path = require('path');
const multer = require('multer');
const { supabaseAdmin } = require('../config/supabase');
const { extractText } = require('../services/textExtractor');
const { chunkText, processAndStoreEmbeddings } = require('../services/embeddingService');
const { paginate, sanitizeFilename, createAuditLog } = require('../utils/helpers');

// Multer storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + sanitizeFilename(file.originalname);
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/plain'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file type. Allowed: PDF, DOCX, XLSX, TXT'), false);
    }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } });
exports.uploadMiddleware = upload.single('file');

// Upload document
exports.uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded.' });
        }

        const { title, description, department, category, tags } = req.body;
        if (!title) {
            return res.status(400).json({ success: false, message: 'Title is required.' });
        }

        const fileUrl = `/uploads/${req.file.filename}`;
        const parsedTags = tags ? (typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags) : [];

        const { data: doc, error } = await supabaseAdmin
            .from('documents')
            .insert({
                title, description: description || '', department: department || null,
                category: category || 'general', file_url: fileUrl,
                file_name: req.file.originalname, file_type: req.file.mimetype,
                file_size: req.file.size, tags: parsedTags, uploaded_by: req.user.id
            })
            .select()
            .single();

        if (error) throw error;

        // Process text extraction and embeddings asynchronously
        processDocumentAsync(doc, req.file.path, req.file.mimetype);

        await createAuditLog(supabaseAdmin, {
            userId: req.user.id, userName: req.user.name, action: 'UPLOAD',
            entityType: 'document', entityId: doc.id, details: { title }, ipAddress: req.ip
        });

        res.status(201).json({ success: true, message: 'Document uploaded successfully. Processing text...', data: doc });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Async document processing (text extraction + embeddings)
async function processDocumentAsync(doc, filePath, mimeType) {
    try {
        const text = await extractText(filePath, mimeType);
        const chunks = chunkText(text);

        if (chunks.length > 0) {
            await processAndStoreEmbeddings(supabaseAdmin, chunks, doc.id, 'document');
        }

        await supabaseAdmin.from('documents').update({ is_processed: true }).eq('id', doc.id);
        console.log(`✅ Document processed: ${doc.title} (${chunks.length} chunks)`);
    } catch (err) {
        console.error(`❌ Document processing failed: ${doc.title}`, err.message);
    }
}

// List documents
exports.listDocuments = async (req, res) => {
    try {
        const { page, limit, department, category, search } = req.query;
        const { from, to } = paginate(page, limit);

        let query = supabaseAdmin.from('documents')
            .select('*, departments(name), users!uploaded_by(name)', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to);

        if (department) query = query.eq('department', department);
        if (category) query = query.eq('category', category);
        if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);

        const { data, error, count } = await query;
        if (error) throw error;

        res.json({ success: true, data, total: count, page: parseInt(page) || 1 });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get single document
exports.getDocument = async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin.from('documents')
            .select('*, departments(name), users!uploaded_by(name)')
            .eq('id', req.params.id).single();

        if (error || !data) return res.status(404).json({ success: false, message: 'Document not found.' });
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Delete document
exports.deleteDocument = async (req, res) => {
    try {
        const { error } = await supabaseAdmin.from('documents').delete().eq('id', req.params.id);
        if (error) throw error;

        await createAuditLog(supabaseAdmin, {
            userId: req.user.id, userName: req.user.name, action: 'DELETE',
            entityType: 'document', entityId: req.params.id, ipAddress: req.ip
        });

        res.json({ success: true, message: 'Document deleted.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get categories
exports.getCategories = async (req, res) => {
    res.json({
        success: true,
        data: ['meeting_notes', 'orders', 'compliance', 'employee_files', 'circulars', 'policies', 'notifications', 'reports', 'general']
    });
};
