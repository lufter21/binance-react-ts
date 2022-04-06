import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import { botApi } from './botApi';
import { volatilityApi } from './volatilityApi';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    [volatilityApi.reducerPath]: volatilityApi.reducer,
    [botApi.reducerPath]: botApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(
    volatilityApi.middleware,
    botApi.middleware,
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
