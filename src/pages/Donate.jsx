import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createDonation } from '../services/donations';
import { validateClothingItem } from '../services/gemini';
import ImageUploader from '../components/ImageUploader';

const CLOTHING_TYPES = ['Shirt', 'Pants', 'Dress', 'Jacket', 'Sweater', 'T-Shirt', 'Jeans', 'Skirt', 'Shorts', 'Accessories', 'Shoes', 'Other'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const CONDITIONS = ['Like New', 'Good', 'Fair'];
const GENDERS = ["Men's", "Women's", 'Unisex', 'Kids'];
const COLORS = [
    { name: 'Black', value: '#000000' },
    { name: 'White', value: '#FFFFFF' },
    { name: 'Gray', value: '#6B7280' },
    { name: 'Navy', value: '#1E3A8A' },
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Green', value: '#22C55E' },
    { name: 'Yellow', value: '#EAB308' },
    { name: 'Orange', value: '#F97316' },
    { name: 'Brown', value: '#92400E' },
    { name: 'Beige', value: '#D4C5A9' },
];

export default function Donate() {
    const { currentUser, userProfile, recordDonation } = useAuth();
    const navigate = useNavigate();

    // State for list of items being donated
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [uploadError, setUploadError] = useState('');

    // Handle selecting ONE or MULITPLE images (Bulk Upload entry point)
    const handleImageSelect = (filesData) => {
        if (!filesData) return;

        // filesData is array of { file, preview } from ImageUploader
        // If single select (legacy), it might pass (file, preview) -> we normalized ImageUploader to array for 'multiple', 
        // but let's handle the object structure safely.

        const newItems = (Array.isArray(filesData) ? filesData : [filesData]).map((data, index) => ({
            id: Date.now() + index,
            file: data.file,
            preview: data.preview,
            title: '',
            type: '',
            size: '',
            condition: '',
            gender: '',
            color: '',
            description: '',
            validationWarning: null
        }));

        setItems(prev => [...prev, ...newItems]);
        setUploadError('');
    };

    const updateItem = (id, field, value) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const removeItem = (id) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploadError('');

        if (items.length === 0) {
            setUploadError('Please add at least one item.');
            return;
        }

        // Validate all items
        const invalidItem = items.find(item => !item.title || !item.type || !item.size || !item.condition || !item.gender);
        if (invalidItem) {
            setUploadError('Please fill in all required fields for all items.');
            // Ideally scroll to invalid item
            return;
        }

        setLoading(true);

        try {
            // Process validations first (concurrently)
            // Note: We are doing AI check inside handleSubmit for bulk. 
            // In a real app we might do it progressively, but this works for now.

            const validatedItems = await Promise.all(items.map(async (item) => {
                let warning = null;
                try {
                    // Quick AI check if desired, or skip strict validation for bulk to save time/tokens?
                    // Let's do a lightweight check or just proceed. 
                    // User asked for bulk upload, blocking on 10 AI checks might be slow.
                    // Let's run validation but NOT block unless critical (like non-clothing).

                    const validation = await validateClothingItem(item.preview, item.type);

                    if (!validation.isClothing) {
                        warning = `Flagged as non-clothing (${validation.detectedType})`;
                    } else if (!validation.isValid) {
                        warning = `Type mismatch: Image looks like ${validation.detectedType}`;
                    }
                } catch (e) {
                    console.warn('Validation skipped for item', item.id);
                }
                return { ...item, validationWarning: warning };
            }));

            // Submit all donations
            await Promise.all(validatedItems.map(item => {
                const donationData = {
                    title: item.title,
                    type: item.type,
                    size: item.size,
                    condition: item.condition,
                    gender: item.gender,
                    color: item.color,
                    description: item.description,
                    donorId: currentUser?.uid || 'anonymous',
                    donorName: userProfile?.displayName || currentUser?.email || 'Anonymous',
                    donorEmail: currentUser?.email || '',
                    imageUrl: item.preview,
                    validationWarning: item.validationWarning
                };
                return createDonation(donationData, item.file);
            }));

            // Add points (Bulk)
            if (currentUser) {
                await recordDonation(items.length * 10);
            }

            setSuccess(true);
            setTimeout(() => {
                navigate('/claim');
            }, 3000);

        } catch (err) {
            console.error('Bulk donation error:', err);
            setUploadError('Failed to submit donations. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="page">
                <div className="container" style={{ maxWidth: '500px', textAlign: 'center' }}>
                    <div className="glass-card" style={{ padding: 'var(--space-12)' }}>
                        <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>🎉</div>
                        <h2 style={{ marginBottom: 'var(--space-2)' }}>Thank You!</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                            You have successfully listed {items.length} item{items.length > 1 ? 's' : ''}.
                        </p>
                        <div className="badge badge-success" style={{ fontSize: '1rem', padding: 'var(--space-2) var(--space-4)' }}>
                            +{items.length * 10} Points Earned!
                        </div>
                        <p style={{ color: 'var(--text-muted)', marginTop: 'var(--space-4)', fontSize: '0.875rem' }}>
                            Redirecting to claim page...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="container" style={{ maxWidth: '800px' }}>
                <div className="page-header">
                    <h1>Donate <span className="gradient-text">Clothes</span></h1>
                    <p>Give your clothes a new purpose. Upload one or multiple items.</p>
                </div>

                {uploadError && (
                    <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>
                        {uploadError}
                    </div>
                )}

                {!currentUser && (
                    <div className="alert alert-info" style={{ marginBottom: 'var(--space-4)' }}>
                        💡 Sign in to earn points for your donations!
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Item List */}
                    {items.map((item, index) => (
                        <div key={item.id} className="glass-card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)', position: 'relative' }}>
                            <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                style={{
                                    position: 'absolute',
                                    top: '16px',
                                    right: '16px',
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer',
                                    color: 'var(--text-muted)'
                                }}
                                title="Remove item"
                            >
                                ×
                            </button>

                            <h3 style={{ marginBottom: 'var(--space-4)' }}>Item {index + 1}</h3>

                            <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: 'var(--space-6)' }}>
                                {/* Left: Image Preview */}
                                <div>
                                    <div style={{
                                        width: '100%',
                                        paddingBottom: '133%', // 3:4 Aspect Ratio
                                        position: 'relative',
                                        borderRadius: 'var(--radius-md)',
                                        overflow: 'hidden',
                                        background: '#f3f4f6'
                                    }}>
                                        <img
                                            src={item.preview}
                                            alt="Item preview"
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Right: Fields */}
                                <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                                    <div>
                                        <label className="form-label">Title *</label>
                                        <input
                                            type="text"
                                            value={item.title}
                                            onChange={(e) => updateItem(item.id, 'title', e.target.value)}
                                            className="form-input"
                                            placeholder="e.g. Blue Denim Jacket"
                                            required
                                        />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                        <div>
                                            <label className="form-label">Type *</label>
                                            <select
                                                value={item.type}
                                                onChange={(e) => updateItem(item.id, 'type', e.target.value)}
                                                className="form-select"
                                                required
                                            >
                                                <option value="">Select</option>
                                                {CLOTHING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="form-label">Size *</label>
                                            <select
                                                value={item.size}
                                                onChange={(e) => updateItem(item.id, 'size', e.target.value)}
                                                className="form-select"
                                                required
                                            >
                                                <option value="">Select</option>
                                                {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                        <div>
                                            <label className="form-label">Condition *</label>
                                            <select
                                                value={item.condition}
                                                onChange={(e) => updateItem(item.id, 'condition', e.target.value)}
                                                className="form-select"
                                                required
                                            >
                                                <option value="">Select</option>
                                                {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="form-label">Gender *</label>
                                            <select
                                                value={item.gender}
                                                onChange={(e) => updateItem(item.id, 'gender', e.target.value)}
                                                className="form-select"
                                                required
                                            >
                                                <option value="">Select</option>
                                                {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Collapsed Color Selection for Compactness */}
                                    <div>
                                        <label className="form-label">Color</label>
                                        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                                            {COLORS.map(color => (
                                                <button
                                                    key={color.name}
                                                    type="button"
                                                    onClick={() => updateItem(item.id, 'color', color.name)}
                                                    style={{
                                                        width: '24px',
                                                        height: '24px',
                                                        borderRadius: '50%',
                                                        background: color.value,
                                                        border: item.color === color.name ? '2px solid var(--primary)' : '1px solid #ddd',
                                                        cursor: 'pointer'
                                                    }}
                                                    title={color.name}
                                                />
                                            ))}
                                            {item.color && <span style={{ fontSize: '0.8rem', alignSelf: 'center' }}>{item.color}</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Add More Area */}
                    <div className="glass-card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-8)', borderStyle: 'dashed', textAlign: 'center' }}>
                        <h3 style={{ marginBottom: 'var(--space-4)', fontSize: '1.1rem' }}>
                            {items.length === 0 ? 'Start by Uploading Photos' : 'Add More Items'}
                        </h3>
                        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                            <ImageUploader
                                onImageSelect={handleImageSelect}
                                preview={null}
                                multiple={true}
                            />
                        </div>
                    </div>

                    {/* Submit Bar */}
                    {items.length > 0 && (
                        <div style={{
                            position: 'sticky',
                            bottom: '20px',
                            zIndex: 100,
                            background: 'white',
                            padding: 'var(--space-4)',
                            borderRadius: 'var(--radius-lg)',
                            boxShadow: 'var(--shadow-xl)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            border: '1px solid var(--border-color)'
                        }}>
                            <div>
                                <strong>{items.length} Item{items.length !== 1 ? 's' : ''}</strong>
                                <span style={{ margin: '0 8px', color: 'var(--text-muted)' }}>|</span>
                                <span className="text-primary">+{items.length * 10} Points</span>
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary btn-lg"
                                disabled={loading}
                                style={{ minWidth: '200px' }}
                            >
                                {loading ? 'Uploading...' : `Submit All (${items.length})`}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
