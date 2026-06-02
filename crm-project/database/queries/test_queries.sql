SELECT
    l.lead_title,
    c.company_name,
    l.lead_status,
    l.priority
FROM leads l
JOIN companies c
ON l.company_id = c.company_id;
SELECT
    d.deal_name,
    l.lead_title,
    d.deal_value
FROM deals d
JOIN leads l
ON d.lead_id = l.lead_id;
SELECT
    c.first_name,
    c.email,
    comp.company_name
FROM contacts c
JOIN companies comp
ON c.company_id = comp.company_id;-- Test queries
