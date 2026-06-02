import { useLocation, Link } from 'react-router-dom';
import { Menu, Search, Bell, HelpCircle } from 'lucide-react';
import { type User } from '../api';

interface NavbarProps {
  onToggleSidebar: () => void;
  user: User;
}

export default function Navbar({ onToggleSidebar, user }: NavbarProps) {
  const location = useLocation();
  const path = location.pathname;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Determine breadcrumb content based on routing path
  let moduleName = 'Dashboard';
  let subPage = '';

  if (path.startsWith('/companies')) {
    moduleName = 'Companies';
    if (path === '/companies') subPage = 'Overview';
    else subPage = 'Company Details';
  } else if (path.startsWith('/contacts')) {
    moduleName = 'Contacts';
    subPage = 'Directory';
  } else if (path.startsWith('/leads')) {
    moduleName = 'Leads';
    if (path === '/leads') subPage = 'Overview';
    else subPage = 'Lead Details';
  } else if (path.startsWith('/deals')) {
    moduleName = 'Deals';
    subPage = 'Kanban Board';
  } else if (path.startsWith('/tasks')) {
    moduleName = 'Tasks';
    subPage = 'My Tasks';
  } else if (path.startsWith('/settings')) {
    moduleName = 'Settings';
    subPage = 'Configuration';
  }

  return (
    <header className="crm-navbar">
      <div className="navbar-left">
        <button 
          className="navbar-toggle" 
          id="navbar-toggle-btn" 
          onClick={onToggleSidebar}
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <nav className="breadcrumb-container" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span className="breadcrumb-sep">/</span>
          <span>{moduleName}</span>
          {subPage && (
            <>
              <span className="breadcrumb-sep">/</span>
              <span className="breadcrumb-active" id="breadcrumb-sub">{subPage}</span>
            </>
          )}
        </nav>
      </div>
      
      <div className="navbar-right">
        <div className="navbar-search">
          <Search className="w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search anything..." aria-label="Global Search" />
        </div>
        
        <button className="navbar-action-btn" aria-label="Notifications">
          <Bell className="w-5 h-5" />
          <span className="navbar-action-badge">3</span>
        </button>
        
        <button className="navbar-action-btn" aria-label="Help">
          <HelpCircle className="w-5 h-5" />
        </button>
        
        <div>
          <Link to="/settings" style={{ display: 'block' }}>
            <div 
              className="user-avatar-trigger" 
              title={`${user.full_name} (${user.role})`}
            >
              {getInitials(user.full_name)}
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
