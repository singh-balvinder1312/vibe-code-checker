import React, { useState } from 'react';
import { MetricResponse } from '../../types';
import { ChevronDown, ChevronUp, CheckCircle, XCircle } from 'lucide-react';

interface MetricCardProps {
    metric: MetricResponse;
}

const METRIC_LABELS: Record<string, string> = {
    readability_formatting: '📐 Readability & Formatting',
    naming_conventions: '🏷️ Naming Conventions',
    code_complexity: '🔀 Code Complexity',
    best_practice_compliance: '✅ Best Practices',
    documentation_comments: '📝 Documentation',
    error_handling: '🛡️ Error Handling',
    code_duplication: '♻️ Code Duplication',
    security_vulnerabilities: '🔒 Security',
    performance_patterns: '⚡ Performance',
    code_modularity: '🧩 Modularity',
};

const SEVERITY_COLORS: Record<string, string> = {
    LOW: '#69f0ae',
    MEDIUM: '#ffeb3b',
    HIGH: '#ff9800',
    CRITICAL: '#f44336',
};

const MetricCard: React.FC<MetricCardProps> = ({ metric }) => {
    const [expanded, setExpanded] = useState(false);

    const getScoreColor = (score: number) => {
        if (score >= 90) return '#00e676';
        if (score >= 70) return '#69f0ae';
        if (score >= 50) return '#ffeb3b';
        if (score >= 30) return '#ff9800';
        return '#f44336';
    };

    const color = getScoreColor(metric.score);
    const label = METRIC_LABELS[metric.metricName] || metric.metricName;

    return (
        <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid ${metric.passed
                ? 'rgba(105,240,174,0.2)'
                : 'rgba(244,67,54,0.2)'}`,
            borderRadius: '12px',
            overflow: 'hidden',
            transition: 'all 0.2s',
        }}>
            <div
                onClick={() => setExpanded(!expanded)}
                style={{
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {metric.passed
                        ? <CheckCircle size={18} color="#69f0ae" />
                        : <XCircle size={18} color="#f44336" />
                    }
                    <div>
                        <div style={{
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '14px',
                        }}>
                            {label}
                        </div>
                        <div style={{
                            color: 'rgba(255,255,255,0.4)',
                            fontSize: '12px',
                            marginTop: '2px',
                        }}>
                            Weight: {metric.metricWeight}% •
                            {metric.violations?.length > 0
                                ? ` ${metric.violations.length} violations`
                                : ' No violations'}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                        textAlign: 'right',
                    }}>
                        <div style={{
                            fontSize: '1.4rem',
                            fontWeight: 800,
                            color,
                        }}>
                            {metric.score?.toFixed(0)}
                        </div>
                        <div style={{
                            fontSize: '10px',
                            color: 'rgba(255,255,255,0.3)',
                        }}>
                            / 100
                        </div>
                    </div>

                    <div style={{
                        width: '60px',
                        height: '6px',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '3px',
                        overflow: 'hidden',
                    }}>
                        <div style={{
                            width: `${metric.score}%`,
                            height: '100%',
                            background: color,
                            borderRadius: '3px',
                            transition: 'width 1s ease',
                        }} />
                    </div>

                    {expanded
                        ? <ChevronUp size={16} color="rgba(255,255,255,0.4)" />
                        : <ChevronDown size={16} color="rgba(255,255,255,0.4)" />
                    }
                </div>
            </div>

            {expanded && metric.violations?.length > 0 && (
                <div style={{
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    padding: '16px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                }}>
                    {metric.violations.map((v, i) => (
                        <div key={i} style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: `1px solid ${SEVERITY_COLORS[v.severity]}30`,
                            borderLeft: `3px solid ${SEVERITY_COLORS[v.severity]}`,
                            borderRadius: '8px',
                            padding: '10px 14px',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: SEVERITY_COLORS[v.severity],
                    background: `${SEVERITY_COLORS[v.severity]}15`,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    letterSpacing: '0.5px',
                }}>
                  {v.severity}
                </span>
                                {v.lineNumber && (
                                    <span style={{
                                        fontSize: '11px',
                                        color: 'rgba(255,255,255,0.3)',
                                    }}>
                    Line {v.lineNumber}
                  </span>
                                )}
                            </div>
                            <div style={{
                                color: 'rgba(255,255,255,0.8)',
                                fontSize: '13px',
                                marginBottom: v.suggestion ? '6px' : 0,
                            }}>
                                {v.message}
                            </div>
                            {v.suggestion && (
                                <div style={{
                                    color: 'rgba(108,99,255,0.8)',
                                    fontSize: '12px',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '4px',
                                }}>
                                    💡 {v.suggestion}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {expanded && metric.violations?.length === 0 && (
                <div style={{
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    padding: '16px 20px',
                    color: '#69f0ae',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                }}>
                    <CheckCircle size={14} />
                    No violations found — this metric is clean!
                </div>
            )}
        </div>
    );
};

export default MetricCard;