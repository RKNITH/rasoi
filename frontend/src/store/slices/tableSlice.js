import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';

export const fetchTables = createAsyncThunk('tables/fetch', async (params, { rejectWithValue }) => {
  try { const res = await api.get('/tables', { params }); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data); }
});

export const createTable = createAsyncThunk('tables/create', async (data, { rejectWithValue }) => {
  try { const res = await api.post('/tables', data); toast.success('Table created!'); return res.data.data; }
  catch (err) { toast.error(err.response?.data?.message || 'Failed'); return rejectWithValue(err.response?.data); }
});

export const updateTableStatus = createAsyncThunk('tables/updateStatus', async ({ id, status, reservation }, { rejectWithValue }) => {
  try { const res = await api.patch(`/tables/${id}/status`, { status, reservation }); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data); }
});

export const deleteTable = createAsyncThunk('tables/delete', async (id, { rejectWithValue }) => {
  try { await api.delete(`/tables/${id}`); toast.success('Table removed!'); return id; }
  catch (err) { toast.error(err.response?.data?.message || 'Failed'); return rejectWithValue(err.response?.data); }
});

const tableSlice = createSlice({
  name: 'tables',
  initialState: { tables: [], isLoading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTables.pending, (state) => { state.isLoading = true; })
      .addCase(fetchTables.fulfilled, (state, action) => { state.isLoading = false; state.tables = action.payload; })
      .addCase(fetchTables.rejected, (state, action) => { state.isLoading = false; state.error = action.payload?.message; })
      .addCase(createTable.fulfilled, (state, action) => { state.tables.push(action.payload); })
      .addCase(updateTableStatus.fulfilled, (state, action) => { const idx = state.tables.findIndex(t => t._id === action.payload._id); if (idx !== -1) state.tables[idx] = action.payload; })
      .addCase(deleteTable.fulfilled, (state, action) => { state.tables = state.tables.filter(t => t._id !== action.payload); });
  }
});

export default tableSlice.reducer;
