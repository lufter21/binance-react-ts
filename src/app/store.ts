import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import { botApi } from './botApi';
import { chartApi } from './chartApi';
import { tradeApi } from './tradeApi';
import { volatilityApi } from './volatilityApi';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    [volatilityApi.reducerPath]: volatilityApi.reducer,
    [botApi.reducerPath]: botApi.reducer,
    [tradeApi.reducerPath]: tradeApi.reducer,
    [chartApi.reducerPath]: chartApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(
    volatilityApi.middleware,
    botApi.middleware,
    tradeApi.middleware,
    chartApi.middleware,
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
