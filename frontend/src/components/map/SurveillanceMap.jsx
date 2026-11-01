import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useAegis } from '../../context/AegisContext';
import {
  Layers,
  Crosshair,
  Maximize2,
  ShieldAlert,
  Radio,
  Eye,
  Info,
  Navigation
} from 'lucide-react';
import { ThreatBadge } from '../common/ThreatBadge';

export const SurveillanceMap = ({ height = '600px', compact = false, onSelectDrone = null }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const droneMarkersRef = useRef({});
  const zoneLayersRef = useRef([]);
  const sensorLayersRef = useRef([]);

  const {
    drones,
    zones,
    sensors,
    activeSector,
    selectedDroneId,
    setSelectedDroneId
  } = useAegis();

  // Layer Visibility Toggles
  const [showZones, setShowZones] = useState(true);
  const [showSensors, setShowSensors] = useState(true);
  const [showRadarRings, setShowRadarRings] = useState(true);
  const [selectedDroneDetails, setSelectedDroneDetails] = useState(null);

  // Sector coordinates
  const sectorCenters = {
    bengaluru: { lat: 13.1986, lng: 77.7066, zoom: 13, name: 'Bengaluru International Airport (KIA)' },
    border: { lat: 32.7266, lng: 74.8570, zoom: 12, name: 'Northern Border Perimeter Zone' },
    defence: { lat: 18.9220, lng: 72.8347, zoom: 13, name: 'Strategic Naval / Defence Facility' }
  };

  const currentSectorInfo = sectorCenters[activeSector] || sectorCenters.bengaluru;

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up any stale map instance
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch {}
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [currentSectorInfo.lat, currentSectorInfo.lng],
      zoom: currentSectorInfo.zoom,
      zoomControl: false,
      attributionControl: false
    });

    // Dark tactical CartoDB tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    // Custom zoom control in bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstanceRef.current = map;

    // Invalidate size after layout settles
    const timer = setTimeout(() => {
      try {
        if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
      } catch {}
    }, 120);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {}
        mapInstanceRef.current = null;
      }
      droneMarkersRef.current = {};
      zoneLayersRef.current = [];
      sensorLayersRef.current = [];
    };
  }, []);

  // Center on sector change
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(
        [currentSectorInfo.lat, currentSectorInfo.lng],
        currentSectorInfo.zoom,
        { duration: 1.2 }
      );
    }
  }, [activeSector]);

  // Render Zones
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Clear existing zone layers
    zoneLayersRef.current.forEach(layer => map.removeLayer(layer));
    zoneLayersRef.current = [];

    if (!showZones) return;

    const sectorZones = zones.filter(z => z.sector === activeSector);

    sectorZones.forEach(zone => {
      const radiusMeters = zone.radiusKm * 1000;
      const isCritical = zone.securityLevel === 'CRITICAL';

      const circle = L.circle(zone.center, {
        color: zone.color || (isCritical ? '#ef4444' : '#f59e0b'),
        fillColor: zone.color || (isCritical ? '#ef4444' : '#f59e0b'),
        fillOpacity: isCritical ? 0.14 : 0.08,
        weight: isCritical ? 2 : 1.5,
        dashArray: isCritical ? null : '6, 6'
      }).addTo(map);

      circle.bindTooltip(
        `<div style="font-family: monospace; font-size: 11px; font-weight: bold; color: ${zone.color};">
          ${zone.name} (${zone.radiusKm} km)
        </div>`,
        { permanent: false, direction: 'top', className: 'tactical-tooltip' }
      );

      zoneLayersRef.current.push(circle);
    });
  }, [zones, activeSector, showZones]);

  // Render Sensors
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    sensorLayersRef.current.forEach(layer => map.removeLayer(layer));
    sensorLayersRef.current = [];

    if (!showSensors) return;

    const sectorSensors = sensors.filter(s => s.sector === activeSector);

    sectorSensors.forEach(sensor => {
      // Sensor Marker
      const sensorHtml = `
        <div style="position: relative; width: 26px; height: 26px; display: flex; items-center: center; justify-content: center;">
          <div style="position: absolute; inset: 0; background: rgba(6, 182, 212, 0.2); border: 1px solid #00f0ff; border-radius: 4px; transform: rotate(45deg);"></div>
          <div style="position: relative; z-index: 2; color: #00f0ff; font-size: 11px; font-weight: bold; line-height: 26px; text-align: center; font-family: monospace;">
            ${sensor.type === '3D Radar' ? '📡' : sensor.type === 'RF Scanner' ? '📻' : sensor.type === 'Acoustic' ? '🎙️' : '📷'}
          </div>
        </div>
      `;

      const sensorIcon = L.divIcon({
        className: 'custom-sensor-icon',
        html: sensorHtml,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      const marker = L.marker(sensor.coordinates, { icon: sensorIcon }).addTo(map);
      marker.bindTooltip(
        `<div style="font-family: monospace; font-size: 11px;">
          <strong style="color: #00f0ff;">${sensor.name}</strong><br/>
          Type: ${sensor.type}<br/>
          Status: <span style="color: #10b981;">${sensor.status}</span><br/>
          Range: ${sensor.coverageKm} km
        </div>`,
        { direction: 'top' }
      );

      sensorLayersRef.current.push(marker);

      // Radar coverage ring
      if (showRadarRings && sensor.type === '3D Radar') {
        const ring = L.circle(sensor.coordinates, {
          radius: sensor.coverageKm * 1000,
          color: '#00f0ff',
          fillColor: '#00f0ff',
          fillOpacity: 0.03,
          weight: 1,
          dashArray: '3, 6'
        }).addTo(map);
        sensorLayersRef.current.push(ring);
      }
    });
  }, [sensors, activeSector, showSensors, showRadarRings]);

  // Render & Update Drones
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    const sectorDrones = drones.filter(d => d.sector === activeSector);

    // Track existing markers
    const currentMarkerIds = new Set();

    sectorDrones.forEach(drone => {
      currentMarkerIds.add(drone.id);

      const colorMap = {
        CRITICAL: '#ef4444',
        HIGH: '#f97316',
        MEDIUM: '#eab308',
        LOW: '#10b981'
      };
      const droneColor = colorMap[drone.threatLevel] || '#10b981';
      const isCritical = drone.threatLevel === 'CRITICAL';
      const isSelected = selectedDroneId === drone.id;

      // Custom Rotating Tactical Drone Marker SVG
      const markerHtml = `
        <div style="position: relative; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          ${isCritical ? `<div style="position: absolute; inset: 2px; border-radius: 50%; border: 2px solid #ef4444; animation: ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite; opacity: 0.75;"></div>` : ''}
          ${isSelected ? `<div style="position: absolute; inset: -3px; border-radius: 50%; border: 2px dashed #00f0ff; animation: spin 8s linear infinite;"></div>` : ''}
          <div style="position: absolute; inset: 6px; background: rgba(7, 14, 28, 0.9); border: 1.5px solid ${droneColor}; border-radius: 50%; box-shadow: 0 0 10px ${droneColor};"></div>
          <svg style="position: relative; z-index: 3; width: 20px; height: 20px; transform: rotate(${drone.heading}deg); transition: transform 0.4s ease;" viewBox="0 0 24 24" fill="none" stroke="${droneColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 19 21 12 17 5 21 12 2" fill="${droneColor}33" />
          </svg>
          <div style="position: absolute; bottom: -12px; font-family: monospace; font-size: 9px; font-weight: bold; color: ${droneColor}; text-shadow: 0 0 4px #000; white-space: nowrap; background: rgba(0,0,0,0.7); padding: 0 2px; border-radius: 2px;">
            ${drone.id}
          </div>
        </div>
      `;

      const droneIcon = L.divIcon({
        className: 'custom-drone-icon',
        html: markerHtml,
        iconSize: [42, 42],
        iconAnchor: [21, 21]
      });

      if (droneMarkersRef.current[drone.id]) {
        // Move existing marker smoothly
        const marker = droneMarkersRef.current[drone.id];
        marker.setLatLng([drone.lat, drone.lng]);
        marker.setIcon(droneIcon);
      } else {
        // Create new marker
        const marker = L.marker([drone.lat, drone.lng], { icon: droneIcon }).addTo(map);

        marker.on('click', () => {
          setSelectedDroneId(drone.id);
          setSelectedDroneDetails(drone);
          if (onSelectDrone) onSelectDrone(drone);
        });

        droneMarkersRef.current[drone.id] = marker;
      }
    });

    // Remove old markers
    Object.keys(droneMarkersRef.current).forEach(id => {
      if (!currentMarkerIds.has(id)) {
        map.removeLayer(droneMarkersRef.current[id]);
        delete droneMarkersRef.current[id];
      }
    });
  }, [drones, activeSector, selectedDroneId]);

  // Keep selected drone details updated
  useEffect(() => {
    if (selectedDroneId) {
      const found = drones.find(d => d.id === selectedDroneId);
      if (found) setSelectedDroneDetails(found);
    }
  }, [drones, selectedDroneId]);

  const handleCenterSector = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(
        [currentSectorInfo.lat, currentSectorInfo.lng],
        currentSectorInfo.zoom,
        { duration: 0.8 }
      );
    }
  };

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-cyan-900/50 bg-[#060b14] shadow-2xl">
      {/* Top Map HUD Bar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        {/* Sector HUD Tag */}
        <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#070e1c]/90 border border-cyan-500/40 backdrop-blur-md shadow-lg text-xs font-mono text-cyan-300">
          <Navigation className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span className="font-bold">{currentSectorInfo.name}</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">
            {drones.filter(d => d.sector === activeSector && d.status === 'TRACKING').length} Active Targets
          </span>
        </div>

        {/* Tactical Layer Controls */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-[#070e1c]/90 border border-slate-700/80 rounded-lg p-1 text-xs backdrop-blur-md shadow-lg">
          <button
            onClick={() => setShowZones(!showZones)}
            className={`px-2 py-1 rounded font-mono text-[11px] flex items-center gap-1 transition-all ${
              showZones ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-500'
            }`}
          >
            <ShieldAlert className="w-3 h-3" />
            <span>Zones</span>
          </button>
          <button
            onClick={() => setShowSensors(!showSensors)}
            className={`px-2 py-1 rounded font-mono text-[11px] flex items-center gap-1 transition-all ${
              showSensors ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-500'
            }`}
          >
            <Radio className="w-3 h-3" />
            <span>Sensors</span>
          </button>
          <button
            onClick={() => setShowRadarRings(!showRadarRings)}
            className={`px-2 py-1 rounded font-mono text-[11px] flex items-center gap-1 transition-all ${
              showRadarRings ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-500'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Coverage</span>
          </button>
          <button
            onClick={handleCenterSector}
            className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
            title="Recenter Map on Active Sector"
          >
            <Crosshair className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* Map DOM Element */}
      <div ref={mapContainerRef} style={{ height }} className="w-full z-0" />

      {/* Selected Drone Telemetry Side Drawer */}
      {selectedDroneDetails && (
        <div className="absolute top-16 right-3 bottom-3 w-80 z-20 rounded-xl bg-[#08101e]/95 border border-cyan-500/50 backdrop-blur-lg shadow-2xl p-4 overflow-y-auto text-xs animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-cyan-900/60">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="font-mono font-bold text-cyan-300 text-sm">
                {selectedDroneDetails.id}
              </span>
            </div>
            <button
              onClick={() => setSelectedDroneDetails(null)}
              className="text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded bg-slate-800"
            >
              ✕
            </button>
          </div>

          <div className="py-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">AI Threat Level</span>
              <ThreatBadge level={selectedDroneDetails.threatLevel} score={selectedDroneDetails.threatScore} size="sm" />
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Model / Type:</span>
                <span className="text-slate-200 font-semibold">{selectedDroneDetails.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Coordinates:</span>
                <span className="text-cyan-300">{selectedDroneDetails.lat.toFixed(4)}°N, {selectedDroneDetails.lng.toFixed(4)}°E</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Altitude:</span>
                <span className="text-amber-300 font-bold">{selectedDroneDetails.altitude} meters AGL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Airspeed:</span>
                <span className="text-slate-200">{selectedDroneDetails.speed} km/h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Heading:</span>
                <span className="text-slate-200">{selectedDroneDetails.heading}°</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Core Distance:</span>
                <span className="text-cyan-400 font-bold">{selectedDroneDetails.distanceKm} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">RF Protocol:</span>
                <span className="text-slate-300">{selectedDroneDetails.rfBand}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payload:</span>
                <span className={selectedDroneDetails.payloadDetected ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                  {selectedDroneDetails.payloadDetected ? 'DETECTED' : 'None Detected'}
                </span>
              </div>
              {selectedDroneDetails.payloadType && (
                <div className="text-[10px] text-amber-400/90 italic pt-0.5">
                  Pod: {selectedDroneDetails.payloadType}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Detection Source</span>
              <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                <span>{selectedDroneDetails.sensorSource}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Trajectory Note</span>
              <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                {selectedDroneDetails.movementPattern}
              </div>
            </div>

            {/* Drone status tag */}
            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="text-slate-400">Tracking Status:</span>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/50 font-mono font-bold">
                {selectedDroneDetails.status}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Map Legend */}
      <div className="absolute bottom-3 left-3 z-10 flex items-center gap-3 px-3 py-1.5 rounded-lg bg-[#070e1c]/85 border border-slate-800 backdrop-blur-md text-[10px] font-mono text-slate-300">
        <span className="text-slate-500 font-bold">LEGEND:</span>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span>Critical Threat</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-orange-500" />
          <span>High</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-yellow-500" />
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Low</span>
        </div>
        <div className="flex items-center gap-1 border-l border-slate-700 pl-2">
          <span className="w-2 h-2 rounded border border-cyan-400 bg-cyan-900/50" />
          <span>Sensor Station</span>
        </div>
      </div>
    </div>
  );
};
