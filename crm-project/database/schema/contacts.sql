CREATE TABLE contacts (

    contact_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    company_id UUID,

    first_name VARCHAR(100) NOT NULL,

    last_name VARCHAR(100),

    email VARCHAR(255),

    mobile_number VARCHAR(20),

    linkedin_profile VARCHAR(255),

    job_title VARCHAR(100),

    department VARCHAR(100),

    notes TEXT,

    is_deleted BOOLEAN DEFAULT FALSE,

    deleted_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_contact_company
    FOREIGN KEY (company_id)
    REFERENCES companies(company_id)
    ON DELETE SET NULL

);-- Contacts schema
