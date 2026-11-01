package com.aegis.history;

import com.aegis.drone.Drone;
import com.aegis.drone.DroneRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@RestController
@RequestMapping("/api/sightings")
public class SightingController {
    private final SightingRepository sightings;
    private final DroneRepository drones;
    public SightingController(SightingRepository sightings, DroneRepository drones) {
        this.sightings=sightings; this.drones=drones;
    }
    public record CreateSightingRequest(@NotBlank String droneId, @Min(0) @Max(100) int threatScore) {}
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Sighting record(@Valid @RequestBody CreateSightingRequest req) {
        Drone d=drones.findById(req.droneId()).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Drone not found"));
        return sightings.save(new Sighting(d.getLocationId(), d.getId(), d.getType(),
            req.threatScore(), d.getAltitudeMeters(), d.getDistanceKm()));
    }
    @GetMapping
    public List<Sighting> byLocation(@RequestParam(defaultValue="bengaluru") String locationId) {
        return sightings.findByLocationIdOrderBySeenAtDesc(locationId);
    }
    @GetMapping("/drone/{droneId}")
    public List<Sighting> byDrone(@PathVariable String droneId) {
        return sightings.findByDroneIdOrderBySeenAtDesc(droneId);
    }
}
