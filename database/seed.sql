-- ============================================
-- SEED DATA FOR DEMO/TESTING
-- ============================================

-- Insert Departments
INSERT INTO departments (id, name, description, head_officer) VALUES
('d1000000-0000-0000-0000-000000000001', 'Finance', 'Financial operations, budgets, and auditing', 'Rajesh Kumar'),
('d1000000-0000-0000-0000-000000000002', 'Information Technology', 'IT infrastructure, software, and cybersecurity', 'Priya Sharma'),
('d1000000-0000-0000-0000-000000000003', 'Administration', 'General administration and office management', 'Sunil Verma'),
('d1000000-0000-0000-0000-000000000004', 'Human Resources', 'Employee management, recruitment, and welfare', 'Anita Desai'),
('d1000000-0000-0000-0000-000000000005', 'Legal & Compliance', 'Legal matters, regulatory compliance', 'Vikram Singh');

-- Insert Users (passwords are bcrypt hash of 'password123')
INSERT INTO users (id, name, email, password_hash, role, department) VALUES
('u1000000-0000-0000-0000-000000000001', 'Admin User', 'admin@office.com', '$2a$10$xVqYLGEMC9LmwThGOHIlI.wNOKqLz1EJXMFMo2gFnEE.fkD4Fdai', 'super_admin', 'd1000000-0000-0000-0000-000000000003'),
('u1000000-0000-0000-0000-000000000002', 'Rajesh Kumar', 'rajesh@office.com', '$2a$10$xVqYLGEMC9LmwThGOHIlI.wNOKqLz1EJXMFMo2gFnEE.fkD4Fdai', 'office_admin', 'd1000000-0000-0000-0000-000000000001'),
('u1000000-0000-0000-0000-000000000003', 'Priya Sharma', 'priya@office.com', '$2a$10$xVqYLGEMC9LmwThGOHIlI.wNOKqLz1EJXMFMo2gFnEE.fkD4Fdai', 'dept_officer', 'd1000000-0000-0000-0000-000000000002'),
('u1000000-0000-0000-0000-000000000004', 'Amit Patel', 'amit@office.com', '$2a$10$xVqYLGEMC9LmwThGOHIlI.wNOKqLz1EJXMFMo2gFnEE.fkD4Fdai', 'employee', 'd1000000-0000-0000-0000-000000000001'),
('u1000000-0000-0000-0000-000000000005', 'Neha Gupta', 'neha@office.com', '$2a$10$xVqYLGEMC9LmwThGOHIlI.wNOKqLz1EJXMFMo2gFnEE.fkD4Fdai', 'viewer', 'd1000000-0000-0000-0000-000000000004');

