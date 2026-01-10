import { create } from 'zustand';

/**
 * Booking Store
 * Manages the shopping cart state for ticket booking.
 */
const useBookingStore = create((set, get) => ({
    selectedSeatIds: [], // Deprecated in favor of cartItems check, kept for backward compat if needed? No, let's sync them.
    cartItems: [], // Array of { id, label, price, category, zone }

    // Add item to cart
    addToCart: (item) => set((state) => {
        if (state.cartItems.find(i => i.id === item.id)) return state;
        const newItems = [...state.cartItems, item];
        return {
            cartItems: newItems,
            selectedSeatIds: newItems.map(i => i.id)
        };
    }),

    // Remove item from cart
    removeFromCart: (itemId) => set((state) => {
        const newItems = state.cartItems.filter(i => i.id !== itemId);
        return {
            cartItems: newItems,
            selectedSeatIds: newItems.map(i => i.id)
        };
    }),

    // Toggle logic for backward compatibility (Viewer usage)
    toggleSeat: (item) => {
        const state = get();
        const exists = state.cartItems.find(i => i.id === item.id);
        if (exists) {
            state.removeFromCart(item.id);
        } else {
            state.addToCart(item);
        }
    },

    // Clear cart
    clearCart: () => set({ cartItems: [], selectedSeatIds: [] }),

    // Computed: Total Amount
    totalAmount: () => {
        return get().cartItems.reduce((acc, item) => acc + (item.price || 0), 0);
    }
}));

export default useBookingStore;
