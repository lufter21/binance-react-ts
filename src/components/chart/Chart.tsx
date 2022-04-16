import React, { BaseSyntheticEvent, useEffect, useRef, useState } from 'react';
import { useGetCandlesTicksQuery, useGetSymbolsQuery } from '../../app/chartApi';
import { DrawChart } from './DrawChart';
import css from './Chart.module.scss';
import ReactDOM from 'react-dom';
import { Painting } from './Painting';
import { Coordinates } from './Coordinates';
import { useGetTradeLinesQuery, useSetTradeLinesMutation } from '../../app/botApi';

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

export default function Chart() {
    const tradelinesDrawn = useRef<boolean>(false);
    const tradelinesInstances = useRef<{ [id: string]: Painting }>({});
    const maxPriceRef = useRef<number>(0);
    const coordsInstRef = useRef<Coordinates>();
    const chartInstRef = useRef<DrawChart>();
    const containerRef = useRef<HTMLDivElement>();
    const paintingCanvasWrapRef = useRef<HTMLDivElement>();
    const canvInnerRef = useRef<HTMLDivElement>();
    const linesCanvasRef = useRef<HTMLCanvasElement>();
    const priceScaleBarCanvasRef = useRef<HTMLCanvasElement>();
    const priceBarCanvasRef = useRef<HTMLCanvasElement>();

    const [symbol, setSymbol] = useState(null);

    // const symbol = 'WAVESUSDT';

    const { data: symbols } = useGetSymbolsQuery();
    const { data: tradelines } = useGetTradeLinesQuery({ symbol }, { skip: !symbol });
    const { data } = useGetCandlesTicksQuery({ symbol, limit: 150, interval: '1h' }, { skip: !symbol });

    const [setTradeLineMutat] = useSetTradeLinesMutation();

    const setTradeLine = function (sendData: any) {
        sendData.symbol = symbol;

        if (sendData.removeId) {
            tradelinesInstances.current[sendData.removeId].remove();
            
            delete tradelinesInstances.current[sendData.removeId];
        }

        setTradeLineMutat(sendData);
    }

    useEffect(() => {
        const coords = new Coordinates({
            canvW: 2000,
            canvH: 1000,
        });

        coordsInstRef.current = coords;

        const chart = new DrawChart({
            canvInEl: canvInnerRef.current,
            linesCanvEl: linesCanvasRef.current,
            priceScaleBarCanvEl: priceScaleBarCanvasRef.current,
            priceBarCanvEl: priceBarCanvasRef.current,
            isShadow: false,
            canvasWidth: 2000,
            canvasHeight: 1000,
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
        if (tradelines && maxPriceRef.current > 0 && !tradelinesDrawn.current) {
            tradelinesDrawn.current = true;

            const levels = tradelines.levels;

            for (const lvl of levels) {
                const pInst = new Painting({
                    canvasWrapEl: paintingCanvasWrapRef.current,
                    canvasWidth: 2000,
                    canvasHeight: 1000,
                    coordsInstance: coordsInstRef.current,
                    type: 'levels',
                    sendFn: setTradeLine
                });

                pInst.drawWithData(lvl);

                tradelinesInstances.current[pInst.id] = pInst;
            }

        }
    }, [tradelines, maxPriceRef.current]);

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

                coordsInstRef.current.maxPrice = maxPrice + ((maxPrice - minPrice) / 2);
                coordsInstRef.current.minPrice = minPrice - ((maxPrice - minPrice) / 2);
                coordsInstRef.current.minTime = data[0].openTime;
                coordsInstRef.current.maxTime = data[data.length - 1].openTime;

                chartInstRef.current.minPrice = minPrice;
                chartInstRef.current.maxPrice = maxPrice;

                maxPriceRef.current = maxPrice;
            }

            chartInstRef.current.draw(data, null, false);

        }
    }, [data]);

    const addNewTrendline = function () {
        const pInst = new Painting({
            canvasWrapEl: paintingCanvasWrapRef.current,
            canvasWidth: 2000,
            canvasHeight: 1000,
            coordsInstance: coordsInstRef.current,
            type: 'trends',
            sendFn: setTradeLine
        });

        pInst.id = symbol + Math.random() + 'trends';

        tradelinesInstances.current[pInst.id] = pInst;
    }

    const addNewLevelLine = function () {
        const pInst = new Painting({
            canvasWrapEl: paintingCanvasWrapRef.current,
            canvasWidth: 2000,
            canvasHeight: 1000,
            coordsInstance: coordsInstRef.current,
            type: 'levels',
            sendFn: setTradeLine
        });

        pInst.id = symbol + Math.random() + 'levels';

        tradelinesInstances.current[pInst.id] = pInst;
    }

    const selectSymbol = function (e: BaseSyntheticEvent) {
        tradelinesDrawn.current = false;
        maxPriceRef.current = 0;

        setSymbol(e.target.value);
    }

    const selOpt = !!symbols && symbols.map(s => React.createElement('option', { key: s }, s));

    return (
        <div ref={containerRef} className={css.chartContainer}>
            <div className={css.canvasContainer}>
                <div className={css.canvasWrap}>
                    <div className={css.canvasWrap__inner + ' move-axis-y'}>
                        <div ref={canvInnerRef} className={css.canvasWrap__inner + ' move-axis-x'}></div>
                        <canvas ref={linesCanvasRef} className={css.linesCanvas}></canvas>
                    </div>
                </div>

                <div className={css.paintingLayer}>
                    <div className={css.paintingLayer__controls}>
                        <p>Painting</p>
                        <button onClick={addNewTrendline}>Trandline</button>
                        <button onClick={addNewLevelLine}>Level line</button>
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
        </div>
    );
}