import React, { useState } from 'react';
import { useAegis } from '../context/AegisContext';
import { ThreatBadge } from '../components/common/ThreatBadge';
import {
  Bell,
  Check,
  CheckCheck,
  Filter,
  AlertTriangle,
  Radio,
  ShieldAlert,
  Zap,
  Volume2
} from 'lucide-react';

export const AlertManagementPage = () => {
  const { alerts, acknowledgeAlert, acknowledgeAllAlerts, generateCriticalThreat } = useAegis();

  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [ackFilter, setAckFilter] = useState('ALL');

  const filteredAlerts = alerts.filter(a => {
    const matchSeverity = severityFilter === 'ALL' || a.severity === severityFilter;
    const matchAck = ackFilter === 'ALL' ||
      (ackFilter === 'UNACK' && !a.acknowledged) ||
      (ackFilter === 'ACK' && a.acknowledged);
    return matchSeverity && matchAck;
  });

  const unackCount = alerts.filter(a => !a.acknowledged).length;
  const criticalUnack = alerts.filter(a => a.severity === 'CRITICAL' && !a.acknowledged).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#0c1424] border border-cyan-900/50 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-red-400" />
            <h2 className="text-base font-bold font-mono text-cyan-200 tracking-wider uppercase">
              Emergency Air Defense Alert Center
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time critical incursion warnings, geo-fence penetrations, and sensor communication anomalies.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={acknowledgeAllAlerts}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 transition-all cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Acknowledge All</span>
          </button>

          <button
            onClick={() => generateCriticalThreat()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950 hover:bg-red-900 text-red-300 border border-red-600/70 shadow-[0_0_12px_rgba(239,68,68,0.25)] transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-red-400" />
            <span>+ Simulate Incursion</span>
          </button>
        </div>
      </div>

      {/* Prominent Critical Alert Banner if Unacknowledged Critical Alerts Exist */}
      {criticalUnack > 0 && (
        <div className="p-4 rounded-xl bg-red-950/90 border-2 border-red-600 text-red-200 shadow-[0_0_30px_rgba(239,68,68,0.4)] animate-pulse font-mono">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-900 border border-red-500">
                <AlertTriangle className="w-6 h-6 text-red-300" />
              </div>
              <div>
                <h3 className="font-black text-sm tracking-widest uppercase">
                  DEFENSE CONDITION RED – {criticalUnack} IMMEDIATE INCURSION(S) ACTIVE
                </h3>
                <p className="text-xs text-red-300/90 mt-0.5">
                  Hostile target(s) breached exclusion geo-fence. Immediate operator acknowledgement and team dispatch required!
                </p>
              </div>
            </div>

            <button
              onClick={acknowledgeAllAlerts}
              className="px-4 py-2 rounded-lg bg-red-800 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider border border-red-400 shadow-lg cursor-pointer"
            >
              Acknowledge All Critical
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#0c1424] border border-cyan-900/50 text-xs font-mono">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 mr-1">Severity:</span>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(sev => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-2.5 py-1 rounded transition-all ${
                severityFilter === sev
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 mr-1">Status:</span>
          {['ALL', 'UNACK', 'ACK'].map(st => (
            <button
              key={st}
              onClick={() => setAckFilter(st)}
              className={`px-2.5 py-1 rounded transition-all ${
                ackFilter === st
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st === 'UNACK' ? `Unacknowledged (${unackCount})` : st === 'ACK' ? 'Acknowledged' : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Stream List */}
      <div className="space-y-3 font-mono text-xs">
        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center text-slate-500 rounded-xl bg-[#0c1424] border border-slate-800">
            No alerts match current filter.
          </div>
        ) : (
          filteredAlerts.map(alert => {
            const isCritical = alert.severity === 'CRITICAL';
            const isUnack = !alert.acknowledged;

            return (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border transition-all ${
                  isCritical && isUnack
                    ? 'bg-red-950/70 border-red-500/80 shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-pulse'
                    : isUnack
                    ? 'bg-[#0c1424] border-amber-500/40'
                    : 'bg-[#09101d]/60 border-slate-800/80 text-slate-400'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <ThreatBadge level={alert.severity} size="sm" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200 text-sm">{alert.id}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-cyan-400 font-semibold">{alert.category}</span>
                      </div>
                      <p className={`mt-1.5 text-xs font-sans leading-relaxed ${isUnack ? 'text-slate-200' : 'text-slate-400'}`}>
                        {alert.message}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-[11px] text-slate-400">{alert.timestamp.substring(11, 19)}</div>
                    <div className="text-[10px] text-slate-500">{alert.timestamp.substring(0, 10)}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/60 text-[11px]">
                  <div className="flex items-center gap-4 text-slate-400">
                    <span>Target: <strong className="text-cyan-300">{alert.droneId || 'Airspace System'}</strong></span>
                    <span>Sensor: <strong className="text-slate-300">{alert.sensorId}</strong></span>
                  </div>

                  {isUnack ? (
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs uppercase shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Acknowledge Alert</span>
                    </button>
                  ) : (
                    <span className="text-slate-500 italic text-[11px] flex items-center gap-1">
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Acknowledged by {alert.acknowledgedBy || 'Operator'}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
