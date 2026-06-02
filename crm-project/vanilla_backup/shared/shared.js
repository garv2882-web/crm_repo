/*
 * SalesNest CRM Shared Utilities & Layout Engine (State & Presentation Layers)
 * Integrates reusable layouts and data structures.
 */

// Helper to generate UUIDs
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Format currency helper (Indian Rupee)
function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

// Format date helper
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

// ==========================================
// 1. DATA ACCESS LAYER (CRMDataStore)
// ==========================================

const SEED_USERS = [
  { user_id: 'u1111111-1111-4111-8111-111111111111', full_name: 'Aman Verma', email: 'aman@salesnest.com', role: 'Admin', status: 'Active' },
  { user_id: 'u2222222-2222-4222-8222-222222222222', full_name: 'Rahul Sharma', email: 'rahul@salesnest.com', role: 'Sales', status: 'Active' },
  { user_id: 'u3333333-3333-4333-8333-333333333333', full_name: 'Priya Singh', email: 'priya@salesnest.com', role: 'Sales', status: 'Active' },
  { user_id: 'u4444444-4444-4444-8444-444444444444', full_name: 'Garv Ranjan', email: 'garv@salesnest.com', role: 'Admin', status: 'Active' }
];

const SEED_COMPANIES = [
  { company_id: 'c1111111-1111-4111-8111-111111111111', company_name: 'TechNova', company_code: 'TN001', industry: 'IT', website: 'https://technova.com', country: 'India', state: 'Karnataka', city: 'Bangalore', annual_revenue: 120000000 },
  { company_id: 'c2222222-2222-4222-8222-222222222222', company_name: 'SoftSol Pvt Ltd', company_code: 'SS002', industry: 'Consulting', website: 'https://softsol.com', country: 'India', state: 'Delhi NCR', city: 'Noida', annual_revenue: 85000000 },
  { company_id: 'c3333333-3333-4333-8333-333333333333', company_name: 'Byte Systems', company_code: 'BS003', industry: 'Software', website: 'https://bytesystems.io', country: 'India', state: 'Maharashtra', city: 'Pune', annual_revenue: 45000000 },
  { company_id: 'c4444444-4444-4444-8444-444444444444', company_name: 'NextGen Tech', company_code: 'NG004', industry: 'Infrastructure', website: 'https://nextgen.io', country: 'India', state: 'Maharashtra', city: 'Mumbai', annual_revenue: 180000000 },
  { company_id: 'c5555555-5555-4555-8555-555555555555', company_name: 'Creative Minds', company_code: 'CM005', industry: 'Design Agency', website: 'https://creativeminds.design', country: 'India', state: 'Delhi', city: 'Delhi', annual_revenue: 15000000 },
  { company_id: 'c6666666-6666-4666-8666-666666666666', company_name: 'Appify Solutions', company_code: 'AS006', industry: 'Mobile Apps', website: 'https://appify.com', country: 'India', state: 'Telangana', city: 'Hyderabad', annual_revenue: 30000000 },
  { company_id: 'c7777777-7777-4777-8777-777777777777', company_name: 'DataWiz', company_code: 'DW007', industry: 'BI & Analytics', website: 'https://datawiz.ai', country: 'India', state: 'Karnataka', city: 'Bangalore', annual_revenue: 55000000 },
  { company_id: 'c8888888-8888-4888-8888-888888888888', company_name: 'SecureX', company_code: 'SX008', industry: 'Cybersecurity', website: 'https://securex.co', country: 'India', state: 'Tamil Nadu', city: 'Chennai', annual_revenue: 95000000 }
];

const SEED_CONTACTS = [
  { contact_id: 'p1111111-1111-4111-8111-111111111111', company_id: 'c1111111-1111-4111-8111-111111111111', first_name: 'Aman', last_name: 'Verma', email: 'aman@technova.com', mobile_number: '+91 98765 43210', linkedin_profile: 'https://linkedin.com/in/amanverma', job_title: 'Procurement Head', department: 'Purchasing' },
  { contact_id: 'p2222222-2222-4222-8222-222222222222', company_id: 'c2222222-2222-4222-8222-222222222222', first_name: 'Vikash', last_name: 'Sharma', email: 'vikash@softsol.com', mobile_number: '+91 98765 43211', linkedin_profile: 'https://linkedin.com/in/vikashsharma', job_title: 'CTO', department: 'Technology' },
  { contact_id: 'p3333333-3333-4333-8333-333333333333', company_id: 'c3333333-3333-4333-8333-333333333333', first_name: 'Shreya', last_name: 'Sen', email: 'shreya@bytesystems.io', mobile_number: '+91 98765 43212', linkedin_profile: 'https://linkedin.com/in/shreyasen', job_title: 'Director of IT', department: 'IT' },
  { contact_id: 'p4444444-4444-4444-8444-444444444444', company_id: 'c4444444-4444-4444-8444-444444444444', first_name: 'Vikram', last_name: 'Malhotra', email: 'vikram@nextgen.io', mobile_number: '+91 98765 43213', linkedin_profile: 'https://linkedin.com/in/vikrammalhotra', job_title: 'VP Operations', department: 'Operations' },
  { contact_id: 'p5555555-5555-4555-8555-555555555555', company_id: 'c5555555-5555-4555-8555-555555555555', first_name: 'Sneha', last_name: 'Reddy', email: 'sneha@creativeminds.design', mobile_number: '+91 98765 43214', linkedin_profile: 'https://linkedin.com/in/snehareddy', job_title: 'Creative Director', department: 'Design' },
  { contact_id: 'p6666666-6666-4666-8666-666666666666', company_id: 'c6666666-6666-4666-8666-666666666666', first_name: 'Kunal', last_name: 'Gupta', email: 'kunal@appify.com', mobile_number: '+91 98765 43215', linkedin_profile: 'https://linkedin.com/in/kunalgupta', job_title: 'Founder & CEO', department: 'Executive' },
  { contact_id: 'p7777777-7777-4777-8777-777777777777', company_id: 'c7777777-7777-4777-8777-777777777777', first_name: 'Riya', last_name: 'Kapoor', email: 'riya@datawiz.ai', mobile_number: '+91 98765 43216', linkedin_profile: 'https://linkedin.com/in/riyakapoor', job_title: 'Analytics Manager', department: 'Data Science' },
  { contact_id: 'p8888888-8888-4888-8888-888888888888', company_id: 'c8888888-8888-4888-8888-888888888888', first_name: 'Amit', last_name: 'Patel', email: 'amit@securex.co', mobile_number: '+91 98765 43217', linkedin_profile: 'https://linkedin.com/in/amitpatel', job_title: 'CISO', department: 'Security' }
];

