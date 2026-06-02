CREATE TABLE companies (

    company_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    created_by UUID,

    company_name VARCHAR(255) NOT NULL,

    company_code VARCHAR(100) UNIQUE,

    industry VARCHAR(100),

    website VARCHAR(255),

    country VARCHAR(100),

    state VARCHAR(100),

    city VARCHAR(100),

    notes TEXT,

    is_deleted BOOLEAN DEFAULT FALSE,

    deleted_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_company_creator
    FOREIGN KEY (created_by)
    REFERENCES users(user_id)
    ON DELETE SET NULL

);-- Companies schema
