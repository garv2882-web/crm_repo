import { useCRM } from '../../context/CRMContext';
import { 
  Activity, 
  CheckSquare, 
  BookOpen, 
  UserCheck,
  TrendingUp
} from 'lucide-react';

export default function AdminOverview() {
  const { deals, tasks, contacts, activityLog, users, sessions, settings } = useCRM();

  // 1. Pipeline Health Calculations
  // Get active stages from settings configuration
  const stages = settings.dealStages || [];
  const dealStageCounts = stages.reduce((acc, stage) => {
    acc[stage.id] = deals.filter(d => d.deal_stage === stage.id).length;
    return acc;
  }, {} as Record<string, number>);

  const maxDealCount = Math.max(...Object.values(dealStageCounts), 1);
  const totalDeals = deals.length;

  // 2. Task Pulse Calculations
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const tasksThisWeek = tasks.filter(t => new Date(t.created_at || now).getTime() >= sevenDaysAgo.getTime());
  const completedTasksThisWeek = tasksThisWeek.filter(t => t.status === 'Completed');
  const taskCompletionRate = tasksThisWeek.length 
    ? Math.round((completedTasksThisWeek.length / tasksThisWeek.length) * 100) 
    : 100;

  // 3. Contacts Summary
  const contactsThisWeek = contacts.filter(c => new Date(c.created_at || now).getTime() >= sevenDaysAgo.getTime());
  // Let's count contacts as flagged if they contain the word "flag" or "urgent" in their notes
  const flaggedContactsCount = contacts.filter(c => c.notes && (c.notes.toLowerCase().includes('flag') || c.notes.toLowerCase().includes('urgent'))).length;

  // 4. Logged-In / Last Active Employees
  // Get currently active sessions (no logout_time)
  const activeSessionEmails = sessions
    .filter(s => !s.logout_time)
    .map(s => s.user_email.toLowerCase());

  // Merge with employee profiles
  const employeeSessions = users.map(user => {
    const isOnline = activeSessionEmails.includes(user.email.toLowerCase()) && user.status === 'Active';
    return {
      ...user,
      isOnline
    };
  });

  // 5. Recent Activity Log (Top 10)
  const recentActivities = activityLog.slice(0, 10);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDate = (isoStr: string) => {
    if (!isoStr) return 'Never';
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
          Operational Overview
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
          At-a-glance administrative vitals and metrics for Dexnest CRM.
        </p>
      </div>

      {/* Primary Row: Pipeline Health Funnel (Takes full width or left-aligned column) */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '24px', alignItems: 'stretch' }}>
        
        {/* Pipeline Health Card */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Deals Pipeline Health ({totalDeals} Total Deals)
            </h2>
          </div>
          
          {/* Horizontal Bar Funnel Chart */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, justifyContent: 'center' }}>
            {stages.map(stage => {
              const count = dealStageCounts[stage.id] || 0;
              const pct = totalDeals ? Math.round((count / maxDealCount) * 100) : 0;
              return (
                <div key={stage.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '120px', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {stage.name}
                  </div>
                  <div style={{ flex: 1, height: '28px', backgroundColor: 'var(--bg-table-hover)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', position: 'relative' }}>
                    <div style={{
                      width: `${pct}%`,
                      height: '100%',
                      backgroundColor: 'var(--primary-light)',
                      borderRight: '3px solid var(--primary)',
                      transition: 'width 0.8s ease-in-out',
                      borderRadius: 'var(--radius-sm)'
                    }} />
                    <span style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'var(--text-primary)'
                    }}>
                      {count} deal{count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div style={{ width: '40px', fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', textAlign: 'right' }}>
                    {totalDeals ? Math.round((count / totalDeals) * 100) : 0}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Task Pulse & Contacts Summary Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Task Pulse Card */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '20px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: 'hsl(150, 80%, 95%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-qualified)',
              flexShrink: 0
            }}>
              <CheckSquare className="w-6 h-6" />
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Task Pulse (This Week)
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
                <h3 style={{ fontSize: '22px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  {completedTasksThisWeek.length} / {tasksThisWeek.length}
                </h3>
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--accent-qualified)' }}>
                  ({taskCompletionRate}% Rate)
                </span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                Completion progress of tasks assigned to employees this week.
              </p>
            </div>
          </div>

          {/* Contacts Summary Card */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '20px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: 'hsl(187, 100%, 96%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#06b6d4',
              flexShrink: 0
            }}>
              <BookOpen className="w-6 h-6" />
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Contacts Directory
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
                <h3 style={{ fontSize: '22px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  {contacts.length}
                </h3>
                <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                  (+{contactsThisWeek.length} new this week)
                </span>
                {flaggedContactsCount > 0 && (
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>
                    {flaggedContactsCount} Flagged
                  </span>
                )}
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                Total contacts managed across leads and companies directories.
              </p>
            </div>
          </div>

          {/* Logged-In Employees Chips Row */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Active Sessions & Activity
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {employeeSessions.map(emp => (
                <div 
                  key={emp.user_id} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    backgroundColor: emp.isOnline ? 'rgba(16, 185, 129, 0.1)' : '#f8fafc',
                    border: `1px solid ${emp.isOnline ? 'rgba(16, 185, 129, 0.2)' : 'var(--border-color)'}`,
                    fontSize: '12px',
                    fontWeight: 500,
                    color: 'var(--text-primary)'
                  }}
                  title={emp.isOnline ? 'Currently Online' : `Last active: ${formatDate(emp.last_active)}`}
                >
                  {/* Status dot */}
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: emp.isOnline ? '#10b981' : '#cbd5e1'
                  }} />
                  <span>{emp.full_name}</span>
                  {!emp.isOnline && (
                    <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 400 }}>
                      ({formatDate(emp.last_active).split(',')[0]})
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Row 2: Recent Activity strip */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
        padding: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <Activity className="w-5 h-5 text-blue-600" />
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Recent CRM Activity (Audit Log)
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
          {recentActivities.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-tertiary)', fontSize: '14px' }}>
              No activities logged yet.
            </div>
          ) : (
            recentActivities.map((log, index) => (
              <div 
                key={log.log_id} 
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  padding: '14px 0',
                  borderBottom: index < recentActivities.length - 1 ? '1px solid var(--border-color)' : 'none',
                  fontSize: '13px'
                }}
              >
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 600,
                    flexShrink: 0
                  }}>
                    {getInitials(log.actor_name)}
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      <span style={{ fontWeight: 600 }}>{log.actor_name}</span> ({log.actor_email})
                    </div>
                    <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Performed action <strong style={{ color: '#2563eb' }}>{log.event_type.replace('_', ' ')}</strong> on <strong>{log.affected_record}</strong>
                      {log.detail_string && <span style={{ color: 'var(--text-tertiary)', marginLeft: '6px' }}>— {log.detail_string}</span>}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', whiteSpace: 'nowrap', alignSelf: 'center' }}>
                  {formatDate(log.timestamp)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
