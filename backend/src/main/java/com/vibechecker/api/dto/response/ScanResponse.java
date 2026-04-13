package com.vibechecker.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScanResponse {

    private Long id;
    private String title;
    private String language;
    private String codeSnippet;
    private BigDecimal vibeScore;
    private String status;
    private String vibeLevel;
    private List<MetricResponse> results;
    private LocalDateTime scannedAt;
    private LocalDateTime createdAt;
}