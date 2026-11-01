import React, { useState } from 'react';
import { useAegis } from '../context/AegisContext';
import { Modal } from '../components/common/Modal';
import {
  ShieldAlert,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const SurveillanceZonesPage = () => {
  const { zones, drones, addZone, updateZone, deleteZone } = useAegis();

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [sector, setSector] = useState('bengaluru');
  const [type, setType] = useState('Runway Exclusion');
  const [lat, setLat] = useState(13.1986);
  const [lng, setLng] = useState(77.7066);
  const [radiusKm, setRadiusKm] = useState(3.5);
  const [securityLevel, setSecurityLevel] = useState('CRITICAL');
  const [status, setStatus] = useState('ACTIVE');
  const [description, setDescription] = useState('');

  const handleOpenAdd = () => {
    setEditingZone(null);
    setName('');
    setSector('bengaluru');
    setType('Runway Exclusion');
    setLat(13.1986);
    setLng(77.7066);
    setRadiusKm(3.5);
    setSecurityLevel('CRITICAL');
    setStatus('ACTIVE');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (zone) => {
    setEditingZone(zone);
    setName(zone.name);
    setSector(zone.sector);
    setType(zone.type);
    setLat(zone.center[0]);
    setLng(zone.center[1]);
    setRadiusKm(zone.radiusKm);
    setSecurityLevel(zone.securityLevel);
    setStatus(zone.status);
    setDescription(zone.description || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const zonePayload = {
      name,
      sector,
      sectorName: sector === 'bengaluru' ? 'Bengaluru Airport (KIA)' : sector === 'border' ? 'Northern Border Zone' : 'Naval Defence Facility',
      type,
      center: [parseFloat(lat), parseFloat(lng)],
      radiusKm: parseFloat(radiusKm),
      securityLevel,
      status,
      color: securityLevel === 'CRITICAL' ? '#ef4444' : securityLevel === 'HIGH' ? '#f59e0b' : '#3b82f6',
      description
    };

    if (editingZone) {
      updateZone({ ...editingZone, ...zonePayload });
    } else {
      addZone(zonePayload);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#0c1424] border border-cyan-900/50 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold font-mono text-cyan-200 tracking-wider uppercase">
              Surveillance Zone & Geo-Fence Management
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure no-fly perimeters, approach buffer rings, and high-priority defense perimeters.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold font-mono text-xs shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Surveillance Zone</span>
        </button>
      </div>

      {/* Zones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {zones.map(zone => {
          const dronesInZone = drones.filter(d => d.zoneId === zone.id && d.status === 'TRACKING').length;
          const isCritical = zone.securityLevel === 'CRITICAL';

          return (
            <div
              key={zone.id}
              className={`rounded-xl bg-[#0c1424] border p-4 shadow-xl transition-all font-mono text-xs ${
                isCritical ? 'border-red-900/60 hover:border-red-500/60' : 'border-cyan-900/50 hover:border-cyan-600/50'
              }`}
            >
              <div className="flex items-start justify-between pb-2 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-200 text-sm">{zone.id}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      isCritical ? 'bg-red-950 text-red-300 border border-red-500/60' : 'bg-amber-950 text-amber-300 border border-amber-500/50'
                    }`}>
                      {zone.securityLevel}
                    </span>
                  </div>
                  <h4 className="font-semibold text-cyan-300 text-xs mt-1">{zone.name}</h4>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(zone)}
                    className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
                    title="Edit Zone"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete surveillance zone ${zone.id}?`)) {
                        deleteZone(zone.id);
                      }
                    }}
                    className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                    title="Delete Zone"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="py-3 space-y-2 text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Type:</span>
                  <span className="text-slate-200 font-semibold">{zone.type}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Sector:</span>
                  <span className="text-cyan-400">{zone.sectorName}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Center Coordinates:</span>
                  <span className="text-slate-200">{zone.center[0].toFixed(4)}°N, {zone.center[1].toFixed(4)}°E</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Protected Radius:</span>
                  <span className="text-amber-300 font-bold">{zone.radiusKm} km</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Active Live Drones:</span>
                  <span className={dronesInZone > 0 ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                    {dronesInZone} incursion(s)
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/60 line-clamp-2">
                  {zone.description}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                <span className="text-slate-500">Status</span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/50 font-bold">
                  {zone.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingZone ? `Edit Zone: ${editingZone.id}` : 'Add New Surveillance Zone'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <div>
            <label className="block text-slate-400 uppercase text-[10px] mb-1">Zone Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#060b14] border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
              placeholder="e.g. VIP Terminal Exclusion Zone"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 uppercase text-[10px] mb-1">Operational Sector</label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full bg-[#060b14] border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
              >
                <option value="bengaluru">Bengaluru Airport (KIA)</option>
                <option value="border">Northern Border Zone</option>
                <option value="defence">Naval Defence Facility</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 uppercase text-[10px] mb-1">Zone Category</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-[#060b14] border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
              >
                <option value="Runway Exclusion">Runway Exclusion</option>
                <option value="Approach Corridor">Approach Corridor Buffer</option>
                <option value="Critical Infrastructure">Critical Infrastructure</option>
                <option value="Border Defense">Border Defense Forward</option>
              </select>
            </div>
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
              <label className="block text-slate-400 uppercase text-[10px] mb-1">Radius (km)</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="30"
                value={radiusKm}
                onChange={(e) => setRadiusKm(e.target.value)}
                className="w-full bg-[#060b14] border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 uppercase text-[10px] mb-1">Security Level</label>
              <select
                value={securityLevel}
                onChange={(e) => setSecurityLevel(e.target.value)}
                className="w-full bg-[#060b14] border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
              >
                <option value="CRITICAL">CRITICAL (Red Alert)</option>
                <option value="HIGH">HIGH (Amber Alert)</option>
                <option value="MEDIUM">MEDIUM (Standard Defense)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 uppercase text-[10px] mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[#060b14] border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="HEIGHTENED_ALERT">HEIGHTENED ALERT</option>
                <option value="STANDBY">STANDBY</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 uppercase text-[10px] mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#060b14] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 h-20"
              placeholder="Zone operational purpose and defense perimeter notes..."
            />
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
              {editingZone ? 'Save Changes' : 'Create Zone'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
