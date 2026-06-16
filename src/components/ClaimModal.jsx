import { useState } from 'react';
import { useCart } from '../context/CartContext';

export default function ClaimModal({ item, onClose }) {
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);

    // Safety check for max quantity
    const maxQuantity = item.quantity || 1;

    const handleAddToCart = () => {
        addToCart(item, quantity);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                <div className="modal-header">
                    <h3 className="modal-title">Add to Cart</h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    {/* Item Preview */}
                    <div style={{
                        display: 'flex',
                        gap: 'var(--space-4)',
                        marginBottom: 'var(--space-6)',
                        padding: 'var(--space-4)',
                        background: 'var(--surface-light)',
                        borderRadius: 'var(--radius-lg)'
                    }}>
                        <img
                            src={item.imageUrl || `https://via.placeholder.com/100x100?text=${encodeURIComponent(item.type)}`}
                            alt={item.title}
                            style={{
                                width: '80px',
                                height: '80px',
                                objectFit: 'cover',
                                borderRadius: 'var(--radius-md)'
                            }}
                        />
                        <div>
                            <h4 style={{ marginBottom: 'var(--space-1)' }}>{item.title}</h4>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                {item.type} • {item.size} • {item.condition}
                            </p>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                Available: {maxQuantity}
                            </p>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Quantity</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                            <button
                                className="btn btn-outline"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                disabled={quantity <= 1}
                                style={{ width: '40px' }}
                            >
                                -
                            </button>
                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{quantity}</span>
                            <button
                                className="btn btn-outline"
                                onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                                disabled={quantity >= maxQuantity}
                                style={{ width: '40px' }}
                            >
                                +
                            </button>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button
                        className="btn btn-ghost"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleAddToCart}
                    >
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
}
