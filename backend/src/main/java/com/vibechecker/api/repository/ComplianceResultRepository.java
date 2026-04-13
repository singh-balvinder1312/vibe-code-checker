package com.vibechecker.api.repository;

import com.vibechecker.api.entity.ComplianceResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplianceResultRepository extends JpaRepository<ComplianceResult, Long> {

    List<ComplianceResult> findByScanId(Long scanId);

    List<ComplianceResult> findByScanIdAndPassed(Long scanId, Boolean passed);

    @Query("SELECT r FROM ComplianceResult r WHERE r.scan.id = :scanId ORDER BY r.score ASC")
    List<ComplianceResult> findByScanIdOrderByScoreAsc(Long scanId);

    @Query("SELECT AVG(r.score) FROM ComplianceResult r WHERE r.scan.id = :scanId")
    Double findAverageScoreByScanId(Long scanId);
}