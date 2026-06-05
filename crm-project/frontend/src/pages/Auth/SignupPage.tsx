import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../api';
import { isAdminEmail } from '../../config/adminConfig';
import { Shield, User, Mail, Lock, RefreshCw, Briefcase, AlertCircle, ArrowLeft } from 'lucide-react';

interface SignupPageProps {
  onSignupSuccess: (user: any) => void;
}

export default function SignupPage({ onSignupSuccess }: SignupPageProps) {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Sales Rep — Standard'); // Default role template matching schema
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Stage 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setError('');
      setLoading(true);
      
      // Verify email isn't already taken, and exists in directory if not admin
      const db = api.getRawDB();
      const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existing && existing.status !== 'Pending') {
        throw new Error('Email is already registered and active. Please sign in instead.');
      }
      if (!existing && !isAdminEmail(email)) {
        throw new Error('Your email address was not found in the employee directory. Please contact your CRM Admin to invite you first.');
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
            _subject: "SalesNest CRM - Signup Verification Code",
            "Verification Code": otp,
            message: `Your SalesNest CRM signup verification code is ${otp}. Enter this code on the registration page to activate your account.`
          })
        });
      } catch (err) {
        console.error("Failed to send signup OTP email:", err);
      }

      setOtpSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  // Stage 2: Verify OTP & Signup
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
      const res = await api.signup({
        full_name: fullName,
        email,
        role
      });
      
      localStorage.setItem('crm_auth_token', res.token);
      localStorage.setItem('crm_auth_user', JSON.stringify(res.user));
      
      // Auto-login to Admin Portal if allowlisted email
      if (isAdminEmail(res.user.email)) {
        const mockGoogleProfile = {
          email: res.user.email.toLowerCase(),
          name: res.user.full_name,
          picture: `https://api.dicebear.com/7.x/initials/svg?seed=${res.user.email}`
        };
        localStorage.setItem('crm_admin_user', JSON.stringify(mockGoogleProfile));
        
        onSignupSuccess(res.user);
        navigate('/admin');
      } else {
        // Clear any leftover admin session
        localStorage.removeItem('crm_admin_user');
        
        onSignupSuccess(res.user);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Account registration failed');
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
          <h2>Create Account</h2>
          <p>Register a passwordless employee profile</p>
        </div>

        {error && (
          <div className="auth-error">
            <span>{error}</span>
          </div>
        )}

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
          /* Stage 1: Info Form */
          <form onSubmit={handleSendOtp} className="auth-form">
            {/* Full Name Input */}
            <div className="form-group-auth">
              <label>Full Name</label>
              <div className="input-with-icon">
                <User className="input-icon" />
                <input
                  type="text"
                  placeholder="e.g. Aman Verma"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Email Input */}
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

            {/* Role Selection */}
            <div className="form-group-auth">
              <label>System Role Template</label>
              <div className="input-with-icon">
                <Briefcase className="input-icon" />
                <select
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  style={{
                    width: '100%',
                    height: '42px',
                    paddingLeft: '38px',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'white',
                    fontSize: '14px',
                    color: 'var(--text-primary)'
                  }}
                >
                  <option value="Sales Rep — Standard">Sales Rep — Standard</option>
                  <option value="Sales Rep — View Only">Sales Rep — View Only</option>
                  <option value="Senior Executive">Senior Executive</option>
                </select>
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
              <label>Enter 6-digit Verification Code (OTP)</label>
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
                  'Verify & Create Account'
                )}
              </button>
            </div>
          </form>
        )}

        <div className="auth-footer">
          <span>Already have an account? <Link to="/login">Sign In</Link></span>
        </div>
      </div>
    </div>
  );
}
