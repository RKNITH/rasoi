// cartSlice.js
import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], orderType: 'dine-in', tableId: null, specialInstructions: '' },
  reducers: {
    addToCart: (state, action) => {
      const { item, quantity = 1, specialInstructions } = action.payload;
      const existing = state.items.find(i => i.menuItem === item._id);
      if (existing) {
        existing.quantity += quantity;
      } else {
        state.items.push({ menuItem: item._id, name: item.name, price: item.discountedPrice || item.price, image: item.image, quantity, specialInstructions: specialInstructions || '' });
      }
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(i => i.menuItem !== action.payload);
    },
    updateQuantity: (state, action) => {
      const { menuItemId, quantity } = action.payload;
      const item = state.items.find(i => i.menuItem === menuItemId);
      if (item) {
        if (quantity <= 0) state.items = state.items.filter(i => i.menuItem !== menuItemId);
        else item.quantity = quantity;
      }
    },
    clearCart: (state) => { state.items = []; state.specialInstructions = ''; },
    setOrderType: (state, action) => { state.orderType = action.payload; },
    setTableId: (state, action) => { state.tableId = action.payload; },
    setSpecialInstructions: (state, action) => { state.specialInstructions = action.payload; }
  }
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, setOrderType, setTableId, setSpecialInstructions } = cartSlice.actions;
export const selectCartTotal = state => state.cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
export const selectCartItemCount = state => state.cart.items.reduce((sum, i) => sum + i.quantity, 0);
export default cartSlice.reducer;
