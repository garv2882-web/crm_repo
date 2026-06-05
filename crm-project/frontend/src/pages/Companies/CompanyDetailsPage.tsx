import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, type Company, type Contact, type Lead } from '../../api';
import { 
  ArrowLeft, 
  Trash2, 
  Info, 
  Sliders, 
  MessageSquare, 
  User, 
  Briefcase,
  RefreshCw,
  Clock,
  ArrowUpRight
} from 'lucide-react';

export default function CompanyDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<(Company & { contacts: Contact[]; leads: Lead[] }) | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit fields state
  const [industry, setIndustry] = useState('');
  const [revenue, setRevenue] = useState('');
  const [website, setWebsite] = useState('');
  const [newNote, setNewNote] = useState('');
  const [savingOperations, setSavingOperations] = useState(false);
  const [savingNote, setSavingNote] = useState(false);

  const fetchCompanyDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await api.getCompany(id);
      setCompany(data);
      setIndustry(data.industry || '');
      setRevenue(data.annual_revenue ? String(data.annual_revenue) : '');
      setWebsite(data.website || '');
    } catch (err) {
      console.error('Error fetching company details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: '#ef4444', fontWeight: 600 }}>Company not found or has been deleted.</p>
        <Link to="/companies" className="btn btn-secondary" style={{ marginTop: '16px' }}>Back to Companies</Link>
      </div>
    );
  }

  const handleSaveOperations = async () => {
    try {
      setSavingOperations(true);
      const updated = await api.updateCompany(company.company_id, {
        ...company,
        industry,
        annual_revenue: parseFloat(revenue) || 0,
        website
      });
      setCompany(prev => prev ? { ...prev, ...updated } : null);
      alert('Company profile updated successfully.');
    } catch (err) {
      console.error('Error saving operations:', err);
    } finally {
      setSavingOperations(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      setSavingNote(true);
      const timestamp = new Date().toLocaleString('en-IN');
      const noteEntry = `[${timestamp}] Aman Verma (Admin): ${newNote.trim()}`;
      
      const updatedNotes = company.notes 
        ? `${noteEntry}\n\n${company.notes}` 
        : noteEntry;
      
      const updated = await api.updateCompany(company.company_id, { ...company, notes: updatedNotes });
      setCompany(prev => prev ? { ...prev, notes: updated.notes } : null);
      setNewNote('');
    } catch (err) {
      console.error('Error saving note:', err);
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteCompany = async () => {
    if (confirm('Are you sure you want to delete this company?')) {
      try {
        await api.deleteCompany(company.company_id);
        navigate('/companies');
      } catch (err) {
        console.error('Error deleting company:', err);
      }
    }
  };

  const noteList = company.notes 
    ? company.notes.split('\n\n').filter(Boolean) 
    : [];

  return (
    <div className="details-workspace animate-fade-in" style={{ paddingBottom: '40px' }}>
      
      {/* Header controls */}
      <div className="details-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate('/companies')} className="back-btn" style={{
            background: 'white',
            border: '1px solid var(--border-color)',
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}>
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
          
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700 }}>{company.company_name}</h2>
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <span className="badge badge-status-new">{company.company_code || 'No Code'}</span>
              <span className="badge badge-priority-medium">{company.industry || 'No Industry'}</span>
            </div>
          </div>
        </div>

        <button className="btn btn-danger" onClick={handleDeleteCompany}>
          <Trash2 className="w-4 h-4" />
          <span>Delete Company</span>
        </button>
      </div>

      {/* Grid Split layout */}
      <div className="details-grid" style={{
        display: 'grid',
        gridTemplateColumns: '7fr 5fr',
        gap: '24px'
      }}>
        
        {/* Left Workspace Panel: Core stats, inputs, note panel */}
        <div className="details-left-panel">
          
          {/* Card: Company Info */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Info className="w-4 h-4" />
                <span>Company Information</span>
              </div>
            </div>
            <div className="card-body">
              <div className="info-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px dashed var(--border-color)', fontSize: '13.5px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Company Code</span>
                  <span style={{ fontWeight: 600 }}>{company.company_code || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px dashed var(--border-color)', fontSize: '13.5px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Industry</span>
                  <span style={{ fontWeight: 600 }}>{company.industry || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px dashed var(--border-color)', fontSize: '13.5px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Website</span>
                  <span style={{ fontWeight: 600 }}>
                    {company.website ? (
                      <a href={company.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                        {company.website.replace(/^https?:\/\//, '')} <ArrowUpRight className="w-3 h-3" />
                      </a>
                    ) : 'N/A'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px dashed var(--border-color)', fontSize: '13.5px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Annual Revenue</span>
                  <span style={{ fontWeight: 600, color: 'hsl(150, 84%, 26%)' }}>
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(company.annual_revenue)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px dashed var(--border-color)', fontSize: '13.5px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Location</span>
                  <span style={{ fontWeight: 600 }}>{company.city ? `${company.city}, ${company.state || ''}, ${company.country}` : company.country}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Registered Date</span>
                  <span style={{ fontWeight: 600 }}>{new Date(company.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Quick Operations */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Sliders className="w-4 h-4" />
                <span>Quick Operations</span>
              </div>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Update Industry</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. IT, Software"
                    value={industry}
                    onChange={e => setIndustry(e.target.value)}
                    style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Update Annual Revenue (INR)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="e.g. 1000000"
                    value={revenue}
                    onChange={e => setRevenue(e.target.value)}
                    style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Update Website</label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="e.g. https://website.com"
                    value={website}
                    onChange={e => setWebsite(e.target.value)}
                    style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                  />
                </div>
              </div>
              <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={handleSaveOperations} disabled={savingOperations}>
                {savingOperations ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Card: Notes and Interactions */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <MessageSquare className="w-4 h-4" />
                <span>Internal Notes & History</span>
              </div>
            </div>
            <div className="card-body">
              <form onSubmit={handleAddNote} style={{ marginBottom: '20px' }}>
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Append notes or descriptions about this company..."
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    required
                    style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', resize: 'vertical' }}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ height: '34px' }} disabled={savingNote}>
                  {savingNote ? 'Adding...' : 'Add Note'}
                </button>
              </form>

              <div className="notes-history" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {noteList.length === 0 ? (
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center' }}>No historical notes saved.</p>
                ) : (
                  noteList.map((note, index) => (
                    <div key={index} style={{
                      padding: '12px 16px',
                      backgroundColor: 'var(--bg-main)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      fontSize: '13px',
                      lineHeight: '1.4'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', color: 'var(--text-secondary)', fontSize: '11px' }}>
                        <Clock className="w-3.5 h-3.5" />
                        <span>{note.match(/^\[(.*?)\]/)?.[1] || 'Log'}</span>
                      </div>
                      <p style={{ whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>
                        {note.replace(/^\[.*?\]\s*/, '')}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Right Workspace Panel: Contacts & Leads lists */}
        <div className="details-right-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Card: Associated Contacts */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-header">
              <div className="card-title">
                <User className="w-4 h-4" />
                <span>Associated Contacts</span>
              </div>
            </div>
            <div className="card-body" style={{ padding: '0px' }}>
              <div className="table-wrapper">
                <table className="crm-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Job Title</th>
                    </tr>
                  </thead>
                  <tbody>
                    {company.contacts.length === 0 ? (
                      <tr>
                        <td colSpan={2} style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
                          No contacts linked.
                        </td>
                      </tr>
                    ) : (
                      company.contacts.map(ct => (
                        <tr key={ct.contact_id} onClick={() => navigate(`/contacts`)}>
                          <td style={{ fontWeight: 600 }}>{ct.first_name} {ct.last_name || ''}</td>
                          <td style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>{ct.job_title || 'N/A'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Card: Associated Leads */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-header">
              <div className="card-title">
                <Briefcase className="w-4 h-4" />
                <span>Associated Leads</span>
              </div>
            </div>
            <div className="card-body" style={{ padding: '0px' }}>
              <div className="table-wrapper">
                <table className="crm-table">
                  <thead>
                    <tr>
                      <th>Lead Title</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {company.leads.length === 0 ? (
                      <tr>
                        <td colSpan={2} style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
                          No active leads linked.
                        </td>
                      </tr>
                    ) : (
                      company.leads.map(l => (
                        <tr key={l.lead_id} onClick={() => navigate(`/leads/${l.lead_id}`)}>
                          <td style={{ fontWeight: 600 }}>{l.lead_title}</td>
                          <td>
                            <span className={`badge ${
                              l.lead_status === 'New' ? 'badge-status-new' :
                              l.lead_status === 'Contacted' ? 'badge-status-contacted' :
                              l.lead_status === 'Qualified' ? 'badge-status-qualified' :
                              l.lead_status === 'Converted' ? 'badge-status-converted' : 'badge-status-disqualified'
                            }`}>{l.lead_status}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
