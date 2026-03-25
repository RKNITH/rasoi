import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api.js';

export const fetchDashboardStats = createAsyncThunk('dashboard/fetchStats', async (_, { rejectWithValue }) => {
  try { const res = await api.get('/dashboard/stats'); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data); }
});

export const fetchSalesReport = createAsyncThunk('dashboard/salesReport', async (params, { rejectWithValue }) => {
  try { const res = await api.get('/dashboard/sales', { params }); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data); }
});

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: { stats: null, salesReport: [], isLoading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => { state.isLoading = true; })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => { state.isLoading = false; state.stats = action.payload; })
      .addCase(fetchDashboardStats.rejected, (state, action) => { state.isLoading = false; state.error = action.payload?.message; })
      .addCase(fetchSalesReport.fulfilled, (state, action) => { state.salesReport = action.payload; });
  }
});

export default dashboardSlice.reducer;
