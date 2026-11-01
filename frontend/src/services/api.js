// AEGIS Backend Integration Service
// Communicates with Spring Boot backend when online, with seamless mock fallback

// Robust API base normalization: handles base domain, with/without /api, trailing slashes
const defaultBaseUrl = import.meta.env.PROD ? 'https://aegis-backend-z8wf.onrender.com' : '/api';
const rawApiBase = (import.meta.env.VITE_API_BASE_URL || defaultBaseUrl).trim().replace(/\/+$/, '');
export const API_BASE = (rawApiBase === '' || rawApiBase === '/api')
  ? '/api'
  : (rawApiBase.endsWith('/api') ? rawApiBase : `${rawApiBase}/api`);

/**
 * Validates token structure and expiration (JWT exp claim)
 */
export const isTokenValid = (token) => {
  if (!token || typeof token !== 'string') return false;
  if (token.startsWith('demo-jwt-token-')) return true; // Simulated offline token

  const parts = token.split('.');
  if (parts.length === 3) {
    try {
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const parsed = JSON.parse(jsonPayload);
      if (parsed.exp) {
        // Expired if current time is past expiration
        if (Date.now() >= parsed.exp * 1000) {
          return false;
        }
      }
      return true;
    } catch {
      return false;
    }
  }
  return false;
};

