import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// 1. Types for frontend state (use string for _id instead of mongoose ObjectId)
export interface UserInterface {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  mobile?: string;
  role: "user" | "deliveryBoy" | "admin";
  image?: string;
}

interface UserSliceState {
  userData: UserInterface | null;
}

const initialState: UserSliceState = {
  userData: null,
  
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData: (state, action: PayloadAction<UserInterface>) => {
      state.userData = action.payload;
    },
    clearUser: (state) => {
      state.userData = null;
    },
  },
});

// 3. Export actions and reducer
export const { setUserData, clearUser } = userSlice.actions;
export default userSlice.reducer;