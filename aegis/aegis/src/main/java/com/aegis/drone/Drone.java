package com.aegis.drone;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name="drones", indexes={
    @Index(name="idx_drone_location", columnList="locationId"),
    @Index(name="idx_drone_status", columnList="status"),
    @Index(name="idx_drone_simulated", columnList="simulated")
})
public class Drone {

    @Id
    @Column(length=64)
    private String id;

    @Column(nullable=false, length=80)
    private String locationId;

    @Column(nullable=false, length=100)
    private String type;

    private double angle;
    private double distanceKm;
    private double speed;
    private double altitudeMeters;
    private int confidence;

    @Column(length=50)
    private String rfBand;

    private boolean payloadDetected;

    @Enumerated(EnumType.STRING)
    @Column(length=32)
    private DroneStatus status = DroneStatus.TRACKING;

    private Double latitude;
    private Double longitude;

    private boolean simulated = true;

    @Column(length=120)
    private String detectionSource = "SYNTHETIC";

    @Enumerated(EnumType.STRING)
    @Column(length=32)
    private ThreatLevel threatLevel = ThreatLevel.LOW;

    private int threatScore = 15;

    private Instant detectedAt;

    private Instant updatedAt;

    @PrePersist
    public void onPrePersist() {
        if (this.detectedAt == null) this.detectedAt = Instant.now();
        if (this.updatedAt == null) this.updatedAt = Instant.now();
        if (this.threatLevel == null) this.threatLevel = ThreatLevel.LOW;
        if (this.status == null) this.status = DroneStatus.TRACKING;
        if (this.latitude == null || this.longitude == null) computeCoordinates();
    }

    @PreUpdate
    public void onPreUpdate() {
        this.updatedAt = Instant.now();
    }

    protected Drone() {}

