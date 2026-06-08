import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAdminEmail } from '../../config/adminConfig';
import { Shield, AlertCircle } from 'lucide-react';
import { api } from '../../api';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [emailInput, setEmailInput] = useState('');
  const [showMockSelect, setShowMockSelect] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    setShowMockSelect(true);
  };

  const handleMockAuthenticate = (selectedEmail: string) => {
    if (!selectedEmail) return;
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      // Simulate Google returning authenticated user profile
      const mockGoogleProfile = {
        email: selectedEmail.trim().toLowerCase(),
        name: selectedEmail.split('@')[0].toUpperCase(),
        picture: `https://api.dicebear.com/7.x/initials/svg?seed=${selectedEmail}`
      };

      // Save Google Auth details to localStorage
      localStorage.setItem('crm_admin_user', JSON.stringify(mockGoogleProfile));

      // Guard check
      if (isAdminEmail(mockGoogleProfile.email)) {
        // Auto-provision or log in as normal employee in crm
        const db = api.getRawDB();
        let user = db.users.find(u => u.email.toLowerCase() === mockGoogleProfile.email);
        if (!user) {
          user = {
            user_id: 'e-' + Math.random().toString(36).substring(2, 9),
            full_name: mockGoogleProfile.name,
            email: mockGoogleProfile.email,
            role: 'Senior Executive',
            status: 'Active',
            designation: 'Workspace Administrator',
            department: 'Executive',
            date_added: new Date().toISOString(),
            last_active: new Date().toISOString(),
            notes: 'Auto-provisioned administrator account.'
          };
          db.users.push(user);
          api.saveRawDB(db);
        } else {
          // ensure their status is Active so they don't get blocked by CRMGuard
          user.status = 'Active';
          user.last_active = new Date().toISOString();
          api.saveRawDB(db);
        }

        localStorage.setItem('crm_auth_token', 'mock_jwt_token_admin_' + Math.random().toString(36).substring(2, 9));
        localStorage.setItem('crm_auth_user', JSON.stringify(user));

        // Log in to admin portal
        navigate('/admin');
      } else {
        // Kick to access denied
        navigate('/admin/denied');
      }
    }, 800);
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: 'hsl(222, 47%, 6%)', // Darkest shade of sidebar
      color: 'white',
      fontFamily: 'var(--font-sans)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '440px',
        width: '100%',
        backgroundColor: 'hsl(222, 47%, 11%)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: 'var(--shadow-lg)',
        padding: '40px',
        textAlign: 'center'
      }} className="animate-fade-in">
        
        {/* Brand Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            borderRadius: '50%',
            marginBottom: '16px',
            color: 'var(--primary)'
          }}>
            <Shield className="w-8 h-8" />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '8px' }}>
            Admin Portal
          </h2>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '14px', lineHeight: 1.5 }}>
            Access control restricted to Dexnest workspace administrators.
          </p>
        </div>

        {!showMockSelect ? (
          <button 
            onClick={handleGoogleLogin}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '14px',
              backgroundColor: 'white',
              color: '#1e293b',
              fontSize: '15px',
              fontWeight: 600,
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'background-color 0.2s, transform 0.1s',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
          >
            {/* Google G Icon SVG */}
            <svg className="w-5 h-5" viewBox="0 0 24 24" style={{ width: '20px', height: '20px' }}>
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.53-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-8.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.08 1.16-3.14 0-5.8-2.11-6.75-4.96H1.31v3.15C3.29 22.35 7.42 24 12 24z"/>
              <path fill="#FBBC05" d="M5.25 14.24a7.14 7.14 0 0 1 0-4.48V6.61H1.31a12 12 0 0 0 0 10.78l3.94-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.42 0 3.29 1.65 1.31 4.75l3.94 3.15c.95-2.85 3.61-4.96 6.75-4.96z"/>
            </svg>
            <span>Sign in with Google</span>
          </button>
        ) : (
          <div className="animate-fade-in" style={{ textAlign: 'left' }}>
            <div style={{
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              fontSize: '13px',
              color: '#60a5fa',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px'
            }}>
              <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ marginTop: '2px' }} />
              <span>
                <strong>OAuth Sandbox:</strong> Select a demo identity or type in your Google Workspace email address to simulate the authentication callback checks.
              </span>
            </div>

            {/* Quick Demo Selectors */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Quick Test Admin Profiles
              </label>
              <div style={{ display: 'grid', gap: '8px', marginTop: '6px' }}>
                <button 
                  onClick={() => handleMockAuthenticate('owner@anigravity.com')}
                  disabled={loading}
                  style={{
                    padding: '10px 14px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 'var(--radius-sm)',
                    color: '#f8fafc',
                    fontSize: '13px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'}
                >
                  <strong>Owner:</strong> owner@anigravity.com
                </button>
                
                <button 
                  onClick={() => handleMockAuthenticate('admin@anigravity.com')}
                  disabled={loading}
                  style={{
                    padding: '10px 14px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 'var(--radius-sm)',
                    color: '#f8fafc',
                    fontSize: '13px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'}
                >
                  <strong>Admin:</strong> admin@anigravity.com
                </button>

                <button 
                  onClick={() => handleMockAuthenticate('garv@dexnest.com')}
                  disabled={loading}
                  style={{
                    padding: '10px 14px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 'var(--radius-sm)',
                    color: '#f8fafc',
                    fontSize: '13px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'}
                >
                  <strong>Developer/Admin:</strong> garv@dexnest.com
                </button>
              </div>
            </div>

            {/* Custom Input */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Or test a different email
              </label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <input 
                  type="email"
                  placeholder="test-email@workspace.com"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'white',
                    fontSize: '13px'
                  }}
                />
                <button 
                  onClick={() => handleMockAuthenticate(emailInput)}
                  disabled={loading || !emailInput}
                  style={{
                    padding: '0 16px',
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    fontSize: '13px',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    opacity: (!emailInput || loading) ? 0.6 : 1
                  }}
                >
                  Verify
                </button>
              </div>
            </div>

            <button 
              onClick={() => setShowMockSelect(false)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-tertiary)',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              Cancel
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
