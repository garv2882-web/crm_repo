import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, apiEvents, type Deal, type Task } from '../../api';
import { 
  ArrowLeft, 
  Trash2, 
  Info, 
  Sliders, 
  Building2, 
  User, 
  ShieldAlert, 
  RefreshCw,
  Clock,
  CheckSquare,
  Handshake
} from 'lucide-react';

export default function DealDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deal, setDeal] = useState<(Deal & { tasks: Task[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const fetchDealDetails = async () => {
    if (!id) return;
    try {
      const data = await api.getDeal(id);
      setDeal(data as any);
    } catch (err) {
      console.error('Error fetching deal details:', err);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchDealDetails().then(() => setLoading(false));
    
    const unsubscribe = apiEvents.subscribe(() => {
      fetchDealDetails();
    });
    return unsubscribe;
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full" style={{ padding: '80px', display: 'flex', justifyContent: 'center' }}>
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: '#ef4444', fontWeight: 600 }}>Deal not found or has been deleted.</p>
        <Link to="/deals" className="btn btn-secondary" style={{ marginTop: '16px' }}>Back to Deals</Link>
      </div>
    );
  }

  const handleStageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStage = e.target.value;
    let newStatus = deal.deal_status;
    if (newStage === 'Closed Won') newStatus = 'Won';
    else if (newStage === 'Closed Lost') newStatus = 'Lost';
    else newStatus = 'Open';

    try {
      const updated = await api.updateDeal(deal.deal_id, { 
        ...deal, 
        deal_stage: newStage,
        deal_status: newStatus
      });
      setDeal(prev => prev ? { ...prev, deal_stage: updated.deal_stage, deal_status: updated.deal_status } : null);
    } catch (err) {
      console.error('Error updating stage:', err);
    }
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as any;
    try {
      const updated = await api.updateDeal(deal.deal_id, { ...deal, deal_status: newStatus });
      setDeal(prev => prev ? { ...prev, deal_status: updated.deal_status } : null);
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handlePriorityChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPriority = e.target.value as any;
    try {
      const updated = await api.updateDeal(deal.deal_id, { ...deal, priority: newPriority });
      setDeal(prev => prev ? { ...prev, priority: updated.priority } : null);
    } catch (err) {
      console.error('Error updating priority:', err);
    }
  };

  const handleProbabilityChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProb = parseFloat(e.target.value) || 0;
    try {
      const updated = await api.updateDeal(deal.deal_id, { ...deal, probability_percentage: newProb });
      setDeal(prev => prev ? { ...prev, probability_percentage: updated.probability_percentage } : null);
    } catch (err) {
      console.error('Error updating probability:', err);
    }
  };

  const handleDeleteDeal = async () => {
    if (confirm('Are you sure you want to delete this deal?')) {
      try {
        await api.deleteDeal(deal.deal_id);
        navigate('/deals');
      } catch (err) {
        console.error('Error deleting deal:', err);
      }
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      setSavingNote(true);
      const timestamp = new Date().toLocaleString('en-IN');
      const noteEntry = `[${timestamp}] Aman Verma (Admin): ${newNote.trim()}`;
      
      const updatedNotes = deal.notes 
        ? `${noteEntry}\n\n${deal.notes}` 
        : noteEntry;
      
      const updated = await api.updateDeal(deal.deal_id, { ...deal, notes: updatedNotes });
      setDeal(prev => prev ? { ...prev, notes: updated.notes } : null);
      setNewNote('');
    } catch (err) {
      console.error('Error saving note:', err);
    } finally {
      setSavingNote(false);
    }
  };

  const noteList = deal.notes 
    ? deal.notes.split('\n\n').filter(Boolean) 
    : [];

  const formatVal = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="details-workspace animate-fade-in" style={{ paddingBottom: '40px' }}>
      
      {/* Back and Action Header */}
      <div className="details-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate('/deals')} className="back-btn" style={{
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
            <h2 style={{ fontSize: '20px', fontWeight: 700 }}>{deal.deal_name}</h2>
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <span className={`badge badge-status-qualified`}>{deal.deal_stage}</span>
              <span className={`badge ${
                deal.priority === 'High' ? 'badge-priority-high' :
                deal.priority === 'Medium' ? 'badge-priority-medium' : 'badge-priority-low'
              }`}>{deal.priority} Priority</span>
              <span className="badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'none' }}>
                Status: {deal.deal_status}
              </span>
            </div>
          </div>
        </div>

        <div>
          <button className="btn btn-danger" onClick={handleDeleteDeal}>
            <Trash2 className="w-4 h-4" />
            <span>Delete Deal</span>
          </button>
        </div>
      </div>

      {/* Two-Column Workspace Layout */}
      <div className="details-grid" style={{
        display: 'grid',
        gridTemplateColumns: '7fr 5fr',
        gap: '24px'
      }}>
        
        {/* Left Workspace Panel: Core Stats & Notes */}
        <div className="details-left-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Card: Deal Information */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Info className="w-4 h-4" />
                <span>Deal Information</span>
              </div>
            </div>
            <div className="card-body">
              <div className="info-list" style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px'
              }}>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Deal Value</span>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: 'hsl(150, 84%, 26%)' }}>
                    {formatVal(deal.deal_value)}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Probability Percentage</span>
                  <span style={{ fontSize: '15px', fontWeight: 700 }}>{deal.probability_percentage}%</span>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Sales Pipeline</span>
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>{deal.sales_pipeline || 'Standard'}</span>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Expected Closing Date</span>
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>
                    {deal.expected_closing_date 
                      ? new Date(deal.expected_closing_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                      : 'N/A'}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Product / Service</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{deal.product_service || 'N/A'}</span>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Competitors</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{deal.competitors || 'None identified'}</span>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Created Date</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                    {new Date(deal.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Last Updated</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                    {new Date(deal.updated_at || deal.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
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
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Update Stage</label>
                  <select 
                    className="form-control" 
                    value={deal.deal_stage} 
                    onChange={handleStageChange}
                    style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
                  >
                    <option value="Qualification">Qualification</option>
                    <option value="Discovery">Discovery</option>
                    <option value="Proposal">Proposal</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Contract Sent">Contract Sent</option>
                    <option value="Closed Won">Closed Won</option>
                    <option value="Closed Lost">Closed Lost</option>
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Update Status</label>
                  <select 
                    className="form-control" 
                    value={deal.deal_status} 
                    onChange={handleStatusChange}
                    style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
                  >
                    <option value="Open">Open</option>
                    <option value="Won">Won</option>
                    <option value="Lost">Lost</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Update Priority</label>
                  <select 
                    className="form-control" 
                    value={deal.priority} 
                    onChange={handlePriorityChange}
                    style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Probability (%)</label>
                  <input 
                    type="number"
                    className="form-control" 
                    min="0"
                    max="100"
                    value={deal.probability_percentage} 
                    onChange={handleProbabilityChange}
                    style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card: Internal Notes Panel */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Clock className="w-4 h-4" />
                <span>Internal Notes History</span>
              </div>
            </div>
            
            <div className="card-body">
              <form onSubmit={handleAddNote} style={{ marginBottom: '20px' }}>
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Append call notes, negotiation updates, or deal log..."
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
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center' }}>No internal notes saved yet.</p>
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

        {/* Right Workspace Panel: Relational cards */}
        <div className="details-right-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Card: Originating Lead */}
          <div className="card related-card" style={{ marginBottom: 0 }}>
            <div className="card-header">
              <div className="card-title">
                <Handshake className="w-4 h-4" />
                <span>Originating Lead</span>
              </div>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  height: '42px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Handshake className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  {deal.lead_id ? (
                    <Link to={`/leads/${deal.lead_id}`} style={{ fontWeight: 700, fontSize: '15px', color: 'var(--primary)', textDecoration: 'underline' }}>
                      {deal.lead_title || 'View Lead Workspace'}
                    </Link>
                  ) : (
                    <span style={{ fontWeight: 700, fontSize: '15px' }}>Directly Created Deal</span>
                  )}
                  <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Type: CRM Generated Deal
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Associated Company */}
          <div className="card related-card" style={{ marginBottom: 0 }}>
            <div className="card-header">
              <div className="card-title">
                <Building2 className="w-4 h-4" />
                <span>Associated Company</span>
              </div>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{
                  background: 'var(--primary-light)',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  height: '42px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  {deal.company_id ? (
                    <Link to={`/companies/${deal.company_id}`} style={{ fontWeight: 700, fontSize: '15px', color: 'var(--primary)', textDecoration: 'underline' }}>
                      {deal.company_name}
                    </Link>
                  ) : (
                    <span style={{ fontWeight: 700, fontSize: '15px' }}>Unknown Company</span>
                  )}
                  <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Industry: {deal.company_industry || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Primary Contact */}
          <div className="card related-card" style={{ marginBottom: 0 }}>
            <div className="card-header">
              <div className="card-title">
                <User className="w-4 h-4" />
                <span>Primary Contact</span>
              </div>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{
                  background: 'hsl(35, 100%, 96%)',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  height: '42px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <User className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <span style={{ fontWeight: 700, fontSize: '15px', display: 'block' }}>
                    {deal.contact_first_name ? `${deal.contact_first_name} ${deal.contact_last_name || ''}` : 'N/A'}
                  </span>
                  <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {deal.contact_email || 'No email saved'}
                  </span>
                  <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Mobile: {deal.contact_mobile || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Deal Owner */}
          <div className="card related-card" style={{ marginBottom: 0 }}>
            <div className="card-header">
              <div className="card-title">
                <ShieldAlert className="w-4 h-4" />
                <span>Deal Owner</span>
              </div>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{
                  background: 'hsl(150, 80%, 95%)',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  height: '42px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <User className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <span style={{ fontWeight: 700, fontSize: '15px', display: 'block' }}>
                    {deal.deal_owner_name || 'Unassigned'}
                  </span>
                  <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Ownership: Account Manager
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Scheduled Tasks */}
          <div className="card related-card" style={{ marginBottom: 0 }}>
            <div className="card-header">
              <div className="card-title">
                <CheckSquare className="w-4 h-4" />
                <span>Scheduled Tasks</span>
              </div>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {!deal.tasks || deal.tasks.length === 0 ? (
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center', margin: 0 }}>
                    No tasks scheduled for this deal.
                  </p>
                ) : (
                  deal.tasks.map(t => (
                    <div key={t.task_id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      backgroundColor: 'var(--bg-main)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)'
                    }}>
                      <CheckSquare className={`w-4 h-4 ${t.status === 'Completed' ? 'text-emerald-500' : 'text-slate-400'}`} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', textDecoration: t.status === 'Completed' ? 'line-through' : 'none' }}>
                          {t.title}
                        </span>
                        <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                          Due: {t.due_date ? new Date(t.due_date).toLocaleDateString('en-GB') : 'N/A'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