const SEED_LEADS = [
  { lead_id: 'l0000001-0000-4000-8000-000000000001', company_id: 'c1111111-1111-4111-8111-111111111111', primary_contact_id: 'p1111111-1111-4111-8111-111111111111', assigned_to: 'u1111111-1111-4111-8111-111111111111', created_by: 'u4444444-4444-4444-8444-444444444444', lead_title: 'CRM Software Proposal', lead_source: 'LinkedIn', lead_status: 'New', priority: 'High', estimated_revenue: 500000, conversion_probability: 45, campaign_name: 'Q2 Tech Outbound', tags: ['CRM', 'Software'], notes: 'Initial interest shown in custom workflow extensions. Requested proposal for 50 licenses.', is_deleted: false, created_at: '2024-05-20T10:00:00Z', updated_at: '2024-05-20T10:00:00Z' },
  { lead_id: 'l0000002-0000-4000-8000-000000000002', company_id: 'c2222222-2222-4222-8222-222222222222', primary_contact_id: 'p2222222-2222-4222-8222-222222222222', assigned_to: 'u2222222-2222-4222-8222-222222222222', created_by: 'u1111111-1111-4111-8111-111111111111', lead_title: 'ERP Migration', lead_source: 'Referral', lead_status: 'Qualified', priority: 'Medium', estimated_revenue: 1200000, conversion_probability: 70, campaign_name: 'Partner Networks', tags: ['ERP', 'Migration'], notes: 'Budget is approved. Looking to transition from legacy SAP to cloud platform.', is_deleted: false, created_at: '2024-05-18T14:30:00Z', updated_at: '2024-05-19T09:15:00Z' },
  { lead_id: 'l0000003-0000-4000-8000-000000000003', company_id: 'c3333333-3333-4333-8333-333333333333', primary_contact_id: 'p3333333-3333-4333-8333-333333333333', assigned_to: 'u3333333-3333-4333-8333-333333333333', created_by: 'u2222222-2222-4222-8222-222222222222', lead_title: 'Cloud Setup', lead_source: 'Website', lead_status: 'Contacted', priority: 'Low', estimated_revenue: 250000, conversion_probability: 30, campaign_name: 'Inbound Search', tags: ['Cloud', 'AWS'], notes: 'Scheduled discovery call. They want basic pricing for database replication.', is_deleted: false, created_at: '2024-05-17T11:15:00Z', updated_at: '2024-05-17T11:20:00Z' },
  { lead_id: 'l0000004-0000-4000-8000-000000000004', company_id: 'c4444444-4444-4444-8444-444444444444', primary_contact_id: 'p4444444-4444-4444-8444-444444444444', assigned_to: 'u1111111-1111-4111-8111-111111111111', created_by: 'u4444444-4444-4444-8444-444444444444', lead_title: 'IT Infrastructure', lead_source: 'LinkedIn', lead_status: 'New', priority: 'High', estimated_revenue: 875000, conversion_probability: 50, campaign_name: 'Q2 Tech Outbound', tags: ['Infrastructure'], notes: 'C-level team is expanding and requires dedicated bare metal hosting nodes.', is_deleted: false, created_at: '2024-05-16T16:00:00Z', updated_at: '2024-05-16T16:00:00Z' },
  { lead_id: 'l0000005-0000-4000-8000-000000000005', company_id: 'c5555555-5555-4555-8555-555555555555', primary_contact_id: 'p5555555-5555-4555-8555-555555555555', assigned_to: 'u2222222-2222-4222-8222-222222222222', created_by: 'u3333333-3333-4333-8333-333333333333', lead_title: 'Website Redesign', lead_source: 'Website', lead_status: 'Qualified', priority: 'Medium', estimated_revenue: 320000, conversion_probability: 65, campaign_name: 'Design Showcase', tags: ['Redesign'], notes: 'Needs interactive mockups, full design system, and react code integration. Budget ready.', is_deleted: false, created_at: '2024-05-15T09:45:00Z', updated_at: '2024-05-16T10:30:00Z' },
  { lead_id: 'l0000006-0000-4000-8000-000000000006', company_id: 'c6666666-6666-4666-8666-666666666666', primary_contact_id: 'p6666666-6666-4666-8666-666666666666', assigned_to: 'u3333333-3333-4333-8333-333333333333', created_by: 'u1111111-1111-4111-8111-111111111111', lead_title: 'Mobile App Project', lead_source: 'Campaign', lead_status: 'Contacted', priority: 'Low', estimated_revenue: 180000, conversion_probability: 20, campaign_name: 'Summer App Ads', tags: ['Mobile'], notes: 'First response obtained. E-commerce app specifications requested.', is_deleted: false, created_at: '2024-05-14T15:20:00Z', updated_at: '2024-05-14T17:00:00Z' },
  { lead_id: 'l0000007-0000-4000-8000-000000000007', company_id: 'c7777777-7777-4777-8777-777777777777', primary_contact_id: 'p7777777-7777-4777-8777-777777777777', assigned_to: 'u2222222-2222-4222-8222-222222222222', created_by: 'u2222222-2222-4222-8222-222222222222', lead_title: 'Data Analytics Integration', lead_source: 'Referral', lead_status: 'Disqualified', priority: 'Low', estimated_revenue: 90000, conversion_probability: 0, campaign_name: 'Partner Networks', tags: ['BI'], notes: 'Company wants fully open-source free tools built in-house. No budget.', is_deleted: false, created_at: '2024-05-12T12:00:00Z', updated_at: '2024-05-13T14:00:00Z' },
  { lead_id: 'l0000008-0000-4000-8000-000000000008', company_id: 'c8888888-8888-4888-8888-888888888888', primary_contact_id: 'p8888888-8888-4888-8888-888888888888', assigned_to: 'u1111111-1111-4111-8111-111111111111', created_by: 'u4444444-4444-4444-8444-444444444444', lead_title: 'Cybersecurity Audit', lead_source: 'Website', lead_status: 'New', priority: 'High', estimated_revenue: 660000, conversion_probability: 40, campaign_name: 'Inbound Search', tags: ['Security'], notes: 'Urgent compliance audit requested for SOC2 certification preparation.', is_deleted: false, created_at: '2024-05-10T10:45:00Z', updated_at: '2024-05-10T10:45:00Z' },
  
  // Remaining leads to make up 24 total
  { lead_id: 'l0000009-0000-4000-8000-000000000009', company_id: 'c1111111-1111-4111-8111-111111111111', primary_contact_id: 'p1111111-1111-4111-8111-111111111111', assigned_to: 'u4444444-4444-4444-8444-444444444444', created_by: 'u4444444-4444-4444-8444-444444444444', lead_title: 'DevOps Automation pipeline', lead_source: 'LinkedIn', lead_status: 'New', priority: 'Medium', estimated_revenue: 400000, conversion_probability: 30, campaign_name: 'Q2 Tech Outbound', tags: ['DevOps'], notes: 'Wants to automate CI/CD pipeline and integrate security scanning.', is_deleted: false, created_at: '2024-05-09T14:00:00Z', updated_at: '2024-05-09T14:00:00Z' },
  { lead_id: 'l0000010-0000-4000-8000-000000000010', company_id: 'c3333333-3333-4333-8333-333333333333', primary_contact_id: 'p3333333-3333-4333-8333-333333333333', assigned_to: 'u3333333-3333-4333-8333-333333333333', created_by: 'u2222222-2222-4222-8222-222222222222', lead_title: 'Kubernetes Cluster Setup', lead_source: 'Website', lead_status: 'New', priority: 'High', estimated_revenue: 750000, conversion_probability: 45, campaign_name: 'Inbound Search', tags: ['Kubernetes'], notes: 'Need high availability cluster setup for microservices app.', is_deleted: false, created_at: '2024-05-08T11:00:00Z', updated_at: '2024-05-08T11:00:00Z' },
  { lead_id: 'l0000011-0000-4000-8000-000000000011', company_id: 'c5555555-5555-4555-8555-555555555555', primary_contact_id: 'p5555555-5555-4555-8555-555555555555', assigned_to: 'u2222222-2222-4222-8222-222222222222', created_by: 'u1111111-1111-4111-8111-111111111111', lead_title: 'Product Branding & Identity', lead_source: 'Referral', lead_status: 'New', priority: 'Medium', estimated_revenue: 300000, conversion_probability: 50, campaign_name: 'Partner Networks', tags: ['Branding'], notes: 'Rebranding proposal including logo, colors, style guide.', is_deleted: false, created_at: '2024-05-07T16:00:00Z', updated_at: '2024-05-07T16:00:00Z' },
  { lead_id: 'l0000012-0000-4000-8000-000000000012', company_id: 'c6666666-6666-4666-8666-666666666666', primary_contact_id: 'p6666666-6666-4666-8666-666666666666', assigned_to: 'u3333333-3333-4333-8333-333333333333', created_by: 'u1111111-1111-4111-8111-111111111111', lead_title: 'iOS App Development', lead_source: 'Campaign', lead_status: 'New', priority: 'Low', estimated_revenue: 550000, conversion_probability: 25, campaign_name: 'Summer App Ads', tags: ['iOS'], notes: 'Looking for experienced Swift developers to port Android app.', is_deleted: false, created_at: '2024-05-06T10:00:00Z', updated_at: '2024-05-06T10:00:00Z' },
  { lead_id: 'l0000013-0000-4000-8000-000000000013', company_id: 'c8888888-8888-4888-8888-888888888888', primary_contact_id: 'p8888888-8888-4888-8888-888888888888', assigned_to: 'u1111111-1111-4111-8111-111111111111', created_by: 'u4444444-4444-4444-8444-444444444444', lead_title: 'Penetration Testing suite', lead_source: 'Website', lead_status: 'New', priority: 'High', estimated_revenue: 450000, conversion_probability: 40, campaign_name: 'Inbound Search', tags: ['PenTest'], notes: 'Need external network and application pentesting done.', is_deleted: false, created_at: '2024-05-05T13:30:00Z', updated_at: '2024-05-05T13:30:00Z' },
  { lead_id: 'l0000014-0000-4000-8000-000000000014', company_id: 'c1111111-1111-4111-8111-111111111111', primary_contact_id: 'p1111111-1111-4111-8111-111111111111', assigned_to: 'u1111111-1111-4111-8111-111111111111', created_by: 'u1111111-1111-4111-8111-111111111111', lead_title: 'API Integration Project', lead_source: 'LinkedIn', lead_status: 'Qualified', priority: 'Medium', estimated_revenue: 350000, conversion_probability: 80, campaign_name: 'Q2 Tech Outbound', tags: ['API'], notes: 'Need connection between Shopify and custom logistics panel.', is_deleted: false, created_at: '2024-05-04T09:00:00Z', updated_at: '2024-05-05T10:00:00Z' },
  { lead_id: 'l0000015-0000-4000-8000-000000000015', company_id: 'c2222222-2222-4222-8222-222222222222', primary_contact_id: 'p2222222-2222-4222-8222-222222222222', assigned_to: 'u2222222-2222-4222-8222-222222222222', created_by: 'u1111111-1111-4111-8111-111111111111', lead_title: 'Database Tuning support', lead_source: 'Referral', lead_status: 'Qualified', priority: 'High', estimated_revenue: 600000, conversion_probability: 75, campaign_name: 'Partner Networks', tags: ['Postgres'], notes: 'High CPU locks. Database tuning and query restructuring needed.', is_deleted: false, created_at: '2024-05-03T15:00:00Z', updated_at: '2024-05-04T12:00:00Z' },
  { lead_id: 'l0000016-0000-4000-8000-000000000016', company_id: 'c4444444-4444-4444-8444-444444444444', primary_contact_id: 'p4444444-4444-4444-8444-444444444444', assigned_to: 'u1111111-1111-4111-8111-111111111111', created_by: 'u4444444-4444-4444-8444-444444444444', lead_title: 'Hybrid Cloud Consulting', lead_source: 'Website', lead_status: 'Qualified', priority: 'High', estimated_revenue: 1500000, conversion_probability: 85, campaign_name: 'Inbound Search', tags: ['Cloud'], notes: 'Evaluating hybrid setup. Need solution architect for sizing.', is_deleted: false, created_at: '2024-05-02T11:00:00Z', updated_at: '2024-05-03T14:30:00Z' },
  { lead_id: 'l0000017-0000-4000-8000-000000000017', company_id: 'c7777777-7777-4777-8777-777777777777', primary_contact_id: 'p7777777-7777-4777-8777-777777777777', assigned_to: 'u2222222-2222-4222-8222-222222222222', created_by: 'u2222222-2222-4222-8222-222222222222', lead_title: 'PowerBI Dashboard suite', lead_source: 'LinkedIn', lead_status: 'Qualified', priority: 'Low', estimated_revenue: 200000, conversion_probability: 60, campaign_name: 'LinkedIn Inbound', tags: ['PowerBI'], notes: 'Need financial reporting dashboard suite created.', is_deleted: false, created_at: '2024-04-30T10:00:00Z', updated_at: '2024-05-01T16:00:00Z' },
  { lead_id: 'l0000018-0000-4000-8000-000000000018', company_id: 'c8888888-8888-4888-8888-888888888888', primary_contact_id: 'p8888888-8888-4888-8888-888888888888', assigned_to: 'u1111111-1111-4111-8111-111111111111', created_by: 'u4444444-4444-4444-8444-444444444444', lead_title: 'IAM System Deployment', lead_source: 'Website', lead_status: 'Qualified', priority: 'Medium', estimated_revenue: 950000, conversion_probability: 65, campaign_name: 'Inbound Search', tags: ['IAM'], notes: 'Looking to set up Single Sign-On and MFA across enterprise.', is_deleted: false, created_at: '2024-04-28T14:00:00Z', updated_at: '2024-04-29T10:00:00Z' },
  { lead_id: 'l0000019-0000-4000-8000-000000000019', company_id: 'c1111111-1111-4111-8111-111111111111', primary_contact_id: 'p1111111-1111-4111-8111-111111111111', assigned_to: 'u3333333-3333-4333-8333-333333333333', created_by: 'u4444444-4444-4444-8444-444444444444', lead_title: 'SaaS Platform Audit log', lead_source: 'LinkedIn', lead_status: 'Contacted', priority: 'Medium', estimated_revenue: 480000, conversion_probability: 35, campaign_name: 'Q2 Tech Outbound', tags: ['Audit'], notes: 'Spoke with lead. They want details about code compliance review options.', is_deleted: false, created_at: '2024-04-26T12:00:00Z', updated_at: '2024-04-26T12:10:00Z' },
  { lead_id: 'l0000020-0000-4000-8000-000000000020', company_id: 'c2222222-2222-4222-8222-222222222222', primary_contact_id: 'p2222222-2222-4222-8222-222222222222', assigned_to: 'u3333333-3333-4333-8333-333333333333', created_by: 'u1111111-1111-4111-8111-111111111111', lead_title: 'IT Helpdesk Outsourcing', lead_source: 'Referral', lead_status: 'Contacted', priority: 'Low', estimated_revenue: 500000, conversion_probability: 40, campaign_name: 'Partner Networks', tags: ['Helpdesk'], notes: 'Initial proposal sent. Follow up scheduled for Friday.', is_deleted: false, created_at: '2024-04-25T16:00:00Z', updated_at: '2024-04-25T16:20:00Z' },
  { lead_id: 'l0000021-0000-4000-8000-000000000021', company_id: 'c5555555-5555-4555-8555-555555555555', primary_contact_id: 'p5555555-5555-4555-8555-555555555555', assigned_to: 'u3333333-3333-4333-8333-333333333333', created_by: 'u3333333-3333-4333-8333-333333333333', lead_title: 'UI Design Training Workshop', lead_source: 'Website', lead_status: 'Contacted', priority: 'Low', estimated_revenue: 120000, conversion_probability: 30, campaign_name: 'Design Showcase', tags: ['Training'], notes: 'Requested quotation for a 2-day on-site designer workshop.', is_deleted: false, created_at: '2024-04-24T10:00:00Z', updated_at: '2024-04-24T10:15:00Z' },
  { lead_id: 'l0000022-0000-4000-8000-000000000022', company_id: 'c7777777-7777-4777-8777-777777777777', primary_contact_id: 'p7777777-7777-4777-8777-777777777777', assigned_to: 'u3333333-3333-4333-8333-333333333333', created_by: 'u2222222-2222-4222-8222-222222222222', lead_title: 'Big Data Pipeline Support', lead_source: 'LinkedIn', lead_status: 'Contacted', priority: 'Medium', estimated_revenue: 800000, conversion_probability: 45, campaign_name: 'LinkedIn Inbound', tags: ['BigData'], notes: 'Sent presentation slides. They need SLA contract templates.', is_deleted: false, created_at: '2024-04-22T14:30:00Z', updated_at: '2024-04-22T14:45:00Z' },
  { lead_id: 'l0000023-0000-4000-8000-000000000023', company_id: 'c3333333-3333-4333-8333-333333333333', primary_contact_id: 'p3333333-3333-4333-8333-333333333333', assigned_to: 'u2222222-2222-4222-8222-222222222222', created_by: 'u1111111-1111-4111-8111-111111111111', lead_title: 'Free Support Request', lead_source: 'Website', lead_status: 'Disqualified', priority: 'Low', estimated_revenue: 0, conversion_probability: 0, campaign_name: 'Inbound Search', tags: ['Support'], notes: 'User looking for free customer support regarding personal project. Spam lead.', is_deleted: false, created_at: '2024-04-20T09:00:00Z', updated_at: '2024-04-20T09:10:00Z' },
  { lead_id: 'l0000024-0000-4000-8000-000000000024', company_id: 'c4444444-4444-4444-8444-444444444444', primary_contact_id: 'p4444444-4444-4444-8444-444444444444', assigned_to: 'u2222222-2222-4222-8222-222222222222', created_by: 'u4444444-4444-4444-8444-444444444444', lead_title: 'Legacy Server Maintenance', lead_source: 'LinkedIn', lead_status: 'Disqualified', priority: 'Medium', estimated_revenue: 150000, conversion_probability: 0, campaign_name: 'Q2 Tech Outbound', tags: ['Maintenance'], notes: 'We do not support Windows NT legacy physical servers. Out of scope.', is_deleted: false, created_at: '2024-04-18T16:00:00Z', updated_at: '2024-04-18T16:15:00Z' }
];

