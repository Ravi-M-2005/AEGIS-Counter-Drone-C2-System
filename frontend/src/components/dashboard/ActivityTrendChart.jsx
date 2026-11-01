import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const ActivityTrendChart = () => {
  // Realistic 24-hr hourly drone activity timeline
  const data = [
    { hour: '00:00', detections: 1, critical: 0 },
    { hour: '02:00', detections: 2, critical: 0 },
    { hour: '04:00', detections: 1, critical: 0 },
    { hour: '06:00', detections: 4, critical: 1 },
    { hour: '08:00', detections: 7, critical: 2 },
    { hour: '10:00', detections: 9, critical: 3 },
    { hour: '12:00', detections: 6, critical: 1 },
    { hour: '14:00', detections: 8, critical: 2 },
    { hour: '16:00', detections: 11, critical: 4 },
    { hour: '18:00', detections: 14, critical: 5 },
    { hour: '20:00', detections: 10, critical: 2 },
    { hour: '22:00', detections: 5, critical: 1 }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0b1424] border border-cyan-500/40 p-2.5 rounded-lg shadow-xl font-mono text-xs">
          <p className="font-bold text-cyan-300">Timeline: {label}</p>
          <p className="text-slate-200">Total Detections: {payload[0]?.value}</p>
          <p className="text-red-400">Critical Threats: {payload[1]?.value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-xl bg-[#0c1424] border border-cyan-900/50 p-4 shadow-xl">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h4 className="text-xs font-mono font-bold tracking-wider text-cyan-300 uppercase">
            24-Hour Airspace Incursion Velocity
          </h4>
          <p className="text-[10px] text-slate-400">Detection Volume vs Critical Alerts</p>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500" />
            <span className="text-slate-400">Detections</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-500" />
            <span className="text-slate-400">Critical</span>
          </div>
        </div>
      </div>

      <div className="w-full h-52 mt-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#00f0ff" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="hour" stroke="#475569" tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <YAxis stroke="#475569" tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="detections"
              stroke="#00f0ff"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#cyanGrad)"
            />
            <Area
              type="monotone"
              dataKey="critical"
              stroke="#ef4444"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#redGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
