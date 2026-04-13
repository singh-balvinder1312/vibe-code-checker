import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';

const RegisterPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        setIsLoading(true);
        try {
            await register({ username, email, password });
            toast.success('Account created successfully!');
            navigate('/dashboard');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    const inputStyle = {
        width: '100%',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(108,99,255,0.3)',
        borderRadius: '10px',
        padding: '12px 16px',
        color: 'white',
        fontSize: '14px',
        outline: 'none',
        boxSizing: 'border-box' as const,
        transition: 'border-color 0.2s',
    };

    const labelStyle = {
        display: 'block',
        color: 'rgba(255,255,255,0.6)',
        fontSize: '13px',
        marginBottom: '8px',
        fontWeight: 500,
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
                width: '500px',
                height: '500px',
                background: 'radial-gradient(circle, rgba(224,64,251,0.15) 0%, transparent 70%)',
                top: '-100px',
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
                        Create Account
                    </h1>
                    <p style={{
                        color: 'rgba(255,255,255,0.4)',
                        fontSize: '14px',
                        margin: 0,
                    }}>
                        Start checking your code's vibe today
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={labelStyle}>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="Choose a username"
                            required
                            style={inputStyle}
                            onFocus={e => e.target.style.borderColor = 'rgba(108,99,255,0.8)'}
                            onBlur={e => e.target.style.borderColor = 'rgba(108,99,255,0.3)'}
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={labelStyle}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            style={inputStyle}
                            onFocus={e => e.target.style.borderColor = 'rgba(108,99,255,0.8)'}
                            onBlur={e => e.target.style.borderColor = 'rgba(108,99,255,0.3)'}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={labelStyle}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Min 6 characters"
                                required
                                style={{ ...inputStyle, paddingRight: '44px' }}
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
                            letterSpacing: '0.5px',
                        }}
                    >
                        {isLoading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <p style={{
                    textAlign: 'center',
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: '14px',
                    marginTop: '1.5rem',
                    marginBottom: 0,
                }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{
                        color: '#6c63ff',
                        textDecoration: 'none',
                        fontWeight: 600,
                    }}>
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;