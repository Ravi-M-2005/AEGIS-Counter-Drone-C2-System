import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export const ThreatDistributionChart = ({ drones }) => {
  const counts = {
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0
  };

  drones.forEach(d => {
    if (counts[d.threatLevel] !== undefined) {
      counts[d.threatLevel]++;
    }
  });

  const data = [
    { name: 'Critical', value: counts.CRITICAL, color: '#ef4444' },
    { name: 'High', value: counts.HIGH, color: '#f97316' },
    { name: 'Medium', value: counts.MEDIUM, color: '#eab308' },
    { name: 'Low', value: counts.LOW, color: '#10b981' }
  ];

  const total = drones.length;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
      return (
        <div className="bg-[#0b1424] border border-cyan-500/40 p-2.5 rounded-lg shadow-xl font-mono text-xs">
          <p className="font-bold text-slate-200" style={{ color: item.payload.color }}>
            {item.name} Threats
          </p>
          <p className="text-slate-300">Count: {item.value}</p>
          <p className="text-slate-400">Share: {pct}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-xl bg-[#0c1424] border border-cyan-900/50 p-4 shadow-xl flex flex-col justify-between">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h4 className="text-xs font-mono font-bold tracking-wider text-cyan-300 uppercase">
            Threat Classification
          </h4>
          <p className="text-[10px] text-slate-400">Current Distribution Profile</p>
        </div>
        <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
          {total} Total Drones
        </span>
      </div>

      <div className="w-full h-52 relative mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={52}
              outerRadius={75}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#070e1c" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label inside donut */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black font-mono text-cyan-400">
            {counts.CRITICAL + counts.HIGH}
          </span>
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">
            High/Crit
          </span>
        </div>
      </div>

      {/* Custom Legend */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 font-mono text-xs">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between p-1.5 rounded bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-slate-300 text-[11px]">{item.name}</span>
            </div>
            <span className="font-bold text-[11px]" style={{ color: item.color }}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
