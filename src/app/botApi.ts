import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { binanceWsApiUrl, serverApiBaseUrl, serverWsApiUrl } from './apiBaseUrl'

export const botApi = createApi({
    baseQuery: fetchBaseQuery({ baseUrl: serverApiBaseUrl }),
    reducerPath: 'botApi',
    tagTypes: ['Bot'],
    endpoints: (build) => ({
        getBotMessages: build.query<any, void>({
            query: () => 'bot',
            async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
                // create a websocket connection when the cache subscription starts
                const ws = new WebSocket(serverWsApiUrl + '/bot');
                try {
                    // wait for the initial query to resolve before proceeding
                    await cacheDataLoaded

                    // when data is received from the socket connection to the server,
                    // if it is a message and for the appropriate channel,
                    // update our query result with the received message
                    const listener = (event: MessageEvent) => {
                        try {
                            const data = JSON.parse(event.data);

                            if (data) {
                                updateCachedData((draft) => {
                                    Object.assign(draft, data);
                                });
                            }

                        } catch (error: any) {
                            console.error(new Error(error));
                        }
                    }

                    ws.addEventListener('message', listener);
                } catch {
                    // no-op in case `cacheEntryRemoved` resolves before `cacheDataLoaded`,
                    // in which case `cacheDataLoaded` will throw
                }
                // cacheEntryRemoved will resolve when the cache subscription is no longer active
                await cacheEntryRemoved
                // perform cleanup steps once the `cacheEntryRemoved` promise resolves
                ws.close();
            },
            providesTags: ['Bot'],
        }),
        botControl: build.mutation({
			query: (body) => {
				return {
					url: 'bot',
					method: 'POST',
					body,
				};
			},
			invalidatesTags: ['Bot'],
		}),
    }),
});

export const { useGetBotMessagesQuery, useBotControlMutation } = botApi;