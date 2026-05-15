-- ============================================
-- AI Office History Intelligence System
-- Database Schema for Supabase (PostgreSQL)
-- ============================================

-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- DEPARTMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS departments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    head_officer VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'employee' 
        CHECK (role IN ('super_admin', 'office_admin', 'dept_officer', 'employee', 'viewer')),
    department UUID REFERENCES departments(id) ON DELETE SET NULL,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DOCUMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    department UUID REFERENCES departments(id) ON DELETE SET NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'general'
        CHECK (category IN ('meeting_notes', 'orders', 'compliance', 'employee_files', 
                            'circulars', 'policies', 'notifications', 'reports', 'general')),
    file_url TEXT NOT NULL,
    file_name VARCHAR(500),
    file_type VARCHAR(50),
    file_size BIGINT,
    tags TEXT[] DEFAULT '{}',
    version INTEGER DEFAULT 1,
    is_processed BOOLEAN DEFAULT FALSE,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- OFFICE HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS office_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    department UUID REFERENCES departments(id) ON DELETE SET NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'event'
        CHECK (category IN ('event', 'meeting', 'joining', 'transfer', 'promotion', 
                            'compliance', 'inspection', 'retirement', 'order', 'other')),
    event_date DATE NOT NULL,
    persons_involved TEXT[] DEFAULT '{}',
    attachments TEXT[] DEFAULT '{}',
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DOCUMENT CHUNKS TABLE (for vector search)
-- ============================================
CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    history_id UUID REFERENCES office_history(id) ON DELETE CASCADE,
    chunk_text TEXT NOT NULL,
    chunk_index INTEGER NOT NULL DEFAULT 0,
    source_type VARCHAR(50) NOT NULL DEFAULT 'document'
        CHECK (source_type IN ('document', 'history')),
    embedding vector(768),  -- Gemini text-embedding-004 produces 768-dim vectors
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CHATBOT LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS chatbot_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    question TEXT NOT NULL,
    response TEXT NOT NULL,
    sources JSONB DEFAULT '[]',
    tokens_used INTEGER DEFAULT 0,
    response_time_ms INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AUDIT LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    details JSONB DEFAULT '{}',
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);
CREATE INDEX IF NOT EXISTS idx_documents_department ON documents(department);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_office_history_department ON office_history(department);
CREATE INDEX IF NOT EXISTS idx_office_history_category ON office_history(category);
CREATE INDEX IF NOT EXISTS idx_office_history_event_date ON office_history(event_date);
CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_history_id ON document_chunks(history_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_logs_user_id ON chatbot_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================
-- VECTOR SIMILARITY SEARCH FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION match_documents(
    query_embedding vector(768),
    match_threshold FLOAT DEFAULT 0.5,
    match_count INT DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    chunk_text TEXT,
    source_type VARCHAR(50),
    document_id UUID,
    history_id UUID,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        dc.id,
        dc.chunk_text,
        dc.source_type,
        dc.document_id,
        dc.history_id,
        1 - (dc.embedding <=> query_embedding) AS similarity
    FROM document_chunks dc
    WHERE dc.embedding IS NOT NULL
      AND 1 - (dc.embedding <=> query_embedding) > match_threshold
    ORDER BY dc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- ============================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_office_history_updated_at
    BEFORE UPDATE ON office_history
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
