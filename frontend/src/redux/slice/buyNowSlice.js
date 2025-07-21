import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  product: null,
};

const buyNowSlice = createSlice({
  name: 'buyNow',
  initialState,
  reducers: {
    setBuyNowProduct(state, action) {
      state.product = action.payload;
    },
    clearBuyNowProduct(state) {
      state.product = null;
    },
  },
});

export const { setBuyNowProduct, clearBuyNowProduct } = buyNowSlice.actions;
export default buyNowSlice.reducer;
