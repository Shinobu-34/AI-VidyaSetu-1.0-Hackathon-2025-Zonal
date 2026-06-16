import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { bulkClaimItems } from '../services/donations';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CartDrawer() {
    const { cartItems, removeFromCart, updateCartItemQuantity, clearCart, isCartOpen, setIsCartOpen } = useCart();
    const { currentUser, userProfile, addPoints, updateUserProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    if (!isCartOpen) return null;

    const totalItems = cartItems.reduce((sum, item) => sum + item.claimQuantity, 0);

    const handleCheckout = async () => {
        if (!currentUser) {
            setError('Please login to claim items');
            // navigate('/login'); // Optional redirect
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Process claim
            await bulkClaimItems(
                cartItems.map(item => ({ id: item.id, quantity: item.claimQuantity })),
                {
                    uid: currentUser.uid,
                    email: currentUser.email,
                    displayName: userProfile?.displayName || 'User'
                }
            );

            // Add points (e.g. 5 points per claim action, or per item?)
            // Let's say 5 points per unique item claimed
            // await addPoints(cartItems.length * 5); 
            // Actually recordDonation handles donation points, claiming usually doesn't give points but maybe "Activity" points?
            // Existing logic gave 5 points per claim.

            const pointsEarned = cartItems.length * 5;
            const newClaimsCount = (userProfile?.claimsCount || 0) + cartItems.length;
            const newPoints = (userProfile?.points || 0) + pointsEarned;

            // Update profile
            await updateUserProfile({
                claimsCount: newClaimsCount,
                points: newPoints
            });

            setSuccess(true);
            setTimeout(() => {
                clearCart();
                setSuccess(false);
                setIsCartOpen(false);
                navigate('/profile'); // Redirect to profile to see claims
            }, 2000);

        } catch (err) {
            console.error('Checkout error:', err);
            setError('Failed to claim items. Some might be unavailable.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            maxWidth: '400px',
            background: 'white',
            boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.3s ease',
            padding: 'var(--space-6)'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                <h2>Your Cart ({totalItems})</h2>
                <button
                    onClick={() => setIsCartOpen(false)}
                    style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
                >
                    ×
                </button>
            </div>

            {/* Error/Success */}
            {error && <div className="alert alert-error">{error}</div>}
            {success && (
                <div className="alert alert-success" style={{ textAlign: 'center', padding: '2rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                    <h3>Claim Successful!</h3>
                    <p>Items have been added to your profile.</p>
                </div>
            )}

            {/* Items List */}
            {!success && (
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    {cartItems.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 'var(--space-12)' }}>
                            Your cart is empty. <br />
                            Go find some clothes! 👕
                        </div>
                    ) : (
                        cartItems.map(item => (
                            <div key={item.id} className="glass-card" style={{ padding: 'var(--space-4)', display: 'flex', gap: 'var(--space-4)' }}>
                                <img
                                    src={item.imageUrl}
                                    alt={item.title}
                                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                                />
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ fontSize: '0.9rem', marginBottom: '4px' }}>{item.title}</h4>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Size: {item.size}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <button
                                                onClick={() => updateCartItemQuantity(item.id, item.claimQuantity - 1)}
                                                disabled={item.claimQuantity <= 1}
                                                style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #ddd' }}
                                            >-</button>
                                            <span>{item.claimQuantity}</span>
                                            <button
                                                onClick={() => updateCartItemQuantity(item.id, item.claimQuantity + 1)}
                                                disabled={item.claimQuantity >= (item.quantity || 1)}
                                                style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #ddd' }}
                                            >+</button>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            style={{ color: 'var(--error)', background: 'none', border: 'none', fontSize: '0.8rem', cursor: 'pointer' }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                        Max available: {item.quantity || 1}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Footer Actions */}
            {!success && cartItems.length > 0 && (
                <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--border-color)' }}>
                    <button
                        className="btn btn-primary btn-lg"
                        style={{ width: '100%' }}
                        onClick={handleCheckout}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : `Confirm Claim (${totalItems} items)`}
                    </button>
                </div>
            )}
        </div>
    );
}
