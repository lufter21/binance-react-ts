import React, { useRef } from 'react';
import { useGetTradeMessagesQuery, useSetPositionMutation } from '../app/tradeApi';

const symbols = ['ADAUSDT', 'ATOMUSDT', 'BATUSDT', 'BCHUSDT', 'BNBUSDT', 'BTCUSDT', 'DASHUSDT', 'DOGEUSDT', 'EOSUSDT', 'ETCUSDT', 'ETHUSDT', 'IOSTUSDT', 'IOTAUSDT', 'LINKUSDT', 'LTCUSDT', 'MATICUSDT', 'NEOUSDT', 'ONTUSDT', 'QTUMUSDT', 'RVNUSDT', 'TRXUSDT', 'VETUSDT', 'XLMUSDT', 'XMRUSDT', 'XRPUSDT', 'ZECUSDT', 'XTZUSDT'];



export default function TradePage() {
    const { data, isFetching, isSuccess } = useGetTradeMessagesQuery();
    const [sendPosition] = useSetPositionMutation();
    const refPercentLoss = useRef<any>();
    const refStopLoss = useRef<any>();
    const refSymbSelect = useRef<any>();

    const symbols = data && data.symbols ? [...data.symbols] : [];

    if (symbols.length > 1) {
        symbols.sort((a: string, b: string) => {
            if (a < b) { return -1; }
            if (a > b) { return 1; }
            return 0;
        });
    }


    const selOpt = symbols.map((s: string) => React.createElement('option', { key: s }, s));

    const setPosition = function (position: 'long' | 'short'): void {
        const opt: { symbol: string; position: 'long' | 'short'; stopLoss: number; onePercLoss: boolean; } = {
            symbol: refSymbSelect.current.value,
            stopLoss: refStopLoss.current.value,
            onePercLoss: refPercentLoss.current.checked,
            position
        };

        sendPosition(opt);
    }

    return isFetching ? (<p>Loading...</p>) : (
        <>
            <input ref={refStopLoss} type="number" name="stopLoss" />
            <label>
                <input ref={refPercentLoss} type="checkbox" name="percentLoss" />
                Percent Loss
            </label>

            <select ref={refSymbSelect} name="symbol">{selOpt}</select>

            <button onClick={() => setPosition('long')}>Long</button>
            <button onClick={() => setPosition('short')}>Short</button>
        </>


    );
}