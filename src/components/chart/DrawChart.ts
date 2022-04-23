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
    depthCanvEl: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    linesCtx: CanvasRenderingContext2D;
    priceBarCtx: CanvasRenderingContext2D;
    priceScaleBarCtx: CanvasRenderingContext2D;
    coordsInstance: Coordinates;
    horVolumeCtx: CanvasRenderingContext2D;
    depthCtx: CanvasRenderingContext2D;
    canvasWidth: number;
    canvasHeight: number;

    constructor({ canvInEl, linesCanvEl, horVolumeCanvEl, depthCanvEl, priceScaleBarCanvEl, priceBarCanvEl, isShadow, canvasWidth, canvasHeight, coordsInstance }: {
        canvInEl: HTMLDivElement;
        linesCanvEl: HTMLCanvasElement;
        horVolumeCanvEl: HTMLCanvasElement;
        depthCanvEl: HTMLCanvasElement;
        priceScaleBarCanvEl: HTMLCanvasElement;
        priceBarCanvEl: HTMLCanvasElement;
        isShadow: boolean;
        canvasWidth: number;
        canvasHeight: number;
        coordsInstance: Coordinates;
    }) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
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
        this.depthCanvEl = depthCanvEl;

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

        this.depthCanvEl.width = this.depthCanvEl.offsetWidth;
        this.depthCanvEl.height = canvasHeight;
        this.depthCanvEl.style.height = canvasHeight + 'px';

        this.priceBarCanvEl.width = priceBarCanvEl.offsetWidth;
        this.priceBarCanvEl.height = canvasHeight;
        this.priceBarCanvEl.style.height = canvasHeight + 'px';

        this.priceScaleBarCanvEl.width = priceScaleBarCanvEl.offsetWidth;
        this.priceScaleBarCanvEl.height = priceScaleBarCanvEl.offsetHeight;

        this.ctx = this.canvEl.getContext('2d');
        this.linesCtx = linesCanvEl.getContext('2d');
        this.horVolumeCtx = this.horVolumeCanvEl.getContext('2d');
        this.depthCtx = this.depthCanvEl.getContext('2d');
        this.priceBarCtx = priceBarCanvEl.getContext('2d');
        this.priceScaleBarCtx = priceScaleBarCanvEl.getContext('2d');

        this.coordsInstance = coordsInstance;
    }

    reInit() {
        this.canvEl.width = this.canvasWidth;
        this.canvEl.height = this.canvasHeight;
        this.canvEl.style.width = this.canvasWidth + 'px';
        this.canvEl.style.height = this.canvasHeight + 'px';

        this.linesCanvEl.width = this.linesCanvEl.offsetWidth;
        this.linesCanvEl.height = this.canvasHeight;
        this.linesCanvEl.style.height = this.canvasHeight + 'px';

        this.horVolumeCanvEl.width = this.horVolumeCanvEl.offsetWidth;
        this.horVolumeCanvEl.height = this.canvasHeight;
        this.horVolumeCanvEl.style.height = this.canvasHeight + 'px';

        this.priceBarCanvEl.width = this.priceBarCanvEl.offsetWidth;
        this.priceBarCanvEl.height = this.canvasHeight;
        this.priceBarCanvEl.style.height = this.canvasHeight + 'px';
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

        const resolution = 200 / maxVol;

        this.horVolumeCtx.clearRect(0, 0, this.horVolumeCanvEl.width, this.horVolumeCanvEl.height);

        for (const item of data) {
            const pY = this.coordsInstance.getCoordinates(item.price).y;

            this.horVolumeCtx.fillStyle = 'red';
            this.horVolumeCtx.fillRect(this.horVolumeCanvEl.width, pY, item.sell * resolution * -1, 1);
            
            this.horVolumeCtx.fillStyle = 'green';
            this.horVolumeCtx.fillRect(this.horVolumeCanvEl.width - item.sell * resolution, pY, item.buy * resolution * -1, 1);
        }
    }

    drawDepth(data: { bids: string[][]; asks: string[][]; lastUpdateId?: number; }) {
        const asksEstimatePrice = +data.asks[0][0] + (2 * (+data.asks[0][0] / 100));
        const bidsEstimatePrice = +data.bids[0][0] - (2 * (+data.bids[0][0] / 100));

        let asksSum = 0,
            bidsSum = 0;

        const asksArr: string[][] = [],
            bidsArr: string[][] = [];

        for (const ask of data.asks) {
            asksSum += +ask[1];

            asksArr.push(ask);

            if (+ask[0] >= asksEstimatePrice) {
                break;
            }
        }

        for (const bid of data.bids) {
            bidsSum += +bid[1];

            bidsArr.push(bid);

            if (+bid[0] <= bidsEstimatePrice) {
                break;
            }
        }

        asksArr.sort((a, b) => +b[1] - +a[1]);
        bidsArr.sort((a, b) => +b[1] - +a[1]);

        const maxAsk = asksArr[0];
        const lastMaxAsks = asksArr.slice(1, 2);

        const maxBid = bidsArr[0];
        const lastMaxBids = bidsArr.slice(1, 2);

        const maxAskY = this.coordsInstance.getCoordinates(+maxAsk[0]).y;
        const maxBidY = this.coordsInstance.getCoordinates(+maxBid[0]).y;
        const estAskY = this.coordsInstance.getCoordinates(asksEstimatePrice).y;
        const estBidY = this.coordsInstance.getCoordinates(bidsEstimatePrice).y;

        this.depthCtx.clearRect(0, 0, this.depthCanvEl.width, this.depthCanvEl.height);

        this.depthCtx.lineWidth = 1;
        this.depthCtx.strokeStyle = 'blue';
        this.depthCtx.fillStyle = 'blue';

        for (const ask of lastMaxAsks) {
            const Y = this.coordsInstance.getCoordinates(+ask[0]).y;

            this.depthCtx.beginPath();
            this.depthCtx.moveTo(0, Math.ceil(Y) + .5);
            this.depthCtx.lineTo(this.depthCanvEl.width, Math.ceil(Y) + .5);
            this.depthCtx.stroke();

            this.depthCtx.fillText((+ask[1]).toFixed(5), this.depthCanvEl.width - 10, Y - 7);
        }

        for (const bid of lastMaxBids) {
            const Y = this.coordsInstance.getCoordinates(+bid[0]).y;

            this.depthCtx.beginPath();
            this.depthCtx.moveTo(0, Math.ceil(Y) + .5);
            this.depthCtx.lineTo(this.depthCanvEl.width, Math.ceil(Y) + .5);
            this.depthCtx.stroke();

            this.depthCtx.fillText((+bid[1]).toFixed(5), this.depthCanvEl.width - 10, Y + 18);
        }

        this.depthCtx.strokeStyle = 'black';

        this.depthCtx.beginPath();
        this.depthCtx.moveTo(0, Math.ceil(maxAskY) + .5);
        this.depthCtx.lineTo(this.depthCanvEl.width, Math.ceil(maxAskY) + .5);
        this.depthCtx.stroke();

        this.depthCtx.beginPath();
        this.depthCtx.moveTo(0, Math.ceil(maxBidY) + .5);
        this.depthCtx.lineTo(this.depthCanvEl.width, Math.ceil(maxBidY) + .5);
        this.depthCtx.stroke();

        this.depthCtx.strokeStyle = 'lightgray';

        this.depthCtx.beginPath();
        this.depthCtx.moveTo(0, Math.ceil(estAskY) + .5);
        this.depthCtx.lineTo(this.depthCanvEl.width, Math.ceil(estAskY) + .5);
        this.depthCtx.stroke();

        this.depthCtx.beginPath();
        this.depthCtx.moveTo(0, Math.ceil(estBidY) + .5);
        this.depthCtx.lineTo(this.depthCanvEl.width, Math.ceil(estBidY) + .5);
        this.depthCtx.stroke();


        this.depthCtx.font = '12px sans-serif';
        this.depthCtx.textAlign = 'right';

        this.depthCtx.fillStyle = +maxAsk[1] > +maxBid[1] ? 'black' : 'lightgray';
        this.depthCtx.fillText((+maxAsk[1]).toFixed(5), this.depthCanvEl.width - 10, maxAskY - 7);

        this.depthCtx.fillStyle = +maxAsk[1] < +maxBid[1] ? 'black' : 'lightgray';
        this.depthCtx.fillText((+maxBid[1]).toFixed(5), this.depthCanvEl.width - 10, maxBidY + 18);

        this.depthCtx.fillStyle = asksSum > bidsSum ? 'black' : 'lightgray';
        this.depthCtx.fillText('Asks Sum ' + asksSum.toFixed(5), this.depthCanvEl.width - 10, estAskY - 7);

        this.depthCtx.fillStyle = asksSum < bidsSum ? 'black' : 'lightgray';
        this.depthCtx.fillText('Bids Sum ' + bidsSum.toFixed(5), this.depthCanvEl.width - 10, estBidY + 18);
    }

}