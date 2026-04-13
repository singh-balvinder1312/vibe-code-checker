import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { scanService } from '../services/scanService';
import { ScanResponse } from '../types';
import VibeScoreGauge from '../components/scan/VibeScoreGauge';
import MetricCard from '../components/scan/MetricCard';
import { Code2, Play, Loader } from 'lucide-react';
import { toast } from 'react-toastify';

const LANGUAGES = ['python', 'javascript', 'java', 'typescript', 'go', 'rust', 'cpp', 'c'];

const SAMPLE_CODE = `import os
import sys

def calculate_user_data(x, y, a, b, c, d, e):
    password = 'hardcoded123'
    api_key = 'sk-1234567890abcdef'
    
    for i in range(len(x)):
        print(i)
    
    temp = x + y
    result = temp
    
    try:
        data = eval(input("Enter expression: "))
    except:
        pass
    
    def inner():
        if True:
            if True:
                if True:
                    if True:
                        return "too nested"
    
    return result

def bar():
    data = []
    for i in range(100):
        data += str(i)
    return data
`;

const ScanPage: React.FC = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('python');
    const [isScanning, setIsScanning] = useState(false);
    const [result, setResult] = useState<ScanResponse | null>(null);

    const handleScan = async () => {
        if (!title.trim()) { toast.error('Please enter a scan title'); return; }
        if (!code.trim()) { toast.error('Please enter some code to scan'); return; }
        setIsScanning(true);
        setResult(null);
        try {
            const response = await scanService.submitScan({ title, code, language });
            setResult(response);
            toast.success(`Scan complete! Vibe Score: ${response.vibeScore?.toFixed(1)}`);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Scan failed');
        } finally {
            setIsScanning(false);
        }
    };

    const handleLoadSample = () => {
        setCode(SAMPLE_CODE);
        setTitle('Sample Code Analysis');
        setLanguage('python');
        toast.info('Sample code loaded!');
    };

    return (
        <div style={{
            position: 'fixed',
            top: '65px',
            left: 0,
            right: 0,
            bottom: 0,
            background: '#0a0a0f',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
        }}>
            {/* Page Header */}
            <div style={{
                padding: '1rem 2rem 0',
                flexShrink: 0,
            }}>
                <h1 style={{
                    color: 'white',
                    fontSize: '1.3rem',
                    fontWeight: 800,
                    margin: 0,
                }}>
                    New Compliance Scan
                </h1>
                <p style={{
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: '12px',
                    margin: '3px 0 0',
                }}>
                    Paste your code and get an instant Vibe Score
                </p>
            </div>

            {/* Main Content */}
            <div style={{
                flex: 1,
                minHeight: 0,
                padding: '1rem 2rem',
                display: 'grid',
                gridTemplateColumns: result ? '1fr 1fr' : '1fr',
                gap: '1rem',
                overflow: 'hidden',
            }}>

                {/* Left — Input Panel */}
                <div style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '16px',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    overflow: 'hidden',
                    minHeight: 0,
                }}>

                    {/* Title + Language Row */}
                    <div style={{
                        display: 'flex',
                        gap: '1rem',
                        flexShrink: 0,
                        alignItems: 'flex-end',
                    }}>
                        <div style={{ flex: 1 }}>
                            <label style={{
                                display: 'block',
                                color: 'rgba(255,255,255,0.5)',
                                fontSize: '11px',
                                marginBottom: '6px',
                                fontWeight: 600,
                                letterSpacing: '0.5px',
                                textTransform: 'uppercase',
                            }}>
                                Scan Title
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="e.g. My Python Script"
                                style={{
                                    width: '100%',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(108,99,255,0.3)',
                                    borderRadius: '8px',
                                    padding: '0 14px',
                                    color: 'white',
                                    fontSize: '14px',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    height: '38px',
                                }}
                                onFocus={e => e.target.style.borderColor = '#6c63ff'}
                                onBlur={e => e.target.style.borderColor = 'rgba(108,99,255,0.3)'}
                            />
                        </div>

                        <div>
                            <label style={{
                                display: 'block',
                                color: 'rgba(255,255,255,0.5)',
                                fontSize: '11px',
                                marginBottom: '6px',
                                fontWeight: 600,
                                letterSpacing: '0.5px',
                                textTransform: 'uppercase',
                            }}>
                                Language
                            </label>
                            <select
                                value={language}
                                onChange={e => setLanguage(e.target.value)}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(108,99,255,0.3)',
                                    borderRadius: '8px',
                                    padding: '0 32px 0 14px',
                                    color: 'white',
                                    fontSize: '14px',
                                    outline: 'none',
                                    cursor: 'pointer',
                                    height: '38px',
                                    appearance: 'none',
                                    WebkitAppearance: 'none',
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236c63ff' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'right 10px center',
                                }}
                            >
                                {LANGUAGES.map(lang => (
                                    <option key={lang} value={lang} style={{ background: '#1a1a2e' }}>
                                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Code Area */}
                    <div style={{
                        flex: 1,
                        minHeight: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexShrink: 0,
                        }}>
                            <label style={{
                                color: 'rgba(255,255,255,0.5)',
                                fontSize: '11px',
                                fontWeight: 600,
                                letterSpacing: '0.5px',
                                textTransform: 'uppercase',
                            }}>
                                Code
                            </label>
                            <button
                                onClick={handleLoadSample}
                                style={{
                                    background: 'rgba(108,99,255,0.1)',
                                    border: '1px solid rgba(108,99,255,0.3)',
                                    borderRadius: '6px',
                                    padding: '0 12px',
                                    color: '#6c63ff',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    height: '26px',
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                Load Sample
                            </button>
                        </div>
                        <textarea
                            value={code}
                            onChange={e => setCode(e.target.value)}
                            placeholder="Paste your code here..."
                            style={{
                                flex: 1,
                                width: '100%',
                                background: 'rgba(0,0,0,0.4)',
                                border: '1px solid rgba(108,99,255,0.2)',
                                borderRadius: '10px',
                                padding: '12px',
                                color: '#e0e0e0',
                                fontSize: '13px',
                                fontFamily: 'monospace',
                                lineHeight: '1.6',
                                outline: 'none',
                                resize: 'none',
                                boxSizing: 'border-box',
                                minHeight: 0,
                            }}
                            onFocus={e => e.target.style.borderColor = 'rgba(108,99,255,0.6)'}
                            onBlur={e => e.target.style.borderColor = 'rgba(108,99,255,0.2)'}
                        />
                    </div>

                    {/* Scan Button */}
                    <button
                        onClick={handleScan}
                        disabled={isScanning}
                        style={{
                            flexShrink: 0,
                            width: '100%',
                            background: isScanning
                                ? 'rgba(108,99,255,0.3)'
                                : 'linear-gradient(135deg, #6c63ff, #e040fb)',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '13px',
                            color: 'white',
                            fontSize: '15px',
                            fontWeight: 700,
                            cursor: isScanning ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                        }}
                    >
                        {isScanning
                            ? <><Loader size={18} /> Analyzing Code...</>
                            : <><Play size={18} /> Run Compliance Scan</>
                        }
                    </button>
                </div>

                {/* Right — Results Panel */}
                {result && (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        overflowY: 'auto',
                        minHeight: 0,
                    }}>
                        {/* Scorecard */}
                        <div style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(108,99,255,0.2)',
                            borderRadius: '16px',
                            padding: '1.25rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '1rem',
                            flexShrink: 0,
                        }}>
                            <h2 style={{
                                color: 'white',
                                margin: 0,
                                fontSize: '0.95rem',
                                fontWeight: 700,
                                alignSelf: 'flex-start',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}>
                                <Code2 size={16} color="#6c63ff" />
                                Vibe Score
                            </h2>
                            <VibeScoreGauge
                                score={result.vibeScore}
                                level={result.vibeLevel}
                            />
                            <div style={{
                                width: '100%',
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '8px',
                            }}>
                                {[
                                    { label: 'Status', value: result.status, color: '#69f0ae' },
                                    { label: 'Language', value: result.language, color: 'white' },
                                ].map(item => (
                                    <div key={item.label} style={{
                                        background: 'rgba(255,255,255,0.03)',
                                        borderRadius: '8px',
                                        padding: '10px',
                                        textAlign: 'center',
                                    }}>
                                        <div style={{
                                            color: 'rgba(255,255,255,0.4)',
                                            fontSize: '11px',
                                            marginBottom: '4px',
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

                        {/* Metrics Breakdown */}
                        <div style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '16px',
                            padding: '1.25rem',
                            flexShrink: 0,
                        }}>
                            <h2 style={{
                                color: 'white',
                                margin: '0 0 1rem',
                                fontSize: '0.95rem',
                                fontWeight: 700,
                            }}>
                                📊 Metrics Breakdown
                            </h2>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                            }}>
                                {result.results?.map(metric => (
                                    <MetricCard key={metric.id} metric={metric} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScanPage;