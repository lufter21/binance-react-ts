import { Coordinates } from './Coordinates';
import { DrawChart } from './DrawChart';

export class Painting {
    canvasWrapEl: HTMLDivElement;
    canvEl: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    coordsInstance: Coordinates;
    type: 'trendline' | 'level';
    maxPointsCount: number;
    points: {
        pointId: number;
        coords: {
            x: number;
            y: number;
        },
        highlight?: boolean
    }[] = [];

    constructor({ canvasWrapEl, coordsInstance, canvasWidth, canvasHeight, type }: {
        canvasWrapEl: HTMLDivElement;
        coordsInstance: Coordinates;
        canvasWidth: number;
        canvasHeight: number;
        type: 'trendline' | 'level';
    }) {
        this.type = type;

        if (this.type == 'trendline') {
            this.maxPointsCount = 4;
        } else if (this.type == 'level') {
            this.maxPointsCount = 2;
        }

        this.coordsInstance = coordsInstance;

        this.canvasWrapEl = canvasWrapEl;

        this.canvEl = document.createElement('canvas');
        this.canvasWrapEl.appendChild(this.canvEl);

        this.canvasWrapEl.style.width = canvasWidth + 'px';
        this.canvasWrapEl.style.height = canvasHeight + 'px';

        this.canvEl.width = canvasWidth;
        this.canvEl.height = canvasHeight;

        this.ctx = this.canvEl.getContext('2d');

        this.mouseEvents();
    }

    mouseEvents() {
        const mouseCoords = (e: MouseEvent): { x: number; y: number; } => {
            const rect = this.canvasWrapEl.getBoundingClientRect();

            return {
                x: e.pageX - rect.left,
                y: e.pageY - rect.top
            };
        }

        this.canvasWrapEl.addEventListener('click', (e) => {
            const { x, y } = mouseCoords(e);

            if (this.type == 'trendline') {
                if (this.points.length < this.maxPointsCount) {
                    this.setPoint({ pointId: this.points.length, x, y });

                    if (this.points.length == 2) {
                        for (const point of this.points) {
                            this.setPoint({
                                pointId: this.points.length,
                                x: point.coords.x + 10,
                                y: point.coords.y
                            });
                        }
                    }

                } else {
                    for (const point of this.points) {
                        const { x: pX, y: pY } = point.coords;

                        if (pX - 7 < x && x < pX + 7 && pY - 7 < y && y < pY + 7) {
                            this.setPoint({ pointId: point.pointId, highlight: !point.highlight });
                        }
                    }
                }

            } else if (this.type == 'level') {
                if (this.points.length < this.maxPointsCount) {
                    this.setPoint({ pointId: this.points.length, x, y });
                    this.setPoint({ pointId: this.points.length, x, y: y + 20 });

                } else {
                    for (const point of this.points) {
                        const { x: pX, y: pY } = point.coords;

                        if (pY - 7 < y && y < pY + 7) {
                            this.setPoint({ pointId: point.pointId, highlight: !point.highlight });
                        }
                    }
                }
            }

        });

        this.canvasWrapEl.addEventListener('mousemove', (e) => {
            const { x, y } = mouseCoords(e);

            if (this.type == 'trendline') {
                for (const point of this.points) {
                    if (point.highlight) {

                        if (point.pointId < 2) {
                            this.setPoint({
                                pointId: point.pointId + 2,
                                x: this.points[point.pointId + 2].coords.x + (x - point.coords.x),
                                y: this.points[point.pointId + 2].coords.y + (y - point.coords.y)
                            });
                        } else {
                            if (point.pointId == 2) {
                                this.setPoint({
                                    pointId: 3,
                                    x: this.points[3].coords.x + (x - point.coords.x),
                                    y: this.points[3].coords.y + (y - point.coords.y)
                                });
                            } else {
                                this.setPoint({
                                    pointId: 2,
                                    x: this.points[2].coords.x + (x - point.coords.x),
                                    y: this.points[2].coords.y + (y - point.coords.y)
                                });
                            }
                        }

                        this.setPoint({ pointId: point.pointId, highlight: true, x, y });

                    }
                }

            } else if (this.type == 'level') {
                for (const point of this.points) {
                    if (point.highlight) {
                        if (point.pointId == 0) {
                            this.setPoint({
                                pointId: 1,
                                x,
                                y: this.points[1].coords.y + (y - point.coords.y)
                            });
                        }

                        this.setPoint({ pointId: point.pointId, highlight: true, x, y });
                    }
                }
            }

        });
    }

