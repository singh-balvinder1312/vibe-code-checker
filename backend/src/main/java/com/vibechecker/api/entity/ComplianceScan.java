package com.vibechecker.api.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "compliance_scans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplianceScan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(length = 100)
    private String title;

    @Column(nullable = false, length = 50)
    private String language;

    @Column(name = "code_snippet", nullable = false, columnDefinition = "TEXT")
    private String codeSnippet;

    @Column(name = "vibe_score", precision = 5, scale = 2)
    private BigDecimal vibeScore;

    @Column(length = 20)
    @Enumerated(EnumType.STRING)
    private ScanStatus status = ScanStatus.PENDING;

    @OneToMany(mappedBy = "scan", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ComplianceResult> results;

    @Column(name = "scanned_at")
    private LocalDateTime scannedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum ScanStatus {
        PENDING, PROCESSING, COMPLETED, FAILED
    }
}