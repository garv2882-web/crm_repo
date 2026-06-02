import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { api, type User } from '../api';
import { 
  PieChart, 
  Building2, 
  BookOpen, 
  Target, 
  Handshake, 
  CheckSquare, 
  Settings,
  ChevronDown
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
}

const DEFAULT_USER: User = { 
  user_id: 'u1111111-1111-4111-8111-111111111111', 
  full_name: 'Aman Verma', 
  email: 'aman@salesnest.com', 
  role: 'Admin', 
  status: 'Active' 
};

export default function Sidebar({ collapsed }: SidebarProps) {
  const [currentUser, setCurrentUser] = useState<User>(DEFAULT_USER);
  const [users, setUsers] = useState<User[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Load active user
    const saved = localStorage.getItem('crm_current_user');
    if (saved) {
      try {
        setCurrentUser(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
    
    // Load list of users
    api.getUsers().then(setUsers).catch(console.error);
  }, []);

  const handleUserSwitch = (user: User) => {
    localStorage.setItem('crm_current_user', JSON.stringify(user));
    setCurrentUser(user);
    setShowDropdown(false);
    // Reload page to re-render context throughout page modules
    window.location.reload();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  return (
    <aside className={`crm-sidebar ${collapsed ? 'collapsed' : ''}`} id="crm-sidebar-menu" style={{ position: 'relative' }}>
      <div className="sidebar-logo">
        <div className="logo-icon">S</div>
        <span className="logo-text">SalesNest</span>
      </div>
      
      <ul className="sidebar-menu">
        <li className="sidebar-item">
          <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''} end>
            <PieChart className="w-5 h-5" />
            <span>Dashboard</span>
          </NavLink>
        </li>
        <li className="sidebar-item">
          <NavLink to="/companies" className={({ isActive }) => isActive ? 'active' : ''}>
            <Building2 className="w-5 h-5" />
            <span>Companies</span>
          </NavLink>
        </li>
        <li className="sidebar-item">
          <NavLink to="/contacts" className={({ isActive }) => isActive ? 'active' : ''}>
            <BookOpen className="w-5 h-5" />
            <span>Contacts</span>
          </NavLink>
        </li>
        <li className="sidebar-item">
          <NavLink to="/leads" className={({ isActive }) => isActive ? 'active' : ''}>
            <Target className="w-5 h-5" />
            <span>Leads</span>
          </NavLink>
        </li>
        <li className="sidebar-item">
          <NavLink to="/deals" className={({ isActive }) => isActive ? 'active' : ''}>
            <Handshake className="w-5 h-5" />
            <span>Deals</span>
          </NavLink>
        </li>
        <li className="sidebar-item">
          <NavLink to="/tasks" className={({ isActive }) => isActive ? 'active' : ''}>
            <CheckSquare className="w-5 h-5" />
            <span>Tasks</span>
          </NavLink>
        </li>
        <li className="sidebar-item">
          <NavLink to="/settings" className={({ isActive }) => isActive ? 'active' : ''}>
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </NavLink>
        </li>
      </ul>

      {/* Switcher Dropdown */}
      {showDropdown && !collapsed && (
        <div style={{
          position: 'absolute',
          bottom: '70px',
          left: '12px',
          right: '12px',
          backgroundColor: '#1e293b',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 1000,
          padding: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', padding: '4px 8px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
            Switch User Identity
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
                backgroundColor: currentUser.user_id === u.user_id ? 'rgba(255,255,255,0.08)' : 'transparent',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = currentUser.user_id === u.user_id ? 'rgba(255,255,255,0.08)' : 'transparent'}
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
                <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'white' }}>{u.full_name}</span>
                <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>{u.role}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div 
        className="sidebar-profile" 
        onClick={() => setShowDropdown(!showDropdown)}
        style={{ position: 'relative' }}
      >
        <div className="profile-info">
          <div className="profile-avatar">{getInitials(currentUser.full_name)}</div>
          <div className="profile-details">
            <span className="profile-name">{currentUser.full_name}</span>
            <span className="profile-role">{currentUser.role}</span>
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400 profile-chevron" />
      </div>
    </aside>
  );
}
