import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { scanService } from '../services/scanService';
import { ScanResponse } from '../types';
import VibeScoreGauge from '../components/scan/VibeScoreGauge';
import MetricCard from '../components/scan/MetricCard';
import { Code2, Play, Loader, ChevronLeft } from 'lucide-react';
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
        if (!title.trim()) {
            toast.error('Please enter a scan title');
            return;
        }
        if (!code.trim()) {
            toast.error('Please enter some code to scan');
            return;
        }
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
            minHeight: '100vh',
            background: '#0a0a0f',
            padding: '2rem',
        }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

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
                        }}>
                            New Compliance Scan
                        </h1>
                        <p style={{
                            color: 'rgba(255,255,255,0.4)',
                            fontSize: '13px',
                            margin: 0,
                        }}>
                            Paste your code and get an instant Vibe Score
                        </p>
                    </div>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: result ? '1fr 1fr' : '1fr',
                    gap: '1.5rem',
                    alignItems: 'start',
                }}>

                    <div style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                    }}>
                        <div style={{
                            display: 'flex',
                            gap: '1rem',
                            marginBottom: '1rem',
                        }}>
                            <div style={{ flex: 1 }}>
                                <label style={{
                                    display: 'block',
                                    color: 'rgba(255,255,255,0.5)',
                                    fontSize: '12px',
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
                                        padding: '10px 14px',
                                        color: 'white',
                                        fontSize: '14px',
                                        outline: 'none',
                                        boxSizing: 'border-box',
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#6c63ff'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(108,99,255,0.3)'}
                                />
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    color: 'rgba(255,255,255,0.5)',
                                    fontSize: '12px',
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
                                        padding: '10px 14px',
                                        color: 'white',
                                        fontSize: '14px',
                                        outline: 'none',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {LANGUAGES.map(lang => (
                                        <option
                                            key={lang}
                                            value={lang}
                                            style={{ background: '#1a1a2e' }}
                                        >
                                            {lang.charAt(0).toUpperCase() + lang.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '6px',
                            }}>
                                <label style={{
                                    color: 'rgba(255,255,255,0.5)',
                                    fontSize: '12px',
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
                                        padding: '4px 12px',
                                        color: '#6c63ff',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                    }}
                                >
                                    Load Sample
                                </button>
                            </div>
                            <textarea
                                value={code}
                                onChange={e => setCode(e.target.value)}
                                placeholder="Paste your code here..."
                                rows={20}
                                style={{
                                    width: '100%',
                                    background: 'rgba(0,0,0,0.4)',
                                    border: '1px solid rgba(108,99,255,0.2)',
                                    borderRadius: '10px',
                                    padding: '14px',
                                    color: '#e0e0e0',
                                    fontSize: '13px',
                                    fontFamily: 'monospace',
                                    lineHeight: '1.6',
                                    outline: 'none',
                                    resize: 'vertical',
                                    boxSizing: 'border-box',
                                }}
                                onFocus={e => e.target.style.borderColor = 'rgba(108,99,255,0.6)'}
                                onBlur={e => e.target.style.borderColor = 'rgba(108,99,255,0.2)'}
                            />
                        </div>

                        <button
                            onClick={handleScan}
                            disabled={isScanning}
                            style={{
                                width: '100%',
                                background: isScanning
                                    ? 'rgba(108,99,255,0.3)'
                                    : 'linear-gradient(135deg, #6c63ff, #e040fb)',
                                border: 'none',
                                borderRadius: '10px',
                                padding: '14px',
                                color: 'white',
                                fontSize: '15px',
                                fontWeight: 700,
                                cursor: isScanning ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                letterSpacing: '0.5px',
                            }}
                        >
                            {isScanning ? (
                                <>
                                    <Loader size={18} className="spin" />
                                    Analyzing Code...
                                </>
                            ) : (
                                <>
                                    <Play size={18} />
                                    Run Compliance Scan
                                </>
                            )}
                        </button>
                    </div>

                    {result && (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                        }}>
                            <div style={{
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(108,99,255,0.2)',
                                borderRadius: '16px',
                                padding: '1.5rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '1rem',
                            }}>
                                <h2 style={{
                                    color: 'white',
                                    margin: 0,
                                    fontSize: '1rem',
                                    fontWeight: 700,
                                    alignSelf: 'flex-start',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                }}>
                                    <Code2 size={18} color="#6c63ff" />
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
                                    <div style={{
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
                                            Status
                                        </div>
                                        <div style={{
                                            color: '#69f0ae',
                                            fontWeight: 700,
                                            fontSize: '13px',
                                        }}>
                                            {result.status}
                                        </div>
                                    </div>
                                    <div style={{
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
                                            Language
                                        </div>
                                        <div style={{
                                            color: 'white',
                                            fontWeight: 700,
                                            fontSize: '13px',
                                            textTransform: 'capitalize',
                                        }}>
                                            {result.language}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: '16px',
                                padding: '1.5rem',
                            }}>
                                <h2 style={{
                                    color: 'white',
                                    margin: '0 0 1rem',
                                    fontSize: '1rem',
                                    fontWeight: 700,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
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
        </div>
    );
};

export default ScanPage;