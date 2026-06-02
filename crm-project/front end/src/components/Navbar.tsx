import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, Search, Bell, HelpCircle } from 'lucide-react';
import { api, type User } from '../api';

interface NavbarProps {
  onToggleSidebar: () => void;
}

const DEFAULT_USER: User = { 
  user_id: 'u1111111-1111-4111-8111-111111111111', 
  full_name: 'Aman Verma', 
  email: 'aman@salesnest.com', 
  role: 'Admin', 
  status: 'Active' 
};

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const location = useLocation();
  const path = location.pathname;
  const [currentUser, setCurrentUser] = useState<User>(DEFAULT_USER);
  const [users, setUsers] = useState<User[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('crm_current_user');
    if (saved) {
      try {
        setCurrentUser(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
    api.getUsers().then(setUsers).catch(console.error);
  }, []);

  const handleUserSwitch = (user: User) => {
    localStorage.setItem('crm_current_user', JSON.stringify(user));
    setCurrentUser(user);
    setShowDropdown(false);
    window.location.reload();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
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
        
        <div style={{ position: 'relative' }}>
          <div 
            className="user-avatar-trigger" 
            title={`${currentUser.full_name} (${currentUser.role})`}
            onClick={() => setShowDropdown(!showDropdown)}
          >
            {getInitials(currentUser.full_name)}
          </div>
          
          {showDropdown && (
            <div style={{
              position: 'absolute',
              top: '46px',
              right: '0px',
              width: '220px',
              backgroundColor: 'white',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 1000,
              padding: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)', padding: '4px 8px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                Active Identity Switcher
              </div>
              {users.map(u => (
                <div 
                  key={u.user_id} 
                  onClick={() => handleUserSwitch(u)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    backgroundColor: currentUser.user_id === u.user_id ? 'var(--primary-light)' : 'transparent',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-main)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = currentUser.user_id === u.user_id ? 'var(--primary-light)' : 'transparent'}
                >
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: u.role === 'Admin' ? 'var(--primary)' : 'hsl(35, 92%, 45%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '11px'
                  }}>
                    {getInitials(u.full_name)}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{u.full_name}</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{u.role}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
