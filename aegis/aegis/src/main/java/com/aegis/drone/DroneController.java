package com.aegis.drone;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/drones")
public class DroneController {

    private final DroneService service;

    public DroneController(DroneService service) {
        this.service = service;
    }

    @GetMapping
    public List<Drone> list(
            @RequestParam(required = false) String locationId,
            @RequestParam(required = false) Double rangeKm,
            @RequestParam(required = false) Boolean simulated) {
        return service.getDrones(locationId, rangeKm, simulated);
    }

    @GetMapping("/stats")
    public DroneService.DroneStatistics stats() {
        return service.getStatistics();
    }

    @GetMapping("/{id}")
    public Drone getById(@PathVariable String id) {
        return service.getById(id);
    }

    @PostMapping
    public ResponseEntity<Drone> create(@RequestBody DroneService.CreateDroneRequest req) {
        Drone created = service.createDrone(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    public record StatusRequest(@NotNull DroneStatus status) {}

    @PatchMapping("/{id}/status")
    public Drone changeStatus(@PathVariable String id, @Valid @RequestBody StatusRequest req) {
        return service.updateStatus(id, req.status());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        boolean deleted = service.deleteDrone(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
