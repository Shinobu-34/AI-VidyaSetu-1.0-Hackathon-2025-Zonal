import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useState } from 'react';

export default function Header() {
    const { currentUser, userProfile, logout } = useAuth();
    const { cartItems, toggleCart } = useCart();
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);

    const isActive = (path) => location.pathname === path;

    const cartCount = cartItems.reduce((sum, item) => sum + item.claimQuantity, 0);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const navLinks = [
        { path: '/', label: 'Home' },
        { path: '/donate', label: 'Donate' },
        { path: '/claim', label: 'Claim' },
        { path: '/style-suggestions', label: 'AI Style' },
    ];

    // Add donation center link if user is a donation center
    if (userProfile?.userType === 'donation_center') {
        navLinks.push({ path: '/donation-center', label: 'Center Dashboard' });
    }

    return (
        <header className="header">
            <div className="header-container">
                {/* Logo */}
                <Link to="/" className="header-logo">
                    <img src="/favicon.svg" alt="ClothShare" />
                    <span className="gradient-text">ClothShare</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="header-nav">
                    {navLinks.map(link => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`header-nav-link ${isActive(link.path) ? 'active' : ''}`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Actions */}
                <div className="header-actions">
                    {/* Cart Button */}
                    <button
                        className="btn btn-ghost"
                        onClick={toggleCart}
                        style={{ position: 'relative', marginRight: 'var(--space-2)', fontSize: '1.2rem', padding: 'var(--space-2)' }}
                        title="View Cart"
                    >
                        🛒
                        {cartCount > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: '0',
                                right: '0',
                                background: 'var(--primary)',
                                color: 'white',
                                borderRadius: '50%',
                                fontSize: '0.7rem',
                                width: '18px',
                                height: '18px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px solid white'
                            }}>
                                {cartCount}
                            </span>
                        )}
                    </button>

                    {currentUser ? (
                        <>
                            {/* Points Badge */}
                            <div className="badge badge-primary" style={{ display: 'none' }}>
                                ⭐ {userProfile?.points || 0} pts
                            </div>

                            {/* Profile Avatar */}
                            <div
                                className="header-avatar"
                                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                                title={userProfile?.displayName || currentUser.email}
                            >
                                {(userProfile?.displayName || currentUser.email)?.charAt(0).toUpperCase()}
                            </div>

                            {/* Profile Dropdown */}
                            {profileMenuOpen && (
                                <div
                                    className="profile-dropdown"
                                    style={{
                                        position: 'absolute',
                                        top: '70px',
                                        right: '16px',
                                        background: 'var(--surface)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: 'var(--radius-lg)',
                                        padding: 'var(--space-2)',
                                        minWidth: '200px',
                                        boxShadow: 'var(--shadow-xl)',
                                        zIndex: 1000
                                    }}
                                >
                                    <div style={{ padding: 'var(--space-3)', borderBottom: '1px solid var(--glass-border)' }}>
                                        <div style={{ fontWeight: 600 }}>{userProfile?.displayName}</div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                            {userProfile?.points || 0} points • {userProfile?.level || 'Newcomer'}
                                        </div>
                                    </div>
                                    <Link
                                        to="/profile"
                                        className="header-nav-link"
                                        style={{ display: 'block', padding: 'var(--space-3)' }}
                                        onClick={() => setProfileMenuOpen(false)}
                                    >
                                        👤 Profile
                                    </Link>
                                    <button
                                        onClick={() => { handleLogout(); setProfileMenuOpen(false); }}
                                        className="header-nav-link"
                                        style={{
                                            display: 'block',
                                            width: '100%',
                                            textAlign: 'left',
                                            padding: 'var(--space-3)',
                                            background: 'transparent',
                                            color: 'var(--error)'
                                        }}
                                    >
                                        🚪 Logout
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-ghost">Login</Link>
                            <Link to="/signup" className="btn btn-primary">Sign Up</Link>
                        </>
                    )}

                    {/* Mobile Menu Button */}
                    <button
                        className="mobile-menu-btn"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? '✕' : '☰'}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div
                    className="mobile-menu"
                    style={{
                        position: 'absolute',
                        top: '70px',
                        left: 0,
                        right: 0,
                        background: 'var(--surface)',
                        borderBottom: '1px solid var(--glass-border)',
                        padding: 'var(--space-4)',
                        zIndex: 99
                    }}
                >
                    {navLinks.map(link => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`header-nav-link ${isActive(link.path) ? 'active' : ''}`}
                            style={{ display: 'block', marginBottom: 'var(--space-2)' }}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}
                    {currentUser && (
                        <Link
                            to="/profile"
                            className="header-nav-link"
                            style={{ display: 'block', marginBottom: 'var(--space-2)' }}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Profile
                        </Link>
                    )}
                </div>
            )}

            {/* Click outside to close menus */}
            {(profileMenuOpen || mobileMenuOpen) && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 98
                    }}
                    onClick={() => {
                        setProfileMenuOpen(false);
                        setMobileMenuOpen(false);
                    }}
                />
            )}
        </header>
    );
}
