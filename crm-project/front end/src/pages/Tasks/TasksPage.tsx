import { useEffect, useState } from 'react';
import { api, type Task, type User, type Lead, type Company } from '../../api';
import { Plus, Search, RefreshCw, Trash2, Calendar, UserCheck } from 'lucide-react';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  // Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Creation Modal
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assigned_to: '',
    lead_id: '',
    company_id: '',
    due_date: '',
    priority: 'Medium' as any,
    status: 'Pending' as any
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksData, usersData, leadsData, companiesData] = await Promise.all([
        api.getTasks(),
        api.getUsers(),
        api.getLeads(),
        api.getCompanies()
      ]);
      setTasks(tasksData);
      setUsers(usersData);
      setLeads(leadsData);
      setCompanies(companiesData);
    } catch (err) {
      console.error('Error fetching tasks workspace data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        ...newTask,
        due_date: newTask.due_date ? new Date(newTask.due_date).toISOString() : undefined
      };
      await api.createTask(dataToSubmit);
      setShowModal(false);
      setNewTask({
        title: '',
        description: '',
        assigned_to: '',
        lead_id: '',
        company_id: '',
        due_date: '',
        priority: 'Medium',
        status: 'Pending'
      });
      fetchData();
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  const handleToggleStatus = async (task: Task) => {
    const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      await api.updateTask(task.task_id, {
        ...task,
        status: nextStatus
      });
      // Update local state directly for speed
      setTasks(prev => prev.map(t => t.task_id === task.task_id ? { ...t, status: nextStatus } : t));
    } catch (err) {
      console.error('Error toggling task status:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await api.deleteTask(taskId);
        setTasks(prev => prev.filter(t => t.task_id !== taskId));
      } catch (err) {
        console.error('Error deleting task:', err);
      }
    }
  };

  // Filters
  const filtered = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || 
      (statusFilter === 'Completed' && t.status === 'Completed') ||
      (statusFilter === 'Pending' && t.status !== 'Completed');
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="tasks-workspace animate-fade-in" style={{ paddingBottom: '40px' }}>
      
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
          <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Task Checklist</h2>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Manage calls, meetings, proposals, and operations reminders</span>
        </div>
        
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" />
          <span>Save New Task</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-body" style={{ padding: '16px 20px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search className="w-4 h-4 text-slate-400" style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)'
            }} />
            <input
              type="text"
              placeholder="Search tasks..."
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

          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{
                height: '38px',
                padding: '0 12px',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'white',
                fontSize: '13.5px'
              }}
            >
              <option value="All">All Tasks</option>
              <option value="Pending">Open (Pending / In Progress)</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List Card */}
      {loading ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600 inline-block mb-2" />
          <p style={{ color: 'var(--text-secondary)' }}>Loading task lists...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No reminders or tasks registered under this criteria.</p>
        </div>
      ) : (
        <div className="card">
          <div className="card-body" style={{ padding: '0px' }}>
            {filtered.map(t => (
              <div key={t.task_id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1px solid var(--border-color)',
                opacity: t.status === 'Completed' ? 0.6 : 1,
                backgroundColor: t.status === 'Completed' ? 'var(--bg-main)' : 'white',
                transition: 'opacity 0.2s ease, background-color 0.2s ease'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flex: 1 }}>
                  {/* Status checkbox */}
                  <input
                    type="checkbox"
                    checked={t.status === 'Completed'}
                    onChange={() => handleToggleStatus(t)}
                    style={{
                      marginTop: '4px',
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                      accentColor: 'var(--primary)'
                    }}
                  />
                  
                  <div>
                    <h4 style={{
                      fontSize: '14.5px',
                      fontWeight: 600,
                      textDecoration: t.status === 'Completed' ? 'line-through' : 'none',
                      color: 'var(--text-primary)'
                    }}>
                      {t.title}
                    </h4>
                    {t.description && (
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        {t.description}
                      </p>
                    )}
                    
                    {/* Meta data items */}
                    <div style={{ display: 'flex', gap: '16px', marginTop: '8px', flexWrap: 'wrap' }}>
                      {t.due_date && (
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Due: {new Date(t.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </span>
                      )}
                      
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Owner: {t.assigned_user_name || 'System'}</span>
                      </span>

                      {(t.lead_title || t.company_name) && (
                        <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--primary)' }}>
                          Linked to: {t.lead_title || t.company_name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span className={`badge ${
                    t.priority === 'High' ? 'badge-priority-high' :
                    t.priority === 'Medium' ? 'badge-priority-medium' : 'badge-priority-low'
                  }`} style={{ fontSize: '9px', padding: '2px 8px' }}>
                    {t.priority}
                  </span>

                  <button
                    onClick={() => handleDeleteTask(t.task_id)}
                    style={{ background: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}
                    title="Delete Reminder"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Creation Modal */}
      {showModal && (
        <div className="modal-overlay show" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Add New Task / Checklist</h3>
              <button 
                onClick={() => setShowModal(false)}
                style={{ background: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleCreateTask}>
              <div className="modal-body" style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  
                  {/* Title */}
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Task Summary *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Schedule discovery call, Review pricing deck"
                      value={newTask.title}
                      onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                      required
                      style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                    />
                  </div>

                  {/* Description */}
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Details / Requirements</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      placeholder="Explain action items, agenda or preparation notes..."
                      value={newTask.description}
                      onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                      style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                    />
                  </div>

                  {/* Assigned User */}
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Assign To *</label>
                    <select
                      className="form-control"
                      value={newTask.assigned_to}
                      onChange={e => setNewTask({ ...newTask, assigned_to: e.target.value })}
                      required
                      style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                    >
                      <option value="">-- Choose User --</option>
                      {users.map(u => (
                        <option key={u.user_id} value={u.user_id}>{u.full_name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Due Date */}
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Due Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={newTask.due_date}
                      onChange={e => setNewTask({ ...newTask, due_date: e.target.value })}
                      style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                    />
                  </div>

                  {/* Lead Association */}
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Link to Lead (Optional)</label>
                    <select
                      className="form-control"
                      value={newTask.lead_id}
                      onChange={e => {
                        const selLead = leads.find(l => l.lead_id === e.target.value);
                        setNewTask({
                          ...newTask,
                          lead_id: e.target.value,
                          company_id: selLead?.company_id || newTask.company_id
                        });
                      }}
                      style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                    >
                      <option value="">-- Select Lead --</option>
                      {leads.map(l => (
                        <option key={l.lead_id} value={l.lead_id}>{l.lead_title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Company Association */}
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Link to Company (Optional)</label>
                    <select
                      className="form-control"
                      value={newTask.company_id}
                      onChange={e => setNewTask({ ...newTask, company_id: e.target.value })}
                      style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                    >
                      <option value="">-- Select Company --</option>
                      {companies.map(c => (
                        <option key={c.company_id} value={c.company_id}>{c.company_name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Priority */}
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Priority Level</label>
                    <select
                      className="form-control"
                      value={newTask.priority}
                      onChange={e => setNewTask({ ...newTask, priority: e.target.value as any })}
                      style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
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
                <button type="submit" className="btn btn-primary">Save Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
