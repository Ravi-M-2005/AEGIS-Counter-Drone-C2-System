import React, { useState } from 'react';
import { useAegis } from '../context/AegisContext';
import { Modal } from '../components/common/Modal';
import {
  Radio,
  Plus,
  Edit2,
  Trash2,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Signal,
  Clock
} from 'lucide-react';

export const SensorStationPage = () => {
  const { sensors, addSensor, updateSensor, deleteSensor } = useAegis();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSensor, setEditingSensor] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState('3D Radar');
  const [sector, setSector] = useState('bengaluru');
  const [locationName, setLocationName] = useState('');
  const [lat, setLat] = useState(13.2050);
  const [lng, setLng] = useState(77.7020);
  const [coverageKm, setCoverageKm] = useState(12.0);
  const [status, setStatus] = useState('ONLINE');
  const [frequency, setFrequency] = useState('9.4 GHz (X-Band)');

  const handleOpenAdd = () => {
    setEditingSensor(null);
    setName('');
    setType('3D Radar');
    setSector('bengaluru');
    setLocationName('KIA North Radar Substation');
    setLat(13.2050);
    setLng(77.7020);
    setCoverageKm(12.0);
    setStatus('ONLINE');
    setFrequency('9.4 GHz (X-Band)');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sensor) => {
    setEditingSensor(sensor);
    setName(sensor.name);
    setType(sensor.type);
    setSector(sensor.sector);
    setLocationName(sensor.locationName);
    setLat(sensor.coordinates[0]);
    setLng(sensor.coordinates[1]);
    setCoverageKm(sensor.coverageKm);
    setStatus(sensor.status);
    setFrequency(sensor.frequency || 'N/A');
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const sensorPayload = {
      name,
      type,
      sector,
      locationName,
      coordinates: [parseFloat(lat), parseFloat(lng)],
      coverageKm: parseFloat(coverageKm),
      status,
      frequency,
      snr: editingSensor ? editingSensor.snr : '36 dB',
      latencyMs: editingSensor ? editingSensor.latencyMs : 15,
      uptime: editingSensor ? editingSensor.uptime : '99.9%'
    };

    if (editingSensor) {
      updateSensor({ ...editingSensor, ...sensorPayload });
    } else {
      addSensor(sensorPayload);
    }
    setIsModalOpen(false);
  };

  const handleToggleStatus = (sensor) => {
    const nextStatus = sensor.status === 'ONLINE' ? 'OFFLINE' : 'ONLINE';
    updateSensor({ ...sensor, status: nextStatus });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#0c1424] border border-cyan-900/50 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold font-mono text-cyan-200 tracking-wider uppercase">
              Sensor Station Grid Management
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Multi-spectral C-UAS sensor suite: 3D Pulse-Doppler Radars, RF Analyzers, Acoustic Arrays, and Optical/Thermal EO/IR.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold font-mono text-xs shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Deploy Sensor Station</span>
        </button>
      </div>

      {/* Sensor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sensors.map(sensor => {
          const isOnline = sensor.status === 'ONLINE';
          const isCalibrating = sensor.status === 'CALIBRATING';

          let typeEmoji = '📡';
          if (sensor.type === 'RF Scanner') typeEmoji = '📻';
          if (sensor.type === 'Acoustic') typeEmoji = '🎙️';
          if (sensor.type === 'Camera') typeEmoji = '📷';

          return (
            <div
              key={sensor.id}
              className={`rounded-xl bg-[#0c1424] border p-4 shadow-xl transition-all font-mono text-xs ${
                isOnline ? 'border-cyan-900/50 hover:border-cyan-500/50' : 'border-red-900/50'
              }`}
            >
              <div className="flex items-start justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{typeEmoji}</span>
                  <div>
                    <span className="font-bold text-slate-200">{sensor.id}</span>
                    <div className="text-[10px] text-cyan-400 font-semibold">{sensor.type}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(sensor)}
                    className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
                    title="Edit Sensor Station"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Remove sensor station ${sensor.id}?`)) {
                        deleteSensor(sensor.id);
                      }
                    }}
                    className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                    title="Delete Sensor"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="py-3 space-y-2 text-[11px]">
                <h4 className="font-semibold text-slate-200 truncate">{sensor.name}</h4>
                <div className="flex justify-between text-slate-400">
                  <span>Location:</span>
                  <span className="text-slate-300 truncate max-w-[160px]">{sensor.locationName}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Coverage Radius:</span>
                  <span className="text-amber-300 font-bold">{sensor.coverageKm} km</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Frequency / Spec:</span>
                  <span className="text-cyan-300 truncate max-w-[150px]">{sensor.frequency}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/60 text-center">
                  <div className="p-1 rounded bg-slate-900/80">
                    <span className="text-[9px] text-slate-500 block">SNR</span>
                    <span className="font-bold text-emerald-400">{sensor.snr || '35 dB'}</span>
                  </div>
                  <div className="p-1 rounded bg-slate-900/80">
                    <span className="text-[9px] text-slate-500 block">LATENCY</span>
                    <span className="font-bold text-slate-300">{sensor.latencyMs || 12}ms</span>
                  </div>
                  <div className="p-1 rounded bg-slate-900/80">
                    <span className="text-[9px] text-slate-500 block">UPTIME</span>
                    <span className="font-bold text-cyan-400">{sensor.uptime || '99.9%'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                <button
                  onClick={() => handleToggleStatus(sensor)}
                  className={`px-2 py-0.5 rounded font-bold transition-all flex items-center gap-1 ${
                    isOnline
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-900'
                      : isCalibrating
                      ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
                      : 'bg-red-950 text-red-300 border border-red-500/50 hover:bg-red-900'
                  }`}
                  title="Click to toggle Online/Offline"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                  <span>{sensor.status}</span>
                </button>
                <span className="text-slate-500">Toggle Status ↻</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSensor ? `Edit Sensor: ${editingSensor.id}` : 'Deploy New Sensor Station'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <div>
            <label className="block text-slate-400 uppercase text-[10px] mb-1">Sensor Station Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#060b14] border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
              placeholder="e.g. West Perimeter 3D Radar Station"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 uppercase text-[10px] mb-1">Sensor Technology Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-[#060b14] border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
              >
                <option value="3D Radar">3D Pulse-Doppler Radar</option>
                <option value="RF Scanner">RF Direction Finder / Spectrum</option>
                <option value="Acoustic">Acoustic Triangulation Array</option>
                <option value="Camera">Electro-Optical / Cooled Thermal Camera</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 uppercase text-[10px] mb-1">Sector Base</label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full bg-[#060b14] border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
              >
                <option value="bengaluru">Bengaluru Airport (KIA)</option>
                <option value="border">Northern Border Perimeter</option>
                <option value="defence">Naval Defence Facility</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 uppercase text-[10px] mb-1">Physical Location Mast / Site</label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full bg-[#060b14] border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
              placeholder="e.g. Perimeter Gate 4 Mast"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 uppercase text-[10px] mb-1">Latitude</label>
              <input
                type="number"
                step="0.0001"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="w-full bg-[#060b14] border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                required
              />
            </div>
            <div>
              <label className="block text-slate-400 uppercase text-[10px] mb-1">Longitude</label>
              <input
                type="number"
                step="0.0001"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="w-full bg-[#060b14] border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                required
              />
            </div>
            <div>
              <label className="block text-slate-400 uppercase text-[10px] mb-1">Coverage (km)</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="40"
                value={coverageKm}
                onChange={(e) => setCoverageKm(e.target.value)}
                className="w-full bg-[#060b14] border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 uppercase text-[10px] mb-1">Operational Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[#060b14] border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
              >
                <option value="ONLINE">ONLINE (Scanning)</option>
                <option value="CALIBRATING">CALIBRATING</option>
                <option value="OFFLINE">OFFLINE</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 uppercase text-[10px] mb-1">Frequency / Band</label>
              <input
                type="text"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full bg-[#060b14] border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                placeholder="e.g. 9.4 GHz (X-Band)"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3 py-1.5 rounded bg-slate-800 text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold"
            >
              {editingSensor ? 'Save Changes' : 'Deploy Sensor'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
