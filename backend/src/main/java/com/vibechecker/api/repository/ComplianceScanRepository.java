package com.vibechecker.api.repository;

import com.vibechecker.api.entity.ComplianceScan;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ComplianceScanRepository extends JpaRepository<ComplianceScan, Long> {

    Page<ComplianceScan> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    List<ComplianceScan> findByUserIdAndStatus(Long userId, ComplianceScan.ScanStatus status);

    Optional<ComplianceScan> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT AVG(c.vibeScore) FROM ComplianceScan c WHERE c.user.id = :userId")
    Double findAverageVibeScoreByUserId(Long userId);

    @Query("SELECT COUNT(c) FROM ComplianceScan c WHERE c.user.id = :userId")
    Long countByUserId(Long userId);

    @Query("SELECT c FROM ComplianceScan c WHERE c.user.id = :userId ORDER BY c.vibeScore DESC")
    List<ComplianceScan> findTopScansByUserId(Long userId, Pageable pageable);
}