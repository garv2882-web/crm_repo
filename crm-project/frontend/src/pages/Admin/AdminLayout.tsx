import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  PieChart, 
  Users, 
  TrendingUp, 
  ClipboardList, 
  Settings, 
  LogOut, 
  Menu, 
  ChevronDown, 
  Shield,
  Home
} from 'lucide-react';

export default function AdminLayout() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('crm_admin_sidebar_collapsed') === 'true';
  });
  
  const [adminUser, setAdminUser] = useState<{ email: string; name: string } | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('crm_admin_user');
    if (userStr) {
      try {
        setAdminUser(JSON.parse(userStr));
      } catch (e) {
        navigate('/admin/login');
      }
    } else {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleToggleSidebar = () => {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('crm_admin_sidebar_collapsed', String(next));
      return next;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('crm_admin_user');
    localStorage.removeItem('crm_auth_token');
    localStorage.removeItem('crm_auth_user');
    localStorage.removeItem('crm_current_session_id');
    navigate('/admin/login');
  };

  const getInitials = (name: string) => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (!adminUser) return null;

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      fontFamily: 'var(--font-sans)',
      backgroundColor: '#f1f5f9' // Light slate background for body
    }}>
      
      {/* Dark Sidebar */}
      <aside style={{
        width: collapsed ? '72px' : '260px',
        backgroundColor: 'hsl(222, 47%, 6%)', // Darkest shade of palette
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        borderRight: '1px solid rgba(255, 255, 255, 0.05)',
        zIndex: 100
      }}>
        {/* Sidebar Header / Logo */}
        <div style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          gap: '12px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          whiteSpace: 'nowrap',
          overflow: 'hidden'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            backgroundColor: '#3b82f6',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 800,
            fontSize: '16px',
            boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)',
            flexShrink: 0
          }}>
            <Shield className="w-4 h-4" />
          </div>
          {!collapsed && (
            <div style={{ display: 'flex', flexDirection: 'column' }} className="animate-fade-in">
              <span style={{ fontWeight: 700, fontSize: '15px', letterSpacing: '-0.02em', color: '#f8fafc' }}>
                SalesNest
              </span>
              <span style={{ fontSize: '10px', fontWeight: 600, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '-2px' }}>
                Admin Portal
              </span>
            </div>
          )}
        </div>

        {/* Sidebar Menu Items */}
        <ul style={{
          flex: 1,
          listStyle: 'none',
          padding: '24px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          overflowY: 'auto',
          overflowX: 'hidden',
          margin: 0
        }}>
          {[
            { to: '/admin', end: true, label: 'Overview', icon: PieChart },
            { to: '/admin/employees', label: 'Employees', icon: Users },
            { to: '/admin/deals', label: 'Deal Monitor', icon: TrendingUp },
            { to: '/admin/activity', label: 'Activity Log', icon: ClipboardList },
            { to: '/admin/settings', label: 'Settings', icon: Settings },
            { to: '/', end: true, label: 'Go to CRM', icon: Home }
          ].map(item => (
            <li key={item.to} style={{ listStyle: 'none' }}>
              <NavLink 
                to={item.to} 
                end={item.end}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? 'white' : 'hsl(215, 20%, 65%)',
                  backgroundColor: isActive ? '#3b82f6' : 'transparent',
                  fontWeight: 500,
                  fontSize: '14px',
                  gap: '16px',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  transition: 'background-color 0.2s, color 0.2s'
                })}
                onMouseEnter={e => {
                  if (!e.currentTarget.className.includes('active')) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.color = 'white';
                  }
                }}
                onMouseLeave={e => {
                  if (!e.currentTarget.className.includes('active')) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'hsl(215, 20%, 65%)';
                  }
                }}
              >
                <item.icon className="w-5 h-5" style={{ flexShrink: 0, width: '20px', height: '20px' }} />
                {!collapsed && <span className="animate-fade-in">{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Sidebar Footer - Badge */}
        {!collapsed && (
          <div style={{
            padding: '16px 20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            fontSize: '11px',
            color: 'hsl(215, 20%, 50%)',
            textAlign: 'center',
            backgroundColor: 'rgba(0,0,0,0.1)'
          }}>
            <span style={{
              display: 'inline-block',
              padding: '4px 8px',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              color: '#60a5fa',
              borderRadius: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Admin — Anigravity
            </span>
          </div>
        )}
      </aside>

      {/* Main Content Pane */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden'
      }}>
        
        {/* Top Navbar */}
        <header style={{
          height: '64px',
          backgroundColor: '#ffffff', // Clean white background for contrast
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          flexShrink: 0
        }}>
          {/* Toggle sidebar button */}
          <button 
            onClick={handleToggleSidebar}
            style={{
              padding: '8px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'transparent',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-main)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Org details title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontWeight: 600,
              fontSize: '14px',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)'
            }}>
              Workspace: Anigravity
            </span>
          </div>

          {/* Profile details */}
          <div style={{ position: 'relative' }}>
            <div 
              onClick={() => setShowDropdown(!showDropdown)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-main)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: 'hsl(222, 47%, 11%)',
                color: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: 600
              }}>
                {getInitials(adminUser.name)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '-1px' }}>
                  {adminUser.name}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '-2px' }}>
                  {adminUser.email}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>

            {/* Profile Dropdown */}
            {showDropdown && (
              <div style={{
                position: 'absolute',
                top: '50px',
                right: 0,
                width: '180px',
                backgroundColor: 'white',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                padding: '6px',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}>
                <button 
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'transparent',
                    color: '#ef4444',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.05)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Scrollable Work Container */}
        <main style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          boxSizing: 'border-box'
        }}>
          <Outlet />
        </main>
      </div>

    </div>
  );
}
