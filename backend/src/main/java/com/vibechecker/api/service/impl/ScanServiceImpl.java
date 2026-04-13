package com.vibechecker.api.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vibechecker.api.dto.request.ScanRequest;
import com.vibechecker.api.dto.response.MetricResponse;
import com.vibechecker.api.dto.response.ScanResponse;
import com.vibechecker.api.dto.response.ViolationResponse;
import com.vibechecker.api.entity.*;
import com.vibechecker.api.exception.BadRequestException;
import com.vibechecker.api.exception.ResourceNotFoundException;
import com.vibechecker.api.repository.*;
import com.vibechecker.api.service.ScanService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScanServiceImpl implements ScanService {

    private final ComplianceScanRepository scanRepository;
    private final ComplianceResultRepository resultRepository;
    private final ViolationRepository violationRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Value("${app.python.script.path}")
    private String pythonScriptPath;

    @Override
    @Transactional
    public ScanResponse submitScan(ScanRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        ComplianceScan scan = ComplianceScan.builder()
                .user(user)
                .title(request.getTitle())
                .language(request.getLanguage())
                .codeSnippet(request.getCode())
                .status(ComplianceScan.ScanStatus.PROCESSING)
                .build();

        scan = scanRepository.save(scan);
        log.info("Scan created with id: {} for user: {}", scan.getId(), username);

        try {
            String analysisJson = runPythonAnalyzer(request.getCode(), request.getLanguage());
            processPythonResults(scan, analysisJson);
            scan.setStatus(ComplianceScan.ScanStatus.COMPLETED);
            scan.setScannedAt(LocalDateTime.now());
        } catch (Exception e) {
            log.error("Python analyzer failed: {}", e.getMessage());
            scan.setStatus(ComplianceScan.ScanStatus.FAILED);
            scanRepository.save(scan);
            throw new BadRequestException("Code analysis failed: " + e.getMessage());
        }

        scan = scanRepository.save(scan);
        return buildScanResponse(scan);
    }

    @Override
    public ScanResponse getScanById(Long scanId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        ComplianceScan scan = scanRepository.findByIdAndUserId(scanId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Scan", "id", scanId));

        return buildScanResponse(scan);
    }

    @Override
    public Page<ScanResponse> getUserScans(String username, Pageable pageable) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        return scanRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable)
                .map(this::buildScanResponse);
    }

    @Override
    @Transactional
    public void deleteScan(Long scanId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        ComplianceScan scan = scanRepository.findByIdAndUserId(scanId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Scan", "id", scanId));

        scanRepository.delete(scan);
        log.info("Scan {} deleted by user {}", scanId, username);
    }

    @Override
    public Map<String, Object> getUserStats(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalScans", scanRepository.countByUserId(user.getId()));
        stats.put("averageVibeScore", scanRepository.findAverageVibeScoreByUserId(user.getId()));
        stats.put("username", user.getUsername());
        stats.put("memberSince", user.getCreatedAt());
        return stats;
    }

    private String runPythonAnalyzer(String code, String language) throws Exception {
        ProcessBuilder pb = new ProcessBuilder(
                "/Users/balvindersingh/Documents/Vibe Code Compliance Checker/python-analyzer/venv/bin/python3",
                pythonScriptPath,
                language
        );
        pb.redirectErrorStream(true);

        Process process = pb.start();
        process.getOutputStream().write(code.getBytes());
        process.getOutputStream().close();

        String output = new String(process.getInputStream().readAllBytes());
        int exitCode = process.waitFor();

        log.debug("Python analyzer output: {}", output);
        log.debug("Python analyzer exit code: {}", exitCode);

        if (exitCode != 0) {
            log.error("Python analyzer failed with output: {}", output);
            throw new RuntimeException("Python analyzer exited with code: " + exitCode + " output: " + output);
        }

        return output;
    }

    @Transactional
    protected void processPythonResults(ComplianceScan scan, String analysisJson) throws Exception {
        JsonNode root = objectMapper.readTree(analysisJson);
        BigDecimal vibeScore = new BigDecimal(root.get("vibe_score").asText());
        scan.setVibeScore(vibeScore);

        JsonNode metrics = root.get("metrics");
        metrics.fields().forEachRemaining(entry -> {
            JsonNode metricData = entry.getValue();

            ComplianceResult result = ComplianceResult.builder()
                    .scan(scan)
                    .metricName(entry.getKey())
                    .metricWeight(new BigDecimal(metricData.get("weight").asText()))
                    .score(new BigDecimal(metricData.get("score").asText()))
                    .passed(metricData.get("passed").asBoolean())
                    .details(metricData.get("details").asText())
                    .build();

            result = resultRepository.save(result);

            JsonNode violations = metricData.get("violations");
            if (violations != null && violations.isArray()) {
                ComplianceResult finalResult = result;
                violations.forEach(v -> {
                    Violation violation = Violation.builder()
                            .result(finalResult)
                            .lineNumber(v.has("line") ? v.get("line").asInt() : null)
                            .severity(Violation.Severity.valueOf(
                                    v.get("severity").asText().toUpperCase()))
                            .message(v.get("message").asText())
                            .suggestion(v.has("suggestion") ? v.get("suggestion").asText() : null)
                            .build();
                    violationRepository.save(violation);
                });
            }
        });
    }

    private ScanResponse buildScanResponse(ComplianceScan scan) {
        List<ComplianceResult> results = resultRepository.findByScanId(scan.getId());

        List<MetricResponse> metricResponses = results.stream().map(result -> {
            List<Violation> violations = violationRepository.findByResultId(result.getId());
            List<ViolationResponse> violationResponses = violations.stream()
                    .map(v -> ViolationResponse.builder()
                            .id(v.getId())
                            .lineNumber(v.getLineNumber())
                            .severity(v.getSeverity() != null ? v.getSeverity().name() : null)
                            .message(v.getMessage())
                            .suggestion(v.getSuggestion())
                            .build())
                    .collect(Collectors.toList());

            return MetricResponse.builder()
                    .id(result.getId())
                    .metricName(result.getMetricName())
                    .metricWeight(result.getMetricWeight())
                    .score(result.getScore())
                    .passed(result.getPassed())
                    .details(result.getDetails())
                    .violations(violationResponses)
                    .build();
        }).collect(Collectors.toList());

        String vibeLevel = getVibeLevel(scan.getVibeScore());

        return ScanResponse.builder()
                .id(scan.getId())
                .title(scan.getTitle())
                .language(scan.getLanguage())
                .codeSnippet(scan.getCodeSnippet())
                .vibeScore(scan.getVibeScore())
                .status(scan.getStatus().name())
                .vibeLevel(vibeLevel)
                .results(metricResponses)
                .scannedAt(scan.getScannedAt())
                .createdAt(scan.getCreatedAt())
                .build();
    }

    private String getVibeLevel(BigDecimal score) {
        if (score == null) return "UNKNOWN";
        double s = score.doubleValue();
        if (s >= 90) return "EXCELLENT";
        if (s >= 75) return "GOOD";
        if (s >= 60) return "AVERAGE";
        if (s >= 40) return "POOR";
        return "CRITICAL";
    }
}