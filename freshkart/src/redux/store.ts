import { configureStore } from '@reduxjs/toolkit'
import userSlice from './userSlice';
import CardSlice from './CardSlice';

export const store = configureStore({
  reducer: {
    user: userSlice,
    cart: CardSlice
  },
})


export type RootState = ReturnType<typeof store.getState>       
export type AppDispatch = typeof store.dispatch
