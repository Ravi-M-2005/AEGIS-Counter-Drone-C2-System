package com.aegis.history;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface SightingRepository extends JpaRepository<Sighting, Long> {
    List<Sighting> findByLocationIdOrderBySeenAtDesc(String locationId);
    List<Sighting> findByDroneIdOrderBySeenAtDesc(String droneId);
}
