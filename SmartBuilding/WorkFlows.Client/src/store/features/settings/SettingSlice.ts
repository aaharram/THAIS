import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const STORAGE_KEY = 'sc_isLdap';

function loadIsLdap(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) return stored === 'true';
  } catch {
    // ignore
  }
  return false; // default: LDAP off
}

interface SettingState {
  isLdap: boolean;
}

const initialState: SettingState = {
  isLdap: loadIsLdap(),
};

const SettingSlice = createSlice({
  name: 'Setting',
  initialState,
  reducers: {
    setIsLdap(state, action: PayloadAction<boolean>) {
      state.isLdap = action.payload;
      try {
        localStorage.setItem(STORAGE_KEY, String(action.payload));
      } catch {
        // ignore
      }
    },
  },
});

export const { setIsLdap } = SettingSlice.actions;
export default SettingSlice.reducer;
