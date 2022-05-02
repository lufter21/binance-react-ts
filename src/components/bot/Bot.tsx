import React, { BaseSyntheticEvent, useState } from 'react';
import { useBotControlMutation, useGetBotMessagesQuery } from '../../app/botApi';
import { useGetSymbolsQuery } from '../../app/binanceApi';
import Chart from '../chart/Chart';

const StrItem = function (props: any) {
    return (
        <tr>
            <td>{props.symbol}</td>
            <td style={props.resolvePosition ? { color: "darkgreen" } : { color: "grey" }}>
                {props.resolvePosition && 'Yes'}
                {!props.resolvePosition && 'No'}
            </td>
            <td>{props.position}</td>
            <td>{props.signalDetails.atr}</td>
            <td>{(props.signalDetails.moved * 100).toFixed()}</td>
        </tr>
    );
}

const PosItem = function (props: any) {
    return (
        <table>
            <tr>
                <th colSpan={2}>Position {props.symbol}</th>
            </tr>
            <tr>
                <td>position</td>
                <td>{props.position}</td>
            </tr>
            <tr>
                <td>realEntryPrice</td>
                <td>{props.realEntryPrice}</td>
            </tr>
            <tr>
                <td>percentLoss</td>
                <td>{props.percentLoss}</td>
            </tr>
            <tr>
                <th colSpan={2}>signalDetails</th>
            </tr>
            <tr>
                <td>ATR</td>
                <td>{props.signalDetails.atr}</td>
            </tr>
            <tr>
                <td>last Price</td>
                <td>{props.signalDetails.lastPrice}</td>
            </tr>
            <tr>
                <td>Min Candle Move</td>
                <td>{props.signalDetails.minCandleMove}</td>
            </tr>
            <tr>
                <td>Last Candle Move</td>
                <td>{props.signalDetails.lastCandleMove}</td>
            </tr>
            <tr>
                <td>Average Candle Move</td>
                <td>{props.signalDetails.avgCandleMove}</td>
            </tr>
            <tr>
                <td>Percent Average Candle Move</td>
                <td>{props.signalDetails.percentAverageCandleMove}</td>
            </tr>
            <tr>
                <td>SMA Change</td>
                <td>{props.signalDetails.smaChange}</td>
            </tr>
            <tr>
                <td>RSI TopEdge</td>
                <td>{props.signalDetails.rsiTopEdge}</td>
            </tr>
            <tr>
                <td>RSI Last</td>
                <td>
                    {props.signalDetails.rsiLast}
                </td>
            </tr>
            <tr>
                <td>RSI BottomEdge</td>
                <td>{props.signalDetails.rsiBottomEdge}</td>
            </tr>

        </table>
    );
}

const TradingSymbol = function (props: {
    removeTradingSymbol: (name: string) => void;
    name: string;
}) {
    const remove = function () {
        props.removeTradingSymbol(props.name);
    }

    return (
        <li>
            {props.name}
            <button onClick={remove}>X</button>
        </li>
    );
}

export default function Bot() {
    // const { data: _symbols } = useGetSymbolsQuery();
    // const symbols = _symbols && [..._symbols];

    const { data, isFetching, isSuccess } = useGetBotMessagesQuery();
    const [botControl] = useBotControlMutation();

    const symbols = data && [...data.availableSymbols];

    const strategies = (isSuccess && !!data.strategy) &&
        data.strategy.map((item: any) => <StrItem {...item} />);

    const positions = (isSuccess && !!data.positions) &&
        data.positions.map((item: any) => <PosItem {...item} />);

    const posMake = function () {
        botControl({ resolvePositionMaking: !data.resolvePositionMaking });
    }

    const reuseStr = function () {
        botControl({ reuseStrategy: true });
    }

    const setTradingSymbol = function (e: BaseSyntheticEvent) {
        const trSymb = new Set<string>(data.tradingSymbols);

        trSymb.add(e.target.value);

        botControl({ tradingSymbols: Array.from(trSymb) });
    }

    const removeTradingSymbol = function (name) {
        const trSymb = new Set<string>(data.tradingSymbols);

        trSymb.delete(name);

        botControl({ tradingSymbols: Array.from(trSymb) });
    }

    symbols && symbols.sort((a: string, b: string) => {
        if (a < b) { return -1; }
        if (a > b) { return 1; }
        return 0;
    });

    const selOpt = symbols && symbols.map(s => React.createElement('option', { key: s }, s));

    const tradingSymbolsView = data && data.tradingSymbols.map((sym: string) => {
        return <TradingSymbol removeTradingSymbol={removeTradingSymbol} name={sym} key={sym} />;
    });

    return (
        <>
            <h1>Bot module</h1>
            <button onClick={posMake}> Position Making </button>
            {!!data && !data.resolvePositionMaking && ' is OFF'}
            {!!data && data.resolvePositionMaking && ' is ON'}

            <Chart symbols={symbols} />

            <h2>Chose trading symbols</h2>
            <p>
                <select onChange={setTradingSymbol}>
                    <option></option>
                    {selOpt}
                </select>
            </p>
            <h2>Trading symbols</h2>
            <ul>
                {tradingSymbolsView}
            </ul>


            <p>
                <button onClick={reuseStr}> Reuse Strategy </button>
            </p>

            <p>{isSuccess && data.status}</p>
            <table>
                <tbody>
                    <tr>
                        <th>symbols</th>
                        <th>resolve Position</th>
                        <th>position</th>
                        <th>ATR</th>
                        <th>moved percent from atr (less 30%)</th>
                    </tr>
                    {strategies}
                </tbody>
            </table>
            <div>
                <h2>positions</h2>
                {positions}
            </div>
        </>
    );
}