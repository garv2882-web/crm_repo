// Dexnest CRM Client-Side Storage API Engine
// Transitioned to real async REST backend API calls with HttpOnly session cookies

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
  campaign_id?: string;
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
  contact_email?: string;
  contact_mobile?: string;
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
  product_service?: string;
  competitors?: string;
  company_industry?: string;
  created_at: string;
  updated_at?: string;
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

export interface Campaign {
  campaign_id: string;
  campaign_name: string;
  campaign_type: 'Email' | 'Webinar' | 'Social' | 'SEO' | 'Referral' | 'Other';
  status: 'Planning' | 'Active' | 'Completed' | 'Cancelled';
  budget: number;
  actual_cost: number;
  expected_revenue: number;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface SupportCase {
  case_id: string;
  case_number: string;
  subject: string;
  company_id: string;
  company_name?: string;
  assigned_to: string;
  assigned_user_name?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'New' | 'In Progress' | 'On Hold' | 'Resolved' | 'Closed';
  description: string;
  solution_id?: string;
  created_at: string;
  updated_at: string;
}

export interface KBArticle {
  article_id: string;
  title: string;
  content: string;
  category: string;
  status: 'Draft' | 'Published';
  created_by: string;
  creator_name?: string;
  created_at: string;
  updated_at: string;
}

export interface SocialEngagement {
  engagement_id: string;
  lead_id?: string;
  contact_id?: string;
  platform: 'LinkedIn' | 'Twitter' | 'Facebook' | 'Instagram';
  channel_type: 'Social';
  direction: 'Inbound' | 'Outbound';
  content: string;
  sender_handle: string;
  timestamp: string;
}

export interface EmailMessage {
  email_id: string;
  lead_id?: string;
  contact_id?: string;
  channel_type: 'Email';
  subject: string;
  body: string;
  direction: 'Inbound' | 'Outbound';
  sender: string;
  recipient: string;
  status: 'Sent' | 'Opened' | 'Clicked' | 'Failed' | 'Received';
  timestamp: string;
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
  activities: Activity[];
  activityLog: ActivityLogEntry[];
  sessions: SessionHistory[];
  settings: CRMSettings;
  campaigns: Campaign[];
  supportCases: SupportCase[];
  kbArticles: KBArticle[];
  socialEngagements: SocialEngagement[];
  emailMessages: EmailMessage[];
}

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

// REST Request helper
const request = async (url: string, options: RequestInit = {}) => {
  options.credentials = 'include';
  options.headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  const res = await fetch(url, options);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! Status: ${res.status}`);
  }
  return res.json();
};

export const api = {
  // Token dummies to prevent compilation errors
  getToken(): string {
    return '';
  },
  setToken(_token: string) {},

  // Fallbacks to keep Context structure compatibility
  getRawDB(): CRMDatabase {
    return {
      users: [],
      companies: [],
      contacts: [],
      leads: [],
      deals: [],
      tasks: [],
      activities: [],
      activityLog: [],
      sessions: [],
      settings: {
        orgName: 'Dexnest',
        timezone: 'Asia/Kolkata',
        dealStages: [],
        departments: [],
        roleTemplates: []
      },
      campaigns: [],
      supportCases: [],
      kbArticles: [],
      socialEngagements: [],
      emailMessages: []
    };
  },
  saveRawDB(_db: any) {},

  // Auth
  async checkEmail(email: string): Promise<{ exists: boolean; status?: string; user?: User }> {
    return request(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    
    // Log user login session on backend
    const session_id = 'sess_' + Math.random().toString(36).substring(2, 9);
    await request('/api/sessions', {
      method: 'POST',
      body: JSON.stringify({
        session_id,
        user_id: res.user.user_id,
        user_name: res.user.full_name,
        user_email: res.user.email,
        login_time: new Date().toISOString()
      })
    }).catch(err => console.error(err));

    localStorage.setItem('crm_current_session_id', session_id);

    // Log activity
    await request('/api/activity-log', {
      method: 'POST',
      body: JSON.stringify({
        log_id: 'log_' + Math.random().toString(36).substring(2, 9),
        event_type: 'user_login',
        actor_name: res.user.full_name,
        actor_email: res.user.email,
        affected_record: `User Session: ${res.user.full_name}`,
        timestamp: new Date().toISOString(),
        detail_string: `Logged in from IP client. Session ID: ${session_id}`
      })
    }).catch(err => console.error(err));

    apiEvents.emit();
    return { token: 'managed_via_http_only_cookie', user: res.user };
  },

  async signup(data: RegisterRequest): Promise<AuthResponse> {
    const res = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    const session_id = 'sess_' + Math.random().toString(36).substring(2, 9);
    await request('/api/sessions', {
      method: 'POST',
      body: JSON.stringify({
        session_id,
        user_id: res.user.user_id,
        user_name: res.user.full_name,
        user_email: res.user.email,
        login_time: new Date().toISOString()
      })
    }).catch(err => console.error(err));

    localStorage.setItem('crm_current_session_id', session_id);

    await request('/api/activity-log', {
      method: 'POST',
      body: JSON.stringify({
        log_id: 'log_' + Math.random().toString(36).substring(2, 9),
        event_type: 'user_signup',
        actor_name: res.user.full_name,
        actor_email: res.user.email,
        affected_record: `User Account: ${res.user.full_name}`,
        timestamp: new Date().toISOString(),
        detail_string: 'Employee completed onboarding signup.'
      })
    }).catch(err => console.error(err));

    apiEvents.emit();
    return { token: 'managed_via_http_only_cookie', user: res.user };
  },

  async logout(): Promise<void> {
    const sessionId = localStorage.getItem('crm_current_session_id');
    const user = await this.getCurrentUser().then(r => r.user).catch(() => null);

    if (sessionId && user) {
      const logout_time = new Date().toISOString();
      await request(`/api/sessions/${sessionId}`, {
        method: 'PUT',
        body: JSON.stringify({ logout_time })
      }).catch(err => console.error(err));

      await request('/api/activity-log', {
        method: 'POST',
        body: JSON.stringify({
          log_id: 'log_' + Math.random().toString(36).substring(2, 9),
          event_type: 'user_logout',
          actor_name: user.full_name,
          actor_email: user.email,
          affected_record: `User Session: ${user.full_name}`,
          timestamp: logout_time,
          detail_string: `Session ended.`
        })
      }).catch(err => console.error(err));
    }

    await request('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('crm_current_session_id');
    localStorage.removeItem('crm_admin_user');
    apiEvents.emit();
  },

  async getCurrentUser(): Promise<{ user: User }> {
    const res = await request('/api/auth/me');
    return { user: res.user };
  },

  // Users / Employees
  async getUsers(): Promise<User[]> {
    return request('/api/users');
  },

  async getEmployee(id: string): Promise<User> {
    return request(`/api/users/${id}`);
  },

  async createEmployee(data: Partial<User>): Promise<User> {
    const res = await request('/api/users', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    
    // Log activity
    await request('/api/activity-log', {
      method: 'POST',
      body: JSON.stringify({
        log_id: 'log_' + Math.random().toString(36).substring(2, 9),
        event_type: 'employee_added',
        actor_name: 'Admin',
        actor_email: 'admin@dexnest.com',
        affected_record: `Employee: ${res.full_name}`,
        timestamp: new Date().toISOString(),
        detail_string: `Added employee email: ${res.email} with role: ${res.role}`
      })
    }).catch(err => console.error(err));

    apiEvents.emit();
    return res;
  },

  async updateEmployee(id: string, data: Partial<User>): Promise<User> {
    const res = await request(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });

    await request('/api/activity-log', {
      method: 'POST',
      body: JSON.stringify({
        log_id: 'log_' + Math.random().toString(36).substring(2, 9),
        event_type: 'employee_edited',
        actor_name: 'Admin',
        actor_email: 'admin@dexnest.com',
        affected_record: `Employee: ${res.full_name}`,
        timestamp: new Date().toISOString(),
        detail_string: `Updated employee fields.`
      })
    }).catch(err => console.error(err));

    apiEvents.emit();
    return res;
  },

  async deleteEmployee(id: string): Promise<void> {
    await request(`/api/users/${id}`, { method: 'DELETE' });
    apiEvents.emit();
  },

  // Companies
  async getCompanies(): Promise<Company[]> {
    return request('/api/companies');
  },

  async getCompany(id: string): Promise<Company & { contacts: Contact[]; leads: Lead[] }> {
    return request(`/api/companies/${id}`);
  },

  async createCompany(data: Partial<Company>): Promise<Company> {
    const res = await request('/api/companies', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    apiEvents.emit();
    return res;
  },

  async updateCompany(id: string, data: Partial<Company>): Promise<Company> {
    const res = await request(`/api/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    apiEvents.emit();
    return res;
  },

