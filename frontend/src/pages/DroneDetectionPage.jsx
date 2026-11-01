import React, { useState, useMemo } from 'react';
import { useAegis } from '../context/AegisContext';
import { ThreatBadge } from '../components/common/ThreatBadge';
import { Modal } from '../components/common/Modal';
import {
  Crosshair,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Trash2,
  ShieldAlert,
  Radio,
  FileSpreadsheet
} from 'lucide-react';

export const DroneDetectionPage = ({ onNavigate }) => {
  const {
    drones,
    sensors,
    zones,
    activeSector,
    updateDroneStatus,
    generateDroneDetection,
    setSelectedDroneId
  } = useAegis();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [threatFilter, setThreatFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sensorFilter, setSensorFilter] = useState('ALL');

  // Modals
  const [selectedDroneModal, setSelectedDroneModal] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Drone Form State
  const [newModel, setNewModel] = useState('DJI Mavic 3 Enterprise');
  const [newAltitude, setNewAltitude] = useState(120);
  const [newSpeed, setNewSpeed] = useState(45);
  const [newDistance, setNewDistance] = useState(2.5);
  const [newSensor, setNewSensor] = useState('AESA 3D Radar Alpha');
  const [newPayload, setNewPayload] = useState(false);

  // Filtered Drones
  const filteredDrones = useMemo(() => {
    return drones.filter(drone => {
      const matchSearch =
        drone.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drone.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drone.sensorSource.toLowerCase().includes(searchTerm.toLowerCase());

      const matchThreat = threatFilter === 'ALL' || drone.threatLevel === threatFilter;
      const matchStatus = statusFilter === 'ALL' || drone.status === statusFilter;
      const matchSensor = sensorFilter === 'ALL' || drone.sensorSource.includes(sensorFilter);

      return matchSearch && matchThreat && matchStatus && matchSensor;
    });
  }, [drones, searchTerm, threatFilter, statusFilter, sensorFilter]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Drone ID', 'Model', 'Sector', 'Threat Level', 'Threat Score', 'Altitude (m)', 'Speed (km/h)', 'Distance (km)', 'RF Band', 'Payload Detected', 'Sensor Source', 'Status', 'Detected At'];
    const rows = filteredDrones.map(d => [
      d.id,
      `"${d.model}"`,
      d.sector,
      d.threatLevel,
      d.threatScore,
      d.altitude,
      d.speed,
      d.distanceKm,
      `"${d.rfBand}"`,
      d.payloadDetected ? 'YES' : 'NO',
      `"${d.sensorSource}"`,
      d.status,
      `"${d.detectedAt}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aegis_drone_detections_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddCustomDrone = (e) => {
    e.preventDefault();
    generateDroneDetection();
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#0c1424] border border-cyan-900/50 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Crosshair className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold font-mono text-cyan-200 tracking-wider uppercase">
              Drone Detection Management Database
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete tactical incursion logs, multi-sensor signatures, and live classification records.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Simulated Detection</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-800/60 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-xl bg-[#0c1424] border border-cyan-900/50 shadow-xl space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
          {/* Search */}
          <div className="relative md:col-span-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, model, or sensor..."
              className="w-full bg-[#060b14] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Threat Filter */}
          <div>
            <select
              value={threatFilter}
              onChange={(e) => setThreatFilter(e.target.value)}
              className="w-full bg-[#060b14] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">All Threat Levels</option>
              <option value="CRITICAL">Critical (Red)</option>
              <option value="HIGH">High (Orange)</option>
              <option value="MEDIUM">Medium (Yellow)</option>
              <option value="LOW">Low (Green)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#060b14] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">All Statuses</option>
              <option value="TRACKING">TRACKING</option>
              <option value="MONITORED">MONITORED</option>
              <option value="RESOLVED">RESOLVED</option>
            </select>
          </div>

          {/* Sensor Filter */}
          <div>
            <select
              value={sensorFilter}
              onChange={(e) => setSensorFilter(e.target.value)}
              className="w-full bg-[#060b14] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">All Sensor Sources</option>
              <option value="Radar">Radar Systems</option>
              <option value="RF">RF Direction Finders</option>
              <option value="Acoustic">Acoustic Arrays</option>
              <option value="Optical">Electro-Optical / Thermal</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
          <span>Showing {filteredDrones.length} of {drones.length} records</span>
          {(searchTerm || threatFilter !== 'ALL' || statusFilter !== 'ALL' || sensorFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setThreatFilter('ALL');
                setStatusFilter('ALL');
                setSensorFilter('ALL');
              }}
              className="text-cyan-400 hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Detections Data Table */}
      <div className="rounded-xl bg-[#0c1424] border border-cyan-900/50 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-[#080f1e] border-b border-cyan-900/60 text-[10px] uppercase text-cyan-300/80">
                <th className="py-3 px-3">Drone ID</th>
                <th className="py-3 px-3">Detected Time</th>
                <th className="py-3 px-3">Model / Type</th>
                <th className="py-3 px-3">Threat Level</th>
                <th className="py-3 px-3">Telemetry</th>
                <th className="py-3 px-3">Sensor Source</th>
                <th className="py-3 px-3">Payload</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredDrones.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-slate-500 font-mono">
                    No drone detections matching current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredDrones.map(drone => (
                  <tr
                    key={drone.id}
                    className="hover:bg-slate-900/50 transition-colors group cursor-pointer"
                    onClick={() => setSelectedDroneModal(drone)}
                  >
                    <td className="py-3 px-3 font-bold text-cyan-300">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        <span>{drone.id}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">{drone.sector.toUpperCase()}</div>
                    </td>

                    <td className="py-3 px-3 text-slate-400">
                      <div>{drone.detectedAt.substring(11, 19)}</div>
                      <div className="text-[10px] text-slate-500">{drone.detectedAt.substring(0, 10)}</div>
                    </td>

                    <td className="py-3 px-3 text-slate-200">
                      <div className="font-semibold">{drone.model}</div>
                      <div className="text-[10px] text-slate-400">{drone.rfBand}</div>
                    </td>

                    <td className="py-3 px-3">
                      <ThreatBadge level={drone.threatLevel} score={drone.threatScore} />
                    </td>

                    <td className="py-3 px-3 text-slate-300">
                      <div>Alt: <span className="text-amber-300 font-bold">{drone.altitude}m</span></div>
                      <div className="text-[10px] text-slate-400">
                        {drone.speed} km/h • {drone.distanceKm} km out
                      </div>
                    </td>

                    <td className="py-3 px-3 text-slate-300">
                      <div className="flex items-center gap-1">
                        <Radio className="w-3 h-3 text-cyan-400" />
                        <span>{drone.sensorSource}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">Conf: {drone.confidence}%</div>
                    </td>

                    <td className="py-3 px-3">
                      {drone.payloadDetected ? (
                        <span className="px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/60 text-[10px] font-bold">
                          PAYLOAD
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[10px]">None</span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        drone.status === 'TRACKING'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {drone.status}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedDroneModal(drone)}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-600 transition-colors"
                          title="View Diagnostic Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedDroneId(drone.id);
                            onNavigate('tracking');
                          }}
                          className="p-1 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 transition-colors"
                          title="Open Drone Tracking Path"
                        >
                          <Crosshair className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drone Details Modal */}
      <Modal
        isOpen={!!selectedDroneModal}
        onClose={() => setSelectedDroneModal(null)}
        title={`Diagnostic Telemetry: ${selectedDroneModal?.id}`}
      >
        {selectedDroneModal && (
          <div className="space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/90 border border-cyan-900/50">
              <div>
                <span className="text-lg font-bold text-cyan-300">{selectedDroneModal.id}</span>
                <p className="text-slate-400">{selectedDroneModal.model}</p>
              </div>
              <ThreatBadge level={selectedDroneModal.threatLevel} score={selectedDroneModal.threatScore} size="lg" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase">Kinematic Telemetry</span>
                <div>Latitude: <span className="text-cyan-300">{selectedDroneModal.lat}°N</span></div>
                <div>Longitude: <span className="text-cyan-300">{selectedDroneModal.lng}°E</span></div>
                <div>Altitude: <span className="text-amber-300 font-bold">{selectedDroneModal.altitude} m AGL</span></div>
                <div>Airspeed: <span className="text-slate-200">{selectedDroneModal.speed} km/h</span></div>
                <div>Heading: <span className="text-slate-200">{selectedDroneModal.heading}°</span></div>
                <div>Distance to Target: <span className="text-cyan-400 font-bold">{selectedDroneModal.distanceKm} km</span></div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase">Electronic & Sensor Data</span>
                <div>Sensor: <span className="text-slate-200">{selectedDroneModal.sensorSource}</span></div>
                <div>RF Protocol: <span className="text-slate-300">{selectedDroneModal.rfBand}</span></div>
                <div>Confidence: <span className="text-emerald-400">{selectedDroneModal.confidence}%</span></div>
                <div>Payload: <span className={selectedDroneModal.payloadDetected ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                  {selectedDroneModal.payloadDetected ? selectedDroneModal.payloadType : 'None Detected'}
                </span></div>
                <div>Detection Time: <span className="text-slate-300">{selectedDroneModal.detectedAt}</span></div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase block mb-1">Trajectory Pattern</span>
              <p className="text-slate-200">{selectedDroneModal.movementPattern}</p>
            </div>

            {/* Operator Status Override Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Update Tracking Status:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    updateDroneStatus(selectedDroneModal.id, 'TRACKING');
                    setSelectedDroneModal({ ...selectedDroneModal, status: 'TRACKING' });
                  }}
                  className="px-2.5 py-1 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-600/50 transition-colors"
                >
                  TRACKING
                </button>
                <button
                  onClick={() => {
                    updateDroneStatus(selectedDroneModal.id, 'RESOLVED');
                    setSelectedDroneModal({ ...selectedDroneModal, status: 'RESOLVED' });
                  }}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 transition-colors"
                >
                  RESOLVED
                </button>
                <button
                  onClick={() => {
                    setSelectedDroneId(selectedDroneModal.id);
                    setSelectedDroneModal(null);
                    onNavigate('tracking');
                  }}
                  className="px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-600/50 transition-colors"
                >
                  View Flight Path →
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Simulated Drone Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Simulated Drone Detection"
      >
        <form onSubmit={handleAddCustomDrone} className="space-y-4 font-mono text-xs">
          <div>
            <label className="block text-slate-400 uppercase text-[10px] mb-1">UAV Platform / Model</label>
            <select
              value={newModel}
              onChange={(e) => setNewModel(e.target.value)}
              className="w-full bg-[#060b14] border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
            >
              <option value="DJI Mavic 3 Enterprise">DJI Mavic 3 Enterprise (Quadcopter)</option>
              <option value="DJI Matrice 350 RTK">DJI Matrice 350 RTK (Heavy Enterprise)</option>
              <option value="Fixed-Wing Autonomous UAV">Fixed-Wing Autonomous UAV (Long-range)</option>
              <option value="DIY Custom Octocopter">DIY Custom Octocopter (Heavy Cargo)</option>
              <option value="Autel Dragonfish VTOL">Autel Dragonfish VTOL (Reconnaissance)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 uppercase text-[10px] mb-1">Altitude: {newAltitude}m</label>
              <input
                type="range"
                min="20"
                max="450"
                value={newAltitude}
                onChange={(e) => setNewAltitude(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>
            <div>
              <label className="block text-slate-400 uppercase text-[10px] mb-1">Speed: {newSpeed} km/h</label>
              <input
                type="range"
                min="10"
                max="150"
                value={newSpeed}
                onChange={(e) => setNewSpeed(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="payloadCheck"
              checked={newPayload}
              onChange={(e) => setNewPayload(e.target.checked)}
              className="w-4 h-4 accent-red-500 rounded"
            />
            <label htmlFor="payloadCheck" className="text-slate-300">
              Flag as Suspended Cargo / Hazardous Auxiliary Payload
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-3 py-1.5 rounded bg-slate-800 text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold"
            >
              Inject Into Simulation Engine
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
