package com.vibechecker.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ViolationResponse {

    private Long id;
    private Integer lineNumber;
    private String severity;
    private String message;
    private String suggestion;
}