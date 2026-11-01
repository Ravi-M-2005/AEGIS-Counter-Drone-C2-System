import React from 'react';
import { AlertTriangle, Bell, Check, ShieldAlert } from 'lucide-react';
import { ThreatBadge } from '../common/ThreatBadge';

export const LiveAlertStream = ({ alerts, onAcknowledge, onViewAll }) => {
  const recentAlerts = alerts.slice(0, 6);

  return (
    <div className="rounded-xl bg-[#0c1424] border border-cyan-900/50 p-4 shadow-xl flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
          <div>
            <h4 className="text-xs font-mono font-bold tracking-wider text-red-300 uppercase">
              Live Alert Ticker
            </h4>
            <p className="text-[10px] text-slate-400">Tactical Event & Incursion Log</p>
          </div>
        </div>
        <button
          onClick={onViewAll}
          className="text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/50"
        >
          View All ({alerts.length})
        </button>
      </div>

      <div className="space-y-2 mt-3 overflow-y-auto max-h-80">
        {recentAlerts.map(alert => {
          const isCritical = alert.severity === 'CRITICAL';
          return (
            <div
              key={alert.id}
              className={`p-2.5 rounded-lg border text-xs font-mono transition-all ${
                isCritical && !alert.acknowledged
                  ? 'bg-red-950/60 border-red-500/70 text-red-200 shadow-[0_0_12px_rgba(239,68,68,0.25)] animate-pulse'
                  : alert.acknowledged
                  ? 'bg-slate-900/40 border-slate-800/80 text-slate-400'
                  : 'bg-slate-900/80 border-slate-700 text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <ThreatBadge level={alert.severity} size="sm" />
                  <span className="text-slate-300 text-[11px] truncate">{alert.category}</span>
                </div>
                <span className="text-[10px] text-slate-500 whitespace-nowrap">
                  {alert.timestamp.substring(11, 19)}
                </span>
              </div>

              <p className="text-[11px] text-slate-300 line-clamp-2 my-1">
                {alert.message}
              </p>

              <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px]">
                <div className="text-slate-500">
                  Target: <span className="text-cyan-400">{alert.droneId || 'Sensor System'}</span>
                </div>
                {!alert.acknowledged ? (
                  <button
                    onClick={() => onAcknowledge(alert.id)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 text-[10px] font-bold transition-all"
                  >
                    <Check className="w-3 h-3" />
                    <span>Acknowledge</span>
                  </button>
                ) : (
                  <span className="text-slate-500 italic">
                    ✓ Ack by {alert.acknowledgedBy || 'Operator'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
