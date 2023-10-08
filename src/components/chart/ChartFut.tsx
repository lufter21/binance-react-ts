import React, { BaseSyntheticEvent, useEffect, useRef, useState } from 'react';
import { binanceFutApi, useGetCandlesTicksQuery, useGetDepthQuery } from '../../app/binanceFutApi';
import { DrawChart } from './DrawChart';
import css from './Chart.module.scss';
import { Drawing } from './Drawing';
import { Coordinates } from './Coordinates';
import { useGetPositionsQuery, useGetTradeLinesQuery, useSetTradeLinesMutation } from '../../app/botApi';
import { useAlert } from 'react-alert';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch } from '../../app/hooks';
import DrawLines, { Data } from './DrawLines';

// move
let startCursorPos = { X: 0, Y: 0 },
    pos = { X: 0, Y: 0 },
    newPos = { X: 0, Y: 0 };

const moveCanvas = function (contEl, moveXEls, moveYEls) {
    function move(e) {
        const dX = e.pageX - startCursorPos.X,
            posX = pos.X - dX,
            dY = e.pageY - startCursorPos.Y,
            posY = pos.Y + dY;

        for (let i = 0; i < moveXEls.length; i++) {
            moveXEls[i].style.right = posX + 'px';
        }

        for (let i = 0; i < moveYEls.length; i++) {
            moveYEls[i].style.top = posY + 'px';
        }

        newPos.X = posX;
        newPos.Y = posY;
    }

    function start(e) {
        contEl.classList.add(css.chartContainer_moving);

        startCursorPos.X = e.pageX;
        startCursorPos.Y = e.pageY;

        contEl.addEventListener('mousemove', move);
    }

    function stop() {
        contEl.classList.remove(css.chartContainer_moving);

        contEl.removeEventListener('mousemove', move);

        pos.X = newPos.X;
        pos.Y = newPos.Y;
    }

    contEl.addEventListener('mousedown', start);
    contEl.addEventListener('mouseup', stop);
}

type Props = {
    symbols?: string[];
    sendPriceFn?: (arg: number) => void;
};

