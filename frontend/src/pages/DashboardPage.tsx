import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { scanService } from '../services/scanService';
import { ScanResponse, UserStats } from '../types';
import { Code2, TrendingUp, Zap, Clock, ChevronRight, Plus, X } from 'lucide-react';
import { toast } from 'react-toastify';
import VibeScoreGauge from '../components/scan/VibeScoreGauge';
import MetricCard from '../components/scan/MetricCard';

const DashboardPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<UserStats | null>(null);
    const [recentScans, setRecentScans] = useState<ScanResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedScan, setSelectedScan] = useState<ScanResponse | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsData, scansData] = await Promise.all([
                    scanService.getUserStats(),
                    scanService.getUserScans(0, 5),
                ]);
                setStats(statsData);
                setRecentScans(scansData.content);
            } catch {
                toast.error('Failed to load dashboard data');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleViewScan = async (scan: ScanResponse) => {
        try {
            const detail = await scanService.getScanById(scan.id);
            setSelectedScan(detail);
        } catch {
            setSelectedScan(scan);
        }
    };

    const getVibeColor = (score: number) => {
        if (score >= 90) return '#00e676';
        if (score >= 75) return '#69f0ae';
        if (score >= 60) return '#ffeb3b';
        if (score >= 40) return '#ff9800';
        return '#f44336';
    };

    const getLevelColor = (level: string) => {
        const colors: Record<string, string> = {
            EXCELLENT: '#00e676',
            GOOD: '#69f0ae',
            AVERAGE: '#ffeb3b',
            POOR: '#ff9800',
            CRITICAL: '#f44336',
        };
        return colors[level] || '#888';
    };

    return (
        <div style={{
            position: 'fixed',
            top: '65px',
            left: 0,
            right: 0,
            bottom: 0,
            background: '#0a0a0f',
            padding: '1.25rem 2rem',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
        }}>
            <div style={{
                maxWidth: '1100px',
                width: '100%',
                margin: '0 auto',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
            }}>

                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexShrink: 0,
                }}>
                    <div>
                        <h1 style={{
                            color: 'white',
                            fontSize: '1.5rem',
                            fontWeight: 800,
                            margin: '0 0 3px',
                        }}>
                            Welcome back, {user?.username} 👋
                        </h1>
                        <p style={{
                            color: 'rgba(255,255,255,0.4)',
                            margin: 0,
                            fontSize: '13px',
                        }}>
                            Here's your code quality overview
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/scan')}
                        style={{
                            background: 'linear-gradient(135deg, #6c63ff, #e040fb)',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '10px 20px',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                        }}
                    >
                        <Plus size={16} />
                        New Scan
                    </button>
                </div>

                {/* Stats Row */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '1rem',
                    flexShrink: 0,
                }}>
                    <StatCard
                        icon={<Code2 size={18} color="#6c63ff" />}
                        label="Total Scans"
                        value={isLoading ? '—' : String(stats?.totalScans ?? 0)}
                        color="#6c63ff"
                        suffix=""
                    />
                    <StatCard
                        icon={<TrendingUp size={18} color="#00e676" />}
                        label="Average Vibe Score"
                        value={isLoading ? '—' : (stats?.averageVibeScore ?? 0).toFixed(1)}
                        color="#00e676"
                        suffix="/ 100"
                    />
                    <StatCard
                        icon={<Zap size={18} color="#e040fb" />}
                        label="Member Since"
                        value={isLoading ? '—' : new Date(
                            stats?.memberSince ?? '').toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric'
                        })}
                        color="#e040fb"
                        suffix=""
                    />
                </div>

                {/* Recent Scans */}
                <div style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '16px',
                    padding: '1.25rem',
                    flex: 1,
                    minHeight: 0,
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1rem',
                        flexShrink: 0,
                    }}>
                        <h2 style={{
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: 700,
                            margin: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}>
                            <Clock size={16} color="#6c63ff" />
                            Recent Scans
                        </h2>
                        <button
                            onClick={() => navigate('/history')}
                            style={{
                                background: 'transparent',
                                border: '1px solid rgba(108,99,255,0.3)',
                                borderRadius: '8px',
                                padding: '5px 12px',
                                color: '#6c63ff',
                                cursor: 'pointer',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                            }}
                        >
                            View all <ChevronRight size={12} />
                        </button>
                    </div>

                    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                        {isLoading ? (
                            <div style={{
                                color: 'rgba(255,255,255,0.3)',
                                textAlign: 'center',
                                padding: '2rem',
                                fontSize: '14px',
                            }}>
                                Loading...
                            </div>
                        ) : recentScans.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '2rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '12px',
                            }}>
                                <Code2 size={36} color="rgba(255,255,255,0.08)" />
                                <p style={{
                                    color: 'rgba(255,255,255,0.3)',
                                    margin: 0,
                                    fontSize: '14px',
                                }}>
                                    No scans yet — start by scanning some code!
                                </p>
                                <button
                                    onClick={() => navigate('/scan')}
                                    style={{
                                        background: 'linear-gradient(135deg, #6c63ff, #e040fb)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '10px 24px',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                        fontSize: '14px',
                                    }}
                                >
                                    New Scan
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {recentScans.map(scan => (
                                    <div
                                        key={scan.id}
                                        onClick={() => handleViewScan(scan)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '12px 16px',
                                            background: 'rgba(255,255,255,0.02)',
                                            border: '1px solid rgba(255,255,255,0.05)',
                                            borderRadius: '10px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                        }}
                                        onMouseEnter={e => {
                                            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(108,99,255,0.3)';
                                            (e.currentTarget as HTMLElement).style.background = 'rgba(108,99,255,0.05)';
                                        }}
                                        onMouseLeave={e => {
                                            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.05)';
                                            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)';
                                        }}
                                    >
                                        <div>
                                            <div style={{
                                                color: 'white',
                                                fontWeight: 600,
                                                fontSize: '14px',
                                                marginBottom: '2px',
                                            }}>
                                                {scan.title}
                                            </div>
                                            <div style={{
                                                color: 'rgba(255,255,255,0.3)',
                                                fontSize: '12px',
                                                textTransform: 'capitalize',
                                            }}>
                                                {scan.language} • {new Date(scan.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: getLevelColor(scan.vibeLevel),
                          background: `${getLevelColor(scan.vibeLevel)}15`,
                          padding: '3px 10px',
                          borderRadius: '6px',
                      }}>
                        {scan.vibeLevel}
                      </span>
                                            <span style={{
                                                fontSize: '1.3rem',
                                                fontWeight: 800,
                                                color: getVibeColor(scan.vibeScore),
                                                minWidth: '36px',
                                                textAlign: 'right',
                                            }}>
                        {scan.vibeScore?.toFixed(0)}
                      </span>
                                            <ChevronRight size={14} color="rgba(255,255,255,0.2)" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Scan Detail Modal */}
            {selectedScan && (
                <div
                    onClick={() => setSelectedScan(null)}
                    style={{
                        position: 'fixed',
                        top: '65px',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.8)',
                        backdropFilter: 'blur(8px)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1.5rem',
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: '#0f0f1a',
                            border: '1px solid rgba(108,99,255,0.3)',
                            borderRadius: '20px',
                            width: '100%',
                            maxWidth: '800px',
                            maxHeight: '85vh',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        {/* Modal Header */}
                        <div style={{
                            padding: '1.25rem 1.5rem',
                            borderBottom: '1px solid rgba(255,255,255,0.06)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexShrink: 0,
                        }}>
                            <div>
                                <h2 style={{ color: 'white', margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                                    {selectedScan.title}
                                </h2>
                                <p style={{
                                    color: 'rgba(255,255,255,0.4)',
                                    margin: '3px 0 0',
                                    fontSize: '12px',
                                    textTransform: 'capitalize',
                                }}>
                                    {selectedScan.language} • {new Date(
                                    selectedScan.createdAt).toLocaleDateString('en-US', {
                                    month: 'short', day: 'numeric', year: 'numeric',
                                    hour: '2-digit', minute: '2-digit',
                                })}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedScan(null)}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    padding: '8px',
                                    color: 'rgba(255,255,255,0.6)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '1.5rem',
                            display: 'grid',
                            gridTemplateColumns: '1fr 1.5fr',
                            gap: '1.25rem',
                            alignItems: 'start',
                        }}>
                            {/* Left — Score */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '1rem',
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(108,99,255,0.2)',
                                borderRadius: '14px',
                                padding: '1.25rem',
                            }}>
                                <VibeScoreGauge
                                    score={selectedScan.vibeScore}
                                    level={selectedScan.vibeLevel}
                                />
                                <div style={{
                                    width: '100%',
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '8px',
                                }}>
                                    {[
                                        { label: 'Status', value: selectedScan.status, color: '#69f0ae' },
                                        { label: 'Language', value: selectedScan.language, color: 'white' },
                                        {
                                            label: 'Metrics Passed',
                                            value: `${selectedScan.results?.filter(r => r.passed).length ?? 0} / ${selectedScan.results?.length ?? 0}`,
                                            color: '#6c63ff'
                                        },
                                        {
                                            label: 'Total Violations',
                                            value: String(selectedScan.results?.reduce(
                                                (acc, r) => acc + (r.violations?.length ?? 0), 0) ?? 0),
                                            color: '#ff9800'
                                        },
                                    ].map(item => (
                                        <div key={item.label} style={{
                                            background: 'rgba(255,255,255,0.03)',
                                            borderRadius: '8px',
                                            padding: '8px',
                                            textAlign: 'center',
                                        }}>
                                            <div style={{
                                                color: 'rgba(255,255,255,0.4)',
                                                fontSize: '10px',
                                                marginBottom: '3px',
                                            }}>
                                                {item.label}
                                            </div>
                                            <div style={{
                                                color: item.color,
                                                fontWeight: 700,
                                                fontSize: '13px',
                                                textTransform: 'capitalize',
                                            }}>
                                                {item.value}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right — Metrics */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <h3 style={{
                                    color: 'white',
                                    margin: '0 0 4px',
                                    fontSize: '0.9rem',
                                    fontWeight: 700,
                                }}>
                                    📊 Metrics Breakdown
                                </h3>
                                {selectedScan.results && selectedScan.results.length > 0 ? (
                                    selectedScan.results.map(metric => (
                                        <MetricCard key={metric.id} metric={metric} />
                                    ))
                                ) : (
                                    <div style={{
                                        color: 'rgba(255,255,255,0.3)',
                                        fontSize: '13px',
                                        textAlign: 'center',
                                        padding: '2rem',
                                        background: 'rgba(255,255,255,0.02)',
                                        borderRadius: '10px',
                                    }}>
                                        No detailed metrics available for this scan
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string;
    color: string;
    suffix: string;
}> = ({ icon, label, value, color, suffix }) => (
    <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: `1px solid ${color}20`,
        borderRadius: '14px',
        padding: '1rem 1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
                background: `${color}15`,
                borderRadius: '8px',
                padding: '6px',
                display: 'flex',
            }}>
                {icon}
            </div>
            <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', fontWeight: 500 }}>
        {label}
      </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
      <span style={{
          color: 'white',
          fontSize: '1.6rem',
          fontWeight: 800,
          letterSpacing: '-0.5px',
          lineHeight: 1,
      }}>
        {value}
      </span>
            {suffix && (
                <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px' }}>
          {suffix}
        </span>
            )}
        </div>
    </div>
);

export default DashboardPage;