import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { binanceWsApiUrl, serverApiBaseUrl } from './apiBaseUrl'

// const symbols = ['BTCUSDT'];
const symbols = ['ADAUSDT', 'ATOMUSDT', 'BATUSDT', 'BCHUSDT', 'BNBUSDT', 'BTCUSDT', 'DASHUSDT', 'DOGEUSDT', 'EOSUSDT', 'ETCUSDT', 'ETHUSDT', 'IOSTUSDT', 'IOTAUSDT', 'LINKUSDT', 'LTCUSDT', 'MATICUSDT', 'NEOUSDT', 'ONTUSDT', 'QTUMUSDT', 'RVNUSDT', 'TRXUSDT', 'VETUSDT', 'XLMUSDT', 'XMRUSDT', 'XRPUSDT', 'ZECUSDT', 'XTZUSDT'];

const symbolsStr = symbols.join(',');

export const volatilityApi = createApi({
    baseQuery: fetchBaseQuery({ baseUrl: serverApiBaseUrl }),
    reducerPath: 'volatilityApi',
    endpoints: (build) => ({
        getCandles: build.query<{ [key: string]: any }, void>({
            query: () => `candlesticks?symbols=${symbolsStr}&interval=1h&limit=5`,
        }),
    }),
});

export const { useGetCandlesQuery } = volatilityApi;