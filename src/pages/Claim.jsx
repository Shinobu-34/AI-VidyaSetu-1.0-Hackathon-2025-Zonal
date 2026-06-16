import { useState, useEffect } from 'react';

import { subscribeToDonations } from '../services/donations';
import ClothingCard from '../components/ClothingCard';
import ClaimModal from '../components/ClaimModal';

const CLOTHING_TYPES = ['All', 'Shirt', 'Pants', 'Dress', 'Jacket', 'Sweater', 'T-Shirt', 'Jeans', 'Skirt', 'Shorts', 'Accessories', 'Shoes', 'Other'];
const SIZES = ['All', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const CONDITIONS = ['All', 'Like New', 'Good', 'Fair'];
const GENDERS = ['All', "Men's", "Women's", 'Unisex', 'Kids'];

export default function Claim() {
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);

    const [filters, setFilters] = useState({
        type: 'All',
        size: 'All',
        condition: 'All',
        gender: 'All',
        search: ''
    });

    useEffect(() => {
        // Subscribe to real-time updates
        const unsubscribe = subscribeToDonations((items) => {
            setDonations(items);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Apply filters
    const filteredDonations = donations.filter(item => {
        if (filters.type !== 'All' && item.type !== filters.type) return false;
        if (filters.size !== 'All' && item.size !== filters.size) return false;
        if (filters.condition !== 'All' && item.condition !== filters.condition) return false;
        if (filters.gender !== 'All' && item.gender !== filters.gender) return false;
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            if (!item.title?.toLowerCase().includes(searchLower) &&
                !item.description?.toLowerCase().includes(searchLower)) {
                return false;
            }
        }
        return true;
    });

    // Removed handleClaim as it's handled by CartDrawer now

    return (
        <div className="page">
            <div className="container">
                <div className="page-header">
                    <h1>Claim <span className="gradient-text">Items</span></h1>
                    <p>Browse available donations and find clothes that suit your needs</p>
                </div>

                {/* Filters */}
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

                    <div className="filter-search">
                        <span className="filter-label">Search</span>
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            placeholder="Search items..."
                        />
                    </div>
                </div>

                {/* Results Count */}
                <p style={{
                    color: 'var(--text-secondary)',
                    marginBottom: 'var(--space-4)'
                }}>
                    Showing {filteredDonations.length} items
                </p>

                {/* Loading State */}
                {loading && (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-12)' }}>
                        <div className="spinner"></div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && filteredDonations.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-state-icon">👗</div>
                        <h3>No items found</h3>
                        <p>
                            {filters.search || filters.type !== 'All' || filters.size !== 'All'
                                ? 'Try adjusting your filters'
                                : 'Be the first to donate!'}
                        </p>
                    </div>
                )}

                {/* Items Grid */}
                {!loading && filteredDonations.length > 0 && (
                    <div className="cards-grid">
                        {filteredDonations.map(item => (
                            <ClothingCard
                                key={item.id}
                                item={item}
                                onClaim={() => setSelectedItem(item)}
                            />
                        ))}
                    </div>
                )}

                {/* Claim Modal */}
                {selectedItem && (
                    <ClaimModal
                        item={selectedItem}
                        onClose={() => setSelectedItem(null)}
                    />
                )}
            </div>
        </div>
    );
}
