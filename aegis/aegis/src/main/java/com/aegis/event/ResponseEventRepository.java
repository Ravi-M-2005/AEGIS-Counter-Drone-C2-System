package com.aegis.event;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface ResponseEventRepository extends JpaRepository<ResponseEvent, Long> {
    List<ResponseEvent> findTop100ByLocationIdOrderByCreatedAtDesc(String locationId);
}
