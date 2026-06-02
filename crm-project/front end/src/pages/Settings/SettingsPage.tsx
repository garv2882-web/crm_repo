import { Settings, Shield, Server, Database, User as UserIcon, Calendar, Mail } from 'lucide-react';
import { type User } from '../../api';

interface SettingsPageProps {
  user: User;
}

export default function SettingsPage({ user }: SettingsPageProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="settings-workspace animate-fade-in" style={{ paddingBottom: '40px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700 }}>System Settings</h2>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Configure system preferences and view profile data</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Profile Card */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <UserIcon className="w-4 h-4" />
              <span>User Profile Details</span>
            </div>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                fontWeight: 700,
                border: '2px solid var(--primary-light)'
              }}>
                {getInitials(user.full_name)}
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{user.full_name}</h3>
                <span className="badge badge-status-qualified" style={{ marginTop: '4px', textTransform: 'uppercase', fontSize: '10px' }}>
                  {user.role}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px' }}>
                <Mail className="w-4 h-4 text-slate-400" />
                <span style={{ color: 'var(--text-secondary)' }}>Email:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.email}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px' }}>
                <Calendar className="w-4 h-4 text-slate-400" />
                <span style={{ color: 'var(--text-secondary)' }}>Member Since:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatDate(user.created_at)}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px' }}>
                <Shield className="w-4 h-4 text-slate-400" />
                <span style={{ color: 'var(--text-secondary)' }}>Account Status:</span>
                <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{user.status || 'Active'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Connection info */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Server className="w-4 h-4" />
              <span>Full-Stack Integration Details</span>
            </div>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Database className="w-5 h-5 text-blue-600" />
                <div>
                  <span style={{ display: 'block', fontWeight: 600, fontSize: '14px' }}>PostgreSQL Instance</span>
                  <span style={{ display: 'block', fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Connected to localhost:5432 (crm_db)
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <Shield className="w-5 h-5 text-emerald-600" />
                <div>
                  <span style={{ display: 'block', fontWeight: 600, fontSize: '14px' }}>Security Status</span>
                  <span style={{ display: 'block', fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    JWT Authenticated endpoints enabled
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Custom fields configuration */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <div className="card-title">
              <Settings className="w-4 h-4" />
              <span>CRM Custom Fields</span>
            </div>
          </div>
          <div className="card-body">
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              SalesNest CRM lets you dynamically add custom fields to leads, deals, and companies. 
              These custom fields are stored as JSON attributes in the PostgreSQL database for maximum schema flexibility.
            </p>
            <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
              <span style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>Active Schema Fields:</span>
              <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginTop: '8px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                <li>tags (JSON Array)</li>
                <li>custom_fields (JSON Map)</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
