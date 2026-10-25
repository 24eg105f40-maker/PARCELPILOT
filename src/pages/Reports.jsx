// src/pages/Reports.jsx
import { Download, BarChart2, AlertTriangle, CheckCircle, TrendingUp, Info } from 'lucide-react';
import { STATUSES } from '../data/shipments';
import { exportToCSV } from '../utils/helpers';
import StatusBadge from '../components/StatusBadge';

const STATUS_COLORS = {
  [STATUSES.PENDING_PICKUP]:   '#d97706',
  [STATUSES.PICKED_UP]:        '#4f46e5',
  [STATUSES.IN_TRANSIT]:       '#2563eb',
  [STATUSES.OUT_FOR_DELIVERY]: '#7c3aed',
  [STATUSES.DELIVERED]:        '#059669',
  [STATUSES.EXCEPTION]:        '#dc2626',
};

export default function Reports({ shipments }) {
  const total     = shipments.length;
  const delivered = shipments.filter(s => s.status === STATUSES.DELIVERED).length;
  const exception = shipments.filter(s => s.status === STATUSES.EXCEPTION).length;
  const deliveryRate = total > 0 ? Math.round(delivered / total * 100) : 0;

  const statusCounts = Object.values(STATUSES).map(st => ({
    status: st,
    count: shipments.filter(s => s.status === st).length,
    color: STATUS_COLORS[st],
  }));

  const serviceBreakdown = ['Express', 'Standard', 'Economy'].map(svc => ({
    label: svc,
    count: shipments.filter(s => s.service === svc).length,
  }));

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Calculated from current demo dataset · Metrics are illustrative only</p>
        </div>
        <button className="btn btn-secondary" onClick={() => exportToCSV(shipments)} id="btn-export-reports">
          <Download size={15}/>Export CSV
        </button>
      </div>

      <div className="notice info" style={{marginBottom:'var(--space-6)'}}>
        <Info size={15} style={{flexShrink:0}}/>
        <span>All metrics are derived from the demo sample data. They do not represent verified real-world delivery performance or any carrier's actual data.</span>
      </div>

      {/* Summary KPIs */}
      <div className="report-grid" style={{marginBottom:'var(--space-6)'}}>
        <div className="card">
          <div className="card-body" style={{textAlign:'center',padding:'var(--space-6)'}}>
            <div style={{width:'52px',height:'52px',background:'var(--clr-success-bg)',borderRadius:'var(--radius-lg)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto var(--space-3)'}}>
              <CheckCircle size={24} color="var(--clr-success)"/>
            </div>
            <div style={{fontSize:'36px',fontWeight:800,color:'var(--clr-navy)',letterSpacing:'-1px'}}>{deliveryRate}%</div>
            <div style={{fontSize:'13px',color:'var(--clr-muted)',marginTop:'4px'}}>Delivery Rate (demo)</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body" style={{textAlign:'center',padding:'var(--space-6)'}}>
            <div style={{width:'52px',height:'52px',background:'var(--clr-indigo-light)',borderRadius:'var(--radius-lg)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto var(--space-3)'}}>
              <BarChart2 size={24} color="var(--clr-indigo)"/>
            </div>
            <div style={{fontSize:'36px',fontWeight:800,color:'var(--clr-navy)',letterSpacing:'-1px'}}>{total}</div>
            <div style={{fontSize:'13px',color:'var(--clr-muted)',marginTop:'4px'}}>Total Shipments</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body" style={{textAlign:'center',padding:'var(--space-6)'}}>
            <div style={{width:'52px',height:'52px',background:'var(--clr-danger-bg)',borderRadius:'var(--radius-lg)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto var(--space-3)'}}>
              <AlertTriangle size={24} color="var(--clr-danger)"/>
            </div>
            <div style={{fontSize:'36px',fontWeight:800,color:'var(--clr-navy)',letterSpacing:'-1px'}}>{exception}</div>
            <div style={{fontSize:'13px',color:'var(--clr-muted)',marginTop:'4px'}}>Requiring Attention</div>
          </div>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'var(--space-5)'}}>
        {/* Status Distribution */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Shipments by Status</span>
            <TrendingUp size={16} color="var(--clr-muted)"/>
          </div>
          <div className="card-body">
            <div className="stat-bar-wrap">
              {statusCounts.map(({ status, count, color }) => (
                <div key={status} className="stat-bar-item">
                  <div className="stat-bar-label-row">
                    <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                      <span style={{width:'8px',height:'8px',borderRadius:'50%',background:color,display:'inline-block',flexShrink:0}}/>
                      <span className="stat-bar-label">{status}</span>
                    </div>
                    <span className="stat-bar-count">{count}</span>
                  </div>
                  <div className="stat-bar-track">
                    <div
                      className="stat-bar-fill"
                      style={{
                        width: total > 0 ? `${count / total * 100}%` : '0%',
                        background: color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Service Breakdown */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Service Type Breakdown</span>
          </div>
          <div className="card-body">
            <div className="stat-bar-wrap">
              {serviceBreakdown.map(({ label, count }) => (
                <div key={label} className="stat-bar-item">
                  <div className="stat-bar-label-row">
                    <span className="stat-bar-label">{label}</span>
                    <span className="stat-bar-count">{count}</span>
                  </div>
                  <div className="stat-bar-track">
                    <div
                      className="stat-bar-fill"
                      style={{
                        width: total > 0 ? `${count / total * 100}%` : '0%',
                        background: label === 'Express' ? '#6366f1' : label === 'Standard' ? '#2563eb' : '#059669',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <hr className="divider" style={{margin:'var(--space-5) 0'}}/>

            {/* Table summary */}
            <table style={{width:'100%',fontSize:'13px'}}>
              <thead>
                <tr>
                  <th style={{textAlign:'left',paddingBottom:'8px',color:'var(--clr-muted)',fontWeight:600,fontSize:'11.5px',textTransform:'uppercase',letterSpacing:'0.5px'}}>Status</th>
                  <th style={{textAlign:'right',paddingBottom:'8px',color:'var(--clr-muted)',fontWeight:600,fontSize:'11.5px',textTransform:'uppercase',letterSpacing:'0.5px'}}>Count</th>
                  <th style={{textAlign:'right',paddingBottom:'8px',color:'var(--clr-muted)',fontWeight:600,fontSize:'11.5px',textTransform:'uppercase',letterSpacing:'0.5px'}}>%</th>
                </tr>
              </thead>
              <tbody>
                {statusCounts.filter(x => x.count > 0).map(({ status, count }) => (
                  <tr key={status}>
                    <td style={{padding:'6px 0'}}><StatusBadge status={status}/></td>
                    <td style={{textAlign:'right',fontWeight:700,color:'var(--clr-navy)'}}>{count}</td>
                    <td style={{textAlign:'right',color:'var(--clr-muted)'}}>{total > 0 ? Math.round(count/total*100) : 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
