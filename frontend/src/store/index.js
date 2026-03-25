import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import menuReducer from './slices/menuSlice.js';
import orderReducer from './slices/orderSlice.js';
import tableReducer from './slices/tableSlice.js';
import dashboardReducer from './slices/dashboardSlice.js';
import cartReducer from './slices/cartSlice.js';
import uiReducer from './slices/uiSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    menu: menuReducer,
    orders: orderReducer,
    tables: tableReducer,
    dashboard: dashboardReducer,
    cart: cartReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});
