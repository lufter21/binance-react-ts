import React, { useEffect, useRef } from 'react';
import { useGetCandlesTicksQuery } from '../../app/chartApi';
import { DrawChart } from './DrawChart';
import css from './Chart.module.scss';
import ReactDOM from 'react-dom';
import { Painting } from './Painting';
import { Coordinates } from './Coordinates';

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
    const coordsInstRef = useRef<Coordinates>();
    const chartInstRef = useRef<DrawChart>();
    const containerRef = useRef<HTMLDivElement>();
    const paintingCanvasWrapRef = useRef<HTMLDivElement>();
    const canvInnerRef = useRef<HTMLDivElement>();
    const linesCanvasRef = useRef<HTMLCanvasElement>();
    const priceScaleBarCanvasRef = useRef<HTMLCanvasElement>();
    const priceBarCanvasRef = useRef<HTMLCanvasElement>();

    const { data } = useGetCandlesTicksQuery({ symbol: 'WAVESUSDT', limit: 50, interval: '1h' });

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
        // if (isInitialMount.current) {
        //     isInitialMount.current = false;

        //     // chartShadow = new DrawChart(canvInnerRef.current, linesCanvasRef.current, priceScaleBarCanvasRef.current, priceBarCanvasRef.current, true);

        // }

        // chartShadow.draw(props.shadowCandles);

        if (data) {
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

            if (data.length) {
                coordsInstRef.current.maxPrice = maxPrice + ((maxPrice - minPrice) / 2);
                coordsInstRef.current.minPrice = minPrice - ((maxPrice - minPrice) / 2);
                coordsInstRef.current.minTime = data[0].openTime;
                coordsInstRef.current.maxTime = data[data.length - 1].openTime;

                chartInstRef.current.minPrice = minPrice;
                chartInstRef.current.maxPrice = maxPrice;

                chartInstRef.current.draw(data, null, false);
            }
        }
    }, [data]);

    const addNewTrendline = function () {
        new Painting({
            canvasWrapEl: paintingCanvasWrapRef.current,
            canvasWidth: 2000,
            canvasHeight: 1000,
            coordsInstance: coordsInstRef.current,
            type: 'trendline'
        });
    }

    const addNewLevelLine = function () {
        new Painting({
            canvasWrapEl: paintingCanvasWrapRef.current,
            canvasWidth: 2000,
            canvasHeight: 1000,
            coordsInstance: coordsInstRef.current,
            type: 'level'
        });
    }

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
        </div>
    );
}