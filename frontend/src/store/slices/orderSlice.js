import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';

export const fetchOrders = createAsyncThunk('orders/fetch', async (params, { rejectWithValue }) => {
  try { const res = await api.get('/orders', { params }); return res.data; }
  catch (err) { return rejectWithValue(err.response?.data); }
});

export const fetchOrder = createAsyncThunk('orders/fetchOne', async (id, { rejectWithValue }) => {
  try { const res = await api.get(`/orders/${id}`); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data); }
});

export const placeOrder = createAsyncThunk('orders/place', async (data, { rejectWithValue }) => {
  try { const res = await api.post('/orders', data); toast.success('Order placed!'); return res.data.data; }
  catch (err) { toast.error(err.response?.data?.message || 'Failed'); return rejectWithValue(err.response?.data); }
});

export const updateOrderStatus = createAsyncThunk('orders/updateStatus', async ({ id, status, note }, { rejectWithValue }) => {
  try { const res = await api.patch(`/orders/${id}/status`, { status, note }); toast.success(`Status updated to ${status}`); return res.data.data; }
  catch (err) { toast.error(err.response?.data?.message || 'Failed'); return rejectWithValue(err.response?.data); }
});

export const updateOrderPayment = createAsyncThunk('orders/updatePayment', async ({ id, paymentStatus, paymentMethod }, { rejectWithValue }) => {
  try { const res = await api.patch(`/orders/${id}/payment`, { paymentStatus, paymentMethod }); toast.success('Payment updated!'); return res.data.data; }
  catch (err) { toast.error(err.response?.data?.message || 'Failed'); return rejectWithValue(err.response?.data); }
});

export const fetchOrderStats = createAsyncThunk('orders/stats', async (_, { rejectWithValue }) => {
  try { const res = await api.get('/orders/stats'); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data); }
});

const orderSlice = createSlice({
  name: 'orders',
  initialState: { orders: [], currentOrder: null, stats: null, pagination: null, isLoading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => { state.isLoading = true; })
      .addCase(fetchOrders.fulfilled, (state, action) => { state.isLoading = false; state.orders = action.payload.data; state.pagination = action.payload.pagination; })
      .addCase(fetchOrders.rejected, (state, action) => { state.isLoading = false; state.error = action.payload?.message; })
      .addCase(fetchOrder.fulfilled, (state, action) => { state.currentOrder = action.payload; })
      .addCase(placeOrder.fulfilled, (state, action) => { state.orders.unshift(action.payload); state.currentOrder = action.payload; })
      .addCase(updateOrderStatus.fulfilled, (state, action) => { const idx = state.orders.findIndex(o => o._id === action.payload._id); if (idx !== -1) state.orders[idx] = action.payload; state.currentOrder = action.payload; })
      .addCase(updateOrderPayment.fulfilled, (state, action) => { const idx = state.orders.findIndex(o => o._id === action.payload._id); if (idx !== -1) state.orders[idx] = action.payload; })
      .addCase(fetchOrderStats.fulfilled, (state, action) => { state.stats = action.payload; });
  }
});

export default orderSlice.reducer;
