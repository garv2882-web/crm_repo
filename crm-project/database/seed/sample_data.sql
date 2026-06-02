INSERT INTO users (
    full_name,
    email,
    role
)
VALUES
(
    'Garv Ranjan',
    'garv@example.com',
    'Admin'
),
(
    'Rahul Sharma',
    'rahul@example.com',
    'Sales'
);
INSERT INTO companies (
    company_name,
    company_code,
    industry,
    city
)
VALUES
(
    'TechNova',
    'TN001',
    'IT',
    'Bangalore'
);
INSERT INTO contacts (
    company_id,
    first_name,
    last_name,
    email
)
VALUES
(
    (SELECT company_id FROM companies LIMIT 1),
    'Aman',
    'Verma',
    'aman@technova.com'
);
INSERT INTO leads (
    company_id,
    primary_contact_id,
    assigned_to,
    created_by,
    lead_title,
    lead_status,
    priority,
    estimated_revenue
)
VALUES
(
    (SELECT company_id FROM companies LIMIT 1),

    (SELECT contact_id FROM contacts LIMIT 1),

    (SELECT user_id FROM users LIMIT 1),

    (SELECT user_id FROM users LIMIT 1),

    'CRM Software Proposal',

    'New',

    'High',

    500000
);
INSERT INTO deals (
    lead_id,
    deal_owner,
    created_by,
    deal_name,
    deal_status,
    priority,
    deal_value
)
VALUES
(
    (SELECT lead_id FROM leads LIMIT 1),

    (SELECT user_id FROM users LIMIT 1),

    (SELECT user_id FROM users LIMIT 1),

    'TechNova CRM Deal',

    'Open',

    'High',

    750000
);-- Sample data seeds
