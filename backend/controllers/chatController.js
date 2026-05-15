const { supabaseAdmin } = require('../config/supabase');
const { generateRAGResponse } = require('../services/aiService');
const { createAuditLog } = require('../utils/helpers');

// AI Chat endpoint
exports.chat = async (req, res) => {
    try {
        const { question } = req.body;
        if (!question || question.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Question is required.' });
        }

        const result = await generateRAGResponse(question, supabaseAdmin);

        // Log the chat
        await supabaseAdmin.from('chatbot_logs').insert({
            user_id: req.user.id,
            question,
            response: result.answer,
            sources: result.sources,
            tokens_used: result.tokensUsed,
            response_time_ms: result.responseTimeMs
        });

        await createAuditLog(supabaseAdmin, {
            userId: req.user.id, userName: req.user.name, action: 'AI_QUERY',
            entityType: 'chatbot', details: { question }, ipAddress: req.ip
        });

        res.json({
            success: true,
            data: {
                answer: result.answer,
                sources: result.sources,
                responseTime: result.responseTimeMs
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get chat history
exports.getChatHistory = async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('chatbot_logs')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get suggested queries
exports.getSuggestions = async (req, res) => {
    res.json({
        success: true,
        data: [
            "Who joined recently?",
            "Show transfer history",
            "What decisions were taken in the last meeting?",
            "Show pending compliance",
            "Summarize all cybersecurity actions",
            "What is the IT budget for this year?",
            "Show timeline of office events",
            "Which officers were promoted recently?"
        ]
    });
};
