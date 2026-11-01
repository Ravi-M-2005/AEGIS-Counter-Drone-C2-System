package com.aegis.drone;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name="drones", indexes=@Index(name="idx_drone_location", columnList="locationId"))
public class Drone {
    @Id @Column(length=32) private String id;
    @Column(nullable=false, length=80) private String locationId;
    @Column(nullable=false, length=100) private String type;
    private double angle;
    private double distanceKm;
    private double speed;
    private double altitudeMeters;
    private int confidence;
    @Column(length=30) private String rfBand;
    private boolean payloadDetected;
    @Enumerated(EnumType.STRING) @Column(nullable=false) private DroneStatus status = DroneStatus.TRACKING;
    @Column(nullable=false) private Instant updatedAt = Instant.now();

    protected Drone() {}
    public Drone(String id, String locationId, String type, double angle, double distanceKm,
                 double speed, double altitudeMeters, int confidence, String rfBand, boolean payloadDetected) {
        this.id=id; this.locationId=locationId; this.type=type; this.angle=angle;
        this.distanceKm=distanceKm; this.speed=speed; this.altitudeMeters=altitudeMeters;
        this.confidence=confidence; this.rfBand=rfBand; this.payloadDetected=payloadDetected;
    }
    public String getId(){return id;} public String getLocationId(){return locationId;}
    public String getType(){return type;} public double getAngle(){return angle;}
    public double getDistanceKm(){return distanceKm;} public double getSpeed(){return speed;}
    public double getAltitudeMeters(){return altitudeMeters;} public int getConfidence(){return confidence;}
    public String getRfBand(){return rfBand;} public boolean isPayloadDetected(){return payloadDetected;}
    public DroneStatus getStatus(){return status;} public Instant getUpdatedAt(){return updatedAt;}
    public void setStatus(DroneStatus status){this.status=status; this.updatedAt=Instant.now();}
}
