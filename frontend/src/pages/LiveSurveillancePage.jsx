import React from 'react';
import { useAegis } from '../context/AegisContext';
import { SurveillanceMap } from '../components/map/SurveillanceMap';
import { ThreatBadge } from '../components/common/ThreatBadge';
import {
  Radar,
  Radio,
  Shield,
  Layers,
  MapPin,
  Play,
  Pause,
  Zap,
  Info,
  Compass,
  ArrowRight
} from 'lucide-react';

export const LiveSurveillancePage = ({ onNavigate }) => {
  const {
    drones,
    zones,
    sensors,
    activeSector,
    setActiveSector,
    isSimulating,
    toggleSimulation,
    generateCriticalThreat,
    generateDroneDetection,
    selectedDroneId,
    setSelectedDroneId
  } = useAegis();

  const sectorDrones = drones.filter(d => d.sector === activeSector);
  const activeSectorDrones = sectorDrones.filter(d => d.status === 'TRACKING');
  const criticalDrones = sectorDrones.filter(d => d.threatLevel === 'CRITICAL');

  return (
    <div className="space-y-4">
      {/* Top Header & Tactical Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-xl bg-[#0c1424] border border-cyan-900/50 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Radar className="w-5 h-5 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
            <h2 className="text-base font-bold font-mono text-cyan-200 tracking-wider uppercase">
              Tactical Drone Surveillance & Airspace Radar
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic vector positioning with RF telemetry triangulation and 3D radar envelope sweeps.
          </p>
        </div>

        {/* Sector Switching Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono">
          <button
            onClick={() => setActiveSector('bengaluru')}
            className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
              activeSector === 'bengaluru'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Bengaluru Airport (KIA)</span>
          </button>
          <button
            onClick={() => setActiveSector('border')}
            className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
              activeSector === 'border'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Northern Border</span>
          </button>
          <button
            onClick={() => setActiveSector('defence')}
            className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
              activeSector === 'defence'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Naval Defense Facility</span>
          </button>
        </div>
      </div>

      {/* Main Full-Size Leaflet Map */}
      <SurveillanceMap
        height="640px"
        onSelectDrone={(drone) => setSelectedDroneId(drone.id)}
      />

      {/* Real-time Sector Target Strip */}
      <div className="rounded-xl bg-[#0c1424] border border-cyan-900/50 p-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-xs font-mono font-bold tracking-wider text-cyan-300 uppercase">
              Active Sector Target Roster ({activeSectorDrones.length} Live Tracks)
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <button
              onClick={() => generateDroneDetection()}
              className="px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 transition-colors"
            >
              + Inject Target
            </button>
            <button
              onClick={() => generateCriticalThreat()}
              className="px-2.5 py-1 rounded bg-red-950 hover:bg-red-900 text-red-300 border border-red-700/60 transition-colors"
            >
              + Inject Critical Breach
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
          {sectorDrones.map(drone => {
            const isSelected = selectedDroneId === drone.id;
            return (
              <div
                key={drone.id}
                onClick={() => setSelectedDroneId(drone.id)}
                className={`p-3 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-950/70 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-200">{drone.id}</span>
                  <ThreatBadge level={drone.threatLevel} score={drone.threatScore} />
                </div>
                <div className="text-[11px] text-slate-400 truncate mb-1">
                  {drone.model}
                </div>
                <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                  <div>Alt: <span className="text-amber-300">{drone.altitude}m</span></div>
                  <div>Spd: <span className="text-slate-200">{drone.speed} km/h</span></div>
                  <div>Dist: <span className="text-cyan-400 font-bold">{drone.distanceKm} km</span></div>
                  <div>Hdg: <span className="text-slate-300">{drone.heading}°</span></div>
                </div>
                <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800/60 text-[10px]">
                  <span className="text-slate-500 truncate">{drone.sensorSource}</span>
                  <span className="text-cyan-400 flex items-center gap-0.5 hover:underline">
                    Track <ArrowRight className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
