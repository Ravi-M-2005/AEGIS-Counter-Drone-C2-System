import React, { useState } from 'react';
import { evaluateDroneThreat } from '../services/aiThreatEngine';
import { ThreatBadge } from '../components/common/ThreatBadge';
import {
  BrainCircuit,
  Sliders,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Activity,
  Layers,
  ArrowRight
} from 'lucide-react';

export const ThreatClassificationPage = () => {
  // Interactive Simulator Sliders
  const [distanceKm, setDistanceKm] = useState(1.2);
  const [altitudeM, setAltitudeM] = useState(48);
  const [speedKmh, setSpeedKmh] = useState(85);
  const [payloadDetected, setPayloadDetected] = useState(true);
  const [rfBand, setRfBand] = useState('Frequency Hopping (Silent Radio)');
  const [zoneSecurity, setZoneSecurity] = useState('CRITICAL');

  // Evaluate rule-based AI in real-time
  const evalResult = evaluateDroneThreat({
    distanceKm,
    altitudeM,
    speedKmh,
    payloadDetected,
    rfBand,
    zoneSecurity
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl bg-[#0c1424] border border-cyan-900/50 shadow-xl">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold font-mono text-cyan-200 tracking-wider uppercase">
            Rule-Based AI Threat Assessment Simulation
          </h2>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-500/50 font-bold">
            RULE-BASED AI (DETERMINISTIC)
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Deterministic 5-factor rule-based simulation matrix evaluating kinematics, proximity, and RF payload signatures.
          Normalized to 0–100 scale from maximum 105 raw points. All recommendations strictly enforce human operator verification without autonomous engagement.
        </p>
      </div>

      {/* Main Interactive AI Simulator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Factor Controls (5 cols) */}
        <div className="lg:col-span-5 rounded-xl bg-[#0c1424] border border-cyan-900/50 p-5 shadow-xl space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-cyan-300 uppercase">
                Simulated Telemetry Inputs
              </h3>
            </div>
            <span className="text-[10px] text-slate-500">Live Adjustment</span>
          </div>

          {/* Distance Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-300">Distance to Restricted Core:</span>
              <span className="font-bold text-cyan-400">{distanceKm.toFixed(2)} km</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="10.0"
              step="0.1"
              value={distanceKm}
              onChange={(e) => setDistanceKm(parseFloat(e.target.value))}
              className="w-full accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0.1 km (Runway Core)</span>
              <span>10.0 km (Standoff)</span>
            </div>
          </div>

          {/* Altitude Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-300">Altitude (AGL):</span>
              <span className="font-bold text-amber-300">{altitudeM} meters</span>
            </div>
            <input
              type="range"
              min="10"
              max="500"
              step="5"
              value={altitudeM}
              onChange={(e) => setAltitudeM(parseInt(e.target.value))}
              className="w-full accent-amber-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>10m (Terrain Hugging)</span>
              <span>500m (Civil Glidepath)</span>
            </div>
          </div>

          {/* Speed Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-300">Airspeed:</span>
              <span className="font-bold text-slate-200">{speedKmh} km/h</span>
            </div>
            <input
              type="range"
              min="0"
              max="160"
              step="5"
              value={speedKmh}
              onChange={(e) => setSpeedKmh(parseInt(e.target.value))}
              className="w-full accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0 km/h (Hovering)</span>
              <span>160 km/h (High Sprint)</span>
            </div>
          </div>

          {/* Payload Toggle */}
          <div className="pt-2 border-t border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={payloadDetected}
                onChange={(e) => setPayloadDetected(e.target.checked)}
                className="w-4 h-4 accent-red-500 rounded cursor-pointer"
              />
              <span className="text-slate-200 font-semibold">
                Payload / Gimbal Pod Detected (+20 Risk)
              </span>
            </label>
          </div>

          {/* RF Protocol Selector */}
          <div>
            <label className="block text-slate-400 text-[10px] uppercase mb-1">
              RF Telemetry Signature
            </label>
            <select
              value={rfBand}
              onChange={(e) => setRfBand(e.target.value)}
              className="w-full bg-[#060b14] border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
            >
              <option value="2.4 GHz OccuSync 3">Standard 2.4 GHz (Civil Commercial)</option>
              <option value="5.8 GHz Standard WiFi">Standard 5.8 GHz WiFi</option>
              <option value="433 MHz LoRa Radio">433 MHz Long-Range LoRa</option>
              <option value="Frequency Hopping (Silent Radio)">Frequency Hopping (Silent / Anti-Jam)</option>
              <option value="Encrypted Military Link">Encrypted Military UHF/SATCOM</option>
            </select>
          </div>

          {/* Zone Security Level */}
          <div>
            <label className="block text-slate-400 text-[10px] uppercase mb-1">
              Perimeter Security Priority
            </label>
            <select
              value={zoneSecurity}
              onChange={(e) => setZoneSecurity(e.target.value)}
              className="w-full bg-[#060b14] border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
            >
              <option value="CRITICAL">Exclusion Zone (Runway / Military Core)</option>
              <option value="HIGH">Approach Corridor (Civil Aviation Buffer)</option>
              <option value="MEDIUM">Aerospace SEZ / Secondary Perimeter</option>
            </select>
          </div>
        </div>

        {/* Right: AI Output & Assessment Gauge (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Risk Score Card */}
          <div className="rounded-xl bg-[#0c1424] border border-cyan-900/50 p-5 shadow-xl font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs text-slate-400 uppercase font-bold">
                Computed Threat Assessment
              </span>
              <ThreatBadge level={evalResult.threatLevel} score={evalResult.threatScore} size="lg" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4 items-center">
              {/* Big Score Gauge */}
              <div className="p-4 rounded-xl bg-[#060b14] border border-slate-800 text-center">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest">Normalized Threat Score</div>
                <div className={`text-4xl font-black mt-1 ${
                  evalResult.threatLevel === 'CRITICAL' ? 'text-red-400 drop-shadow-[0_0_12px_rgba(239,68,68,0.5)]' :
                  evalResult.threatLevel === 'HIGH' ? 'text-orange-400' :
                  evalResult.threatLevel === 'MEDIUM' ? 'text-yellow-400' : 'text-emerald-400'
                }`}>
                  {evalResult.threatScore} <span className="text-sm font-normal text-slate-500">/ 100</span>
                </div>
                <div className="text-[10px] text-cyan-400 mt-1 font-mono">
                  Raw: {evalResult.rawScore} / {evalResult.maxRawScore || 105} pts
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 uppercase font-bold">
                  Level: {evalResult.threatLevel}
                </div>
              </div>

              {/* Progress Meter */}
              <div className="md:col-span-2 space-y-2">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Normalized Threat Scale:</span>
                  <span className="text-cyan-400">0 (Safe) → 100 (Critical Incursion)</span>
                </div>
                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      evalResult.threatLevel === 'CRITICAL' ? 'bg-gradient-to-r from-orange-500 to-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' :
                      evalResult.threatLevel === 'HIGH' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                      evalResult.threatLevel === 'MEDIUM' ? 'bg-gradient-to-r from-emerald-500 to-yellow-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${evalResult.threatScore}%` }}
                  />
                </div>
                <div className="grid grid-cols-4 text-[9px] text-slate-500 font-mono text-center pt-1">
                  <span className="text-emerald-400">LOW (0–30)</span>
                  <span className="text-yellow-400">MED (31–60)</span>
                  <span className="text-orange-400">HIGH (61–80)</span>
                  <span className="text-red-400">CRIT (81–100)</span>
                </div>
              </div>
            </div>

            {/* Recommended Operator Action (SOP) */}
            <div className={`p-4 rounded-xl border mt-3 ${
              evalResult.threatLevel === 'CRITICAL'
                ? 'bg-red-950/60 border-red-500/70 text-red-200'
                : evalResult.threatLevel === 'HIGH'
                ? 'bg-orange-950/50 border-orange-500/60 text-orange-200'
                : 'bg-cyan-950/40 border-cyan-800/60 text-cyan-200'
            }`}>
              <div className="flex items-center gap-2 mb-1.5">
                <ShieldAlert className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Mandatory SOP / Recommended Operator Action
                </span>
              </div>
              <p className="text-xs leading-relaxed font-sans">
                {evalResult.recommendedAction}
              </p>
            </div>
          </div>

          {/* Breakdown of Rule Factors */}
          <div className="rounded-xl bg-[#0c1424] border border-cyan-900/50 p-5 shadow-xl font-mono text-xs">
            <h4 className="font-bold text-cyan-300 uppercase mb-3">
              Factor Weight Breakdown & Justification
            </h4>
            <div className="space-y-2">
              {evalResult.factors.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800"
                >
                  <div>
                    <span className="font-bold text-slate-200">{f.name}</span>
                    <p className="text-[10px] text-slate-400">{f.detail}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-cyan-400 font-bold">+{f.score} pts</span>
                    <div className="text-[10px] text-slate-500">{f.impact}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
