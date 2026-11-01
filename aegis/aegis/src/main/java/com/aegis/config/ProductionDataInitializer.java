package com.aegis.config;

import com.aegis.drone.Drone;
import com.aegis.drone.DroneRepository;
import com.aegis.drone.ThreatLevel;
import com.aegis.operator.Operator;
import com.aegis.operator.OperatorRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

@Configuration
@Profile("prod")
public class ProductionDataInitializer {

    private static final Logger log = LoggerFactory.getLogger(ProductionDataInitializer.class);

    @Bean
    CommandLineRunner initializeProduction(
            OperatorRepository operators,
            DroneRepository drones,
            PasswordEncoder encoder,
            @Value("${AEGIS_ADMIN_USERNAME:admin}") String adminUsername,
            @Value("${AEGIS_ADMIN_PASSWORD:}") String adminPassword) {

        return args -> {
            String targetUsername = (adminUsername != null && !adminUsername.isBlank()) ? adminUsername.trim() : "admin";
            Optional<Operator> existing = operators.findByUsername(targetUsername);

            if (adminPassword != null && !adminPassword.isBlank()) {
                String cleanPassword = adminPassword.trim();
                if (existing.isEmpty()) {
                    Operator admin = new Operator(targetUsername, encoder.encode(cleanPassword), "Administrator");
                    admin.setEnabled(true);
                    operators.save(admin);
                    log.info("Production administrator account '{}' initialized successfully in database.", targetUsername);
                } else {
                    Operator admin = existing.get();
                    if (!encoder.matches(cleanPassword, admin.getPasswordHash())) {
                        admin.setPasswordHash(encoder.encode(cleanPassword));
                        admin.setEnabled(true);
                        operators.save(admin);
                        log.info("Production administrator account '{}' password updated to match configured AEGIS_ADMIN_PASSWORD.", targetUsername);
                    } else {
                        log.info("Production administrator account '{}' credentials verified against environment configuration.", targetUsername);
                    }
                }
            } else {
                if (existing.isEmpty()) {
                    log.error("================================================================================");
                    log.error("AEGIS PRODUCTION CRITICAL: Administrator account '{}' does not exist in database", targetUsername);
                    log.error("and AEGIS_ADMIN_PASSWORD environment variable is not set!");
                    log.error("Please configure AEGIS_ADMIN_PASSWORD in the Render Dashboard under Environment.");
                    log.error("================================================================================");
                } else {
                    log.info("Production administrator account '{}' already exists in the database. Preserving credentials.", targetUsername);
                }
            }

            // Seed initial drone telemetry fleet if the database is newly initialized
            String[] locations = {"bengaluru", "border", "defence"};
            for (String loc : locations) {
                if (drones.findByLocationId(loc).isEmpty()) {
                    for (int i = 1; i <= 9; i++) {
                        double distance = 0.35 + (i * 0.32);
                        String prefix = loc.substring(0, 3).toUpperCase();
                        drones.save(new Drone(
                                prefix + String.format("%03d", i),
                                loc,
                                i % 2 == 0 ? "DJI Mavic 3 Enterprise" : "Fixed-wing Recon UAV",
                                (i * 41) % 360,
                                distance,
                                12 + (i * 4),
                                45 + (i * 15),
                                80 + (i % 18),
                                i % 2 == 0 ? "2.4 GHz ISM" : "5.8 GHz FHSS",
                                i % 3 == 0,
                                true,
                                "SYNTHETIC",
                                null,
                                null
                        ));
                    }
                    log.info("Initialized baseline synthetic drone fleet for sector: {}", loc);
                }
            }

            // Ensure baseline demo records in PostgreSQL are categorized as SYNTHETIC without null pointer risk
            try {
                for (Drone d : drones.findAll()) {
                    boolean changed = false;
                    String source = d.getDetectionSource();
                    if (source == null || !source.startsWith("HARDWARE_")) {
                        if (!d.isSimulated()) {
                            d.setSimulated(true);
                            changed = true;
                        }
                        if (source == null || !"SYNTHETIC".equals(source)) {
                            d.setDetectionSource("SYNTHETIC");
                            changed = true;
                        }
                    }
                    if (d.getLatitude() == null || d.getLongitude() == null) {
                        d.computeCoordinates();
                        changed = true;
                    }
                    if (d.getThreatLevel() == null) {
                        d.setThreatLevel(ThreatLevel.LOW);
                        changed = true;
                    }
                    if (changed) {
                        drones.save(d);
                    }
                }
            } catch (Exception ex) {
                log.warn("Non-fatal migration check for existing drone records: {}", ex.getMessage());
            }
        };
    }
}
