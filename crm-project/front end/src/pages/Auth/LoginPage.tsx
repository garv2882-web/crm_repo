import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../api';
import { Shield, Mail, Lock, RefreshCw, AlertCircle, ArrowLeft } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: any) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      
      // Verify user exists in the directory first
      const db = api.getRawDB();
      const userExists = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!userExists) {
        throw new Error('User email not found in employee directory');
      }
      if (userExists.status === 'Suspended') {
        throw new Error('Your account has been suspended. Contact your administrator.');
      }

      // Generate a mock 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(otp);
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
      
      localStorage.setItem('crm_auth_token', res.token);
      localStorage.setItem('crm_auth_user', JSON.stringify(res.user));
      
      onLoginSuccess(res.user);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container animate-fade-in">
      <div className="auth-card">
        {/* Brand Header */}
        <div className="auth-header">
          <div className="auth-logo">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h2>SalesNest CRM</h2>
          <p>Passwordless secure access for employees</p>
        </div>

        {error && (
          <div className="auth-error">
            <span>{error}</span>
          </div>
        )}

        {/* Sandbox OTP Notification */}
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
              <strong>OTP Sandbox:</strong> A one-time verification code has been dispatched. Your code is:
              <div style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '2px', color: 'var(--primary)', marginTop: '4px' }}>
                {generatedOtp}
              </div>
            </div>
          </div>
        )}

        {!otpSent ? (
          /* Stage 1: Email Form */
          <form onSubmit={handleSendOtp} className="auth-form">
            <div className="form-group-auth">
              <label>Email Address</label>
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

        <div className="auth-footer">
          <span>Don't have an account? <Link to="/signup">Sign Up</Link></span>
          <div className="demo-credentials">
            <strong>Demo Member:</strong> <span>garv@salesnest.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}
