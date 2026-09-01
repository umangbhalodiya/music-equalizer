// store.ts
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import { musicSlice } from "./ApiSlice/musicSlice";

// Hand-rolled localStorage engine instead of `redux-persist/lib/storage`:
// this project's Vite/rolldown dependency pre-bundling double-wraps that
// deep CJS import (its pre-bundled output ends up re-exporting the raw
// `{ __esModule, default }` interop object instead of unwrapping it), so
// `storage.getItem` is undefined at runtime. This is functionally
// identical to what `createWebStorage('local')` returns, without going
// through the broken import path.
const storage = {
  getItem(key: string) {
    return Promise.resolve(window.localStorage.getItem(key));
  },
  setItem(key: string, value: string) {
    window.localStorage.setItem(key, value);
    return Promise.resolve();
  },
  removeItem(key: string) {
    window.localStorage.removeItem(key);
    return Promise.resolve();
  },
};

const reducers = combineReducers({
  music: musicSlice.reducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["music"],
};

const persistedReducer = persistReducer(persistConfig, reducers);
const isProd = window?.location?.href?.includes("https");

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: !isProd,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const persistor = persistStore(store);
export default store;
