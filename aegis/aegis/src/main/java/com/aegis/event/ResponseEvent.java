package com.aegis.event;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name="response_events")
public class ResponseEvent {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false, length=80) private String locationId;
    @Column(nullable=false, length=32) private String droneId;
    @Column(nullable=false, length=30) private String action;
    @Column(nullable=false, length=300) private String message;
    @Column(nullable=false) private Instant createdAt=Instant.now();
    protected ResponseEvent() {}
    public ResponseEvent(String locationId,String droneId,String action,String message) {
        this.locationId=locationId; this.droneId=droneId; this.action=action; this.message=message;
    }
    public Long getId(){return id;} public String getLocationId(){return locationId;}
    public String getDroneId(){return droneId;} public String getAction(){return action;}
    public String getMessage(){return message;} public Instant getCreatedAt(){return createdAt;}
}
