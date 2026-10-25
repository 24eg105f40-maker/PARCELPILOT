// src/pages/Settings.jsx
import { useState, useEffect } from 'react';
import { Download, RotateCcw, Database, Info, Layers, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, Server } from 'lucide-react';
import { exportToCSV } from '../utils/helpers';
import { healthApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Settings({ shipments, onReset }) {
  const { user, logout } = useAuth();
  const [health, setHealth] = useState(null);
  const [testingHealth, setTestingHealth] = useState(false);
  const [healthError, setHealthError] = useState(null);

  const checkHealth = async () => {
    setTestingHealth(true);
    setHealthError(null);
    try {
      const start = Date.now();
      const res = await healthApi.check();
      const latency = Date.now() - start;
      setHealth({ ...res, latency });
    } catch (err) {
      setHealthError(err.message || 'Unable to reach backend API');
      setHealth(null);
    } finally {
      setTestingHealth(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">System Settings</h1>
        <p className="page-subtitle">MERN stack configuration, database health and administrator management</p>
      </div>

      {/* Backend & Database Health Section */}
      <div className="settings-section">
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Server size={16} color="var(--clr-indigo)"/>Backend API & Database Connection
            </span>
            <button
              className="btn btn-secondary btn-sm"
              onClick={checkHealth}
              disabled={testingHealth}
              id="btn-test-health"
            >
              <RefreshCw size={12} className={testingHealth ? 'spin' : ''} />
              {testingHealth ? 'Checking…' : 'Ping Health API'}
            </button>
          </div>
          <div className="card-body">
            {health ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '8px',
                marginBottom: '16px',
              }}>
                <CheckCircle2 size={20} color="#10b981" />
                <div>
                  <div style={{ fontWeight: 600, color: '#34d399', fontSize: '13.5px' }}>
                    Express Backend & MongoDB Connected
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                    Database: <strong style={{ color: '#f8fafc' }}>{health.database}</strong> · Latency: <strong style={{ color: '#f8fafc' }}>{health.latency}ms</strong> · Service: {health.service}
                  </div>
                </div>
              </div>
            ) : healthError ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                marginBottom: '16px',
              }}>
                <AlertCircle size={20} color="#ef4444" />
                <div>
                  <div style={{ fontWeight: 600, color: '#f87171', fontSize: '13.5px' }}>
                    Backend Offline or Unreachable
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                    {healthError}. Using cached dataset for frontend presentation.
                  </div>
                </div>
              </div>
            ) : null}

            <div className="settings-row">
              <div>
                <div className="settings-key">REST API Endpoint</div>
                <div className="settings-val">Base URL for all data mutations and queries</div>
              </div>
              <span className="mono" style={{ fontSize: '13px', color: '#38bdf8' }}>
                {import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}
              </span>
            </div>

            <div className="settings-row">
              <div>
                <div className="settings-key">Database Engine</div>
                <div className="settings-val">Persistent Mongoose object-data modeling</div>
              </div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>
                MongoDB (Atlas / Local)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* User Session */}
      <div className="settings-section">
        <div className="card">
          <div className="card-header">
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={16} color="var(--clr-indigo)"/>Authentication & Session
            </span>
          </div>
          <div className="card-body">
            {user ? (
              <>
                <div className="settings-row">
                  <div>
                    <div className="settings-key">Authenticated User</div>
                    <div className="settings-val">{user.email}</div>
                  </div>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    background: user.role === 'admin' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                    color: user.role === 'admin' ? '#38bdf8' : '#cbd5e1',
                  }}>
                    {user.role}
                  </span>
                </div>

                <div className="settings-row">
                  <div>
                    <div className="settings-key">Sign Out Session</div>
                    <div className="settings-val">Clear active JSON Web Token from browser</div>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={logout} id="btn-settings-logout">
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="settings-row">
                <div>
                  <div className="settings-key">Guest Mode</div>
                  <div className="settings-val">You are currently viewing public tracking. Sign in for management.</div>
                </div>
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>Unauthenticated</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Workspace */}
      <div className="settings-section">
        <div className="card">
          <div className="card-header">
            <span className="card-title" style={{display:'flex',alignItems:'center',gap:'8px'}}>
              <Layers size={16} color="var(--clr-indigo)"/>Workspace Information
            </span>
          </div>
          <div className="card-body">
            {[
              ['Workspace Name', 'India Operations'],
              ['Organization', 'ParcelPilot Logistics'],
              ['Region', 'India (IN)'],
              ['Active Shipments in View', shipments.length],
              ['Technology Stack', 'Full MERN Stack (MongoDB, Express, React, Node.js)'],
            ].map(([k, v]) => (
              <div key={k} className="settings-row">
                <div>
                  <div className="settings-key">{k}</div>
                </div>
                <span style={{fontSize:'13.5px',fontWeight:600,color:'var(--clr-navy)'}}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="settings-section">
        <div className="card">
          <div className="card-header">
            <span className="card-title" style={{display:'flex',alignItems:'center',gap:'8px'}}>
              <Database size={16} color="var(--clr-indigo)"/>Data & Seed Management
            </span>
          </div>
          <div className="card-body">
            <div className="settings-row">
              <div>
                <div className="settings-key">Export All Shipments</div>
                <div className="settings-val">Download a CSV file of current shipment records</div>
              </div>
              <button className="btn btn-secondary" onClick={() => exportToCSV(shipments)} id="btn-settings-export">
                <Download size={14}/>Export CSV
              </button>
            </div>

            <div className="settings-row">
              <div>
                <div className="settings-key">Reset / Reseed Data</div>
                <div className="settings-val">Reload standard sample shipments across the workspace</div>
              </div>
              <button className="btn btn-danger" onClick={onReset} id="btn-settings-reset">
                <RotateCcw size={14}/>Reseed Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
