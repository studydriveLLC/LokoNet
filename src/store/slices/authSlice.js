//src/store/slices/authSlice.js

import { createSlice } from '@reduxjs/toolkit';
import { saveToken, deleteToken, getToken } from '../secureStoreAdapter';

const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  tokenAcquiredAt: null,
  isAuthenticated: false,
  isLoading: true,
  isTokenRefreshing: false,
};

const safeStorageSet = (key, value) => {
  Promise.resolve(saveToken(key, value)).catch(err => {
    console.error(`[Redux] Echec de sauvegarde pour ${key}:`, err);
  });
};

const safeStorageRemove = (key) => {
  Promise.resolve(deleteToken(key)).catch(err => {
    console.error(`[Redux] Echec de suppression pour ${key}:`, err);
  });
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token, refreshToken } = action.payload;
      
      if (user !== undefined) state.user = user;
      if (token !== undefined) {
        state.token = token;
        state.tokenAcquiredAt = Date.now();
      }
      if (refreshToken !== undefined) state.refreshToken = refreshToken;
      
      state.isAuthenticated = !!state.token;
      state.isLoading = false;

      if (state.token) safeStorageSet('accessToken', state.token);
      if (state.refreshToken) safeStorageSet('refreshToken', state.refreshToken);
      if (state.user) safeStorageSet('userData', JSON.stringify(state.user));
    },
    restoreAuth: (state, action) => {
      const { user, token, refreshToken } = action.payload || {};
      state.user = user || null;
      state.token = token || null;
      state.refreshToken = refreshToken || null;
      
      state.tokenAcquiredAt = 0; 
      state.isAuthenticated = !!state.token;
      state.isLoading = false;
    },
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        safeStorageSet('userData', JSON.stringify(state.user));
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.tokenAcquiredAt = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.isTokenRefreshing = false;

      safeStorageRemove('accessToken');
      safeStorageRemove('refreshToken');
      safeStorageRemove('userData');
    },
    setAuthLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setTokenRefreshing: (state, action) => {
      state.isTokenRefreshing = action.payload;
    }
  },
});

export const { setCredentials, restoreAuth, updateUser, logout, setAuthLoading, setTokenRefreshing } = authSlice.actions;

export const performLogout = () => async (dispatch) => {
  dispatch(logout());
  
  const { apiSlice } = require('./apiSlice');
  dispatch(apiSlice.util.resetApiState());

  try {
    const socketService = require('../../services/socketService').default;
    socketService.disconnect();
  } catch (e) {
    console.warn("[AUTH] Erreur deconnexion socket", e);
  }
};

export const forceSilentRefresh = () => async (dispatch, getState) => {
  const { auth } = getState();

  if (auth.isTokenRefreshing) return;

  if (auth.token && auth.tokenAcquiredAt) {
    const ageInMs = Date.now() - auth.tokenAcquiredAt;
    if (ageInMs < 14 * 60 * 1000) { 
      return;
    }
  }

  dispatch(setTokenRefreshing(true));

  try {
    let currentRefreshToken = auth.refreshToken;
    if (!currentRefreshToken) {
       currentRefreshToken = await getToken('refreshToken');
    }

    if (!currentRefreshToken) {
      dispatch(setTokenRefreshing(false));
      return;
    }

    const API_URL = process.env.EXPO_PUBLIC_API_URL || '';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(`${API_URL}/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ refreshToken: currentRefreshToken }),
      credentials: 'omit',
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const result = await response.json().catch(() => null);

    if (response.ok && result?.status === 'success') {
      const newToken = result.data.accessToken;
      const newRefreshToken = result.data.refreshToken || currentRefreshToken;

      dispatch(setCredentials({
        user: auth.user,
        token: newToken,
        refreshToken: newRefreshToken
      }));

      try {
        const socketService = require('../../services/socketService').default;
        socketService.updateToken(newToken);
      } catch (e) {}

    } else if (response.status === 401 || response.status === 403) {
      const currentAuth = getState().auth;
      if (currentAuth.tokenAcquiredAt !== auth.tokenAcquiredAt) {
        console.info('[AUTH] Race condition evitee silencieusement : apiSlice a pris le relais.');
      } else {
        dispatch(performLogout());
      }
    }
  } catch (error) {
    console.error("[AUTH] Echec reseau du rafraichissement silencieux. Session conservee:", error);
  } finally {
    dispatch(setTokenRefreshing(false));
  }
};

export default authSlice.reducer;