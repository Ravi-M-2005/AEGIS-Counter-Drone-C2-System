package com.aegis.drone;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DroneRepository extends JpaRepository<Drone, String> {
    List<Drone> findByLocationId(String locationId);
    List<Drone> findByLocationIdOrderByDetectedAtDesc(String locationId);
    List<Drone> findAllByOrderByDetectedAtDesc();
    long countByStatus(DroneStatus status);
    long countByThreatLevel(ThreatLevel threatLevel);
    long countBySimulated(boolean simulated);
}
