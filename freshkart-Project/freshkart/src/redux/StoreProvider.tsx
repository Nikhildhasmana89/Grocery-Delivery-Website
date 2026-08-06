'use client';

import React from 'react';
import { Provider } from 'react-redux'; // Import from 'react-redux', not a local path
import { store } from './store'; // Adjust relative path if store is elsewhere

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
}