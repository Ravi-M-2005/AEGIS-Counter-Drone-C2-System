package com.aegis.drone;

import com.aegis.history.Sighting;
import com.aegis.history.SightingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class DroneService {

    private static final Logger log = LoggerFactory.getLogger(DroneService.class);

    private final DroneRepository drones;
    private final SightingRepository sightings;

    public DroneService(DroneRepository drones, SightingRepository sightings) {
        this.drones = drones;
        this.sightings = sightings;
    }

    public List<Drone> atLocation(String locationId, double rangeKm) {
        if (rangeKm <= 0 || rangeKm > 100) {
            throw new IllegalArgumentException("rangeKm must be > 0 and <= 100");
        }
        return drones.findByLocationId(locationId).stream()
                .filter(d -> d.getDistanceKm() <= rangeKm)
                .toList();
    }

    public List<Drone> getDrones(String locationId, Double rangeKm, Boolean simulated) {
        List<Drone> list;
        if (locationId != null && !locationId.isBlank() && !locationId.equalsIgnoreCase("all")) {
            list = drones.findByLocationIdOrderByDetectedAtDesc(locationId.toLowerCase().trim());
        } else {
            list = drones.findAllByOrderByDetectedAtDesc();
        }

        return list.stream()
                .filter(d -> rangeKm == null || rangeKm <= 0 || d.getDistanceKm() <= rangeKm)
                .filter(d -> simulated == null || d.isSimulated() == simulated)
                .toList();
    }

    public Drone getById(String id) {
        return drones.findById(id).orElseThrow(() -> new DroneNotFoundException(id));
    }

    @Transactional
    public Drone createDrone(CreateDroneRequest req) {
        String loc = (req.locationId() != null && !req.locationId().isBlank())
                ? req.locationId().toLowerCase().trim()
                : "bengaluru";

        boolean isSim = (req.simulated() != null) ? req.simulated() : true;
        String locPrefix = loc.length() >= 3 ? loc.substring(0, 3).toUpperCase() : loc.toUpperCase();
        String prefix = isSim ? "DRN-SIM-" : "DRN-" + locPrefix + "-";

        String id;
        if (req.id() != null && !req.id().isBlank()) {
            id = req.id().trim();
        } else {
            id = prefix + String.format("%04d", (System.currentTimeMillis() % 10000));
        }

        String type = (req.type() != null && !req.type().isBlank())
                ? req.type().trim()
                : "Fixed-wing Recon UAV";

        double angle = req.angle() != null ? req.angle() : Math.round(Math.random() * 360.0);
        double distanceKm = req.distanceKm() != null ? req.distanceKm() : 1.8;
        double speed = req.speed() != null ? req.speed() : 45.0;
        double altitudeMeters = req.altitudeMeters() != null ? req.altitudeMeters() : 120.0;
        int confidence = (req.confidence() != null && req.confidence() > 0) ? req.confidence() : 92;
        String rfBand = (req.rfBand() != null && !req.rfBand().isBlank()) ? req.rfBand().trim() : "2.4 GHz OccuSync";
        boolean payload = Boolean.TRUE.equals(req.payloadDetected());

        String defaultSource = isSim ? "SYNTHETIC" : "EXTERNAL_HARDWARE_RADAR";
        String source = (req.detectionSource() != null && !req.detectionSource().isBlank())
                ? req.detectionSource().trim()
                : defaultSource;

        Drone drone = new Drone(
                id,
                loc,
                type,
                angle,
                distanceKm,
                speed,
                altitudeMeters,
                confidence,
                rfBand,
                payload,
                isSim,
                source,
                req.latitude(),
                req.longitude()
        );

        if (req.status() != null) {
            drone.setStatus(req.status());
        }
        if (req.threatLevel() != null) {
            drone.setThreatLevel(req.threatLevel());
        }
        if (req.threatScore() != null && req.threatScore() > 0) {
            drone.setThreatScore(req.threatScore());
        }

        Drone saved = drones.save(drone);
        log.info("Persisted drone detection: id={}, type={}, sector={}, simulated={}, threat={}",
                saved.getId(), saved.getType(), saved.getLocationId(), saved.isSimulated(), saved.getThreatLevel());

        try {
            sightings.save(new Sighting(
                    saved.getLocationId(),
                    saved.getId(),
                    saved.getType(),
                    saved.getThreatScore(),
                    saved.getAltitudeMeters(),
                    saved.getDistanceKm()
            ));
        } catch (Exception ex) {
            log.warn("Could not record initial sighting for drone {}: {}", saved.getId(), ex.getMessage());
        }

        return saved;
    }

    @Transactional
    public Drone updateStatus(String id, DroneStatus status) {
        Drone drone = drones.findById(id).orElseThrow(() -> new DroneNotFoundException(id));
        drone.setStatus(status);
        drone.setUpdatedAt(Instant.now());
        Drone updated = drones.save(drone);
        log.info("Updated drone {} status to {}", id, status);
        return updated;
    }

    @Transactional
    public boolean deleteDrone(String id) {
        if (drones.existsById(id)) {
            drones.deleteById(id);
            log.info("Deleted drone detection: {}", id);
            return true;
        }
        return false;
    }

    public DroneStatistics getStatistics() {
        long total = drones.count();
        long active = drones.countByStatus(DroneStatus.TRACKING);
        long highThreats = drones.countByThreatLevel(ThreatLevel.HIGH);
        long criticalThreats = drones.countByThreatLevel(ThreatLevel.CRITICAL);
        long highRiskThreats = highThreats + criticalThreats;
        long criticalAlerts = criticalThreats;
        long simulated = drones.countBySimulated(true);
        long live = drones.countBySimulated(false);
        long neutralized = drones.countByStatus(DroneStatus.NEUTRALIZED);
        long cleared = drones.countByStatus(DroneStatus.CLEARED);
        long mitigated = neutralized + cleared;

        return new DroneStatistics(
                total,
                active,
                highRiskThreats,
                criticalAlerts,
                simulated,
                live,
                mitigated,
                3, // Active tactical surveillance zones
                6, // Operational sensor networks
                "SYNTHETIC (No physical radar/RF hardware connected)",
                "PostgreSQL Synthetic Telemetry Ingestion"
        );
    }

    public record CreateDroneRequest(
            String id,
            String locationId,
            String type,
            Double angle,
            Double distanceKm,
            Double speed,
            Double altitudeMeters,
            Integer confidence,
            String rfBand,
            Boolean payloadDetected,
            Boolean simulated,
            String detectionSource,
            Double latitude,
            Double longitude,
            DroneStatus status,
            ThreatLevel threatLevel,
            Integer threatScore
    ) {}

    public record DroneStatistics(
            long totalDrones,
            long activeDrones,
            long highRiskThreats,
            long criticalAlerts,
            long simulatedDrones,
            long liveDrones,
            long mitigatedDrones,
            int activeZones,
            int operationalSensors,
            String hardwareStatus,
            String telemetryMode
    ) {}
}
