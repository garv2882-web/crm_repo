import { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { api, type User } from '../../api';
import { 
  Plus, 
  Search, 
  X, 
  UserMinus, 
  UserPlus, 
  Check, 
  Mail, 
  Copy,
  Info
} from 'lucide-react';

export default function AdminEmployees() {
  const { users, deals, tasks, activityLog, sessions, settings, refreshData } = useCRM();

  // Search and Sort states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'status'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modals / Drawer active state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [drawerTab, setDrawerTab] = useState<'profile' | 'work' | 'perms' | 'sessions'>('profile');

  // Add Employee Form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDesignation, setNewDesignation] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [newRole, setNewRole] = useState('Sales Rep — Standard');
  const [newNote, setNewNote] = useState('');
  const [addError, setAddError] = useState('');
  const [createdInvite, setCreatedInvite] = useState<{ email: string; link: string } | null>(null);

  // Edit Employee Form state (in Drawer)
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editDesignation, setEditDesignation] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editNote, setEditNote] = useState('');
  const [drawerMsg, setDrawerMsg] = useState('');

  // Get active selected user
  const selectedUser = users.find(u => u.user_id === selectedUserId);

  const handleOpenDrawer = (user: User) => {
    setSelectedUserId(user.user_id);
    setDrawerTab('profile');
    setEditName(user.full_name);
    setEditEmail(user.email);
    setEditDesignation(user.designation || '');
    setEditDepartment(user.department || '');
    setEditRole(user.role);
    setEditNote(user.notes || '');
    setDrawerMsg('');
  };

  const handleCloseDrawer = () => {
    setSelectedUserId(null);
  };

  // Sort and Search filtering
  const filteredUsers = users.filter(user => {
    const term = searchTerm.toLowerCase();
    return (
      user.full_name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term)
    );
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aVal = '';
    let bVal = '';
    
    if (sortBy === 'name') {
      aVal = a.full_name;
      bVal = b.full_name;
    } else if (sortBy === 'email') {
      aVal = a.email;
      bVal = b.email;
    } else if (sortBy === 'status') {
      aVal = a.status;
      bVal = b.status;
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field: 'name' | 'email' | 'status') => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Add Employee submit
  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) {
      setAddError('Full Name and Email are required');
      return;
    }
    
    try {
      setAddError('');
      const emp = await api.createEmployee({
        full_name: newName,
        email: newEmail,
        designation: newDesignation,
        department: newDepartment,
        role: newRole,
        notes: newNote
      });

      // Generate simulation signup invitation link
      const inviteLink = `${window.location.origin}/signup?email=${encodeURIComponent(emp.email)}`;
      setCreatedInvite({ email: emp.email, link: inviteLink });
      
      // Clear forms
      setNewName('');
      setNewEmail('');
      setNewDesignation('');
      setNewDepartment('');
      setNewRole('Sales Rep — Standard');
      setNewNote('');
      refreshData();
    } catch (err: any) {
      setAddError(err.message || 'Failed to add employee');
    }
  };

  // Save changes in profile tab
  const handleSaveProfileChanges = async () => {
    if (!selectedUserId) return;
    try {
      setDrawerMsg('');
      await api.updateEmployee(selectedUserId, {
        full_name: editName,
        email: editEmail,
        designation: editDesignation,
        department: editDepartment,
        role: editRole,
        notes: editNote
      });
      setDrawerMsg('Profile updated successfully.');
      refreshData();
    } catch (err: any) {
      setDrawerMsg(err.message || 'Failed to update profile');
    }
  };

  // Suspend Employee
  const handleToggleSuspend = async () => {
    if (!selectedUser) return;
    try {
      setDrawerMsg('');
      const newStatus = selectedUser.status === 'Suspended' ? 'Active' : 'Suspended';
      await api.updateEmployee(selectedUser.user_id, { status: newStatus });
      setDrawerMsg(`Account status changed to ${newStatus}.`);
      refreshData();
    } catch (err: any) {
      setDrawerMsg(err.message || 'Failed to alter account status');
    }
  };

  // Toggle overrides in permission tab
  const handleTogglePermissionOverride = async (permissionKey: string) => {
    if (!selectedUser) return;
    
    // Get active role template defaults
    const template = settings.roleTemplates.find(t => t.name === selectedUser.role);
    const templateDefault = template ? template.permissions[permissionKey] : false;

    // Get current overrides
    const currentOverrides = selectedUser.custom_permissions || {};
    const currentVal = currentOverrides[permissionKey] !== undefined 
      ? currentOverrides[permissionKey] 
      : templateDefault;

    // Toggle value
    const newVal = !currentVal;

    const updatedOverrides = { ...currentOverrides };
    
    // If the new value matches the template default, remove the override key. Otherwise, store it.
    if (newVal === templateDefault) {
      delete updatedOverrides[permissionKey];
    } else {
      updatedOverrides[permissionKey] = newVal;
    }

    try {
      await api.updateEmployee(selectedUser.user_id, {
        custom_permissions: updatedOverrides
      });
      refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  // Work Summary Statistics
  const getEmployeeMetrics = (user: User) => {
    const ownedDeals = deals.filter(d => d.deal_owner === user.user_id);
    const stageCounts = settings.dealStages.reduce((acc, stage) => {
      acc[stage.name] = ownedDeals.filter(d => d.deal_stage === stage.id).length;
      return acc;
    }, {} as Record<string, number>);

    const assignedTasks = tasks.filter(t => t.assigned_to === user.user_id);
    const completedTasks = assignedTasks.filter(t => t.status === 'Completed').length;
    const pendingTasks = assignedTasks.filter(t => t.status === 'Pending' || t.status === 'In Progress').length;
    
    const now = new Date();
    const overdueTasks = assignedTasks.filter(t => {
      if (t.status === 'Completed') return false;
      return new Date(t.due_date).getTime() < now.getTime();
    }).length;

    // Audit logs for user
    const recentActions = activityLog
      .filter(log => log.actor_email.toLowerCase() === user.email.toLowerCase())
      .slice(0, 5);

    return {
      dealsTotal: ownedDeals.length,
      dealsValue: ownedDeals.reduce((sum, d) => sum + Number(d.deal_value || 0), 0),
      stageCounts,
      tasksTotal: assignedTasks.length,
      completedTasks,
      pendingTasks,
      overdueTasks,
      recentActions
    };
  };

  const getFormatDuration = (seconds?: number) => {
    if (seconds === undefined) return 'Active';
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    const rm = mins % 60;
    return `${hrs}h ${rm}m`;
  };

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return 'Never';
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (isoStr?: string) => {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Banner Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
            Employee Access Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Control system access credentials, role template permissions, and audit individual performance.
          </p>
        </div>
        <button 
          onClick={() => { setIsAddModalOpen(true); setCreatedInvite(null); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--primary)',
            color: 'white',
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <Plus className="w-4 h-4" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Search Bar Filter */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '8px 16px',
        width: '100%',
        maxWidth: '360px',
        gap: '12px'
      }}>
        <Search className="w-5 h-5 text-slate-400" />
        <input 
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ width: '100%', fontSize: '14px', border: 'none', outline: 'none' }}
        />
      </div>

      {/* Employee Table Directory */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-table-th)' }}>
              <th 
                onClick={() => handleSort('name')}
                style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                Full Name {sortBy === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th 
                onClick={() => handleSort('email')}
                style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                Email Address {sortBy === 'email' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-secondary)' }}>Designation</th>
              <th style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-secondary)' }}>Department</th>
              <th style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-secondary)' }}>CRM Role</th>
              <th 
                onClick={() => handleSort('status')}
                style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                Account Status {sortBy === 'status' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-secondary)' }}>Last Active</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map(user => (
              <tr 
                key={user.user_id}
                onClick={() => handleOpenDrawer(user)}
                style={{
                  borderBottom: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-main)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-primary)' }}>{user.full_name}</td>
                <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>{user.email}</td>
                <td style={{ padding: '14px 18px' }}>{user.designation || '—'}</td>
                <td style={{ padding: '14px 18px' }}>{user.department || '—'}</td>
                <td style={{ padding: '14px 18px' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary)',
                    padding: '2px 8px',
                    borderRadius: '12px'
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: '14px 18px' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    backgroundColor: 
                      user.status === 'Active' ? 'hsl(150, 80%, 95%)' : 
                      user.status === 'Suspended' ? 'hsl(0, 100%, 96%)' : 'hsl(35, 100%, 96%)',
                    color: 
                      user.status === 'Active' ? 'hsl(150, 84%, 26%)' : 
                      user.status === 'Suspended' ? 'hsl(0, 72%, 40%)' : 'hsl(35, 92%, 35%)'
                  }}>
                    {user.status}
                  </span>
                </td>
                <td style={{ padding: '14px 18px', color: 'var(--text-tertiary)' }}>
                  {user.last_active ? formatDate(user.last_active) : 'Never logged in'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD EMPLOYEE MODAL */}
      {isAddModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div 
            style={{
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '520px',
              width: '100%',
              padding: '32px',
              boxShadow: 'var(--shadow-lg)',
              position: 'relative'
            }}
            className="animate-fade-in"
          >
            <button 
              onClick={() => setIsAddModalOpen(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                padding: '6px',
                cursor: 'pointer',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-table-hover)'
              }}
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>

            {!createdInvite ? (
              <>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
                  Invite New Employee
                </h3>
                <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Enter details to register their employee account and trigger login credentials.
                </p>

                {addError && (
                  <div style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.15)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 14px',
                    fontSize: '13px',
                    color: '#ef4444',
                    marginBottom: '16px'
                  }}>
                    {addError}
                  </div>
                )}

                <form onSubmit={handleAddEmployee} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Name field */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Full Name</label>
                    <input 
                      type="text"
                      placeholder="e.g. Garv Ranjan"
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      required
                      style={{ padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontSize: '13px' }}
                    />
                  </div>

                  {/* Email field */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Email Address</label>
                    <input 
                      type="email"
                      placeholder="name@company.com"
                      value={newEmail}
                      onChange={e => setNewEmail(e.target.value)}
                      required
                      style={{ padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontSize: '13px' }}
                    />
                  </div>

                  {/* Designation & Department */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Designation</label>
                      <input 
                        type="text"
                        placeholder="e.g. Sales Director"
                        value={newDesignation}
                        onChange={e => setNewDesignation(e.target.value)}
                        style={{ padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontSize: '13px' }}
                      />
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Department</label>
                      <select 
                        value={newDepartment}
                        onChange={e => setNewDepartment(e.target.value)}
                        style={{ padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontSize: '13px', backgroundColor: 'var(--bg-card)' }}
                      >
                        <option value="">Select Department</option>
                        {settings.departments.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                        <option value="custom">Other (Free-text)</option>
                      </select>
                      {newDepartment === 'custom' && (
                        <input 
                          type="text"
                          placeholder="Type custom department..."
                          onChange={e => setNewDepartment(e.target.value)}
                          style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontSize: '13px', marginTop: '6px' }}
                        />
                      )}
                    </div>
                  </div>

                  {/* CRM Role Template selection */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>CRM Role Template</label>
                    <select 
                      value={newRole}
                      onChange={e => setNewRole(e.target.value)}
                      style={{ padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontSize: '13px', backgroundColor: 'var(--bg-card)' }}
                    >
                      {settings.roleTemplates.map(t => (
                        <option key={t.name} value={t.name}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Notes field */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Internal Notes (Optional)</label>
                    <textarea 
                      placeholder="Add onboarding notes..."
                      value={newNote}
                      onChange={e => setNewNote(e.target.value)}
                      style={{ padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontSize: '13px', height: '60px', resize: 'vertical' }}
                    />
                  </div>

                  <button 
                    type="submit"
                    style={{
                      width: '100%',
                      padding: '12px 0',
                      backgroundColor: 'var(--primary)',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: 600,
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      marginTop: '10px'
                    }}
                  >
                    Generate Account & Invite
                  </button>
                </form>
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: 'hsl(150, 80%, 95%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-qualified)',
                  margin: '0 auto 16px auto'
                }}>
                  <Check className="w-6 h-6" />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
                  Employee Account Created!
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 20px 0' }}>
                  The employee record has been seeded in state with status <strong>Pending</strong>.
                </p>

                {/* Copiable Link block */}
                <div style={{
                  backgroundColor: 'var(--bg-table-th)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '24px',
                  gap: '10px'
                }}>
                  <span style={{
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    color: 'var(--text-secondary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                    textAlign: 'left'
                  }}>
                    {createdInvite.link}
                  </span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(createdInvite.link);
                    }}
                    style={{
                      padding: '6px 10px',
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      fontWeight: 500
                    }}
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </button>
                </div>

                {/* Dispatch links */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <a 
                    href={`mailto:${createdInvite.email}?subject=Welcome to Dexnest CRM&body=Hi, %0D%0A%0D%0AYou have been invited to join the Dexnest CRM system as a Workspace member. %0D%0A%0D%0APlease use the link below to complete your registration and log in: %0D%0A${encodeURIComponent(createdInvite.link)}`}
                    style={{
                      flex: 1,
                      padding: '12px 0',
                      backgroundColor: 'var(--primary)',
                      color: 'var(--bg-sidebar)',
                      fontWeight: 600,
                      borderRadius: 'var(--radius-md)',
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      textDecoration: 'none'
                    }}
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email Invitation</span>
                  </a>
                  <button 
                    onClick={() => setIsAddModalOpen(false)}
                    style={{
                      flex: 1,
                      padding: '12px 0',
                      backgroundColor: 'transparent',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-secondary)',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* SLIDE-OUT DETAIL DRAWER */}
      {selectedUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '560px',
          height: '100vh',
          backgroundColor: 'var(--bg-card)',
          borderLeft: '1px solid var(--border-color)',
          boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.08)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slide-in-right 0.3s ease-out'
        }}>
          {/* Drawer Header */}
          <div style={{
            padding: '24px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  {selectedUser.full_name}
                </h2>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '10px',
                  backgroundColor: 
                    selectedUser.status === 'Active' ? 'hsl(150, 80%, 95%)' : 
                    selectedUser.status === 'Suspended' ? 'hsl(0, 100%, 96%)' : 'hsl(35, 100%, 96%)',
                  color: 
                    selectedUser.status === 'Active' ? 'hsl(150, 84%, 26%)' : 
                    selectedUser.status === 'Suspended' ? 'hsl(0, 72%, 40%)' : 'hsl(35, 92%, 35%)'
                }}>
                  {selectedUser.status}
                </span>
              </div>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                {selectedUser.email}
              </span>
            </div>
            <button 
              onClick={handleCloseDrawer}
              style={{
                padding: '6px',
                cursor: 'pointer',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-table-hover)'
              }}
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          {/* Drawer Tabs Header */}
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--bg-table-th)',
            borderBottom: '1px solid var(--border-color)',
            padding: '0 12px'
          }}>
            {[
              { id: 'profile', label: 'Profile' },
              { id: 'work', label: 'Work Summary' },
              { id: 'perms', label: 'Permissions' },
              { id: 'sessions', label: 'Sessions' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setDrawerTab(tab.id as any); setDrawerMsg(''); }}
                style={{
                  padding: '12px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: drawerTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
                  borderBottom: `2px solid ${drawerTab === tab.id ? 'var(--primary)' : 'transparent'}`,
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  marginBottom: '-1px'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Drawer Scrollable Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
            
            {drawerMsg && (
              <div style={{
                backgroundColor: 'rgba(59, 130, 246, 0.08)',
                border: '1px solid rgba(59, 130, 246, 0.15)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 14px',
                fontSize: '13px',
                color: 'var(--primary)',
                marginBottom: '20px'
              }}>
                {drawerMsg}
              </div>
            )}

            {/* TAB 1: PROFILE TAB */}
            {drawerTab === 'profile' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Full Name</label>
                  <input 
                    type="text" 
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    style={{ padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontSize: '13px' }}
                  />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Email Address</label>
                  <input 
                    type="email" 
                    value={editEmail}
                    onChange={e => setEditEmail(e.target.value)}
                    style={{ padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontSize: '13px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Designation</label>
                    <input 
                      type="text" 
                      value={editDesignation}
                      onChange={e => setEditDesignation(e.target.value)}
                      style={{ padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontSize: '13px' }}
                    />
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Department</label>
                    <select 
                      value={editDepartment}
                      onChange={e => setEditDepartment(e.target.value)}
                      style={{ padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontSize: '13px', backgroundColor: 'var(--bg-card)' }}
                    >
                      <option value="">Select Department</option>
                      {settings.departments.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>CRM Role Template</label>
                  <select 
                    value={editRole}
                    onChange={e => setEditRole(e.target.value)}
                    style={{ padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontSize: '13px', backgroundColor: 'var(--bg-card)' }}
                  >
                    {settings.roleTemplates.map(t => (
                      <option key={t.name} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Employee Notes</label>
                  <textarea 
                    value={editNote}
                    onChange={e => setEditNote(e.target.value)}
                    style={{ padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontSize: '13px', height: '80px', resize: 'vertical' }}
                  />
                </div>

                {/* Edit Controls */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '14px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                  <button 
                    onClick={handleSaveProfileChanges}
                    style={{
                      flex: 1,
                      padding: '10px 0',
                      backgroundColor: 'var(--primary)',
                      color: 'white',
                      fontSize: '13px',
                      fontWeight: 600,
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer'
                    }}
                  >
                    Save Profile Changes
                  </button>

                  <button 
                    onClick={handleToggleSuspend}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '10px 18px',
                      backgroundColor: selectedUser.status === 'Suspended' ? 'hsl(150, 80%, 95%)' : 'hsl(0, 100%, 96%)',
                      color: selectedUser.status === 'Suspended' ? 'hsl(150, 84%, 26%)' : 'hsl(0, 72%, 40%)',
                      border: `1px solid ${selectedUser.status === 'Suspended' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                      fontSize: '13px',
                      fontWeight: 600,
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer'
                    }}
                  >
                    {selectedUser.status === 'Suspended' ? (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Reactivate Account</span>
                      </>
                    ) : (
                      <>
                        <UserMinus className="w-4 h-4" />
                        <span>Suspend Account</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: WORK SUMMARY TAB */}
            {drawerTab === 'work' && (() => {
              const metrics = getEmployeeMetrics(selectedUser);
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* General KPIs */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div style={{ padding: '16px', backgroundColor: 'var(--bg-table-th)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Deals Pipeline</span>
                      <h4 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0 0 0' }}>{metrics.dealsTotal}</h4>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Value: INR {new Intl.NumberFormat('en-IN').format(metrics.dealsValue)}</span>
                    </div>

                    <div style={{ padding: '16px', backgroundColor: 'var(--bg-table-th)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Task Completion</span>
                      <h4 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0 0 0' }}>
                        {metrics.completedTasks} / {metrics.tasksTotal}
                      </h4>
                      <span style={{ fontSize: '12px', color: metrics.overdueTasks > 0 ? '#ef4444' : 'var(--text-secondary)', fontWeight: metrics.overdueTasks > 0 ? 600 : 400 }}>
                        {metrics.overdueTasks} Overdue
                      </span>
                    </div>
                  </div>

                  {/* Deals Pipeline Stage breakdown */}
                  <div>
                    <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 10px 0' }}>Pipeline Deals by Stage</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {Object.entries(metrics.stageCounts).map(([stageName, count]) => (
                        <div key={stageName} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 0', borderBottom: '1px dashed var(--border-color)' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>{stageName}</span>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{count} deal{count !== 1 ? 's' : ''}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Activity lists */}
                  <div>
                    <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 10px 0' }}>Last 5 CRM Actions</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {metrics.recentActions.length === 0 ? (
                        <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>No activities logged for this employee.</span>
                      ) : (
                        metrics.recentActions.map(log => (
                          <div key={log.log_id} style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '10px', backgroundColor: 'var(--bg-table-th)', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <strong style={{ color: '#2563eb' }}>{log.event_type.replace('_', ' ').toUpperCase()}</strong>
                              <span style={{ color: 'var(--text-tertiary)', fontSize: '10px' }}>{formatDate(log.timestamp)}</span>
                            </div>
                            <span style={{ color: 'var(--text-primary)' }}>Affected: {log.affected_record}</span>
                            {log.detail_string && <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '11px', marginTop: '2px' }}>{log.detail_string}</span>}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* TAB 3: PERMISSIONS MATRIX TAB */}
            {drawerTab === 'perms' && (() => {
              const template = settings.roleTemplates.find(t => t.name === selectedUser.role);
              const templatePerms = template ? template.permissions : {};
              const overrides = selectedUser.custom_permissions || {};

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  
                  {/* Template Info Info-box */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '12px 16px',
                    backgroundColor: 'var(--primary-light)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(37,99,235,0.1)',
                    fontSize: '13px',
                    color: 'var(--primary)',
                    marginBottom: '10px'
                  }}>
                    <Info className="w-5 h-5 flex-shrink-0" style={{ marginTop: '2px' }} />
                    <div>
                      <strong>Active Template: {selectedUser.role}</strong>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Toggle settings below to apply individual overrides. Overridden permissions are marked as <span style={{ fontWeight: 600, color: 'var(--primary)' }}>Custom</span>.
                      </p>
                    </div>
                  </div>

                  {/* Permissions matrix rows */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {Object.keys(templatePerms).map(permKey => {
                      const isOverridden = overrides[permKey] !== undefined;
                      const activeValue = isOverridden ? overrides[permKey] : templatePerms[permKey];
                      const formattedKey = permKey
                        .replace('can', 'Can ')
                        .replace(/([A-Z])/g, ' $1')
                        .trim();

                      return (
                        <div 
                          key={permKey}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 14px',
                            borderBottom: '1px solid var(--border-color)',
                            backgroundColor: isOverridden ? 'rgba(245, 158, 11, 0.03)' : 'transparent'
                          }}
                        >
                          <div>
                            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                              {formattedKey}
                            </span>
                            {isOverridden && (
                              <span style={{
                                display: 'inline-block',
                                fontSize: '10px',
                                fontWeight: 600,
                                backgroundColor: '#fef3c7',
                                color: '#d97706',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                marginLeft: '8px'
                              }}>
                                Custom Override
                              </span>
                            )}
                          </div>
                          
                          {/* Toggle switch */}
                          <div 
                            onClick={() => handleTogglePermissionOverride(permKey)}
                            style={{
                              width: '44px',
                              height: '24px',
                              backgroundColor: activeValue ? 'var(--primary)' : '#cbd5e1',
                              borderRadius: '12px',
                              cursor: 'pointer',
                              position: 'relative',
                              transition: 'background-color 0.2s'
                            }}
                          >
                            <span style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--bg-card)',
                              position: 'absolute',
                              top: '3px',
                              left: activeValue ? '23px' : '3px',
                              transition: 'left 0.2s',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
                            }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* TAB 4: SESSION HISTORY TAB */}
            {drawerTab === 'sessions' && (() => {
              // Get last 20 sessions for selectedUser
              const userSessions = sessions
                .filter(s => s.user_id === selectedUser.user_id)
                .slice(0, 20);

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                    Active and Historical Login Logs (Last 20)
                  </h4>
                  
                  {userSessions.length === 0 ? (
                    <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>No session history logged.</span>
                  ) : (
                    <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ backgroundColor: 'var(--bg-table-th)', borderBottom: '1px solid var(--border-color)' }}>
                            <th style={{ padding: '8px 12px', fontWeight: 600 }}>Login Time</th>
                            <th style={{ padding: '8px 12px', fontWeight: 600 }}>Logout Time</th>
                            <th style={{ padding: '8px 12px', fontWeight: 600 }}>Duration</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userSessions.map(session => (
                            <tr key={session.session_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                              <td style={{ padding: '8px 12px' }}>
                                {formatDate(session.login_time)} <span style={{ color: 'var(--text-tertiary)' }}>{formatTime(session.login_time)}</span>
                              </td>
                              <td style={{ padding: '8px 12px' }}>
                                {session.logout_time ? (
                                  <>
                                    {formatDate(session.logout_time)} <span style={{ color: 'var(--text-tertiary)' }}>{formatTime(session.logout_time)}</span>
                                  </>
                                ) : (
                                  <span style={{ color: '#10b981', fontWeight: 600 }}>Online Now</span>
                                )}
                              </td>
                              <td style={{ padding: '8px 12px', fontWeight: 500 }}>
                                {getFormatDuration(session.duration)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })()}

          </div>
        </div>
      )}

    </div>
  );
}
