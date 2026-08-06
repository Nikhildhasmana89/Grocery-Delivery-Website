import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface IGrocery {
  _id?: string;
  name: string;
  category?: string;
  price: string | number;
  unit?: string;
  image?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

interface CartSliceState {
  cartData: IGrocery[];
}

const initialState: CartSliceState = {
  cartData: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<IGrocery>) => {
      state.cartData.push(action.payload);
    },
    decreaseQuantity: (state, action: PayloadAction<string>) => {
      // Finds the last occurrence of the item ID and removes it
      const index = state.cartData.findLastIndex((i) => i._id === action.payload);
      if (index !== -1) {
        state.cartData.splice(index, 1);
      }
    },
    clearCart: (state) => {
      state.cartData = [];
    },
  },
});

export const { addToCart, decreaseQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;