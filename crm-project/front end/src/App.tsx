import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import LeadsPage from './pages/Leads/LeadsPage';
import LeadDetailsPage from './pages/Leads/LeadDetailsPage';
import CompaniesPage from './pages/Companies/CompaniesPage';
import CompanyDetailsPage from './pages/Companies/CompanyDetailsPage';
import ContactsPage from './pages/Contacts/ContactsPage';
import DealsPage from './pages/Deals/DealsPage';
import TasksPage from './pages/Tasks/TasksPage';
import SettingsPage from './pages/Settings/SettingsPage';
import LoginPage from './pages/Auth/LoginPage';
import SignupPage from './pages/Auth/SignupPage';
import { api } from './api';

export default function App() {
  // Sync collapsible state with localStorage
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('crm_sidebar_collapsed') === 'true';
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('crm_auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleToggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('crm_sidebar_collapsed', String(next));
      return next;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('crm_auth_token');
    localStorage.removeItem('crm_auth_user');
    setCurrentUser(null);
  };

  // Sync/Verify user session on boot
  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('crm_auth_token');
      if (token) {
        try {
          const res = await api.getCurrentUser();
          setCurrentUser(res.user);
          localStorage.setItem('crm_auth_user', JSON.stringify(res.user));
        } catch (err) {
          console.error('Session verification failed, logging out:', err);
          handleLogout();
        }
      }
    };
    verifySession();
  }, []);

  // Auth Guard
  if (!currentUser) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage onLoginSuccess={setCurrentUser} />} />
          <Route path="/signup" element={<SignupPage onSignupSuccess={setCurrentUser} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <div className="crm-layout">
        
        {/* Collapsible Left Sidebar */}
        <Sidebar collapsed={sidebarCollapsed} onLogout={handleLogout} />

        {/* Main Workspace Frame */}
        <main className="crm-main">
          
          {/* Top Navbar */}
          <Navbar onToggleSidebar={handleToggleSidebar} user={currentUser} />

          {/* Module Content Area */}
          <section className="crm-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/leads" element={<LeadsPage />} />
              <Route path="/leads/:id" element={<LeadDetailsPage />} />
              <Route path="/companies" element={<CompaniesPage />} />
              <Route path="/companies/:id" element={<CompanyDetailsPage />} />
              <Route path="/contacts" element={<ContactsPage />} />
              <Route path="/deals" element={<DealsPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/settings" element={<SettingsPage user={currentUser} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </section>

        </main>
      </div>
    </BrowserRouter>
  );
}
