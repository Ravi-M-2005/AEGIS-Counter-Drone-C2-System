package com.aegis.drone;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class DroneService {
    private final DroneRepository drones;
    public DroneService(DroneRepository drones) { this.drones=drones; }

    public List<Drone> atLocation(String locationId, double rangeKm) {
        if (rangeKm <= 0 || rangeKm > 100) throw new IllegalArgumentException("rangeKm must be > 0 and <= 100");
        return drones.findByLocationId(locationId).stream()
            .filter(d -> d.getDistanceKm() <= rangeKm).toList();
    }

    @Transactional
    public Drone updateStatus(String id, DroneStatus status) {
        Drone drone = drones.findById(id).orElseThrow(() -> new DroneNotFoundException(id));
        drone.setStatus(status);
        return drone;
    }
}
