import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: { sidebarOpen: true, sidebarCollapsed: false, activeModal: null, modalData: null, theme: 'light' },
  reducers: {
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen; },
    setSidebarOpen: (state, action) => { state.sidebarOpen = action.payload; },
    toggleSidebarCollapsed: (state) => { state.sidebarCollapsed = !state.sidebarCollapsed; },
    openModal: (state, action) => { state.activeModal = action.payload.modal; state.modalData = action.payload.data || null; },
    closeModal: (state) => { state.activeModal = null; state.modalData = null; },
  }
});

export const { toggleSidebar, setSidebarOpen, toggleSidebarCollapsed, openModal, closeModal } = uiSlice.actions;
export default uiSlice.reducer;
