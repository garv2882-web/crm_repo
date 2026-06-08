import { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { 
  Search, 
  Calendar, 
  User, 
  Tag, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';

export default function AdminActivityLog() {
  const { activityLog, users } = useCRM();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventType, setSelectedEventType] = useState('All');
  const [selectedEmployeeEmail, setSelectedEmployeeEmail] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const itemsPerPage = 50;

  // Derive unique event types for dropdown
  const eventTypes = Array.from(new Set(activityLog.map(log => log.event_type)));

  // Filter logs logic
  const filteredLogs = activityLog.filter(log => {
    // 1. Search Query (Actor Name, Actor Email, Affected Record, Details)
    const matchesSearch = 
      log.actor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actor_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.affected_record.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.detail_string && log.detail_string.toLowerCase().includes(searchQuery.toLowerCase()));

    // 2. Event Type
    const matchesType = selectedEventType === 'All' || log.event_type === selectedEventType;

    // 3. Employee Actor Email
    const matchesEmployee = selectedEmployeeEmail === 'All' || log.actor_email.toLowerCase() === selectedEmployeeEmail.toLowerCase();

    // 4. Date Range
    let matchesDate = true;
    if (log.timestamp) {
      const logTime = new Date(log.timestamp).getTime();
      if (startDate) {
        // Start of start day
        const startTime = new Date(startDate).setHours(0, 0, 0, 0);
        matchesDate = matchesDate && logTime >= startTime;
      }
      if (endDate) {
        // End of end day
        const endTime = new Date(endDate).setHours(23, 59, 59, 999);
        matchesDate = matchesDate && logTime <= endTime;
      }
    }

    return matchesSearch && matchesType && matchesEmployee && matchesDate;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const lastIdx = currentPage * itemsPerPage;
  const firstIdx = lastIdx - itemsPerPage;
  const currentLogs = filteredLogs.slice(firstIdx, lastIdx);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedEventType('All');
    setSelectedEmployeeEmail('All');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const formatDate = (isoStr: string) => {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (isoStr: string) => {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Helper to color-code event type tags
  const getEventTypeStyle = (type: string) => {
    const text = type.replace(/_/g, ' ').toUpperCase();
    let bg = 'hsl(210, 80%, 96%)';
    let color = 'hsl(210, 84%, 35%)';

    if (type.includes('login') || type.includes('signup')) {
      bg = 'hsl(150, 80%, 95%)';
      color = 'hsl(150, 84%, 26%)';
    } else if (type.includes('delete') || type.includes('suspended')) {
      bg = 'hsl(0, 100%, 96%)';
      color = 'hsl(0, 72%, 40%)';
    } else if (type.includes('edit') || type.includes('update') || type.includes('settings')) {
      bg = 'hsl(35, 100%, 96%)';
      color = 'hsl(35, 92%, 35%)';
    } else if (type.includes('create') || type.includes('add')) {
      bg = 'hsl(187, 100%, 96%)';
      color = '#06b6d4';
    }

    return { text, bg, color };
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
            Workspace Activity Log
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            A read-only system audit trail logging all records additions, modifications, credentials events, and settings changes.
          </p>
        </div>
      </div>

      {/* Filter Toolbar Card */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        
        {/* Row 1: Search & Clear Button */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          
          {/* Text Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
            <Search className="w-4 h-4 text-slate-400" style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)'
            }} />
            <input 
              type="text"
              placeholder="Search by actor, record details, email..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              style={{
                width: '100%',
                height: '38px',
                paddingLeft: '38px',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-main)',
                fontSize: '13.5px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button 
            className="btn btn-secondary"
            onClick={handleClearFilters}
            style={{ height: '38px', fontSize: '13px', fontWeight: 600 }}
          >
            Clear Filters
          </button>
        </div>

        {/* Row 2: Select Filters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          
          {/* Event Type Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Tag className="w-3 h-3 text-slate-400" />
              <span>Event Type</span>
            </label>
            <select
              value={selectedEventType}
              onChange={e => { setSelectedEventType(e.target.value); setCurrentPage(1); }}
              style={{
                height: '36px',
                padding: '0 10px',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                backgroundColor: 'var(--bg-card)'
              }}
            >
              <option value="All">All Event Types</option>
              {eventTypes.map(type => (
                <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          {/* Employee Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <User className="w-3 h-3 text-slate-400" />
              <span>Actor Employee</span>
            </label>
            <select
              value={selectedEmployeeEmail}
              onChange={e => { setSelectedEmployeeEmail(e.target.value); setCurrentPage(1); }}
              style={{
                height: '36px',
                padding: '0 10px',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                backgroundColor: 'var(--bg-card)'
              }}
            >
              <option value="All">All Employees</option>
              {users.map(u => (
                <option key={u.user_id} value={u.email}>{u.full_name} ({u.email})</option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>Date Start</span>
            </label>
            <input 
              type="date"
              value={startDate}
              onChange={e => { setStartDate(e.target.value); setCurrentPage(1); }}
              style={{
                height: '36px',
                padding: '0 10px',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* End Date */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>Date End</span>
            </label>
            <input 
              type="date"
              value={endDate}
              onChange={e => { setEndDate(e.target.value); setCurrentPage(1); }}
              style={{
                height: '36px',
                padding: '0 10px',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                boxSizing: 'border-box'
              }}
            />
          </div>

        </div>
      </div>

      {/* Audit Logs Table Card */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-table-th)' }}>
                <th style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-secondary)', width: '180px' }}>Date & Time</th>
                <th style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-secondary)', width: '180px' }}>Event Log Type</th>
                <th style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-secondary)', width: '220px' }}>Actor Profile</th>
                <th style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-secondary)', width: '220px' }}>Affected Record</th>
                <th style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-secondary)' }}>Operation Details</th>
              </tr>
            </thead>
            <tbody>
              {currentLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                    No audit records match your filters.
                  </td>
                </tr>
              ) : (
                currentLogs.map(log => {
                  const badge = getEventTypeStyle(log.event_type);
                  return (
                    <tr 
                      key={log.log_id} 
                      style={{ 
                        borderBottom: '1px solid var(--border-color)',
                        transition: 'background-color 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-main)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '14px 18px', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatDate(log.timestamp)}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{formatTime(log.timestamp)}</div>
                      </td>
                      <td style={{ padding: '14px 18px', verticalAlign: 'top' }}>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          backgroundColor: badge.bg,
                          color: badge.color,
                          padding: '3px 8px',
                          borderRadius: '12px',
                          display: 'inline-block',
                          letterSpacing: '0.02em'
                        }}>
                          {badge.text}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{log.actor_name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{log.actor_email}</div>
                      </td>
                      <td style={{ padding: '14px 18px', verticalAlign: 'top', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {log.affected_record}
                      </td>
                      <td style={{ padding: '14px 18px', verticalAlign: 'top', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        {log.detail_string || '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        <div style={{
          borderTop: '1px solid var(--border-color)',
          padding: '14px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-table-th)'
        }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Showing {firstIdx + 1} to {Math.min(lastIdx, filteredLogs.length)} of {filteredLogs.length} audit entries
          </span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button 
              className="page-btn"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{
                padding: '6px 12px',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-card)',
                cursor: 'pointer',
                opacity: currentPage === 1 ? 0.5 : 1
              }}
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button 
              className="page-btn"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={{
                padding: '6px 12px',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-card)',
                cursor: 'pointer',
                opacity: currentPage === totalPages ? 0.5 : 1
              }}
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
