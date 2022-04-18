import { Candle } from '../../app/binanceApi';
import css from './Chart.module.scss';
import { Coordinates } from './Coordinates';

export class DrawChart {
    isShadow: boolean;
    minPrice: number;
    maxPrice: number;
    candlesCount: number;
    candleWidth: number;
    canvInEl: HTMLDivElement;
    canvEl: HTMLCanvasElement;
    priceScaleBarCanvEl: HTMLCanvasElement;
    priceBarCanvEl: HTMLCanvasElement;
    linesCanvEl: HTMLCanvasElement;
    horVolumeCanvEl: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    linesCtx: CanvasRenderingContext2D;
    priceBarCtx: CanvasRenderingContext2D;
    priceScaleBarCtx: CanvasRenderingContext2D;
    coordsInstance: Coordinates;
    horVolumeCtx: CanvasRenderingContext2D;

    constructor({ canvInEl, linesCanvEl, horVolumeCanvEl, priceScaleBarCanvEl, priceBarCanvEl, isShadow, canvasWidth, canvasHeight, coordsInstance }: {
        canvInEl: HTMLDivElement;
        linesCanvEl: HTMLCanvasElement;
        horVolumeCanvEl: HTMLCanvasElement;
        priceScaleBarCanvEl: HTMLCanvasElement;
        priceBarCanvEl: HTMLCanvasElement;
        isShadow: boolean;
        canvasWidth: number;
        canvasHeight: number;
        coordsInstance: Coordinates;
    }) {
        this.isShadow = isShadow;
        this.minPrice = 0;
        this.maxPrice = 0;
        this.candlesCount = 0;

        this.canvInEl = canvInEl;

        this.canvEl = document.createElement('canvas');
        this.priceScaleBarCanvEl = priceScaleBarCanvEl;
        this.priceBarCanvEl = priceBarCanvEl;
        this.linesCanvEl = linesCanvEl;
        this.horVolumeCanvEl = horVolumeCanvEl;

        this.canvEl.classList.add((isShadow) ? css.shadowCanvas : css.canvas);

        this.canvInEl.appendChild(this.canvEl);

        this.canvEl.width = canvasWidth;
        this.canvEl.height = canvasHeight;
        this.canvEl.style.width = canvasWidth + 'px';
        this.canvEl.style.height = canvasHeight + 'px';

        this.linesCanvEl.width = this.linesCanvEl.offsetWidth;
        this.linesCanvEl.height = canvasHeight;
        this.linesCanvEl.style.height = canvasHeight + 'px';

        this.horVolumeCanvEl.width = this.horVolumeCanvEl.offsetWidth;
        this.horVolumeCanvEl.height = canvasHeight;
        this.horVolumeCanvEl.style.height = canvasHeight + 'px';

        this.priceBarCanvEl.width = priceBarCanvEl.offsetWidth;
        this.priceBarCanvEl.height = canvasHeight;
        this.priceBarCanvEl.style.height = canvasHeight + 'px';

        this.priceScaleBarCanvEl.width = priceScaleBarCanvEl.offsetWidth;
        this.priceScaleBarCanvEl.height = priceScaleBarCanvEl.offsetHeight;

        this.ctx = this.canvEl.getContext('2d');
        this.linesCtx = linesCanvEl.getContext('2d');
        this.horVolumeCtx = this.horVolumeCanvEl.getContext('2d');
        this.priceBarCtx = priceBarCanvEl.getContext('2d');
        this.priceScaleBarCtx = priceScaleBarCanvEl.getContext('2d');

        this.coordsInstance = coordsInstance;
    }

    drawPriceScale() {
        if (this.isShadow) {
            return;
        }

        const pix = this.priceScaleBarCanvEl.height / (this.maxPrice - this.minPrice), step = (this.maxPrice - this.minPrice) / 50;

        this.priceScaleBarCtx.clearRect(0, 0, this.priceScaleBarCanvEl.width, this.priceScaleBarCanvEl.height);

        this.priceScaleBarCtx.beginPath();
        this.linesCtx.strokeStyle = '#888888';

        this.priceScaleBarCtx.fillStyle = '#888888';
        this.priceScaleBarCtx.font = '10px sans-serif';

        for (let i = 0; i < 50; i++) {
            const price = this.minPrice + (step * i), priceY = Math.ceil(this.priceScaleBarCanvEl.height - ((price - this.minPrice) * pix));


            this.priceScaleBarCtx.moveTo(0, priceY + .5);
            this.priceScaleBarCtx.lineTo(3, priceY + .5);

            this.priceScaleBarCtx.fillText(price.toFixed(2), 5, priceY + 4);
        }

        this.priceScaleBarCtx.stroke();
    }

