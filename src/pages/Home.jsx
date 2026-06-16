import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
    const { currentUser } = useAuth();

    return (
        <div className="page">
            {/* Hero Section */}
            <section className="hero">
                <div className="container">
                    <div className="hero-content">
                        <h1>
                            Give Your Clothes a <span className="gradient-text">Second Life</span>
                        </h1>
                        <p>
                            Join our community of conscious fashion lovers. Donate clothes you no longer need,
                            claim items that suit your style, and get AI-powered outfit suggestions.
                        </p>
                        <div className="hero-buttons">
                            <Link to="/donate" className="btn btn-primary btn-lg">
                                ✨ Donate Now
                            </Link>
                            <Link to="/claim" className="btn btn-outline btn-lg">
                                👗 Browse Items
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Impact Initiative Section */}
            <section className="container" style={{ marginBottom: 'var(--space-12)' }}>
                <div className="glass-card" style={{
                    padding: 'var(--space-10)',
                    textAlign: 'center',
                    border: '1px solid var(--accent)',
                    background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.9), rgba(17, 24, 39, 0.95))',
                    boxShadow: '0 0 30px rgba(245, 158, 11, 0.15)'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>🧸❤️</div>
                    <h2 style={{ marginBottom: 'var(--space-4)', color: 'var(--text-primary)' }}>
                        Warmth for <span style={{ color: 'var(--accent)' }}>Every Child</span>
                    </h2>
                    <p style={{
                        fontSize: '1.2rem',
                        color: 'var(--text-secondary)',
                        maxWidth: '700px',
                        margin: '0 auto var(--space-6)',
                        lineHeight: '1.6'
                    }}>
                        <b>Fashion ensures warmth.</b> We have launched a dedicated initiative to provide high-quality winter wear and essential clothing to underprivileged children in orphanages.
                        <br /><br />
                        Every donation you make helps us build care packages for kids in need. Together, we can ensure no child goes cold this season.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)' }}>
                        <Link to="/donate" className="btn" style={{ background: 'var(--gradient-accent)', color: 'white' }}>
                            Donate Kids' Clothes
                        </Link>
                        <Link to="/donation-center" className="btn btn-outline" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>
                            Partner Organization?
                        </Link>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="container">
                <div className="stats">
                    <div className="stat-card">
                        <div className="stat-value">500+</div>
                        <div className="stat-label">Items Donated</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">350+</div>
                        <div className="stat-label">Items Claimed</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">200+</div>
                        <div className="stat-label">Happy Users</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">50+</div>
                        <div className="stat-label">Donation Centers</div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features container">
                <div className="page-header">
                    <h2>How It <span className="gradient-text">Works</span></h2>
                    <p>Three simple steps to make a difference in someone's life</p>
                </div>

                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">📸</div>
                        <h3>1. Donate Clothes</h3>
                        <p>
                            Snap a photo, add details about your item, and list it for others to claim.
                            Earn points for every donation!
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">🛍️</div>
                        <h3>2. Claim Items</h3>
                        <p>
                            Browse available clothes, filter by size and type, and claim items that match your needs.
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">🤖</div>
                        <h3>3. AI Style Matching</h3>
                        <p>
                            Upload a photo of your clothes and let our AI suggest matching items from available donations.
                        </p>
                    </div>
                </div>
            </section>

            {/* Donation Centers CTA */}
            <section className="container" style={{ paddingBottom: 'var(--space-16)' }}>
                <div
                    className="glass-card"
                    style={{
                        padding: 'var(--space-10)',
                        textAlign: 'center',
                        background: 'var(--gradient-hero)'
                    }}
                >
                    <h2 style={{ marginBottom: 'var(--space-4)' }}>
                        Are You a <span className="gradient-text">Donation Center</span>?
                    </h2>
                    <p style={{
                        color: 'var(--text-secondary)',
                        maxWidth: '600px',
                        margin: '0 auto var(--space-6)'
                    }}>
                        Sign up as a donation center to request bulk items based on your community's needs.
                        Filter by quantity, quality, and sizes.
                    </p>
                    {!currentUser ? (
                        <Link to="/signup" className="btn btn-secondary btn-lg">
                            🏢 Register as Donation Center
                        </Link>
                    ) : (
                        <Link to="/donation-center" className="btn btn-secondary btn-lg">
                            🏢 Go to Center Dashboard
                        </Link>
                    )}
                </div>
            </section>

            {/* Gamification Section */}
            <section className="container" style={{ paddingBottom: 'var(--space-16)' }}>
                <div className="page-header">
                    <h2>Earn <span className="gradient-text">Rewards</span></h2>
                    <p>The more you contribute, the more you level up!</p>
                </div>

                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">⭐</div>
                        <h3>Earn Points</h3>
                        <p>Get 10 points for each donation and 5 points for each claim.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">🏆</div>
                        <h3>Level Up</h3>
                        <p>Progress from Newcomer to Sustainability Champion as you earn more points.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">🎖️</div>
                        <h3>Unlock Badges</h3>
                        <p>Earn special badges for milestones like your first donation or reaching 10 donations.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