    setPoint(opt: { pointId: number; x?: number; y?: number; highlight?: boolean; }) {
        if (this.points.length < this.maxPointsCount) {
            this.points.push({
                pointId: opt.pointId,
                coords: {
                    x: opt.x,
                    y: opt.y
                }
            });

            if (this.points.length == this.maxPointsCount) {
                this.sendPointsData();
            }

        } else {
            for (const point of this.points) {
                if (point.pointId == opt.pointId) {
                    point.highlight = opt.highlight !== undefined ? opt.highlight : point.highlight;
                    point.coords.x = opt.x !== undefined ? opt.x : point.coords.x;
                    point.coords.y = opt.y !== undefined ? opt.y : point.coords.y;
                }
            }

            if (!opt.highlight) {
                this.sendPointsData();
            }
        }

        this.drawScene();
    }

    drawScene() {
        this.ctx.clearRect(0, 0, this.canvEl.width, this.canvEl.height);

        if (this.points.length == this.maxPointsCount) {
            if (this.type == 'trendline') {
                this.ctx.fillStyle = 'rgba(255,180,242,.35)';
                this.ctx.beginPath();
                this.ctx.moveTo(this.points[0].coords.x, this.points[0].coords.y);
                this.ctx.lineTo(this.points[1].coords.x, this.points[1].coords.y);
                this.ctx.lineTo(this.points[3].coords.x, this.points[3].coords.y);
                this.ctx.lineTo(this.points[2].coords.x, this.points[2].coords.y);
                this.ctx.closePath();
                this.ctx.fill();


                this.ctx.strokeStyle = "#ff6800";

                this.ctx.beginPath();
                this.ctx.moveTo(this.points[0].coords.x, this.points[0].coords.y);
                this.ctx.lineTo(this.points[1].coords.x, this.points[1].coords.y);
                this.ctx.stroke();

                this.ctx.strokeStyle = "#c3a0bd";

                this.ctx.beginPath();
                this.ctx.moveTo(this.points[2].coords.x, this.points[2].coords.y);
                this.ctx.lineTo(this.points[3].coords.x, this.points[3].coords.y);
                this.ctx.stroke();

            } else if (this.type == 'level') {
                this.ctx.fillStyle = 'rgba(255,180,242,.35)';
                this.ctx.beginPath();
                this.ctx.moveTo(0, this.points[0].coords.y);
                this.ctx.lineTo(this.canvEl.width, this.points[0].coords.y);
                this.ctx.lineTo(this.canvEl.width, this.points[1].coords.y);
                this.ctx.lineTo(0, this.points[1].coords.y);
                this.ctx.closePath();
                this.ctx.fill();

                for (const point of this.points) {
                    this.ctx.strokeStyle = point.highlight ? '#35ff00' : (point.pointId == 1 ? '#c3a0bd' : '#ff6800');
                    this.ctx.beginPath();
                    this.ctx.moveTo(0, point.coords.y);
                    this.ctx.lineTo(this.canvEl.width, point.coords.y);
                    this.ctx.stroke();
                }

            }
        }

        if (this.type == 'trendline') {
            for (const point of this.points) {
                this.ctx.fillStyle = point.highlight ? '#35ff00' : (point.pointId > 1 ? '#c3a0bd' : '#ff6800');
                this.ctx.beginPath();
                this.ctx.arc(point.coords.x, point.coords.y, 3, 0, 2 * Math.PI);
                this.ctx.fill();
            }

        } else if (this.type == 'level') {
            for (const point of this.points) {
                this.ctx.fillStyle = point.highlight ? '#35ff00' : '#ff6800';
                this.ctx.beginPath();
                this.ctx.arc(point.coords.x, point.coords.y, 3, 0, 2 * Math.PI);
                this.ctx.fill();
            }
        }

    }

    sendPointsData() {
        const data: {
            price: number;
            time: number;
        }[] = [];

        for (const point of this.points) {
            const props = this.coordsInstance.getProps(point.coords.x, point.coords.y);
            data.push(props);
        }

        console.log('send point data', data);
    }
}