    drawPriceLine(cdl: Candle) {
        let color = '#555555';

        if (cdl.open > cdl.close) {
            color = '#ff0000';
        } else {
            color = '#008000';
        }

        const { x, y } = this.coordsInstance.getCoordinates(cdl.close);

        this.linesCtx.clearRect(0, 0, this.linesCanvEl.width, this.linesCanvEl.height);

        this.linesCtx.strokeStyle = color;
        this.linesCtx.lineWidth = 1;

        this.linesCtx.beginPath();
        this.linesCtx.setLineDash([5, 2]);
        this.linesCtx.moveTo(x, Math.round(y) + .5);
        this.linesCtx.lineTo(this.linesCanvEl.width, Math.round(y) + .5);
        this.linesCtx.stroke();
    }

    drawPrice(cdl: Candle) {
        let color = '#555555';

        if (cdl.open > cdl.close) {
            color = '#ff0000';
        } else {
            color = '#008000';
        }

        const Y = this.coordsInstance.getCoordinates(cdl.close).y;

        this.priceBarCtx.clearRect(0, 0, this.priceBarCanvEl.width, this.priceBarCanvEl.height);

        this.priceBarCtx.fillStyle = color;
        this.priceBarCtx.fillRect(0, Y - 10, this.priceBarCanvEl.width, 20);

        this.priceBarCtx.fillStyle = '#ffffff';
        this.priceBarCtx.font = '12px sans-serif';
        this.priceBarCtx.textAlign = 'center';
        this.priceBarCtx.fillText(String(cdl.close), this.priceBarCanvEl.width / 2, Y + 4);
    }

    drawCandle(i: number, cdl: Candle): void {
        let color = '#555555';

        if (cdl.open > cdl.close) {
            color = '#ff0000';
        } else {
            color = '#008000';
        }

        const open = this.coordsInstance.getCoordinates(cdl.open, cdl.openTime);
        const close = this.coordsInstance.getCoordinates(cdl.close, cdl.openTime);
        const high = this.coordsInstance.getCoordinates(cdl.high, cdl.openTime);
        const low = this.coordsInstance.getCoordinates(cdl.low, cdl.openTime);

        this.ctx.fillStyle = color;
        this.ctx.fillRect(open.x, open.y, this.candleWidth, close.y - open.y || 1);
        this.ctx.fillRect(Math.floor(high.x + this.candleWidth / 2), high.y, 1, low.y - high.y || 1);

    }

    draw(candles: Candle[], setPriceRange: (arg0: { min: number; max: number; }) => void, reset: boolean) {
        if (reset) {
            this.candlesCount = 0;
            this.minPrice = 0;
            this.maxPrice = 0;
        }

        this.candlesCount = candles.length;

        const lastCandle = candles.slice(-1)[0];

        this.drawPriceLine(lastCandle);
        this.drawPrice(lastCandle);

        // candles.forEach(obj => {
        //     if (obj.low < this.minPrice || !this.minPrice) {
        //         this.minPrice = obj.low;

        //         this.drawPriceScale();
        //     }

        //     if (obj.high > this.maxPrice || !this.maxPrice) {
        //         this.maxPrice = obj.high;

        //         this.drawPriceScale();
        //     }
        // });

        if (setPriceRange) {
            setPriceRange({
                min: this.minPrice,
                max: this.maxPrice
            });
        }

        // const canvElW = candles.length * this.candleWidth + this.candleWidth * candles.length + 500;

        // this.canvEl.width = canvElW;
        // this.canvEl.style.width = canvElW + 'px';

        // this.coords.maxPrice = this.maxPrice + ((this.maxPrice - this.minPrice) / 2);
        // this.coords.minPrice = this.minPrice - ((this.maxPrice - this.minPrice) / 2);
        // this.coords.minTime = candles[0].openTime;
        // this.coords.maxTime = candles[candles.length - 1].openTime;

        this.ctx.clearRect(0, 0, this.canvEl.width, this.canvEl.height);

        this.candleWidth = this.coordsInstance.getCoordinates(candles[1].open, candles[1].openTime).x - this.coordsInstance.getCoordinates(candles[0].open, candles[0].openTime).x - 1;

        candles.forEach((obj, i) => {
            this.drawCandle(i, obj);
        });
    }

    drawHorVolume(data: { price: number, buy: number, sell: number }[]) {
        let maxVol = 0;

        for (const item of data) {
            if (item.buy + item.sell > maxVol) {
                maxVol = item.buy + item.sell;
            }
        }

        const resolution = this.horVolumeCanvEl.width / maxVol;

        this.horVolumeCtx.clearRect(0, 0, this.horVolumeCanvEl.width, this.horVolumeCanvEl.height);

        this.horVolumeCtx.fillStyle = 'black';

        for (const item of data) {
            const vol = item.buy + item.sell;

            const pY = this.coordsInstance.getCoordinates(item.price).y;

            console.log(vol * resolution, pY, item.price);

            this.horVolumeCtx.fillRect(0, pY, vol * resolution, 1);
        }
    }
}