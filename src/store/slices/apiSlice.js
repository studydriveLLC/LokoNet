// src/store/slices/apiSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Mutex } from 'async-mutex';
import { Platform } from 'react-native';
import { getToken } from '../secureStoreAdapter';
import { setCredentials, performLogout, setTokenRefreshing } from './authSlice';

const mutex = new Mutex();
const rawBaseUrl = process.env.EXPO_PUBLIC_API_URL || '';

if (!rawBaseUrl && __DEV__) {
  console.warn("ATTENTION: EXPO_PUBLIC_API_URL n'est pas defini dans le fichier .env !");
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const baseQuery = fetchBaseQuery({
  baseUrl: rawBaseUrl,
  timeout: 15000,
  prepareHeaders: async (headers, { getState, endpoint }) => {
    let token = getState().auth?.token;

    if (!token) {
      token = await getToken('accessToken');
    }

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const uploadEndpoints = ['uploadResource', 'uploadAvatar', 'uploadPostMedia'];
    if (uploadEndpoints.includes(endpoint)) {
      headers.delete('Content-Type');
    } else {
      headers.set('Accept', 'application/json');
    }

    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  await mutex.waitForUnlock();
  
  const tokenBeforeRequest = api.getState().auth?.token;
  let requestUrl = typeof args === 'string' ? args : args?.url || '';
  
  // Enregistrement du temps de depart pour detecter la suspension du thread (Fast Refresh Expo)
  const startTime = Date.now();
  let result = await baseQuery(args, api, extraOptions);
  const duration = Date.now() - startTime;

  // Logique de detection Bank Grade (comme dans Yely)
  const wasSuspended = duration > 25000;
  const isBrowserHidden = Platform.OS === 'web' && typeof document !== 'undefined' && document.visibilityState === 'hidden';
  const isBrowserOffline = Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.onLine === false;
  const isSleepingOrOffline = wasSuspended || isBrowserHidden || isBrowserOffline;

  if (api.signal && api.signal.aborted) {
    return result;
  }

  const isAuthEndpoint = requestUrl.includes('/login') || requestUrl.includes('/register') || requestUrl.includes('/refresh') || requestUrl.includes('/updateMyPassword');

  // Retry uniquement pour les vraies coupures, pas pour les rechargements Expo
  if (!isSleepingOrOffline && !isAuthEndpoint && result.error && (result.error.status === 'FETCH_ERROR' || result.error.status === 'TIMEOUT_ERROR')) {
    console.warn(`[API] Micro-coupure reseau detectee sur ${requestUrl}. Retry silencieux...`);
    await sleep(1500);
    result = await baseQuery(args, api, extraOptions);
  }

  if (result.error && result.error.status === 401 && !isAuthEndpoint) {
    // PROTECTION ANTI-DEADLOCK (Boucle de verification d'etat)
    if (mutex.isLocked() || api.getState().auth?.isTokenRefreshing) {
      if (mutex.isLocked()) {
        await mutex.waitForUnlock();
      } else {
        let loopCount = 0;
        while (api.getState().auth?.isTokenRefreshing && loopCount < 150) { 
          await sleep(100);
          loopCount++;
        }
      }

      const tokenAfterWait = api.getState().auth?.token;
      if (tokenBeforeRequest !== tokenAfterWait) {
        return await baseQuery(args, api, extraOptions); 
      }
    }

    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        const tokenAfterLock = api.getState().auth?.token;
        if (tokenBeforeRequest !== tokenAfterLock) {
          return await baseQuery(args, api, extraOptions);
        }

        api.dispatch(setTokenRefreshing(true));

        let currentRefreshToken = api.getState().auth?.refreshToken;
        if (!currentRefreshToken) {
           currentRefreshToken = await getToken('refreshToken');
        }

        if (!currentRefreshToken) {
            console.warn("[API] Aucun refresh token. Deconnexion automatique forcee.");
            api.dispatch(performLogout());
            return result;
        }

        const refreshResult = await baseQuery(
          { 
            url: '/v1/auth/refresh', 
            method: 'POST',
            body: { refreshToken: currentRefreshToken } 
          },
          api,
          extraOptions
        );

        if (refreshResult.data?.status === 'success') {
          const newToken = refreshResult.data.data.accessToken;
          const newRefreshToken = refreshResult.data.data.refreshToken || currentRefreshToken;

          api.dispatch(setCredentials({ 
            token: newToken, 
            refreshToken: newRefreshToken 
          }));
          
          try {
            const socketService = require('../../services/socketService').default;
            socketService.updateToken(newToken);
          } catch (e) {}

          result = await baseQuery(args, api, extraOptions);
        } else if (refreshResult.error && refreshResult.error.status !== 'FETCH_ERROR' && refreshResult.error.status !== 'TIMEOUT_ERROR') {
          api.dispatch(performLogout());
        }
      } finally {
        api.dispatch(setTokenRefreshing(false));
        release();
      }
    }
  }

  // Masquer silencieusement l'erreur au lieu de la renvoyer aux composants si c'etait une suspension
  if (isSleepingOrOffline && result.error && (result.error.status === 'FETCH_ERROR' || result.error.status === 'TIMEOUT_ERROR')) {
    console.info(`[API] Erreur transitoire masquee (Suspension du thread ou Fast Refresh detecte)`);
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  refetchOnMountOrArgChange: true,
  tagTypes: ['User', 'Post', 'Workspace', 'Notification', 'Resource', 'Notification', 'NotificationCount'],
  endpoints: () => ({}),
});