import React from 'react';

const LoadingSpinner: React.FC = () => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            background: '#0a0a0f',
        }}>
            <div style={{
                width: '50px',
                height: '50px',
                border: '3px solid #1a1a2e',
                borderTop: '3px solid #6c63ff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default LoadingSpinner;