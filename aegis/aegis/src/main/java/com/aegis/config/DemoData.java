
package com.aegis.config;

import com.aegis.drone.Drone;
import com.aegis.drone.DroneRepository;
import com.aegis.operator.Operator;
import com.aegis.operator.OperatorRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@Profile("dev")
public class DemoData {

    @Bean
    CommandLineRunner seedDemoData(
            OperatorRepository operators,
            DroneRepository drones,
            PasswordEncoder encoder) {

        return args -> {

            // Development-only demo account provisioning
            Operator admin = operators.findByUsername("admin")
                    .orElseGet(() -> new Operator("admin", "", "Administrator"));

            admin.setPasswordHash(encoder.encode("Admin@123"));
            admin.setRole("Administrator");
            admin.setEnabled(true);
            operators.save(admin);

            Operator operator1 = operators.findByUsername("operator1")
                    .orElseGet(() -> new Operator("operator1", "", "Command Center Operator"));

            operator1.setPasswordHash(encoder.encode("ChangeMe123!"));
            operator1.setRole("Command Center Operator");
            operator1.setEnabled(true);
            operators.save(operator1);

            Operator officer = operators.findByUsername("officer_sharma")
                    .orElseGet(() -> new Operator("officer_sharma", "", "Security Officer"));

            officer.setPasswordHash(encoder.encode("Admin@123"));
            officer.setRole("Security Officer");
            officer.setEnabled(true);
            operators.save(officer);

            // Seed drones for Bengaluru, border and defence sectors
            String[] locations = {"bengaluru", "border", "defence"};

            for (String loc : locations) {

                if (drones.findByLocationId(loc).isEmpty()) {

                    for (int i = 1; i <= 9; i++) {

                        double distance = 0.35 + (i * 0.32);
                        String prefix = loc.substring(0, 3).toUpperCase();

                        drones.save(new Drone(
                                prefix + String.format("%03d", i),
                                loc,
                                i % 2 == 0
                                        ? "DJI Mavic 3 Enterprise"
                                        : "Fixed-wing Recon UAV",
                                (i * 41) % 360,
                                distance,
                                12 + (i * 4),
                                45 + (i * 15),
                                80 + (i % 18),
                                i % 2 == 0
                                        ? "2.4 GHz ISM"
                                        : "5.8 GHz FHSS",
                                i % 3 == 0,
                                true,
                                "SYNTHETIC",
                                null,
                                null
                        ));
                    }
                }
            }

            // Ensure any existing demo records from previous runs are categorized as SYNTHETIC
            for (Drone d : drones.findAll()) {
                if (!d.isSimulated() || !"SYNTHETIC".equals(d.getDetectionSource())) {
                    if (!d.getDetectionSource().startsWith("HARDWARE_")) {
                        d.setSimulated(true);
                        d.setDetectionSource("SYNTHETIC");
                        drones.save(d);
                    }
                }
            }
        };
    }
}