    public Drone(String id, String locationId, String type, double angle, double distanceKm,
                 double speed, double altitudeMeters, int confidence, String rfBand, boolean payloadDetected) {
        this.id = id;
        this.locationId = (locationId != null && !locationId.isBlank()) ? locationId.toLowerCase().trim() : "bengaluru";
        this.type = (type != null && !type.isBlank()) ? type.trim() : "Fixed-wing Recon UAV";
        this.angle = angle;
        this.distanceKm = distanceKm;
        this.speed = speed;
        this.altitudeMeters = altitudeMeters;
        this.confidence = confidence > 0 ? confidence : 85;
        this.rfBand = (rfBand != null && !rfBand.isBlank()) ? rfBand : "2.4 GHz ISM";
        this.payloadDetected = payloadDetected;
        this.status = DroneStatus.TRACKING;
        this.simulated = true;
        this.detectionSource = "SYNTHETIC";
        this.threatScore = computeThreatScore(distanceKm, altitudeMeters, speed, payloadDetected);
        this.threatLevel = computeThreatLevel(this.threatScore);
        computeCoordinates();
        this.detectedAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public Drone(String id, String locationId, String type, double angle, double distanceKm,
                 double speed, double altitudeMeters, int confidence, String rfBand, boolean payloadDetected,
                 boolean simulated, String detectionSource, Double latitude, Double longitude) {
        this.id = id;
        this.locationId = (locationId != null && !locationId.isBlank()) ? locationId.toLowerCase().trim() : "bengaluru";
        this.type = (type != null && !type.isBlank()) ? type.trim() : "Fixed-wing Recon UAV";
        this.angle = angle;
        this.distanceKm = distanceKm;
        this.speed = speed;
        this.altitudeMeters = altitudeMeters;
        this.confidence = confidence > 0 ? confidence : 85;
        this.rfBand = (rfBand != null && !rfBand.isBlank()) ? rfBand : "2.4 GHz ISM";
        this.payloadDetected = payloadDetected;
        this.status = DroneStatus.TRACKING;
        this.simulated = simulated;
        this.detectionSource = (detectionSource != null && !detectionSource.isBlank())
                ? detectionSource
                : (simulated ? "SYNTHETIC" : "EXTERNAL_HARDWARE_RADAR");
        this.threatScore = computeThreatScore(distanceKm, altitudeMeters, speed, payloadDetected);
        this.threatLevel = computeThreatLevel(this.threatScore);
        if (latitude != null && longitude != null) {
            this.latitude = latitude;
            this.longitude = longitude;
        } else {
            computeCoordinates();
        }
        this.detectedAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public void computeCoordinates() {
        double centerLat = "border".equalsIgnoreCase(locationId) ? 32.7266 : ("defence".equalsIgnoreCase(locationId) ? 18.9220 : 13.1986);
        double centerLng = "border".equalsIgnoreCase(locationId) ? 74.8570 : ("defence".equalsIgnoreCase(locationId) ? 72.8347 : 77.7066);
        double rad = Math.toRadians(this.angle);
        this.latitude = Math.round((centerLat + (this.distanceKm / 111.0) * Math.cos(rad)) * 1_000_000.0) / 1_000_000.0;
        this.longitude = Math.round((centerLng + (this.distanceKm / (111.0 * Math.cos(Math.toRadians(centerLat)))) * Math.sin(rad)) * 1_000_000.0) / 1_000_000.0;
    }

    public static int computeThreatScore(double dist, double alt, double spd, boolean payload) {
        int score = 10;
        if (dist <= 0.8) score += 40;
        else if (dist <= 2.0) score += 25;
        else if (dist <= 5.0) score += 10;

        if (alt <= 60) score += 20;
        else if (alt <= 120) score += 10;

        if (spd >= 75) score += 20;
        else if (spd >= 45) score += 10;

        if (payload) score += 30;
        return Math.min(100, Math.max(5, score));
    }

    public static ThreatLevel computeThreatLevel(int score) {
        if (score >= 80) return ThreatLevel.CRITICAL;
        if (score >= 55) return ThreatLevel.HIGH;
        if (score >= 30) return ThreatLevel.MEDIUM;
        return ThreatLevel.LOW;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getLocationId() { return locationId; }
    public void setLocationId(String locationId) { this.locationId = locationId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public double getAngle() { return angle; }
    public void setAngle(double angle) { this.angle = angle; }

    public double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(double distanceKm) { this.distanceKm = distanceKm; }

    public double getSpeed() { return speed; }
    public void setSpeed(double speed) { this.speed = speed; }

    public double getAltitudeMeters() { return altitudeMeters; }
    public void setAltitudeMeters(double altitudeMeters) { this.altitudeMeters = altitudeMeters; }

    public int getConfidence() { return confidence; }
    public void setConfidence(int confidence) { this.confidence = confidence; }

    public String getRfBand() { return rfBand; }
    public void setRfBand(String rfBand) { this.rfBand = rfBand; }

    public boolean isPayloadDetected() { return payloadDetected; }
    public void setPayloadDetected(boolean payloadDetected) { this.payloadDetected = payloadDetected; }

    public DroneStatus getStatus() { return status != null ? status : DroneStatus.TRACKING; }
    public void setStatus(DroneStatus status) {
        this.status = status;
        this.updatedAt = Instant.now();
    }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public boolean isSimulated() { return simulated; }
    public void setSimulated(boolean simulated) { this.simulated = simulated; }

    public String getDetectionSource() { return detectionSource; }
    public void setDetectionSource(String detectionSource) { this.detectionSource = detectionSource; }

    public ThreatLevel getThreatLevel() { return threatLevel != null ? threatLevel : ThreatLevel.LOW; }
    public void setThreatLevel(ThreatLevel threatLevel) { this.threatLevel = threatLevel; }

    public int getThreatScore() { return threatScore; }
    public void setThreatScore(int threatScore) { this.threatScore = threatScore; }

    public Instant getDetectedAt() { return detectedAt != null ? detectedAt : (updatedAt != null ? updatedAt : Instant.now()); }
    public void setDetectedAt(Instant detectedAt) { this.detectedAt = detectedAt; }

    public Instant getUpdatedAt() { return updatedAt != null ? updatedAt : Instant.now(); }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
