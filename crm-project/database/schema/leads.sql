CREATE TABLE leads (

    lead_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    company_id UUID,

    primary_contact_id UUID,

    assigned_to UUID,

    created_by UUID,

    lead_title VARCHAR(255) NOT NULL,

    lead_source VARCHAR(100),

    lead_status lead_status DEFAULT 'New',

    priority priority_level DEFAULT 'Medium',

    estimated_revenue DECIMAL(15,2),

    conversion_probability DECIMAL(5,2),

    campaign_name VARCHAR(255),

    tags JSON,

    custom_fields JSON,

    notes TEXT,

    is_deleted BOOLEAN DEFAULT FALSE,

    deleted_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_lead_company
    FOREIGN KEY (company_id)
    REFERENCES companies(company_id)
    ON DELETE SET NULL,

    CONSTRAINT fk_lead_contact
    FOREIGN KEY (primary_contact_id)
    REFERENCES contacts(contact_id)
    ON DELETE SET NULL,

    CONSTRAINT fk_lead_assigned_user
    FOREIGN KEY (assigned_to)
    REFERENCES users(user_id)
    ON DELETE SET NULL,

    CONSTRAINT fk_lead_creator
    FOREIGN KEY (created_by)
    REFERENCES users(user_id)
    ON DELETE SET NULL

);-- Leads schema
