import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Code2, LayoutDashboard, History, LogOut, Zap } from 'lucide-react';

const Navbar: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <nav style={{
            background: 'rgba(10, 10, 20, 0.95)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(108, 99, 255, 0.2)',
            padding: '0 2rem',
            height: '65px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
        }}>
            <Link to="/dashboard" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                textDecoration: 'none',
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, #6c63ff, #e040fb)',
                    borderRadius: '10px',
                    padding: '6px',
                    display: 'flex',
                }}>
                    <Zap size={20} color="white" />
                </div>
                <span style={{
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    fontFamily: 'monospace',
                }}>
          VibeChecker
        </span>
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <NavLink
                    to="/dashboard"
                    active={isActive('/dashboard')}
                    icon={<LayoutDashboard size={16} />}
                    label="Dashboard"
                />
                <NavLink
                    to="/scan"
                    active={isActive('/scan')}
                    icon={<Code2 size={16} />}
                    label="New Scan"
                />
                <NavLink
                    to="/history"
                    active={isActive('/history')}
                    icon={<History size={16} />}
                    label="History"
                />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(108, 99, 255, 0.1)',
                    border: '1px solid rgba(108, 99, 255, 0.3)',
                    borderRadius: '20px',
                    padding: '6px 14px',
                }}>
                    <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6c63ff, #e040fb)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '12px',
                    }}>
                        {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <span style={{
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: '14px',
                    }}>
            {user?.username}
          </span>
                </div>

                <button
                    onClick={handleLogout}
                    style={{
                        background: 'rgba(255, 70, 70, 0.1)',
                        border: '1px solid rgba(255, 70, 70, 0.3)',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        color: '#ff6b6b',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '13px',
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                        (e.target as HTMLElement).style.background = 'rgba(255,70,70,0.2)';
                    }}
                    onMouseLeave={e => {
                        (e.target as HTMLElement).style.background = 'rgba(255,70,70,0.1)';
                    }}
                >
                    <LogOut size={14} />
                    Logout
                </button>
            </div>
        </nav>
    );
};

const NavLink: React.FC<{
    to: string;
    active: boolean;
    icon: React.ReactNode;
    label: string;
}> = ({ to, active, icon, label }) => (
    <Link
        to={to}
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '8px',
            textDecoration: 'none',
            color: active ? 'white' : 'rgba(255,255,255,0.5)',
            background: active ? 'rgba(108,99,255,0.2)' : 'transparent',
            border: active ? '1px solid rgba(108,99,255,0.4)' : '1px solid transparent',
            fontSize: '14px',
            transition: 'all 0.2s',
        }}
    >
        {icon}
        {label}
    </Link>
);

export default Navbar;