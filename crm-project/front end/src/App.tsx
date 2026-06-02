import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

export default function App() {
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

  return (
    <BrowserRouter>
      <div className="crm-layout">
        
        {/* Collapsible Left Sidebar */}
        <Sidebar collapsed={sidebarCollapsed} />

        {/* Main Workspace Frame */}
        <main className="crm-main">
          
          {/* Top Navbar */}
          <Navbar onToggleSidebar={handleToggleSidebar} />

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
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </section>

        </main>
      </div>
    </BrowserRouter>
  );
}
