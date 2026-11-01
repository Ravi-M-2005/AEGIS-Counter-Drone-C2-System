package com.aegis.event;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/response-events")
public class ResponseEventController {
    private final ResponseEventRepository repository;
    public ResponseEventController(ResponseEventRepository repository){this.repository=repository;}
    @GetMapping
    public List<ResponseEvent> recent(@RequestParam(defaultValue="bengaluru") String locationId) {
        return repository.findTop100ByLocationIdOrderByCreatedAtDesc(locationId);
    }
}
