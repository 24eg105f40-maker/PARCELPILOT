// src/components/Sidebar.jsx
import { Package, LayoutDashboard, Truck, Search, ClipboardList, BarChart2, Settings, RotateCcw, LogIn, LogOut } from 'lucide-react';

const navItems = [
  { id: 'overview',    label: 'Overview',     icon: LayoutDashboard },
  { id: 'shipments',  label: 'Shipments',    icon: Truck },
  { id: 'tracking',   label: 'Tracking',     icon: Search },
  { id: 'activity',   label: 'Activity Log', icon: ClipboardList },
  { id: 'reports',    label: 'Reports',      icon: BarChart2 },
  { id: 'settings',   label: 'Settings',     icon: Settings },
];

export default function Sidebar({
  activePage,
  setActivePage,
  onReset,
  isOpen,
  onClose,
  user,
  onLoginClick,
  onLogoutClick,
}) {
  const handleNav = (id) => { setActivePage(id); onClose(); };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'GV';

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar${isOpen ? ' open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="brand-icon">
            <Package size={18} color="#fff" strokeWidth={2.2} />
          </div>
          <div className="brand-text">
            <span className="brand-name">ParcelPilot</span>
            <span className="brand-sub">MERN Logistics Platform</span>
          </div>
        </div>

        {/* Workspace */}
        <div className="workspace-selector">
          <span className="workspace-dot" />
          <span className="workspace-label">India Operations</span>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <span className="nav-section-label">Main Menu</span>
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-item${activePage === id ? ' active' : ''}`}
              onClick={() => handleNav(id)}
              aria-current={activePage === id ? 'page' : undefined}
              id={`nav-${id}`}
            >
              <Icon size={16} className="nav-icon" strokeWidth={2} />
              {label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="profile-row">
            <div className="avatar" style={{
              background: user ? 'linear-gradient(135deg, #06b6d4, #2563eb)' : '#475569',
              color: '#ffffff',
              fontWeight: '700',
            }}>
              {initials}
            </div>
            <div className="profile-info">
              <div className="profile-name">{user ? user.name : 'Public Viewer'}</div>
              <div className="profile-role" style={{ textTransform: 'capitalize' }}>
                {user ? `${user.role} Account` : 'Guest Mode'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
            {user ? (
              <button
                className="reset-btn"
                onClick={onLogoutClick}
                style={{ flex: 1, justifyContent: 'center', color: '#f87171' }}
                title="Sign out of your session"
              >
                <LogOut size={13} />
                Sign Out
              </button>
            ) : (
              <button
                className="reset-btn"
                onClick={onLoginClick}
                style={{ flex: 1, justifyContent: 'center', color: '#38bdf8' }}
                title="Sign in as Staff or Admin"
              >
                <LogIn size={13} />
                Sign In
              </button>
            )}

            <button
              className="reset-btn"
              onClick={onReset}
              id="btn-reset-demo"
              title="Reseed demo dataset"
              style={{ padding: '6px 8px' }}
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
