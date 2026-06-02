import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../api';
import { Shield, Mail, Lock, RefreshCw } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: any) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setError('');
      setLoading(true);
      const res = await api.login({ email, password });
      
      localStorage.setItem('crm_auth_token', res.token);
      localStorage.setItem('crm_auth_user', JSON.stringify(res.user));
      
      onLoginSuccess(res.user);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
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
          <p>Sign in to manage your sales pipeline and relationships</p>
        </div>

        {error && (
          <div className="auth-error">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
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
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn btn-primary btn-auth" disabled={loading}>
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin mr-2" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <span>Don't have an account? <Link to="/signup">Sign Up</Link></span>
          <div className="demo-credentials">
            <strong>Demo Admin:</strong> <span>garv@salesnest.com</span> / <span>password123</span>
          </div>
        </div>
      </div>
    </div>
  );
}
