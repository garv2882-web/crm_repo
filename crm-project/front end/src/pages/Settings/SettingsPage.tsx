import { Settings, Shield, Server, Database } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="settings-workspace animate-fade-in" style={{ paddingBottom: '40px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700 }}>System Settings</h2>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Configure system preferences and check database connections</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Connection info */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Server className="w-4 h-4" />
              <span>Full-Stack Integration details</span>
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
                    Local development credentials enabled
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Custom fields configuration */}
        <div className="card">
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
