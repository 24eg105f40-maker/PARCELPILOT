// src/components/Toast.jsx
import { useEffect } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const ICONS = {
  success: CheckCircle,
  error:   XCircle,
  info:    Info,
  warning: AlertTriangle,
};

function Toast({ toast, onDismiss }) {
  const Icon = ICONS[toast.type] || Info;

  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), toast.duration || 3500);
    return () => clearTimeout(t);
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <div className={`toast ${toast.type}`} role="alert">
      <Icon size={16} style={{ flexShrink: 0 }} />
      <span style={{ flex: 1 }}>{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, display: 'flex', opacity: 0.7 }}
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export default function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className="toast-container">
      {toasts.map(t => <Toast key={t.id} toast={t} onDismiss={onDismiss} />)}
    </div>
  );
}
