// src/components/Topbar.jsx
import { Bell, Menu, ChevronRight, LogIn, LogOut, ShieldCheck, Database } from 'lucide-react';

const PAGE_LABELS = {
  overview:  'Overview',
  shipments: 'Shipments',
  tracking:  'Tracking',
  activity:  'Activity Log',
  reports:   'Reports',
  settings:  'Settings',
  login:     'Sign In',
};

export default function Topbar({
  activePage,
  onHamburger,
  notifCount,
  user,
  onLoginClick,
  onLogoutClick,
  dbStatus = 'connected',
}) {
  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button className="hamburger" onClick={onHamburger} aria-label="Open menu" id="btn-hamburger">
          <Menu size={20} />
        </button>

        <nav className="topbar-breadcrumbs" aria-label="Breadcrumb">
          <span className="breadcrumb-item">ParcelPilot</span>
          <ChevronRight size={13} className="breadcrumb-sep" />
          <span className="breadcrumb-item current">{PAGE_LABELS[activePage] || activePage}</span>
        </nav>
      </div>

      <div className="topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Backend & DB Status Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: '9999px',
          fontSize: '11px',
          fontWeight: '600',
          background: dbStatus === 'connected' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          color: dbStatus === 'connected' ? '#34d399' : '#f87171',
          border: `1px solid ${dbStatus === 'connected' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
        }} title={`API & MongoDB Status: ${dbStatus}`}>
          <Database size={12} />
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: dbStatus === 'connected' ? '#10b981' : '#ef4444',
          }} />
          <span>{dbStatus === 'connected' ? 'MERN Live' : 'API Offline'}</span>
        </div>

        {/* Notifications */}
        <button className="icon-btn" aria-label="Notifications" id="btn-notifications">
          <Bell size={16} />
          {notifCount > 0 && <span className="notif-dot" />}
        </button>

        {/* User Account / Auth Actions */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '8px',
              background: 'var(--color-surface, #1e293b)',
              border: '1px solid var(--color-border, #334155)',
              fontSize: '12px',
            }}>
              <ShieldCheck size={14} style={{ color: '#06b6d4' }} />
              <span style={{ color: '#f8fafc', fontWeight: '600' }}>{user.name}</span>
              <span style={{
                fontSize: '10px',
                textTransform: 'uppercase',
                padding: '1px 5px',
                borderRadius: '4px',
                background: user.role === 'admin' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                color: user.role === 'admin' ? '#38bdf8' : '#cbd5e1',
                fontWeight: '700',
              }}>
                {user.role}
              </span>
            </div>

            <button
              onClick={onLogoutClick}
              id="btn-topbar-logout"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 10px',
                borderRadius: '6px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#f87171',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: '500',
              }}
              title="Sign Out"
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onLoginClick}
            id="btn-topbar-login"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
              color: '#ffffff',
              border: 'none',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(6, 182, 212, 0.3)',
            }}
          >
            <LogIn size={13} />
            <span>Staff Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
