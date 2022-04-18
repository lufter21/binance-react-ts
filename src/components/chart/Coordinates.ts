export class Coordinates {
    canvW: number;
    canvH: number;
    minPrice: number;
    maxPrice: number;
    minTime: number;
    maxTime: number;

    constructor(opt: {
        canvW: number;
        canvH: number;
        minPrice?: number;
        maxPrice?: number;
        minTime?: number;
        maxTime?: number;
    }) {
        this.canvW = opt.canvW;
        this.canvH = opt.canvH;
        this.minPrice = opt.minPrice;
        this.maxPrice = opt.maxPrice;
        this.minTime = opt.minTime;
        this.maxTime = opt.maxTime;
    }

    getCoordinates(price: number, time?: number): { x: number; y: number; } {
        const resX = this.canvW / (this.maxTime - this.minTime);
        const resY = this.canvH / (this.maxPrice - this.minPrice);

        const x = !time ? 0 : Math.round((time - this.minTime) * resX);
        const y = Math.round(this.canvH - (price - this.minPrice) * resY);

        return { x, y };
    }

    getProps(x: number, y: number): { price: number; time: number; } {
        const resX = this.canvW / (this.maxTime - this.minTime);
        const resY = this.canvH / (this.maxPrice - this.minPrice);

        const time = x / resX + this.minTime;
        const price = (this.canvH - y) / resY + this.minPrice;

        return { price, time: Math.round(time) };
    }
}