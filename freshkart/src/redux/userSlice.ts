import { createSlice, PayloadAction } from "@reduxjs/toolkit";

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

export const { setUserData, clearUser } = userSlice.actions;
export default userSlice.reducer;