// src/components/StatusBadge.jsx
import { getStatusColor } from '../utils/helpers';

export default function StatusBadge({ status }) {
  const cls = getStatusColor(status);
  return (
    <span className={`badge ${cls}`}>
      <span className="badge-dot" />
      {status}
    </span>
  );
}
