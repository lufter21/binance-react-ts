import { useBotControlMutation, useGetBotMessagesQuery } from '../../app/botApi';

const StrItem = function (props: any) {
    let arr = '',
        arrP = '';

    if (props.signalDetails.rsiLast >= props.signalDetails.rsiTopEdge) {
        arr = 'top';
    } else if (props.signalDetails.rsiLast <= props.signalDetails.rsiBottomEdge) {
        arr = 'bot';
    }

    if (props.signalDetails.rsiLast >= props.signalDetails.rsiTopEdge - 10) {
        arrP = 'top';
    } else if (props.signalDetails.rsiLast <= props.signalDetails.rsiBottomEdge + 10) {
        arrP = 'bot';
    }

    return (
        <table>
            <tr>
                <th colSpan={2}>{props.symbol}</th>
            </tr>
            <tr>
                <td>position</td>
                <td>{props.position}</td>
            </tr>
            <tr>
                <td>entryPrice</td>
                <td>{props.entryPrice}</td>
            </tr>
            <tr>
                <td>percentLoss</td>
                <td>{props.percentLoss}</td>
            </tr>
            <tr>
                <td>stopLoss</td>
                <td>{props.signalDetails.stopLoss}</td>
            </tr>
            <tr>
                <td>resolvePosition</td>
                <td style={props.resolvePosition ? { color: "darkgreen" } : { color: "grey" }}>
                    {props.resolvePosition && 'Yes'}
                    {!props.resolvePosition && 'No'}
                </td>
            </tr>
            <tr>
                <th colSpan={2}>signalDetails</th>
            </tr>
            <tr>
                <td>SMA</td>
                <td>{props.signalDetails.lastSMA}</td>
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
                <td>
                    {props.signalDetails.smaChange}
                    {props.signalDetails.smaChange < props.signalDetails.percentAverageCandleMove &&
                        <span>&#10174;</span>
                    }
                </td>
            </tr>
            <tr>
                <td>RSI TopEdge</td>
                <td>{props.signalDetails.rsiTopEdge}</td>
                {/* <td>{props.signalDetails.rsiTopEdge - 10}</td> */}
            </tr>
            <tr>
                <td>RSI Last</td>
                <td>
                    {props.signalDetails.rsiLast}
                    {arr === 'top' && <span>&#10138;</span>}
                    {arr === 'bot' && <span>&#10136;</span>}
                </td>
                {/* <td>
                    {props.signalDetails.rsiLast}
                    {arrP === 'top' && <span>&#10138;</span>}
                    {arrP === 'bot' && <span>&#10136;</span>}
                </td> */}
            </tr>
            <tr>
                <td>RSI BottomEdge</td>
                <td>{props.signalDetails.rsiBottomEdge}</td>
                {/* <td>{props.signalDetails.rsiBottomEdge + 10}</td> */}
            </tr>
        </table>
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
                <td>
                    {props.signalDetails.smaChange}
                </td>
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
            <tr>
                <td>lastSMA</td>
                <td>{props.signalDetails.lastSMA}</td>
            </tr>
        </table>
    );
}

export default function Bot() {
    const { data, isFetching, isSuccess } = useGetBotMessagesQuery();
    const [botControl] = useBotControlMutation();

    const strategies = (isSuccess && !!data.strategy) &&
        data.strategy.map((item: any) => <StrItem {...item} />);

    const positions = (isSuccess && !!data.positions) &&
        data.positions.map((item: any) => <PosItem {...item} />);

    const posMake = function () {
        botControl({ resolvePositionMaking: !data.controls.resolvePositionMaking });
    }

    return (isFetching || !isSuccess) ? <p>Loading...</p> : (
        <>
            <h1>Bot module</h1>
            <button onClick={posMake}> Position Making </button>
            {!data.controls.resolvePositionMaking && ' is OFF'}
            {data.controls.resolvePositionMaking && ' is ON'}

            <p>{isSuccess && data.status}</p>
            <div style={{ display: 'flex' }}>
                {strategies}
            </div>
            <div>
                <h2>positions</h2>
                {positions}
            </div>
        </>
    );
}