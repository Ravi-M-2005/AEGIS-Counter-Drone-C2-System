package com.aegis.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {
    private final SecretKey key;
    private final long ttlMinutes;

    public JwtService(@Value("${aegis.jwt.secret}") String secret,
                      @Value("${aegis.jwt.ttl-minutes:60}") long ttlMinutes) {
        if (secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalArgumentException("aegis.jwt.secret must be at least 32 bytes");
        }
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.ttlMinutes = ttlMinutes;
    }

    public String create(String username, String role) {
        Instant now = Instant.now();
        return Jwts.builder().subject(username).claim("role", role)
            .issuedAt(Date.from(now)).expiration(Date.from(now.plusSeconds(ttlMinutes * 60)))
            .signWith(key).compact();
    }

    public String username(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token)
            .getPayload().getSubject();
    }

    public String role(String token) {
        Object r = Jwts.parser().verifyWith(key).build().parseSignedClaims(token)
            .getPayload().get("role");
        return r != null ? r.toString() : "OPERATOR";
    }
}
