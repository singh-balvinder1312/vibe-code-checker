package com.vibechecker.api.controller;

import com.vibechecker.api.dto.request.ScanRequest;
import com.vibechecker.api.dto.response.ApiResponse;
import com.vibechecker.api.dto.response.ScanResponse;
import com.vibechecker.api.service.ScanService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/scans")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Compliance Scans", description = "Submit and manage code compliance scans")
@SecurityRequirement(name = "Bearer Authentication")
public class ScanController {

    private final ScanService scanService;

    @PostMapping
    @Operation(summary = "Submit code for compliance scanning")
    public ResponseEntity<ApiResponse<ScanResponse>> submitScan(
            @Valid @RequestBody ScanRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("Scan request from user: {}", userDetails.getUsername());
        ScanResponse response = scanService.submitScan(request, userDetails.getUsername());
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Code scanned successfully"));
    }

    @GetMapping("/{scanId}")
    @Operation(summary = "Get a specific scan by ID")
    public ResponseEntity<ApiResponse<ScanResponse>> getScanById(
            @PathVariable Long scanId,
            @AuthenticationPrincipal UserDetails userDetails) {
        ScanResponse response = scanService.getScanById(scanId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(response, "Scan fetched successfully"));
    }

    @GetMapping
    @Operation(summary = "Get all scans for current user with pagination")
    public ResponseEntity<ApiResponse<Page<ScanResponse>>> getUserScans(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @AuthenticationPrincipal UserDetails userDetails) {

        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<ScanResponse> response = scanService.getUserScans(
                userDetails.getUsername(), pageable);

        return ResponseEntity.ok(ApiResponse.success(response, "Scans fetched successfully"));
    }

    @DeleteMapping("/{scanId}")
    @Operation(summary = "Delete a scan by ID")
    public ResponseEntity<ApiResponse<Void>> deleteScan(
            @PathVariable Long scanId,
            @AuthenticationPrincipal UserDetails userDetails) {
        scanService.deleteScan(scanId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(null, "Scan deleted successfully"));
    }

    @GetMapping("/stats")
    @Operation(summary = "Get scan statistics for current user")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserStats(
            @AuthenticationPrincipal UserDetails userDetails) {
        Map<String, Object> stats = scanService.getUserStats(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(stats, "Stats fetched successfully"));
    }
}