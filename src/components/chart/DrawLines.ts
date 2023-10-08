import { Coordinates } from './Coordinates';

type Props = {
    canvEl: HTMLCanvasElement;
    canvasWidth: number;
    canvasHeight: number;
    coordsInstance: Coordinates;
};

export type Data = {
    price: number;
    color: string;
}[];

export default class DrawLines {
    canvEl: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    coordsInstance: Coordinates;
    canvasWidth: number;
    canvasHeight: number;

    constructor({ canvEl, canvasWidth, canvasHeight, coordsInstance }: Props) {
        this.canvEl = canvEl;

        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        this.canvEl.width = canvasWidth;
        this.canvEl.height = canvasHeight;
        this.canvEl.style.width = canvasWidth + 'px';
        this.canvEl.style.height = canvasHeight + 'px';

        this.ctx = this.canvEl.getContext('2d');

        this.coordsInstance = coordsInstance;
    }

    reInit() {
        this.canvEl.width = this.canvasWidth;
        this.canvEl.height = this.canvasHeight;
        this.canvEl.style.width = this.canvasWidth + 'px';
        this.canvEl.style.height = this.canvasHeight + 'px';
    }

    draw(data: Data) {
        this.ctx.clearRect(0, 0, this.canvEl.width, this.canvEl.height);

        if (data && data.length) {
            data.forEach(({ price, color }) => {
                const { x, y } = this.coordsInstance.getCoordinates(price);

                this.ctx.strokeStyle = color;
                this.ctx.lineWidth = 1;

                this.ctx.beginPath();
                this.ctx.moveTo(x, Math.round(y) + .5);
                this.ctx.lineTo(this.canvEl.width, Math.round(y) + .5);
                this.ctx.stroke();
            });
        }
    }
}