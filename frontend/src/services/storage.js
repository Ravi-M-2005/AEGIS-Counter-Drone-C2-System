import {
  INITIAL_DRONES,
  INITIAL_ZONES,
  INITIAL_SENSORS,
  INITIAL_RESPONSE_TEAMS,
  INITIAL_INCIDENTS,
  INITIAL_ALERTS,
  INITIAL_USERS
} from '../data/initialData';

const STORAGE_KEY = 'aegis_c2_state_v1';

export const loadStoredState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.drones)) {
      parsed.drones = parsed.drones.map(d => ({
        ...d,
        simulated: d.simulated != null ? d.simulated : true,
        sensorSource: (d.sensorSource && (d.sensorSource.startsWith('SYNTHETIC') || d.sensorSource.startsWith('SIMULATION')))
          ? d.sensorSource
          : `SYNTHETIC ${d.sensorSource || 'Radar Stream'}`
      }));
    }
    return parsed;
  } catch (e) {
    console.error('Failed to load AEGIS stored state:', e);
    return null;
  }
};

export const saveStoredState = (state) => {
  try {
    const payload = {
      drones: state.drones,
      zones: state.zones,
      sensors: state.sensors,
      teams: state.teams,
      incidents: state.incidents,
      alerts: state.alerts,
      users: state.users,
      settings: state.settings,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.error('Failed to save AEGIS state to localStorage:', e);
  }
};

export const getFreshInitialState = () => ({
  drones: JSON.parse(JSON.stringify(INITIAL_DRONES)),
  zones: JSON.parse(JSON.stringify(INITIAL_ZONES)),
  sensors: JSON.parse(JSON.stringify(INITIAL_SENSORS)),
  teams: JSON.parse(JSON.stringify(INITIAL_RESPONSE_TEAMS)),
  incidents: JSON.parse(JSON.stringify(INITIAL_INCIDENTS)),
  alerts: JSON.parse(JSON.stringify(INITIAL_ALERTS)),
  users: JSON.parse(JSON.stringify(INITIAL_USERS)),
  settings: {
    simulationSpeed: 1,
    autoFrequencySec: 4,
    audioEnabled: true,
    mapTheme: 'tactical-dark',
    activeSector: 'bengaluru'
  }
});

export const clearStoredState = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear stored state:', e);
  }
};
