import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscribeToDonations, bulkClaimItems, createBulkRequest, getCenterRequests } from '../services/donations';
import ClothingCard from '../components/ClothingCard';
import BulkOrderModal from '../components/BulkOrderModal';

const CLOTHING_TYPES = ['All', 'Shirt', 'Pants', 'Dress', 'Jacket', 'Sweater', 'T-Shirt', 'Jeans', 'Skirt', 'Shorts', 'Accessories', 'Shoes', 'Other'];
const SIZES = ['All', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const CONDITIONS = ['All', 'Like New', 'Good', 'Fair'];
const GENDERS = ['All', "Men's", "Women's", 'Unisex', 'Kids'];

export default function DonationCenter() {
    const { currentUser, userProfile, updateUserProfile } = useAuth();
    const [activeTab, setActiveTab] = useState('browse');
    const [donations, setDonations] = useState([]);
    const [requests, setRequests] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [claimLoading, setClaimLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [filters, setFilters] = useState({
        type: 'All',
        size: 'All',
        condition: 'All',
        gender: 'All'
    });

    useEffect(() => {
        const unsubscribe = subscribeToDonations((items) => {
            setDonations(items);
            setLoading(false);
        });

        if (currentUser) {
            fetchRequests();
        }

        return () => unsubscribe();
    }, [currentUser]);

    const fetchRequests = async () => {
        try {
            const reqs = await getCenterRequests(currentUser.uid);
            setRequests(reqs);
        } catch (error) {
            console.error('Error fetching requests:', error);
        }
    };

    // Apply filters
    const filteredDonations = donations.filter(item => {
        if (filters.type !== 'All' && item.type !== filters.type) return false;
        if (filters.size !== 'All' && item.size !== filters.size) return false;
        if (filters.condition !== 'All' && item.condition !== filters.condition) return false;
        if (filters.gender !== 'All' && item.gender !== filters.gender) return false;
        return true;
    });

    const toggleItemSelection = (itemId) => {
        setSelectedItems(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const selectAllVisible = () => {
        setSelectedItems(filteredDonations.map(d => d.id));
    };

    const clearSelection = () => {
        setSelectedItems([]);
    };

    const handleBulkClaim = async () => {
        if (selectedItems.length === 0) return;

        setClaimLoading(true);
        try {
            // Prepare items with full quantity for bulk claim
            const itemsToClaim = selectedItems.map(id => {
                const item = donations.find(d => d.id === id);
                return {
                    id: id,
                    quantity: item ? (item.quantity || 1) : 1
                };
            });

            const totalQuantity = itemsToClaim.reduce((sum, item) => sum + item.quantity, 0);

            await bulkClaimItems(itemsToClaim, {
                uid: currentUser.uid, // Add generic uid for querying
                centerId: currentUser.uid,
                centerName: userProfile?.organizationName || userProfile?.displayName,
                centerEmail: currentUser.email,
                claimedAt: new Date().toISOString()
            });

            // Update stats
            if (updateUserProfile) {
                const newClaimsCount = (userProfile?.claimsCount || 0) + totalQuantity;
                const newPoints = (userProfile?.points || 0) + (totalQuantity * 5); // 5 points per claimed item
                await updateUserProfile({
                    claimsCount: newClaimsCount,
                    points: newPoints
                });
            }

            setMessage({
                type: 'success',
                text: `Successfully claimed ${totalQuantity} items from ${selectedItems.length} listings!`
            });
            setSelectedItems([]);
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Failed to claim items. Please try again.' });
        } finally {
            setClaimLoading(false);
        }
    };

    const handleBulkRequestSubmit = async (requestData) => {
        try {
            await createBulkRequest({
                ...requestData,
                centerId: currentUser.uid,
                centerName: userProfile?.organizationName || userProfile?.displayName,
                centerEmail: currentUser.email
            });

            setMessage({ type: 'success', text: 'Bulk request submitted successfully!' });
            fetchRequests();
        } catch (error) {
            throw error;
        }
    };

    return (
        <div className="page">
            <div className="container">
                <div className="page-header">
                    <h1>Donation Center <span className="gradient-text">Dashboard</span></h1>
                    <p>
                        Welcome, {userProfile?.organizationName || userProfile?.displayName}!
                        Browse available items or create bulk requests.
                    </p>
                </div>

                {message.text && (
                    <div className={`alert alert-${message.type}`} style={{ marginBottom: 'var(--space-4)' }}>
                        {message.text}
                        <button
                            onClick={() => setMessage({ type: '', text: '' })}
                            style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* Quick Stats */}
                <div className="stats" style={{ marginBottom: 'var(--space-8)' }}>
                    <div className="stat-card">
                        <div className="stat-value">{donations.length}</div>
                        <div className="stat-label">Available Items</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{selectedItems.length}</div>
                        <div className="stat-label">Selected</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{requests.filter(r => r.status === 'pending').length}</div>
                        <div className="stat-label">Pending Requests</div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'browse' ? 'active' : ''}`}
                        onClick={() => setActiveTab('browse')}
                    >
                        📦 Browse & Claim
                    </button>
                    <button
                        className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
                        onClick={() => setActiveTab('requests')}
                    >
                        📋 Bulk Requests
                    </button>
                </div>

                {/* Browse Tab */}
                {activeTab === 'browse' && (
                    <div>
                        {/* Filter Bar */}
                        <div className="filter-bar">
                            <div className="filter-group">
                                <span className="filter-label">Type</span>
                                <select
                                    value={filters.type}
                                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                                    className="filter-select"
                                >
                                    {CLOTHING_TYPES.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="filter-group">
                                <span className="filter-label">Size</span>
                                <select
                                    value={filters.size}
                                    onChange={(e) => setFilters(prev => ({ ...prev, size: e.target.value }))}
                                    className="filter-select"
                                >
                                    {SIZES.map(size => (
                                        <option key={size} value={size}>{size}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="filter-group">
                                <span className="filter-label">Condition</span>
                                <select
                                    value={filters.condition}
                                    onChange={(e) => setFilters(prev => ({ ...prev, condition: e.target.value }))}
                                    className="filter-select"
                                >
                                    {CONDITIONS.map(condition => (
                                        <option key={condition} value={condition}>{condition}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="filter-group">
                                <span className="filter-label">Gender</span>
                                <select
                                    value={filters.gender}
                                    onChange={(e) => setFilters(prev => ({ ...prev, gender: e.target.value }))}
                                    className="filter-select"
                                >
                                    {GENDERS.map(gender => (
                                        <option key={gender} value={gender}>{gender}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Selection Actions */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 'var(--space-4)',
                            flexWrap: 'wrap',
                            gap: 'var(--space-3)'
                        }}>
                            <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>
                                    {filteredDonations.length} items • {selectedItems.length} selected
                                </span>
                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={selectAllVisible}
                                >
                                    Select All
                                </button>
                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={clearSelection}
                                >
                                    Clear
                                </button>
                            </div>

                            <button
                                className="btn btn-primary"
                                onClick={handleBulkClaim}
                                disabled={selectedItems.length === 0 || claimLoading}
                            >
                                {claimLoading ? 'Claiming...' : `Claim Selected (${selectedItems.length})`}
                            </button>
                        </div>

                        {/* Items Grid */}
                        {loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-12)' }}>
                                <div className="spinner"></div>
                            </div>
                        ) : filteredDonations.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">📦</div>
                                <h3>No items match your filters</h3>
                                <p>Try adjusting your filters or check back later.</p>
                            </div>
                        ) : (
                            <div className="cards-grid">
                                {filteredDonations.map(item => (
                                    <div key={item.id} style={{ position: 'relative' }}>
                                        <div
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <ClothingCard
                                                item={item}
                                                selectable={true}
                                                selected={selectedItems.includes(item.id)}
                                                onSelect={toggleItemSelection}
                                            />
                                        </div>
                                        {selectedItems.includes(item.id) && (
                                            <div style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                border: '3px solid var(--primary)',
                                                borderRadius: 'var(--radius-xl)',
                                                pointerEvents: 'none'
                                            }} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Requests Tab */}
                {activeTab === 'requests' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                            <h3>Your Bulk Requests</h3>
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowBulkModal(true)}
                            >
                                + New Request
                            </button>
                        </div>

                        {requests.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">📋</div>
                                <h3>No bulk requests yet</h3>
                                <p>Create a bulk request to specify what items your organization needs.</p>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => setShowBulkModal(true)}
                                >
                                    Create Request
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                                {requests.map(request => (
                                    <div
                                        key={request.id}
                                        className="glass-card"
                                        style={{ padding: 'var(--space-5)' }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                                                    <span className={`badge ${request.priority === 'urgent' ? 'badge-error' : 'badge-primary'}`}>
                                                        {request.priority === 'urgent' ? '🔴 Urgent' : '🟢 Normal'}
                                                    </span>
                                                    <span className={`badge ${request.status === 'pending' ? 'badge-warning' : request.status === 'fulfilled' ? 'badge-success' : 'badge-secondary'}`}>
                                                        {request.status}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                    Created: {new Date(request.createdAt?.seconds * 1000 || request.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-light)' }}>
                                                    {request.quantity}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>items requested</div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', marginTop: 'var(--space-3)' }}>
                                            <div>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Types: </span>
                                                {request.types?.map((t, i) => (
                                                    <span key={i} className="badge badge-primary" style={{ marginRight: 'var(--space-1)' }}>{t}</span>
                                                ))}
                                            </div>
                                            <div>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sizes: </span>
                                                {request.sizes?.map((s, i) => (
                                                    <span key={i} className="badge badge-secondary" style={{ marginRight: 'var(--space-1)' }}>{s}</span>
                                                ))}
                                            </div>
                                            <div>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Min. Condition: </span>
                                                <span>{request.minCondition}</span>
                                            </div>
                                        </div>

                                        {request.notes && (
                                            <p style={{ marginTop: 'var(--space-3)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                📝 {request.notes}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Bulk Order Modal */}
                {showBulkModal && (
                    <BulkOrderModal
                        onClose={() => setShowBulkModal(false)}
                        onSubmit={handleBulkRequestSubmit}
                    />
                )}
            </div>
        </div>
    );
}
