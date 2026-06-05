// SalesNest CRM Client-Side Storage API Engine
// Fully compatible with existing API signatures but backed by localStorage

// Auth Interfaces
export interface LoginRequest {
  email: string;
  password?: string;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  password?: string;
  role?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface User {
  user_id: string;
  full_name: string;
  email: string;
  role: string; // The template name (e.g., 'Senior Executive')
  status: 'Active' | 'Suspended' | 'Pending';
  designation: string;
  department: string;
  date_added: string;
  last_active: string;
  notes: string;
  custom_permissions?: Record<string, boolean>; // Overridden toggles
  created_at?: string;
}

export interface Company {
  company_id: string;
  company_name: string;
  company_code: string;
  industry: string;
  website: string;
  country: string;
  state: string;
  city: string;
  annual_revenue: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  contact_id: string;
  company_id: string;
  company_name?: string;
  first_name: string;
  last_name: string;
  email: string;
  mobile_number: string;
  linkedin_profile: string;
  job_title: string;
  department: string;
  notes: string;
  created_at: string;
}

export interface Lead {
  lead_id: string;
  company_id: string;
  company_name?: string;
  company_code?: string;
  company_industry?: string;
  company_website?: string;
  primary_contact_id: string;
  contact_first_name?: string;
  contact_last_name?: string;
  contact_email?: string;
  contact_mobile?: string;
  assigned_to: string;
  assigned_user_name?: string;
  created_by: string;
  creator_name?: string;
  lead_title: string;
  lead_source: string;
  lead_status: 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Disqualified';
  priority: 'Low' | 'Medium' | 'High';
  estimated_revenue: number;
  conversion_probability: number;
  campaign_name: string;
  tags: string[] | string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Deal {
  deal_id: string;
  lead_id: string;
  lead_title?: string;
  company_id: string;
  company_name?: string;
  company_code?: string;
  contact_id: string;
  contact_first_name?: string;
  contact_last_name?: string;
  deal_owner: string;
  deal_owner_name?: string;
  deal_name: string;
  deal_stage: string; // Dynamic stage
  deal_status: 'Open' | 'Won' | 'Lost' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High';
  probability_percentage: number;
  deal_value: number;
  currency: string;
  sales_pipeline: string;
  expected_closing_date?: string;
  notes?: string;
  admin_notes?: string; // Private admin notes
  created_at: string;
}

export interface Task {
  task_id: string;
  assigned_to: string;
  assigned_user_name?: string;
  lead_id: string;
  lead_title?: string;
  deal_id: string;
  deal_name?: string;
  company_id: string;
  company_name?: string;
  title: string;
  description: string;
  due_date: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'In Progress' | 'Completed';
  created_at: string;
}

export interface Activity {
  activity_id: string;
  action_type: string;
  text: string;
  created_at: string;
}

export interface ActivityLogEntry {
  log_id: string;
  event_type: string;
  actor_name: string;
  actor_email: string;
  affected_record: string;
  timestamp: string;
  detail_string?: string;
}

export interface SessionHistory {
  session_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  login_time: string;
  logout_time?: string;
  duration?: number; // duration in seconds
}

export interface DealStage {
  id: string;
  name: string;
}

export interface RoleTemplate {
  name: string;
  permissions: Record<string, boolean>;
}

export interface CRMSettings {
  orgName: string;
  timezone: string;
  dealStages: DealStage[];
  departments: string[];
  roleTemplates: RoleTemplate[];
}

export interface CRMDatabase {
  users: User[];
  companies: Company[];
  contacts: Contact[];
  leads: Lead[];
  deals: Deal[];
  tasks: Task[];
  activities: Activity[]; // dashboard display activity
  activityLog: ActivityLogEntry[]; // admin audit log
  sessions: SessionHistory[];
  settings: CRMSettings;
}

// Default role permissions templates
const DEFAULT_ROLE_TEMPLATES: RoleTemplate[] = [
  {
    name: 'Sales Rep — View Only',
    permissions: {
      canViewAllDeals: true,
      canCreateDeals: false,
      canEditOwnDeals: false,
      canEditAllDeals: false,
      canDeleteDeals: false,
      canChangeDealStage: false,
      canViewAllContacts: true,
      canCreateContacts: false,
      canEditContacts: false,
      canDeleteContacts: false,
      canExportContacts: false,
      canViewAllTasks: true,
      canCreateTasks: false,
      canReassignTasks: false,
      canDeleteTasks: false,
      canAccessIntegrationsPage: false,
    }
  },
  {
    name: 'Sales Rep — Standard',
    permissions: {
      canViewAllDeals: true,
      canCreateDeals: true,
      canEditOwnDeals: true,
      canEditAllDeals: false,
      canDeleteDeals: false,
      canChangeDealStage: true,
      canViewAllContacts: true,
      canCreateContacts: true,
      canEditContacts: true,
      canDeleteContacts: false,
      canExportContacts: false,
      canViewAllTasks: true,
      canCreateTasks: true,
      canReassignTasks: false,
      canDeleteTasks: false,
      canAccessIntegrationsPage: false,
    }
  },
  {
    name: 'Senior Executive',
    permissions: {
      canViewAllDeals: true,
      canCreateDeals: true,
      canEditOwnDeals: true,
      canEditAllDeals: true,
      canDeleteDeals: true,
      canChangeDealStage: true,
      canViewAllContacts: true,
      canCreateContacts: true,
      canEditContacts: true,
      canDeleteContacts: true,
      canExportContacts: true,
      canViewAllTasks: true,
      canCreateTasks: true,
      canReassignTasks: true,
      canDeleteTasks: true,
      canAccessIntegrationsPage: true,
    }
  }
];

const DEFAULT_DEAL_STAGES: DealStage[] = [
  { id: 'Qualification', name: 'Qualification' },
  { id: 'Discovery', name: 'Discovery' },
  { id: 'Proposal', name: 'Proposal' },
  { id: 'Negotiation', name: 'Negotiation' },
  { id: 'Contract', name: 'Contract' },
  { id: 'Closed Won', name: 'Closed Won' },
  { id: 'Closed Lost', name: 'Closed Lost' }
];

const INITIAL_DB: CRMDatabase = {
  users: [
    { user_id: 'e1111111-1111-4111-8111-111111111111', full_name: 'Aman Verma', email: 'aman@salesnest.com', role: 'Senior Executive', status: 'Active', designation: 'Sales Director', department: 'Executive', date_added: '2024-01-10T10:00:00Z', last_active: '2026-06-05T10:00:00Z', notes: 'Co-founder and manager.' },
    { user_id: 'e2222222-2222-4222-8222-222222222222', full_name: 'Rahul Sharma', email: 'rahul@salesnest.com', role: 'Sales Rep — Standard', status: 'Active', designation: 'Account Executive', department: 'Sales', date_added: '2024-02-15T10:00:00Z', last_active: '2026-06-05T09:30:00Z', notes: 'Focuses on enterprise accounts.' },
    { user_id: 'e3333333-3333-4333-8333-333333333333', full_name: 'Priya Singh', email: 'priya@salesnest.com', role: 'Sales Rep — View Only', status: 'Active', designation: 'Sales Analyst', department: 'Marketing', date_added: '2024-03-20T10:00:00Z', last_active: '2026-06-04T17:00:00Z', notes: 'Intern performing view-only research.' },
    { user_id: 'e4444444-4444-4444-8444-444444444444', full_name: 'Garv Ranjan', email: 'garv@salesnest.com', role: 'Senior Executive', status: 'Active', designation: 'Head of Sales', department: 'Executive', date_added: '2024-01-01T10:00:00Z', last_active: '2026-06-05T10:15:00Z', notes: 'Primary CRM Admin.' }
  ],
  companies: [
    { company_id: 'a1111111-1111-4111-8111-111111111111', company_name: 'TechNova', company_code: 'TN001', industry: 'IT', website: 'https://technova.com', country: 'India', state: 'Karnataka', city: 'Bangalore', annual_revenue: 120000000, notes: '', created_at: '2024-05-01T10:00:00Z', updated_at: '2024-05-01T10:00:00Z' },
    { company_id: 'a2222222-2222-4222-8222-222222222222', company_name: 'SoftSol Pvt Ltd', company_code: 'SS002', industry: 'Consulting', website: 'https://softsol.com', country: 'India', state: 'Delhi NCR', city: 'Noida', annual_revenue: 85000000, notes: '', created_at: '2024-05-02T10:00:00Z', updated_at: '2024-05-02T10:00:00Z' },
    { company_id: 'a3333333-3333-4333-8333-333333333333', company_name: 'Byte Systems', company_code: 'BS003', industry: 'Software', website: 'https://bytesystems.io', country: 'India', state: 'Maharashtra', city: 'Pune', annual_revenue: 45000000, notes: '', created_at: '2024-05-03T10:00:00Z', updated_at: '2024-05-03T10:00:00Z' },
    { company_id: 'a4444444-4444-4444-8444-444444444444', company_name: 'NextGen Tech', company_code: 'NG004', industry: 'Infrastructure', website: 'https://nextgen.io', country: 'India', state: 'Maharashtra', city: 'Mumbai', annual_revenue: 180000000, notes: '', created_at: '2024-05-04T10:00:00Z', updated_at: '2024-05-04T10:00:00Z' },
    { company_id: 'a5555555-5555-4555-8555-555555555555', company_name: 'Creative Minds', company_code: 'CM005', industry: 'Design Agency', website: 'https://creativeminds.design', country: 'India', state: 'Delhi', city: 'Delhi', annual_revenue: 15000000, notes: '', created_at: '2024-05-05T10:00:00Z', updated_at: '2024-05-05T10:00:00Z' },
    { company_id: 'a6666666-6666-4666-8666-666666666666', company_name: 'Appify Solutions', company_code: 'AS006', industry: 'Mobile Apps', website: 'https://appify.com', country: 'India', state: 'Telangana', city: 'Hyderabad', annual_revenue: 30000000, notes: '', created_at: '2024-05-06T10:00:00Z', updated_at: '2024-05-06T10:00:00Z' },
    { company_id: 'a7777777-7777-4777-8777-777777777777', company_name: 'DataWiz', company_code: 'DW007', industry: 'BI & Analytics', website: 'https://datawiz.ai', country: 'India', state: 'Karnataka', city: 'Bangalore', annual_revenue: 55000000, notes: '', created_at: '2024-05-07T10:00:00Z', updated_at: '2024-05-07T10:00:00Z' },
    { company_id: 'a8888888-8888-4888-8888-888888888888', company_name: 'SecureX', company_code: 'SX008', industry: 'Cybersecurity', website: 'https://securex.co', country: 'India', state: 'Tamil Nadu', city: 'Chennai', annual_revenue: 95000000, notes: '', created_at: '2024-05-08T10:00:00Z', updated_at: '2024-05-08T10:00:00Z' }
  ],
  contacts: [
    { contact_id: 'b1111111-1111-4111-8111-111111111111', company_id: 'a1111111-1111-4111-8111-111111111111', first_name: 'Aman', last_name: 'Verma', email: 'aman@technova.com', mobile_number: '+91 98765 43210', linkedin_profile: 'https://linkedin.com/in/amanverma', job_title: 'Procurement Head', department: 'Purchasing', notes: '', created_at: '2024-05-01T10:10:00Z' },
    { contact_id: 'b2222222-2222-4222-8222-222222222222', company_id: 'a2222222-2222-4222-8222-222222222222', first_name: 'Vikash', last_name: 'Sharma', email: 'vikash@softsol.com', mobile_number: '+91 98765 43211', linkedin_profile: 'https://linkedin.com/in/vikashsharma', job_title: 'CTO', department: 'Technology', notes: '', created_at: '2024-05-02T10:10:00Z' },
    { contact_id: 'b3333333-3333-4333-8333-333333333333', company_id: 'a3333333-3333-4333-8333-333333333333', first_name: 'Shreya', last_name: 'Sen', email: 'shreya@bytesystems.io', mobile_number: '+91 98765 43212', linkedin_profile: 'https://linkedin.com/in/shreyasen', job_title: 'Director of IT', department: 'IT', notes: '', created_at: '2024-05-03T10:10:00Z' },
    { contact_id: 'b4444444-4444-4444-8444-444444444444', company_id: 'a4444444-4444-4444-8444-444444444444', first_name: 'Vikram', last_name: 'Malhotra', email: 'vikram@nextgen.io', mobile_number: '+91 98765 43213', linkedin_profile: 'https://linkedin.com/in/vikrammalhotra', job_title: 'VP Operations', department: 'Operations', notes: '', created_at: '2024-05-04T10:10:00Z' },
    { contact_id: 'b5555555-5555-4555-8555-555555555555', company_id: 'a5555555-5555-4555-8555-555555555555', first_name: 'Sneha', last_name: 'Reddy', email: 'sneha@creativeminds.design', mobile_number: '+91 98765 43214', linkedin_profile: 'https://linkedin.com/in/snehareddy', job_title: 'Creative Director', department: 'Design', notes: '', created_at: '2024-05-05T10:10:00Z' },
    { contact_id: 'b6666666-6666-4666-8666-666666666666', company_id: 'a6666666-6666-4666-8666-666666666666', first_name: 'Kunal', last_name: 'Gupta', email: 'kunal@appify.com', mobile_number: '+91 98765 43215', linkedin_profile: 'https://linkedin.com/in/kunalgupta', job_title: 'Founder & CEO', department: 'Executive', notes: '', created_at: '2024-05-06T10:10:00Z' },
    { contact_id: 'b7777777-7777-4777-8777-777777777777', company_id: 'a7777777-7777-4777-8777-777777777777', first_name: 'Riya', last_name: 'Kapoor', email: 'riya@datawiz.ai', mobile_number: '+91 98765 43216', linkedin_profile: 'https://linkedin.com/in/riyakapoor', job_title: 'Analytics Manager', department: 'Data Science', notes: '', created_at: '2024-05-07T10:10:00Z' },
    { contact_id: 'b8888888-8888-4888-8888-888888888888', company_id: 'a8888888-8888-4888-8888-888888888888', first_name: 'Amit', last_name: 'Patel', email: 'amit@securex.co', mobile_number: '+91 98765 43217', linkedin_profile: 'https://linkedin.com/in/amitpatel', job_title: 'CISO', department: 'Security', notes: '', created_at: '2024-05-08T10:10:00Z' }
  ],
  leads: [
    { lead_id: 'f0000001-0000-4000-8000-000000000001', company_id: 'a1111111-1111-4111-8111-111111111111', primary_contact_id: 'b1111111-1111-4111-8111-111111111111', assigned_to: 'e1111111-1111-4111-8111-111111111111', created_by: 'e4444444-4444-4444-8444-444444444444', lead_title: 'CRM Software Proposal', lead_source: 'LinkedIn', lead_status: 'New', priority: 'High', estimated_revenue: 500000, conversion_probability: 45, campaign_name: 'Q2 Tech Outbound', tags: ['CRM', 'Software'], notes: 'Initial interest shown in custom workflow extensions. Requested proposal for 50 licenses.', created_at: '2024-05-20T10:00:00Z', updated_at: '2024-05-20T10:00:00Z' },
    { lead_id: 'f0000002-0000-4000-8000-000000000002', company_id: 'a2222222-2222-4222-8222-222222222222', primary_contact_id: 'b2222222-2222-4222-8222-222222222222', assigned_to: 'e2222222-2222-4222-8222-222222222222', created_by: 'e1111111-1111-4111-8111-111111111111', lead_title: 'ERP Migration', lead_source: 'Referral', lead_status: 'Qualified', priority: 'Medium', estimated_revenue: 1200000, conversion_probability: 70, campaign_name: 'Partner Networks', tags: ['ERP', 'Migration'], notes: 'Budget is approved. Looking to transition from legacy SAP to cloud platform.', created_at: '2024-05-18T14:30:00Z', updated_at: '2024-05-19T09:15:00Z' },
    { lead_id: 'f0000003-0000-4000-8000-000000000003', company_id: 'a3333333-3333-4333-8333-333333333333', primary_contact_id: 'b3333333-3333-4333-8333-333333333333', assigned_to: 'e3333333-3333-4333-8333-333333333333', created_by: 'e2222222-2222-4222-8222-222222222222', lead_title: 'Cloud Setup', lead_source: 'Website', lead_status: 'Contacted', priority: 'Low', estimated_revenue: 250000, conversion_probability: 30, campaign_name: 'Inbound Search', tags: ['Cloud', 'AWS'], notes: 'Scheduled discovery call. They want basic pricing for database replication.', created_at: '2024-05-17T11:15:00Z', updated_at: '2024-05-17T11:20:00Z' },
    { lead_id: 'f0000004-0000-4000-8000-000000000004', company_id: 'a4444444-4444-4444-8444-444444444444', primary_contact_id: 'b4444444-4444-4444-8444-444444444444', assigned_to: 'e1111111-1111-4111-8111-111111111111', created_by: 'e4444444-4444-4444-8444-444444444444', lead_title: 'IT Infrastructure', lead_source: 'LinkedIn', lead_status: 'New', priority: 'High', estimated_revenue: 875000, conversion_probability: 50, campaign_name: 'Q2 Tech Outbound', tags: ['Infrastructure'], notes: 'C-level team is expanding and requires dedicated bare metal hosting nodes.', created_at: '2024-05-16T16:00:00Z', updated_at: '2024-05-16T16:00:00Z' },
    { lead_id: 'f0000005-0000-4000-8000-000000000005', company_id: 'a5555555-5555-4555-8555-555555555555', primary_contact_id: 'b5555555-5555-4555-8555-555555555555', assigned_to: 'e2222222-2222-4222-8222-222222222222', created_by: 'e3333333-3333-4333-8333-333333333333', lead_title: 'Website Redesign', lead_source: 'Website', lead_status: 'Qualified', priority: 'Medium', estimated_revenue: 320000, conversion_probability: 65, campaign_name: 'Design Showcase', tags: ['Redesign'], notes: 'Needs interactive mockups, full design system, and react code integration. Budget ready.', created_at: '2024-05-15T09:45:00Z', updated_at: '2024-05-16T10:30:00Z' }
  ],
  deals: [
    { deal_id: 'f0000001-0000-4000-8000-000000000001', lead_id: 'f0000002-0000-4000-8000-000000000002', company_id: 'a2222222-2222-4222-8222-222222222222', contact_id: 'b2222222-2222-4222-8222-222222222222', deal_name: 'ERP Migration Deal', deal_owner: 'e2222222-2222-4222-8222-222222222222', deal_stage: 'Proposal', deal_status: 'Open', sales_pipeline: 'Enterprise', priority: 'High', probability_percentage: 70, deal_value: 1200000, currency: 'INR', created_at: '2024-05-19T10:00:00Z' },
    { deal_id: 'f0000002-0000-4000-8000-000000000002', lead_id: 'f0000005-0000-4000-8000-000000000005', company_id: 'a5555555-5555-4555-8555-555555555555', contact_id: 'b5555555-5555-4555-8555-555555555555', deal_name: 'Creative Minds Web Redesign', deal_owner: 'e2222222-2222-4222-8222-222222222222', deal_stage: 'Negotiation', deal_status: 'Open', sales_pipeline: 'SMB', priority: 'Medium', probability_percentage: 80, deal_value: 320000, currency: 'INR', created_at: '2024-05-16T11:00:00Z' }
  ],
  tasks: [
    { task_id: 'task_001', assigned_to: 'e1111111-1111-4111-8111-111111111111', lead_id: '', deal_id: '', company_id: '', title: 'Follow up with TechNova', description: 'Discuss customization choices for CRM licenses.', due_date: '2026-06-07', priority: 'High', status: 'Pending', created_at: '2026-06-05T10:00:00Z' },
    { task_id: 'task_002', assigned_to: 'e2222222-2222-4222-8222-222222222222', lead_id: '', deal_id: '', company_id: '', title: 'Prepare contract draft for SoftSol', due_date: '2026-06-06', priority: 'Medium', status: 'Pending', description: 'Prepare Standard SLA templates.', created_at: '2026-06-05T09:00:00Z' },
    { task_id: 'task_003', assigned_to: 'e3333333-3333-4333-8333-333333333333', lead_id: '', deal_id: '', company_id: '', title: 'Initial introduction call with Cloud Setup', due_date: '2026-06-04', priority: 'Low', status: 'Pending', description: 'Intro call.', created_at: '2026-06-04T10:00:00Z' },
    { task_id: 'task_004', assigned_to: 'e1111111-1111-4111-8111-111111111111', lead_id: '', deal_id: '', company_id: '', title: 'SOC2 Compliance Checklist', due_date: '2026-06-10', priority: 'High', status: 'Completed', description: 'SOC2 audit.', created_at: '2026-06-05T08:00:00Z' }
  ],
  activities: [
    { activity_id: 'act_0000001', action_type: 'create_lead', text: '<span>Aman Verma</span> created lead <span>CRM Software Proposal</span> for TechNova', created_at: '2024-05-20T10:00:00Z' },
    { activity_id: 'act_0000002', action_type: 'status_update', text: '<span>Rahul Sharma</span> qualified lead <span>ERP Migration</span>', created_at: '2024-05-19T09:15:00Z' },
    { activity_id: 'act_0000003', action_type: 'convert_lead', text: '<span>Rahul Sharma</span> converted <span>ERP Migration</span> into a Deal', created_at: '2024-05-19T10:00:00Z' }
  ],
  activityLog: [
    { log_id: 'log_001', event_type: 'lead_created', actor_name: 'Aman Verma', actor_email: 'aman@salesnest.com', affected_record: 'CRM Software Proposal', timestamp: '2024-05-20T10:00:00Z', detail_string: 'Lead created with high priority.' },
    { log_id: 'log_002', event_type: 'lead_edited', actor_name: 'Rahul Sharma', actor_email: 'rahul@salesnest.com', affected_record: 'ERP Migration', timestamp: '2024-05-19T09:15:00Z', detail_string: 'Qualified the lead for ERP proposal.' },
    { log_id: 'log_003', event_type: 'deal_created', actor_name: 'Rahul Sharma', actor_email: 'rahul@salesnest.com', affected_record: 'ERP Migration Deal', timestamp: '2024-05-19T10:00:00Z', detail_string: 'Converted lead ERP Migration into a Deal.' }
  ],
  sessions: [
    { session_id: 'sess_001', user_id: 'e1111111-1111-4111-8111-111111111111', user_name: 'Aman Verma', user_email: 'aman@salesnest.com', login_time: '2026-06-05T08:00:00Z', logout_time: '2026-06-05T10:00:00Z', duration: 7200 },
    { session_id: 'sess_002', user_id: 'e2222222-2222-4222-8222-222222222222', user_name: 'Rahul Sharma', user_email: 'rahul@salesnest.com', login_time: '2026-06-05T09:00:00Z', logout_time: '2026-06-05T09:30:00Z', duration: 1800 }
  ],
  settings: {
    orgName: 'SalesNest Anigravity',
    timezone: 'Asia/Kolkata',
    dealStages: DEFAULT_DEAL_STAGES,
    departments: ['Sales', 'Marketing', 'Engineering', 'HR', 'Executive', 'Operations'],
    roleTemplates: DEFAULT_ROLE_TEMPLATES
  }
};

// State change emitter pub/sub
type Listener = () => void;
const listeners = new Set<Listener>();

export const apiEvents = {
  subscribe(cb: Listener) {
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  },
  emit() {
    listeners.forEach(cb => cb());
  }
};

// Database helper functions
function getDB(): CRMDatabase {
  const data = localStorage.getItem('salesnest_crm_db');
  if (!data) {
    localStorage.setItem('salesnest_crm_db', JSON.stringify(INITIAL_DB));
    return INITIAL_DB;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse database, resetting...', e);
    localStorage.setItem('salesnest_crm_db', JSON.stringify(INITIAL_DB));
    return INITIAL_DB;
  }
}

function saveDB(db: CRMDatabase) {
  localStorage.setItem('salesnest_crm_db', JSON.stringify(db));
  apiEvents.emit();
}

// Generate UUID simple helper
function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// REST Client Helper Methods
export const api = {
  // Database access for Context initialization
  getRawDB(): CRMDatabase {
    return getDB();
  },

  saveRawDB(db: CRMDatabase) {
    saveDB(db);
  },

  // Auth
  async login(data: LoginRequest): Promise<AuthResponse> {
    const db = getDB();
    const user = db.users.find(u => u.email.toLowerCase() === data.email.toLowerCase());
    
    if (!user) {
      throw new Error('User not found in employee directory');
    }
    
    if (user.status === 'Suspended') {
      throw new Error('Your account has been suspended. Contact your administrator.');
    }

    // Set token & login user
    const token = 'mock_jwt_token_' + uuidv4();
    localStorage.setItem('crm_auth_token', token);
    localStorage.setItem('crm_auth_user', JSON.stringify(user));

    // Session tracking
    const session_id = 'sess_' + uuidv4();
    const loginSession: SessionHistory = {
      session_id,
      user_id: user.user_id,
      user_name: user.full_name,
      user_email: user.email,
      login_time: new Date().toISOString()
    };
    db.sessions.push(loginSession);
    localStorage.setItem('crm_current_session_id', session_id);

    // Audit logs
    const log_id = 'log_' + uuidv4();
    const logEntry: ActivityLogEntry = {
      log_id,
      event_type: 'user_login',
      actor_name: user.full_name,
      actor_email: user.email,
      affected_record: `User Session: ${user.full_name}`,
      timestamp: new Date().toISOString(),
      detail_string: `Logged in from IP mock. Session ID: ${session_id}`
    };
    db.activityLog.push(logEntry);

    // Update last active
    user.last_active = new Date().toISOString();
    
    saveDB(db);

    return { token, user };
  },

  async signup(data: RegisterRequest): Promise<AuthResponse> {
    const db = getDB();
    const exists = db.users.find(u => u.email.toLowerCase() === data.email.toLowerCase());
    if (exists) {
      // If employee exists and is pending, activate them on first login
      if (exists.status === 'Pending') {
        exists.status = 'Active';
        exists.full_name = data.full_name;
        exists.last_active = new Date().toISOString();
        
        // Log in
        const token = 'mock_jwt_token_' + uuidv4();
        localStorage.setItem('crm_auth_token', token);
        localStorage.setItem('crm_auth_user', JSON.stringify(exists));

        const session_id = 'sess_' + uuidv4();
        const loginSession: SessionHistory = {
          session_id,
          user_id: exists.user_id,
          user_name: exists.full_name,
          user_email: exists.email,
          login_time: new Date().toISOString()
        };
        db.sessions.push(loginSession);
        localStorage.setItem('crm_current_session_id', session_id);

        const log_id = 'log_' + uuidv4();
        db.activityLog.push({
          log_id,
          event_type: 'user_login',
          actor_name: exists.full_name,
          actor_email: exists.email,
          affected_record: `User Session: ${exists.full_name}`,
          timestamp: new Date().toISOString(),
          detail_string: 'Pending employee completed onboarding login.'
        });

        saveDB(db);
        return { token, user: exists };
      }
      throw new Error('User already registered');
    }

    // Creating a new user
    const newUser: User = {
      user_id: uuidv4(),
      full_name: data.full_name,
      email: data.email,
      role: data.role || 'Sales Rep — Standard',
      status: 'Active',
      designation: 'Sales Representative',
      department: 'Sales',
      date_added: new Date().toISOString(),
      last_active: new Date().toISOString(),
      notes: 'Self-registered user.'
    };
    db.users.push(newUser);

    const token = 'mock_jwt_token_' + uuidv4();
    localStorage.setItem('crm_auth_token', token);
    localStorage.setItem('crm_auth_user', JSON.stringify(newUser));

    const session_id = 'sess_' + uuidv4();
    db.sessions.push({
      session_id,
      user_id: newUser.user_id,
      user_name: newUser.full_name,
      user_email: newUser.email,
      login_time: new Date().toISOString()
    });
    localStorage.setItem('crm_current_session_id', session_id);

    db.activityLog.push({
      log_id: 'log_' + uuidv4(),
      event_type: 'user_signup',
      actor_name: newUser.full_name,
      actor_email: newUser.email,
      affected_record: `User Account: ${newUser.full_name}`,
      timestamp: new Date().toISOString(),
      detail_string: 'User registered account.'
    });

    saveDB(db);
    return { token, user: newUser };
  },

  async logout(): Promise<void> {
    const db = getDB();
    const userStr = localStorage.getItem('crm_auth_user');
    const sessionId = localStorage.getItem('crm_current_session_id');

    if (userStr && sessionId) {
      try {
        const user = JSON.parse(userStr);
        const session = db.sessions.find(s => s.session_id === sessionId);
        if (session) {
          session.logout_time = new Date().toISOString();
          const start = new Date(session.login_time).getTime();
          const end = new Date(session.logout_time).getTime();
          session.duration = Math.round((end - start) / 1000);
        }

        db.activityLog.push({
          log_id: 'log_' + uuidv4(),
          event_type: 'user_logout',
          actor_name: user.full_name,
          actor_email: user.email,
          affected_record: `User Session: ${user.full_name}`,
          timestamp: new Date().toISOString(),
          detail_string: `Session ended. Duration: ${session?.duration || 0} seconds.`
        });
      } catch (e) {
        console.error(e);
      }
    }

    localStorage.removeItem('crm_auth_token');
    localStorage.removeItem('crm_auth_user');
    localStorage.removeItem('crm_current_session_id');

    saveDB(db);
  },

  async getCurrentUser(): Promise<{ user: User }> {
    const userStr = localStorage.getItem('crm_auth_user');
    if (!userStr) throw new Error('Unauthenticated');
    
    // Verify user is still Active in DB
    const db = getDB();
    const parsed = JSON.parse(userStr);
    const user = db.users.find(u => u.user_id === parsed.user_id);
    if (!user) throw new Error('User account not found');
    if (user.status === 'Suspended') throw new Error('Account suspended');
    
    return { user };
  },

  // Users / Employees
  async getUsers(): Promise<User[]> {
    const db = getDB();
    return db.users;
  },

  async getEmployee(id: string): Promise<User> {
    const db = getDB();
    const emp = db.users.find(u => u.user_id === id);
    if (!emp) throw new Error('Employee not found');
    return emp;
  },

  async createEmployee(data: Partial<User>): Promise<User> {
    const db = getDB();
    if (!data.email) throw new Error('Email is required');
    const exists = db.users.find(u => u.email.toLowerCase() === data.email?.toLowerCase());
    if (exists) throw new Error('Email is already registered');

    const newEmp: User = {
      user_id: uuidv4(),
      full_name: data.full_name || 'Unnamed Employee',
      email: data.email,
      role: data.role || 'Sales Rep — Standard',
      status: 'Pending', // Pending until they log in
      designation: data.designation || 'Sales Executive',
      department: data.department || 'Sales',
      date_added: new Date().toISOString(),
      last_active: '',
      notes: data.notes || '',
      custom_permissions: data.custom_permissions || {}
    };

    db.users.push(newEmp);

    // Logging action
    const actor = JSON.parse(localStorage.getItem('crm_auth_user') || '{"full_name":"Admin","email":"admin@anigravity.com"}');
    db.activityLog.push({
      log_id: 'log_' + uuidv4(),
      event_type: 'employee_added',
      actor_name: actor.full_name,
      actor_email: actor.email,
      affected_record: `Employee: ${newEmp.full_name}`,
      timestamp: new Date().toISOString(),
      detail_string: `Added employee email: ${newEmp.email} with role template: ${newEmp.role}`
    });

    saveDB(db);
    return newEmp;
  },

  async updateEmployee(id: string, data: Partial<User>): Promise<User> {
    const db = getDB();
    const index = db.users.findIndex(u => u.user_id === id);
    if (index === -1) throw new Error('Employee not found');

    const oldRole = db.users[index].role;
    const oldStatus = db.users[index].status;
    db.users[index] = {
      ...db.users[index],
      ...data,
      custom_permissions: data.custom_permissions !== undefined 
        ? data.custom_permissions 
        : db.users[index].custom_permissions
    };

    const updated = db.users[index];

    // Log if role, status, etc changed
    const actor = JSON.parse(localStorage.getItem('crm_auth_user') || '{"full_name":"Admin","email":"admin@anigravity.com"}');
    let detail = `Updated employee properties: ${Object.keys(data).join(', ')}`;
    if (data.role && data.role !== oldRole) {
      detail += `. Role changed from ${oldRole} to ${data.role}.`;
    }
    if (data.status && data.status !== oldStatus) {
      detail += `. Status changed from ${oldStatus} to ${data.status}.`;
    }

    db.activityLog.push({
      log_id: 'log_' + uuidv4(),
      event_type: 'employee_edited',
      actor_name: actor.full_name,
      actor_email: actor.email,
      affected_record: `Employee: ${updated.full_name}`,
      timestamp: new Date().toISOString(),
      detail_string: detail
    });

    saveDB(db);
    return updated;
  },

  async deleteEmployee(id: string): Promise<void> {
    const db = getDB();
    const emp = db.users.find(u => u.user_id === id);
    if (!emp) throw new Error('Employee not found');

    db.users = db.users.filter(u => u.user_id !== id);

    const actor = JSON.parse(localStorage.getItem('crm_auth_user') || '{"full_name":"Admin","email":"admin@anigravity.com"}');
    db.activityLog.push({
      log_id: 'log_' + uuidv4(),
      event_type: 'employee_deleted',
      actor_name: actor.full_name,
      actor_email: actor.email,
      affected_record: `Employee: ${emp.full_name}`,
      timestamp: new Date().toISOString(),
      detail_string: `Removed employee account. Email was: ${emp.email}`
    });

    saveDB(db);
  },

  // Companies
  async getCompanies(): Promise<Company[]> {
    const db = getDB();
    return db.companies;
  },

  async getCompany(id: string): Promise<Company & { contacts: Contact[]; leads: Lead[] }> {
    const db = getDB();
    const company = db.companies.find(c => c.company_id === id);
    if (!company) throw new Error('Company not found');

    const contacts = db.contacts.filter(c => c.company_id === id);
    const leads = db.leads.filter(l => l.company_id === id);

    return { ...company, contacts, leads };
  },

  async createCompany(data: Partial<Company>): Promise<Company> {
    const db = getDB();
    const newComp: Company = {
      company_id: uuidv4(),
      company_name: data.company_name || 'Unnamed Company',
      company_code: data.company_code || 'COMP' + Math.floor(Math.random() * 1000),
      industry: data.industry || 'Other',
      website: data.website || '',
      country: data.country || 'India',
      state: data.state || '',
      city: data.city || '',
      annual_revenue: Number(data.annual_revenue) || 0,
      notes: data.notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    db.companies.push(newComp);

    const actor = JSON.parse(localStorage.getItem('crm_auth_user') || '{"full_name":"Employee","email":"emp@salesnest.com"}');
    db.activityLog.push({
      log_id: 'log_' + uuidv4(),
      event_type: 'company_created',
      actor_name: actor.full_name,
      actor_email: actor.email,
      affected_record: `Company: ${newComp.company_name}`,
      timestamp: new Date().toISOString(),
      detail_string: `Created company with code ${newComp.company_code}`
    });

    saveDB(db);
    return newComp;
  },

  async updateCompany(id: string, data: Partial<Company>): Promise<Company> {
    const db = getDB();
    const idx = db.companies.findIndex(c => c.company_id === id);
    if (idx === -1) throw new Error('Company not found');

    db.companies[idx] = {
      ...db.companies[idx],
      ...data,
      updated_at: new Date().toISOString()
    };

    const updated = db.companies[idx];

    const actor = JSON.parse(localStorage.getItem('crm_auth_user') || '{"full_name":"Employee","email":"emp@salesnest.com"}');
    db.activityLog.push({
      log_id: 'log_' + uuidv4(),
      event_type: 'company_edited',
      actor_name: actor.full_name,
      actor_email: actor.email,
      affected_record: `Company: ${updated.company_name}`,
      timestamp: new Date().toISOString(),
      detail_string: `Updated company details.`
    });

    saveDB(db);
    return updated;
  },

  async deleteCompany(id: string): Promise<void> {
    const db = getDB();
    const company = db.companies.find(c => c.company_id === id);
    if (!company) throw new Error('Company not found');

    db.companies = db.companies.filter(c => c.company_id !== id);

    const actor = JSON.parse(localStorage.getItem('crm_auth_user') || '{"full_name":"Employee","email":"emp@salesnest.com"}');
    db.activityLog.push({
      log_id: 'log_' + uuidv4(),
      event_type: 'company_deleted',
      actor_name: actor.full_name,
      actor_email: actor.email,
      affected_record: `Company: ${company.company_name}`,
      timestamp: new Date().toISOString(),
      detail_string: `Deleted company and broke relationships.`
    });

    saveDB(db);
  },

  // Contacts
  async getContacts(): Promise<Contact[]> {
    const db = getDB();
    return db.contacts.map(contact => {
      const company = db.companies.find(c => c.company_id === contact.company_id);
      return {
        ...contact,
        company_name: company ? company.company_name : ''
      };
    });
  },

  async getContact(id: string): Promise<Contact> {
    const db = getDB();
    const contact = db.contacts.find(c => c.contact_id === id);
    if (!contact) throw new Error('Contact not found');

    const company = db.companies.find(c => c.company_id === contact.company_id);
    return {
      ...contact,
      company_name: company ? company.company_name : ''
    };
  },

  async createContact(data: Partial<Contact>): Promise<Contact> {
    const db = getDB();
    const newContact: Contact = {
      contact_id: uuidv4(),
      company_id: data.company_id || '',
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      email: data.email || '',
      mobile_number: data.mobile_number || '',
      linkedin_profile: data.linkedin_profile || '',
      job_title: data.job_title || '',
      department: data.department || '',
      notes: data.notes || '',
      created_at: new Date().toISOString()
    };

    db.contacts.push(newContact);

    const actor = JSON.parse(localStorage.getItem('crm_auth_user') || '{"full_name":"Employee","email":"emp@salesnest.com"}');
    db.activityLog.push({
      log_id: 'log_' + uuidv4(),
      event_type: 'contact_created',
      actor_name: actor.full_name,
      actor_email: actor.email,
      affected_record: `Contact: ${newContact.first_name} ${newContact.last_name}`,
      timestamp: new Date().toISOString(),
      detail_string: `Created contact linked with company ID ${newContact.company_id}`
    });

    saveDB(db);
    return newContact;
  },

  async updateContact(id: string, data: Partial<Contact>): Promise<Contact> {
    const db = getDB();
    const idx = db.contacts.findIndex(c => c.contact_id === id);
    if (idx === -1) throw new Error('Contact not found');

    db.contacts[idx] = {
      ...db.contacts[idx],
      ...data
    };

    const updated = db.contacts[idx];

    const actor = JSON.parse(localStorage.getItem('crm_auth_user') || '{"full_name":"Employee","email":"emp@salesnest.com"}');
    db.activityLog.push({
      log_id: 'log_' + uuidv4(),
      event_type: 'contact_edited',
      actor_name: actor.full_name,
      actor_email: actor.email,
      affected_record: `Contact: ${updated.first_name} ${updated.last_name}`,
      timestamp: new Date().toISOString(),
      detail_string: `Edited contact details.`
    });

    saveDB(db);
    return updated;
  },

  async deleteContact(id: string): Promise<void> {
    const db = getDB();
    const contact = db.contacts.find(c => c.contact_id === id);
    if (!contact) throw new Error('Contact not found');

    db.contacts = db.contacts.filter(c => c.contact_id !== id);

    const actor = JSON.parse(localStorage.getItem('crm_auth_user') || '{"full_name":"Employee","email":"emp@salesnest.com"}');
    db.activityLog.push({
      log_id: 'log_' + uuidv4(),
      event_type: 'contact_deleted',
      actor_name: actor.full_name,
      actor_email: actor.email,
      affected_record: `Contact: ${contact.first_name} ${contact.last_name}`,
      timestamp: new Date().toISOString(),
      detail_string: `Deleted contact.`
    });

    saveDB(db);
  },

  // Leads
  async getLeads(): Promise<Lead[]> {
    const db = getDB();
    return db.leads.map(lead => {
      const company = db.companies.find(c => c.company_id === lead.company_id);
      const assigned = db.users.find(u => u.user_id === lead.assigned_to);
      const creator = db.users.find(u => u.user_id === lead.created_by);
      const contact = db.contacts.find(c => c.contact_id === lead.primary_contact_id);

      return {
        ...lead,
        company_name: company?.company_name || '',
        company_code: company?.company_code || '',
        company_industry: company?.industry || '',
        company_website: company?.website || '',
        contact_first_name: contact?.first_name || '',
        contact_last_name: contact?.last_name || '',
        contact_email: contact?.email || '',
        contact_mobile: contact?.mobile_number || '',
        assigned_user_name: assigned?.full_name || '',
        creator_name: creator?.full_name || ''
      };
    });
  },

  async getLead(id: string): Promise<Lead & { tasks: Task[]; deals: Deal[] }> {
    const db = getDB();
    const lead = db.leads.find(l => l.lead_id === id);
    if (!lead) throw new Error('Lead not found');

    const company = db.companies.find(c => c.company_id === lead.company_id);
    const assigned = db.users.find(u => u.user_id === lead.assigned_to);
    const creator = db.users.find(u => u.user_id === lead.created_by);
    const contact = db.contacts.find(c => c.contact_id === lead.primary_contact_id);

    const fullLead = {
      ...lead,
      company_name: company?.company_name || '',
      company_code: company?.company_code || '',
      company_industry: company?.industry || '',
      company_website: company?.website || '',
      contact_first_name: contact?.first_name || '',
      contact_last_name: contact?.last_name || '',
      contact_email: contact?.email || '',
      contact_mobile: contact?.mobile_number || '',
      assigned_user_name: assigned?.full_name || '',
      creator_name: creator?.full_name || ''
    };

    const tasks = db.tasks.filter(t => t.lead_id === id);
    const deals = db.deals.filter(d => d.lead_id === id);

    return { ...fullLead, tasks, deals };
  },

  async createLead(data: Partial<Lead>): Promise<Lead> {
    const db = getDB();
    const actor = JSON.parse(localStorage.getItem('crm_auth_user') || '{"full_name":"Employee","email":"emp@salesnest.com","user_id":"e1111111-1111-4111-8111-111111111111"}');

    const newLead: Lead = {
      lead_id: uuidv4(),
      company_id: data.company_id || '',
      primary_contact_id: data.primary_contact_id || '',
      assigned_to: data.assigned_to || actor.user_id,
      created_by: actor.user_id,
      lead_title: data.lead_title || 'Unnamed Lead',
      lead_source: data.lead_source || 'Website',
      lead_status: data.lead_status || 'New',
      priority: data.priority || 'Medium',
      estimated_revenue: Number(data.estimated_revenue) || 0,
      conversion_probability: Number(data.conversion_probability) || 50,
      campaign_name: data.campaign_name || '',
      tags: data.tags || [],
      notes: data.notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    db.leads.push(newLead);

    // Activity log entry (dashboard)
    const company = db.companies.find(c => c.company_id === newLead.company_id);
    const text = `<span>${actor.full_name}</span> created lead <span>${newLead.lead_title}</span>${company ? ` for ${company.company_name}` : ''}`;
    db.activities.push({
      activity_id: 'act_' + uuidv4(),
      action_type: 'create_lead',
      text,
      created_at: new Date().toISOString()
    });

    // Admin audit
    db.activityLog.push({
      log_id: 'log_' + uuidv4(),
      event_type: 'lead_created',
      actor_name: actor.full_name,
      actor_email: actor.email,
      affected_record: `Lead: ${newLead.lead_title}`,
      timestamp: new Date().toISOString(),
      detail_string: `Created lead with estimated revenue: INR ${newLead.estimated_revenue}`
    });

    saveDB(db);
    return newLead;
  },

  async updateLead(id: string, data: Partial<Lead>): Promise<Lead> {
    const db = getDB();
    const idx = db.leads.findIndex(l => l.lead_id === id);
    if (idx === -1) throw new Error('Lead not found');

    const oldStatus = db.leads[idx].lead_status;

    db.leads[idx] = {
      ...db.leads[idx],
      ...data,
      updated_at: new Date().toISOString()
    };

    const updated = db.leads[idx];

    const actor = JSON.parse(localStorage.getItem('crm_auth_user') || '{"full_name":"Employee","email":"emp@salesnest.com"}');
    
    // Status update log
    if (data.lead_status && data.lead_status !== oldStatus) {
      db.activities.push({
        activity_id: 'act_' + uuidv4(),
        action_type: 'status_update',
        text: `<span>${actor.full_name}</span> updated lead <span>${updated.lead_title}</span> status to ${updated.lead_status}`,
        created_at: new Date().toISOString()
      });
    }

    db.activityLog.push({
      log_id: 'log_' + uuidv4(),
      event_type: 'lead_edited',
      actor_name: actor.full_name,
      actor_email: actor.email,
      affected_record: `Lead: ${updated.lead_title}`,
      timestamp: new Date().toISOString(),
      detail_string: `Updated lead details. Status: ${updated.lead_status}`
    });

    saveDB(db);
    return updated;
  },

  async deleteLead(id: string): Promise<void> {
    const db = getDB();
    const lead = db.leads.find(l => l.lead_id === id);
    if (!lead) throw new Error('Lead not found');

    db.leads = db.leads.filter(l => l.lead_id !== id);

    const actor = JSON.parse(localStorage.getItem('crm_auth_user') || '{"full_name":"Employee","email":"emp@salesnest.com"}');
    db.activityLog.push({
      log_id: 'log_' + uuidv4(),
      event_type: 'lead_deleted',
      actor_name: actor.full_name,
      actor_email: actor.email,
      affected_record: `Lead: ${lead.lead_title}`,
      timestamp: new Date().toISOString(),
      detail_string: `Deleted lead record.`
    });

    saveDB(db);
  },

  async convertLeadToDeal(id: string): Promise<Deal> {
    const db = getDB();
    const lead = db.leads.find(l => l.lead_id === id);
    if (!lead) throw new Error('Lead not found');

    // Update lead status
    lead.lead_status = 'Converted';
    lead.updated_at = new Date().toISOString();

    const dealData: Deal = {
      deal_id: uuidv4(),
      lead_id: id,
      company_id: lead.company_id,
      contact_id: lead.primary_contact_id,
      deal_name: lead.lead_title + ' Deal',
      deal_owner: lead.assigned_to,
      deal_stage: 'Qualification',
      deal_status: 'Open',
      priority: lead.priority,
      probability_percentage: lead.conversion_probability,
      deal_value: Number(lead.estimated_revenue),
      currency: 'INR',
      sales_pipeline: 'Standard',
      created_at: new Date().toISOString()
    };

    db.deals.push(dealData);

    const actor = JSON.parse(localStorage.getItem('crm_auth_user') || '{"full_name":"Employee","email":"emp@salesnest.com"}');
    
    // Dashboard activity
    db.activities.push({
      activity_id: 'act_' + uuidv4(),
      action_type: 'convert_lead',
      text: `<span>${actor.full_name}</span> converted lead <span>${lead.lead_title}</span> into a Deal`,
      created_at: new Date().toISOString()
    });

    // Admin audit
    db.activityLog.push({
      log_id: 'log_' + uuidv4(),
      event_type: 'deal_created',
      actor_name: actor.full_name,
      actor_email: actor.email,
      affected_record: `Deal: ${dealData.deal_name}`,
      timestamp: new Date().toISOString(),
      detail_string: `Converted from lead ${lead.lead_title}. Value: INR ${dealData.deal_value}`
    });

    saveDB(db);
    return dealData;
  },

  // Deals
  async getDeals(): Promise<Deal[]> {
    const db = getDB();
    return db.deals.map(deal => {
      const company = db.companies.find(c => c.company_id === deal.company_id);
      const contact = db.contacts.find(c => c.contact_id === deal.contact_id);
      const owner = db.users.find(u => u.user_id === deal.deal_owner);
      const lead = db.leads.find(l => l.lead_id === deal.lead_id);

      return {
        ...deal,
        company_name: company?.company_name || '',
        company_code: company?.company_code || '',
        contact_first_name: contact?.first_name || '',
        contact_last_name: contact?.last_name || '',
        deal_owner_name: owner?.full_name || '',
        lead_title: lead?.lead_title || ''
      };
    });
  },

  async getDeal(id: string): Promise<Deal & { tasks: Task[] }> {
    const db = getDB();
    const deal = db.deals.find(d => d.deal_id === id);
    if (!deal) throw new Error('Deal not found');

    const company = db.companies.find(c => c.company_id === deal.company_id);
    const contact = db.contacts.find(c => c.contact_id === deal.contact_id);
    const owner = db.users.find(u => u.user_id === deal.deal_owner);
    const lead = db.leads.find(l => l.lead_id === deal.lead_id);

    const fullDeal = {
      ...deal,
      company_name: company?.company_name || '',
      company_code: company?.company_code || '',
      contact_first_name: contact?.first_name || '',
      contact_last_name: contact?.last_name || '',
      deal_owner_name: owner?.full_name || '',
      lead_title: lead?.lead_title || ''
    };

    const tasks = db.tasks.filter(t => t.deal_id === id);

    return { ...fullDeal, tasks };
  },

  async createDeal(data: Partial<Deal>): Promise<Deal> {
    const db = getDB();
    const actor = JSON.parse(localStorage.getItem('crm_auth_user') || '{"full_name":"Employee","email":"emp@salesnest.com","user_id":"e1111111-1111-4111-8111-111111111111"}');

    const newDeal: Deal = {
      deal_id: uuidv4(),
      lead_id: data.lead_id || '',
      company_id: data.company_id || '',
      contact_id: data.contact_id || '',
      deal_owner: data.deal_owner || actor.user_id,
      deal_name: data.deal_name || 'Unnamed Deal',
      deal_stage: data.deal_stage || 'Qualification',
      deal_status: data.deal_status || 'Open',
      priority: data.priority || 'Medium',
      probability_percentage: Number(data.probability_percentage) || 50,
      deal_value: Number(data.deal_value) || 0,
      currency: data.currency || 'INR',
      sales_pipeline: data.sales_pipeline || 'Standard',
      expected_closing_date: data.expected_closing_date,
      notes: data.notes || '',
      admin_notes: data.admin_notes || '',
      created_at: new Date().toISOString()
    };

    db.deals.push(newDeal);

    db.activityLog.push({
      log_id: 'log_' + uuidv4(),
      event_type: 'deal_created',
      actor_name: actor.full_name,
      actor_email: actor.email,
      affected_record: `Deal: ${newDeal.deal_name}`,
      timestamp: new Date().toISOString(),
      detail_string: `Created deal directly. Value: INR ${newDeal.deal_value}`
    });

    saveDB(db);
    return newDeal;
  },

  async updateDeal(id: string, data: Partial<Deal>): Promise<Deal> {
    const db = getDB();
    const idx = db.deals.findIndex(d => d.deal_id === id);
    if (idx === -1) throw new Error('Deal not found');

    const oldStage = db.deals[idx].deal_stage;
    const oldOwner = db.deals[idx].deal_owner;

    db.deals[idx] = {
      ...db.deals[idx],
      ...data
    };

    const updated = db.deals[idx];

    const actor = JSON.parse(localStorage.getItem('crm_auth_user') || '{"full_name":"Employee","email":"emp@salesnest.com"}');
    
    // Audit logs
    let detail = `Updated deal properties.`;
    if (data.deal_stage && data.deal_stage !== oldStage) {
      detail += ` Stage changed from ${oldStage} to ${data.deal_stage}.`;
      
      // Save dashboard display activity
      db.activities.push({
        activity_id: 'act_' + uuidv4(),
        action_type: 'stage_update',
        text: `<span>${actor.full_name}</span> moved deal <span>${updated.deal_name}</span> to stage <span>${updated.deal_stage}</span>`,
        created_at: new Date().toISOString()
      });
    }

    if (data.deal_owner && data.deal_owner !== oldOwner) {
      const prevOwnerObj = db.users.find(u => u.user_id === oldOwner);
      const newOwnerObj = db.users.find(u => u.user_id === data.deal_owner);
      detail += ` Reassigned owner from ${prevOwnerObj?.full_name || oldOwner} to ${newOwnerObj?.full_name || data.deal_owner}.`;
    }

    db.activityLog.push({
      log_id: 'log_' + uuidv4(),
      event_type: 'deal_edited',
      actor_name: actor.full_name,
      actor_email: actor.email,
      affected_record: `Deal: ${updated.deal_name}`,
      timestamp: new Date().toISOString(),
      detail_string: detail
    });

    saveDB(db);
    return updated;
  },

  async deleteDeal(id: string): Promise<void> {
    const db = getDB();
    const deal = db.deals.find(d => d.deal_id === id);
    if (!deal) throw new Error('Deal not found');

    db.deals = db.deals.filter(d => d.deal_id !== id);

    const actor = JSON.parse(localStorage.getItem('crm_auth_user') || '{"full_name":"Employee","email":"emp@salesnest.com"}');
    db.activityLog.push({
      log_id: 'log_' + uuidv4(),
      event_type: 'deal_deleted',
      actor_name: actor.full_name,
      actor_email: actor.email,
      affected_record: `Deal: ${deal.deal_name}`,
      timestamp: new Date().toISOString(),
      detail_string: `Deleted deal record.`
    });

    saveDB(db);
  },

  // Tasks
  async getTasks(filters?: { lead_id?: string; deal_id?: string; company_id?: string }): Promise<Task[]> {
    const db = getDB();
    let tasks = db.tasks.map(task => {
      const assigned = db.users.find(u => u.user_id === task.assigned_to);
      const lead = db.leads.find(l => l.lead_id === task.lead_id);
      const deal = db.deals.find(d => d.deal_id === task.deal_id);
      const company = db.companies.find(c => c.company_id === task.company_id);

      return {
        ...task,
        assigned_user_name: assigned?.full_name || '',
        lead_title: lead?.lead_title || '',
        deal_name: deal?.deal_name || '',
        company_name: company?.company_name || ''
      };
    });

    if (filters) {
      if (filters.lead_id) tasks = tasks.filter(t => t.lead_id === filters.lead_id);
      if (filters.deal_id) tasks = tasks.filter(t => t.deal_id === filters.deal_id);
      if (filters.company_id) tasks = tasks.filter(t => t.company_id === filters.company_id);
    }

    return tasks;
  },

  async createTask(data: Partial<Task>): Promise<Task> {
    const db = getDB();
    const actor = JSON.parse(localStorage.getItem('crm_auth_user') || '{"full_name":"Employee","email":"emp@salesnest.com","user_id":"e1111111-1111-4111-8111-111111111111"}');

    const newTask: Task = {
      task_id: 'task_' + uuidv4().substring(0, 8),
      assigned_to: data.assigned_to || actor.user_id,
      lead_id: data.lead_id || '',
      deal_id: data.deal_id || '',
      company_id: data.company_id || '',
      title: data.title || 'Unnamed Task',
      description: data.description || '',
      due_date: data.due_date || new Date().toISOString().split('T')[0],
      priority: data.priority || 'Medium',
      status: data.status || 'Pending',
      created_at: new Date().toISOString()
    };

    db.tasks.push(newTask);

    // Dashboard activity
    db.activities.push({
      activity_id: 'act_' + uuidv4(),
      action_type: 'create_task',
      text: `<span>${actor.full_name}</span> created task <span>${newTask.title}</span>`,
      created_at: new Date().toISOString()
    });

    // Admin audit
    db.activityLog.push({
      log_id: 'log_' + uuidv4(),
      event_type: 'task_created',
      actor_name: actor.full_name,
      actor_email: actor.email,
      affected_record: `Task: ${newTask.title}`,
      timestamp: new Date().toISOString(),
      detail_string: `Created task. Due: ${newTask.due_date}, Priority: ${newTask.priority}`
    });

    saveDB(db);
    return newTask;
  },

  async updateTask(id: string, data: Partial<Task>): Promise<Task> {
    const db = getDB();
    const idx = db.tasks.findIndex(t => t.task_id === id);
    if (idx === -1) throw new Error('Task not found');

    const oldStatus = db.tasks[idx].status;

    db.tasks[idx] = {
      ...db.tasks[idx],
      ...data
    };

    const updated = db.tasks[idx];

    const actor = JSON.parse(localStorage.getItem('crm_auth_user') || '{"full_name":"Employee","email":"emp@salesnest.com"}');
    
    // Status update log
    if (data.status && data.status !== oldStatus) {
      if (data.status === 'Completed') {
        db.activities.push({
          activity_id: 'act_' + uuidv4(),
          action_type: 'complete_task',
          text: `<span>${actor.full_name}</span> completed task <span>${updated.title}</span>`,
          created_at: new Date().toISOString()
        });
      }
    }

    db.activityLog.push({
      log_id: 'log_' + uuidv4(),
      event_type: 'task_edited',
      actor_name: actor.full_name,
      actor_email: actor.email,
      affected_record: `Task: ${updated.title}`,
      timestamp: new Date().toISOString(),
      detail_string: `Updated task. Status: ${updated.status}`
    });

    saveDB(db);
    return updated;
  },

  async deleteTask(id: string): Promise<void> {
    const db = getDB();
    const task = db.tasks.find(t => t.task_id === id);
    if (!task) throw new Error('Task not found');

    db.tasks = db.tasks.filter(t => t.task_id !== id);

    const actor = JSON.parse(localStorage.getItem('crm_auth_user') || '{"full_name":"Employee","email":"emp@salesnest.com"}');
    db.activityLog.push({
      log_id: 'log_' + uuidv4(),
      event_type: 'task_deleted',
      actor_name: actor.full_name,
      actor_email: actor.email,
      affected_record: `Task: ${task.title}`,
      timestamp: new Date().toISOString(),
      detail_string: `Deleted task record.`
    });

    saveDB(db);
  },

  // Activities
  async getActivities(): Promise<Activity[]> {
    const db = getDB();
    // Return sorted by created_at desc
    return [...db.activities].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async createActivity(text: string, actionType?: string): Promise<Activity> {
    const db = getDB();
    const newAct: Activity = {
      activity_id: 'act_' + uuidv4(),
      action_type: actionType || 'custom',
      text,
      created_at: new Date().toISOString()
    };
    db.activities.push(newAct);
    saveDB(db);
    return newAct;
  },

  // Admin Logs
  getActivityLog(): ActivityLogEntry[] {
    const db = getDB();
    return [...db.activityLog].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  getSessions(): SessionHistory[] {
    const db = getDB();
    return [...db.sessions].sort((a, b) => new Date(b.login_time).getTime() - new Date(a.login_time).getTime());
  },

  // Settings Configurations
  getSettings(): CRMSettings {
    const db = getDB();
    return db.settings;
  },

  updateSettings(settings: Partial<CRMSettings>) {
    const db = getDB();
    db.settings = {
      ...db.settings,
      ...settings
    };

    const actor = JSON.parse(localStorage.getItem('crm_auth_user') || '{"full_name":"Admin","email":"admin@anigravity.com"}');
    db.activityLog.push({
      log_id: 'log_' + uuidv4(),
      event_type: 'settings_changed',
      actor_name: actor.full_name,
      actor_email: actor.email,
      affected_record: 'System Settings',
      timestamp: new Date().toISOString(),
      detail_string: `Updated configurations: ${Object.keys(settings).join(', ')}`
    });

    saveDB(db);
  }
};
