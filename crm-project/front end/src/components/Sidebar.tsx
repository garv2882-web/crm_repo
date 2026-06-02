import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { type User } from '../api';
import { 
  PieChart, 
  Building2, 
  BookOpen, 
  Target, 
  Handshake, 
  CheckSquare, 
  Settings,
  LogOut,
  ChevronUp
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onLogout: () => void;
}

const DEFAULT_USER: User = { 
  user_id: 'e1111111-1111-4111-8111-111111111111', 
  full_name: 'Aman Verma', 
  email: 'aman@salesnest.com', 
  role: 'Admin', 
  status: 'Active' 
};

export default function Sidebar({ collapsed, onLogout }: SidebarProps) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User>(DEFAULT_USER);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Load active user
    const saved = localStorage.getItem('crm_auth_user');
    if (saved) {
      try {
        setCurrentUser(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
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
          <div 
            onClick={() => { setShowDropdown(false); navigate('/settings'); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              color: 'white',
              fontSize: '13px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>System Settings</span>
          </div>

          <div 
            onClick={() => { setShowDropdown(false); onLogout(); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              color: '#ef4444',
              fontSize: '13px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </div>
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
        <ChevronUp className="w-4 h-4 text-slate-400 profile-chevron" />
      </div>
    </aside>
  );
}
