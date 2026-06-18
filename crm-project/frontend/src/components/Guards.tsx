import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useCRM } from '../context/CRMContext';
import { isAdminEmail } from '../config/adminConfig';

interface GuardProps {
  children: React.ReactElement;
}

// Admin Route Guard
export const AdminGuard: React.FC<GuardProps> = ({ children }) => {
  const location = useLocation();
  const adminUserStr = localStorage.getItem('crm_admin_user');
  
  if (!adminUserStr) {
    // Redirect to admin login screen
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  try {
    const adminUser = JSON.parse(adminUserStr);
    const email = adminUser.email;
    
    // Enforce allowlist check (re-verified on every render/location change)
    if (!isAdminEmail(email)) {
      // Access Denied screen
      return <Navigate to="/admin/denied" replace />;
    }
  } catch (e) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

// Main CRM Employee Route Guard
export const CRMGuard: React.FC<GuardProps> = ({ children }) => {
  const { currentUser, authLoading, users } = useCRM();
  const location = useLocation();

  if (authLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'hsl(222, 47%, 6%)',
        color: 'white',
        fontFamily: 'var(--font-sans)',
        fontSize: '15px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '24px',
            height: '24px',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
          }} className="animate-spin"></div>
          <span>Verifying secure session...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    // Redirect to employee login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Double check user exists and is active in the shared employees list
  const dbUser = users.find(u => u.user_id === currentUser.user_id);
  if (!dbUser || dbUser.status !== 'Active') {
    // If user is suspended or doesn't exist, route to suspended screen
    return <Navigate to="/suspended" replace />;
  }

  return children;
};
