import { useEffect, useState } from 'react';
import { api, type Deal, type Company, type Contact, type Lead } from '../../api';
import { Plus, Search, RefreshCw, ArrowRight, ArrowLeft } from 'lucide-react';

const DEAL_STAGES = [
  'Qualification',
  'Discovery',
  'Proposal',
  'Negotiation',
  'Contract',
  'Closed Won',
  'Closed Lost'
];

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // Search
  const [searchTerm, setSearchTerm] = useState('');

  // Creation Modal
  const [showModal, setShowModal] = useState(false);
  const [newDeal, setNewDeal] = useState({
    deal_name: '',
    lead_id: '',
    company_id: '',
    contact_id: '',
    deal_owner: '',
    deal_stage: 'Qualification' as any,
    deal_status: 'Open' as any,
    priority: 'Medium' as any,
    probability_percentage: '50',
    deal_value: '',
    currency: 'INR',
    sales_pipeline: 'Standard',
    notes: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dealsData, companiesData, contactsData, leadsData] = await Promise.all([
        api.getDeals(),
        api.getCompanies(),
        api.getContacts(),
        api.getLeads()
      ]);
      setDeals(dealsData);
      setCompanies(companiesData);
      setContacts(contactsData);
      setLeads(leadsData);
    } catch (err) {
      console.error('Error fetching deals workspace:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        ...newDeal,
        deal_value: parseFloat(newDeal.deal_value) || 0,
        probability_percentage: parseFloat(newDeal.probability_percentage) || 50,
        deal_owner: leads.find(l => l.lead_id === newDeal.lead_id)?.assigned_to || ''
      };
      await api.createDeal(dataToSubmit);
      setShowModal(false);
      setNewDeal({
        deal_name: '',
        lead_id: '',
        company_id: '',
        contact_id: '',
        deal_owner: '',
        deal_stage: 'Qualification',
        deal_status: 'Open',
        priority: 'Medium',
        probability_percentage: '50',
        deal_value: '',
        currency: 'INR',
        sales_pipeline: 'Standard',
        notes: ''
      });
      fetchData();
    } catch (err) {
      console.error('Error creating deal:', err);
    }
  };

  const moveDealStage = async (deal: Deal, direction: 'forward' | 'backward') => {
    const currentIdx = DEAL_STAGES.indexOf(deal.deal_stage);
    let nextIdx = direction === 'forward' ? currentIdx + 1 : currentIdx - 1;
    if (nextIdx < 0 || nextIdx >= DEAL_STAGES.length) return;

    const nextStage = DEAL_STAGES[nextIdx];
    let nextStatus = deal.deal_status;
    if (nextStage === 'Closed Won') nextStatus = 'Won';
    else if (nextStage === 'Closed Lost') nextStatus = 'Lost';
    else nextStatus = 'Open';

    try {
      await api.updateDeal(deal.deal_id, {
        ...deal,
        deal_stage: nextStage as any,
        deal_status: nextStatus as any
      });
      fetchData();
    } catch (err) {
      console.error('Error moving deal stage:', err);
    }
  };

  // Filter deals
  const filteredDeals = deals.filter(d => 
    d.deal_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.company_name && d.company_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Group deals by stage
  const dealsByStage = DEAL_STAGES.reduce((acc, stage) => {
    acc[stage] = filteredDeals.filter(d => d.deal_stage === stage);
    return acc;
  }, {} as Record<string, Deal[]>);

  // Currency Formatter
  const formatVal = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="deals-workspace animate-fade-in" style={{ paddingBottom: '40px' }}>
      
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Sales Pipeline (Kanban)</h2>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Track deals progress across sales cycle stages</span>
        </div>
        
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" />
          <span>Save New Deal</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-body" style={{ padding: '16px 20px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
            <Search className="w-4 h-4 text-slate-400" style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)'
            }} />
            <input
              type="text"
              placeholder="Search deals by name or company..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
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

      {/* Kanban Board Container */}
      {loading ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600 inline-block mb-2" />
          <p style={{ color: 'var(--text-secondary)' }}>Syncing deal stages...</p>
        </div>
      ) : (
        <div className="kanban-scroll-container" style={{
          display: 'flex',
          gap: '16px',
          overflowX: 'auto',
          paddingBottom: '16px',
          minHeight: '60vh'
        }}>
          {DEAL_STAGES.map(stage => {
            const stageDeals = dealsByStage[stage] || [];
            const columnTotal = stageDeals.reduce((sum, d) => sum + Number(d.deal_value), 0);

            return (
              <div key={stage} className="kanban-column" style={{
                flex: '0 0 280px',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '75vh'
              }}>
                {/* Column Header */}
                <div style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: 'hsl(210, 40%, 99%)',
                  borderTopLeftRadius: 'var(--radius-lg)',
                  borderTopRightRadius: 'var(--radius-lg)'
                }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '13px', display: 'block' }}>{stage}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{stageDeals.length} Deals</span>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {formatVal(columnTotal)}
                  </span>
                </div>

                {/* Column Content */}
                <div style={{
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  overflowY: 'auto',
                  flex: 1
                }}>
                  {stageDeals.length === 0 ? (
                    <div style={{
                      padding: '24px 12px',
                      textAlign: 'center',
                      color: 'var(--text-tertiary)',
                      fontSize: '12.5px',
                      border: '1px dashed var(--border-color)',
                      borderRadius: 'var(--radius-md)'
                    }}>
                      Drop deals here
                    </div>
                  ) : (
                    stageDeals.map(d => (
                      <div key={d.deal_id} className="kanban-card" style={{
                        padding: '14px',
                        backgroundColor: 'white',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        boxShadow: 'var(--shadow-sm)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>{d.deal_name}</span>
                          <span className={`badge ${
                            d.priority === 'High' ? 'badge-priority-high' :
                            d.priority === 'Medium' ? 'badge-priority-medium' : 'badge-priority-low'
                          }`} style={{ fontSize: '9px', padding: '2px 6px' }}>{d.priority}</span>
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{d.company_name || 'Prospect'}</span>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginTop: '6px',
                          paddingTop: '6px',
                          borderTop: '1px solid var(--bg-main)'
                        }}>
                          <span style={{ fontWeight: 700, fontSize: '12.5px', color: 'var(--primary)' }}>
                            {formatVal(d.deal_value)}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                            {d.probability_percentage}% prob
                          </span>
                        </div>
                        
                        {/* Interactive Move Arrows */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginTop: '8px',
                          borderTop: '1px dashed var(--border-color)',
                          paddingTop: '6px'
                        }}>
                          <button 
                            disabled={stage === DEAL_STAGES[0]}
                            onClick={() => moveDealStage(d, 'backward')}
                            style={{ background: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            disabled={stage === DEAL_STAGES[DEAL_STAGES.length - 1]}
                            onClick={() => moveDealStage(d, 'forward')}
                            style={{ background: 'none', cursor: 'pointer', color: 'var(--primary)', display: 'flex', alignItems: 'center' }}
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Deal Creation Modal */}
      {showModal && (
        <div className="modal-overlay show" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Add New Deal Pipeline</h3>
              <button 
                onClick={() => setShowModal(false)}
                style={{ background: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleCreateDeal}>
              <div className="modal-body" style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  
                  {/* Deal Name */}
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Deal Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. ERP Cloud Migration Deal"
                      value={newDeal.deal_name}
                      onChange={e => setNewDeal({ ...newDeal, deal_name: e.target.value })}
                      required
                      style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                    />
                  </div>

                  {/* Associated Lead */}
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Originating Lead *</label>
                    <select
                      className="form-control"
                      value={newDeal.lead_id}
                      onChange={e => {
                        const selLead = leads.find(l => l.lead_id === e.target.value);
                        setNewDeal({
                          ...newDeal,
                          lead_id: e.target.value,
                          company_id: selLead?.company_id || '',
                          contact_id: selLead?.primary_contact_id || '',
                          deal_value: selLead?.estimated_revenue ? String(selLead.estimated_revenue) : '',
                          probability_percentage: selLead?.conversion_probability ? String(selLead.conversion_probability) : '50',
                          deal_name: selLead ? `${selLead.lead_title} Deal` : ''
                        });
                      }}
                      required
                      style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                    >
                      <option value="">-- Choose Originating Lead --</option>
                      {leads
                        .filter(l => l.lead_status !== 'Converted')
                        .map(l => (
                          <option key={l.lead_id} value={l.lead_id}>{l.lead_title} ({l.company_name})</option>
                        ))}
                    </select>
                  </div>

                  {/* Associated Company */}
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Associated Company *</label>
                    <select
                      className="form-control"
                      value={newDeal.company_id}
                      onChange={e => setNewDeal({ ...newDeal, company_id: e.target.value })}
                      required
                      style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                    >
                      <option value="">-- Choose Company --</option>
                      {companies.map(c => (
                        <option key={c.company_id} value={c.company_id}>{c.company_name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Associated Contact */}
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Primary Contact *</label>
                    <select
                      className="form-control"
                      value={newDeal.contact_id}
                      onChange={e => setNewDeal({ ...newDeal, contact_id: e.target.value })}
                      required
                      style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                    >
                      <option value="">-- Choose Contact --</option>
                      {contacts
                        .filter(ct => !newDeal.company_id || ct.company_id === newDeal.company_id)
                        .map(ct => (
                          <option key={ct.contact_id} value={ct.contact_id}>{ct.first_name} {ct.last_name || ''}</option>
                        ))}
                    </select>
                  </div>

                  {/* Deal Value */}
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Deal Value (INR)</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="e.g. 1000000"
                      value={newDeal.deal_value}
                      onChange={e => setNewDeal({ ...newDeal, deal_value: e.target.value })}
                      required
                      style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                    />
                  </div>

                  {/* Probability */}
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Probability Percentage (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="form-control"
                      value={newDeal.probability_percentage}
                      onChange={e => setNewDeal({ ...newDeal, probability_percentage: e.target.value })}
                      style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                    />
                  </div>

                  {/* Initial Stage */}
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Sales Cycle Stage</label>
                    <select
                      className="form-control"
                      value={newDeal.deal_stage}
                      onChange={e => setNewDeal({ ...newDeal, deal_stage: e.target.value as any })}
                      style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                    >
                      {DEAL_STAGES.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
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
                <button type="submit" className="btn btn-primary">Save Deal Pipeline</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
