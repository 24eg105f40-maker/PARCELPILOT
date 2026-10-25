// src/pages/Login.jsx
import React, { useState } from 'react';
import { ShieldCheck, Eye, EyeOff, Lock, Mail, ArrowRight, Package, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login({ onSuccess, onGoPublicTracking }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      if (onSuccess) onSuccess();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (role = 'admin') => {
    if (role === 'admin') {
      setEmail('admin@parcelpilot.demo');
      setPassword('Admin@123456');
    }
    setError('');
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: 'var(--color-surface, #1e293b)',
        border: '1px solid var(--color-border, #334155)',
        borderRadius: '16px',
        padding: '36px 32px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Glow accent */}
        <div style={{
          position: 'absolute',
          top: '-60px',
          right: '-60px',
          width: '140px',
          height: '140px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
            color: '#fff',
            marginBottom: '16px',
            boxShadow: '0 8px 16px rgba(6, 182, 212, 0.3)',
          }}>
            <ShieldCheck size={28} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#f8fafc', margin: '0 0 6px 0' }}>
            Staff & Admin Sign In
          </h2>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
            Access ParcelPilot shipment management & operations
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 14px',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            fontSize: '13px',
            marginBottom: '20px',
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                id="login-email-input"
                type="email"
                placeholder="admin@parcelpilot.demo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '11px 12px 11px 38px',
                  background: 'var(--color-bg, #0f172a)',
                  border: '1px solid var(--color-border, #334155)',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                id="login-password-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '11px 40px 11px 38px',
                  background: 'var(--color-bg, #0f172a)',
                  border: '1px solid var(--color-border, #334155)',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            style={{
              marginTop: '6px',
              padding: '12px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
              color: '#fff',
              border: 'none',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: loading ? 0.7 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Quick demo credentials helper */}
        <div style={{
          marginTop: '24px',
          padding: '12px 14px',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px dashed #334155',
          borderRadius: '8px',
          fontSize: '12px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ color: '#94a3b8', fontWeight: '500' }}>Demo Administrator:</span>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              style={{
                background: 'rgba(6, 182, 212, 0.15)',
                border: '1px solid rgba(6, 182, 212, 0.4)',
                color: '#38bdf8',
                borderRadius: '4px',
                padding: '2px 8px',
                fontSize: '11px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Fill Demo Login
            </button>
          </div>
          <div style={{ color: '#cbd5e1', fontFamily: 'monospace', fontSize: '11px' }}>
            admin@parcelpilot.demo / Admin@123456
          </div>
        </div>

        {/* Public tracking portal link */}
        {onGoPublicTracking && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button
              type="button"
              onClick={onGoPublicTracking}
              style={{
                background: 'none',
                border: 'none',
                color: '#06b6d4',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                textDecoration: 'underline',
              }}
            >
              <Package size={14} />
              <span>Go to Public Parcel Tracker (No Login Required)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