  async deleteCompany(id: string): Promise<void> {
    await request(`/api/companies/${id}`, { method: 'DELETE' });
    apiEvents.emit();
  },

  // Contacts
  async getContacts(): Promise<Contact[]> {
    return request('/api/contacts');
  },

  async getContact(id: string): Promise<Contact> {
    return request(`/api/contacts/${id}`);
  },

  async createContact(data: Partial<Contact>): Promise<Contact> {
    const res = await request('/api/contacts', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    apiEvents.emit();
    return res;
  },

  async updateContact(id: string, data: Partial<Contact>): Promise<Contact> {
    const res = await request(`/api/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    apiEvents.emit();
    return res;
  },

  async deleteContact(id: string): Promise<void> {
    await request(`/api/contacts/${id}`, { method: 'DELETE' });
    apiEvents.emit();
  },

  // Leads
  async getLeads(): Promise<Lead[]> {
    return request('/api/leads');
  },

  async getLead(id: string): Promise<Lead & { tasks: Task[]; deals: Deal[] }> {
    return request(`/api/leads/${id}`);
  },

  async createLead(data: Partial<Lead>): Promise<Lead> {
    const res = await request('/api/leads', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    apiEvents.emit();
    return res;
  },

  async updateLead(id: string, data: Partial<Lead>): Promise<Lead> {
    const res = await request(`/api/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    apiEvents.emit();
    return res;
  },

  async deleteLead(id: string): Promise<void> {
    await request(`/api/leads/${id}`, { method: 'DELETE' });
    apiEvents.emit();
  },

  async convertLeadToDeal(id: string): Promise<Deal> {
    const res = await request(`/api/leads/${id}/convert`, { method: 'POST' });
    apiEvents.emit();
    return res;
  },

  // Deals
  async getDeals(): Promise<Deal[]> {
    return request('/api/deals');
  },

  async getDeal(id: string): Promise<Deal> {
    return request(`/api/deals/${id}`);
  },

  async createDeal(data: Partial<Deal>): Promise<Deal> {
    const res = await request('/api/deals', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    apiEvents.emit();
    return res;
  },

  async updateDeal(id: string, data: Partial<Deal>): Promise<Deal> {
    const res = await request(`/api/deals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    apiEvents.emit();
    return res;
  },

  async deleteDeal(id: string): Promise<void> {
    await request(`/api/deals/${id}`, { method: 'DELETE' });
    apiEvents.emit();
  },

  // Tasks
  async getTasks(): Promise<Task[]> {
    return request('/api/tasks');
  },

  async getTask(id: string): Promise<Task> {
    return request(`/api/tasks/${id}`);
  },

  async createTask(data: Partial<Task>): Promise<Task> {
    const res = await request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    apiEvents.emit();
    return res;
  },

  async updateTask(id: string, data: Partial<Task>): Promise<Task> {
    const res = await request(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    apiEvents.emit();
    return res;
  },

  async deleteTask(id: string): Promise<void> {
    await request(`/api/tasks/${id}`, { method: 'DELETE' });
    apiEvents.emit();
  },

  // Activities
  async getActivities(): Promise<Activity[]> {
    return request('/api/activities');
  },

  // Settings
  async getSettings(): Promise<CRMSettings> {
    return request('/api/settings');
  },

  async updateSettings(data: Partial<CRMSettings>): Promise<CRMSettings> {
    const res = await request('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    apiEvents.emit();
    return res;
  },

  // Sessions
  async getSessions(): Promise<SessionHistory[]> {
    return request('/api/sessions');
  },

  // Activity Log
  async getActivityLog(): Promise<ActivityLogEntry[]> {
    return request('/api/activity-log');
  },

  // Campaigns
  async getCampaigns(): Promise<Campaign[]> {
    return request('/api/campaigns');
  },

  async getCampaign(id: string): Promise<Campaign> {
    return request(`/api/campaigns/${id}`);
  },

  async createCampaign(data: Partial<Campaign>): Promise<Campaign> {
    const res = await request('/api/campaigns', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    apiEvents.emit();
    return res;
  },

  async updateCampaign(id: string, data: Partial<Campaign>): Promise<Campaign> {
    const res = await request(`/api/campaigns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    apiEvents.emit();
    return res;
  },

  async deleteCampaign(id: string): Promise<void> {
    await request(`/api/campaigns/${id}`, { method: 'DELETE' });
    apiEvents.emit();
  },

  // Support Cases
  async getSupportCases(): Promise<SupportCase[]> {
    return request('/api/support-cases');
  },

  async getSupportCase(id: string): Promise<SupportCase> {
    return request(`/api/support-cases/${id}`);
  },

  async createSupportCase(data: Partial<SupportCase>): Promise<SupportCase> {
    const res = await request('/api/support-cases', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    apiEvents.emit();
    return res;
  },

  async updateSupportCase(id: string, data: Partial<SupportCase>): Promise<SupportCase> {
    const res = await request(`/api/support-cases/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    apiEvents.emit();
    return res;
  },

  async deleteSupportCase(id: string): Promise<void> {
    await request(`/api/support-cases/${id}`, { method: 'DELETE' });
    apiEvents.emit();
  },

  // Knowledge Base Articles
  async getKBArticles(): Promise<KBArticle[]> {
    return request('/api/kb-articles');
  },

  async getKBArticle(id: string): Promise<KBArticle> {
    return request(`/api/kb-articles/${id}`);
  },

  async createKBArticle(data: Partial<KBArticle>): Promise<KBArticle> {
    const res = await request('/api/kb-articles', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    apiEvents.emit();
    return res;
  },

  async updateKBArticle(id: string, data: Partial<KBArticle>): Promise<KBArticle> {
    const res = await request(`/api/kb-articles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    apiEvents.emit();
    return res;
  },

  async deleteKBArticle(id: string): Promise<void> {
    await request(`/api/kb-articles/${id}`, { method: 'DELETE' });
    apiEvents.emit();
  },

  // Social Engagements
  async getSocialEngagements(filters?: { lead_id?: string; contact_id?: string }): Promise<SocialEngagement[]> {
    let url = '/api/social-engagements';
    if (filters && filters.lead_id) {
      url += `?lead_id=${encodeURIComponent(filters.lead_id)}`;
    }
    return request(url);
  },

  async createSocialEngagement(data: Partial<SocialEngagement>): Promise<SocialEngagement> {
    const res = await request('/api/social-engagements', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    apiEvents.emit();
    return res;
  },

  // Email Messages
  async getEmailMessages(filters?: { lead_id?: string; contact_id?: string }): Promise<EmailMessage[]> {
    let url = '/api/email-messages';
    if (filters && filters.lead_id) {
      url += `?lead_id=${encodeURIComponent(filters.lead_id)}`;
    }
    return request(url);
  },

  async createEmailMessage(data: Partial<EmailMessage>): Promise<EmailMessage> {
    const res = await request('/api/email-messages', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    apiEvents.emit();
    return res;
  }
};
