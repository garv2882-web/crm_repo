import { useNavigate } from 'react-router-dom';
import { UserX } from 'lucide-react';
import { api } from '../../api';

export default function SuspendedScreen() {
  const navigate = useNavigate();

  const handleBackToLogin = async () => {
    // Perform standard API logout to clear tokens and sessions
    await api.logout();
    navigate('/login');
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: 'var(--bg-main)',
      fontFamily: 'var(--font-sans)',
      color: 'var(--text-primary)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '440px',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-lg)',
        padding: '40px',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '56px',
          height: '56px',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderRadius: '50%',
          marginBottom: '16px',
          color: '#ef4444'
        }}>
          <UserX className="w-8 h-8" />
        </div>

        <h2 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '8px' }}>
          Account Suspended
        </h2>

        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5, marginBottom: '32px' }}>
          Your account has been suspended. Contact your administrator.
        </p>

        <button 
          onClick={handleBackToLogin}
          style={{
            width: '100%',
            padding: '12px 0',
            backgroundColor: 'var(--primary)',
            color: 'white',
            fontSize: '14px',
            fontWeight: 600,
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer'
          }}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
