const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate embedding vector for given text using Gemini
 * @param {string} text - Text to embed
 * @returns {number[]} - 768-dimensional embedding vector
 */
async function generateEmbedding(text) {
    try {
        const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
        const result = await model.embedContent(text);
        return result.embedding.values;
    } catch (err) {
        console.error('Embedding generation error:', err.message);
        throw new Error('Failed to generate embedding');
    }
}

/**
 * Chunk text into smaller segments for embedding
 * @param {string} text - Full text to chunk
 * @param {number} chunkSize - Approximate characters per chunk
 * @param {number} overlap - Overlap between chunks
 * @returns {string[]} - Array of text chunks
 */
function chunkText(text, chunkSize = 1000, overlap = 200) {
    if (!text || text.length === 0) return [];
    if (text.length <= chunkSize) return [text.trim()];

    const chunks = [];
    let start = 0;

    while (start < text.length) {
        let end = start + chunkSize;

        // Try to break at sentence boundary
        if (end < text.length) {
            const lastPeriod = text.lastIndexOf('.', end);
            const lastNewline = text.lastIndexOf('\n', end);
            const breakPoint = Math.max(lastPeriod, lastNewline);
            if (breakPoint > start + chunkSize * 0.5) {
                end = breakPoint + 1;
            }
        }

        const chunk = text.substring(start, end).trim();
        if (chunk.length > 0) {
            chunks.push(chunk);
        }

        start = end - overlap;
    }

    return chunks;
}

/**
 * Process and store embeddings for document chunks
 */
async function processAndStoreEmbeddings(supabaseAdmin, chunks, sourceId, sourceType) {
    const results = [];

    for (let i = 0; i < chunks.length; i++) {
        try {
            const embedding = await generateEmbedding(chunks[i]);

            const insertData = {
                chunk_text: chunks[i],
                chunk_index: i,
                source_type: sourceType,
                embedding: JSON.stringify(embedding)
            };

            if (sourceType === 'document') {
                insertData.document_id = sourceId;
            } else {
                insertData.history_id = sourceId;
            }

            const { data, error } = await supabaseAdmin
                .from('document_chunks')
                .insert(insertData)
                .select()
                .single();

            if (error) throw error;
            results.push(data);

            // Small delay to avoid rate limiting
            if (i < chunks.length - 1) {
                await new Promise(r => setTimeout(r, 200));
            }
        } catch (err) {
            console.error(`Error processing chunk ${i}:`, err.message);
        }
    }

    return results;
}

/**
 * Search for similar document chunks using vector similarity
 */
async function searchSimilarChunks(supabaseAdmin, queryText, matchCount = 10, threshold = 0.3) {
    try {
        const queryEmbedding = await generateEmbedding(queryText);

        const { data, error } = await supabaseAdmin.rpc('match_documents', {
            query_embedding: JSON.stringify(queryEmbedding),
            match_threshold: threshold,
            match_count: matchCount
        });

        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error('Vector search error:', err.message);
        return [];
    }
}

module.exports = { generateEmbedding, chunkText, processAndStoreEmbeddings, searchSimilarChunks };
