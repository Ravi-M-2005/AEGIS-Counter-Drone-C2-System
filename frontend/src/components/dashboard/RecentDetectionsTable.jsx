import React from 'react';
import { ThreatBadge } from '../common/ThreatBadge';
import { ArrowUpRight, Crosshair, Shield } from 'lucide-react';

export const RecentDetectionsTable = ({ drones, onSelectDrone, onViewAll }) => {
  const recentDrones = drones.slice(0, 7);

  return (
    <div className="rounded-xl bg-[#0c1424] border border-cyan-900/50 p-4 shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h4 className="text-xs font-mono font-bold tracking-wider text-cyan-300 uppercase">
            Recent Drone Detections
          </h4>
          <p className="text-[10px] text-slate-400">Live Telemetry & Sensor Tracking Feed</p>
        </div>
        <button
          onClick={onViewAll}
          className="flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors bg-cyan-950/50 px-2.5 py-1 rounded border border-cyan-800/50"
        >
          <span>View All ({drones.length})</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="overflow-x-auto mt-2">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400">
              <th className="py-2 px-2">Drone ID / Model</th>
              <th className="py-2 px-2">Threat</th>
              <th className="py-2 px-2">Alt / Spd</th>
              <th className="py-2 px-2">Core Dist</th>
              <th className="py-2 px-2">Sensor</th>
              <th className="py-2 px-2">Status</th>
              <th className="py-2 px-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {recentDrones.map(drone => (
              <tr
                key={drone.id}
                className="hover:bg-slate-900/60 transition-colors group cursor-pointer"
                onClick={() => onSelectDrone(drone)}
              >
                <td className="py-2.5 px-2">
                  <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>{drone.id}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{drone.model}</div>
                </td>
                <td className="py-2.5 px-2">
                  <ThreatBadge level={drone.threatLevel} score={drone.threatScore} />
                </td>
                <td className="py-2.5 px-2 text-slate-300">
                  <div>{drone.altitude}m</div>
                  <div className="text-[10px] text-slate-500">{drone.speed} km/h</div>
                </td>
                <td className="py-2.5 px-2 text-slate-200 font-bold">
                  {drone.distanceKm} km
                </td>
                <td className="py-2.5 px-2 text-slate-400 text-[10px] truncate max-w-[120px]">
                  {drone.sensorSource}
                </td>
                <td className="py-2.5 px-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    drone.status === 'TRACKING'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {drone.status}
                  </span>
                </td>
                <td className="py-2.5 px-2 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectDrone(drone);
                    }}
                    className="p-1 rounded bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/60 transition-colors"
                    title="Track & Inspect Drone"
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
