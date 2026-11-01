import React, { useState, useEffect } from 'react';
import { useAegis } from '../../context/AegisContext';
import {
  Shield,
  Activity,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Radio,
  Server,
  AlertTriangle,
  Zap,
  RotateCcw,
  User,
  LogOut,
  MapPin
} from 'lucide-react';

export const Header = () => {
  const {
    currentUser,
    logoutUser,
    isSimulating,
    toggleSimulation,
    simulationSpeed,
    setSimSpeed,
    audioEnabled,
    setAudioEnabled,
    backendStatus,
    activeSector,
    setActiveSector,
    generateCriticalThreat,
    generateDroneDetection,
    resetDemoData,
    alerts
  } = useAegis();

  const [timeStr, setTimeStr] = useState('');
  const [userDropdown, setUserDropdown] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const ist = now.toLocaleTimeString('en-IN', { hour12: false });
      const utc = now.toISOString().substring(11, 19);
      setTimeStr(`${ist} IST | ${utc}Z`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const unackCriticalCount = alerts.filter(a => a.severity === 'CRITICAL' && !a.acknowledged).length;

  return (
    <header className="no-print bg-[#070e1c] border-b border-cyan-900/40 text-slate-200 sticky top-0 z-50 shadow-lg backdrop-blur-md">
      {/* Top Ticker for Unacknowledged Critical Alerts */}
      {unackCriticalCount > 0 && (
        <div className="bg-red-950/80 border-b border-red-600/70 text-red-200 px-4 py-1 text-xs font-mono flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="font-bold tracking-wider">DEFENSE CONDITION RED:</span>
            <span>{unackCriticalCount} UNACKNOWLEDGED CRITICAL INCURSION ALERT(S) DETECTED</span>
          </div>
          <span className="text-[11px] bg-red-900/60 px-2 py-0.5 rounded border border-red-500/50">
            AIR DEFENSE PRIORITY 1
          </span>
        </div>
      )}

      <div className="px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Shield className="w-6 h-6 text-cyan-400" />
            <div className="absolute inset-0 rounded-lg border border-cyan-400/20 animate-ping opacity-30" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-widest text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                AEGIS
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono tracking-wider bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 rounded-full font-semibold">
                C2 SYSTEM
              </span>
              {backendStatus.isOnline ? (
                <span className="px-2 py-0.5 text-[10px] font-mono tracking-widest bg-emerald-950/80 text-emerald-300 border border-emerald-500/60 rounded font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE BACKEND CONNECTED (:8443)
                </span>
              ) : (
                <span className="px-2 py-0.5 text-[10px] font-mono tracking-widest bg-amber-950/70 text-amber-300 border border-amber-500/50 rounded font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  SIMULATION MODE – DEMO DATA
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 tracking-wide hidden sm:block">
              AI-Powered Counter-Drone Surveillance & Threat Management
            </p>
          </div>
        </div>

        {/* Center: Sector Switcher & Live Backend Indicator */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Sector Selector */}
          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-700/80 rounded-lg p-1 text-xs">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 ml-1.5" />
            <button
              onClick={() => setActiveSector('bengaluru')}
              className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-all ${
                activeSector === 'bengaluru'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Bengaluru Airport (KIA)
            </button>
            <button
              onClick={() => setActiveSector('border')}
              className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-all ${
                activeSector === 'border'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Northern Border
            </button>
            <button
              onClick={() => setActiveSector('defence')}
              className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-all ${
                activeSector === 'defence'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Naval Defense
            </button>
          </div>

          {/* Backend Status */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border ${
              backendStatus.isOnline
                ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                : 'bg-slate-900/80 border-slate-700 text-slate-400'
            }`}
            title={backendStatus.detail}
          >
            <Server className={`w-3 h-3 ${backendStatus.isOnline ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span className={`w-1.5 h-1.5 rounded-full ${backendStatus.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            <span>{backendStatus.isOnline ? 'Spring Boot :8443' : 'Local Simulator'}</span>
          </div>
        </div>

        {/* Right Controls: Simulator Controls, Time & User */}
        <div className="flex items-center gap-2.5">
          {/* Quick Simulation Bar */}
          <div className="flex items-center bg-slate-900/90 border border-cyan-900/50 rounded-lg p-1 text-xs">
            {/* Play/Pause */}
            <button
              onClick={toggleSimulation}
              className={`p-1.5 rounded transition-all ${
                isSimulating
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}
              title={isSimulating ? 'Pause Drone Simulation' : 'Start Drone Simulation'}
            >
              {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>

            {/* Simulation Speed */}
            <div className="hidden sm:flex items-center gap-0.5 ml-1 border-l border-slate-700 pl-1 font-mono text-[11px]">
              {[1, 2, 5].map(spd => (
                <button
                  key={spd}
                  onClick={() => setSimSpeed(spd)}
                  className={`px-1.5 py-0.5 rounded ${
                    simulationSpeed === spd ? 'bg-cyan-500/30 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* Audio Toggle */}
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`p-1.5 rounded ml-1 transition-all ${
                audioEnabled ? 'text-cyan-400 hover:text-cyan-300' : 'text-slate-500 hover:text-slate-400'
              }`}
              title={audioEnabled ? 'Mute Radar/Alarm Sounds' : 'Enable Tactical Audio'}
            >
              {audioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            {/* Quick Actions */}
            <button
              onClick={() => generateDroneDetection()}
              className="hidden md:inline-flex items-center gap-1 px-2 py-1 ml-1 rounded bg-cyan-950/70 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-700/50 text-[11px] font-mono"
              title="Inject a new simulated drone detection"
            >
              <Radio className="w-3 h-3 text-cyan-400" />
              <span>+ Drone</span>
            </button>

            <button
              onClick={() => generateCriticalThreat()}
              className="hidden md:inline-flex items-center gap-1 px-2 py-1 ml-1 rounded bg-red-950/70 hover:bg-red-900/80 text-red-300 border border-red-700/60 text-[11px] font-mono"
              title="Inject critical threat incursion"
            >
              <Zap className="w-3 h-3 text-red-400" />
              <span>+ Breach</span>
            </button>
          </div>

          {/* Military Clock */}
          <div className="hidden xl:block font-mono text-xs text-cyan-300/90 bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800">
            {timeStr}
          </div>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setUserDropdown(!userDropdown)}
              className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500/50 transition-all text-xs"
            >
              <div className="w-6 h-6 rounded bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs border border-cyan-500/40">
                {currentUser?.name ? currentUser.name.charAt(0) : 'A'}
              </div>
              <span className="hidden sm:inline font-mono text-[11px] text-slate-300">
                {currentUser?.username || 'admin'}
              </span>
            </button>

            {userDropdown && (
              <div className="absolute right-0 mt-2 w-56 rounded-lg bg-[#0c1424] border border-cyan-900/60 shadow-2xl p-2 z-50 text-xs">
                <div className="p-2 border-b border-slate-800">
                  <p className="font-semibold text-slate-200">{currentUser?.name || 'Administrator'}</p>
                  <p className="text-[11px] font-mono text-cyan-400">{currentUser?.role}</p>
                  <p className="text-[10px] font-mono text-amber-400 mt-1">{currentUser?.clearance}</p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      resetDemoData();
                      setUserDropdown(false);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-slate-300 hover:bg-slate-800 hover:text-cyan-300 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Reset Demo Data</span>
                  </button>
                  <button
                    onClick={() => {
                      logoutUser();
                      setUserDropdown(false);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-red-400 hover:bg-red-950/50 hover:text-red-300 transition-colors mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out (Demo Auth)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
