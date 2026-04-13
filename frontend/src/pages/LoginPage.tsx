import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';

const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await login({ username, password });
            toast.success('Welcome back!');
            navigate('/dashboard');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0a0a0f',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            position: 'relative',
            overflow: 'hidden',
        }}>
            <div style={{
                position: 'absolute',
                width: '600px',
                height: '600px',
                background: 'radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)',
                top: '-200px',
                right: '-200px',
                borderRadius: '50%',
                pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute',
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(224,64,251,0.1) 0%, transparent 70%)',
                bottom: '-100px',
                left: '-100px',
                borderRadius: '50%',
                pointerEvents: 'none',
            }} />

            <div style={{
                width: '100%',
                maxWidth: '420px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(108,99,255,0.2)',
                borderRadius: '24px',
                padding: '2.5rem',
                backdropFilter: 'blur(20px)',
                position: 'relative',
                zIndex: 1,
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        display: 'inline-flex',
                        background: 'linear-gradient(135deg, #6c63ff, #e040fb)',
                        borderRadius: '16px',
                        padding: '12px',
                        marginBottom: '1rem',
                    }}>
                        <Zap size={28} color="white" />
                    </div>
                    <h1 style={{
                        color: 'white',
                        fontSize: '1.8rem',
                        fontWeight: 800,
                        margin: '0 0 8px',
                        fontFamily: 'monospace',
                    }}>
                        VibeChecker
                    </h1>
                    <p style={{
                        color: 'rgba(255,255,255,0.4)',
                        fontSize: '14px',
                        margin: 0,
                    }}>
                        Sign in to check your code's vibe
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{
                            display: 'block',
                            color: 'rgba(255,255,255,0.6)',
                            fontSize: '13px',
                            marginBottom: '8px',
                            fontWeight: 500,
                        }}>
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            required
                            style={{
                                width: '100%',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(108,99,255,0.3)',
                                borderRadius: '10px',
                                padding: '12px 16px',
                                color: 'white',
                                fontSize: '14px',
                                outline: 'none',
                                boxSizing: 'border-box',
                                transition: 'border-color 0.2s',
                            }}
                            onFocus={e => e.target.style.borderColor = 'rgba(108,99,255,0.8)'}
                            onBlur={e => e.target.style.borderColor = 'rgba(108,99,255,0.3)'}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                            display: 'block',
                            color: 'rgba(255,255,255,0.6)',
                            fontSize: '13px',
                            marginBottom: '8px',
                            fontWeight: 500,
                        }}>
                            Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                                style={{
                                    width: '100%',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(108,99,255,0.3)',
                                    borderRadius: '10px',
                                    padding: '12px 44px 12px 16px',
                                    color: 'white',
                                    fontSize: '14px',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    transition: 'border-color 0.2s',
                                }}
                                onFocus={e => e.target.style.borderColor = 'rgba(108,99,255,0.8)'}
                                onBlur={e => e.target.style.borderColor = 'rgba(108,99,255,0.3)'}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'rgba(255,255,255,0.4)',
                                    padding: 0,
                                    display: 'flex',
                                }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            background: isLoading
                                ? 'rgba(108,99,255,0.4)'
                                : 'linear-gradient(135deg, #6c63ff, #e040fb)',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '13px',
                            color: 'white',
                            fontSize: '15px',
                            fontWeight: 700,
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            transition: 'opacity 0.2s',
                            letterSpacing: '0.5px',
                        }}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p style={{
                    textAlign: 'center',
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: '14px',
                    marginTop: '1.5rem',
                    marginBottom: 0,
                }}>
                    Don't have an account?{' '}
                    <Link to="/register" style={{
                        color: '#6c63ff',
                        textDecoration: 'none',
                        fontWeight: 600,
                    }}>
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;