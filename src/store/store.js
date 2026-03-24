// src/store/store.js
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { apiSlice } from './slices/apiSlice';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';

const appReducer = combineReducers({
  [apiSlice.reducerPath]: apiSlice.reducer,
  auth: authReducer,
  ui: uiReducer,
});

const rootReducer = (state, action) => {
  if (action.type === 'auth/logout') {
    state = undefined;
  }
  return appReducer(state, action);
};

const createOrGetStore = () => {
  if (global.__REDUX_STORE__) {
    global.__REDUX_STORE__.replaceReducer(rootReducer);
    return global.__REDUX_STORE__;
  }

  const newStore = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }).concat(apiSlice.middleware),
  });

  global.__REDUX_STORE__ = newStore;
  return newStore;
};

export const store = createOrGetStore();

setupListeners(store.dispatch);