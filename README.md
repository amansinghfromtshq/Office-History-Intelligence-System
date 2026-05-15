# 🧠 Office History Intelligence System

AI-Enabled Knowledge Base & Office History Management System — an enterprise-grade "Office Memory Brain" powered by Google Gemini AI.

## Features

- **AI Chatbot** — Ask natural language questions about office history (RAG architecture)
- **Document Management** — Upload PDF, DOCX, XLSX, TXT with auto text extraction
- **Office History** — Track events, meetings, transfers, promotions, compliance
- **Visual Timeline** — Chronological view of all office events
- **Dashboard** — KPI cards and Chart.js analytics
- **Role-Based Access** — Super Admin, Office Admin, Dept Officer, Employee, Viewer
- **Admin Panel** — User management, departments, audit logs, AI monitoring

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, JavaScript, Bootstrap Icons, Chart.js |
| Backend | Node.js, Express.js |
| Database | Supabase (PostgreSQL + pgvector) |
| AI | Google Gemini 2.0 Flash + text-embedding-004 |

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to **SQL Editor** and run the contents of `database/schema.sql`
4. Then run `database/seed.sql` for demo data
5. Go to **Settings > API** and copy your:
   - Project URL
   - `anon` public key
   - `service_role` secret key

### 2. Get Gemini API Key

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Create an API key
3. Copy the key

### 3. Configure Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` and fill in your keys:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-api-key
```

### 4. Install & Run

```bash
cd backend
npm install
npm start
```

Server runs at `http://localhost:3000`

### 5. Open Frontend

Open `frontend/index.html` in your browser (use Live Server extension in VS Code).

### Demo Login

- **Email:** admin@office.com
- **Password:** password123

## Project Structure

```
├── backend/
│   ├── config/          # Supabase client
│   ├── controllers/     # Route handlers
│   ├── middleware/       # Auth, role check, rate limiting
│   ├── routes/          # API routes
│   ├── services/        # AI, embeddings, text extraction
│   ├── utils/           # Helper functions
│   └── server.js        # Express entry point
├── frontend/
│   ├── css/style.css    # Design system
│   ├── js/              # Page-specific JavaScript
│   ├── pages/           # Dashboard, Chat, Documents, etc.
│   ├── index.html       # Login page
│   └── register.html    # Registration page
└── database/
    ├── schema.sql       # PostgreSQL schema + pgvector
    └── seed.sql         # Demo data
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/documents | List documents |
| POST | /api/documents/upload | Upload document |
| GET | /api/history | List history |
| POST | /api/history | Create history entry |
| GET | /api/history/timeline | Timeline data |
| POST | /api/chat | AI chat query |
| GET | /api/dashboard/stats | Dashboard KPIs |
| GET | /api/admin/users | List users (admin) |
