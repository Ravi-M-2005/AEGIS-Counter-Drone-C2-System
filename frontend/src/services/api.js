// AEGIS Backend Integration Service
// Communicates with Spring Boot backend when online, with seamless mock fallback

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

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
        signal: AbortSignal.timeout(2000)
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
        signal: AbortSignal.timeout(3500)
      });
      if (res.ok) {
        const data = await res.json();
        return { success: true, token: data.token, role: data.role, username: data.username, source: 'backend' };
      }
      if (res.status === 401 || res.status === 400 || res.status === 403) {
        let errorMsg = 'Invalid username or password (rejected by security backend)';
        try {
          const errData = await res.json();
          if (errData && errData.error) errorMsg = errData.error;
        } catch {}
        return { success: false, error: errorMsg };
      }
      return { success: false, error: `Authentication failed (HTTP ${res.status})` };
    } catch {
      // Backend is offline / unreachable; validate strictly against demo credentials
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
  },

  // Fetch drones from backend if available
  async getDrones(locationId = 'bengaluru', rangeKm = 10.0, token = null) {
    try {
      const headers = { Accept: 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/drones?locationId=${encodeURIComponent(locationId)}&rangeKm=${rangeKm}`, {
        headers,
        signal: AbortSignal.timeout(2500)
      });
      if (res.ok) {
        return { success: true, data: await res.json() };
      }
      if (res.status === 401 || res.status === 403) {
        return { success: false, unauthorized: true };
      }
    } catch {
      // Handled by simulation fallback
    }
    return { success: false };
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