const SEED_DEALS = [
  { deal_id: 'd0000001-0000-4000-8000-000000000001', lead_id: 'l0000002-0000-4000-8000-000000000002', company_id: 'c2222222-2222-4222-8222-222222222222', contact_id: 'p2222222-2222-4222-8222-222222222222', deal_name: 'ERP Migration Deal', deal_owner: 'Rahul Sharma', deal_stage: 'Proposal', deal_status: 'Open', sales_pipeline: 'Enterprise', priority: 'High', probability_percentage: 70, deal_value: 1200000, currency: 'INR', created_at: '2024-05-19T10:00:00Z' },
  { deal_id: 'd0000002-0000-4000-8000-000000000002', lead_id: 'l0000005-0000-4000-8000-000000000005', company_id: 'c5555555-5555-4555-8555-555555555555', contact_id: 'p5555555-5555-4555-8555-555555555555', deal_name: 'Creative Minds Web Redesign', deal_owner: 'Rahul Sharma', deal_stage: 'Negotiation', deal_status: 'Open', sales_pipeline: 'SMB', priority: 'Medium', probability_percentage: 80, deal_value: 320000, currency: 'INR', created_at: '2024-05-16T11:00:00Z' }
];

const SEED_ACTIVITIES = [
  { activity_id: 'a1', action_type: 'create_lead', text: '<span>Aman Verma</span> created lead <span>CRM Software Proposal</span> for TechNova', created_at: '2024-05-20T10:00:00Z' },
  { activity_id: 'a2', action_type: 'status_update', text: '<span>Rahul Sharma</span> qualified lead <span>ERP Migration</span>', created_at: '2024-05-19T09:15:00Z' },
  { activity_id: 'a3', action_type: 'convert_lead', text: '<span>Rahul Sharma</span> converted <span>ERP Migration</span> into a Deal', created_at: '2024-05-19T10:00:00Z' }
];

