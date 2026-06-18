import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../api';
import { isAdminEmail } from '../../config/adminConfig';
import { Shield, Mail, Lock, RefreshCw, AlertCircle, ArrowLeft } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: any) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState<'employee' | 'admin'>('employee');
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Admin Mock OAuth States
  const [showAdminSandbox, setShowAdminSandbox] = useState(false);
  const [adminEmailInput, setAdminEmailInput] = useState('');

  // --- EMPLOYEE FLOW ---
  // Stage 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      setError('');
      setLoading(true);
      
      // Verify user exists in the directory first via backend
      const checkRes = await api.checkEmail(email);
      if (!checkRes.exists) {
        throw new Error('User email not found in employee directory');
      }

      // Generate a mock 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(otp);
      
      // Dispatch real email via FormSubmit AJAX
      try {
        fetch(`https://formsubmit.co/ajax/${email}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            _subject: "Dexnest CRM - Login Verification Code",
            "Verification Code": otp,
            message: `Your Dexnest CRM verification code is ${otp}. Enter this code on the login screen to authenticate.`
          })
        });
      } catch (err) {
        console.error("Failed to send login OTP email:", err);
      }

      setOtpSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  // Stage 2: Verify OTP & Login
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    if (otpCode !== generatedOtp) {
      setError('Invalid verification code. Please try again.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      const res = await api.login({ email });
      
      // Auto-login to Admin Portal if allowlisted email
      if (isAdminEmail(res.user.email)) {
        const mockGoogleProfile = {
          email: res.user.email.toLowerCase(),
          name: res.user.full_name,
          picture: `https://api.dicebear.com/7.x/initials/svg?seed=${res.user.email}`
        };
        localStorage.setItem('crm_admin_user', JSON.stringify(mockGoogleProfile));
        
        onLoginSuccess(res.user);
        navigate('/admin'); // Admin goes straight to admin dashboard
      } else {
        localStorage.removeItem('crm_admin_user');
        
        onLoginSuccess(res.user);
        navigate('/'); // Normal employee goes to standard workspace
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // --- ADMIN FLOW ---
  const handleAdminGoogleAuth = async (selectedEmail: string) => {
    if (!selectedEmail) return;
    setLoading(true);
    setError('');
    
    try {
      const mockGoogleProfile = {
        email: selectedEmail.trim().toLowerCase(),
        name: selectedEmail.split('@')[0].toUpperCase(),
        picture: `https://api.dicebear.com/7.x/initials/svg?seed=${selectedEmail}`
      };

      // Save Google Auth details to localStorage
      localStorage.setItem('crm_admin_user', JSON.stringify(mockGoogleProfile));

      // Guard check
      if (isAdminEmail(mockGoogleProfile.email)) {
        // Run real login on the backend to set HttpOnly auth cookie
        const res = await api.login({ email: mockGoogleProfile.email });
        
        onLoginSuccess(res.user);
        navigate('/admin');
      } else {
        // Kick to access denied
        navigate('/admin/denied');
      }
    } catch (err: any) {
      setError(err.message || 'Admin authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container animate-fade-in">
      <div className="auth-card">
        {/* Brand Header */}
        <div className="auth-header" style={{ marginBottom: '20px' }}>
          <div className="auth-logo">
            <Shield className="w-8 h-8" style={{ color: 'var(--primary)' }} />
          </div>
          <h2>Dexnest CRM</h2>
          <p>Secure Enterprise Sign-In Portal</p>
        </div>

        {/* Tab Selection (Two Login Options) */}
        {!otpSent && (
          <div style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-color)',
            marginBottom: '24px'
          }}>
            <button
              type="button"
              onClick={() => { setLoginType('employee'); setError(''); }}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: 'transparent',
                borderBottom: loginType === 'employee' ? '2px solid var(--primary)' : '2px solid transparent',
                color: loginType === 'employee' ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Employee Portal
            </button>
            <button
              type="button"
              onClick={() => { setLoginType('admin'); setError(''); setShowAdminSandbox(false); }}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: 'transparent',
                borderBottom: loginType === 'admin' ? '2px solid var(--primary)' : '2px solid transparent',
                color: loginType === 'admin' ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Admin Portal
            </button>
          </div>
        )}

        {error && (
          <div className="auth-error" style={{ marginBottom: '16px' }}>
            <span>{error}</span>
          </div>
        )}

        {/* --- OPTION 1: EMPLOYEE SIGN-IN --- */}
        {loginType === 'employee' && (
          <div>
            {otpSent && (
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
                gap: '10px',
                textAlign: 'left'
              }}>
                <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ marginTop: '2px', color: '#3b82f6' }} />
                <div>
                  <strong>OTP Dispatched:</strong> An email containing your 6-digit verification code has been sent.
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                    (If you used a mock/dead test email that cannot receive real emails, the sandbox fallback code is: <strong>{generatedOtp}</strong>)
                  </div>
                </div>
              </div>
            )}

            {!otpSent ? (
              /* Stage 1: Email Form */
              <form onSubmit={handleSendOtp} className="auth-form">
                <div className="form-group-auth">
                  <label>Employee Email Address</label>
                  <div className="input-with-icon">
                    <Mail className="input-icon" />
                    <input
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-auth" disabled={loading}>
                  {loading ? (
                    <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    'Send Verification Code'
                  )}
                </button>
              </form>
            ) : (
              /* Stage 2: OTP Verification Form */
              <form onSubmit={handleVerifyOtp} className="auth-form">
                <div className="form-group-auth">
                  <label>Verification Code (OTP)</label>
                  <div className="input-with-icon">
                    <Lock className="input-icon" />
                    <input
                      type="text"
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      required
                      style={{ letterSpacing: '4px', textAlign: 'center', fontWeight: 'bold' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => { setOtpSent(false); setError(''); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button type="submit" className="btn btn-primary btn-auth" style={{ flex: 1 }} disabled={loading}>
                    {loading ? (
                      <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                      'Verify & Sign In'
                    )}
                  </button>
                </div>
              </form>
            )}

            {!otpSent && (
              <div className="auth-footer" style={{ marginTop: '24px' }}>
                <span>Don't have an account? <Link to="/signup">Sign Up</Link></span>
                <div className="demo-credentials" style={{ marginTop: '12px' }}>
                  <strong>Demo Admin:</strong> <span>garv@dexnest.com</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- OPTION 2: ADMIN GOOGLE SIGN-IN --- */}
        {loginType === 'admin' && (
          <div className="animate-fade-in" style={{ padding: '4px 0' }}>
            {!showAdminSandbox ? (
              <button 
                onClick={() => setShowAdminSandbox(true)}
                disabled={loading}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  padding: '14px',
                  backgroundColor: 'var(--bg-card)',
                  color: '#1e293b',
                  fontSize: '15px',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'background-color 0.2s',
                }}
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
                  backgroundColor: 'rgba(59, 130, 246, 0.05)',
                  border: '1px solid rgba(59, 130, 246, 0.1)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  fontSize: '13px',
                  color: 'var(--primary)',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}>
                  <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ marginTop: '2px' }} />
                  <span>
                    <strong>OAuth Sandbox:</strong> Select a workspace administrator to authenticate. Only allowlisted emails can gain access.
                  </span>
                </div>

                {/* Quick Demo Selectors */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Select Admin Identity
                  </label>
                  <div style={{ display: 'grid', gap: '8px', marginTop: '6px' }}>
                    <button 
                      onClick={() => handleAdminGoogleAuth('hrakeshkumar137@gmail.com')}
                      disabled={loading}
                      style={{
                        padding: '10px 14px',
                        backgroundColor: 'var(--bg-table-th)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontWeight: 600,
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-table-hover)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--bg-table-th)'}
                    >
                      <strong>Primary Administrator:</strong> hrakeshkumar137@gmail.com
                    </button>
                  </div>
                </div>

                {/* Custom Input */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Or enter any custom email
                  </label>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                    <input 
                      type="email"
                      placeholder="test-email@workspace.com"
                      value={adminEmailInput}
                      onChange={e => setAdminEmailInput(e.target.value)}
                      disabled={loading}
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '13px'
                      }}
                    />
                    <button 
                      onClick={() => handleAdminGoogleAuth(adminEmailInput)}
                      disabled={loading || !adminEmailInput}
                      style={{
                        padding: '0 16px',
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        fontSize: '13px',
                        fontWeight: 600,
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        opacity: (!adminEmailInput || loading) ? 0.6 : 1
                      }}
                    >
                      Verify
                    </button>
                  </div>
                </div>

                <button 
                  onClick={() => setShowAdminSandbox(false)}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-secondary)',
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
        )}
      </div>
    </div>
  );
}
