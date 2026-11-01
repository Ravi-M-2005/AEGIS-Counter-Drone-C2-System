import React, { useState } from 'react';
import { useAegis } from '../context/AegisContext';
import { aegisApi, API_BASE } from '../services/api';
import { tacticalAudio } from '../services/audio';
import {
  Settings,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  Server,
  Shield,
  Zap,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

export const SystemSettingsPage = () => {
  const {
    isSimulating,
    toggleSimulation,
    simulationSpeed,
    setSimSpeed,
    audioEnabled,
    setAudioEnabled,
    backendStatus,
    activeSector,
    setActiveSector,
    resetDemoData,
    currentUser
  } = useAegis();

  const [testSoundPlaying, setTestSoundPlaying] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [backendSyncMessage, setBackendSyncMessage] = useState('');

  const handleTestPing = () => {
    tacticalAudio.playRadarPing();
    setTestSoundPlaying(true);
    setTimeout(() => setTestSoundPlaying(false), 500);
  };

  const handleTestAlarm = () => {
    tacticalAudio.playCriticalAlarm();
  };

  const handleResetWithConfirm = () => {
    if (confirm('Are you sure you want to reset all simulated drone, sensor, incident, and alert records back to initial college demo values?')) {
      resetDemoData();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  const handleBackendHealthCheck = async () => {
    setBackendSyncMessage(`Pinging Spring Boot backend at ${API_BASE}/health...`);
    const res = await aegisApi.checkHealth();
    if (res.isOnline) {
      setBackendSyncMessage('Connection Successful! Spring Boot Backend is UP and operational.');
    } else {
      setBackendSyncMessage('Spring Boot backend is currently offline or unreachable. Standalone simulation mode active.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl font-mono text-xs">
      {/* Header */}
      <div className="p-4 rounded-xl bg-[#0c1424] border border-cyan-900/50 shadow-xl">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-cyan-200 tracking-wider uppercase">
            System & Tactical Simulator Configuration
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-1 font-sans">
          Manage live simulation tick rates, audio synthesis alerts, telemetry feeds, and Spring Boot backend handshakes.
        </p>
      </div>

      {resetSuccess && (
        <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-500/80 text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Demo dataset successfully restored to original baseline records!</span>
        </div>
      )}

      {/* 1. Simulation Engine Controls */}
      <div className="p-5 rounded-xl bg-[#0c1424] border border-cyan-900/50 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-cyan-300 uppercase text-sm">
              Kinematic Simulation Engine
            </h3>
            <p className="text-slate-400 text-[11px] font-sans">
              Controls real-time drone vector displacement, GPS coordinate recalculation, and AI threat scoring.
            </p>
          </div>
          <button
            onClick={toggleSimulation}
            className={`px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isSimulating
                ? 'bg-emerald-950 text-emerald-300 border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                : 'bg-amber-950 text-amber-300 border-amber-500/60'
            }`}
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isSimulating ? 'SIMULATION ACTIVE' : 'PAUSED'}</span>
          </button>
        </div>

        {/* Speed Adjustment */}
        <div>
          <label className="block text-slate-300 font-bold mb-2">
            Simulation Velocity Multiplier:
          </label>
          <div className="grid grid-cols-4 gap-3">
            {[0.5, 1, 2, 5].map(spd => (
              <button
                key={spd}
                onClick={() => setSimSpeed(spd)}
                className={`py-2 px-3 rounded-lg border text-center transition-all ${
                  simulationSpeed === spd
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-sm">{spd}x Speed</div>
                <div className="text-[10px] text-slate-500 font-sans">
                  {spd === 1 ? 'Real-time 3.5s cycle' : spd === 5 ? 'High speed testing' : `${3.5 / spd}s step`}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Tactical Web Audio Settings */}
      <div className="p-5 rounded-xl bg-[#0c1424] border border-cyan-900/50 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-cyan-300 uppercase text-sm">
              Tactical Audio Synthesis (Web Audio API)
            </h3>
            <p className="text-slate-400 text-[11px] font-sans">
              Client-side audio generation for radar sweeps, button clicks, and DEFCON red alarms.
            </p>
          </div>
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`p-2 rounded-lg border transition-all ${
              audioEnabled
                ? 'bg-cyan-950 text-cyan-300 border-cyan-500/60 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleTestPing}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 transition-colors"
          >
            Test Radar Ping Blip 🔊
          </button>
          <button
            onClick={handleTestAlarm}
            className="px-3 py-1.5 rounded-lg bg-red-950 hover:bg-red-900 text-red-300 border border-red-700/60 transition-colors"
          >
            Test Critical Threat Alarm 🚨
          </button>
        </div>
      </div>

      {/* 3. Spring Boot Backend Integration Diagnostic */}
      <div className="p-5 rounded-xl bg-[#0c1424] border border-cyan-900/50 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-cyan-300 uppercase text-sm">
              Java Spring Boot Backend Integration Status
            </h3>
            <p className="text-slate-400 text-[11px] font-sans">
              Endpoint synchronization with AegisApplication REST APIs (port :8443 SSL).
            </p>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
            backendStatus.isOnline
              ? 'bg-emerald-950 text-emerald-300 border-emerald-500/60'
              : 'bg-slate-900 text-slate-400 border-slate-700'
          }`}>
            {backendStatus.isOnline ? 'ONLINE (:8443)' : 'LOCAL SIMULATOR'}
          </span>
        </div>

        <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-500">Status:</span>
            <span className={backendStatus.isOnline ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
              {backendStatus.detail}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Target REST URL:</span>
            <span className="text-cyan-400 font-bold">{API_BASE}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Fallback Strategy:</span>
            <span className="text-slate-300">Seamless Local Simulated State</span>
          </div>
        </div>

        {backendSyncMessage && (
          <div className="p-2.5 rounded bg-slate-900 border border-cyan-900/70 text-cyan-300 text-[11px]">
            {backendSyncMessage}
          </div>
        )}

        <button
          onClick={handleBackendHealthCheck}
          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-800/60 transition-colors"
        >
          Ping /api/health Endpoint
        </button>
      </div>

      {/* 4. Reset & Maintenance */}
      <div className="p-5 rounded-xl bg-[#0c1424] border border-red-900/40 shadow-xl space-y-3">
        <h3 className="font-bold text-red-300 uppercase text-sm">
          Reset Demo Data & Maintenance
        </h3>
        <p className="text-slate-400 text-[11px] font-sans">
          Clears local modifications from localStorage and resets all 24 drones, 5 zones, 10 sensors, 12 incidents, and 18 alerts to default demonstration states.
        </p>

        <button
          onClick={handleResetWithConfirm}
          className="px-4 py-2 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-600/70 shadow-lg font-bold flex items-center gap-2 cursor-pointer transition-colors"
        >
          <RotateCcw className="w-4 h-4 text-red-400" />
          <span>Reset All Simulation Data to Initial Demo State</span>
        </button>
      </div>
    </div>
  );
};
