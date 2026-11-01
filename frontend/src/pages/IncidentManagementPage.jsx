import React, { useState } from 'react';
import { useAegis } from '../context/AegisContext';
import { ThreatBadge } from '../components/common/ThreatBadge';
import { Modal } from '../components/common/Modal';
import {
  AlertTriangle,
  Plus,
  Users,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowRight,
  Filter,
  FileText
} from 'lucide-react';

export const IncidentManagementPage = () => {
  const {
    incidents,
    teams,
    drones,
    zones,
    openIncident,
    assignIncidentTeam,
    updateIncidentStatus
  } = useAegis();

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedIncidentModal, setSelectedIncidentModal] = useState(null);
  const [assignTeamModalIncident, setAssignTeamModalIncident] = useState(null);

  // Filter
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Form State
  const [selectedDroneId, setSelectedDroneId] = useState(drones[0]?.id || '');
  const [summary, setSummary] = useState('');
  const [resolutionText, setResolutionText] = useState('');

  const filteredIncidents = incidents.filter(inc => {
    if (statusFilter === 'ALL') return true;
    return inc.status === statusFilter;
  });

  const handleCreateIncident = (e) => {
    e.preventDefault();
    const drone = drones.find(d => d.id === selectedDroneId) || drones[0];
    const zone = zones.find(z => z.id === drone.zoneId) || zones[0];

    openIncident({
      droneId: drone.id,
      sector: drone.sector,
      zoneId: zone?.id || null,
      zoneName: zone?.name || 'Exclusion Perimeter',
      threatLevel: drone.threatLevel,
      assignedTeamId: null,
      assignedTeamName: 'Unassigned',
      reportedBy: 'C2 Operator Dispatch',
      summary: summary || `Unauthorized drone intrusion by ${drone.model} at ${drone.distanceKm}km standoff.`,
      actionTaken: 'Incident opened by Command Operator.'
    });

    setIsCreateModalOpen(false);
    setSummary('');
  };

  const handleAssignTeam = (teamId) => {
    if (assignTeamModalIncident) {
      assignIncidentTeam(assignTeamModalIncident.id, teamId);
      setAssignTeamModalIncident(null);
    }
  };

  const handleUpdateStatusAndClose = (status) => {
    if (selectedIncidentModal) {
      updateIncidentStatus(selectedIncidentModal.id, status, resolutionText);
      setSelectedIncidentModal(null);
      setResolutionText('');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#0c1424] border border-cyan-900/50 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold font-mono text-cyan-200 tracking-wider uppercase">
              Incident Response & Operational Log
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Formal counter-UAS security breaches, team dispatch logs, investigation records, and incident closure SOPs.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold font-mono text-xs shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Open Security Incident</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1 rounded-lg bg-[#0c1424] border border-slate-800 text-xs font-mono">
        {['ALL', 'OPEN', 'ASSIGNED', 'UNDER_INVESTIGATION', 'RESOLVED'].map(st => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded transition-all ${
              statusFilter === st
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Incidents Table */}
      <div className="rounded-xl bg-[#0c1424] border border-cyan-900/50 shadow-xl overflow-hidden font-mono text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#080f1e] border-b border-cyan-900/60 text-[10px] uppercase text-cyan-300/80">
                <th className="py-3 px-3">Incident ID</th>
                <th className="py-3 px-3">Time</th>
                <th className="py-3 px-3">Target Drone</th>
                <th className="py-3 px-3">Surveillance Zone</th>
                <th className="py-3 px-3">Threat</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Assigned Team</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-slate-500">
                    No incident records matching current filter.
                  </td>
                </tr>
              ) : (
                filteredIncidents.map(inc => {
                  const isCritical = inc.threatLevel === 'CRITICAL';
                  const isOpen = inc.status === 'OPEN';

                  return (
                    <tr
                      key={inc.id}
                      className="hover:bg-slate-900/50 transition-colors group cursor-pointer"
                      onClick={() => setSelectedIncidentModal(inc)}
                    >
                      <td className="py-3 px-3 font-bold text-cyan-300">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-amber-400 animate-ping' : 'bg-slate-500'}`} />
                          <span>{inc.id}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-slate-400">
                        <div>{inc.incidentTime.substring(11, 19)}</div>
                        <div className="text-[10px] text-slate-500">{inc.incidentTime.substring(0, 10)}</div>
                      </td>

                      <td className="py-3 px-3 text-slate-200">
                        <div className="font-semibold text-cyan-400">{inc.droneId}</div>
                      </td>

                      <td className="py-3 px-3 text-slate-300 truncate max-w-[150px]">
                        {inc.zoneName}
                      </td>

                      <td className="py-3 px-3">
                        <ThreatBadge level={inc.threatLevel} />
                      </td>

                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          inc.status === 'OPEN'
                            ? 'bg-amber-950 text-amber-300 border border-amber-500/50 animate-pulse'
                            : inc.status === 'ASSIGNED'
                            ? 'bg-blue-950 text-blue-300 border border-blue-500/50'
                            : inc.status === 'RESOLVED'
                            ? 'bg-slate-800 text-slate-400'
                            : 'bg-purple-950 text-purple-300 border border-purple-500/50'
                        }`}>
                          {inc.status}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-300">
                        {inc.assignedTeamName && inc.assignedTeamName !== 'Unassigned' ? (
                          <div className="flex items-center gap-1 text-emerald-300">
                            <Users className="w-3 h-3 text-emerald-400" />
                            <span className="truncate max-w-[140px]">{inc.assignedTeamName}</span>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setAssignTeamModalIncident(inc);
                            }}
                            className="px-2 py-0.5 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 text-[10px] font-bold"
                          >
                            + Assign Team
                          </button>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedIncidentModal(inc);
                          }}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-600 transition-colors"
                        >
                          Details & SOP →
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Incident Details & Workflow Modal */}
      <Modal
        isOpen={!!selectedIncidentModal}
        onClose={() => setSelectedIncidentModal(null)}
        title={`Incident Workflow: ${selectedIncidentModal?.id}`}
      >
        {selectedIncidentModal && (
          <div className="space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-cyan-900/50">
              <div>
                <span className="text-base font-bold text-cyan-300">{selectedIncidentModal.id}</span>
                <p className="text-slate-400">Target Target: {selectedIncidentModal.droneId}</p>
              </div>
              <ThreatBadge level={selectedIncidentModal.threatLevel} size="lg" />
            </div>

            <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800 space-y-1.5">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Incident Summary</span>
              <p className="text-slate-200 leading-relaxed font-sans">{selectedIncidentModal.summary}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase">Location & Sector</span>
                <div>Zone: <span className="text-slate-200 font-semibold">{selectedIncidentModal.zoneName}</span></div>
                <div>Reported By: <span className="text-cyan-300">{selectedIncidentModal.reportedBy}</span></div>
                <div>Time: <span className="text-slate-400">{selectedIncidentModal.incidentTime}</span></div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase">Response Assignment</span>
                <div>Team: <span className="text-emerald-400 font-bold">{selectedIncidentModal.assignedTeamName || 'Unassigned'}</span></div>
                <div>Current Status: <span className="text-amber-400 font-bold">{selectedIncidentModal.status}</span></div>
                <div>Action: <span className="text-slate-300 text-[10px]">{selectedIncidentModal.actionTaken}</span></div>
              </div>
            </div>

            {/* Resolution Input */}
            <div>
              <label className="block text-slate-400 uppercase text-[10px] mb-1">
                Operator Action Notes & Resolution Log
              </label>
              <textarea
                value={resolutionText}
                onChange={(e) => setResolutionText(e.target.value)}
                placeholder="Log resolution: e.g. RF jamming protocol completed; drone forced to return to home coordinates; ground pilot detained by QRT Alpha."
                className="w-full bg-[#060b14] border border-slate-700 rounded-lg p-2.5 text-slate-200 h-20"
              />
            </div>

            {/* Status Change Buttons */}
            <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={() => {
                  setAssignTeamModalIncident(selectedIncidentModal);
                  setSelectedIncidentModal(null);
                }}
                className="px-3 py-1.5 rounded bg-blue-950 hover:bg-blue-900 text-blue-300 border border-blue-500/50 flex items-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Reassign Team</span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdateStatusAndClose('UNDER_INVESTIGATION')}
                  className="px-3 py-1.5 rounded bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-500/50"
                >
                  Mark Under Investigation
                </button>
                <button
                  onClick={() => handleUpdateStatusAndClose('RESOLVED')}
                  className="px-3 py-1.5 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/50 font-bold"
                >
                  ✓ Close & Resolve Incident
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Assign Team Modal */}
      <Modal
        isOpen={!!assignTeamModalIncident}
        onClose={() => setAssignTeamModalIncident(null)}
        title={`Dispatch Response Team to ${assignTeamModalIncident?.id}`}
      >
        <div className="space-y-3 font-mono text-xs">
          <p className="text-slate-400">
            Select an operational Quick Reaction Team (QRT) or Electronic Warfare unit to dispatch:
          </p>

          <div className="space-y-2">
            {teams.map(team => {
              const isAvailable = team.status === 'STANDBY';
              return (
                <div
                  key={team.id}
                  onClick={() => handleAssignTeam(team.id)}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 cursor-pointer transition-all"
                >
                  <div>
                    <div className="font-bold text-slate-200 flex items-center gap-2">
                      <span>{team.name}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                        isAvailable ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
                      }`}>
                        {team.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Leader: {team.leader} • Type: {team.type}
                    </div>
                  </div>

                  <button className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-[10px]">
                    Dispatch Unit
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </Modal>

      {/* Create Incident Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Open New Incident Record"
      >
        <form onSubmit={handleCreateIncident} className="space-y-4 font-mono text-xs">
          <div>
            <label className="block text-slate-400 uppercase text-[10px] mb-1">Associated Target Drone</label>
            <select
              value={selectedDroneId}
              onChange={(e) => setSelectedDroneId(e.target.value)}
              className="w-full bg-[#060b14] border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
            >
              {drones.map(d => (
                <option key={d.id} value={d.id}>
                  {d.id} – {d.model} ({d.threatLevel}) • {d.distanceKm}km out
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 uppercase text-[10px] mb-1">Incident Summary & Breach Details</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full bg-[#060b14] border border-slate-700 rounded-lg p-2.5 text-slate-200 h-24"
              placeholder="Describe incursion vector, target altitude, proximity to assets, and immediate risk..."
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-3 py-1.5 rounded bg-slate-800 text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold"
            >
              Open Incident Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
