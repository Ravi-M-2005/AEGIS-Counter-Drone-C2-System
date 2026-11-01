package com.aegis.history;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name="sightings", indexes=@Index(name="idx_sighting_location_time", columnList="locationId, seenAt"))
public class Sighting {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false, length=80) private String locationId;
    @Column(nullable=false, length=32) private String droneId;
    @Column(nullable=false, length=100) private String droneType;
    @Column(nullable=false) private int threatScore;
    @Column(nullable=false) private double altitudeMeters;
    @Column(nullable=false) private double rangeKm;
    @Column(nullable=false) private Instant seenAt=Instant.now();
    protected Sighting() {}
    public Sighting(String locationId,String droneId,String droneType,int threatScore,double altitudeMeters,double rangeKm) {
        this.locationId=locationId; this.droneId=droneId; this.droneType=droneType;
        this.threatScore=threatScore; this.altitudeMeters=altitudeMeters; this.rangeKm=rangeKm;
    }
    public Long getId(){return id;} public String getLocationId(){return locationId;}
    public String getDroneId(){return droneId;} public String getDroneType(){return droneType;}
    public int getThreatScore(){return threatScore;} public double getAltitudeMeters(){return altitudeMeters;}
    public double getRangeKm(){return rangeKm;} public Instant getSeenAt(){return seenAt;}
}
