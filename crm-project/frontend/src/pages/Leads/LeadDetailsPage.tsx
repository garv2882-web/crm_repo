import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, apiEvents, type Lead, type Task, type Deal, type EmailMessage, type SocialEngagement } from '../../api';
import { 
  ArrowLeft, 
  Trash2, 
  Handshake, 
  Info, 
  Sliders, 
  Building2, 
  User, 
  ShieldAlert, 
  RefreshCw,
  Clock,
  Mail,
  Share2,
  MessageCircle
} from 'lucide-react';

export default function LeadDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<(Lead & { tasks: Task[]; deals: Deal[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // Tabs & Channels State
  const [activeTab, setActiveTab] = useState<'notes' | 'channels'>('notes');
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [socials, setSocials] = useState<SocialEngagement[]>([]);
  const [savingChannel, setSavingChannel] = useState(false);
  
  // Log Email form states
  const [showLogEmail, setShowLogEmail] = useState(false);
  const [emailForm, setEmailForm] = useState({
    subject: '',
    body: '',
    direction: 'Outbound' as any,
    sender: 'me@dexnest.com',
    recipient: '',
    status: 'Sent' as any
  });

  // Log Social form states
  const [showLogSocial, setShowLogSocial] = useState(false);
  const [socialForm, setSocialForm] = useState({
    platform: 'LinkedIn' as any,
    direction: 'Outbound' as any,
    content: '',
    sender_handle: '@me_dexnest'
  });

  const fetchLeadDetails = async () => {
    if (!id) return;
    try {
      const data = await api.getLead(id);
      setLead(data);
      if (data && data.contact_email) {
        setEmailForm(prev => ({ ...prev, recipient: data.contact_email || '' }));
      }
    } catch (err) {
      console.error('Error fetching lead details:', err);
    }
  };

  const fetchChannelsData = async () => {
    if (!id) return;
    try {
      const [emailData, socialData] = await Promise.all([
        api.getEmailMessages({ lead_id: id }),
        api.getSocialEngagements({ lead_id: id })
      ]);
      setEmails(emailData);
      setSocials(socialData);
    } catch (err) {
      console.error('Error fetching channels data:', err);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([fetchLeadDetails(), fetchChannelsData()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
    const unsubscribe = apiEvents.subscribe(() => {
      fetchLeadDetails();
      fetchChannelsData();
    });
    return unsubscribe;
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: '#ef4444', fontWeight: 600 }}>Lead not found or has been deleted.</p>
        <Link to="/leads" className="btn btn-secondary" style={{ marginTop: '16px' }}>Back to Leads</Link>
      </div>
    );
  }

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as any;
    try {
      const updated = await api.updateLead(lead.lead_id, { ...lead, lead_status: newStatus });
      setLead(prev => prev ? { ...prev, lead_status: updated.lead_status } : null);
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handlePriorityChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPriority = e.target.value as any;
    try {
      const updated = await api.updateLead(lead.lead_id, { ...lead, priority: newPriority });
      setLead(prev => prev ? { ...prev, priority: updated.priority } : null);
    } catch (err) {
      console.error('Error updating priority:', err);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      setSavingNote(true);
      const timestamp = new Date().toLocaleString('en-IN');
      const noteEntry = `[${timestamp}] Aman Verma (Admin): ${newNote.trim()}`;
      
      const updatedNotes = lead.notes 
        ? `${noteEntry}\n\n${lead.notes}` 
        : noteEntry;
      
      const updated = await api.updateLead(lead.lead_id, { ...lead, notes: updatedNotes });
      setLead(prev => prev ? { ...prev, notes: updated.notes } : null);
      setNewNote('');
    } catch (err) {
      console.error('Error saving note:', err);
    } finally {
      setSavingNote(false);
    }
  };

  const handleLogEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead) return;
    try {
      setSavingChannel(true);
      await api.createEmailMessage({
        ...emailForm,
        lead_id: lead.lead_id
      });
      setShowLogEmail(false);
      setEmailForm(prev => ({
        ...prev,
        subject: '',
        body: '',
        status: 'Sent'
      }));
      await fetchChannelsData();
    } catch (err) {
      console.error('Error logging email:', err);
    } finally {
      setSavingChannel(false);
    }
  };

  const handleLogSocial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead) return;
    try {
      setSavingChannel(true);
      await api.createSocialEngagement({
        ...socialForm,
        lead_id: lead.lead_id
      });
      setShowLogSocial(false);
      setSocialForm(prev => ({
        ...prev,
        content: ''
      }));
      await fetchChannelsData();
    } catch (err) {
      console.error('Error logging social interaction:', err);
    } finally {
      setSavingChannel(false);
    }
  };

  const handleDeleteLead = async () => {
    if (confirm('Are you sure you want to delete this lead?')) {
      try {
        await api.deleteLead(lead.lead_id);
        navigate('/leads');
      } catch (err) {
        console.error('Error deleting lead:', err);
      }
    }
  };

  const handleConvertLead = async () => {
    try {
      await api.convertLeadToDeal(lead.lead_id);
      alert('Lead successfully converted into a Deal!');
      navigate('/deals');
    } catch (err) {
      console.error('Error converting lead:', err);
    }
  };

  // Split notes by double-newlines for timeline display
  const noteList = lead.notes 
    ? lead.notes.split('\n\n').filter(Boolean) 
    : [];

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
          <button onClick={() => navigate('/leads')} className="back-btn" style={{
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
            <h2 style={{ fontSize: '20px', fontWeight: 700 }}>{lead.lead_title}</h2>
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <span className={`badge ${
                lead.lead_status === 'New' ? 'badge-status-new' :
                lead.lead_status === 'Contacted' ? 'badge-status-contacted' :
                lead.lead_status === 'Qualified' ? 'badge-status-qualified' :
                lead.lead_status === 'Converted' ? 'badge-status-converted' : 'badge-status-disqualified'
              }`}>{lead.lead_status}</span>
              <span className={`badge ${
                lead.priority === 'High' ? 'badge-priority-high' :
                lead.priority === 'Medium' ? 'badge-priority-medium' : 'badge-priority-low'
              }`}>{lead.priority} Priority</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {lead.lead_status !== 'Converted' && (
            <button className="btn btn-secondary btn-outline-blue" onClick={handleConvertLead}>
              <Handshake className="w-4 h-4" />
              <span>Convert to Deal</span>
            </button>
          )}
          <button className="btn btn-danger" onClick={handleDeleteLead}>
            <Trash2 className="w-4 h-4" />
            <span>Delete Lead</span>
          </button>
        </div>
      </div>

      {/* Three-Column Workspace Layout */}
      <div className="details-grid" style={{
        display: 'grid',
        gridTemplateColumns: '7fr 5fr',
        gap: '24px'
      }}>
        
        {/* Left Workspace Panel: Core Stats & Notes */}
        <div className="details-left-panel">
          
          {/* Card: Lead Information */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Info className="w-4 h-4" />
                <span>Lead Information</span>
              </div>
            </div>
            <div className="card-body">
              <div className="info-list" style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px'
              }}>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Estimated Revenue</span>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: 'hsl(150, 84%, 26%)' }}>
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(lead.estimated_revenue)}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Conversion Probability</span>
                  <span style={{ fontSize: '15px', fontWeight: 700 }}>{lead.conversion_probability}%</span>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Lead Source</span>
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>{lead.lead_source || 'N/A'}</span>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Campaign Name</span>
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>{lead.campaign_name || 'N/A'}</span>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Created Date</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                    {new Date(lead.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Last Updated</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                    {new Date(lead.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
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
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Update Status</label>
                  <select 
                    className="form-control" 
                    value={lead.lead_status} 
                    onChange={handleStatusChange}
                    style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'white' }}
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Converted">Converted</option>
                    <option value="Disqualified">Disqualified</option>
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Update Priority</label>
                  <select 
                    className="form-control" 
                    value={lead.priority} 
                    onChange={handlePriorityChange}
                    style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'white' }}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Notes & Channels Feed Panel */}
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <button 
                  onClick={() => setActiveTab('notes')}
                  style={{
                    background: 'none',
                    border: 'none',
                    borderBottom: activeTab === 'notes' ? '2px solid var(--primary, #3b82f6)' : 'none',
                    color: activeTab === 'notes' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '13.5px',
                    padding: '12px 0',
                    cursor: 'pointer'
                  }}
                >
                  Internal Notes
                </button>
                <button 
                  onClick={() => setActiveTab('channels')}
                  style={{
                    background: 'none',
                    border: 'none',
                    borderBottom: activeTab === 'channels' ? '2px solid var(--primary, #3b82f6)' : 'none',
                    color: activeTab === 'channels' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '13.5px',
                    padding: '12px 0',
                    cursor: 'pointer'
                  }}
                >
                  Channels Feed
                </button>
              </div>
            </div>
            
            <div className="card-body">
              {activeTab === 'notes' ? (
                <>
                  <form onSubmit={handleAddNote} style={{ marginBottom: '20px' }}>
                    <div className="form-group" style={{ marginBottom: '12px' }}>
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Append feedback notes or call logs to lead history..."
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
                </>
              ) : (
                /* Channels Feed Tab */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Buttons to show forms */}
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                      className="btn btn-secondary" 
                      style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                      onClick={() => { setShowLogEmail(!showLogEmail); setShowLogSocial(false); }}
                    >
                      <Mail className="w-4 h-4" />
                      <span>{showLogEmail ? 'Cancel Email' : 'Log Email'}</span>
                    </button>
                    <button 
                      className="btn btn-secondary" 
                      style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                      onClick={() => { setShowLogSocial(!showLogSocial); setShowLogEmail(false); }}
                    >
                      <Share2 className="w-4 h-4" />
                      <span>{showLogSocial ? 'Cancel Social' : 'Log Social Outreach'}</span>
                    </button>
                  </div>

                  {/* Log Email Form */}
                  {showLogEmail && (
                    <form onSubmit={handleLogEmail} style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: 'var(--bg-main)' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: 700 }}>Log Email Activity</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>Sender</label>
                          <input 
                            type="text" 
                            style={{ width: '100%', height: '32px', border: '1px solid var(--border-color)', padding: '0 8px', fontSize: '12.5px', borderRadius: '4px' }}
                            value={emailForm.sender}
                            onChange={e => setEmailForm({ ...emailForm, sender: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>Recipient</label>
                          <input 
                            type="text" 
                            style={{ width: '100%', height: '32px', border: '1px solid var(--border-color)', padding: '0 8px', fontSize: '12.5px', borderRadius: '4px' }}
                            value={emailForm.recipient}
                            onChange={e => setEmailForm({ ...emailForm, recipient: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>Direction</label>
                          <select 
                            style={{ width: '100%', height: '32px', border: '1px solid var(--border-color)', padding: '0 8px', fontSize: '12.5px', borderRadius: '4px' }}
                            value={emailForm.direction}
                            onChange={e => setEmailForm({ ...emailForm, direction: e.target.value as any })}
                          >
                            <option value="Outbound">Outbound (Sent)</option>
                            <option value="Inbound">Inbound (Received)</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>Status</label>
                          <select 
                            style={{ width: '100%', height: '32px', border: '1px solid var(--border-color)', padding: '0 8px', fontSize: '12.5px', borderRadius: '4px' }}
                            value={emailForm.status}
                            onChange={e => setEmailForm({ ...emailForm, status: e.target.value as any })}
                          >
                            <option value="Sent">Sent</option>
                            <option value="Opened">Opened</option>
                            <option value="Clicked">Clicked</option>
                            <option value="Received">Received</option>
                            <option value="Failed">Failed</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>Subject</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Confirming Meeting Details"
                          style={{ width: '100%', height: '32px', border: '1px solid var(--border-color)', padding: '0 8px', fontSize: '12.5px', borderRadius: '4px' }}
                          value={emailForm.subject}
                          onChange={e => setEmailForm({ ...emailForm, subject: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>Body Message</label>
                        <textarea 
                          rows={4}
                          placeholder="Type details of the conversation..."
                          style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', fontSize: '12.5px', borderRadius: '4px' }}
                          value={emailForm.body}
                          onChange={e => setEmailForm({ ...emailForm, body: e.target.value })}
                          required
                        />
                      </div>
                      <button type="submit" className="btn btn-primary" style={{ height: '32px', alignSelf: 'flex-end' }} disabled={savingChannel}>
                        {savingChannel ? 'Logging...' : 'Save Email Log'}
                      </button>
                    </form>
                  )}

                  {/* Log Social Form */}
                  {showLogSocial && (
                    <form onSubmit={handleLogSocial} style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: 'var(--bg-main)' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: 700 }}>Log Social Outreach / mention</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>Platform</label>
                          <select 
                            style={{ width: '100%', height: '32px', border: '1px solid var(--border-color)', padding: '0 8px', fontSize: '12.5px', borderRadius: '4px' }}
                            value={socialForm.platform}
                            onChange={e => setSocialForm({ ...socialForm, platform: e.target.value as any })}
                          >
                            <option value="LinkedIn">LinkedIn</option>
                            <option value="Twitter">Twitter (X)</option>
                            <option value="Facebook">Facebook</option>
                            <option value="Instagram">Instagram</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>Sender Handle</label>
                          <input 
                            type="text" 
                            style={{ width: '100%', height: '32px', border: '1px solid var(--border-color)', padding: '0 8px', fontSize: '12.5px', borderRadius: '4px' }}
                            value={socialForm.sender_handle}
                            onChange={e => setSocialForm({ ...socialForm, sender_handle: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>Direction</label>
                          <select 
                            style={{ width: '100%', height: '32px', border: '1px solid var(--border-color)', padding: '0 8px', fontSize: '12.5px', borderRadius: '4px' }}
                            value={socialForm.direction}
                            onChange={e => setSocialForm({ ...socialForm, direction: e.target.value as any })}
                          >
                            <option value="Outbound">Outbound ( Outreach )</option>
                            <option value="Inbound">Inbound ( Mention / DM )</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>Message Details</label>
                        <textarea 
                          rows={3}
                          placeholder="Type details of the outreach..."
                          style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', fontSize: '12.5px', borderRadius: '4px' }}
                          value={socialForm.content}
                          onChange={e => setSocialForm({ ...socialForm, content: e.target.value })}
                          required
                        />
                      </div>
                      <button type="submit" className="btn btn-primary" style={{ height: '32px', alignSelf: 'flex-end' }} disabled={savingChannel}>
                        {savingChannel ? 'Logging...' : 'Save Social outreach'}
                      </button>
                    </form>
                  )}

                  {/* Chronological Communication Timeline */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {(() => {
                      const feedItems = [
                        ...emails.map(e => ({
                          type: 'email',
                          id: e.email_id,
                          timestamp: e.timestamp,
                          direction: e.direction,
                          title: e.subject,
                          body: e.body,
                          meta: `${e.direction === 'Inbound' ? 'From' : 'To'}: ${e.direction === 'Inbound' ? e.sender : e.recipient} (${e.status})`,
                          badge: 'Email'
                        })),
                        ...socials.map(s => ({
                          type: 'social',
                          id: s.engagement_id,
                          timestamp: s.timestamp,
                          direction: s.direction,
                          title: `${s.platform} DM Outreach`,
                          body: s.content,
                          meta: `Sender Handle: ${s.sender_handle}`,
                          badge: s.platform
                        }))
                      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

                      if (feedItems.length === 0) {
                        return <p style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center' }}>No communication log logged yet.</p>;
                      }

                      return feedItems.map(item => (
                        <div key={item.id} style={{
                          padding: '14px 16px',
                          backgroundColor: 'var(--bg-main)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-color)',
                          fontSize: '13px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {item.type === 'email' ? <Mail className="w-4 h-4 text-blue-500" /> : <MessageCircle className="w-4 h-4 text-purple-500" />}
                              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.title}</span>
                            </div>
                            <span className="badge" style={{ fontSize: '10px', padding: '1px 6px', border: 'none', backgroundColor: item.type === 'email' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(139, 92, 246, 0.1)', color: item.type === 'email' ? '#3b82f6' : '#8b5cf6' }}>
                              {item.badge}
                            </span>
                          </div>

                          <p style={{ color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: '1.4', marginBottom: '8px' }}>
                            {item.body}
                          </p>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-secondary)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px' }}>
                            <span>{item.meta}</span>
                            <span>{new Date(item.timestamp).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</span>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>

                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Workspace Panel: Relational cards */}
        <div className="details-right-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
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
                  {lead.company_id ? (
                    <Link to={`/companies/${lead.company_id}`} style={{ fontWeight: 700, fontSize: '15px', color: 'var(--primary)', textDecoration: 'underline' }}>
                      {lead.company_name}
                    </Link>
                  ) : (
                    <span style={{ fontWeight: 700, fontSize: '15px' }}>Unknown Company</span>
                  )}
                  <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Industry: {lead.company_industry || 'N/A'}
                  </span>
                  {lead.company_website && (
                    <a href={lead.company_website} target="_blank" rel="noopener noreferrer" style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      color: 'var(--primary)',
                      marginTop: '6px'
                    }}>
                      Visit Website &rarr;
                    </a>
                  )}
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
                    {lead.contact_first_name ? `${lead.contact_first_name} ${lead.contact_last_name || ''}` : 'N/A'}
                  </span>
                  <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {lead.contact_email || 'No email saved'}
                  </span>
                  <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Mobile: {lead.contact_mobile || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Assigned Owner */}
          <div className="card related-card" style={{ marginBottom: 0 }}>
            <div className="card-header">
              <div className="card-title">
                <ShieldAlert className="w-4 h-4" />
                <span>Assigned Owner</span>
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
                    {lead.assigned_user_name || 'Unassigned'}
                  </span>
                  <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Creator: {lead.creator_name || 'System'}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
