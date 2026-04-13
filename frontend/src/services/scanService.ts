import api from './api';
import {
    ApiResponse,
    PageResponse,
    ScanRequest,
    ScanResponse,
    UserStats,
} from '../types';

export const scanService = {
    async submitScan(data: ScanRequest): Promise<ScanResponse> {
        const response = await api.post<ApiResponse<ScanResponse>>(
            '/scans', data);
        return response.data.data;
    },

    async getScanById(scanId: number): Promise<ScanResponse> {
        const response = await api.get<ApiResponse<ScanResponse>>(
            `/scans/${scanId}`);
        return response.data.data;
    },

    async getUserScans(
        page = 0,
        size = 10
    ): Promise<PageResponse<ScanResponse>> {
        const response = await api.get<ApiResponse<PageResponse<ScanResponse>>>(
            `/scans?page=${page}&size=${size}`);
        return response.data.data;
    },

    async deleteScan(scanId: number): Promise<void> {
        await api.delete(`/scans/${scanId}`);
    },

    async getUserStats(): Promise<UserStats> {
        const response = await api.get<ApiResponse<UserStats>>('/scans/stats');
        return response.data.data;
    },
};