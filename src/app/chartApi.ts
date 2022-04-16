import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { binanceApiBaseUrl, binanceWsApiUrl, serverApiBaseUrl, serverWsApiUrl } from './apiBaseUrl'

export type Candle = {
    openTime: number;
    high: number;
    open: number;
    close: number;
    low: number;
};

export const chartApi = createApi({
    baseQuery: fetchBaseQuery({ baseUrl: binanceApiBaseUrl }),
    reducerPath: 'chartApi',
    tagTypes: ['Chart'],
    endpoints: (build) => ({
        getSymbols: build.query<string[], void>({
            query: () => ({
                url: 'fapi/v1/exchangeInfo'
            }),

            transformResponse: (response: any, meta, arg) => {
                return response.symbols.map(s => s.symbol);
            },
        }),

        getCandlesTicks: build.query<Candle[], { symbol: string; limit: number; interval: string; }>({
            query: (req) => ({
                url: 'fapi/v1/klines',
                params: req
            }),

            transformResponse: (response: any[], meta, arg) => {
                const res = [];

                for (const tick of response) {
                    const [openTime, open, high, low, close, volume, closeTime, assetVolume, trades, buyBaseVolume, buyAssetVolume, ignored] = tick;

                    res.push({
                        openTime,
                        high: +high,
                        open: +open,
                        close: +close,
                        low: +low
                    });
                }

                return res;
            },

            async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
                // create a websocket connection when the cache subscription starts
                const stream = arg.symbol.toLowerCase() + '@kline_' + arg.interval;

                const ws = new WebSocket(binanceWsApiUrl + '/stream?streams=' + stream);
                try {
                    await cacheDataLoaded;

                    const listener = (event: MessageEvent) => {
                        if (event.data) {
                            const wsData = JSON.parse(event.data);
                            const { e: eventType, E: eventTime, s: symbol, k: ticks } = wsData.data;
                            const { t: openTime, o: open, h: high, l: low, c: close } = ticks;

                            const candle: Candle = {
                                openTime: openTime,
                                open: +open,
                                high: +high,
                                low: +low,
                                close: +close
                            };

                            updateCachedData((draft) => {
                                const lastCacheCdl = draft.pop();

                                if (lastCacheCdl.openTime !== openTime) {
                                    draft.push(lastCacheCdl);
                                    draft.push(candle);
                                } else {
                                    draft.push(candle);
                                }
                            });
                        }
                    }

                    ws.addEventListener('message', listener);

                } catch (error) {
                    console.log(new Error(error));
                }

                await cacheEntryRemoved;

                ws.close();
            },

            providesTags: ['Chart'],
        }),
    }),
});

export const { useGetCandlesTicksQuery, useGetSymbolsQuery } = chartApi;