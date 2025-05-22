import { configureStore } from '@reduxjs/toolkit';
import boardReducer from './slices/boardSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    board: boardReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

/**
 * @typedef {ReturnType<typeof store.getState>} RootState
 * @typedef {typeof store.dispatch} AppDispatch
 */
