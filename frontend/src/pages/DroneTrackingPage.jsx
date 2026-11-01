import React, { useState, useEffect } from 'react';
import { useAegis } from '../context/AegisContext';
import { ThreatBadge } from '../components/common/ThreatBadge';
import {
  Route,
  Activity,
  Compass,
  ArrowRight,
  Clock,
  Radio,
  Shield,
  Crosshair,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const DroneTrackingPage = () => {
  const { drones, selectedDroneId, setSelectedDroneId } = useAegis();

  // Selected drone or first drone
  const activeDrone = drones.find(d => d.id === selectedDroneId) || drones[0] || null;

  // Build telemetry history data for chart
  const historyData = (activeDrone?.history || []).map((h, i) => ({
    time: h.time,
    altitude: h.alt,
    speed: h.spd,
    index: i + 1
  }));

  // If drone has few history points, synthesize realistic preceding points
  const displayHistory = historyData.length > 2 ? historyData : [
    { time: '09:40:00', altitude: (activeDrone?.altitude || 100) + 15, speed: (activeDrone?.speed || 40) - 5 },
    { time: '09:42:00', altitude: (activeDrone?.altitude || 100) + 8, speed: (activeDrone?.speed || 40) - 2 },
    { time: '09:44:00', altitude: activeDrone?.altitude || 100, speed: activeDrone?.speed || 40 }
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#0c1424] border border-cyan-900/50 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Route className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold font-mono text-cyan-200 tracking-wider uppercase">
              Drone Telemetry Tracking & Flight Path History
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-dimensional kinematic profiling, waypoint reconstruction, and altitude/velocity charts.
          </p>
        </div>

        {/* Target Selector Dropdown */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400">Target Track:</span>
          <select
            value={activeDrone?.id || ''}
            onChange={(e) => setSelectedDroneId(e.target.value)}
            className="bg-[#060b14] border border-cyan-500/50 rounded-lg px-3 py-1.5 text-cyan-300 font-bold focus:outline-none"
          >
            {drones.map(d => (
              <option key={d.id} value={d.id}>
                {d.id} – {d.model} ({d.threatLevel})
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeDrone && (
        <>
          {/* Active Target Banner */}
          <div className="rounded-xl bg-[#0c1424] border border-cyan-900/50 p-4 shadow-xl font-mono text-xs">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-cyan-300">{activeDrone.id}</span>
                    <span className="text-slate-400">| {activeDrone.model}</span>
                    <ThreatBadge level={activeDrone.threatLevel} score={activeDrone.threatScore} />
                  </div>
                  <span className="text-[10px] text-slate-500">
                    Sensor Lock: {activeDrone.sensorSource} • Detected: {activeDrone.detectedAt}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-center">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[9px] text-slate-500 block">CURRENT ALT</span>
                  <span className="text-sm font-bold text-amber-300">{activeDrone.altitude} m</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[9px] text-slate-500 block">AIRSPEED</span>
                  <span className="text-sm font-bold text-slate-200">{activeDrone.speed} km/h</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[9px] text-slate-500 block">HEADING</span>
                  <span className="text-sm font-bold text-cyan-400">{activeDrone.heading}°</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[9px] text-slate-500 block">CORE DIST</span>
                  <span className="text-sm font-bold text-red-400">{activeDrone.distanceKm} km</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3 text-[11px] text-slate-300">
              <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">COORDINATES</span>
                <span className="text-cyan-300">{activeDrone.lat.toFixed(5)}°N, {activeDrone.lng.toFixed(5)}°E</span>
              </div>
              <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">RF PROTOCOL</span>
                <span>{activeDrone.rfBand}</span>
              </div>
              <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">PAYLOAD STATUS</span>
                <span className={activeDrone.payloadDetected ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                  {activeDrone.payloadDetected ? activeDrone.payloadType : 'Clean (No Payload)'}
                </span>
              </div>
              <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">MOVEMENT PROFILE</span>
                <span className="truncate block">{activeDrone.movementPattern}</span>
              </div>
            </div>
          </div>

          {/* Telemetry Multi-Axis Altitude & Velocity Chart */}
          <div className="rounded-xl bg-[#0c1424] border border-cyan-900/50 p-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h4 className="text-xs font-mono font-bold tracking-wider text-cyan-300 uppercase">
                  Kinematic Profiles Over Time (Altitude vs Airspeed)
                </h4>
                <p className="text-[10px] text-slate-400">Chronological telemetry samples recorded by tracking sensor array</p>
              </div>
              <div className="flex items-center gap-3 font-mono text-[11px]">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
                  <span className="text-slate-400">Altitude (m)</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400" />
                  <span className="text-slate-400">Speed (km/h)</span>
                </div>
              </div>
            </div>

            <div className="w-full h-64 mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={displayHistory} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <XAxis dataKey="time" stroke="#475569" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis stroke="#475569" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-[#0b1424] border border-cyan-500/40 p-2.5 rounded-lg shadow-xl font-mono text-xs">
                            <p className="font-bold text-cyan-300">Ping: {label}</p>
                            <p className="text-amber-300">Altitude: {payload[0]?.value} meters</p>
                            <p className="text-cyan-400">Speed: {payload[1]?.value} km/h</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="altitude"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#f59e0b' }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="speed"
                    stroke="#00f0ff"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#00f0ff' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Breadcrumb Detection Timeline Log */}
          <div className="rounded-xl bg-[#0c1424] border border-cyan-900/50 p-4 shadow-xl font-mono text-xs">
            <h4 className="font-bold text-cyan-300 uppercase mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Chronological Flight Waypoint Sequence</span>
            </h4>

            <div className="relative pl-6 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-cyan-900/60">
              {(activeDrone.history || [
                { lat: activeDrone.lat, lng: activeDrone.lng, time: activeDrone.detectedAt.substring(11, 19), alt: activeDrone.altitude, spd: activeDrone.speed }
              ]).map((pt, i) => (
                <div key={i} className="relative flex items-center justify-between p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
                  <span className="absolute -left-6 top-3.5 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
                  <div>
                    <span className="font-bold text-slate-200">Waypoint #{i + 1}</span>
                    <span className="text-slate-500 ml-2">[{pt.time}]</span>
                    <div className="text-[10px] text-cyan-400/90 mt-0.5">
                      Position: {pt.lat.toFixed(5)}°N, {pt.lng.toFixed(5)}°E
                    </div>
                  </div>
                  <div className="text-right text-[11px]">
                    <span className="text-amber-300 font-bold">{pt.alt}m AGL</span>
                    <span className="text-slate-500 mx-1.5">•</span>
                    <span className="text-slate-300">{pt.spd} km/h</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
