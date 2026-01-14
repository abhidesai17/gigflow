import { createSlice } from '@reduxjs/toolkit';

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
  },
  reducers: {
    pushNotification(state, action) {
      state.items = [action.payload, ...state.items].slice(0, 10);
    },
    clearNotifications(state) {
      state.items = [];
    },
  },
});

export const { pushNotification, clearNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer;
