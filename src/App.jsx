// src/App.jsx
import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import ToastContainer from './components/Toast';
import Overview from './pages/Overview';
import Shipments from './pages/Shipments';
import Tracking from './pages/Tracking';
import ActivityLog from './pages/ActivityLog';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { loadShipments, saveShipments, loadActivity, saveActivity, resetDemoData } from './utils/storage';
import { createTimelineEvent } from './utils/helpers';
import { STATUSES } from './data/shipments';
import { shipmentApi, activityApi, healthApi } from './services/api';
import { useAuth } from './context/AuthContext';
import './styles/index.css';

let toastCounter = 0;
function useToasts() {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = `toast-${++toastCounter}`;
    setToasts(ts => [...ts, { id, message, type, duration }]);
  }, []);
  const dismiss = useCallback((id) => {
    setToasts(ts => ts.filter(t => t.id !== id));
  }, []);
  return { toasts, addToast, dismiss };
}

export default function App() {
  const { user, logout, isAuthenticated } = useAuth();
  const [activePage, setActivePage]   = useState('overview');
  const [navExtra, setNavExtra]       = useState(null); // e.g. { shipmentId }
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dbStatus, setDbStatus]       = useState('connecting');

  // Initialize from cache or fallback data
  const [shipments, setShipments] = useState(() => loadShipments());
  const [activity, setActivity]   = useState(() => loadActivity());
  const { toasts, addToast, dismiss } = useToasts();

  // Helper to persist in state and cache
  const persistShipments = (s) => { setShipments(s); saveShipments(s); };
  const persistActivity  = (a) => { setActivity(a);  saveActivity(a); };

  // Fetch real data from MongoDB API
  const refreshBackendData = useCallback(async () => {
    try {
      const health = await healthApi.check();
      setDbStatus(health.database || 'connected');

      // Fetch shipments from API
      try {
        const shipRes = await shipmentApi.list({ limit: 100 });
        const list = shipRes.shipments || (Array.isArray(shipRes) ? shipRes : null);
        if (list && list.length > 0) {
          persistShipments(list);
        }
      } catch (err) {
        // If unauthenticated or error, retain cached/props
      }

      // Fetch activity from API
      try {
        const actRes = await activityApi.getActivity(30);
        if (Array.isArray(actRes) && actRes.length > 0) {
          persistActivity(actRes);
        }
      } catch (err) {
        // Retain cached
      }
    } catch (err) {
      setDbStatus('disconnected');
    }
  }, []);

  // Initial load & when authentication state changes
  useEffect(() => {
    refreshBackendData();
  }, [refreshBackendData, isAuthenticated]);

  const navigate = (page, shipmentId) => {
    setActivePage(page);
    setNavExtra(shipmentId ? { shipmentId } : null);
    setSidebarOpen(false);
  };

  /* ── Create Shipment ── */
  const handleCreated = (newShipment) => {
    const updated = [newShipment, ...shipments];
    persistShipments(updated);

    const shipId = newShipment.trackingId || newShipment.id;
    const recipientName = newShipment.recipient?.name || newShipment.recipientName || 'Authorized Recipient';

    const actEntry = {
      id: `act-${Date.now()}`,
      event: 'New shipment created',
      trackingId: shipId,
      recipient: recipientName,
      location: `${newShipment.origin} Office`,
      timestamp: new Date().toISOString(),
      status: STATUSES.PENDING_PICKUP,
    };
    persistActivity([actEntry, ...activity]);

    addToast(`Shipment ${shipId} saved to MongoDB successfully`, 'success');
  };

  /* ── Status Update ── */
  const handleStatusUpdate = (id, newStatus, locationHint, serverShipment) => {
    const location = locationHint || 'India Hub';

    if (serverShipment) {
      // If server returned the newly updated shipment record
      const updated = shipments.map(s => {
        const sId = s.trackingId || s.id;
        return (sId === id) ? serverShipment : s;
      });
      persistShipments(updated);
    } else {
      // Local fallback
      const updated = shipments.map(s => {
        const sId = s.trackingId || s.id;
        if (sId !== id) return s;
        const oldTimeline = (s.timeline || []).map(ev => ({ ...ev, isLatest: false }));
        const newEvent = createTimelineEvent(newStatus, location);
        const exceptionMsg = newStatus === STATUSES.EXCEPTION
          ? 'Delivery exception encountered. Package held at facility. Please contact support.'
          : null;
        return { ...s, status: newStatus, timeline: [...oldTimeline, newEvent], exceptionMessage: exceptionMsg };
      });
      persistShipments(updated);
    }

    const ship = shipments.find(s => (s.trackingId || s.id) === id);
    const actEntry = {
      id: `act-${Date.now()}`,
      event: createTimelineEvent(newStatus, location).event,
      trackingId: id,
      recipient: ship?.recipient?.name || ship?.recipientName || '',
      location,
      timestamp: new Date().toISOString(),
      status: newStatus,
    };
    persistActivity([actEntry, ...activity]);

    addToast(`Status updated to "${newStatus}" for ${id}`, 'success');
  };

  /* ── Reset Demo Data ── */
  const handleReset = () => {
    resetDemoData();
    setShipments(loadShipments());
    setActivity(loadActivity());
    refreshBackendData();
    addToast('Demo dataset has been reset to initial benchmark records', 'info');
  };

  const attentionCount = shipments.filter(s => s.status === STATUSES.EXCEPTION).length;

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return <Overview
          shipments={shipments}
          activity={activity}
          onCreateShipment={() => navigate('shipments')}
          onNavigate={navigate}
        />;
      case 'shipments':
        return <Shipments
          shipments={shipments}
          onCreated={handleCreated}
          onStatusUpdate={handleStatusUpdate}
          initialId={navExtra?.shipmentId}
        />;
      case 'tracking':
        return <Tracking shipments={shipments} />;
      case 'activity':
        return <ActivityLog activity={activity} />;
      case 'reports':
        return <Reports shipments={shipments} />;
      case 'settings':
        return <Settings shipments={shipments} onReset={handleReset} />;
      case 'login':
        return <Login
          onSuccess={() => {
            addToast(`Signed in successfully as ${user?.role || 'administrator'}`, 'success');
            navigate('overview');
          }}
          onGoPublicTracking={() => navigate('tracking')}
        />;
      default:
        return <Overview shipments={shipments} activity={activity} onNavigate={navigate} />;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar
        activePage={activePage}
        setActivePage={(p) => { setActivePage(p); setNavExtra(null); }}
        onReset={handleReset}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onLoginClick={() => navigate('login')}
        onLogoutClick={() => {
          logout();
          addToast('Signed out of session', 'info');
        }}
      />
      <div className="main-area">
        <Topbar
          activePage={activePage}
          onHamburger={() => setSidebarOpen(o => !o)}
          notifCount={attentionCount}
          user={user}
          onLoginClick={() => navigate('login')}
          onLogoutClick={() => {
            logout();
            addToast('Signed out of session', 'info');
          }}
          dbStatus={dbStatus}
        />
        <main className="page-content">
          {renderPage()}
        </main>
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
