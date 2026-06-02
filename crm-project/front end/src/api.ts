const API_BASE_URL = 'http://localhost:5000/api';

export interface User {
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  status: string;
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
  deal_stage: 'Qualification' | 'Discovery' | 'Proposal' | 'Negotiation' | 'Contract' | 'Closed Won' | 'Closed Lost';
  deal_status: 'Open' | 'Won' | 'Lost' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High';
  probability_percentage: number;
  deal_value: number;
  currency: string;
  sales_pipeline: string;
  expected_closing_date?: string;
  notes?: string;
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

// REST Client Helper Methods
export const api = {
  // Users
  async getUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE_URL}/users`);
    return res.json();
  },

  // Companies
  async getCompanies(): Promise<Company[]> {
    const res = await fetch(`${API_BASE_URL}/companies`);
    return res.json();
  },
  async getCompany(id: string): Promise<Company & { contacts: Contact[]; leads: Lead[] }> {
    const res = await fetch(`${API_BASE_URL}/companies/${id}`);
    if (!res.ok) throw new Error('Company not found');
    return res.json();
  },
  async createCompany(data: Partial<Company>): Promise<Company> {
    const res = await fetch(`${API_BASE_URL}/companies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async updateCompany(id: string, data: Partial<Company>): Promise<Company> {
    const res = await fetch(`${API_BASE_URL}/companies/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async deleteCompany(id: string): Promise<void> {
    await fetch(`${API_BASE_URL}/companies/${id}`, { method: 'DELETE' });
  },

  // Contacts
  async getContacts(): Promise<Contact[]> {
    const res = await fetch(`${API_BASE_URL}/contacts`);
    return res.json();
  },
  async getContact(id: string): Promise<Contact> {
    const res = await fetch(`${API_BASE_URL}/contacts/${id}`);
    return res.json();
  },
  async createContact(data: Partial<Contact>): Promise<Contact> {
    const res = await fetch(`${API_BASE_URL}/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async updateContact(id: string, data: Partial<Contact>): Promise<Contact> {
    const res = await fetch(`${API_BASE_URL}/contacts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async deleteContact(id: string): Promise<void> {
    await fetch(`${API_BASE_URL}/contacts/${id}`, { method: 'DELETE' });
  },

  // Leads
  async getLeads(): Promise<Lead[]> {
    const res = await fetch(`${API_BASE_URL}/leads`);
    return res.json();
  },
  async getLead(id: string): Promise<Lead & { tasks: Task[]; deals: Deal[] }> {
    const res = await fetch(`${API_BASE_URL}/leads/${id}`);
    if (!res.ok) throw new Error('Lead not found');
    return res.json();
  },
  async createLead(data: Partial<Lead>): Promise<Lead> {
    const res = await fetch(`${API_BASE_URL}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async updateLead(id: string, data: Partial<Lead>): Promise<Lead> {
    const res = await fetch(`${API_BASE_URL}/leads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async deleteLead(id: string): Promise<void> {
    await fetch(`${API_BASE_URL}/leads/${id}`, { method: 'DELETE' });
  },
  async convertLeadToDeal(id: string): Promise<Deal> {
    const leadDetail = await this.getLead(id);
    const dealData: Partial<Deal> = {
      lead_id: id,
      company_id: leadDetail.company_id,
      contact_id: leadDetail.primary_contact_id,
      deal_name: leadDetail.lead_title + ' Deal',
      deal_owner: leadDetail.assigned_to,
      deal_stage: 'Qualification',
      deal_status: 'Open',
      priority: leadDetail.priority,
      probability_percentage: leadDetail.conversion_probability,
      deal_value: Number(leadDetail.estimated_revenue),
      currency: 'INR',
      sales_pipeline: 'Standard'
    };
    
    // Also update lead status to Converted
    await this.updateLead(id, { lead_status: 'Converted' });
    
    const res = await fetch(`${API_BASE_URL}/deals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dealData)
    });
    return res.json();
  },

  // Deals
  async getDeals(): Promise<Deal[]> {
    const res = await fetch(`${API_BASE_URL}/deals`);
    return res.json();
  },
  async getDeal(id: string): Promise<Deal & { tasks: Task[] }> {
    const res = await fetch(`${API_BASE_URL}/deals/${id}`);
    if (!res.ok) throw new Error('Deal not found');
    return res.json();
  },
  async createDeal(data: Partial<Deal>): Promise<Deal> {
    const res = await fetch(`${API_BASE_URL}/deals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async updateDeal(id: string, data: Partial<Deal>): Promise<Deal> {
    const res = await fetch(`${API_BASE_URL}/deals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async deleteDeal(id: string): Promise<void> {
    await fetch(`${API_BASE_URL}/deals/${id}`, { method: 'DELETE' });
  },

  // Tasks
  async getTasks(filters?: { lead_id?: string; deal_id?: string; company_id?: string }): Promise<Task[]> {
    let url = `${API_BASE_URL}/tasks`;
    if (filters) {
      const q = new URLSearchParams(filters as any).toString();
      if (q) url += `?${q}`;
    }
    const res = await fetch(url);
    return res.json();
  },
  async createTask(data: Partial<Task>): Promise<Task> {
    const res = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async updateTask(id: string, data: Partial<Task>): Promise<Task> {
    const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async deleteTask(id: string): Promise<void> {
    await fetch(`${API_BASE_URL}/tasks/${id}`, { method: 'DELETE' });
  },

  // Activities
  async getActivities(): Promise<Activity[]> {
    const res = await fetch(`${API_BASE_URL}/activities`);
    return res.json();
  },
  async createActivity(text: string, actionType?: string): Promise<Activity> {
    const res = await fetch(`${API_BASE_URL}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, action_type: actionType })
    });
    return res.json();
  }
};
