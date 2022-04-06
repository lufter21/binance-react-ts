import React, { useEffect, useRef } from 'react';
import css from './Order.module.css';

const Canvas = {
	linesCanvEl: null,
	linesCtx: null,
	priceRange: {},

	drawLines: function (i, obj) {
		const pix = this.linesCanvEl.height / (this.priceRange.max - this.priceRange.min),
			stopY = Math.ceil(this.linesCanvEl.height - ((+obj.stopPrice - this.priceRange.min) * pix)) + .5,
			limitY = Math.ceil(this.linesCanvEl.height - ((+obj.price - this.priceRange.min) * pix)) + .5;

		if (!i) {
			this.linesCtx.clearRect(0, 0, this.linesCanvEl.width, this.linesCanvEl.height);
		}

		this.linesCtx.strokeStyle = '#0000ff';
		this.linesCtx.lineWidth = 1;

		this.linesCtx.beginPath();
		this.linesCtx.moveTo(0, stopY);
		this.linesCtx.lineTo(this.linesCanvEl.width, stopY);
		this.linesCtx.moveTo(0, limitY);
		this.linesCtx.lineTo(this.linesCanvEl.width, limitY);
		this.linesCtx.stroke();
	},

	draw: function (orders, priceRange) {
		if (!orders.length) return;

		this.priceRange = priceRange;

		orders.forEach((obj, i) => {
			this.drawLines(i, obj);
		});
	},

	init: function (linesCanvEl) {
		this.linesCanvEl = linesCanvEl;

		this.linesCanvEl.width = this.linesCanvEl.offsetWidth;
		this.linesCanvEl.height = this.linesCanvEl.offsetHeight;

		this.linesCtx = this.linesCanvEl.getContext('2d');
	}
};

let isInitialMount,
	linesCanvasRef;

// exported component
function Order(props) {
	isInitialMount = useRef(true);
	linesCanvasRef = React.createRef();

	useEffect(function () {
		if (isInitialMount.current) {
			isInitialMount.current = false;

			Canvas.init(linesCanvasRef.current);
		}

		Canvas.draw(props.orders, props.priceRange);
	});

	return (
		<div className={css.canvasContainer}>
			<div className={css.canvasWrap}>
				<div className={css.canvasWrap__inner + ' move-axis-y'}>
					<canvas ref={linesCanvasRef} className={css.linesCanvas}></canvas>
				</div>
			</div>
			<div className={css.rightBar}>
				<div className={css.rightBar__inner + ' move-axis-y'}>

				</div>
			</div>
		</div>
	);
}

export default Order;