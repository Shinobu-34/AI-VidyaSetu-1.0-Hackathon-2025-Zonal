import { useState } from 'react';

const CLOTHING_TYPES = ['Shirt', 'Pants', 'Dress', 'Jacket', 'Sweater', 'T-Shirt', 'Jeans', 'Skirt', 'Shorts', 'Accessories', 'Shoes', 'Other'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const CONDITIONS = ['Like New', 'Good', 'Fair'];
const GENDERS = ["Men's", "Women's", 'Unisex', 'Kids'];

export default function BulkOrderModal({ onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        types: [],
        sizes: [],
        genders: [],
        quantity: 10,
        minCondition: 'Good',
        priority: 'normal',
        notes: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const toggleArrayItem = (field, item) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].includes(item)
                ? prev[field].filter(i => i !== item)
                : [...prev[field], item]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.types.length === 0) {
            setError('Please select at least one clothing type');
            return;
        }

        if (formData.sizes.length === 0) {
            setError('Please select at least one size');
            return;
        }

        setLoading(true);

        try {
            await onSubmit(formData);
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to submit request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                <div className="modal-header">
                    <h3 className="modal-title">Create Bulk Order Request</h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    {error && (
                        <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Clothing Types */}
                        <div className="form-group">
                            <label className="form-label">Clothing Types Needed *</label>
                            <div className="multi-select">
                                {CLOTHING_TYPES.map(type => (
                                    <button
                                        key={type}
                                        type="button"
                                        className={`multi-select-option ${formData.types.includes(type) ? 'selected' : ''}`}
                                        onClick={() => toggleArrayItem('types', type)}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sizes */}
                        <div className="form-group">
                            <label className="form-label">Sizes Needed *</label>
                            <div className="multi-select">
                                {SIZES.map(size => (
                                    <button
                                        key={size}
                                        type="button"
                                        className={`multi-select-option ${formData.sizes.includes(size) ? 'selected' : ''}`}
                                        onClick={() => toggleArrayItem('sizes', size)}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Genders */}
                        <div className="form-group">
                            <label className="form-label">Gender Categories</label>
                            <div className="multi-select">
                                {GENDERS.map(gender => (
                                    <button
                                        key={gender}
                                        type="button"
                                        className={`multi-select-option ${formData.genders.includes(gender) ? 'selected' : ''}`}
                                        onClick={() => toggleArrayItem('genders', gender)}
                                    >
                                        {gender}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quantity Slider */}
                        <div className="form-group">
                            <label className="form-label">Quantity Needed</label>
                            <div className="range-container">
                                <input
                                    type="range"
                                    min="1"
                                    max="100"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                                    className="range-slider"
                                />
                                <div className="range-value">{formData.quantity}</div>
                            </div>
                        </div>

                        {/* Minimum Condition */}
                        <div className="form-group">
                            <label className="form-label">Minimum Acceptable Condition</label>
                            <div className="multi-select">
                                {CONDITIONS.map(condition => (
                                    <button
                                        key={condition}
                                        type="button"
                                        className={`multi-select-option ${formData.minCondition === condition ? 'selected' : ''}`}
                                        onClick={() => setFormData(prev => ({ ...prev, minCondition: condition }))}
                                    >
                                        {condition}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Priority */}
                        <div className="form-group">
                            <label className="form-label">Priority Level</label>
                            <div className="multi-select">
                                <button
                                    type="button"
                                    className={`multi-select-option ${formData.priority === 'normal' ? 'selected' : ''}`}
                                    onClick={() => setFormData(prev => ({ ...prev, priority: 'normal' }))}
                                >
                                    🟢 Normal
                                </button>
                                <button
                                    type="button"
                                    className={`multi-select-option ${formData.priority === 'urgent' ? 'selected' : ''}`}
                                    onClick={() => setFormData(prev => ({ ...prev, priority: 'urgent' }))}
                                    style={formData.priority === 'urgent' ? {
                                        background: 'var(--error)',
                                        borderColor: 'var(--error)'
                                    } : {}}
                                >
                                    🔴 Urgent
                                </button>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="form-group">
                            <label className="form-label">Additional Notes</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                className="form-textarea"
                                placeholder="E.g., Winter clothing drive, School uniforms needed, etc."
                                rows={3}
                            />
                        </div>
                    </form>
                </div>

                <div className="modal-footer">
                    <button
                        className="btn btn-ghost"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? 'Submitting...' : 'Submit Request'}
                    </button>
                </div>
            </div>
        </div>
    );
}
