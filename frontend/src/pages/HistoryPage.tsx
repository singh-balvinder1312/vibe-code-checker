import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { scanService } from '../services/scanService';
import { ScanResponse } from '../types';
import { Trash2, Eye, ChevronLeft, ChevronRight, History } from 'lucide-react';
import { toast } from 'react-toastify';

const HistoryPage: React.FC = () => {
    const navigate = useNavigate();
    const [scans, setScans] = useState<ScanResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const fetchScans = async (pageNum: number) => {
        setIsLoading(true);
        try {
            const data = await scanService.getUserScans(pageNum, 10);
            setScans(data.content);
            setTotalPages(data.totalPages);
        } catch {
            toast.error('Failed to load scan history');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchScans(page);
    }, [page]);

    const handleDelete = async (scanId: number) => {
        if (!window.confirm('Delete this scan?')) return;
        setDeletingId(scanId);
        try {
            await scanService.deleteScan(scanId);
            toast.success('Scan deleted');
            fetchScans(page);
        } catch {
            toast.error('Failed to delete scan');
        } finally {
            setDeletingId(null);
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
            minHeight: '100vh',
            background: '#0a0a0f',
            padding: '2rem',
        }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '2rem',
                }}>
                    <button
                        onClick={() => navigate('/dashboard')}
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
                        <ChevronLeft size={18} />
                    </button>
                    <div>
                        <h1 style={{
                            color: 'white',
                            fontSize: '1.5rem',
                            fontWeight: 800,
                            margin: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}>
                            <History size={22} color="#6c63ff" />
                            Scan History
                        </h1>
                        <p style={{
                            color: 'rgba(255,255,255,0.4)',
                            fontSize: '13px',
                            margin: 0,
                        }}>
                            All your previous code scans
                        </p>
                    </div>
                </div>

                {isLoading ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '4rem',
                        color: 'rgba(255,255,255,0.3)',
                    }}>
                        Loading scans...
                    </div>
                ) : scans.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '4rem',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '16px',
                    }}>
                        <History size={48} color="rgba(255,255,255,0.1)" />
                        <p style={{
                            color: 'rgba(255,255,255,0.3)',
                            marginTop: '1rem',
                        }}>
                            No scans found
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
                            Start Scanning
                        </button>
                    </div>
                ) : (
                    <>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                            marginBottom: '1.5rem',
                        }}>
                            {scans.map(scan => (
                                <div
                                    key={scan.id}
                                    style={{
                                        background: 'rgba(255,255,255,0.02)',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                        borderRadius: '12px',
                                        padding: '16px 20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={e => {
                                        (e.currentTarget as HTMLElement).style.borderColor =
                                            'rgba(108,99,255,0.3)';
                                    }}
                                    onMouseLeave={e => {
                                        (e.currentTarget as HTMLElement).style.borderColor =
                                            'rgba(255,255,255,0.06)';
                                    }}
                                >
                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            marginBottom: '4px',
                                        }}>
                      <span style={{
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '15px',
                      }}>
                        {scan.title}
                      </span>
                                            <span style={{
                                                fontSize: '11px',
                                                fontWeight: 700,
                                                color: getLevelColor(scan.vibeLevel),
                                                background: `${getLevelColor(scan.vibeLevel)}15`,
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                            }}>
                        {scan.vibeLevel}
                      </span>
                                        </div>
                                        <div style={{
                                            color: 'rgba(255,255,255,0.3)',
                                            fontSize: '12px',
                                            display: 'flex',
                                            gap: '12px',
                                        }}>
                                            <span>#{scan.id}</span>
                                            <span style={{ textTransform: 'capitalize' }}>
                        {scan.language}
                      </span>
                                            <span>
                        {new Date(scan.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                      </span>
                                        </div>
                                    </div>

                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px',
                                    }}>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{
                                                fontSize: '1.6rem',
                                                fontWeight: 800,
                                                color: getVibeColor(scan.vibeScore),
                                                lineHeight: 1,
                                            }}>
                                                {scan.vibeScore?.toFixed(0)}
                                            </div>
                                            <div style={{
                                                fontSize: '10px',
                                                color: 'rgba(255,255,255,0.2)',
                                            }}>
                                                vibe score
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => navigate(`/scan/${scan.id}`)}
                                                style={{
                                                    background: 'rgba(108,99,255,0.1)',
                                                    border: '1px solid rgba(108,99,255,0.3)',
                                                    borderRadius: '8px',
                                                    padding: '8px',
                                                    color: '#6c63ff',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                }}
                                            >
                                                <Eye size={15} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(scan.id)}
                                                disabled={deletingId === scan.id}
                                                style={{
                                                    background: 'rgba(244,67,54,0.1)',
                                                    border: '1px solid rgba(244,67,54,0.3)',
                                                    borderRadius: '8px',
                                                    padding: '8px',
                                                    color: '#f44336',
                                                    cursor: deletingId === scan.id
                                                        ? 'not-allowed' : 'pointer',
                                                    display: 'flex',
                                                }}
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '12px',
                            }}>
                                <button
                                    onClick={() => setPage(p => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        padding: '8px 16px',
                                        color: page === 0
                                            ? 'rgba(255,255,255,0.2)' : 'white',
                                        cursor: page === 0 ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                    }}
                                >
                                    <ChevronLeft size={16} /> Prev
                                </button>
                                <span style={{
                                    color: 'rgba(255,255,255,0.4)',
                                    fontSize: '14px',
                                }}>
                  Page {page + 1} of {totalPages}
                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                    disabled={page === totalPages - 1}
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        padding: '8px 16px',
                                        color: page === totalPages - 1
                                            ? 'rgba(255,255,255,0.2)' : 'white',
                                        cursor: page === totalPages - 1
                                            ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                    }}
                                >
                                    Next <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default HistoryPage;