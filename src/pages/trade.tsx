import React, { useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useGetTradeMessagesQuery, useSetPositionMutation } from '../app/tradeApi';
import ChartFut from '../components/chart/ChartFut';

export default function TradePage() {
    const { data, isFetching } = useGetTradeMessagesQuery();
    const [sendPosition] = useSetPositionMutation();
    const refPercentLoss = useRef<any>();
    const refStopLoss = useRef<any>();
    const refSymbSelect = useRef<any>();

    const { symbol: tradePair } = useParams();

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
        const opt: { symbol: string; position: 'long' | 'short'; stopLoss: number; onePercLoss?: boolean; } = {
            symbol: tradePair,
            stopLoss: refStopLoss.current.value,
            // onePercLoss: refPercentLoss.current.checked,
            position
        };

        sendPosition(opt);
    }

    const setStopLoss = function(price: number) {
        refStopLoss.current.value = price;
    }

    return isFetching ? (<p>Loading...</p>) : (
        <>
        <label>
            StopLoss Price: <input ref={refStopLoss} type="number" name="stopLoss" />
        </label>
            
            {/* <label>
                <input ref={refPercentLoss} type="checkbox" name="percentLoss" />
                Percent Loss
            </label> */}

            {/* <select ref={refSymbSelect} name="symbol">{selOpt}</select> */}

            <button onClick={() => setPosition('long')}>Long</button>
            <button onClick={() => setPosition('short')}>Short</button>

            <ChartFut symbols={symbols} sendPriceFn={setStopLoss} />
        </>


    );
}