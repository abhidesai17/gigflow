import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiRequest } from '../../lib/api';

export const fetchGigs = createAsyncThunk('gigs/fetch', async ({ search } = {}) => {
  const qs = search ? `?search=${encodeURIComponent(search)}` : '';
  const data = await apiRequest(`/api/gigs${qs}`);
  return data.gigs;
});

export const createGig = createAsyncThunk('gigs/create', async (payload) => {
  const data = await apiRequest('/api/gigs', { method: 'POST', body: payload });
  return data.gig;
});

const gigsSlice = createSlice({
  name: 'gigs',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGigs.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchGigs.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchGigs.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(createGig.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items];
      });
  },
});

export default gigsSlice.reducer;
