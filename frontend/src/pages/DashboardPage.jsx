import React from 'react';
import { useAegis } from '../context/AegisContext';
import { StatCard } from '../components/common/StatCard';
import { SurveillanceMap } from '../components/map/SurveillanceMap';
import { ThreatDistributionChart } from '../components/dashboard/ThreatDistributionChart';
import { ActivityTrendChart } from '../components/dashboard/ActivityTrendChart';
import { RecentDetectionsTable } from '../components/dashboard/RecentDetectionsTable';
import { LiveAlertStream } from '../components/dashboard/LiveAlertStream';
import {
  Radar,
  Radio,
  ShieldAlert,
  AlertTriangle,
  Users,
  Crosshair,
  Bell,
  Cpu,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Activity
} from 'lucide-react';

export const DashboardPage = ({ onNavigate }) => {
  const {
    drones,
    zones,
    sensors,
    teams,
    incidents,
    alerts,
    isSimulating,
    toggleSimulation,
    generateDroneDetection,
    generateCriticalThreat,
    resetDemoData,
    acknowledgeAlert,
    setSelectedDroneId,
    activeSector,
    backendStats,
    backendStatus
  } = useAegis();

  // Calculate statistics (prefer live database statistics when available)
  const totalDrones = backendStats?.totalDrones ?? drones.length;
  const activeDrones = backendStats?.activeDrones ?? drones.filter(d => d.status === 'TRACKING').length;
  const highRiskThreats = backendStats?.highRiskThreats ?? drones.filter(d => d.threatLevel === 'HIGH' || d.threatLevel === 'CRITICAL').length;
  const criticalAlerts = backendStats?.criticalAlerts ?? alerts.filter(a => a.severity === 'CRITICAL' && !a.acknowledged).length;
  const activeZones = zones.filter(z => z.status === 'ACTIVE' || z.status === 'HEIGHTENED_ALERT').length;
  const operationalSensors = sensors.filter(s => s.status === 'ONLINE').length;
  const openIncidents = incidents.filter(i => i.status === 'OPEN' || i.status === 'ASSIGNED').length;
  const deployedTeams = teams.filter(t => t.status === 'DEPLOYED' || t.status === 'EN_ROUTE').length;

  return (
    <div className="space-y-6">
      {/* Simulation Command Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-[#0c1424] via-[#091122] to-[#070e1c] border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <h2 className="text-base font-bold font-mono tracking-wider text-cyan-200 uppercase">
              Operational Command Center
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/40">
              Sector: {activeSector.toUpperCase()}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-500/40">
              SYNTHETIC TELEMETRY: ACTIVE
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-400 border border-slate-700">
              HARDWARE RADAR/RF: DISCONNECTED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time counter-UAS sensor fusion, AI trajectory tracking, and automated response coordination.
            <span className="text-amber-400/80 ml-2">
              (Synthetic telemetry emulation mode &bull; No physical radar/RF hardware connected &bull; PostgreSQL live persisted)
            </span>
          </p>
        </div>

        {/* Quick Simulator Control Buttons */}
        <div className="flex items-center flex-wrap gap-2 text-xs font-mono">
          <button
            onClick={toggleSimulation}
            className={`px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isSimulating
                ? 'bg-emerald-950/70 border-emerald-500/70 text-emerald-300 hover:bg-emerald-900/80 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                : 'bg-amber-950/70 border-amber-500/70 text-amber-300 hover:bg-amber-900/80'
            }`}
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isSimulating ? 'SYNTHETIC SWEEP ACTIVE' : 'SWEEP PAUSED'}</span>
          </button>

          <button
            onClick={() => generateDroneDetection()}
            className="px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-600/50 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Inject simulated detection and persist to PostgreSQL backend"
          >
            <Radar className="w-3.5 h-3.5 text-cyan-400" />
            <span>+ Simulated Detection</span>
          </button>

          <button
            onClick={() => generateCriticalThreat()}
            className="px-3 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-600/60 flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(239,68,68,0.2)] cursor-pointer"
            title="Inject critical threat incursion and persist to backend"
          >
            <Zap className="w-3.5 h-3.5 text-red-400" />
            <span>+ Critical Threat</span>
          </button>

          <button
            onClick={resetDemoData}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1 transition-all"
            title="Reset local simulation caches"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* 8 Primary KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Drones Tracked"
          value={totalDrones}
          subtext="Cumulative database telemetry"
          icon={Crosshair}
          variant="cyan"
          onClick={() => onNavigate('detections')}
        />

        <StatCard
          title="Active Tracked Drones"
          value={activeDrones}
          subtext="Synthetic sweep incursion pings"
          icon={Radar}
          variant="emerald"
          badge="Synthetic Sweep"
          onClick={() => onNavigate('surveillance')}
        />

        <StatCard
          title="High-Risk Threats"
          value={highRiskThreats}
          subtext="Critical & High AI severity"
          icon={ShieldAlert}
          variant="amber"
          onClick={() => onNavigate('threats')}
        />

        <StatCard
          title="Critical Alerts"
          value={criticalAlerts}
          subtext="Requiring operator ack"
          icon={Bell}
          variant={criticalAlerts > 0 ? 'red' : 'cyan'}
          badge={criticalAlerts > 0 ? 'URGENT' : 'Nominal'}
          onClick={() => onNavigate('alerts')}
        />

        <StatCard
          title="Surveillance Zones"
          value={`${activeZones} / ${zones.length}`}
          subtext="Runway & buffer perimeters"
          icon={ShieldAlert}
          variant="cyan"
          onClick={() => onNavigate('zones')}
        />

        <StatCard
          title="Operational Sensors"
          value={`${operationalSensors} / ${sensors.length}`}
          subtext="Radar, RF, Acoustic, Camera"
          icon={Radio}
          variant="emerald"
          onClick={() => onNavigate('sensors')}
        />

        <StatCard
          title="Open Incidents"
          value={openIncidents}
          subtext="Pending resolution action"
          icon={AlertTriangle}
          variant={openIncidents > 0 ? 'amber' : 'cyan'}
          onClick={() => onNavigate('incidents')}
        />

        <StatCard
          title="Response Teams Deployed"
          value={`${deployedTeams} / ${teams.length}`}
          subtext="QRT & intercept patrols active"
          icon={Users}
          variant="blue"
          onClick={() => onNavigate('teams')}
        />
      </div>

      {/* Live Tactical Map Preview */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Radar className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-bold tracking-wider text-cyan-200 uppercase">
              Live Airspace Surveillance Map
            </h3>
          </div>
          <button
            onClick={() => onNavigate('surveillance')}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors bg-cyan-950/60 px-2.5 py-1 rounded border border-cyan-800/60"
          >
            Open Full Tactical Map →
          </button>
        </div>
        <SurveillanceMap
          height="450px"
          onSelectDrone={(drone) => {
            setSelectedDroneId(drone.id);
          }}
        />
      </div>

      {/* Charts & Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ThreatDistributionChart drones={drones} />
        <ActivityTrendChart />
      </div>

      {/* Tables & Feed Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <RecentDetectionsTable
            drones={drones}
            onSelectDrone={(drone) => {
              setSelectedDroneId(drone.id);
              onNavigate('tracking');
            }}
            onViewAll={() => onNavigate('detections')}
          />
        </div>
        <div>
          <LiveAlertStream
            alerts={alerts}
            onAcknowledge={acknowledgeAlert}
            onViewAll={() => onNavigate('alerts')}
          />
        </div>
      </div>
    </div>
  );
};
