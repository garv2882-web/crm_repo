import { useEffect, useState } from 'react';
import { api, apiEvents, type SupportCase, type Company, type User, type KBArticle, type Task } from '../../api';
import { Plus, Search, RefreshCw, Clock, CheckCircle2, X, BookOpen } from 'lucide-react';

export default function SupportCasesPage() {
  const [cases, setCases] = useState<SupportCase[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [kbArticles, setKbArticles] = useState<KBArticle[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Search, Filter and Selected Case State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [newCase, setNewCase] = useState({
    subject: '',
    company_id: '',
    assigned_to: '',
    priority: 'Medium' as any,
    description: ''
  });

  // KB Search inside Detail Panel
  const [kbSearchTerm, setKbSearchTerm] = useState('');
  const [showKbSearch, setShowKbSearch] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [casesData, companiesData, usersData, kbData, tasksData] = await Promise.all([
        api.getSupportCases(),
        api.getCompanies(),
        api.getUsers(),
        api.getKBArticles(),
        api.getTasks()
      ]);
      setCases(casesData);
      setCompanies(companiesData);
      setUsers(usersData);
      setKbArticles(kbData);
      setTasks(tasksData);
    } catch (err) {
      console.error('Error fetching support cases data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    return apiEvents.subscribe(() => {
      fetchData();
    });
  }, []);

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createSupportCase({
        ...newCase,
        status: 'New'
      });
      setShowModal(false);
      setNewCase({
        subject: '',
        company_id: '',
        assigned_to: '',
        priority: 'Medium',
        description: ''
      });
    } catch (err) {
      console.error('Error filing case:', err);
    }
  };

  const handleUpdateStatus = async (caseId: string, status: any) => {
    try {
      await api.updateSupportCase(caseId, { status });
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleUpdatePriority = async (caseId: string, priority: any) => {
    try {
      await api.updateSupportCase(caseId, { priority });
    } catch (err) {
      console.error('Error updating priority:', err);
    }
  };

  const handleLinkSolution = async (caseId: string, articleId: string) => {
    try {
      await api.updateSupportCase(caseId, { solution_id: articleId });
      setShowKbSearch(false);
    } catch (err) {
      console.error('Error linking solution:', err);
    }
  };

  const handleUnlinkSolution = async (caseId: string) => {
    try {
      await api.updateSupportCase(caseId, { solution_id: '' });
    } catch (err) {
      console.error('Error unlinking solution:', err);
    }
  };

  const handleCreateSupportTask = async (caseRecord: SupportCase, title: string) => {
    if (!title.trim()) return;
    try {
      await api.createTask({
        title: `[Support Case ${caseRecord.case_number}] ${title}`,
        company_id: caseRecord.company_id,
        assigned_to: caseRecord.assigned_to,
        priority: caseRecord.priority === 'Critical' ? 'High' : (caseRecord.priority as any),
        status: 'Pending',
        description: `Linked support ticket: ${caseRecord.subject}`
      });
    } catch (err) {
      console.error('Error creating support task:', err);
    }
  };

  const handleToggleTaskStatus = async (task: Task) => {
    const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      await api.updateTask(task.task_id, { status: nextStatus });
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  };

  // Filters logic
  const filteredCases = cases.filter(c => {
    const matchesSearch = c.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.case_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.company_name && c.company_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || c.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const selectedCase = cases.find(c => c.case_id === selectedCaseId);

  // Filter KB articles matching search
  const filteredArticles = kbArticles.filter(art => 
    art.title.toLowerCase().includes(kbSearchTerm.toLowerCase()) ||
    art.category.toLowerCase().includes(kbSearchTerm.toLowerCase())
  );

  // Filter tasks linked to the selected case
  const caseTasks = selectedCase ? tasks.filter(t => t.title.includes(selectedCase.case_number)) : [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'New': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'In Progress': return <RefreshCw className="w-4 h-4 text-amber-500 animate-spin-slow" />;
      case 'Resolved': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'Closed': return <CheckCircle2 className="w-4 h-4 text-slate-500" />;
      default: return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'badge-priority-high';
      case 'High': return 'badge-priority-high';
      case 'Medium': return 'badge-priority-medium';
      case 'Low': return 'badge-priority-low';
      default: return '';
    }
  };

  return (
    <div className="support-workspace animate-fade-in" style={{ paddingBottom: '40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top action bar */}
      <div className="action-bar-top" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>Customer Support & Tickets</h2>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Manage tickets, customer queries, and resolution solutions</span>
        </div>
        
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" />
          <span>File Support Ticket</span>
        </button>
      </div>

      {/* Main Split Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: selectedCase ? '1.5fr 1fr' : '1fr',
        gap: '24px',
        alignItems: 'start',
        transition: 'all 0.3s ease'
      }}>
        
        {/* Cases List Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Filters card */}
          <div className="card">
            <div className="card-body" style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                
                {/* Search */}
                <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                  <Search className="w-4 h-4 text-slate-400" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="Search by ID, subject, company name..."
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

                {/* Status */}
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
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
                  <option value="In Progress">In Progress</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>

                {/* Priority */}
                <select
                  value={priorityFilter}
                  onChange={e => setPriorityFilter(e.target.value)}
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
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>

              </div>
            </div>
          </div>

          {/* Table list */}
          {loading ? (
            <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600 inline-block mb-2" />
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Loading cases directory...</p>
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>No support tickets matching filters found.</p>
            </div>
          ) : (
            <div className="card" style={{ overflow: 'hidden' }}>
              <div className="table-wrapper">
                <table className="crm-table">
                  <thead>
                    <tr>
                      <th>Case ID</th>
                      <th>Subject</th>
                      <th>Company</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Owner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCases.map(c => (
                      <tr 
                        key={c.case_id} 
                        onClick={() => setSelectedCaseId(c.case_id)}
                        className={selectedCaseId === c.case_id ? 'table-row-selected' : ''}
                        style={{ cursor: 'pointer', backgroundColor: selectedCaseId === c.case_id ? 'var(--bg-table-th)' : '' }}
                      >
                        <td style={{ fontWeight: 700 }}>{c.case_number}</td>
                        <td>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.subject}</span>
                        </td>
                        <td>{c.company_name || 'N/A'}</td>
                        <td>
                          <span className={`badge ${getPriorityBadgeClass(c.priority)}`}>
                            {c.priority}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {getStatusIcon(c.status)}
                            <span>{c.status}</span>
                          </div>
                        </td>
                        <td>{c.assigned_user_name || 'Unassigned'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Support Case Detail Split View Panel */}
        {selectedCase && (
          <div className="card animate-slide-in-right" style={{ position: 'sticky', top: '20px' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary)' }}>{selectedCase.case_number}</span>
                <h3 style={{ fontSize: '15px', fontWeight: 700, marginTop: '2px' }}>Ticket Details</h3>
              </div>
              <button 
                onClick={() => setSelectedCaseId(null)}
                style={{ background: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="card-body" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Subject & Description */}
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>Subject</span>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>{selectedCase.subject}</p>
                {selectedCase.description && (
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px', whiteSpace: 'pre-wrap', backgroundColor: 'var(--bg-main)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
                    {selectedCase.description}
                  </p>
                )}
              </div>

              {/* Status and Priority Dropdowns */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '6px' }}>Status</label>
                  <select
                    value={selectedCase.status}
                    onChange={e => handleUpdateStatus(selectedCase.case_id, e.target.value as any)}
                    style={{ width: '100%', height: '36px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0 8px', fontSize: '13px' }}
                  >
                    <option value="New">New</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '6px' }}>Priority</label>
                  <select
                    value={selectedCase.priority}
                    onChange={e => handleUpdatePriority(selectedCase.case_id, e.target.value as any)}
                    style={{ width: '100%', height: '36px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0 8px', fontSize: '13px' }}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              {/* Associated Company info */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <span style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>Customer Account</span>
                <span style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {selectedCase.company_name || 'N/A'}
                </span>
              </div>

              {/* KB / Resolution Link */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>Linked Solution Article</span>
                  {!selectedCase.solution_id && (
                    <button 
                      onClick={() => setShowKbSearch(!showKbSearch)}
                      className="text-btn" 
                      style={{ fontSize: '11.5px', fontWeight: 600 }}
                    >
                      Search KB
                    </button>
                  )}
                </div>

                {selectedCase.solution_id ? (
                  (() => {
                    const article = kbArticles.find(a => a.article_id === selectedCase.solution_id);
                    return (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-main)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                          <BookOpen className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span style={{ fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {article?.title || 'Linked Solution'}
                          </span>
                        </div>
                        <button 
                          onClick={() => handleUnlinkSolution(selectedCase.case_id)}
                          style={{ background: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '11px' }}
                        >
                          Unlink
                        </button>
                      </div>
                    );
                  })()
                ) : (
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px' }}>No KB solution linked to this support ticket.</p>
                )}

                {/* KB Article Link Search list */}
                {showKbSearch && (
                  <div style={{ marginTop: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '10px', backgroundColor: 'var(--bg-card)' }}>
                    <input
                      type="text"
                      placeholder="Search articles..."
                      value={kbSearchTerm}
                      onChange={e => setKbSearchTerm(e.target.value)}
                      style={{ width: '100%', height: '30px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0 8px', fontSize: '12px', marginBottom: '8px' }}
                    />
                    <div style={{ maxHeight: '120px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {filteredArticles.map(art => (
                        <div 
                          key={art.article_id}
                          onClick={() => handleLinkSolution(selectedCase.case_id, art.article_id)}
                          style={{ padding: '6px', fontSize: '12px', cursor: 'pointer', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-main)' }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-table-th)'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--bg-main)'}
                        >
                          <span style={{ fontWeight: 600 }}>{art.title}</span>
                          <span style={{ color: 'var(--primary)', fontSize: '11px' }}>Link</span>
                        </div>
                      ))}
                      {filteredArticles.length === 0 && (
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'center' }}>No articles found.</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Checklist & Tasks for Support Case */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <span style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '8px' }}>
                  Support Tasks ({caseTasks.length})
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                  {caseTasks.map(t => (
                    <div 
                      key={t.task_id}
                      onClick={() => handleToggleTaskStatus(t)}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                    >
                      <input 
                        type="checkbox" 
                        checked={t.status === 'Completed'} 
                        onChange={() => {}} 
                        style={{ cursor: 'pointer' }}
                      />
                      <span style={{
                        fontSize: '12.5px', 
                        color: t.status === 'Completed' ? 'var(--text-muted)' : 'var(--text-primary)',
                        textDecoration: t.status === 'Completed' ? 'line-through' : 'none'
                      }}>
                        {t.title.replace(`[Support Case ${selectedCase.case_number}] `, '')}
                      </span>
                    </div>
                  ))}
                  {caseTasks.length === 0 && (
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>No tasks scheduled for this support case.</p>
                  )}
                </div>

                {/* Create case-linked task input */}
                <form onSubmit={e => {
                  e.preventDefault();
                  const target = e.currentTarget.elements.namedItem('taskTitle') as HTMLInputElement;
                  handleCreateSupportTask(selectedCase, target.value);
                  target.value = '';
                }} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    name="taskTitle"
                    placeholder="Add checklist action item..."
                    style={{ flex: 1, height: '32px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0 8px', fontSize: '12.5px' }}
                  />
                  <button type="submit" className="btn btn-secondary" style={{ padding: '0 12px', height: '32px', fontSize: '12px' }}>Add</button>
                </form>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* File Case Modal */}
      {showModal && (
        <div className="modal-overlay show" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Log Customer Support Case</h3>
              <button 
                onClick={() => setShowModal(false)}
                style={{ background: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleCreateCase}>
              <div className="modal-body" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Case Subject */}
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Subject / Issue Summary *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Replication latency or Invoice fail"
                      value={newCase.subject}
                      onChange={e => setNewCase({ ...newCase, subject: e.target.value })}
                      required
                      style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                    />
                  </div>

                  {/* Company Link */}
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Link Customer Company Account *</label>
                    <select
                      className="form-control"
                      value={newCase.company_id}
                      onChange={e => setNewCase({ ...newCase, company_id: e.target.value })}
                      required
                      style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                    >
                      <option value="">-- Select Company Account --</option>
                      {companies.map(c => (
                        <option key={c.company_id} value={c.company_id}>{c.company_name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Assign Representative */}
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Assign Support Rep *</label>
                    <select
                      className="form-control"
                      value={newCase.assigned_to}
                      onChange={e => setNewCase({ ...newCase, assigned_to: e.target.value })}
                      required
                      style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                    >
                      <option value="">-- Choose Representative --</option>
                      {users.map(u => (
                        <option key={u.user_id} value={u.user_id}>{u.full_name} ({u.role})</option>
                      ))}
                    </select>
                  </div>

                  {/* Priority */}
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Case Severity / Priority</label>
                    <select
                      className="form-control"
                      value={newCase.priority}
                      onChange={e => setNewCase({ ...newCase, priority: e.target.value as any })}
                      style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>

                  {/* Description */}
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Issue Description / Replication Steps</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      placeholder="Describe detailed symptoms of the problem..."
                      value={newCase.description}
                      onChange={e => setNewCase({ ...newCase, description: e.target.value })}
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
                <button type="submit" className="btn btn-primary">Log Support Case</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
