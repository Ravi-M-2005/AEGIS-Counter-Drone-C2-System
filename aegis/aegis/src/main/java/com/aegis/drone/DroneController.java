package com.aegis.drone;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/drones")
public class DroneController {
    private final DroneService service;
    public DroneController(DroneService service) { this.service=service; }

    @GetMapping
    public List<Drone> byLocation(@RequestParam(defaultValue="bengaluru") String locationId,
        @RequestParam(defaultValue="3.0") @DecimalMin("0.1") @DecimalMax("100.0") double rangeKm) {
        return service.atLocation(locationId, rangeKm);
    }

    public record StatusRequest(@NotNull DroneStatus status) {}
    @PatchMapping("/{id}/status")
    public Drone changeStatus(@PathVariable String id, @Valid @RequestBody StatusRequest req) {
        return service.updateStatus(id, req.status());
    }
}
