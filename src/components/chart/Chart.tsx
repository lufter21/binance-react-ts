import React, { BaseSyntheticEvent, useEffect, useRef, useState } from 'react';
import { useGetCandlesTicksQuery, useGetSymbolsQuery, useGetTradesListQuery } from '../../app/binanceApi';
import { DrawChart } from './DrawChart';
import css from './Chart.module.scss';
import { Drawing } from './Drawing';
import { Coordinates } from './Coordinates';
import { useGetBotMessagesQuery, useGetTradeLinesQuery, useSetTradeLinesMutation } from '../../app/botApi';

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

const initDimesions = [4333, 1333];

export default function Chart() {
    const canvasDims = useRef<number[]>(initDimesions);
    const tradelinesDrawn = useRef<boolean>(false);
    const tradelinesInstances = useRef<{ [id: string]: Drawing }>({});
    const maxPriceRef = useRef<number>(0);
    const coordsInstRef = useRef<Coordinates>();
    const chartInstRef = useRef<DrawChart>();
    const containerRef = useRef<HTMLDivElement>();
    const paintingCanvasWrapRef = useRef<HTMLDivElement>();
    const canvInnerRef = useRef<HTMLDivElement>();
    const linesCanvasRef = useRef<HTMLCanvasElement>();
    const horVolCanvasRef = useRef<HTMLCanvasElement>();
    const priceScaleBarCanvasRef = useRef<HTMLCanvasElement>();
    const priceBarCanvasRef = useRef<HTMLCanvasElement>();

    const [symbol, setSymbol] = useState(null);
    const [scale, setScale] = useState(0);

    // const symbols = ['WAVESUSDT'];

    // const { data: _symbols } = useGetSymbolsQuery();

    // const symbols = _symbols && [..._symbols];

    const { data: botMsg } = useGetBotMessagesQuery();

    const symbols = botMsg && [...botMsg.availableSymbols];

    // const { data: tradeList } = useGetTradesListQuery({ symbol, limit: 1000 }, { skip: !symbol });

    const { data: tradelines } = useGetTradeLinesQuery();
    const { data } = useGetCandlesTicksQuery({ symbol, limit: 500, interval: '5m' }, { skip: !symbol });

    const [setTradeLineMtn] = useSetTradeLinesMutation();

    const setTradeLine = function (sendData: any) {
        console.log(sendData);
        if (sendData.removeId) {
            if (tradelinesInstances.current[sendData.removeId]) {
                tradelinesInstances.current[sendData.removeId].remove();
            }

            delete tradelinesInstances.current[sendData.removeId];
        } else {
            sendData.obj.symbol = symbol;
        }

        setTradeLineMtn(sendData);
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
            priceScaleBarCanvEl: priceScaleBarCanvasRef.current,
            priceBarCanvEl: priceBarCanvasRef.current,
            isShadow: false,
            canvasWidth: canvasDims.current[0],
            canvasHeight: canvasDims.current[1],
            coordsInstance: coords
        });

        chartInstRef.current = chart;

        moveCanvas(
            containerRef.current,
            containerRef.current.querySelectorAll('.move-axis-x'),
            containerRef.current.querySelectorAll('.move-axis-y')
        );
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
    //         tradeList && chartInstRef.current.drawHorVolume(tradeList);
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
    }, [data]);

    const addNewTrendline = function () {
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
        const pInst = new Drawing({
            id: symbol + Math.random() + 'levels',
            canvasWrapEl: paintingCanvasWrapRef.current,
            canvasWidth: canvasDims.current[0],
            canvasHeight: canvasDims.current[1],
            coordsInstance: coordsInstRef.current,
            type: 'levels',
            sendFn: setTradeLine
        });

        tradelinesInstances.current[pInst.id] = pInst;
    }

    const selectSymbol = function (e: BaseSyntheticEvent) {
        for (const trlInst of Object.values(tradelinesInstances.current)) {
            trlInst.remove();
        }

        tradelinesInstances.current = {};

        tradelinesDrawn.current = false;
        maxPriceRef.current = 0;

        setSymbol(e.target.value);
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
                    </div>
                </div>

                <div className={css.paintingLayer}>
                    <div className={css.paintingLayer__controls}>
                        <p>Drawing</p>
                        <button onClick={addNewTrendline}>Trend</button>
                        <button onClick={addNewLevelLine}>Level</button>
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

            {/* <div className={css.scaleButtons}>
                <button onClick={() => setScale(scale - 100)}>-</button>
                <button onClick={() => setScale(scale + 100)}>+</button>
                <button onClick={() => setScale(0)}>reset</button>
            </div> */}
        </div>
    );
}