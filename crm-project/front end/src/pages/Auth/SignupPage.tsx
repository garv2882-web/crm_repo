import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../api';
import { Shield, User, Mail, Lock, RefreshCw, Briefcase } from 'lucide-react';

interface SignupPageProps {
  onSignupSuccess: (user: any) => void;
}

export default function SignupPage({ onSignupSuccess }: SignupPageProps) {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Sales');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setError('');
      setLoading(true);
      const res = await api.signup({
        full_name: fullName,
        email,
        password,
        role
      });
      
      localStorage.setItem('crm_auth_token', res.token);
      localStorage.setItem('crm_auth_user', JSON.stringify(res.user));
      
      onSignupSuccess(res.user);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to sign up. Email may already be registered.');
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
          <p>Sign up to get started with SalesNest CRM</p>
        </div>

        {error && (
          <div className="auth-error">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Full Name Input */}
          <div className="form-group-auth">
            <label>Full Name</label>
            <div className="input-with-icon">
              <User className="input-icon" />
              <input
                type="text"
                placeholder="Aman Verma"
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

          {/* Password Input */}
          <div className="form-group-auth">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock className="input-icon" />
              <input
                type="password"
                placeholder="Create a strong password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Role Selection */}
          <div className="form-group-auth">
            <label>System Role</label>
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
                <option value="Sales">Sales Professional</option>
                <option value="Admin">System Administrator</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn btn-primary btn-auth" disabled={loading}>
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin mr-2" />
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <span>Already have an account? <Link to="/login">Sign In</Link></span>
        </div>
      </div>
    </div>
  );
}
