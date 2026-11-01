package com.aegis.operator;

import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class OperatorController {
    private final OperatorRepository operators;

    public OperatorController(OperatorRepository operators) {
        this.operators = operators;
    }

    public record OperatorDto(Long id, String username, String role, boolean enabled, Instant createdAt) {}

    @GetMapping
    public List<OperatorDto> list() {
        return operators.findAll().stream()
            .map(o -> new OperatorDto(o.getId(), o.getUsername(), o.getRole(), o.isEnabled(), Instant.now()))
            .toList();
    }
}
