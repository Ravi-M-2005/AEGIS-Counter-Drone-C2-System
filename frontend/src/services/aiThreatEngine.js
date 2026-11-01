// AEGIS Rule-Based AI Threat Assessment Engine
// Classifies drone threats based on altitude, speed, proximity to critical zone, payload, and movement pattern.
// Note: Safety rules enforce human-in-the-loop: actions are strictly limited to monitoring, verification, notification, and dispatch.

export const evaluateDroneThreat = ({
  distanceKm = 5.0,
  altitudeM = 100,
  speedKmh = 40,
  payloadDetected = false,
  rfBand = '2.4 GHz',
  zoneSecurity = 'HIGH',
  movementPattern = 'Standard'
}) => {
  const factors = [];
  let rawScore = 0;

  // 1. Proximity to Restricted Perimeter (Weight: up to 35 pts)
  if (distanceKm <= 1.0) {
    rawScore += 35;
    factors.push({ name: 'Immediate Zone Incursion', score: 35, maxScore: 35, impact: 'CRITICAL', detail: `Within ${distanceKm.toFixed(2)} km of core defense asset` });
  } else if (distanceKm <= 2.5) {
    rawScore += 26;
    factors.push({ name: 'Inner Buffer Breach', score: 26, maxScore: 35, impact: 'HIGH', detail: `Within ${distanceKm.toFixed(2)} km of runway/base perimeter` });
  } else if (distanceKm <= 5.0) {
    rawScore += 15;
    factors.push({ name: 'Outer Approach Boundary', score: 15, maxScore: 35, impact: 'MEDIUM', detail: `${distanceKm.toFixed(2)} km distance` });
  } else {
    rawScore += 5;
    factors.push({ name: 'Extended Airspace Perimeter', score: 5, maxScore: 35, impact: 'LOW', detail: `${distanceKm.toFixed(2)} km standoff distance` });
  }

  // 2. Altitude Profile (Weight: up to 20 pts)
  if (altitudeM < 60) {
    rawScore += 20;
    factors.push({ name: 'Terrain-Masking Ultra-Low Altitude', score: 20, maxScore: 20, impact: 'HIGH', detail: `${altitudeM}m AGL (Evasion profile)` });
  } else if (altitudeM > 250) {
    rawScore += 18;
    factors.push({ name: 'Commercial Glidepath Conflict', score: 18, maxScore: 20, impact: 'HIGH', detail: `${altitudeM}m AGL (Aviation hazard)` });
  } else if (altitudeM > 150) {
    rawScore += 10;
    factors.push({ name: 'Elevated Airspace Corridor', score: 10, maxScore: 20, impact: 'MEDIUM', detail: `${altitudeM}m AGL` });
  } else {
    rawScore += 5;
    factors.push({ name: 'Standard Low-Altitude Band', score: 5, maxScore: 20, impact: 'LOW', detail: `${altitudeM}m AGL` });
  }

  // 3. Velocity / Speed Profile (Weight: up to 20 pts)
  if (speedKmh > 100) {
    rawScore += 20;
    factors.push({ name: 'Sprint / High-Speed Penetration', score: 20, maxScore: 20, impact: 'CRITICAL', detail: `${speedKmh} km/h (Evasive velocity)` });
  } else if (speedKmh > 65) {
    rawScore += 14;
    factors.push({ name: 'Rapid Transit Profile', score: 14, maxScore: 20, impact: 'HIGH', detail: `${speedKmh} km/h` });
  } else if (speedKmh < 10) {
    rawScore += 12;
    factors.push({ name: 'Stationary Surveillance Hover', score: 12, maxScore: 20, impact: 'MEDIUM', detail: `Hovering at ${speedKmh} km/h (Loitering risk)` });
  } else {
    rawScore += 6;
    factors.push({ name: 'Nominal Multirotor Velocity', score: 6, maxScore: 20, impact: 'LOW', detail: `${speedKmh} km/h cruising speed` });
  }

  // 4. Payload Anomaly (Weight: up to 20 pts)
  if (payloadDetected) {
    rawScore += 20;
    factors.push({ name: 'External Payload Attached', score: 20, maxScore: 20, impact: 'CRITICAL', detail: 'Optical gimbal, dropped package, or auxiliary pod detected' });
  } else {
    factors.push({ name: 'Payload Status Normal', score: 0, maxScore: 20, impact: 'LOW', detail: 'No hazardous suspended payload detected' });
  }

  // 5. RF Telemetry Link Risk (Weight: up to 10 pts)
  const isSilentOrHopping = rfBand.toLowerCase().includes('silent') || 
                            rfBand.toLowerCase().includes('hopping') || 
                            rfBand.toLowerCase().includes('encrypted') || 
                            rfBand.toLowerCase().includes('military');
  if (isSilentOrHopping) {
    rawScore += 10;
    factors.push({ name: 'RF Anomaly / Encrypted Link', score: 10, maxScore: 10, impact: 'HIGH', detail: `Non-standard protocol: ${rfBand}` });
  } else {
    rawScore += 3;
    factors.push({ name: 'Standard Civil RF Band', score: 3, maxScore: 10, impact: 'LOW', detail: `Standard ISM/WiFi: ${rfBand}` });
  }

  // Maximum raw score is 105 (35 + 20 + 20 + 20 + 10)
  // Normalize to 0-100 scale:
  const normalizedScore = Math.min(100, Math.max(5, Math.round((rawScore / 105) * 100)));

  // Thresholds:
  // LOW: 0 - 30
  // MEDIUM: 31 - 60
  // HIGH: 61 - 80
  // CRITICAL: 81 - 100
  let level = 'LOW';
  let badgeColor = 'green';
  let action = 'Maintain passive surveillance. Log RF signature into routine flight database.';

  if (normalizedScore >= 81) {
    level = 'CRITICAL';
    badgeColor = 'red';
    action = 'IMMEDIATE ESCALATION: Alert Air Traffic Control tower, trigger audible command room alarm, notify Base Commander, and scramble Quick Reaction Team (QRT) to perimeter interception post.';
  } else if (normalizedScore >= 61) {
    level = 'HIGH';
    badgeColor = 'orange';
    action = 'PRIORITY ACTION: Deploy secondary optical PTZ tracking, alert mobile ground security patrols, and prepare electronic warfare direction-finding units.';
  } else if (normalizedScore >= 31) {
    level = 'MEDIUM';
    badgeColor = 'yellow';
    action = 'ACTIVE MONITORING: Verify Remote ID registry, notify Watch Officer, and cross-reference with scheduled civil flight permissions.';
  }

  return {
    rawScore,
    maxRawScore: 105,
    threatScore: normalizedScore,
    threatLevel: level,
    badgeColor,
    factors,
    recommendedAction: action,
    evaluatedAt: new Date().toISOString()
  };
};
