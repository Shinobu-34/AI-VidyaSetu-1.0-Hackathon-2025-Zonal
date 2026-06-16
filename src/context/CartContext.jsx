import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function useCart() {
    return useContext(CartContext);
}

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Initial load from local storage if desired, but for now session based is fine

    const addToCart = (item, quantity = 1) => {
        setCartItems(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                // Update quantity, capping at item.quantity (available)
                const newQty = Math.min(existing.claimQuantity + quantity, item.quantity || 1);
                return prev.map(i => i.id === item.id ? { ...i, claimQuantity: newQty } : i);
            }
            return [...prev, { ...item, claimQuantity: quantity }];
        });
        setIsCartOpen(true);
    };

    const removeFromCart = (itemId) => {
        setCartItems(prev => prev.filter(i => i.id !== itemId));
    };

    const updateCartItemQuantity = (itemId, quantity) => {
        setCartItems(prev => prev.map(item => {
            if (item.id === itemId) {
                // Ensure we don't exceed available
                const max = item.quantity || 1;
                const newQty = Math.min(Math.max(1, quantity), max);
                return { ...item, claimQuantity: newQty };
            }
            return item;
        }));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const toggleCart = () => setIsCartOpen(!isCartOpen);

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        toggleCart
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}
