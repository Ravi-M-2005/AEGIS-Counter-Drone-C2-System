package com.aegis.event;

import com.aegis.drone.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/auto-response")
public class AutoResponseController {
    private final DroneRepository drones;
    private final ResponseEventRepository events;
    public AutoResponseController(DroneRepository drones, ResponseEventRepository events) {
        this.drones=drones; this.events=events;
    }
    public record ToggleRequest(@NotBlank String locationId, boolean enabled) {}
    public record ToggleResponse(boolean enabled, String locationId, int simulatedEvents, String message) {}

    @PostMapping
    @ResponseStatus(HttpStatus.ACCEPTED)
    public ToggleResponse toggle(@Valid @RequestBody ToggleRequest req) {
        List<Drone> active=drones.findByLocationId(req.locationId()).stream()
            .filter(d -> d.getStatus()==DroneStatus.TRACKING).toList();
        int count=0;
        if (req.enabled()) {
            for (Drone d: active) {
                // Demonstration only: records a simulated event; no radio or physical control.
                events.save(new ResponseEvent(req.locationId(), d.getId(), "SIMULATED_REVIEW",
                    "Auto-response enabled; target queued for simulated review."));
                count++;
            }
        }
        return new ToggleResponse(req.enabled(), req.locationId(), count,
            req.enabled() ? "Simulation events recorded; no physical drone action was performed."
                          : "Auto-response simulation disabled.");
    }
}
