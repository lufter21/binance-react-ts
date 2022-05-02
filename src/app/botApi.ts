import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { serverApiBaseUrl } from './apiBaseUrl'

type Tradelines = {
    [symbol: string]: {
        levels?: {
            id: string;
            price: number[];
        }[];
        trends?: {
            id: string;
            lines: {
                start: {
                    price: number;
                    time: number;
                };
                end: {
                    price: number;
                    time: number;
                };
            }[];
        }[];
    };
};

export const botApi = createApi({
    baseQuery: fetchBaseQuery({ baseUrl: serverApiBaseUrl }),
    reducerPath: 'botApi',
    tagTypes: ['Bot', 'Tradelines'],
    endpoints: (build) => ({
        getBotMessages: build.query<any, void>({
            query: () => 'bot',
            // async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
            //     // create a websocket connection when the cache subscription starts
            //     const ws = new WebSocket(serverWsApiUrl + '/bot');
            //     try {
            //         // wait for the initial query to resolve before proceeding
            //         await cacheDataLoaded

            //         // when data is received from the socket connection to the server,
            //         // if it is a message and for the appropriate channel,
            //         // update our query result with the received message
            //         const listener = (event: MessageEvent) => {
            //             try {
            //                 const data = JSON.parse(event.data);

            //                 if (data) {
            //                     updateCachedData((draft) => {
            //                         Object.assign(draft, data);
            //                     });
            //                 }

            //             } catch (error: any) {
            //                 console.error(new Error(error));
            //             }
            //         }

            //         ws.addEventListener('message', listener);
            //     } catch {
            //         // no-op in case `cacheEntryRemoved` resolves before `cacheDataLoaded`,
            //         // in which case `cacheDataLoaded` will throw
            //     }
            //     // cacheEntryRemoved will resolve when the cache subscription is no longer active
            //     await cacheEntryRemoved
            //     // perform cleanup steps once the `cacheEntryRemoved` promise resolves
            //     ws.close();
            // },
            providesTags: ['Bot'],
        }),

        botControl: build.mutation({
            query: (body) => ({
                url: 'bot',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Bot'],
        }),

        getTradeLines: build.query<Tradelines, void>({
            query: () => ({url: 'tradelines'}),
            providesTags: ['Tradelines']
        }),

        setTradeLines: build.mutation<Tradelines, {
            type: 'trends' | 'levels';
            symbol: string;
            opt: any;
            removeId: string;
        }>({
            query: (body) => ({
                url: 'tradelines',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Tradelines']
        }),
    }),
});

export const {
    useGetBotMessagesQuery,
    useBotControlMutation,
    useGetTradeLinesQuery,
    useSetTradeLinesMutation
} = botApi;