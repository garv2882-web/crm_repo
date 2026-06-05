import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export default function AdminDenied() {
  const handleSignOutGoogle = () => {
    localStorage.removeItem('crm_admin_user');
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: 'hsl(222, 47%, 6%)', // Dark theme matching admin login
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
          <ShieldAlert className="w-8 h-8" />
        </div>
        
        <h2 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '8px' }}>
          Access Denied
        </h2>
        
        <p style={{ color: 'var(--text-tertiary)', fontSize: '14px', lineHeight: 1.5, marginBottom: '32px' }}>
          You don't have permission to access this area.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Link 
            to="/" 
            style={{
              width: '100%',
              display: 'block',
              padding: '12px 0',
              backgroundColor: 'var(--primary)',
              color: 'white',
              fontSize: '14px',
              fontWeight: 600,
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              textAlign: 'center',
              boxSizing: 'border-box'
            }}
          >
            Return to SalesNest CRM
          </Link>
          
          <Link 
            to="/admin/login" 
            onClick={handleSignOutGoogle}
            style={{
              width: '100%',
              display: 'block',
              padding: '12px 0',
              backgroundColor: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--text-tertiary)',
              fontSize: '14px',
              fontWeight: 500,
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              textAlign: 'center',
              boxSizing: 'border-box'
            }}
          >
            Try Another Account
          </Link>
        </div>

      </div>
    </div>
  );
}
