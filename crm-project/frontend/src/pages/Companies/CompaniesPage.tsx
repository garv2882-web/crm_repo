import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, type Company } from '../../api';
import { Plus, Search, RefreshCw, Eye, Trash2 } from 'lucide-react';

export default function CompaniesPage() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  // Search/Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Creation Modal
  const [showModal, setShowModal] = useState(false);
  const [newCompany, setNewCompany] = useState({
    company_name: '',
    company_code: '',
    industry: '',
    website: '',
    country: 'India',
    state: '',
    city: '',
    annual_revenue: '',
    notes: ''
  });

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await api.getCompanies();
      setCompanies(data);
    } catch (err) {
      console.error('Error fetching companies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        ...newCompany,
        annual_revenue: parseFloat(newCompany.annual_revenue) || 0
      };
      await api.createCompany(dataToSubmit);
      setShowModal(false);
      setNewCompany({
        company_name: '',
        company_code: '',
        industry: '',
        website: '',
        country: 'India',
        state: '',
        city: '',
        annual_revenue: '',
        notes: ''
      });
      fetchCompanies();
    } catch (err) {
      console.error('Error creating company:', err);
    }
  };

  const handleDeleteCompany = async (companyId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this company? All associated contacts and leads will remain, but links will clear.')) {
      try {
        await api.deleteCompany(companyId);
        fetchCompanies();
      } catch (err) {
        console.error('Error deleting company:', err);
      }
    }
  };

  // Filter
  const filtered = companies.filter(c => 
    c.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.company_code && c.company_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.industry && c.industry.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.city && c.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const lastIdx = currentPage * itemsPerPage;
  const firstIdx = lastIdx - itemsPerPage;
  const currentItems = filtered.slice(firstIdx, lastIdx);

  return (
    <div className="companies-workspace animate-fade-in" style={{ paddingBottom: '40px' }}>
      
      {/* Upper header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Companies Directory</h2>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Manage accounts and firmographic records</span>
        </div>
        
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" />
          <span>Save New Company</span>
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
              placeholder="Search companies by name, code, industry, or city..."
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

      {/* Main Grid/Table */}
      {loading ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600 inline-block mb-2" />
          <p style={{ color: 'var(--text-secondary)' }}>Loading accounts directory...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No companies found matching the search criteria.</p>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="table-wrapper">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Company Name</th>
                  <th>Company Code</th>
                  <th>Industry</th>
                  <th>Annual Revenue</th>
                  <th>Website</th>
                  <th>Location</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map(c => (
                  <tr key={c.company_id} onClick={() => navigate(`/companies/${c.company_id}`)}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          background: 'var(--primary-light)',
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          color: 'var(--primary)',
                          fontSize: '13px'
                        }}>
                          {c.company_name[0]}
                        </div>
                        <span style={{ fontWeight: 600 }}>{c.company_name}</span>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{c.company_code || 'N/A'}</td>
                    <td>
                      <span className="badge badge-status-contacted" style={{ textTransform: 'uppercase', fontSize: '10px' }}>
                        {c.industry || 'IT'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'hsl(150, 84%, 26%)' }}>
                      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(c.annual_revenue)}
                    </td>
                    <td>
                      {c.website ? (
                        <a 
                          href={c.website} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          style={{ color: 'var(--primary)', textDecoration: 'underline' }}
                          onClick={e => e.stopPropagation()}
                        >
                          {c.website.replace(/^https?:\/\//, '')}
                        </a>
                      ) : 'N/A'}
                    </td>
                    <td>{c.city ? `${c.city}, ${c.country}` : c.country}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }} onClick={e => e.stopPropagation()}>
                        <button 
                          onClick={() => navigate(`/companies/${c.company_id}`)}
                          style={{ background: 'none', cursor: 'pointer', color: 'var(--primary)' }}
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => handleDeleteCompany(c.company_id, e)}
                          style={{ background: 'none', cursor: 'pointer', color: '#ef4444' }}
                          title="Delete Company"
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

          {/* Pagination */}
          <div className="table-pagination">
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Showing {firstIdx + 1} to {Math.min(lastIdx, filtered.length)} of {filtered.length} companies
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
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Add New Company Account</h3>
              <button 
                onClick={() => setShowModal(false)}
                style={{ background: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleCreateCompany}>
              <div className="modal-body" style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  
                  {/* Company Name */}
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Company Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Acme Tech Corporation"
                      value={newCompany.company_name}
                      onChange={e => setNewCompany({ ...newCompany, company_name: e.target.value })}
                      required
                      style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                    />
                  </div>

                  {/* Company Code */}
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Company Code / Registration</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. AC001"
                      value={newCompany.company_code}
                      onChange={e => setNewCompany({ ...newCompany, company_code: e.target.value })}
                      style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                    />
                  </div>

                  {/* Industry */}
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Industry / Vertical</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. IT, Consulting, Logistics"
                      value={newCompany.industry}
                      onChange={e => setNewCompany({ ...newCompany, industry: e.target.value })}
                      style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                    />
                  </div>

                  {/* Website */}
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Website URL</label>
                    <input
                      type="url"
                      className="form-control"
                      placeholder="e.g. https://acme.com"
                      value={newCompany.website}
                      onChange={e => setNewCompany({ ...newCompany, website: e.target.value })}
                      style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                    />
                  </div>

                  {/* Annual Revenue */}
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Annual Revenue (INR)</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="e.g. 50000000"
                      value={newCompany.annual_revenue}
                      onChange={e => setNewCompany({ ...newCompany, annual_revenue: e.target.value })}
                      style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                    />
                  </div>

                  {/* City */}
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>City</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Noida, Bangalore"
                      value={newCompany.city}
                      onChange={e => setNewCompany({ ...newCompany, city: e.target.value })}
                      style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                    />
                  </div>

                  {/* State */}
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>State</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Karnataka"
                      value={newCompany.state}
                      onChange={e => setNewCompany({ ...newCompany, state: e.target.value })}
                      style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                    />
                  </div>

                  {/* Notes */}
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Company Description / Profile</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Provide business background, products, key decision makers, etc."
                      value={newCompany.notes}
                      onChange={e => setNewCompany({ ...newCompany, notes: e.target.value })}
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
                <button type="submit" className="btn btn-primary">Save Company Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
