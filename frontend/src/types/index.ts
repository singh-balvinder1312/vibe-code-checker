export interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    createdAt: string;
}

export interface AuthResponse {
    token: string;
    tokenType: string;
    username: string;
    email: string;
    role: string;
    expiresIn: number;
}

export interface ViolationResponse {
    id: number;
    lineNumber: number | null;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    message: string;
    suggestion: string | null;
}

export interface MetricResponse {
    id: number;
    metricName: string;
    metricWeight: number;
    score: number;
    passed: boolean;
    details: string;
    violations: ViolationResponse[];
}

export interface ScanResponse {
    id: number;
    title: string;
    language: string;
    codeSnippet: string;
    vibeScore: number;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    vibeLevel: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR' | 'CRITICAL';
    results: MetricResponse[];
    scannedAt: string;
    createdAt: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp: string;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export interface UserStats {
    totalScans: number;
    averageVibeScore: number;
    username: string;
    memberSince: string;
}

export interface ScanRequest {
    title: string;
    code: string;
    language: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}