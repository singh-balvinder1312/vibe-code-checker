import React from 'react';

interface VibeScoreGaugeProps {
    score: number;
    level: string;
}

const VibeScoreGauge: React.FC<VibeScoreGaugeProps> = ({ score, level }) => {
    const getColor = () => {
        if (score >= 90) return '#00e676';
        if (score >= 75) return '#69f0ae';
        if (score >= 60) return '#ffeb3b';
        if (score >= 40) return '#ff9800';
        return '#f44336';
    };

    const getLevelEmoji = () => {
        if (score >= 90) return '🚀';
        if (score >= 75) return '✅';
        if (score >= 60) return '⚠️';
        if (score >= 40) return '🔻';
        return '💀';
    };

    const color = getColor();
    const circumference = 2 * Math.PI * 54;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
        }}>
            <div style={{ position: 'relative', width: '160px', height: '160px' }}>
                <svg width="160" height="160" style={{ transform: 'rotate(-90deg)' }}>
                    <circle
                        cx="80" cy="80" r="54"
                        fill="none"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="12"
                    />
                    <circle
                        cx="80" cy="80" r="54"
                        fill="none"
                        stroke={color}
                        strokeWidth="12"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 1.5s ease' }}
                    />
                </svg>
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                }}>
                    <div style={{
                        fontSize: '2.2rem',
                        fontWeight: 800,
                        color,
                        lineHeight: 1,
                    }}>
                        {score?.toFixed(0)}
                    </div>
                    <div style={{
                        fontSize: '11px',
                        color: 'rgba(255,255,255,0.4)',
                        marginTop: '2px',
                    }}>
                        / 100
                    </div>
                </div>
            </div>

            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: `${color}15`,
                border: `1px solid ${color}40`,
                borderRadius: '20px',
                padding: '6px 16px',
            }}>
                <span style={{ fontSize: '18px' }}>{getLevelEmoji()}</span>
                <span style={{
                    color,
                    fontWeight: 700,
                    fontSize: '14px',
                    letterSpacing: '1px',
                }}>
          {level}
        </span>
            </div>
        </div>
    );
};

export default VibeScoreGauge;