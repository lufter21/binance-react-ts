import { Candle } from '../../app/chartApi';
import css from './Chart.module.scss';
import { Coordinates } from './Coordinates';

export class DrawChart {
    isShadow: any;
    minPrice: number;
    maxPrice: number;
    candlesCount: number;
    candleWidth: number;
    canvInEl: any;
    canvEl: HTMLCanvasElement;
    priceScaleBarCanvEl: any;
    priceBarCanvEl: any;
    linesCanvEl: any;
    ctx: CanvasRenderingContext2D;
    linesCtx: CanvasRenderingContext2D;
    priceBarCtx: CanvasRenderingContext2D;
    priceScaleBarCtx: CanvasRenderingContext2D;
    coordsInstance: Coordinates;

    constructor({ canvInEl, linesCanvEl, priceScaleBarCanvEl, priceBarCanvEl, isShadow, canvasWidth, canvasHeight, coordsInstance }: { canvInEl; linesCanvEl; priceScaleBarCanvEl; priceBarCanvEl; isShadow; canvasWidth; canvasHeight; coordsInstance; }) {
        this.isShadow = isShadow;
        this.minPrice = 0;
        this.maxPrice = 0;
        this.candlesCount = 0;
        this.candleWidth = 9;

        this.canvInEl = canvInEl;

        this.canvEl = document.createElement('canvas');
        this.priceScaleBarCanvEl = priceScaleBarCanvEl;
        this.priceBarCanvEl = priceBarCanvEl;
        this.linesCanvEl = linesCanvEl;

        this.canvEl.classList.add((isShadow) ? css.shadowCanvas : css.canvas);

        this.canvInEl.appendChild(this.canvEl);

        this.canvEl.width = canvasWidth;
        this.canvEl.height = this.canvEl.offsetHeight * 2;
        this.canvEl.style.width = canvasWidth + 'px';
        this.canvEl.style.height = this.canvEl.height + 'px';

        this.linesCanvEl.width = this.linesCanvEl.offsetWidth;
        this.linesCanvEl.height = this.linesCanvEl.offsetHeight * 2;
        this.linesCanvEl.style.width = this.linesCanvEl.width + 'px';
        this.linesCanvEl.style.height = this.linesCanvEl.height + 'px';

        this.priceBarCanvEl.width = priceBarCanvEl.offsetWidth;
        this.priceBarCanvEl.height = priceBarCanvEl.offsetHeight;

        this.priceScaleBarCanvEl.width = priceScaleBarCanvEl.offsetWidth;
        this.priceScaleBarCanvEl.height = priceScaleBarCanvEl.offsetHeight;

        this.ctx = this.canvEl.getContext('2d');
        this.linesCtx = linesCanvEl.getContext('2d');
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

    drawPriceLine(priceY, color) {
        priceY = Math.ceil(priceY) + .5;

        this.linesCtx.clearRect(0, 0, this.linesCanvEl.width, this.linesCanvEl.height);

        this.linesCtx.strokeStyle = color;
        this.linesCtx.lineWidth = 1;

        this.linesCtx.beginPath();
        this.linesCtx.setLineDash([5, 2]);
        this.linesCtx.moveTo(0, priceY);
        this.linesCtx.lineTo(this.linesCanvEl.width, priceY);
        this.linesCtx.stroke();
    }

    drawPrice(closePrice, priceY, color) {
        priceY = Math.ceil(priceY);

        this.priceBarCtx.clearRect(0, 0, this.priceBarCanvEl.width, this.priceBarCanvEl.height);

        this.priceBarCtx.fillStyle = color;
        this.priceBarCtx.fillRect(0, priceY - 10, this.priceBarCanvEl.width, 20);

        this.priceBarCtx.fillStyle = '#ffffff';
        this.priceBarCtx.font = '12px sans-serif';
        this.priceBarCtx.textAlign = 'center';
        this.priceBarCtx.fillText(closePrice, this.priceBarCanvEl.width / 2, priceY + 4);
    }

    drawCandle(i: number, cdl: Candle): void {

        // const pix = this.canvEl.height / (this.maxPrice - this.minPrice);

        // const bodyX = (this.isShadow)
        //     ? (i * this.candleWidth + this.candleWidth * i) - this.candleWidth
        //     : i * this.candleWidth + this.candleWidth * i;

        // const bodyY = this.canvEl.height - ((obj.open - this.minPrice) * pix);

        // const closeY = this.canvEl.height - ((obj.close - this.minPrice) * pix);

        // const shadowX = bodyX + (Math.floor(this.candleWidth / 2));

        // const shadowY = this.canvEl.height - ((obj.high - this.minPrice) * pix);

        // const shadowH = (this.canvEl.height - ((obj.low - this.minPrice) * pix)) - shadowY;

        // let bodyH = closeY - bodyY;

        let color = '#555555';

        if (cdl.open > cdl.close) {
            color = '#ff0000';
        } else {
            color = '#008000';
        }

        // if (!i) {
        //     this.ctx.clearRect(0, 0, this.canvEl.width, this.canvEl.height);
        // } else if (i === this.candlesCount - 1) {
        //     this.drawPriceLine(closeY, color);
        //     this.drawPrice(obj.close, closeY, color);
        // }

        // bodyH = Math.ceil(bodyH);

        // if (!bodyH) {
        //     bodyH = 1;
        // }

        const open = this.coordsInstance.getCoordinates(cdl.open, cdl.openTime);
        const close = this.coordsInstance.getCoordinates(cdl.close, cdl.openTime);
        const high = this.coordsInstance.getCoordinates(cdl.high, cdl.openTime);
        const low = this.coordsInstance.getCoordinates(cdl.low, cdl.openTime);

        // this.ctx.fillStyle = color;
        // this.ctx.fillRect(bodyX, Math.round(bodyY), this.candleWidth, Math.ceil(bodyH));
        // this.ctx.fillRect(shadowX, Math.round(shadowY), 1, Math.round(shadowH));

        this.ctx.fillStyle = color;
        this.ctx.fillRect(open.x, open.y, this.candleWidth, close.y - open.y);
        this.ctx.fillRect(Math.floor(high.x + this.candleWidth / 2), high.y, 1, low.y - high.y);

        // this.ctx.fillRect(shadowX, Math.round(shadowY), 1, Math.round(shadowH));
    }

    draw(candles: Candle[], setPriceRange, reset) {
        if (reset) {
            this.candlesCount = 0;
            this.minPrice = 0;
            this.maxPrice = 0;
        }

        this.candlesCount = candles.length;

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

        candles.forEach((obj, i) => {
            this.drawCandle(i, obj);
        });
    }
}