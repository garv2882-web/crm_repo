import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, type Lead, type Company, type Contact, type User } from '../../api';
import { Plus, Search, Filter, RefreshCw, Eye, Trash2 } from 'lucide-react';

export default function LeadsPage() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const leadsPerPage = 8;

  // Create Modal state
  const [showModal, setShowModal] = useState(false);
  const [newLead, setNewLead] = useState({
    lead_title: '',
    company_id: '',
    primary_contact_id: '',
    assigned_to: '',
    lead_source: 'Website',
    lead_status: 'New' as any,
    priority: 'Medium' as any,
    estimated_revenue: '',
    conversion_probability: '50',
    campaign_name: '',
    notes: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [leadsData, companiesData, contactsData, usersData] = await Promise.all([
        api.getLeads(),
        api.getCompanies(),
        api.getContacts(),
        api.getUsers()
      ]);
      setLeads(leadsData);
      setCompanies(companiesData);
      setContacts(contactsData);
      setUsers(usersData);
    } catch (err) {
      console.error('Error fetching leads workspace data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter and Search logic
  const filteredLeads = leads.filter(l => {
    const matchesSearch = l.lead_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.company_name && l.company_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (l.contact_first_name && l.contact_first_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'All' || l.lead_status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || l.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredLeads.length / leadsPerPage) || 1;
  const indexOfLastLead = currentPage * leadsPerPage;
  const indexOfFirstLead = indexOfLastLead - leadsPerPage;
  const currentLeads = filteredLeads.slice(indexOfFirstLead, indexOfLastLead);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Set created_by as the first admin/user found (u1111111-1111-4111-8111-111111111111 or default)
      const defaultAdmin = users.find(u => u.role === 'Admin')?.user_id || users[0]?.user_id;
      const dataToSubmit = {
        ...newLead,
        estimated_revenue: parseFloat(newLead.estimated_revenue) || 0,
        conversion_probability: parseFloat(newLead.conversion_probability) || 0,
        created_by: defaultAdmin
      };
      
      await api.createLead(dataToSubmit);
      setShowModal(false);
      // Reset form
      setNewLead({
        lead_title: '',
        company_id: '',
        primary_contact_id: '',
        assigned_to: '',
        lead_source: 'Website',
        lead_status: 'New',
        priority: 'Medium',
        estimated_revenue: '',
        conversion_probability: '50',
        campaign_name: '',
        notes: ''
      });
      fetchData(); // Refresh list
    } catch (err) {
      console.error('Error creating lead:', err);
    }
  };

  const handleDeleteLead = async (leadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this lead?')) {
      try {
        await api.deleteLead(leadId);
        fetchData();
      } catch (err) {
        console.error('Error deleting lead:', err);
      }
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'New': return 'badge-status-new';
      case 'Contacted': return 'badge-status-contacted';
      case 'Qualified': return 'badge-status-qualified';
      case 'Converted': return 'badge-status-converted';
      case 'Disqualified': return 'badge-status-disqualified';
      default: return '';
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'High': return 'badge-priority-high';
      case 'Medium': return 'badge-priority-medium';
      case 'Low': return 'badge-priority-low';
      default: return '';
    }
  };

  return (
    <div className="leads-workspace animate-fade-in" style={{ paddingBottom: '40px' }}>
      
      {/* Header controls */}
      <div className="action-bar-top" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>Leads Management</h2>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Track and nurture business inquiries</span>
        </div>
        
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" />
          <span>Save New Lead</span>
        </button>
      </div>

      {/* Filter and Search controls */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-body" style={{ padding: '16px 20px' }}>
          <div style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <Search className="w-4 h-4 text-slate-400" style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)'
              }} />
              <input
                type="text"
                placeholder="Search leads, companies, or contacts..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                style={{
                  width: '100%',
                  height: '38px',
                  paddingLeft: '38px',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-main)',
                  fontSize: '13.5px'
                }}
              />
            </div>

            {/* Status Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                style={{
                  height: '38px',
                  padding: '0 12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-main)',
                  color: 'var(--text-primary)',
                  fontSize: '13.5px'
                }}
              >
                <option value="All">All Statuses</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Converted">Converted</option>
                <option value="Disqualified">Disqualified</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <select
                value={priorityFilter}
                onChange={e => { setPriorityFilter(e.target.value); setCurrentPage(1); }}
                style={{
                  height: '38px',
                  padding: '0 12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-main)',
                  color: 'var(--text-primary)',
                  fontSize: '13.5px'
                }}
              >
                <option value="All">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

          </div>
        </div>
      </div>

      {/* Main Table view */}
      {loading ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600 inline-block mb-2" />
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Fetching leads directory...</p>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>No active leads matching the filters found.</p>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="table-wrapper">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Lead Title</th>
                  <th>Company</th>
                  <th>Contact</th>
                  <th>Assigned Owner</th>
                  <th>Estimated Revenue</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentLeads.map(l => (
                  <tr key={l.lead_id} onClick={() => navigate(`/leads/${l.lead_id}`)}>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{l.lead_title}</span>
                    </td>
                    <td>{l.company_name || 'N/A'}</td>
                    <td>
                      {l.contact_first_name ? `${l.contact_first_name} ${l.contact_last_name || ''}` : 'N/A'}
                    </td>
                    <td>{l.assigned_user_name || 'Unassigned'}</td>
                    <td style={{ fontWeight: 600 }}>
                      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(l.estimated_revenue)}
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(l.lead_status)}`}>
                        {l.lead_status}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getPriorityBadgeClass(l.priority)}`}>
                        {l.priority}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }} onClick={e => e.stopPropagation()}>
                        <button 
                          onClick={() => navigate(`/leads/${l.lead_id}`)}
                          style={{ background: 'none', cursor: 'pointer', color: 'var(--primary)' }}
                          title="View Workspace"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => handleDeleteLead(l.lead_id, e)}
                          style={{ background: 'none', cursor: 'pointer', color: '#ef4444' }}
                          title="Delete Lead"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Row */}
          <div className="table-pagination">
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Showing {indexOfFirstLead + 1} to {Math.min(indexOfLastLead, filteredLeads.length)} of {filteredLeads.length} leads
            </span>
            <div className="pagination-pages">
              <button 
                className="page-btn" 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                &lt;
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  className={`page-btn ${currentPage === p ? 'active' : ''}`}
                  onClick={() => setCurrentPage(p)}
                >
                  {p}
                </button>
              ))}
              <button 
                className="page-btn" 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Lead Modal */}
      {showModal && (
        <div className="modal-overlay show" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Add New CRM Lead Profile</h3>
              <button 
                onClick={() => setShowModal(false)}
                style={{ background: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleCreateLead}>
              <div className="modal-body" style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  
                  {/* Lead Title */}
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Lead Title / Requirement *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. ERP Migration, Custom CMS licensing"
                      value={newLead.lead_title}
                      onChange={e => setNewLead({ ...newLead, lead_title: e.target.value })}
                      required
                      style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                    />
                  </div>

                  {/* Company Association */}
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Associate Company *</label>
                    <select
                      className="form-control"
                      value={newLead.company_id}
                      onChange={e => setNewLead({ ...newLead, company_id: e.target.value })}
                      required
                      style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                    >
                      <option value="">-- Choose Company --</option>
                      {companies.map(c => (
                        <option key={c.company_id} value={c.company_id}>{c.company_name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Primary Contact Association */}
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Primary Contact *</label>
                    <select
                      className="form-control"
                      value={newLead.primary_contact_id}
                      onChange={e => setNewLead({ ...newLead, primary_contact_id: e.target.value })}
                      required
                      style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                    >
                      <option value="">-- Choose Contact --</option>
                      {contacts
                        .filter(ct => !newLead.company_id || ct.company_id === newLead.company_id)
                        .map(ct => (
                          <option key={ct.contact_id} value={ct.contact_id}>
                            {ct.first_name} {ct.last_name || ''} ({ct.job_title})
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Assigned Owner */}
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Lead Owner / Assigned To *</label>
                    <select
                      className="form-control"
                      value={newLead.assigned_to}
                      onChange={e => setNewLead({ ...newLead, assigned_to: e.target.value })}
                      required
                      style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                    >
                      <option value="">-- Choose Owner --</option>
                      {users.map(u => (
                        <option key={u.user_id} value={u.user_id}>{u.full_name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Lead Source */}
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Lead Source</label>
                    <select
                      className="form-control"
                      value={newLead.lead_source}
                      onChange={e => setNewLead({ ...newLead, lead_source: e.target.value })}
                      style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                    >
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Website">Website</option>
                      <option value="Referral">Referral</option>
                      <option value="Cold Call">Cold Call</option>
                      <option value="Campaign">Campaign</option>
                    </select>
                  </div>

                  {/* Estimated Revenue */}
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Estimated Revenue (INR)</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="e.g. 500000"
                      value={newLead.estimated_revenue}
                      onChange={e => setNewLead({ ...newLead, estimated_revenue: e.target.value })}
                      style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                    />
                  </div>

                  {/* Conversion Probability */}
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Conversion Probability (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="form-control"
                      value={newLead.conversion_probability}
                      onChange={e => setNewLead({ ...newLead, conversion_probability: e.target.value })}
                      style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                    />
                  </div>

                  {/* Priority */}
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Priority Level</label>
                    <select
                      className="form-control"
                      value={newLead.priority}
                      onChange={e => setNewLead({ ...newLead, priority: e.target.value as any })}
                      style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>

                  {/* Campaign Name */}
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Campaign Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Q2 Outbound"
                      value={newLead.campaign_name}
                      onChange={e => setNewLead({ ...newLead, campaign_name: e.target.value })}
                      style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                    />
                  </div>

                  {/* Notes */}
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Requirement Notes & Summary</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Describe detail requirements, budget availability or meeting summary..."
                      value={newLead.notes}
                      onChange={e => setNewLead({ ...newLead, notes: e.target.value })}
                      style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                    />
                  </div>

                </div>
              </div>
              
              <div className="modal-footer" style={{
                padding: '16px 28px',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px'
              }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Lead Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
