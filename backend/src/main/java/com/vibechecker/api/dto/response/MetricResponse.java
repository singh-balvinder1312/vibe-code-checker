package com.vibechecker.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MetricResponse {

    private Long id;
    private String metricName;
    private BigDecimal metricWeight;
    private BigDecimal score;
    private Boolean passed;
    private String details;
    private List<ViolationResponse> violations;
}