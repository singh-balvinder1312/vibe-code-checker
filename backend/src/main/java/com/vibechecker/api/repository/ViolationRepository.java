package com.vibechecker.api.repository;

import com.vibechecker.api.entity.Violation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ViolationRepository extends JpaRepository<Violation, Long> {

    List<Violation> findByResultId(Long resultId);

    List<Violation> findByResultIdAndSeverity(Long resultId, Violation.Severity severity);

    @Query("SELECT v FROM Violation v WHERE v.result.scan.id = :scanId")
    List<Violation> findAllByScanId(Long scanId);

    @Query("SELECT COUNT(v) FROM Violation v WHERE v.result.scan.id = :scanId AND v.severity = :severity")
    Long countByScanIdAndSeverity(Long scanId, Violation.Severity severity);

    @Query("SELECT v FROM Violation v WHERE v.result.scan.id = :scanId ORDER BY v.severity DESC")
    List<Violation> findAllByScanIdOrderBySeverity(Long scanId);
}