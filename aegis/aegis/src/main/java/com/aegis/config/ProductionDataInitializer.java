package com.aegis.config;

import com.aegis.drone.Drone;
import com.aegis.drone.DroneRepository;
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
            boolean adminExists = operators.findByUsername(targetUsername).isPresent();

            if (!adminExists) {
                if (adminPassword != null && !adminPassword.isBlank()) {
                    Operator admin = new Operator(targetUsername, encoder.encode(adminPassword), "Administrator");
                    admin.setEnabled(true);
                    operators.save(admin);
                    log.info("Production administrator account successfully initialized for user: {}", targetUsername);
                } else {
                    log.warn("================================================================================");
                    log.warn("AEGIS PRODUCTION WARNING: Administrator '{}' does not exist.", targetUsername);
                    log.warn("Please set AEGIS_ADMIN_PASSWORD environment variable to seed the administrator.");
                    log.warn("================================================================================");
                }
            } else {
                log.info("Production administrator account '{}' already exists. Preserving existing credentials.", targetUsername);
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
                                i % 3 == 0
                        ));
                    }
                    log.info("Initialized baseline drone fleet for sector: {}", loc);
                }
            }
        };
    }
}
