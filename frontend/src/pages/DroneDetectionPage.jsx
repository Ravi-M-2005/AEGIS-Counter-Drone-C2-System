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
  RefreshCw,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';

export const DroneDetectionPage = ({ onNavigate }) => {
  const {
    drones,
    sensors,
    zones,
    activeSector,
    updateDroneStatus,
    generateDroneDetection,
    setSelectedDroneId,
    backendStatus,
    backendStats,
    isDetectionsLoading,
    refreshDetections,
    deleteDroneDetection
  } = useAegis();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [threatFilter, setThreatFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sensorFilter, setSensorFilter] = useState('ALL');
  const [modeFilter, setModeFilter] = useState('ALL'); // 'ALL', 'LIVE_ONLY', 'SIMULATED_ONLY'

  // Modals & form state
  const [selectedDroneModal, setSelectedDroneModal] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      let matchMode = true;
      if (modeFilter === 'LIVE_ONLY') matchMode = !drone.simulated;
      else if (modeFilter === 'SIMULATED_ONLY') matchMode = !!drone.simulated;

      return matchSearch && matchThreat && matchStatus && matchSensor && matchMode;
    });
  }, [drones, searchTerm, threatFilter, statusFilter, sensorFilter, modeFilter]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Drone ID',
      'Model',
      'Sector',
      'Mode',
      'Threat Level',
      'Threat Score',
      'Altitude (m)',
      'Speed (km/h)',
      'Distance (km)',
      'Latitude',
      'Longitude',
      'RF Band',
      'Payload Detected',
      'Sensor Source',
      'Status',
      'Detected At'
    ];
    const rows = filteredDrones.map(d => [
      d.id,
      `"${d.model}"`,
      d.sector,
      d.simulated ? 'SIMULATED' : 'LIVE SENSOR',
      d.threatLevel,
      d.threatScore,
      d.altitude,
      d.speed,
      d.distanceKm,
      d.lat,
      d.lng,
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

  const handleAddCustomDrone = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await generateDroneDetection(null, {
      model: newModel,
      altitude: newAltitude,
      speed: newSpeed,
      distanceKm: newDistance,
      sensorSource: newSensor,
      payloadDetected: newPayload
    });
    setIsSubmitting(false);
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Sensor Hardware State Disclosure Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-gradient-to-r from-[#071325] via-[#09172e] to-[#0a1526] border border-cyan-800/40 shadow-lg text-xs font-mono">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-cyan-200 uppercase tracking-wider">
                Counter-UAS Detection Module: Synthetic & Emulated Telemetry
              </span>
              <span className="px-2 py-0.2 rounded text-[10px] bg-amber-950 text-amber-300 border border-amber-600/50">
                Hardware: Disconnected
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Physical radar & RF hardware not connected. Operating via synthetic sensor telemetry feeds synchronized directly with Spring Boot & PostgreSQL.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-slate-400 border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-4">
          <div>
            Simulated / Synthetic: <strong className="text-amber-300">{backendStats?.simulatedDrones ?? drones.filter(d => d.simulated).length}</strong>
          </div>
          <div>
            Live Hardware Feeds: <strong className="text-slate-400">{backendStats?.liveDrones ?? 0}</strong>
          </div>
          <div>
            Active Tracking: <strong className="text-emerald-300">{backendStats?.activeDrones ?? drones.filter(d => d.status === 'TRACKING').length}</strong>
          </div>
        </div>
      </div>

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

        <div className="flex items-center flex-wrap gap-2 font-mono text-xs">
          <button
            onClick={refreshDetections}
            disabled={isDetectionsLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-800/60 transition-all cursor-pointer disabled:opacity-50"
            title="Fetch latest detections from Spring Boot backend"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isDetectionsLoading ? 'animate-spin text-cyan-400' : ''}`} />
            <span>{isDetectionsLoading ? 'Syncing...' : 'Refresh Feed'}</span>
          </button>

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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs font-mono">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, model, or sensor..."
              className="w-full bg-[#060b14] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Telemetry Stream Mode Filter */}
          <div>
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="w-full bg-[#060b14] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">All Sources (Synthetic + Live)</option>
              <option value="SIMULATED_ONLY">Synthetic Only</option>
              <option value="LIVE_ONLY">Live Hardware Only (0)</option>
            </select>
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
              <option value="JAMMING">JAMMING</option>
              <option value="NEUTRALIZED">NEUTRALIZED</option>
              <option value="CLEARED">CLEARED</option>
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
              <option value="Simulated">Simulated Generators</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
          <span>Showing {filteredDrones.length} of {drones.length} records</span>
          {(searchTerm || threatFilter !== 'ALL' || statusFilter !== 'ALL' || sensorFilter !== 'ALL' || modeFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setThreatFilter('ALL');
                setStatusFilter('ALL');
                setSensorFilter('ALL');
                setModeFilter('ALL');
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
                <th className="py-3 px-3">Drone ID / Sector</th>
                <th className="py-3 px-3">Source & Mode</th>
                <th className="py-3 px-3">Detected Time</th>
                <th className="py-3 px-3">Model / Protocol</th>
                <th className="py-3 px-3">Threat Level</th>
                <th className="py-3 px-3">Kinematics & Coordinates</th>
                <th className="py-3 px-3">Payload</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {isDetectionsLoading && filteredDrones.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-10 text-cyan-400 font-mono">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                      <span>Synchronizing live detections from Spring Boot...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredDrones.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-10 text-slate-500 font-mono">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-6 h-6 text-slate-600" />
                      <span>No drone detections matching current filter criteria.</span>
                    </div>
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
                        <span className={`w-1.5 h-1.5 rounded-full ${drone.simulated ? 'bg-amber-400' : 'bg-cyan-400'}`} />
                        <span>{drone.id}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">{drone.sector ? drone.sector.toUpperCase() : 'BENGALURU'}</div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        {drone.simulated ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-950/80 text-amber-300 border border-amber-500/50">
                            SYNTHETIC
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/50">
                            LIVE HARDWARE
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[130px] mt-0.5">
                        {drone.sensorSource}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-slate-400">
                      <div>{drone.detectedAt ? drone.detectedAt.substring(11, 19) : '--:--:--'}</div>
                      <div className="text-[10px] text-slate-500">{drone.detectedAt ? drone.detectedAt.substring(0, 10) : ''}</div>
                    </td>

                    <td className="py-3 px-3 text-slate-200">
                      <div className="font-semibold">{drone.model}</div>
                      <div className="text-[10px] text-slate-400">{drone.rfBand}</div>
                    </td>

                    <td className="py-3 px-3">
                      <ThreatBadge level={drone.threatLevel} score={drone.threatScore} />
                    </td>

                    <td className="py-3 px-3 text-slate-300">
                      <div>
                        Alt: <span className="text-amber-300 font-bold">{drone.altitude}m</span> • {drone.speed} km/h
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {drone.lat != null ? `${drone.lat.toFixed(4)}°N` : '0.0000°N'}, {drone.lng != null ? `${drone.lng.toFixed(4)}°E` : '0.0000°E'} ({drone.distanceKm} km out)
                      </div>
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
                          : drone.status === 'JAMMING'
                          ? 'bg-purple-950 text-purple-300 border border-purple-500/40'
                          : drone.status === 'NEUTRALIZED'
                          ? 'bg-red-950 text-red-300 border border-red-500/40'
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
                        <button
                          onClick={() => deleteDroneDetection(drone.id)}
                          className="p-1 rounded bg-slate-900 hover:bg-red-950 text-slate-500 hover:text-red-400 border border-slate-700 hover:border-red-600/50 transition-colors"
                          title="Delete Drone Detection"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-cyan-300">{selectedDroneModal.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    selectedDroneModal.simulated
                      ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                  }`}>
                    {selectedDroneModal.simulated ? 'SYNTHETIC INGESTION' : 'LIVE HARDWARE SENSOR'}
                  </span>
                </div>
                <p className="text-slate-400">{selectedDroneModal.model}</p>
              </div>
              <ThreatBadge level={selectedDroneModal.threatLevel} score={selectedDroneModal.threatScore} size="lg" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase">Kinematic Telemetry</span>
                <div>Latitude: <span className="text-cyan-300">{selectedDroneModal.lat != null ? selectedDroneModal.lat.toFixed(6) : '0.000000'}°N</span></div>
                <div>Longitude: <span className="text-cyan-300">{selectedDroneModal.lng != null ? selectedDroneModal.lng.toFixed(6) : '0.000000'}°E</span></div>
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
                    updateDroneStatus(selectedDroneModal.id, 'JAMMING');
                    setSelectedDroneModal({ ...selectedDroneModal, status: 'JAMMING' });
                  }}
                  className="px-2.5 py-1 rounded bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-600/50 transition-colors"
                >
                  JAMMING
                </button>
                <button
                  onClick={() => {
                    updateDroneStatus(selectedDroneModal.id, 'NEUTRALIZED');
                    setSelectedDroneModal({ ...selectedDroneModal, status: 'NEUTRALIZED' });
                  }}
                  className="px-2.5 py-1 rounded bg-red-950 hover:bg-red-900 text-red-300 border border-red-600/50 transition-colors"
                >
                  NEUTRALIZED
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
              <option value="Sky-Knight Micro-UAV">Sky-Knight Micro-UAV (Tactical Infiltration)</option>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 uppercase text-[10px] mb-1">Distance: {newDistance} km</label>
              <input
                type="range"
                min="0.3"
                max="8.0"
                step="0.1"
                value={newDistance}
                onChange={(e) => setNewDistance(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>
            <div>
              <label className="block text-slate-400 uppercase text-[10px] mb-1">Sensor Ingestion Source</label>
              <select
                value={newSensor}
                onChange={(e) => setNewSensor(e.target.value)}
                className="w-full bg-[#060b14] border border-slate-700 rounded-lg px-2 py-1.5 text-slate-200"
              >
                <option value="AESA 3D Radar Alpha">AESA 3D Radar Alpha</option>
                <option value="RF Direction Finder 01">RF Direction Finder 01</option>
                <option value="Acoustic Array Perimeter">Acoustic Array Perimeter</option>
                <option value="Simulated Incursion Generator">Simulated Incursion Generator</option>
              </select>
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
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold disabled:opacity-50"
            >
              {isSubmitting ? 'Persisting to Database...' : 'Persist Incursion Record'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
