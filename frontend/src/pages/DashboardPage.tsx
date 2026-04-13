import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { scanService } from '../services/scanService';
import { ScanResponse, UserStats } from '../types';
import { Code2, TrendingUp, Zap, Clock, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';

const DashboardPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<UserStats | null>(null);
    const [recentScans, setRecentScans] = useState<ScanResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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

    const getVibeColor = (score: number) => {
        if (score >= 90) return '#00e676';
        if (score >= 75) return '#69f0ae';
        if (score >= 60) return '#ffeb3b';
        if (score >= 40) return '#ff9800';
        return '#f44336';
    };

    const getLevelBadge = (level: string) => {
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
            minHeight: '100vh',
            background: '#0a0a0f',
            padding: '2rem',
        }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{
                        color: 'white',
                        fontSize: '1.8rem',
                        fontWeight: 800,
                        margin: '0 0 6px',
                    }}>
                        Welcome back, {user?.username} 👋
                    </h1>
                    <p style={{
                        color: 'rgba(255,255,255,0.4)',
                        margin: 0,
                        fontSize: '14px',
                    }}>
                        Here's your code quality overview
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '1rem',
                    marginBottom: '2rem',
                }}>
                    <StatCard
                        icon={<Code2 size={20} color="#6c63ff" />}
                        label="Total Scans"
                        value={isLoading ? '...' : String(stats?.totalScans ?? 0)}
                        color="#6c63ff"
                    />
                    <StatCard
                        icon={<TrendingUp size={20} color="#00e676" />}
                        label="Average Vibe Score"
                        value={isLoading ? '...' : `${(stats?.averageVibeScore ?? 0).toFixed(1)}`}
                        color="#00e676"
                    />
                    <StatCard
                        icon={<Zap size={20} color="#e040fb" />}
                        label="Member Since"
                        value={isLoading ? '...' : new Date(
                            stats?.memberSince ?? '').toLocaleDateString()}
                        color="#e040fb"
                    />
                </div>

                <div style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    marginBottom: '2rem',
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1.5rem',
                    }}>
                        <h2 style={{
                            color: 'white',
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            margin: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}>
                            <Clock size={18} color="#6c63ff" />
                            Recent Scans
                        </h2>
                        <button
                            onClick={() => navigate('/history')}
                            style={{
                                background: 'transparent',
                                border: '1px solid rgba(108,99,255,0.3)',
                                borderRadius: '8px',
                                padding: '6px 14px',
                                color: '#6c63ff',
                                cursor: 'pointer',
                                fontSize: '13px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                            }}
                        >
                            View all <ChevronRight size={14} />
                        </button>
                    </div>

                    {isLoading ? (
                        <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '2rem' }}>
                            Loading...
                        </div>
                    ) : recentScans.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                            <Code2 size={40} color="rgba(255,255,255,0.1)" />
                            <p style={{ color: 'rgba(255,255,255,0.3)', marginTop: '1rem' }}>
                                No scans yet. Start by scanning some code!
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
                                    marginTop: '1rem',
                                }}
                            >
                                New Scan
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {recentScans.map(scan => (
                                <div
                                    key={scan.id}
                                    onClick={() => navigate(`/scan/${scan.id}`)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '14px 16px',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={e => {
                                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(108,99,255,0.3)';
                                        (e.currentTarget as HTMLElement).style.background = 'rgba(108,99,255,0.05)';
                                    }}
                                    onMouseLeave={e => {
                                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
                                        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
                                    }}
                                >
                                    <div>
                                        <div style={{
                                            color: 'white',
                                            fontWeight: 600,
                                            fontSize: '14px',
                                            marginBottom: '3px',
                                        }}>
                                            {scan.title}
                                        </div>
                                        <div style={{
                                            color: 'rgba(255,255,255,0.3)',
                                            fontSize: '12px',
                                        }}>
                                            {scan.language} • {new Date(scan.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: getLevelBadge(scan.vibeLevel),
                        background: `${getLevelBadge(scan.vibeLevel)}15`,
                        padding: '3px 10px',
                        borderRadius: '6px',
                    }}>
                      {scan.vibeLevel}
                    </span>
                                        <span style={{
                                            fontSize: '1.2rem',
                                            fontWeight: 800,
                                            color: getVibeColor(scan.vibeScore),
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

                <button
                    onClick={() => navigate('/scan')}
                    style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #6c63ff, #e040fb)',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '16px',
                        color: 'white',
                        fontSize: '16px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        letterSpacing: '0.5px',
                    }}
                >
                    <Code2 size={20} />
                    Start New Scan
                </button>
            </div>
        </div>
    );
};

const StatCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string;
    color: string;
}> = ({ icon, label, value, color }) => (
    <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: `1px solid ${color}20`,
        borderRadius: '14px',
        padding: '1.25rem',
    }}>
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '12px',
        }}>
            <div style={{
                background: `${color}15`,
                borderRadius: '8px',
                padding: '8px',
                display: 'flex',
            }}>
                {icon}
            </div>
            <span style={{
                color: 'rgba(255,255,255,0.5)',
                fontSize: '13px',
            }}>
        {label}
      </span>
        </div>
        <div style={{
            color: 'white',
            fontSize: '1.8rem',
            fontWeight: 800,
            letterSpacing: '-0.5px',
        }}>
            {value}
        </div>
    </div>
);

export default DashboardPage;