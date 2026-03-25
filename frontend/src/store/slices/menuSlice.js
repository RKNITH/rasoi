import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api.js';

export const fetchMenuItems = createAsyncThunk('menu/fetchItems', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/menu', { params });
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data); }
});

export const fetchCategories = createAsyncThunk('menu/fetchCategories', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/categories');
    return res.data.data;
  } catch (err) { return rejectWithValue(err.response?.data); }
});

export const createMenuItem = createAsyncThunk('menu/create', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/menu', data, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data.data;
  } catch (err) { return rejectWithValue(err.response?.data); }
});

export const updateMenuItem = createAsyncThunk('menu/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/menu/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data.data;
  } catch (err) { return rejectWithValue(err.response?.data); }
});

export const deleteMenuItem = createAsyncThunk('menu/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/menu/${id}`);
    return id;
  } catch (err) { return rejectWithValue(err.response?.data); }
});

export const toggleMenuItemAvailability = createAsyncThunk('menu/toggleAvailability', async (id, { rejectWithValue }) => {
  try {
    const res = await api.patch(`/menu/${id}/availability`);
    return res.data.data;
  } catch (err) { return rejectWithValue(err.response?.data); }
});

const menuSlice = createSlice({
  name: 'menu',
  initialState: { items: [], categories: [], pagination: null, isLoading: false, error: null, selectedCategory: null, searchQuery: '' },
  reducers: {
    setSelectedCategory: (state, action) => { state.selectedCategory = action.payload; },
    setSearchQuery: (state, action) => { state.searchQuery = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenuItems.pending, (state) => { state.isLoading = true; })
      .addCase(fetchMenuItems.fulfilled, (state, action) => { state.isLoading = false; state.items = action.payload.data; state.pagination = action.payload.pagination; })
      .addCase(fetchMenuItems.rejected, (state, action) => { state.isLoading = false; state.error = action.payload?.message; })
      .addCase(fetchCategories.fulfilled, (state, action) => { state.categories = action.payload; })
      .addCase(createMenuItem.fulfilled, (state, action) => { state.items.unshift(action.payload); })
      .addCase(updateMenuItem.fulfilled, (state, action) => { const idx = state.items.findIndex(i => i._id === action.payload._id); if (idx !== -1) state.items[idx] = action.payload; })
      .addCase(deleteMenuItem.fulfilled, (state, action) => { state.items = state.items.filter(i => i._id !== action.payload); })
      .addCase(toggleMenuItemAvailability.fulfilled, (state, action) => { const idx = state.items.findIndex(i => i._id === action.payload._id); if (idx !== -1) state.items[idx] = action.payload; });
  }
});

export const { setSelectedCategory, setSearchQuery } = menuSlice.actions;
export default menuSlice.reducer;
