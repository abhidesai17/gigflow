import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiRequest } from '../../lib/api';

export const createBid = createAsyncThunk('bids/create', async (payload) => {
  const data = await apiRequest('/api/bids', { method: 'POST', body: payload });
  return data.bid;
});

export const fetchBidsForGig = createAsyncThunk('bids/fetchForGig', async (gigId) => {
  const data = await apiRequest(`/api/bids/${gigId}`);
  return { gigId, bids: data.bids };
});

export const hireBid = createAsyncThunk('bids/hire', async (bidId) => {
  const data = await apiRequest(`/api/bids/${bidId}/hire`, { method: 'PATCH' });
  return data;
});

const bidsSlice = createSlice({
  name: 'bids',
  initialState: {
    byGigId: {},
    status: 'idle',
    error: null,
  },
  reducers: {
    clearBidsError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBidsForGig.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchBidsForGig.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.byGigId[action.payload.gigId] = action.payload.bids;
      })
      .addCase(fetchBidsForGig.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(hireBid.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(hireBid.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const gigId = action.payload?.gig?._id;
        if (!gigId) return;

        const bids = state.byGigId[gigId];
        if (!bids) return;

        state.byGigId[gigId] = bids.map((b) => {
          if (b._id === action.payload.hiredBid._id) return { ...b, status: 'hired' };
          if (b.status === 'pending') return { ...b, status: 'rejected' };
          return b;
        });
      })
      .addCase(hireBid.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { clearBidsError } = bidsSlice.actions;
export default bidsSlice.reducer;
