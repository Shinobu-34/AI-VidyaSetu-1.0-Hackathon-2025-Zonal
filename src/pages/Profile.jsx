import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserDonations, getUserClaims } from '../services/donations';
import ClothingCard from '../components/ClothingCard';

const LEVELS = [
    { name: 'Newcomer', minPoints: 0, maxPoints: 50, color: '#94a3b8' },
    { name: 'Contributor', minPoints: 51, maxPoints: 150, color: '#22c55e' },
    { name: 'Eco Warrior', minPoints: 151, maxPoints: 300, color: '#3b82f6' },
    { name: 'Sustainability Champion', minPoints: 301, maxPoints: 999999, color: '#ec4899' }
];

export default function Profile() {
    const { currentUser, userProfile, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [donations, setDonations] = useState([]);
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentUser) {
            fetchUserData();
        }
    }, [currentUser]);

    const fetchUserData = async () => {
        try {
            const [userDonations, userClaims] = await Promise.all([
                getUserDonations(currentUser.uid),
                getUserClaims(currentUser.uid)
            ]);
            setDonations(userDonations);
            setClaims(userClaims);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const currentLevel = LEVELS.find(l =>
        (userProfile?.points || 0) >= l.minPoints &&
        (userProfile?.points || 0) <= l.maxPoints
    ) || LEVELS[0];

    const nextLevel = LEVELS[LEVELS.indexOf(currentLevel) + 1];
    const progressToNext = nextLevel
        ? ((userProfile?.points || 0) - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints) * 100
        : 100;

    const badges = [
        { name: 'First Steps', icon: '👣', earned: (userProfile?.donationsCount || 0) >= 1, description: 'Make your first donation' },
        { name: 'Generous Soul', icon: '💝', earned: (userProfile?.donationsCount || 0) >= 5, description: 'Donate 5 items' },
        { name: 'Donation Hero', icon: '🦸', earned: (userProfile?.donationsCount || 0) >= 10, description: 'Donate 10 items' },
        { name: 'Thrift Master', icon: '🛍️', earned: (userProfile?.claimsCount || 0) >= 5, description: 'Claim 5 items' },
        { name: 'Eco Champion', icon: '🌱', earned: (userProfile?.points || 0) >= 100, description: 'Earn 100 points' },
        { name: 'Sustainability Star', icon: '⭐', earned: (userProfile?.points || 0) >= 300, description: 'Reach Champion level' }
    ];

    if (!currentUser) {
        return (
            <div className="page">
                <div className="container" style={{ textAlign: 'center' }}>
                    <div className="empty-state">
                        <div className="empty-state-icon">🔒</div>
                        <h3>Please Log In</h3>
                        <p>You need to be logged in to view your profile.</p>
                        <button onClick={() => navigate('/login')} className="btn btn-primary">
                            Log In
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="container">
                {/* Profile Header */}
                <div className="profile-header">
                    <div className="profile-avatar">
                        {(userProfile?.displayName || currentUser.email)?.charAt(0).toUpperCase()}
                    </div>
                    <div className="profile-info">
                        <h2>{userProfile?.displayName || 'User'}</h2>
                        <p>{currentUser.email}</p>
                        {userProfile?.userType === 'donation_center' && (
                            <span className="badge badge-secondary" style={{ marginTop: 'var(--space-2)' }}>
                                🏢 Donation Center
                            </span>
                        )}
                        <div className="profile-stats">
                            <div className="profile-stat">
                                <div className="profile-stat-value">{userProfile?.points || 0}</div>
                                <div className="profile-stat-label">Points</div>
                            </div>
                            <div className="profile-stat">
                                <div className="profile-stat-value">{userProfile?.donationsCount || 0}</div>
                                <div className="profile-stat-label">Donations</div>
                            </div>
                            <div className="profile-stat">
                                <div className="profile-stat-value">{userProfile?.claimsCount || 0}</div>
                                <div className="profile-stat-label">Claims</div>
                            </div>
                        </div>
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                        <button onClick={handleLogout} className="btn btn-outline">
                            Logout
                        </button>
                    </div>
                </div>

                {/* Level Progress */}
                <div className="glass-card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                        <div>
                            <span className="level-badge" style={{ background: currentLevel.color }}>
                                🏆 {currentLevel.name}
                            </span>
                        </div>
                        {nextLevel && (
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                {nextLevel.minPoints - (userProfile?.points || 0)} points to {nextLevel.name}
                            </span>
                        )}
                    </div>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${progressToNext}%` }}></div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </button>
                    <button
                        className={`tab ${activeTab === 'donations' ? 'active' : ''}`}
                        onClick={() => setActiveTab('donations')}
                    >
                        My Donations
                    </button>
                    <button
                        className={`tab ${activeTab === 'claims' ? 'active' : ''}`}
                        onClick={() => setActiveTab('claims')}
                    >
                        My Claims
                    </button>
                    <button
                        className={`tab ${activeTab === 'badges' ? 'active' : ''}`}
                        onClick={() => setActiveTab('badges')}
                    >
                        Badges
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <div>
                        <div className="features-grid">
                            <div className="glass-card" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-3)' }}>📤</div>
                                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary-light)' }}>
                                    {userProfile?.donationsCount || 0}
                                </div>
                                <div style={{ color: 'var(--text-secondary)' }}>Items Donated</div>
                            </div>
                            <div className="glass-card" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-3)' }}>📥</div>
                                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--secondary)' }}>
                                    {userProfile?.claimsCount || 0}
                                </div>
                                <div style={{ color: 'var(--text-secondary)' }}>Items Claimed</div>
                            </div>
                            <div className="glass-card" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-3)' }}>🎖️</div>
                                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent)' }}>
                                    {badges.filter(b => b.earned).length}
                                </div>
                                <div style={{ color: 'var(--text-secondary)' }}>Badges Earned</div>
                            </div>
                        </div>

                        {/* Recent Badges */}
                        <div style={{ marginTop: 'var(--space-8)' }}>
                            <h3 style={{ marginBottom: 'var(--space-4)' }}>Recent Badges</h3>
                            <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                                {badges.filter(b => b.earned).slice(0, 4).map((badge, i) => (
                                    <div
                                        key={i}
                                        className="glass-card"
                                        style={{
                                            padding: 'var(--space-4)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 'var(--space-3)',
                                            minWidth: '200px'
                                        }}
                                    >
                                        <span style={{ fontSize: '2rem' }}>{badge.icon}</span>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{badge.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{badge.description}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'donations' && (
                    <div>
                        {loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-12)' }}>
                                <div className="spinner"></div>
                            </div>
                        ) : donations.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">📦</div>
                                <h3>No donations yet</h3>
                                <p>Start donating clothes to build your history!</p>
                                <button onClick={() => navigate('/donate')} className="btn btn-primary">
                                    Donate Now
                                </button>
                            </div>
                        ) : (
                            <div className="cards-grid">
                                {donations.map(item => (
                                    <div key={item.id} style={{ position: 'relative' }}>
                                        <ClothingCard item={item} />
                                        <div
                                            className={`badge ${item.status === 'claimed' ? 'badge-success' : 'badge-primary'}`}
                                            style={{ position: 'absolute', top: '12px', right: '12px' }}
                                        >
                                            {item.status === 'claimed' ? '✓ Claimed' : 'Available'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'claims' && (
                    <div>
                        {loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-12)' }}>
                                <div className="spinner"></div>
                            </div>
                        ) : claims.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">🛍️</div>
                                <h3>No claims yet</h3>
                                <p>Browse available items to claim something you love!</p>
                                <button onClick={() => navigate('/claim')} className="btn btn-primary">
                                    Browse Items
                                </button>
                            </div>
                        ) : (
                            <div className="cards-grid">
                                {claims.map(item => (
                                    <div key={item.id} style={{ position: 'relative' }}>
                                        <ClothingCard item={item} />
                                        <div
                                            className="badge badge-success"
                                            style={{ position: 'absolute', top: '12px', right: '12px' }}
                                        >
                                            ✓ Claimed by You
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'badges' && (
                    <div className="features-grid">
                        {badges.map((badge, i) => (
                            <div
                                key={i}
                                className="glass-card"
                                style={{
                                    padding: 'var(--space-6)',
                                    textAlign: 'center',
                                    opacity: badge.earned ? 1 : 0.5,
                                    filter: badge.earned ? 'none' : 'grayscale(100%)'
                                }}
                            >
                                <div style={{ fontSize: '3rem', marginBottom: 'var(--space-3)' }}>
                                    {badge.icon}
                                </div>
                                <h4 style={{ marginBottom: 'var(--space-2)' }}>{badge.name}</h4>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                    {badge.description}
                                </p>
                                {badge.earned && (
                                    <span className="badge badge-success" style={{ marginTop: 'var(--space-3)' }}>
                                        ✓ Earned
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
