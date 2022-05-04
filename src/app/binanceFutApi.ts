import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { binanceFutApiBaseUrl, binanceFutWsApiUrl } from './apiBaseUrl';

export type Candle = {
    openTime: number;
    high: number;
    open: number;
    close: number;
    low: number;
};

export const binanceFutApi = createApi({
    baseQuery: fetchBaseQuery({ baseUrl: binanceFutApiBaseUrl }),
    reducerPath: 'binanceFutApi',
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

                const ws = new WebSocket(binanceFutWsApiUrl + '/stream?streams=' + stream);
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
                url: 'fapi/v1/trades',
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

                const ws = new WebSocket(binanceFutWsApiUrl + '/stream?streams=' + stream);
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
                                    if (draftItem.price === +price) {
                                        isNew = false;

                                        if (isBuyerMaker) {
                                            draftItem.sell += +qty;
                                        } else {
                                            draftItem.buy += +qty;
                                        }
                                    }
                                }

                                if (isNew) {
                                    draftData.push({
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

        getDepth: build.query<{ bids: string[][]; asks: string[][]; lastUpdateId: number; }, { symbol: string; limit: number; }>({
            query: (req) => ({
                url: 'fapi/v1/depth',
                params: req
            }),

            async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
                const stream = arg.symbol.toLowerCase() + '@depth@500ms';

                const ws = new WebSocket(binanceFutWsApiUrl + '/stream?streams=' + stream);

                try {
                    const firstData = await cacheDataLoaded;

                    const result = Object.assign({}, firstData.data);

                    let lastFinalUpdId: number;

                    const listener = (event: MessageEvent) => {
                        if (event.data) {
                            updateCachedData((draft) => {
                                const res: {
                                    s: string;
                                    u: number;
                                    pu: number;
                                    b: string[][];
                                    a: string[][];
                                } = JSON.parse(event.data).data;

                                const { s: symbol, b: bids, a: asks, pu: finalUpdIdInLast, u: finalUpdId } = res;

                                if (finalUpdId < result.lastUpdateId) {
                                    return;
                                }

                                if (lastFinalUpdId && finalUpdIdInLast !== lastFinalUpdId) {
                                    return;
                                } else {
                                    lastFinalUpdId = finalUpdId;
                                }

                                // Bids
                                bids.reverse();

                                const prelBids: string[][] = [];

                                for (const curB of result.bids) {
                                    let isset = false;

                                    for (const newB of bids) {
                                        if (newB[0] === curB[0]) {
                                            if (+newB[1] !== 0) {
                                                prelBids.push(newB);
                                            }

                                            isset = true;
                                        }
                                    }

                                    if (!isset) {
                                        prelBids.push(curB);
                                    }
                                }

                                const resultBids: string[][] = [];

                                for (let i = 0; i < prelBids.length; i++) {
                                    const cBid = prelBids[i];

                                    for (const newB of bids) {
                                        if (newB[0] !== cBid[0] && +newB[1] !== 0) {
                                            if (!i && +newB[0] > +cBid[0]) {
                                                resultBids.push(newB);
                                            } else if (i && +prelBids[i - 1][0] > +newB[0] && +newB[0] > +cBid[0]) {
                                                resultBids.push(newB);
                                            }
                                        }
                                    }

                                    resultBids.push(cBid);

                                    if (i === prelBids.length - 1) {
                                        for (const newB of bids) {
                                            if (newB[0] !== cBid[0] && +newB[1] !== 0 && +cBid[0] > +newB[0]) {
                                                resultBids.push(newB);
                                            }
                                        }
                                    }
                                }

                                // Asks
                                const prelAsks: string[][] = [];

                                for (const curA of result.asks) {
                                    let isset = false;

                                    for (const newA of asks) {
                                        if (newA[0] === curA[0]) {
                                            if (+newA[1] !== 0) {
                                                prelAsks.push(newA);
                                            }

                                            isset = true;
                                        }
                                    }

                                    if (!isset) {
                                        prelAsks.push(curA);
                                    }
                                }

                                const resultAsks: string[][] = [];

                                for (let i = 0; i < prelAsks.length; i++) {
                                    const cAsk = prelAsks[i];

                                    for (const newA of asks) {
                                        if (newA[0] !== cAsk[0] && +newA[1] !== 0) {
                                            if (!i && +newA[0] < +cAsk[0]) {
                                                resultAsks.push(newA);
                                            } else if (i && +prelAsks[i - 1][0] < +newA[0] && +newA[0] < +cAsk[0]) {
                                                resultAsks.push(newA);
                                            }

                                            if (i === prelAsks.length - 1 && +cAsk[0] < +newA[0]) {
                                                resultAsks.push(newA);
                                            }
                                        }
                                    }

                                    resultAsks.push(cAsk);

                                    if (i === prelAsks.length - 1) {
                                        for (const newA of asks) {
                                            if (newA[0] !== cAsk[0] && +newA[1] !== 0 && +cAsk[0] < +newA[0]) {
                                                resultAsks.push(newA);
                                            }
                                        }
                                    }

                                }

                                result.bids = resultBids;
                                result.asks = resultAsks;

                                draft.bids = result.bids;
                                draft.asks = result.asks;
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

export const {
    useGetCandlesTicksQuery,
    useGetSymbolsQuery,
    useGetTradesListQuery,
    useGetDepthQuery
} = binanceFutApi;