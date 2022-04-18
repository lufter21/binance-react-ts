import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { binanceApiBaseUrl, binanceWsApiUrl, serverApiBaseUrl, serverWsApiUrl } from './apiBaseUrl'

export type Candle = {
    openTime: number;
    high: number;
    open: number;
    close: number;
    low: number;
};

export const binanceApi = createApi({
    baseQuery: fetchBaseQuery({ baseUrl: binanceApiBaseUrl }),
    reducerPath: 'binanceApi',
    // tagTypes: ['Chart'],
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

            // providesTags: ['Chart'],
        }),

        getTradesList: build.query<{ price: number, buy: number, sell: number }[], { symbol: string; limit: number; }>({
            query: (req) => ({
                url: '/fapi/v1/trades',
                params: req
            }),

            transformResponse: (response: any[], meta, arg) => {
                const res = {};

                for (const item of response) {
                    const { price, qty, isBuyerMaker } = item;

                    if (!res[price]) {
                        res[price] = {
                            price: +price,
                            buy: 0,
                            sell: 0
                        };
                    }

                    if (isBuyerMaker) {
                        res[price].sell += +qty;
                    } else {
                        res[price].buy += +qty;
                    }
                }

                return Object.values(res);
            },

            async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
                const stream = arg.symbol.toLowerCase() + '@aggTrade';

                const ws = new WebSocket(binanceWsApiUrl + '/stream?streams=' + stream);
                try {
                    await cacheDataLoaded;

                    const listener = (event: MessageEvent) => {
                        if (event.data) {
                            const wsData = JSON.parse(event.data);
                            const { p: price, q: qty, m: isBuyerMaker } = wsData.data;

                            updateCachedData((draft) => {
                                const draftData = [...draft];

                                let isNew = true;

                                for (const draftItem of draftData) {
                                    if (draftItem.price == +price) {
                                        isNew = false;

                                        if (isBuyerMaker) {
                                            draftItem.sell += +qty;
                                        } else {
                                            draftItem.buy += +qty;
                                        }
                                    }
                                }

                                if (isNew) {
                                    draft.push({
                                        price: +price,
                                        buy: !isBuyerMaker ? +qty : 0,
                                        sell: isBuyerMaker ? +qty : 0
                                    });
                                }

                                draft.splice(0, draft.length, ...draftData);
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

            // providesTags: ['Chart'],
        }),
    }),
});

export const { useGetCandlesTicksQuery, useGetSymbolsQuery, useGetTradesListQuery } = binanceApi;