export default function ChartFut(props?: Props) {
    const cdlLimit = 99;
    const initDimesions = [Math.ceil(cdlLimit * 9), Math.ceil(cdlLimit * 8)];
    const canvasDims = useRef<number[]>(initDimesions);
    const tradelinesDrawn = useRef<boolean>(false);
    const tradelinesInstances = useRef<{ [id: string]: Drawing }>({});
    const maxPriceRef = useRef<number>(0);
    const coordsInstRef = useRef<Coordinates>();
    const chartInstRef = useRef<DrawChart>();
    const positionInstRef = useRef<DrawLines>();
    const containerRef = useRef<HTMLDivElement>();
    const paintingCanvasWrapRef = useRef<HTMLDivElement>();
    const canvInnerRef = useRef<HTMLDivElement>();
    const linesCanvasRef = useRef<HTMLCanvasElement>();
    const horVolCanvasRef = useRef<HTMLCanvasElement>();
    const depthCanvasRef = useRef<HTMLCanvasElement>();
    const priceScaleBarCanvasRef = useRef<HTMLCanvasElement>();
    const priceBarCanvasRef = useRef<HTMLCanvasElement>();
    const positionCanvasRef = useRef<HTMLCanvasElement>();

    const alert = useAlert();

    const { symbol } = useParams();
    const navigate = useNavigate();

    const dispatch = useAppDispatch();

    // const [symbol, setSymbol] = useState(null);
    const [interval, setInterval] = useState('1m');
    const [scale, setScale] = useState(0);

    const symbols = (props.symbols && [...props.symbols]) || ['BTCUSDT'];

    // const { data: _symbols } = useGetSymbolsQuery();

    // const symbols = _symbols && [..._symbols];

    // const { data: botMsg } = useGetBotMessagesQuery();

    // const symbols = botMsg && [...botMsg.availableSymbols];

    // const { data: tradeList } = useGetTradesListQuery({ symbol, limit: 1000 }, { skip: !symbol });

    const { data } = useGetCandlesTicksQuery({ symbol, limit: cdlLimit, interval }, { skip: !symbol });

    // const { data: depth } = useGetDepthQuery({ symbol, limit: 99 }, { skip: !symbol });

    const { data: tradelines } = useGetTradeLinesQuery();
    const [setTradeLineMtn] = useSetTradeLinesMutation();

    const { data: positions } = useGetPositionsQuery();

    const viewAmount = function (obj) {
        if (!obj) {
            return;
        }

        let price: number[];

        if (obj.type === 'trends') {
            price = [obj.lines[0].start.price, obj.lines[1].start.price];
        } else {
            price = obj.price;
        }

        const percentLoss = Math.abs(price[0] - price[1]) / (price[0] / 100);
        const fee = .08;
        const lossAmount = 1;

        const usdtAmount = lossAmount * (100 / percentLoss - fee);

        alert.show('Expected amount: ' + usdtAmount.toFixed(2) + ' USDT');
    }

    const setTradeLine = function (sendData: any) {
        if (sendData.removeId) {
            if (tradelinesInstances.current[sendData.removeId]) {
                tradelinesInstances.current[sendData.removeId].remove();
            }

            delete tradelinesInstances.current[sendData.removeId];
        } else {
            sendData.obj.symbol = symbol;
        }

        setTradeLineMtn(sendData);

        viewAmount(sendData.obj);
    }

    useEffect(() => {
        const coords = new Coordinates({
            canvW: canvasDims.current[0],
            canvH: canvasDims.current[1],
        });

        coordsInstRef.current = coords;

        const chart = new DrawChart({
            canvInEl: canvInnerRef.current,
            linesCanvEl: linesCanvasRef.current,
            horVolumeCanvEl: horVolCanvasRef.current,
            depthCanvEl: depthCanvasRef.current,
            priceScaleBarCanvEl: priceScaleBarCanvasRef.current,
            priceBarCanvEl: priceBarCanvasRef.current,
            isShadow: false,
            canvasWidth: canvasDims.current[0],
            canvasHeight: canvasDims.current[1],
            coordsInstance: coords
        });

        chartInstRef.current = chart;

        const positionInst = new DrawLines({
            canvEl: positionCanvasRef.current,
            canvasWidth: canvasDims.current[0],
            canvasHeight: canvasDims.current[1],
            coordsInstance: coords
        });

        positionInstRef.current = positionInst;

        moveCanvas(
            containerRef.current,
            containerRef.current.querySelectorAll('.move-axis-x'),
            containerRef.current.querySelectorAll('.move-axis-y')
        );

        if (props.sendPriceFn) {
            paintingCanvasWrapRef.current.style.width = canvasDims.current[0] + 'px';
            paintingCanvasWrapRef.current.style.height = canvasDims.current[1] + 'px';

            paintingCanvasWrapRef.current.addEventListener('click', function (e: MouseEvent) {
                const y = e.clientY - paintingCanvasWrapRef.current.getBoundingClientRect().top;

                props.sendPriceFn(coordsInstRef.current.getProps(0, y).price);
            });
        }
    }, []);

    useEffect(() => {
        canvasDims.current = [
            initDimesions[0] + scale,
            initDimesions[1] + scale,
        ];

        coordsInstRef.current.canvW = canvasDims.current[0];
        coordsInstRef.current.canvH = canvasDims.current[1];

        chartInstRef.current.canvasWidth = canvasDims.current[0];
        chartInstRef.current.canvasHeight = canvasDims.current[1];
        chartInstRef.current.reInit();

        for (const trlInst of Object.values(tradelinesInstances.current)) {
            trlInst.canvasWidth = canvasDims.current[0];
            trlInst.canvasHeight = canvasDims.current[1];
            trlInst.reInit();
        }

    }, [scale]);

    // useEffect(() => {
    //     if (tradeList && maxPriceRef.current > 0) {
    //         chartInstRef.current.drawHorVolume(tradeList);
    //     }
    // }, [tradeList, maxPriceRef.current]);

    useEffect(() => {
        if (symbol && tradelines && tradelines[symbol] && maxPriceRef.current > 0 && !tradelinesDrawn.current) {
            tradelinesDrawn.current = true;

            const levels = tradelines[symbol].levels;
            const trends = tradelines[symbol].trends;

            for (const lvl of levels) {

                const pInst = new Drawing({
                    id: lvl.id,
                    canvasWrapEl: paintingCanvasWrapRef.current,
                    canvasWidth: canvasDims.current[0],
                    canvasHeight: canvasDims.current[1],
                    coordsInstance: coordsInstRef.current,
                    type: 'levels',
                    sendFn: setTradeLine
                });

                tradelinesInstances.current[pInst.id] = pInst;

                pInst.drawWithData(lvl);

            }

            for (const trd of trends) {
                const pInst = new Drawing({
                    id: trd.id,
                    canvasWrapEl: paintingCanvasWrapRef.current,
                    canvasWidth: canvasDims.current[0],
                    canvasHeight: canvasDims.current[1],
                    coordsInstance: coordsInstRef.current,
                    type: 'trends',
                    sendFn: setTradeLine
                });

                tradelinesInstances.current[pInst.id] = pInst;

                pInst.drawWithData(trd);

            }

        }
    }, [tradelines, maxPriceRef.current, symbol]);

    useEffect(() => {
        // if (isInitialMount.current) {
        //     isInitialMount.current = false;

        //     // chartShadow = new DrawChart(canvInnerRef.current, linesCanvasRef.current, priceScaleBarCanvasRef.current, priceBarCanvasRef.current, true);

        // }

        // chartShadow.draw(props.shadowCandles);

        if (data && data.length) {

            if (maxPriceRef.current === 0) {
                let minPrice = 999999;
                let maxPrice = 0;

                for (const cdl of data) {
                    if (cdl.low < minPrice) {
                        minPrice = cdl.low;
                    }

                    if (cdl.high > maxPrice) {
                        maxPrice = cdl.high;
                    }
                }

                coordsInstRef.current.maxPrice = maxPrice + ((maxPrice - minPrice) / 4);
                coordsInstRef.current.minPrice = minPrice - ((maxPrice - minPrice) / 4);

                const minTime = data[0].openTime;
                const maxTime = data.slice(-1)[0].openTime;

                coordsInstRef.current.minTime = minTime;
                coordsInstRef.current.maxTime = maxTime + ((maxTime - minTime) / 4);

                chartInstRef.current.minPrice = minPrice;
                chartInstRef.current.maxPrice = maxPrice;

                maxPriceRef.current = maxPrice;
            }

            chartInstRef.current.draw(data, null, false);

        }

        if (positions) {
            const position = positions.filter((item) => item.symbol == symbol)[0];

            if (position) {
                const lines: Data = [
                    {
                        price: position.entryPrice,
                        color: 'blue',
                    },
                    {
                        price: position.stopLoss,
                        color: 'red',
                    },
                    {
                        price: position.takeProfit,
                        color: 'green',
                    },
                ];

                positionInstRef.current.draw(lines);
            } else {
                positionInstRef.current.draw(null);
            }
        }
    }, [data, positions]);

    // useEffect(() => {
    //     if (depth && maxPriceRef.current > 0) {
    //         chartInstRef.current.drawDepth(depth, symbol);
    //     }
    // }, [depth, maxPriceRef.current]);

    const addNewTrendline = function () {
        tradelinesDrawn.current = true;

        const pInst = new Drawing({
            id: symbol + Math.random() + 'trends',
            canvasWrapEl: paintingCanvasWrapRef.current,
            canvasWidth: canvasDims.current[0],
            canvasHeight: canvasDims.current[1],
            coordsInstance: coordsInstRef.current,
            type: 'trends',
            sendFn: setTradeLine
        });

        tradelinesInstances.current[pInst.id] = pInst;
    }

    const addNewLevelLine = function () {
        tradelinesDrawn.current = true;

        const pInst = new Drawing({
            id: 'd_' + symbol + Math.random() + 'levels',
            canvasWrapEl: paintingCanvasWrapRef.current,
            canvasWidth: canvasDims.current[0],
            canvasHeight: canvasDims.current[1],
            coordsInstance: coordsInstRef.current,
            type: 'levels',
            sendFn: setTradeLine
        });

        tradelinesInstances.current[pInst.id] = pInst;
    }

    const removeAllTradelines = function () {
        for (const trlInst of Object.values(tradelinesInstances.current)) {
            trlInst.remove();
        }

        tradelinesInstances.current = {};

        tradelinesDrawn.current = false;

        setTradeLineMtn({ removeAll: symbol });
    }

    const selectSymbol = function (e: BaseSyntheticEvent) {
        for (const trlInst of Object.values(tradelinesInstances.current)) {
            trlInst.remove();
        }

        tradelinesInstances.current = {};

        tradelinesDrawn.current = false;
        maxPriceRef.current = 0;

        // setSymbol(e.target.value);
        dispatch(binanceFutApi.util.resetApiState());
        navigate(e.target.value);
    }

    const selectInterval = function (val: string) {
        for (const trlInst of Object.values(tradelinesInstances.current)) {
            trlInst.remove();
        }

        tradelinesInstances.current = {};

        tradelinesDrawn.current = false;
        maxPriceRef.current = 0;

        setInterval(val);
    }

    symbols && symbols.sort((a: string, b: string) => {
        if (a < b) { return -1; }
        if (a > b) { return 1; }
        return 0;
    });

    const selOpt = symbols && symbols.map(s => React.createElement('option', { key: s }, s));

    return (
        <div ref={containerRef} className={css.chartContainer}>
            <div className={css.canvasContainer}>
                <div className={css.canvasWrap}>
                    <div className={css.canvasWrap__inner + ' move-axis-y'}>
                        <div ref={canvInnerRef} className={css.canvasWrap__inner + ' move-axis-x'}></div>
                        <canvas ref={linesCanvasRef} className={css.linesCanvas}></canvas>
                        <canvas ref={horVolCanvasRef} className={css.horVolumeCanvas}></canvas>
                        <canvas ref={depthCanvasRef} className={css.depthCanvas}></canvas>
                        <canvas ref={positionCanvasRef} className={css.positionCanvas}></canvas>
                    </div>
                </div>

                <div className={css.paintingLayer}>
                    <div className={css.paintingLayer__controls}>
                        <p>Drawing</p>
                        <button onClick={addNewTrendline}>Trend</button>
                        <button onClick={addNewLevelLine}>Level</button>
                        {tradelines &&
                            <button onClick={removeAllTradelines}>Remove all</button>
                        }
                    </div>
                    <div className={css.paintingLayer__inner + ' move-axis-x move-axis-y'}>
                        <div ref={paintingCanvasWrapRef} className={css.paintingCanvasWrap}> </div>
                    </div>
                </div>

                <div className={css.rightBar}>
                    <div className={css.rightBar__inner + ' move-axis-y'}>
                        <canvas ref={priceScaleBarCanvasRef} className={css.priceScaleBar}></canvas>
                        <canvas ref={priceBarCanvasRef} className={css.priceBar}></canvas>
                    </div>
                </div>
            </div>

            <select onChange={selectSymbol} className={css.select}>
                <option></option>
                {selOpt}
            </select>

            <div className={css.intervalButtons}>
                <button
                    onClick={() => selectInterval('1m')}
                    className={interval === '1m' ? css.btnActive : undefined}
                >1m</button>

                <button
                    onClick={() => selectInterval('5m')}
                    className={interval === '5m' ? css.btnActive : undefined}
                >5m</button>

                <button
                    onClick={() => selectInterval('1h')}
                    className={interval === '1h' ? css.btnActive : undefined}
                >1h</button>
            </div>

            {/* <div className={css.scaleButtons}>
                <button onClick={() => setScale(scale - 100)}>-</button>
                <button onClick={() => setScale(scale + 100)}>+</button>
                <button onClick={() => setScale(0)}>reset</button>
            </div> */}
        </div>
    );
}