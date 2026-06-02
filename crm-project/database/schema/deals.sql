CREATE TABLE deals (

    deal_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    lead_id UUID NOT NULL,

    deal_owner UUID,

    created_by UUID,

    deal_name VARCHAR(255) NOT NULL,

    deal_stage VARCHAR(100),

    deal_status deal_status DEFAULT 'Open',

    priority priority_level DEFAULT 'Medium',

    probability_percentage DECIMAL(5,2),

    deal_value DECIMAL(15,2) NOT NULL,

    currency VARCHAR(10) DEFAULT 'INR',

    expected_closing_date DATE,

    product_service VARCHAR(255),

    competitors TEXT,

    deal_source VARCHAR(100),

    negotiation_status VARCHAR(100),

    contract_status VARCHAR(100),

    last_activity_date TIMESTAMP,

    next_follow_up_date TIMESTAMP,

    tags JSON,

    custom_fields JSON,

    notes TEXT,

    is_deleted BOOLEAN DEFAULT FALSE,

    deleted_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_deal_lead
    FOREIGN KEY (lead_id)
    REFERENCES leads(lead_id)
    ON DELETE CASCADE,

    CONSTRAINT fk_deal_owner
    FOREIGN KEY (deal_owner)
    REFERENCES users(user_id)
    ON DELETE SET NULL,

    CONSTRAINT fk_deal_creator
    FOREIGN KEY (created_by)
    REFERENCES users(user_id)
    ON DELETE SET NULL

);