-- Insert Documents (metadata only, no actual files)
INSERT INTO documents (id, title, description, department, category, file_url, file_name, file_type, file_size, tags, is_processed, uploaded_by) VALUES
('dc100000-0000-0000-0000-000000000001', 'Annual Budget Report 2025-26', 'Comprehensive annual budget allocation and expenditure report', 'd1000000-0000-0000-0000-000000000001', 'reports', '/uploads/budget_2025.pdf', 'budget_2025.pdf', 'application/pdf', 2048000, ARRAY['budget', 'finance', 'annual'], true, 'u1000000-0000-0000-0000-000000000002'),
('dc100000-0000-0000-0000-000000000002', 'IT Security Policy v3.0', 'Updated cybersecurity policies and guidelines', 'd1000000-0000-0000-0000-000000000002', 'policies', '/uploads/it_security_v3.pdf', 'it_security_v3.pdf', 'application/pdf', 1024000, ARRAY['security', 'policy', 'IT'], true, 'u1000000-0000-0000-0000-000000000003'),
('dc100000-0000-0000-0000-000000000003', 'Staff Meeting Minutes - Jan 2026', 'Monthly staff meeting decisions and action items', 'd1000000-0000-0000-0000-000000000003', 'meeting_notes', '/uploads/meeting_jan2026.docx', 'meeting_jan2026.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 512000, ARRAY['meeting', 'minutes', 'january'], true, 'u1000000-0000-0000-0000-000000000001'),
('dc100000-0000-0000-0000-000000000004', 'Employee Handbook 2026', 'Complete employee guidelines and HR policies', 'd1000000-0000-0000-0000-000000000004', 'policies', '/uploads/employee_handbook.pdf', 'employee_handbook.pdf', 'application/pdf', 3072000, ARRAY['HR', 'handbook', 'policy'], true, 'u1000000-0000-0000-0000-000000000001'),
('dc100000-0000-0000-0000-000000000005', 'Compliance Checklist Q1 2026', 'Quarterly compliance verification checklist', 'd1000000-0000-0000-0000-000000000005', 'compliance', '/uploads/compliance_q1.xlsx', 'compliance_q1.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 256000, ARRAY['compliance', 'quarterly', 'checklist'], true, 'u1000000-0000-0000-0000-000000000002');

-- Insert Office History
INSERT INTO office_history (id, title, description, department, category, event_date, persons_involved, created_by) VALUES
('oh100000-0000-0000-0000-000000000001', 'Amit Patel Joined Finance Department', 'New employee Amit Patel joined as Junior Accountant in Finance department. Reporting to Rajesh Kumar.', 'd1000000-0000-0000-0000-000000000001', 'joining', '2026-01-15', ARRAY['Amit Patel', 'Rajesh Kumar'], 'u1000000-0000-0000-0000-000000000001'),
('oh100000-0000-0000-0000-000000000002', 'Cybersecurity Audit Completed', 'Annual IT security audit completed by external agency. No critical vulnerabilities found. 3 medium-risk items flagged for remediation.', 'd1000000-0000-0000-0000-000000000002', 'inspection', '2026-01-20', ARRAY['Priya Sharma', 'External Auditor'], 'u1000000-0000-0000-0000-000000000003'),
('oh100000-0000-0000-0000-000000000003', 'Budget Review Meeting', 'Q4 budget review meeting held. Decision: Increase IT infrastructure budget by 15%. Reduce paper procurement by 20%.', 'd1000000-0000-0000-0000-000000000001', 'meeting', '2026-02-01', ARRAY['Rajesh Kumar', 'Sunil Verma', 'Admin User'], 'u1000000-0000-0000-0000-000000000002'),
('oh100000-0000-0000-0000-000000000004', 'Priya Sharma Promoted to Senior IT Officer', 'Priya Sharma promoted from IT Officer to Senior IT Officer effective March 2026.', 'd1000000-0000-0000-0000-000000000002', 'promotion', '2026-03-01', ARRAY['Priya Sharma'], 'u1000000-0000-0000-0000-000000000001'),
('oh100000-0000-0000-0000-000000000005', 'Office Renovation Order', 'Director issued order for renovation of 2nd floor office space. Budget approved: ₹15 Lakhs. Timeline: 3 months.', 'd1000000-0000-0000-0000-000000000003', 'order', '2026-02-15', ARRAY['Sunil Verma', 'Director'], 'u1000000-0000-0000-0000-000000000001'),
('oh100000-0000-0000-0000-000000000006', 'New Leave Policy Implemented', 'Updated leave policy implemented. Key changes: WFH policy added, casual leave increased to 14 days.', 'd1000000-0000-0000-0000-000000000004', 'compliance', '2026-01-10', ARRAY['Anita Desai', 'HR Team'], 'u1000000-0000-0000-0000-000000000001'),
('oh100000-0000-0000-0000-000000000007', 'Quarterly Compliance Review', 'All departments submitted compliance reports. Finance: 95% compliant, IT: 98%, Admin: 92%.', 'd1000000-0000-0000-0000-000000000005', 'compliance', '2026-03-15', ARRAY['Vikram Singh', 'All HODs'], 'u1000000-0000-0000-0000-000000000001'),
('oh100000-0000-0000-0000-000000000008', 'Suresh Nair Transferred to Delhi Branch', 'Senior clerk Suresh Nair transferred from Mumbai to Delhi branch effective April 2026.', 'd1000000-0000-0000-0000-000000000003', 'transfer', '2026-03-20', ARRAY['Suresh Nair', 'Sunil Verma'], 'u1000000-0000-0000-0000-000000000001'),
('oh100000-0000-0000-0000-000000000009', 'Fire Safety Drill Conducted', 'Annual fire safety drill conducted. All floors evacuated in 4 minutes. 2 extinguishers need replacement.', 'd1000000-0000-0000-0000-000000000003', 'event', '2026-02-28', ARRAY['Safety Officer', 'All Staff'], 'u1000000-0000-0000-0000-000000000001'),
('oh100000-0000-0000-0000-000000000010', 'Director Meeting on Digital Transformation', 'Director chaired meeting on digital transformation roadmap. Decision: Implement AI-based document management by Q3 2026.', 'd1000000-0000-0000-0000-000000000002', 'meeting', '2026-04-01', ARRAY['Director', 'Priya Sharma', 'All HODs'], 'u1000000-0000-0000-0000-000000000001');

-- Insert sample document chunks for RAG demo
INSERT INTO document_chunks (document_id, chunk_text, chunk_index, source_type) VALUES
('dc100000-0000-0000-0000-000000000001', 'The annual budget for 2025-26 allocates ₹50 Crores for operational expenses. IT department receives ₹8 Crores, Finance ₹5 Crores, Administration ₹12 Crores, HR ₹3 Crores, and Legal ₹2 Crores. Capital expenditure budget is ₹20 Crores with major allocations for IT infrastructure upgrade and office renovation.', 0, 'document'),
('dc100000-0000-0000-0000-000000000001', 'Budget highlights: 15% increase in IT spending compared to previous year. New cybersecurity tools procurement approved. Cloud migration budget of ₹2 Crores allocated. Employee welfare fund increased by 10%.', 1, 'document'),
('dc100000-0000-0000-0000-000000000002', 'IT Security Policy v3.0 mandates: All employees must change passwords every 90 days. Two-factor authentication required for all administrative access. USB drives prohibited on workstations. All data transfers must be encrypted.', 0, 'document'),
('dc100000-0000-0000-0000-000000000003', 'Staff Meeting January 2026 Decisions: 1) Approve new attendance system deployment by Feb 2026. 2) Form committee for annual day celebrations. 3) Review pending transfers by month end. 4) IT to present cloud migration plan in next meeting.', 0, 'document'),
('dc100000-0000-0000-0000-000000000004', 'Employee Handbook 2026: Working hours are 9:00 AM to 5:30 PM. Lunch break: 1:00 PM to 1:30 PM. Casual leave: 14 days per year. Earned leave: 30 days per year. Work from home: Up to 2 days per week with manager approval.', 0, 'document');

-- Insert history chunks for RAG
INSERT INTO document_chunks (history_id, chunk_text, chunk_index, source_type) VALUES
('oh100000-0000-0000-0000-000000000001', 'Amit Patel joined the Finance Department on January 15, 2026 as Junior Accountant. He reports to Rajesh Kumar, Head of Finance.', 0, 'history'),
('oh100000-0000-0000-0000-000000000002', 'Annual cybersecurity audit was completed on January 20, 2026. The audit was conducted by an external agency. Results: No critical vulnerabilities found. 3 medium-risk items were flagged and require remediation within 60 days.', 0, 'history'),
('oh100000-0000-0000-0000-000000000003', 'Budget Review Meeting on February 1, 2026. Key decisions: IT infrastructure budget increased by 15%. Paper procurement reduced by 20% as part of digital transformation initiative. Attendees: Rajesh Kumar, Sunil Verma, Admin User.', 0, 'history'),
('oh100000-0000-0000-0000-000000000004', 'Priya Sharma was promoted from IT Officer to Senior IT Officer, effective March 1, 2026. This promotion recognizes her contributions to the cybersecurity initiative and cloud migration project.', 0, 'history'),
('oh100000-0000-0000-0000-000000000010', 'Director chaired a meeting on digital transformation on April 1, 2026. Key decision: Implement AI-based document management system by Q3 2026. Budget of ₹3 Crores approved for the project. Priya Sharma appointed as project lead.', 0, 'history');

-- Insert sample chatbot logs
INSERT INTO chatbot_logs (user_id, question, response, sources) VALUES
('u1000000-0000-0000-0000-000000000001', 'Who joined recently?', 'Amit Patel joined the Finance Department on January 15, 2026 as Junior Accountant, reporting to Rajesh Kumar.', '[{"type":"history","title":"Amit Patel Joined Finance Department"}]'),
('u1000000-0000-0000-0000-000000000002', 'What is the IT budget?', 'The IT department has been allocated ₹8 Crores for 2025-26, which is a 15% increase from the previous year. Additionally, ₹2 Crores has been allocated for cloud migration.', '[{"type":"document","title":"Annual Budget Report 2025-26"}]'),
('u1000000-0000-0000-0000-000000000003', 'What happened in the cybersecurity audit?', 'The annual IT security audit was completed on January 20, 2026. No critical vulnerabilities were found, but 3 medium-risk items were flagged for remediation within 60 days.', '[{"type":"history","title":"Cybersecurity Audit Completed"}]');

-- Insert audit logs
INSERT INTO audit_logs (user_id, user_name, action, entity_type, entity_id, details) VALUES
('u1000000-0000-0000-0000-000000000001', 'Admin User', 'LOGIN', 'user', 'u1000000-0000-0000-0000-000000000001', '{"ip": "192.168.1.1"}'),
('u1000000-0000-0000-0000-000000000001', 'Admin User', 'CREATE', 'document', 'dc100000-0000-0000-0000-000000000003', '{"title": "Staff Meeting Minutes - Jan 2026"}'),
('u1000000-0000-0000-0000-000000000002', 'Rajesh Kumar', 'UPLOAD', 'document', 'dc100000-0000-0000-0000-000000000001', '{"title": "Annual Budget Report 2025-26"}'),
('u1000000-0000-0000-0000-000000000003', 'Priya Sharma', 'CREATE', 'history', 'oh100000-0000-0000-0000-000000000002', '{"title": "Cybersecurity Audit Completed"}'),
('u1000000-0000-0000-0000-000000000001', 'Admin User', 'AI_QUERY', 'chatbot', NULL, '{"question": "Who joined recently?"}');
