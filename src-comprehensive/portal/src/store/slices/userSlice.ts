import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserPreferences } from '@scroll-university/shared-types';

interface UserState {
  preferences: UserPreferences | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  preferences: null,
  loading: false,
  error: null,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setPreferences: (state, action: PayloadAction<UserPreferences>) => {
      state.preferences = action.payload;
    },
    updatePreferences: (state, action: PayloadAction<Partial<UserPreferences>>) => {
      if (state.preferences) {
        state.preferences = { ...state.preferences, ...action.payload };
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setPreferences,
  updatePreferences,
  setLoading,
  setError,
} = userSlice.actions;