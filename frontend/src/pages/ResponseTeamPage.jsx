import React, { useState } from 'react';
import { useAegis } from '../context/AegisContext';
import { Modal } from '../components/common/Modal';
import {
  Users,
  Shield,
  Radio,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Send,
  Zap
} from 'lucide-react';

export const ResponseTeamPage = () => {
  const { teams, incidents, updateTeam, assignIncidentTeam } = useAegis();

  const [selectedTeam, setSelectedTeam] = useState(null);
  const [deployModalTeam, setDeployModalTeam] = useState(null);
  const [targetIncidentId, setTargetIncidentId] = useState(incidents[0]?.id || '');

  const openIncidents = incidents.filter(i => i.status === 'OPEN' || i.status === 'ASSIGNED');

  const handleDeploy = (e) => {
    e.preventDefault();
    if (deployModalTeam && targetIncidentId) {
      assignIncidentTeam(targetIncidentId, deployModalTeam.id);
      setDeployModalTeam(null);
    }
  };

  const handleStandDown = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    if (team) {
      updateTeam({
        ...team,
        status: 'STANDBY',
        assignedIncident: null,
        deploymentTime: 'Standby / Ready'
      });
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#0c1424] border border-cyan-900/50 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold font-mono text-cyan-200 tracking-wider uppercase">
              Response Team & Intercept Unit Dispatch
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tactical Quick Reaction Teams (QRT), Electronic Warfare units, net-gun interceptors, and perimeter security patrols.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded bg-slate-900 text-slate-300 border border-slate-700">
            {teams.filter(t => t.status === 'STANDBY').length} Units on Standby
          </span>
          <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/50">
            {teams.filter(t => t.status === 'DEPLOYED').length} Units Deployed
          </span>
        </div>
      </div>

      {/* Response Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map(team => {
          const isDeployed = team.status === 'DEPLOYED' || team.status === 'EN_ROUTE';
          const assignedInc = incidents.find(i => i.id === team.assignedIncident);

          return (
            <div
              key={team.id}
              className={`rounded-xl bg-[#0c1424] border p-4 shadow-xl transition-all font-mono text-xs ${
                isDeployed
                  ? 'border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                  : 'border-cyan-900/50 hover:border-cyan-600/50'
              }`}
            >
              <div className="flex items-start justify-between pb-2 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200 text-sm">{team.id}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      isDeployed
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/60 animate-pulse'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {team.status}
                    </span>
                  </div>
                  <h4 className="font-semibold text-cyan-300 text-xs mt-0.5">{team.name}</h4>
                </div>
              </div>

              <div className="py-3 space-y-2 text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Unit Leader:</span>
                  <span className="text-slate-200 font-semibold">{team.leader}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Operational Role:</span>
                  <span className="text-slate-300 truncate max-w-[170px]">{team.type}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Personnel Strength:</span>
                  <span className="text-cyan-400">{team.membersCount} Operators</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Staging Location:</span>
                  <span className="text-slate-300 truncate max-w-[160px]">{team.location}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Assigned Incident:</span>
                  <span className={team.assignedIncident ? 'text-amber-400 font-bold' : 'text-slate-500'}>
                    {team.assignedIncident || 'None (Available)'}
                  </span>
                </div>
                {assignedInc && (
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300">
                    Target: <span className="text-cyan-400">{assignedInc.droneId}</span> • {assignedInc.summary}
                  </div>
                )}
                <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                  <span className="text-slate-500 block mb-0.5">LOADOUT / GEAR:</span>
                  <span className="text-slate-300">{team.equipment}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">
                  Deployed: {team.deploymentTime}
                </span>

                {isDeployed ? (
                  <button
                    onClick={() => handleStandDown(team.id)}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 transition-colors"
                  >
                    Stand Down Unit
                  </button>
                ) : (
                  <button
                    onClick={() => setDeployModalTeam(team)}
                    className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-colors flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>Deploy Unit</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Deploy Unit Modal */}
      <Modal
        isOpen={!!deployModalTeam}
        onClose={() => setDeployModalTeam(null)}
        title={`Deploy Unit: ${deployModalTeam?.name}`}
      >
        <form onSubmit={handleDeploy} className="space-y-4 font-mono text-xs">
          <div>
            <label className="block text-slate-400 uppercase text-[10px] mb-1">
              Select Active Incursion Incident to Intercept
            </label>
            <select
              value={targetIncidentId}
              onChange={(e) => setTargetIncidentId(e.target.value)}
              className="w-full bg-[#060b14] border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
            >
              {openIncidents.map(inc => (
                <option key={inc.id} value={inc.id}>
                  {inc.id} – Target {inc.droneId} ({inc.threatLevel}) • {inc.zoneName}
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1 text-[11px]">
            <span className="text-[10px] text-slate-400 uppercase">Unit Details</span>
            <div>Unit Leader: <span className="text-slate-200">{deployModalTeam?.leader}</span></div>
            <div>Equipment: <span className="text-cyan-300">{deployModalTeam?.equipment}</span></div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setDeployModalTeam(null)}
              className="px-3 py-1.5 rounded bg-slate-800 text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold"
            >
              Confirm Tactical Deployment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
