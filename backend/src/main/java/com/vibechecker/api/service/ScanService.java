package com.vibechecker.api.service;

import com.vibechecker.api.dto.request.ScanRequest;
import com.vibechecker.api.dto.response.ScanResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

public interface ScanService {

    ScanResponse submitScan(ScanRequest request, String username);

    ScanResponse getScanById(Long scanId, String username);

    Page<ScanResponse> getUserScans(String username, Pageable pageable);

    void deleteScan(Long scanId, String username);

    Map<String, Object> getUserStats(String username);
}