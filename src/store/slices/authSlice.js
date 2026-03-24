import { createSlice } from '@reduxjs/toolkit';
import { saveToken, deleteToken, getToken } from '../secureStoreAdapter';

const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  isTokenRefreshing: false,
};

// Fonctions utilitaires pour securiser le stockage sans bloquer l'UI
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
      
      if (user) state.user = user;
      if (token) state.token = token;
      if (refreshToken) state.refreshToken = refreshToken;
      
      state.isAuthenticated = !!state.token;
      state.isLoading = false;

      // Sauvegarde persistante immediate des la connexion
      if (state.token) safeStorageSet('accessToken', state.token);
      if (state.refreshToken) safeStorageSet('refreshToken', state.refreshToken);
      if (state.user) safeStorageSet('userData', JSON.stringify(state.user));
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
      state.isAuthenticated = false;
      state.isLoading = false;
      state.isTokenRefreshing = false;

      // Nettoyage complet
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

export const { setCredentials, updateUser, logout, setAuthLoading, setTokenRefreshing } = authSlice.actions;

// --- NOUVELLE LOGIQUE : RAFRAICHISSEMENT SILENCIEUX PROACTIF ---
export const forceSilentRefresh = () => async (dispatch, getState) => {
  const { auth } = getState();

  // Anti-collision : on ne lance rien si un rafraichissement est deja en cours
  if (auth.isTokenRefreshing) return;

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
      // Conservation precieuse du refresh token s'il n'est pas renouvele
      const newRefreshToken = result.data.refreshToken || currentRefreshToken;

      dispatch(setCredentials({
        user: auth.user,
        token: newToken,
        refreshToken: newRefreshToken
      }));
    } else if (response.status === 401 || response.status === 403) {
      dispatch(logout());
    }
  } catch (error) {
    // On etouffe l'erreur reseau pour ne pas deconnecter l'utilisateur s'il demarre l'app sans data
    console.error("[AUTH] Echec reseau du rafraichissement silencieux. Session conservee:", error);
  } finally {
    dispatch(setTokenRefreshing(false));
  }
};

export default authSlice.reducer;