import React from 'react';
import { useAegis } from '../../context/AegisContext';
import {
  LayoutDashboard,
  Radar,
  Crosshair,
  BrainCircuit,
  ShieldAlert,
  Radio,
  Route,
  AlertTriangle,
  Users,
  Bell,
  BarChart3,
  UserCheck,
  Settings,
  ChevronRight
} from 'lucide-react';

export const Sidebar = ({ activeTab, onSelectTab }) => {
  const { alerts, incidents, drones } = useAegis();

  const unackAlertsCount = alerts.filter(a => !a.acknowledged).length;
  const criticalAlertsCount = alerts.filter(a => a.severity === 'CRITICAL' && !a.acknowledged).length;
  const openIncidentsCount = incidents.filter(i => i.status === 'OPEN' || i.status === 'ASSIGNED').length;
  const activeDronesCount = drones.filter(d => d.status === 'TRACKING').length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Main Dashboard',
      subtitle: 'Command & Control',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'surveillance',
      label: 'Live Surveillance',
      subtitle: 'Interactive Tactical Map',
      icon: Radar,
      badge: `${activeDronesCount} Live`,
      badgeColor: 'cyan'
    },
    {
      id: 'detections',
      label: 'Drone Detections',
      subtitle: 'Detection Records & Log',
      icon: Crosshair,
      badge: `${drones.length}`,
      badgeColor: 'slate'
    },
    {
      id: 'threats',
      label: 'AI Threat Analysis',
      subtitle: 'Rule-Based Classifier',
      icon: BrainCircuit,
      badge: 'AI v2.4',
      badgeColor: 'purple'
    },
    {
      id: 'zones',
      label: 'Surveillance Zones',
      subtitle: 'Geo-Fence & Perimeters',
      icon: ShieldAlert,
      badge: null
    },
    {
      id: 'sensors',
      label: 'Sensor Stations',
      subtitle: 'Radar, RF & Optical Grid',
      icon: Radio,
      badge: null
    },
    {
      id: 'tracking',
      label: 'Drone Tracking',
      subtitle: 'Telemetry & Flight Paths',
      icon: Route,
      badge: null
    },
    {
      id: 'incidents',
      label: 'Incident Management',
      subtitle: 'Active Breaches & Response',
      icon: AlertTriangle,
      badge: openIncidentsCount > 0 ? `${openIncidentsCount} Open` : null,
      badgeColor: 'amber'
    },
    {
      id: 'teams',
      label: 'Response Teams',
      subtitle: 'QRT Units & Patrols',
      icon: Users,
      badge: null
    },
    {
      id: 'alerts',
      label: 'Alert Center',
      subtitle: 'Emergency Notifications',
      icon: Bell,
      badge: criticalAlertsCount > 0 ? `${criticalAlertsCount} Crit` : (unackAlertsCount > 0 ? `${unackAlertsCount}` : null),
      badgeColor: criticalAlertsCount > 0 ? 'red' : 'amber'
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      subtitle: 'Trends, MTTD & Export',
      icon: BarChart3,
      badge: null
    },
    {
      id: 'users',
      label: 'User Management',
      subtitle: 'Roles & Clearances',
      icon: UserCheck,
      badge: null
    },
    {
      id: 'settings',
      label: 'System Settings',
      subtitle: 'Simulator & Config',
      icon: Settings,
      badge: null
    }
  ];

  return (
    <aside className="no-print w-64 bg-[#070e1c] border-r border-cyan-900/40 flex flex-col justify-between select-none shadow-xl">
      <div className="py-3 px-2 overflow-y-auto flex-1 space-y-1">
        <div className="px-3 py-1.5 text-[10px] font-mono tracking-widest uppercase text-slate-500 font-bold">
          Tactical Navigation
        </div>

        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          let badgeClass = 'bg-slate-800 text-slate-400 border border-slate-700';
          if (item.badgeColor === 'cyan') {
            badgeClass = 'bg-cyan-950 text-cyan-300 border border-cyan-500/50';
          } else if (item.badgeColor === 'amber') {
            badgeClass = 'bg-amber-950 text-amber-300 border border-amber-500/50';
          } else if (item.badgeColor === 'red') {
            badgeClass = 'bg-red-950 text-red-300 border border-red-500/80 animate-pulse font-bold';
          } else if (item.badgeColor === 'purple') {
            badgeClass = 'bg-purple-950 text-purple-300 border border-purple-500/50';
          }

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-950/80 to-blue-950/40 text-cyan-200 border-l-4 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 flex-shrink-0 transition-colors ${
                    isActive ? 'text-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                />
                <div className="truncate">
                  <div className={`text-xs font-semibold tracking-wide ${isActive ? 'text-cyan-100' : 'text-slate-300'}`}>
                    {item.label}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">{item.subtitle}</div>
                </div>
              </div>

              {item.badge ? (
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono tracking-tight ${badgeClass}`}>
                  {item.badge}
                </span>
              ) : (
                <ChevronRight className={`w-3 h-3 text-slate-600 transition-transform ${isActive ? 'text-cyan-400 transform translate-x-0.5' : 'opacity-0 group-hover:opacity-100'}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer System Status Banner */}
      <div className="p-3 border-t border-slate-800/80 bg-[#050b14]/70">
        <div className="rounded-lg p-2.5 bg-slate-900/90 border border-cyan-950/60 text-[11px] font-mono space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span>AIR DEFENSE GRID</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ONLINE
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500">
            <span>RADAR COVERAGE</span>
            <span className="text-cyan-400">100% 360°</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500">
            <span>THREAT PROTOCOL</span>
            <span className="text-amber-400">AUTOMATED AI</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
