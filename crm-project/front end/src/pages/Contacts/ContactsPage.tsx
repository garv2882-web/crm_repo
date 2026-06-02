import { useEffect, useState } from 'react';
import { api, type Contact, type Company } from '../../api';
import { Plus, Search, RefreshCw, Trash2, Mail, Phone } from 'lucide-react';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  // Search/Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Creation Modal
  const [showModal, setShowModal] = useState(false);
  const [newContact, setNewContact] = useState({
    first_name: '',
    last_name: '',
    company_id: '',
    email: '',
    mobile_number: '',
    linkedin_profile: '',
    job_title: '',
    department: '',
    notes: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [contactsData, companiesData] = await Promise.all([
        api.getContacts(),
        api.getCompanies()
      ]);
      setContacts(contactsData);
      setCompanies(companiesData);
    } catch (err) {
      console.error('Error fetching contacts data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createContact(newContact);
      setShowModal(false);
      setNewContact({
        first_name: '',
        last_name: '',
        company_id: '',
        email: '',
        mobile_number: '',
        linkedin_profile: '',
        job_title: '',
        department: '',
        notes: ''
      });
      fetchData();
    } catch (err) {
      console.error('Error creating contact:', err);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      try {
        await api.deleteContact(contactId);
        fetchData();
      } catch (err) {
        console.error('Error deleting contact:', err);
      }
    }
  };

  // Filter
  const filtered = contacts.filter(c => 
    `${c.first_name} ${c.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.company_name && c.company_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.job_title && c.job_title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.department && c.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const lastIdx = currentPage * itemsPerPage;
  const firstIdx = lastIdx - itemsPerPage;
  const currentItems = filtered.slice(firstIdx, lastIdx);

  return (
    <div className="contacts-workspace animate-fade-in" style={{ paddingBottom: '40px' }}>
      
      {/* Header controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Contacts Directory</h2>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Directory of customers and prospects</span>
        </div>
        
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" />
          <span>Save New Contact</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-body" style={{ padding: '16px 20px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '480px' }}>
            <Search className="w-4 h-4 text-slate-400" style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)'
            }} />
            <input
              type="text"
              placeholder="Search contacts by name, email, company, or job title..."
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
        </div>
      </div>

      {/* Main Table view */}
      {loading ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600 inline-block mb-2" />
          <p style={{ color: 'var(--text-secondary)' }}>Loading contact directory...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No contacts found matching the search criteria.</p>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="table-wrapper">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Contact Name</th>
                  <th>Company</th>
                  <th>Job Title & Dept</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>LinkedIn</th>
                  <th style={{ width: '60px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map(c => (
                  <tr key={c.contact_id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          background: 'hsl(35, 100%, 96%)',
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          color: 'hsl(35, 92%, 35%)',
                          fontSize: '13px'
                        }}>
                          {c.first_name[0]}
                        </div>
                        <span style={{ fontWeight: 600 }}>{c.first_name} {c.last_name || ''}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{c.company_name || 'N/A'}</td>
                    <td>
                      <div style={{ fontSize: '13.5px', fontWeight: 555 }}>{c.job_title || 'N/A'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                        {c.department || 'General'}
                      </div>
                    </td>
                    <td>
                      {c.email ? (
                        <a href={`mailto:${c.email}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--primary)' }}>
                          <Mail className="w-3.5 h-3.5" />
                          <span>{c.email}</span>
                        </a>
                      ) : 'N/A'}
                    </td>
                    <td>
                      {c.mobile_number ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{c.mobile_number}</span>
                        </span>
                      ) : 'N/A'}
                    </td>
                    <td>
                      {c.linkedin_profile ? (
                        <a 
                          href={c.linkedin_profile} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          style={{ color: '#0077b5', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <i className="fa-brands fa-linkedin" style={{ fontSize: '16px' }}></i>
                        </a>
                      ) : 'N/A'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        onClick={() => handleDeleteContact(c.contact_id)}
                        style={{ background: 'none', cursor: 'pointer', color: '#ef4444' }}
                        title="Delete Contact"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="table-pagination">
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Showing {firstIdx + 1} to {Math.min(lastIdx, filtered.length)} of {filtered.length} contacts
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

      {/* Creation Modal */}
      {showModal && (
        <div className="modal-overlay show" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Add New Contact Profile</h3>
              <button 
                onClick={() => setShowModal(false)}
                style={{ background: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleCreateContact}>
              <div className="modal-body" style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  
                  {/* First Name */}
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>First Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Aman"
                      value={newContact.first_name}
                      onChange={e => setNewContact({ ...newContact, first_name: e.target.value })}
                      required
                      style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                    />
                  </div>

                  {/* Last Name */}
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Last Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Verma"
                      value={newContact.last_name}
                      onChange={e => setNewContact({ ...newContact, last_name: e.target.value })}
                      style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                    />
                  </div>

                  {/* Company Association */}
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Associate Company *</label>
                    <select
                      className="form-control"
                      value={newContact.company_id}
                      onChange={e => setNewContact({ ...newContact, company_id: e.target.value })}
                      required
                      style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                    >
                      <option value="">-- Choose Company --</option>
                      {companies.map(c => (
                        <option key={c.company_id} value={c.company_id}>{c.company_name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Job Title */}
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Job Title</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Procurement Manager"
                      value={newContact.job_title}
                      onChange={e => setNewContact({ ...newContact, job_title: e.target.value })}
                      style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                    />
                  </div>

                  {/* Email */}
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="e.g. name@company.com"
                      value={newContact.email}
                      onChange={e => setNewContact({ ...newContact, email: e.target.value })}
                      style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                    />
                  </div>

                  {/* Mobile Number */}
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Mobile Number</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. +91 98765 43210"
                      value={newContact.mobile_number}
                      onChange={e => setNewContact({ ...newContact, mobile_number: e.target.value })}
                      style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                    />
                  </div>

                  {/* Linkedin Profile */}
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>LinkedIn Profile URL</label>
                    <input
                      type="url"
                      className="form-control"
                      placeholder="e.g. https://linkedin.com/in/username"
                      value={newContact.linkedin_profile}
                      onChange={e => setNewContact({ ...newContact, linkedin_profile: e.target.value })}
                      style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                    />
                  </div>

                  {/* Department */}
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Department</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Technology, Purchasing"
                      value={newContact.department}
                      onChange={e => setNewContact({ ...newContact, department: e.target.value })}
                      style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                    />
                  </div>

                  {/* Notes */}
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Interaction Notes & Context</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Add personal description, preferences or meeting summaries..."
                      value={newContact.notes}
                      onChange={e => setNewContact({ ...newContact, notes: e.target.value })}
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
                <button type="submit" className="btn btn-primary">Save Contact Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
