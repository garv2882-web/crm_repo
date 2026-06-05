import { useState } from 'react';
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
import SuspendedScreen from './pages/Auth/SuspendedScreen';
import { CRMProvider, useCRM } from './context/CRMContext';
import { AdminGuard, CRMGuard } from './components/Guards';

// Admin Page Imports
import AdminLayout from './pages/Admin/AdminLayout';
import AdminOverview from './pages/Admin/AdminOverview';
import AdminEmployees from './pages/Admin/AdminEmployees';
import AdminDealMonitor from './pages/Admin/AdminDealMonitor';
import AdminActivityLog from './pages/Admin/AdminActivityLog';
import AdminSettings from './pages/Admin/AdminSettings';
import AdminLogin from './pages/Admin/AdminLogin';
import AdminDenied from './pages/Admin/AdminDenied';

function AppContent() {
  const { currentUser, setCurrentUser, logout } = useCRM();
  
  // Sync collapsible state with localStorage
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('crm_sidebar_collapsed') === 'true';
  });

  const handleToggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('crm_sidebar_collapsed', String(next));
      return next;
    });
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <Routes>
      {/* Admin Portal Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/denied" element={<AdminDenied />} />
      
      <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
        <Route index element={<AdminOverview />} />
        <Route path="employees" element={<AdminEmployees />} />
        <Route path="deals" element={<AdminDealMonitor />} />
        <Route path="activity" element={<AdminActivityLog />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Suspended Page Route */}
      <Route path="/suspended" element={<SuspendedScreen />} />

      {/* Employee Login / Signup */}
      <Route path="/login" element={currentUser ? <Navigate to="/" replace /> : <LoginPage onLoginSuccess={setCurrentUser} />} />
      <Route path="/signup" element={currentUser ? <Navigate to="/" replace /> : <SignupPage onSignupSuccess={setCurrentUser} />} />

      {/* Employee CRM Workspace Module Areas */}
      <Route 
        path="/*" 
        element={
          <CRMGuard>
            {currentUser ? (
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
            ) : <Navigate to="/login" replace />}
          </CRMGuard>
        } 
      />
    </Routes>
  );
}

export default function App() {
  return (
    <CRMProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </CRMProvider>
  );
}
