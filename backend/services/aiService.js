const { GoogleGenerativeAI } = require('@google/generative-ai');
const { searchSimilarChunks } = require('./embeddingService');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are an intelligent Office History Assistant for an enterprise knowledge management system. 
Your role is to answer questions about office history, documents, employees, meetings, compliance, and organizational events.

RULES:
1. Answer based ONLY on the provided context. If the context doesn't contain the answer, say so clearly.
2. Be precise, professional, and helpful.
3. When mentioning dates, names, or specific facts, cite which source document or record they come from.
4. Format responses clearly with bullet points or numbered lists when appropriate.
5. If asked about timelines, present information chronologically.
6. Always maintain a professional enterprise tone.`;

/**
 * Generate AI response using RAG (Retrieval-Augmented Generation)
 * @param {string} question - User's question
 * @param {object} supabaseAdmin - Supabase admin client
 * @returns {object} - { answer, sources, tokensUsed }
 */
async function generateRAGResponse(question, supabaseAdmin) {
    const startTime = Date.now();

    try {
        // Step 1: Search for relevant document chunks
        const relevantChunks = await searchSimilarChunks(supabaseAdmin, question, 8, 0.3);

        // Step 2: Build context from retrieved chunks
        let context = '';
        const sources = [];

        if (relevantChunks.length > 0) {
            for (const chunk of relevantChunks) {
                context += `\n---\n${chunk.chunk_text}\n`;

                // Get source metadata
                if (chunk.document_id) {
                    const { data: doc } = await supabaseAdmin
                        .from('documents')
                        .select('title, category')
                        .eq('id', chunk.document_id)
                        .single();
                    if (doc) {
                        sources.push({ type: 'document', id: chunk.document_id, title: doc.title, category: doc.category, similarity: chunk.similarity });
                    }
                } else if (chunk.history_id) {
                    const { data: hist } = await supabaseAdmin
                        .from('office_history')
                        .select('title, category, event_date')
                        .eq('id', chunk.history_id)
                        .single();
                    if (hist) {
                        sources.push({ type: 'history', id: chunk.history_id, title: hist.title, category: hist.category, date: hist.event_date, similarity: chunk.similarity });
                    }
                }
            }
        }

        // Step 3: Generate response with Gemini
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const prompt = `${SYSTEM_PROMPT}

CONTEXT FROM OFFICE RECORDS:
${context || 'No relevant records found in the knowledge base.'}

USER QUESTION: ${question}

Please provide a helpful, accurate answer based on the context above.`;

        const result = await model.generateContent(prompt);
        const answer = result.response.text();
        const responseTime = Date.now() - startTime;

        // Deduplicate sources
        const uniqueSources = sources.filter((s, i, arr) =>
            arr.findIndex(x => x.id === s.id) === i
        );

        return {
            answer,
            sources: uniqueSources,
            tokensUsed: 0,
            responseTimeMs: responseTime
        };
    } catch (err) {
        console.error('AI generation error:', err.message);
        throw new Error('Failed to generate AI response');
    }
}

/**
 * Generate a summary of given text
 */
async function generateSummary(text) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent(
            `Summarize the following office document/record concisely in 3-5 bullet points:\n\n${text}`
        );
        return result.response.text();
    } catch (err) {
        console.error('Summary generation error:', err.message);
        throw new Error('Failed to generate summary');
    }
}

module.exports = { generateRAGResponse, generateSummary };
