-- Users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Compliance scans table
CREATE TABLE compliance_scans (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    title VARCHAR(100),
    language VARCHAR(50) NOT NULL,
    code_snippet TEXT NOT NULL,
    vibe_score DECIMAL(5,2),
    status VARCHAR(20) DEFAULT 'PENDING',
    scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Compliance results table
CREATE TABLE compliance_results (
    id BIGSERIAL PRIMARY KEY,
    scan_id BIGINT REFERENCES compliance_scans(id),
    metric_name VARCHAR(100) NOT NULL,
    metric_weight DECIMAL(5,2) NOT NULL,
    score DECIMAL(5,2),
    passed BOOLEAN DEFAULT FALSE,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Violations table
CREATE TABLE violations (
    id BIGSERIAL PRIMARY KEY,
    result_id BIGINT REFERENCES compliance_results(id),
    line_number INTEGER,
    severity VARCHAR(20),
    message TEXT NOT NULL,
    suggestion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_scans_user_id ON compliance_scans(user_id);
CREATE INDEX idx_results_scan_id ON compliance_results(scan_id);
CREATE INDEX idx_violations_result_id ON violations(result_id);