export const aegisApi = {
  // Check backend health
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(10000)
      });
      if (res.ok) {
        const data = await res.json();
        return { isOnline: true, data };
      }
      return { isOnline: false, error: `HTTP ${res.status}` };
    } catch (err) {
      return { isOnline: false, error: err.message || 'Backend unreachable' };
    }
  },

  // Login via Spring Boot JWT Auth
  async login(username, password) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        signal: AbortSignal.timeout(15000)
      });
      if (res.ok) {
        const data = await res.json();
        return { success: true, token: data.token, role: data.role, username: data.username, source: 'backend' };
      }
      if (res.status === 401 || res.status === 400 || res.status === 403) {
        let errorMsg = 'Invalid username or password';
        try {
          const errData = await res.json();
          if (errData && errData.error) errorMsg = errData.error;
          else if (errData && errData.message) errorMsg = errData.message;
        } catch {}
        return { success: false, error: errorMsg };
      }
      return { success: false, error: `Authentication failed (HTTP ${res.status})` };
    } catch (err) {
      // Offline fallback: ONLY available when running local development with simulation explicitly enabled
      if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_SIMULATION === 'true') {
        if (
          (username === 'admin' && password === 'Admin@123') ||
          (username === 'operator1' && password === 'ChangeMe123!') ||
          (username === 'officer_sharma' && password === 'Admin@123')
        ) {
          return {
            success: true,
            token: 'demo-jwt-token-aegis-simulation-2026',
            role: username === 'admin' ? 'Administrator' : username === 'officer_sharma' ? 'Security Officer' : 'Command Center Operator',
            username,
            source: 'simulation'
          };
        }
        return { success: false, error: 'Invalid username or password (offline simulation)' };
      }

      // In production, never silently authenticate with demo credentials
      const isTimeout = err.name === 'TimeoutError' || err.name === 'AbortError';
      const msg = isTimeout
        ? 'Backend connection timed out. If the service was sleeping, please wait a moment and retry.'
        : `Unable to connect to AEGIS C2 Backend (${API_BASE}). Verify backend service is running.`;
      return { success: false, error: msg };
    }
  },

  // Fetch drones from backend with optional filters
  async getDrones(locationId = 'bengaluru', rangeKm = null, token = null, simulated = null) {
    try {
      const headers = { Accept: 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const params = new URLSearchParams();
      if (locationId && locationId !== 'all') {
        params.append('locationId', locationId);
      }
      if (rangeKm && rangeKm > 0) {
        params.append('rangeKm', String(rangeKm));
      }
      if (simulated !== null && simulated !== undefined) {
        params.append('simulated', String(simulated));
      }

      const queryString = params.toString();
      const url = `${API_BASE}/drones${queryString ? `?${queryString}` : ''}`;

      const res = await fetch(url, {
        headers,
        signal: AbortSignal.timeout(6000)
      });
      if (res.ok) {
        return { success: true, data: await res.json() };
      }
      if (res.status === 401 || res.status === 403) {
        return { success: false, unauthorized: true };
      }
      return { success: false, status: res.status };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // Fetch individual drone details by ID
  async getDroneById(id, token = null) {
    try {
      const headers = { Accept: 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/drones/${encodeURIComponent(id)}`, {
        headers,
        signal: AbortSignal.timeout(6000)
      });
      if (res.ok) {
        return { success: true, data: await res.json() };
      }
      if (res.status === 401 || res.status === 403) {
        return { success: false, unauthorized: true };
      }
      return { success: false, status: res.status };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // Fetch live detection statistics from backend
  async getDroneStats(token = null) {
    try {
      const headers = { Accept: 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/drones/stats`, {
        headers,
        signal: AbortSignal.timeout(6000)
      });
      if (res.ok) {
        return { success: true, data: await res.json() };
      }
      if (res.status === 401 || res.status === 403) {
        return { success: false, unauthorized: true };
      }
      return { success: false, status: res.status };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // Create and persist drone detection record in backend PostgreSQL
  async createDroneDetection(droneData, token = null) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/drones`, {
        method: 'POST',
        headers,
        body: JSON.stringify(droneData),
        signal: AbortSignal.timeout(8000)
      });
      if (res.ok) {
        return { success: true, data: await res.json() };
      }
      if (res.status === 401 || res.status === 403) {
        return { success: false, unauthorized: true };
      }
      let errMsg = `HTTP ${res.status}`;
      try {
        const errJson = await res.json();
        if (errJson.error) errMsg = errJson.error;
      } catch {}
      return { success: false, error: errMsg, status: res.status };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // Delete drone detection record
  async deleteDrone(id, token = null) {
    try {
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/drones/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers,
        signal: AbortSignal.timeout(6000)
      });
      if (res.ok || res.status === 204) {
        return { success: true };
      }
      if (res.status === 401 || res.status === 403) {
        return { success: false, unauthorized: true };
      }
      return { success: false, status: res.status };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // Patch drone status on backend
  async patchDroneStatus(id, status, token = null) {
    try {
      // Normalize status to backend DroneStatus enum: TRACKING, JAMMING, NEUTRALIZED, CLEARED
      let normalizedStatus = 'TRACKING';
      const upper = String(status || '').toUpperCase();
      if (upper === 'JAMMING' || upper === 'INTERCEPTING') normalizedStatus = 'JAMMING';
      else if (upper === 'NEUTRALIZED' || upper === 'INTERCEPTED' || upper === 'MITIGATED') normalizedStatus = 'NEUTRALIZED';
      else if (upper === 'CLEARED' || upper === 'RESOLVED' || upper === 'IGNORED') normalizedStatus = 'CLEARED';
      else normalizedStatus = 'TRACKING';

      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/drones/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: normalizedStatus }),
        signal: AbortSignal.timeout(2500)
      });
      if (res.ok) {
        return { success: true, data: await res.json() };
      }
      if (res.status === 401 || res.status === 403) {
        return { success: false, unauthorized: true };
      }
    } catch {
      // Handled in local state
    }
    return { success: false };
  },

  // Record sighting on backend
  async recordSighting(droneId, threatScore, token = null) {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/sightings`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ droneId, threatScore }),
        signal: AbortSignal.timeout(2500)
      });
      if (res.ok) {
        return { success: true, data: await res.json() };
      }
      if (res.status === 401 || res.status === 403) {
        return { success: false, unauthorized: true };
      }
    } catch {}
    return { success: false };
  },

  // Get recent response events on backend
  async getResponseEvents(locationId = 'bengaluru', token = null) {
    try {
      const headers = { Accept: 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/response-events?locationId=${locationId}`, {
        headers,
        signal: AbortSignal.timeout(2500)
      });
      if (res.ok) {
        return { success: true, data: await res.json() };
      }
      if (res.status === 401 || res.status === 403) {
        return { success: false, unauthorized: true };
      }
    } catch {}
    return { success: false };
  },

  // Trigger auto response on backend
  async toggleAutoResponse(locationId, enabled, token = null) {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/auto-response`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ locationId, enabled }),
        signal: AbortSignal.timeout(2500)
      });
      if (res.ok) {
        return { success: true, data: await res.json() };
      }
      if (res.status === 401 || res.status === 403) {
        return { success: false, unauthorized: true };
      }
    } catch {}
    return { success: false };
  }
};
