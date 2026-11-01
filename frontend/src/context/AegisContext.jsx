import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { loadStoredState, saveStoredState, getFreshInitialState, clearStoredState } from '../services/storage';
import { evaluateDroneThreat } from '../services/aiThreatEngine';
import { tacticalAudio } from '../services/audio';
import { aegisApi, isTokenValid } from '../services/api';

const AegisContext = createContext(null);

export const AegisProvider = ({ children }) => {
  // Initialize state from localStorage or initial dataset
  const [state, setState] = useState(() => {
    const stored = loadStoredState();
    return stored || getFreshInitialState();
  });

  // Current authenticated user (persisted in localStorage, null if unauthenticated or expired)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('aegis_auth_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.token && isTokenValid(parsed.token)) {
          return parsed;
        }
        localStorage.removeItem('aegis_auth_user');
      }
    } catch {
      localStorage.removeItem('aegis_auth_user');
    }
    return null;
  });

  // Simulation running state
  const [isSimulating, setIsSimulating] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1); // 0.5x, 1x, 2x, 5x
  const [activeSector, setActiveSector] = useState('bengaluru'); // 'bengaluru', 'border', 'defence'
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [backendStatus, setBackendStatus] = useState({ isOnline: false, checked: false, detail: 'Checking...' });
  const [selectedDroneId, setSelectedDroneId] = useState(null);

  tacticalAudio.enabled = audioEnabled;

  // Monitor token expiration and log out automatically when token expires
  useEffect(() => {
    if (!currentUser) return;
    const checkToken = () => {
      if (currentUser.token && !isTokenValid(currentUser.token)) {
        logoutUser();
      }
    };
    checkToken();
    const timer = setInterval(checkToken, 10000);
    return () => clearInterval(timer);
  }, [currentUser]);

  // Save state to localStorage whenever drones/alerts/incidents/zones/sensors change
  useEffect(() => {
    saveStoredState(state);
  }, [state]);

  // Check Spring Boot backend health
  useEffect(() => {
    const checkBackend = async () => {
      const res = await aegisApi.checkHealth();
      setBackendStatus({
        isOnline: res.isOnline,
        checked: true,
        detail: res.isOnline ? 'Spring Boot Active' : 'Standalone Simulation Mode'
      });
    };
    checkBackend();
    const timer = setInterval(checkBackend, 15000);
    return () => clearInterval(timer);
  }, []);

  // Sector coordinates for mapping backend polar coordinates
  const SECTOR_COORDS = {
    bengaluru: { lat: 13.1986, lng: 77.7066 },
    border: { lat: 32.7266, lng: 74.8570 },
    defence: { lat: 18.9220, lng: 72.8347 }
  };

  const convertBackendDrone = (bd, sectorName) => {
    const sec = (bd.locationId || sectorName || 'bengaluru').toLowerCase();
    const center = SECTOR_COORDS[sec] || SECTOR_COORDS.bengaluru;
    const rad = ((bd.angle || 0) * Math.PI) / 180;
    const dist = bd.distanceKm != null ? bd.distanceKm : 1.2;
    const lat = parseFloat((center.lat + (dist / 111.0) * Math.cos(rad)).toFixed(6));
    const lng = parseFloat((center.lng + (dist / (111.0 * Math.cos((center.lat * Math.PI) / 180))) * Math.sin(rad)).toFixed(6));

    const threat = evaluateDroneThreat({
      distanceKm: dist,
      altitudeM: bd.altitudeMeters || 100,
      speedKmh: bd.speed || 35,
      payloadDetected: !!bd.payloadDetected,
      rfBand: bd.rfBand || '2.4 GHz'
    });

    return {
      id: bd.id,
      model: bd.type || 'Fixed-wing UAV',
      sector: sec,
      lat,
      lng,
      heading: Math.round(bd.angle || 0),
      altitude: Math.round(bd.altitudeMeters || 100),
      speed: Math.round(bd.speed || 35),
      distanceKm: parseFloat(dist.toFixed(2)),
      confidence: bd.confidence || 85,
      rfBand: bd.rfBand || '2.4 GHz',
      payloadDetected: !!bd.payloadDetected,
      payloadType: bd.payloadDetected ? 'Auxiliary Optical / Drop Pod' : 'None',
      threatLevel: threat.threatLevel,
      threatScore: threat.threatScore,
      threatFactors: threat.factors,
      recommendedAction: threat.recommendedAction,
      status: bd.status || 'TRACKING',
      sensorSource: 'AESA 3D Radar Alpha (Live Backend)',
      movementPattern: (bd.speed || 0) > 60 ? 'High-Velocity Approach Vector' : 'Inbound Hover / Reconnaissance',
      lastSeen: bd.updatedAt || new Date().toISOString(),
      history: [{ lat, lng, time: 'Live', alt: Math.round(bd.altitudeMeters || 100), spd: Math.round(bd.speed || 35) }]
    };
  };

  // Sync drones with backend if backend is available
  useEffect(() => {
    if (backendStatus.isOnline && currentUser?.token) {
      aegisApi.getDrones(activeSector, 50.0, currentUser.token).then(res => {
        if (res.unauthorized) {
          logoutUser();
          return;
        }
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const backendMapped = res.data.map(bd => convertBackendDrone(bd, activeSector));
          setState(prev => {
            const backendIds = new Set(backendMapped.map(d => d.id));
            const otherDrones = prev.drones.filter(d => d.sector !== activeSector && !backendIds.has(d.id));
            const newSimIncursions = prev.drones.filter(d => d.sector === activeSector && d.id.startsWith('DRN-') && !backendIds.has(d.id));
            return {
              ...prev,
              drones: [...backendMapped, ...newSimIncursions, ...otherDrones]
            };
          });
        }
      });
    }
  }, [backendStatus.isOnline, activeSector, currentUser]);

  // Main Simulation Loop
  useEffect(() => {
    if (!isSimulating) return;

    const intervalMs = Math.max(1000, 3500 / simulationSpeed);

    const interval = setInterval(() => {
      setState(prev => {
        const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

        // 1. Move active tracking drones
        const updatedDrones = prev.drones.map(drone => {
          if (drone.status !== 'TRACKING') return drone;

          // Convert heading to radians
          const rad = (drone.heading * Math.PI) / 180;
          // Scale movement step (speed in km/h converted to degrees roughly)
          const stepKm = (drone.speed / 3600) * 3.5;
          const dLat = (stepKm / 111) * Math.cos(rad);
          const dLng = (stepKm / (111 * Math.cos((drone.lat * Math.PI) / 180))) * Math.sin(rad);

          const newLat = parseFloat((drone.lat + dLat).toFixed(6));
          const newLng = parseFloat((drone.lng + dLng).toFixed(6));

          // Compute new distance to primary sector center (Bengaluru: 13.1986, 77.7066)
          const centerLat = drone.sector === 'border' ? 32.7266 : drone.sector === 'defence' ? 18.9220 : 13.1986;
          const centerLng = drone.sector === 'border' ? 74.8570 : drone.sector === 'defence' ? 72.8347 : 77.7066;

          const distKm = Math.sqrt(
            Math.pow((newLat - centerLat) * 111, 2) +
            Math.pow((newLng - centerLng) * 111 * Math.cos((centerLat * Math.PI) / 180), 2)
          );

          // Altitude and Speed slight variations
          const dAlt = (Math.random() - 0.5) * 4;
          const newAlt = Math.max(20, Math.min(500, Math.round(drone.altitude + dAlt)));
          const dSpd = (Math.random() - 0.5) * 2;
          const newSpd = Math.max(15, Math.min(160, Math.round(drone.speed + dSpd)));

          // Heading turn jitter
          const dHeading = (Math.random() - 0.5) * 6;
          const newHeading = Math.round((drone.heading + dHeading + 360) % 360);

          // Re-evaluate threat level
          const evalResult = evaluateDroneThreat({
            distanceKm: distKm,
            altitudeM: newAlt,
            speedKmh: newSpd,
            payloadDetected: drone.payloadDetected,
            rfBand: drone.rfBand,
            zoneSecurity: drone.threatLevel === 'CRITICAL' ? 'CRITICAL' : 'HIGH'
          });

          // History trace
          const currentHist = drone.history || [];
          const updatedHist = [
            ...currentHist.slice(-15),
            {
              lat: newLat,
              lng: newLng,
              time: nowStr.substring(11, 19),
              alt: newAlt,
              spd: newSpd
            }
          ];

          return {
            ...drone,
            lat: newLat,
            lng: newLng,
            heading: newHeading,
            altitude: newAlt,
            speed: newSpd,
            distanceKm: parseFloat(distKm.toFixed(2)),
            threatScore: evalResult.threatScore,
            threatLevel: evalResult.threatLevel,
            history: updatedHist
          };
        });

        // 2. Play subtle radar ping if active
        if (Math.random() > 0.4) {
          tacticalAudio.playRadarPing();
        }

        return {
          ...prev,
          drones: updatedDrones
        };
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isSimulating, simulationSpeed]);

  // Actions
  const toggleSimulation = () => {
    setIsSimulating(prev => !prev);
  };

  const setSimSpeed = (speed) => {
    setSimulationSpeed(speed);
  };

  // Generate a new simulated drone detection
  const generateDroneDetection = (forcedThreat = null) => {
    tacticalAudio.playRadarPing();
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const count = state.drones.length + 1;
    const droneId = `DRN-${activeSector.toUpperCase().substring(0, 3)}-${String(count).padStart(2, '0')}`;

    // Base coordinate around active sector
    let baseLat = 13.1986;
    let baseLng = 77.7066;
    if (activeSector === 'border') {
      baseLat = 32.7266;
      baseLng = 74.8570;
    } else if (activeSector === 'defence') {
      baseLat = 18.9220;
      baseLng = 72.8347;
    }

    const angle = Math.random() * 2 * Math.PI;
    const distanceKm = forcedThreat === 'CRITICAL' ? (0.4 + Math.random() * 0.8) : (1.5 + Math.random() * 4.5);
    const dLat = (distanceKm / 111) * Math.cos(angle);
    const dLng = (distanceKm / (111 * Math.cos((baseLat * Math.PI) / 180))) * Math.sin(angle);

    const lat = parseFloat((baseLat + dLat).toFixed(6));
    const lng = parseFloat((baseLng + dLng).toFixed(6));
    const altitude = forcedThreat === 'CRITICAL' ? Math.floor(35 + Math.random() * 30) : Math.floor(60 + Math.random() * 180);
    const speed = forcedThreat === 'CRITICAL' ? Math.floor(80 + Math.random() * 50) : Math.floor(30 + Math.random() * 45);
    const hasPayload = forcedThreat === 'CRITICAL' ? true : Math.random() > 0.6;
    const rfBands = ['2.4 GHz OccuSync', '5.8 GHz FHSS', '433 MHz LoRa', '915 MHz Telemetry', 'Encrypted Military Link'];
    const models = ['DJI Matrice 350', 'Autel EVO Max 4T', 'Sky-Knight Micro-UAV', 'Fixed-Wing Scout VTOL', 'Heavy Cargo Quad'];
    const sensors = state.sensors.filter(s => s.sector === activeSector && s.status === 'ONLINE');
    const sensorSource = sensors.length > 0 ? sensors[Math.floor(Math.random() * sensors.length)].name : 'AESA 3D Radar Alpha';

    const rfBand = rfBands[Math.floor(Math.random() * rfBands.length)];
    const model = models[Math.floor(Math.random() * models.length)];

    const evalResult = evaluateDroneThreat({
      distanceKm,
      altitudeM: altitude,
      speedKmh: speed,
      payloadDetected: hasPayload,
      rfBand,
      zoneSecurity: 'CRITICAL'
    });

    const threatLevel = forcedThreat || evalResult.threatLevel;
    const threatScore = forcedThreat === 'CRITICAL' ? Math.max(90, evalResult.threatScore) : evalResult.threatScore;

    const newDrone = {
      id: droneId,
      model,
      sector: activeSector,
      lat,
      lng,
      heading: Math.floor(Math.random() * 360),
      altitude,
      speed,
      distanceKm: parseFloat(distanceKm.toFixed(2)),
      rfBand,
      payloadDetected: hasPayload,
      payloadType: hasPayload ? 'Suspended Cargo / Optical Pod' : 'None',
      threatLevel,
      threatScore,
      confidence: Math.floor(88 + Math.random() * 11),
      sensorSource,
      status: 'TRACKING',
      zoneId: state.zones.find(z => z.sector === activeSector)?.id || null,
      detectedAt: nowStr,
      movementPattern: forcedThreat === 'CRITICAL' ? 'Direct High-Speed Vector to Target' : 'Surveying Inbound Flight Path',
      history: [{ lat, lng, time: nowStr.substring(11, 19), alt: altitude, spd: speed }]
    };

    // Generate Alert
    const newAlert = {
      id: `ALT-2026-${String(state.alerts.length + 90).padStart(4, '0')}`,
      timestamp: nowStr,
      droneId,
      severity: threatLevel,
      category: threatLevel === 'CRITICAL' ? 'Critical Infrastructure Threat' : 'Unauthorized Drone Detection',
      message: `${model} detected ${distanceKm.toFixed(2)} km out (Alt: ${altitude}m, Spd: ${speed} km/h). Threat score: ${threatScore}/100.`,
      sensorId: sensors[0]?.id || 'SEN-RDR-01',
      zoneId: newDrone.zoneId,
      acknowledged: false,
      acknowledgedBy: null
    };

    // If critical, generate Incident and sound alarm
    let newIncident = null;
    if (threatLevel === 'CRITICAL') {
      tacticalAudio.playCriticalAlarm();
      newIncident = {
        id: `INC-2026-${String(state.incidents.length + 44).padStart(4, '0')}`,
        droneId,
        sector: activeSector,
        zoneId: newDrone.zoneId,
        zoneName: state.zones.find(z => z.id === newDrone.zoneId)?.name || 'Restricted Sector',
        threatLevel: 'CRITICAL',
        status: 'OPEN',
        assignedTeamId: null,
        assignedTeamName: 'Unassigned',
        incidentTime: nowStr,
        reportedBy: `AI Auto-Detector (${sensorSource})`,
        summary: `Automated incident created: ${model} breached security perimeter at ${altitude}m altitude with ${hasPayload ? 'active payload' : 'high speed'}.`,
        actionTaken: 'Awaiting team assignment. Security dispatch required.',
        resolutionNotes: null,
        closedAt: null
      };
    }

    setState(prev => ({
      ...prev,
      drones: [newDrone, ...prev.drones],
      alerts: [newAlert, ...prev.alerts],
      incidents: newIncident ? [newIncident, ...prev.incidents] : prev.incidents
    }));

    setSelectedDroneId(droneId);
  };

  // Generate Critical Threat
  const generateCriticalThreat = () => {
    generateDroneDetection('CRITICAL');
  };

  // Reset to initial demo data
  const resetDemoData = () => {
    clearStoredState();
    const fresh = getFreshInitialState();
    setState(fresh);
    tacticalAudio.playClick();
  };

  // Drone status update (Tracking, Mitigated, Ignored, Resolved)
  const updateDroneStatus = (droneId, status) => {
    setState(prev => ({
      ...prev,
      drones: prev.drones.map(d => d.id === droneId ? { ...d, status } : d)
    }));
    // Also notify backend if online
    if (backendStatus.isOnline) {
      aegisApi.patchDroneStatus(droneId, status, currentUser?.token);
    }
  };

  // Zone actions
  const addZone = (zoneData) => {
    const id = `ZONE-${activeSector.toUpperCase().substring(0, 3)}-${String(state.zones.length + 1).padStart(2, '0')}`;
    const newZone = { ...zoneData, id };
    setState(prev => ({ ...prev, zones: [...prev.zones, newZone] }));
    return newZone;
  };

  const updateZone = (updatedZone) => {
    setState(prev => ({
      ...prev,
      zones: prev.zones.map(z => z.id === updatedZone.id ? updatedZone : z)
    }));
  };

  const deleteZone = (zoneId) => {
    setState(prev => ({
      ...prev,
      zones: prev.zones.filter(z => z.id !== zoneId)
    }));
  };

  // Sensor actions
  const addSensor = (sensorData) => {
    const id = `SEN-${sensorData.type.substring(0, 3).toUpperCase()}-${String(state.sensors.length + 1).padStart(2, '0')}`;
    const newSensor = { ...sensorData, id };
    setState(prev => ({ ...prev, sensors: [...prev.sensors, newSensor] }));
    return newSensor;
  };

  const updateSensor = (updatedSensor) => {
    setState(prev => ({
      ...prev,
      sensors: prev.sensors.map(s => s.id === updatedSensor.id ? updatedSensor : s)
    }));
  };

  const deleteSensor = (sensorId) => {
    setState(prev => ({
      ...prev,
      sensors: prev.sensors.filter(s => s.id !== sensorId)
    }));
  };

  // Incident actions
  const openIncident = (incidentData) => {
    const id = `INC-2026-${String(state.incidents.length + 45).padStart(4, '0')}`;
    const newIncident = {
      ...incidentData,
      id,
      incidentTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'OPEN',
      resolutionNotes: null,
      closedAt: null
    };
    setState(prev => ({ ...prev, incidents: [newIncident, ...prev.incidents] }));
    return newIncident;
  };

  const assignIncidentTeam = (incidentId, teamId) => {
    const team = state.teams.find(t => t.id === teamId);
    setState(prev => ({
      ...prev,
      incidents: prev.incidents.map(inc => inc.id === incidentId ? {
        ...inc,
        assignedTeamId: teamId,
        assignedTeamName: team ? team.name : teamId,
        status: inc.status === 'OPEN' ? 'ASSIGNED' : inc.status,
        actionTaken: `Assigned to ${team ? team.name : teamId} at ${new Date().toLocaleTimeString()}`
      } : inc),
      teams: prev.teams.map(t => t.id === teamId ? {
        ...t,
        status: 'DEPLOYED',
        assignedIncident: incidentId,
        deploymentTime: 'Just now'
      } : t)
    }));
  };

  const updateIncidentStatus = (incidentId, status, resolutionNotes = '') => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setState(prev => ({
      ...prev,
      incidents: prev.incidents.map(inc => {
        if (inc.id === incidentId) {
          const isClosed = status === 'RESOLVED' || status === 'CLOSED';
          return {
            ...inc,
            status,
            resolutionNotes: resolutionNotes || inc.resolutionNotes,
            closedAt: isClosed ? now : inc.closedAt
          };
        }
        return inc;
      })
    }));
  };

  // Alert actions
  const acknowledgeAlert = (alertId) => {
    tacticalAudio.playClick();
    setState(prev => ({
      ...prev,
      alerts: prev.alerts.map(a => a.id === alertId ? {
        ...a,
        acknowledged: true,
        acknowledgedBy: currentUser?.username || 'admin'
      } : a)
    }));
  };

  const acknowledgeAllAlerts = () => {
    tacticalAudio.playClick();
    setState(prev => ({
      ...prev,
      alerts: prev.alerts.map(a => ({
        ...a,
        acknowledged: true,
        acknowledgedBy: currentUser?.username || 'admin'
      }))
    }));
  };

  // User actions
  const loginUser = (userObj) => {
    setCurrentUser(userObj);
    localStorage.setItem('aegis_auth_user', JSON.stringify(userObj));
  };

  const logoutUser = () => {
    setCurrentUser(null);
    localStorage.removeItem('aegis_auth_user');
  };

  const addUser = (userData) => {
    const id = `USR-${String(state.users.length + 1).padStart(3, '0')}`;
    const newUser = { ...userData, id };
    setState(prev => ({ ...prev, users: [...prev.users, newUser] }));
    return newUser;
  };

  const updateUser = (updatedUser) => {
    setState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === updatedUser.id ? updatedUser : u)
    }));
  };

  const deleteUser = (userId) => {
    setState(prev => ({
      ...prev,
      users: prev.users.filter(u => u.id !== userId)
    }));
  };

  // Team actions
  const updateTeam = (updatedTeam) => {
    setState(prev => ({
      ...prev,
      teams: prev.teams.map(t => t.id === updatedTeam.id ? updatedTeam : t)
    }));
  };

  return (
    <AegisContext.Provider
      value={{
        // State
        drones: state.drones,
        zones: state.zones,
        sensors: state.sensors,
        teams: state.teams,
        incidents: state.incidents,
        alerts: state.alerts,
        users: state.users,
        settings: state.settings,
        currentUser,
        isSimulating,
        simulationSpeed,
        activeSector,
        audioEnabled,
        backendStatus,
        selectedDroneId,

        // Setters
        setSelectedDroneId,
        setActiveSector,
        setAudioEnabled,
        setSimSpeed,

        // Actions
        toggleSimulation,
        generateDroneDetection,
        generateCriticalThreat,
        resetDemoData,
        updateDroneStatus,
        addZone,
        updateZone,
        deleteZone,
        addSensor,
        updateSensor,
        deleteSensor,
        openIncident,
        assignIncidentTeam,
        updateIncidentStatus,
        acknowledgeAlert,
        acknowledgeAllAlerts,
        loginUser,
        logoutUser,
        addUser,
        updateUser,
        deleteUser,
        updateTeam
      }}
    >
      {children}
    </AegisContext.Provider>
  );
};

export const useAegis = () => {
  const context = useContext(AegisContext);
  if (!context) {
    throw new Error('useAegis must be used within an AegisProvider');
  }
  return context;
};
