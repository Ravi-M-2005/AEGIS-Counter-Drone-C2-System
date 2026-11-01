package com.aegis.auth;

import com.aegis.operator.Operator;
import com.aegis.operator.OperatorRepository;
import com.aegis.security.JwtService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final OperatorRepository operators;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthController(OperatorRepository operators, PasswordEncoder encoder, JwtService jwt) {
        this.operators=operators; this.encoder=encoder; this.jwt=jwt;
    }

    public record LoginRequest(@NotBlank @Size(max=80) String username,
                               @NotBlank @Size(max=200) String password) {}
    public record LoginResponse(String token, String username, String role, String tokenType) {}

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest req) {
        Operator op = operators.findByUsername(req.username().trim())
            .filter(Operator::isEnabled)
            .filter(o -> encoder.matches(req.password(), o.getPasswordHash()))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password"));
        return new LoginResponse(jwt.create(op.getUsername(), op.getRole()), op.getUsername(), op.getRole(), "Bearer");
    }
}