// ==========================================
// 2. STATE MANAGER CLASS (CRMDataStore)
// ==========================================

const CRMDataStore = {
  leads: [],
  companies: [],
  contacts: [],
  users: [],
  deals: [],
  activities: [],

  init() {
    if (!localStorage.getItem('crm_users')) localStorage.setItem('crm_users', JSON.stringify(SEED_USERS));
    if (!localStorage.getItem('crm_companies')) localStorage.setItem('crm_companies', JSON.stringify(SEED_COMPANIES));
    if (!localStorage.getItem('crm_contacts')) localStorage.setItem('crm_contacts', JSON.stringify(SEED_CONTACTS));
    if (!localStorage.getItem('crm_leads')) localStorage.setItem('crm_leads', JSON.stringify(SEED_LEADS));
    if (!localStorage.getItem('crm_deals')) localStorage.setItem('crm_deals', JSON.stringify(SEED_DEALS));
    if (!localStorage.getItem('crm_activities')) localStorage.setItem('crm_activities', JSON.stringify(SEED_ACTIVITIES));

    this.users = JSON.parse(localStorage.getItem('crm_users'));
    this.companies = JSON.parse(localStorage.getItem('crm_companies')).filter(c => !c.is_deleted);
    this.contacts = JSON.parse(localStorage.getItem('crm_contacts'));
    this.leads = JSON.parse(localStorage.getItem('crm_leads')).filter(l => !l.is_deleted);
    this.deals = JSON.parse(localStorage.getItem('crm_deals'));
    this.activities = JSON.parse(localStorage.getItem('crm_activities'));
  },

  saveCompanies() {
    localStorage.setItem('crm_companies', JSON.stringify(this.companies));
  },

  addCompany(companyData) {
    const newCompany = {
      company_id: generateUUID(),
      created_by: 'u1111111-1111-4111-8111-111111111111', // Admin
      company_name: companyData.company_name,
      company_code: companyData.company_code || ('COM_' + generateUUID().slice(0, 5).toUpperCase()),
      industry: companyData.industry || '',
      website: companyData.website || '',
      country: companyData.country || '',
      state: companyData.state || '',
      city: companyData.city || '',
      annual_revenue: parseFloat(companyData.annual_revenue) || 0,
      notes: companyData.notes || '',
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    this.companies.unshift(newCompany);
    this.saveCompanies();
    
    this.logActivity('create_company', `<span>Aman Verma</span> created company <span>${newCompany.company_name}</span>`);
    return newCompany;
  },

  updateCompany(companyId, updatedFields) {
    const idx = this.companies.findIndex(c => c.company_id === companyId);
    if (idx !== -1) {
      const oldName = this.companies[idx].company_name;
      this.companies[idx] = {
        ...this.companies[idx],
        ...updatedFields,
        updated_at: new Date().toISOString()
      };
      this.saveCompanies();
      
      if (updatedFields.company_name && updatedFields.company_name !== oldName) {
        this.logActivity('update_company', `<span>Aman Verma</span> renamed company <span>${oldName}</span> to <span>${updatedFields.company_name}</span>`);
      } else {
        this.logActivity('update_company', `<span>Aman Verma</span> updated company <span>${this.companies[idx].company_name}</span>`);
      }
      return this.companies[idx];
    }
    return null;
  },

  deleteCompany(companyId) {
    const idx = this.companies.findIndex(c => c.company_id === companyId);
    if (idx !== -1) {
      const name = this.companies[idx].company_name;
      this.companies[idx].is_deleted = true;
      this.companies[idx].deleted_at = new Date().toISOString();
      this.saveCompanies();
      this.companies = this.companies.filter(c => !c.is_deleted);
      this.logActivity('delete_company', `<span>Aman Verma</span> deleted company <span>${name}</span>`);
      return true;
    }
    return false;
  },

  saveLeads() {
    localStorage.setItem('crm_leads', JSON.stringify(this.leads));
  },

  saveDeals() {
    localStorage.setItem('crm_deals', JSON.stringify(this.deals));
  },

  saveActivities() {
    localStorage.setItem('crm_activities', JSON.stringify(this.activities));
  },

  logActivity(actionType, text) {
    const newActivity = {
      activity_id: 'act_' + generateUUID().slice(0, 8),
      action_type: actionType,
      text: text,
      created_at: new Date().toISOString()
    };
    this.activities.unshift(newActivity);
    if (this.activities.length > 50) this.activities.pop(); // Keep last 50
    this.saveActivities();
    return newActivity;
  },

  getJoinedLead(lead) {
    const company = this.companies.find(c => c.company_id === lead.company_id) || { company_name: 'Unknown Company' };
    const contact = this.contacts.find(c => c.contact_id === lead.primary_contact_id) || { first_name: 'Unknown', last_name: 'Contact' };
    const user = this.users.find(u => u.user_id === lead.assigned_to) || { full_name: 'Unassigned' };
    const creator = this.users.find(u => u.user_id === lead.created_by) || { full_name: 'System' };
    return { ...lead, company, contact, assignedUser: user, creator };
  },

  addLead(leadData) {
    const newLead = {
      lead_id: generateUUID(),
      company_id: leadData.company_id,
      primary_contact_id: leadData.primary_contact_id,
      assigned_to: leadData.assigned_to,
      created_by: 'u1111111-1111-4111-8111-111111111111', // Admin
      lead_title: leadData.lead_title,
      lead_source: leadData.lead_source || 'Website',
      lead_status: leadData.lead_status || 'New',
      priority: leadData.priority || 'Medium',
      estimated_revenue: parseFloat(leadData.estimated_revenue) || 0,
      conversion_probability: parseFloat(leadData.conversion_probability) || 50,
      campaign_name: leadData.campaign_name || '',
      tags: [],
      notes: leadData.notes || '',
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    this.leads.unshift(newLead);
    this.saveLeads();
    
    const joined = this.getJoinedLead(newLead);
    this.logActivity('create_lead', `<span>Aman Verma</span> created lead <span>${joined.lead_title}</span> for ${joined.company.company_name}`);
    return newLead;
  },

  updateLead(leadId, updatedFields) {
    const idx = this.leads.findIndex(l => l.lead_id === leadId);
    if (idx !== -1) {
      const oldStatus = this.leads[idx].lead_status;
      const oldPriority = this.leads[idx].priority;

      this.leads[idx] = {
        ...this.leads[idx],
        ...updatedFields,
        updated_at: new Date().toISOString()
      };
      this.saveLeads();

      const lead = this.leads[idx];
      if (updatedFields.lead_status && updatedFields.lead_status !== oldStatus) {
        this.logActivity('status_update', `<span>Aman Verma</span> updated lead status of <span>${lead.lead_title}</span> from "${oldStatus}" to "${updatedFields.lead_status}"`);
      } else if (updatedFields.priority && updatedFields.priority !== oldPriority) {
        this.logActivity('priority_update', `<span>Aman Verma</span> updated lead priority of <span>${lead.lead_title}</span> to "${updatedFields.priority}"`);
      } else if (updatedFields.notes && updatedFields.notes !== this.leads[idx].notes) {
        this.logActivity('note_added', `<span>Aman Verma</span> added a note to lead <span>${lead.lead_title}</span>`);
      }
      return this.leads[idx];
    }
    return null;
  },

  deleteLead(leadId) {
    const idx = this.leads.findIndex(l => l.lead_id === leadId);
    if (idx !== -1) {
      const title = this.leads[idx].lead_title;
      this.leads[idx].is_deleted = true;
      this.leads[idx].deleted_at = new Date().toISOString();
      this.saveLeads();
      this.leads = this.leads.filter(l => !l.is_deleted);
      this.logActivity('delete_lead', `<span>Aman Verma</span> deleted lead <span>${title}</span>`);
      return true;
    }
    return false;
  },

  convertLeadToDeal(leadId) {
    const lead = this.leads.find(l => l.lead_id === leadId);
    if (lead) {
      this.updateLead(leadId, { lead_status: 'Converted' });
      
      const newDeal = {
        deal_id: generateUUID(),
        lead_id: leadId,
        company_id: lead.company_id,
        contact_id: lead.primary_contact_id,
        deal_name: lead.lead_title + ' Deal',
        deal_owner: 'Aman Verma',
        deal_stage: 'Discovery',
        deal_status: 'Open',
        sales_pipeline: 'Enterprise',
        priority: lead.priority,
        probability_percentage: lead.conversion_probability,
        deal_value: lead.estimated_revenue,
        currency: 'INR',
        created_at: new Date().toISOString()
      };
      
      this.deals.push(newDeal);
      this.saveDeals();
      this.logActivity('convert_lead', `<span>Aman Verma</span> converted lead <span>${lead.lead_title}</span> into a Deal`);
      return newDeal;
    }
    return null;
  }
};

CRMDataStore.init();

// ==========================================
// 3. PRESENTATION LAYOUT ENGINE (CRMLayout)
// ==========================================

const CRMLayout = {
  // Config mapping sidebar urls relative to the page locations
  getRelativePathPrefix() {
    const path = window.location.pathname;
    if (path.includes('/leads/') || path.includes('/deals/') || path.includes('/contacts/') || path.includes('/companies/')) {
      return '../';
    }
    return './';
  },

  // Renders the collapsible sidebar into a placeholder div
  renderSidebar() {
    const sidebarContainer = document.getElementById('sidebar-placeholder');
    if (!sidebarContainer) return;

    const prefix = this.getRelativePathPrefix();
    const currentPath = window.location.pathname;
    
    const isLeads = currentPath.includes('/leads/');
    const isDeals = currentPath.includes('/deals/');
    const isContacts = currentPath.includes('/contacts/');
    const isCompanies = currentPath.includes('/companies/');

    // Get collapsed state from local storage
    const isCollapsed = localStorage.getItem('crm_sidebar_collapsed') === 'true';
    const sidebar = document.createElement('aside');
    sidebar.className = `crm-sidebar ${isCollapsed ? 'collapsed' : ''}`;
    sidebar.id = 'crm-sidebar-menu';

    sidebar.innerHTML = `
      <div class="sidebar-logo">
        <div class="logo-icon">S</div>
        <span class="logo-text">SalesNest</span>
      </div>
      
      <ul class="sidebar-menu">
        <li class="sidebar-item">
          <a href="#">
            <i class="fa-solid fa-chart-pie"></i>
            <span>Dashboard</span>
          </a>
        </li>
        <li class="sidebar-item ${isCompanies ? 'active' : ''}">
          <a href="${prefix}companies/companies-dashboard.html">
            <i class="fa-solid fa-building"></i>
            <span>Companies</span>
          </a>
        </li>
        <li class="sidebar-item ${isContacts ? 'active' : ''}">
          <a href="${prefix}contacts/contacts-dashboard.html">
            <i class="fa-solid fa-address-book"></i>
            <span>Contacts</span>
          </a>
        </li>
        <li class="sidebar-item ${isLeads ? 'active' : ''}">
          <a href="${prefix}leads/leads-dashboard.html">
            <i class="fa-solid fa-bullseye"></i>
            <span>Leads</span>
          </a>
        </li>
        <li class="sidebar-item ${isDeals ? 'active' : ''}">
          <a href="${prefix}deals/deals-dashboard.html">
            <i class="fa-solid fa-handshake"></i>
            <span>Deals</span>
          </a>
        </li>
        <li class="sidebar-item">
          <a href="#">
            <i class="fa-solid fa-square-check"></i>
            <span>Tasks</span>
          </a>
        </li>
        <li class="sidebar-item">
          <a href="#">
            <i class="fa-solid fa-chart-column"></i>
            <span>Reports</span>
          </a>
        </li>
        <li class="sidebar-item">
          <a href="#">
            <i class="fa-solid fa-gear"></i>
            <span>Settings</span>
          </a>
        </li>
      </ul>
      
      <div class="sidebar-profile">
        <div class="profile-info">
          <div class="profile-avatar">AV</div>
          <div class="profile-details">
            <span class="profile-name">Aman Verma</span>
            <span class="profile-role">Admin</span>
          </div>
        </div>
        <i class="fa-solid fa-chevron-down profile-chevron"></i>
      </div>
    `;

    sidebarContainer.replaceWith(sidebar);
  },

  // Renders the dynamic top navbar into a placeholder
  renderNavbar() {
    const navbarContainer = document.getElementById('navbar-placeholder');
    if (!navbarContainer) return;

    const currentPath = window.location.pathname;
    let moduleName = 'SalesNest';
    let subPage = 'Dashboard';

    if (currentPath.includes('/leads/')) {
      moduleName = 'Leads';
      if (currentPath.includes('create-lead-form.html')) {
        subPage = 'Create Lead';
      } else if (currentPath.includes('lead-details.html')) {
        subPage = 'Lead Details';
      } else {
        subPage = 'Dashboard';
      }
    } else if (currentPath.includes('/deals/')) {
      moduleName = 'Deals';
      subPage = 'Overview';
    } else if (currentPath.includes('/contacts/')) {
      moduleName = 'Contacts';
      subPage = 'Overview';
    } else if (currentPath.includes('/companies/')) {
      moduleName = 'Companies';
      if (currentPath.includes('create-company-form.html')) {
        subPage = 'Create Company';
      } else if (currentPath.includes('company-details.html')) {
        subPage = 'Company Details';
      } else {
        subPage = 'Dashboard';
      }
    }

    const navbar = document.createElement('header');
    navbar.className = 'crm-navbar';
    navbar.innerHTML = `
      <div class="navbar-left">
        <button class="navbar-toggle" id="navbar-toggle-btn" aria-label="Toggle Sidebar">
          <i class="fa-solid fa-bars-staggered"></i>
        </button>
        
        <nav class="breadcrumb-container" aria-label="Breadcrumb">
          <span>Home</span>
          <span class="breadcrumb-sep">/</span>
          <span>${moduleName}</span>
          <span class="breadcrumb-sep">/</span>
          <span class="breadcrumb-active" id="breadcrumb-sub">${subPage}</span>
        </nav>
      </div>
      
      <div class="navbar-right">
        <div class="navbar-search">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input type="text" placeholder="Search anything..." aria-label="Global Search">
        </div>
        
        <button class="navbar-action-btn" aria-label="Notifications">
          <i class="fa-regular fa-bell"></i>
          <span class="navbar-action-badge">3</span>
        </button>
        
        <button class="navbar-action-btn" aria-label="Help">
          <i class="fa-regular fa-circle-question"></i>
        </button>
        
        <div class="user-avatar-trigger" title="Aman Verma (Admin)">AV</div>
      </div>
    `;

    navbarContainer.replaceWith(navbar);
  },

  // Binds event listeners for sidebar toggling and layouts
  bindLayoutEvents() {
    const toggleBtn = document.getElementById('navbar-toggle-btn');
    const sidebar = document.getElementById('crm-sidebar-menu');

    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Handle desktop collapsible vs mobile draw-in drawer drawer menu
        if (window.innerWidth > 768) {
          sidebar.classList.toggle('collapsed');
          const isCollapsed = sidebar.classList.contains('collapsed');
          localStorage.setItem('crm_sidebar_collapsed', isCollapsed);
        } else {
          sidebar.classList.toggle('open');
        }
      });

      // Mobile click-outside layout closure
      document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && sidebar.classList.contains('open')) {
          if (!sidebar.contains(e.target) && e.target !== toggleBtn && !toggleBtn.contains(e.target)) {
            sidebar.classList.remove('open');
          }
        }
      });
    }
  }
};

// Auto boot layout engine on load
document.addEventListener('DOMContentLoaded', () => {
  CRMLayout.renderSidebar();
  CRMLayout.renderNavbar();
  CRMLayout.bindLayoutEvents();
});
