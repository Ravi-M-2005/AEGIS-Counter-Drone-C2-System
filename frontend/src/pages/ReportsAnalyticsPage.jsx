import React from 'react';
import { useAegis } from '../context/AegisContext';
import { ThreatBadge } from '../components/common/ThreatBadge';
import {
  BarChart3,
  Printer,
  Download,
  Calendar,
  ShieldCheck,
  TrendingUp,
  Clock,
  Radio,
  FileText
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const ReportsAnalyticsPage = () => {
  const { drones, incidents, sensors, zones } = useAegis();

  // Daily detection history (last 7 days)
  const dailyData = [
    { day: '22 Oct', detections: 14, highCrit: 3 },
    { day: '23 Oct', detections: 19, highCrit: 5 },
    { day: '24 Oct', detections: 11, highCrit: 2 },
    { day: '25 Oct', detections: 24, highCrit: 7 },
    { day: '26 Oct', detections: 18, highCrit: 4 },
    { day: '27 Oct', detections: 22, highCrit: 6 },
    { day: '28 Oct (Today)', detections: drones.length, highCrit: drones.filter(d => d.threatLevel === 'HIGH' || d.threatLevel === 'CRITICAL').length }
  ];

  // Threat distribution
  const threatData = [
    { name: 'Critical', value: drones.filter(d => d.threatLevel === 'CRITICAL').length, color: '#ef4444' },
    { name: 'High', value: drones.filter(d => d.threatLevel === 'HIGH').length, color: '#f97316' },
    { name: 'Medium', value: drones.filter(d => d.threatLevel === 'MEDIUM').length, color: '#eab308' },
    { name: 'Low', value: drones.filter(d => d.threatLevel === 'LOW').length, color: '#10b981' }
  ];

  // Sensor performance data
  const sensorStats = sensors.map(s => ({
    name: s.id,
    type: s.type,
    uptime: s.uptime || '99.9%',
    latency: s.latencyMs ? `${s.latencyMs} ms` : '15 ms',
    status: s.status
  }));

  const handlePrint = () => {
    window.print();
  };

  const handleExportReportCSV = () => {
    const headers = ['Report Category', 'Metric', 'Value'];
    const rows = [
      ['Airspace Overview', 'Total Drones Detected', drones.length],
      ['Airspace Overview', 'Active Incursions', drones.filter(d => d.status === 'TRACKING').length],
      ['Airspace Overview', 'Critical Incursions', drones.filter(d => d.threatLevel === 'CRITICAL').length],
      ['Response Performance', 'Mean Time To Detect (MTTD)', '1.4 seconds'],
      ['Response Performance', 'Mean Time To Acknowledge (MTTA)', '14.2 seconds'],
      ['Incidents', 'Total Incidents Recorded', incidents.length],
      ['Incidents', 'Incidents Resolved', incidents.filter(i => i.status === 'RESOLVED').length],
      ['Sensors', 'Operational Sensor Grid Uptime', '99.88%']
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aegis_intelligence_report_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header (hidden in print) */}
      <div className="no-print flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#0c1424] border border-cyan-900/50 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold font-mono text-cyan-200 tracking-wider uppercase">
              Intelligence Analytics & Airspace Audit Reports
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Executive counter-UAS audit briefing, operational response velocity, and multi-spectral sensor reliability.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report (PDF)</span>
          </button>

          <button
            onClick={handleExportReportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-800/60 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Analytics CSV</span>
          </button>
        </div>
      </div>

      {/* Print Friendly Executive Header (visible in print mode) */}
      <div className="p-4 rounded-xl bg-[#0c1424] border border-cyan-900/50 font-mono text-xs space-y-2">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
          <div>
            <h1 className="text-base font-black text-cyan-300">AEGIS COUNTER-UAS INTELLIGENCE DOSSIER</h1>
            <p className="text-[11px] text-slate-400">Security Clearance: RESTRICTED // COLLEGE PROJECT DEMONSTRATION</p>
          </div>
          <div className="text-right text-[11px] text-slate-400">
            <div>Report Date: {new Date().toLocaleDateString('en-IN')}</div>
            <div className="text-amber-400 font-bold">CLASSIFICATION: DEMO SIMULATION</div>
          </div>
        </div>

        {/* 4 Executive Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-slate-500 text-[10px] block">TOTAL INCURSIONS</span>
            <span className="text-xl font-black text-cyan-300 font-mono">{drones.length}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Across all sectors</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-slate-500 text-[10px] block">HIGH/CRITICAL RATE</span>
            <span className="text-xl font-black text-red-400 font-mono">
              {drones.filter(d => d.threatLevel === 'HIGH' || d.threatLevel === 'CRITICAL').length}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Requiring QRT dispatch</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-slate-500 text-[10px] block">MEAN TIME TO DETECT (MTTD)</span>
            <span className="text-xl font-black text-emerald-400 font-mono">1.4 sec</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">3D Radar sweep latency</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-slate-500 text-[10px] block">SENSOR GRID UPTIME</span>
            <span className="text-xl font-black text-cyan-400 font-mono">99.94%</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Continuous 24/7 scanning</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Daily Drone Detection Bar Chart */}
        <div className="rounded-xl bg-[#0c1424] border border-cyan-900/50 p-4 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h4 className="text-xs font-mono font-bold tracking-wider text-cyan-300 uppercase">
              Daily Drone Detection Volume (Last 7 Days)
            </h4>
            <span className="text-[10px] font-mono text-slate-400">Total vs High-Risk</span>
          </div>

          <div className="w-full h-56 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#475569" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis stroke="#475569" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#0b1424] border border-cyan-500/40 p-2 rounded shadow-xl font-mono text-xs">
                          <p className="font-bold text-cyan-300">{label}</p>
                          <p className="text-slate-200">Total: {payload[0]?.value}</p>
                          <p className="text-red-400">High/Crit: {payload[1]?.value}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="detections" fill="#00f0ff" radius={[4, 4, 0, 0]} />
                <Bar dataKey="highCrit" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Threat Level Breakdown Donut */}
        <div className="rounded-xl bg-[#0c1424] border border-cyan-900/50 p-4 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h4 className="text-xs font-mono font-bold tracking-wider text-cyan-300 uppercase">
              Threat Category Composition
            </h4>
            <span className="text-[10px] font-mono text-slate-400">Rule-Based AI Triage</span>
          </div>

          <div className="w-full h-52 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={threatData}
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {threatData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-center font-mono text-xs">
            {threatData.map(t => (
              <div key={t.name} className="p-1.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">{t.name}</span>
                <span className="font-bold text-sm" style={{ color: t.color }}>{t.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sensor Station Performance Overview */}
      <div className="rounded-xl bg-[#0c1424] border border-cyan-900/50 p-4 shadow-xl font-mono text-xs">
        <h4 className="font-bold text-cyan-300 uppercase mb-3 flex items-center gap-2">
          <Radio className="w-4 h-4 text-cyan-400" />
          <span>Integrated Sensor Suite Health & Reliability Metrics</span>
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400">
                <th className="py-2 px-3">Sensor ID</th>
                <th className="py-2 px-3">Technology Type</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Operating Latency</th>
                <th className="py-2 px-3">Uptime Availability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sensorStats.map(s => (
                <tr key={s.name} className="hover:bg-slate-900/40">
                  <td className="py-2.5 px-3 font-bold text-cyan-300">{s.name}</td>
                  <td className="py-2.5 px-3 text-slate-300">{s.type}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      s.status === 'ONLINE' ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">{s.latency}</td>
                  <td className="py-2.5 px-3 font-bold text-emerald-400">{s.uptime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
