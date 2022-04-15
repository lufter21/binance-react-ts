import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { binanceWsApiUrl, serverApiBaseUrl, serverWsApiUrl } from './apiBaseUrl'

export const tradeApi = createApi({
    baseQuery: fetchBaseQuery({ baseUrl: serverApiBaseUrl }),
    reducerPath: 'tradeApi',
    // tagTypes: ['Trade'],
    endpoints: (build) => ({
        getTradeMessages: build.query<any, void>({
            query: () => 'trade',
            // providesTags: ['Trade'],
        }),
        setPosition: build.mutation({
			query: (body) => {
				return {
					url: 'trade',
					method: 'POST',
					body,
				};
			},
			// invalidatesTags: ['Trade'],
		}),
    }),
});

export const { useSetPositionMutation, useGetTradeMessagesQuery } = tradeApi;