import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import { botApi } from './botApi';
import { binanceApi } from './binanceApi';
import { tradeApi } from './tradeApi';
import { volatilityApi } from './volatilityApi';
import { binanceFutApi } from './binanceFutApi';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    [volatilityApi.reducerPath]: volatilityApi.reducer,
    [botApi.reducerPath]: botApi.reducer,
    [tradeApi.reducerPath]: tradeApi.reducer,
    [binanceApi.reducerPath]: binanceApi.reducer,
    [binanceFutApi.reducerPath]: binanceFutApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(
    volatilityApi.middleware,
    botApi.middleware,
    tradeApi.middleware,
    binanceApi.middleware,
    binanceFutApi.middleware,
  ),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
