import React, { useEffect, useRef } from 'react';
import css from './ChartField.module.css';

function Chart(canvInEl, linesCanvEl, priceScaleBarCanvEl, priceBarCanvEl, isShadow) {
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

	this.canvEl.height = this.canvEl.offsetHeight;

	this.linesCanvEl.width = linesCanvEl.offsetWidth;
	this.linesCanvEl.height = linesCanvEl.offsetHeight;

	this.priceBarCanvEl.width = priceBarCanvEl.offsetWidth;
	this.priceBarCanvEl.height = priceBarCanvEl.offsetHeight;

	this.priceScaleBarCanvEl.width = priceScaleBarCanvEl.offsetWidth;
	this.priceScaleBarCanvEl.height = priceScaleBarCanvEl.offsetHeight;

	this.ctx = this.canvEl.getContext('2d');
	this.linesCtx = linesCanvEl.getContext('2d');
	this.priceBarCtx = priceBarCanvEl.getContext('2d');
	this.priceScaleBarCtx = priceScaleBarCanvEl.getContext('2d');
}

Chart.prototype.drawPriceScale = function () {
	if (this.isShadow) return;

	const pix = this.priceScaleBarCanvEl.height / (this.maxPrice - this.minPrice),
		step = (this.maxPrice - this.minPrice) / 50;

	this.priceScaleBarCtx.clearRect(0, 0, this.priceScaleBarCanvEl.width, this.priceScaleBarCanvEl.height);

	this.priceScaleBarCtx.beginPath();
	this.linesCtx.strokeStyle = '#888888';

	this.priceScaleBarCtx.fillStyle = '#888888';
	this.priceScaleBarCtx.font = '10px sans-serif';

	for (let i = 0; i < 50; i++) {
		const price = this.minPrice + (step * i),
			priceY = Math.ceil(this.priceScaleBarCanvEl.height - ((price - this.minPrice) * pix));


		this.priceScaleBarCtx.moveTo(0, priceY + .5);
		this.priceScaleBarCtx.lineTo(3, priceY + .5);

		this.priceScaleBarCtx.fillText(price.toFixed(2), 5, priceY + 4);
	}

	this.priceScaleBarCtx.stroke();
}

Chart.prototype.drawPriceLine = function (priceY, color) {
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

Chart.prototype.drawPrice = function (closePrice, priceY, color) {
	priceY = Math.ceil(priceY);

	this.priceBarCtx.clearRect(0, 0, this.priceBarCanvEl.width, this.priceBarCanvEl.height);

	this.priceBarCtx.fillStyle = color;
	this.priceBarCtx.fillRect(0, priceY - 10, this.priceBarCanvEl.width, 20);

	this.priceBarCtx.fillStyle = '#ffffff';
	this.priceBarCtx.font = '12px sans-serif';
	this.priceBarCtx.textAlign = 'center';
	this.priceBarCtx.fillText(closePrice, this.priceBarCanvEl.width / 2, priceY + 4);
}

Chart.prototype.drawCandle = function (i, obj) {
	const pix = this.canvEl.height / (this.maxPrice - this.minPrice),
		bodyX = (this.isShadow) ? (i * this.candleWidth + this.candleWidth * i) - this.candleWidth : i * this.candleWidth + this.candleWidth * i,
		bodyY = this.canvEl.height - ((obj.open - this.minPrice) * pix),
		closeY = this.canvEl.height - ((obj.close - this.minPrice) * pix),
		shadowX = bodyX + (Math.floor(this.candleWidth / 2)),
		shadowY = this.canvEl.height - ((obj.high - this.minPrice) * pix),
		shadowH = (this.canvEl.height - ((obj.low - this.minPrice) * pix)) - shadowY;

	let bodyH = closeY - bodyY;

	let color = '#555555';

	if (obj.open > obj.close) {
		color = '#ff0000';
	} else {
		color = '#008000';
	}

	if (!i) {
		this.ctx.clearRect(0, 0, this.canvEl.width, this.canvEl.height);
	} else if (i === this.candlesCount - 1) {
		this.drawPriceLine(closeY, color);
		this.drawPrice(obj.close, closeY, color);
	}

	bodyH = Math.ceil(bodyH);

	if (!bodyH) {
		bodyH = 1;
	}

	this.ctx.fillStyle = color;
	this.ctx.fillRect(bodyX, Math.round(bodyY), this.candleWidth, Math.ceil(bodyH));
	this.ctx.fillRect(shadowX, Math.round(shadowY), 1, Math.round(shadowH));
}

Chart.prototype.draw = function (candles, setPriceRange, reset) {
	if (reset) {
		this.candlesCount = 0;
		this.minPrice = 0;
		this.maxPrice = 0;
	}

	this.candlesCount = candles.length;

	candles.forEach(obj => {
		if (obj.low < this.minPrice || !this.minPrice) {
			this.minPrice = obj.low;

			this.drawPriceScale();
		}

		if (obj.high > this.maxPrice || !this.maxPrice) {
			this.maxPrice = obj.high;

			this.drawPriceScale();
		}
	});

	if (setPriceRange) {
		setPriceRange({
			min: this.minPrice,
			max: this.maxPrice
		});
	}

	const canvElW = candles.length * this.candleWidth + this.candleWidth * candles.length;

	this.canvEl.width = canvElW;
	this.canvEl.style.width = canvElW + 'px';

	candles.forEach((obj, i) => {
		this.drawCandle(i, obj);
	});
}

let chart = null,
	chartShadow = null,
	canvInnerRef,
	linesCanvasRef,
	priceScaleBarCanvasRef,
	priceBarCanvasRef,
	isInitialMount;

// exported component
function ChartField(props) {
	isInitialMount = useRef(true);
	canvInnerRef = React.createRef();
	linesCanvasRef = React.createRef();
	priceScaleBarCanvasRef = React.createRef();
	priceBarCanvasRef = React.createRef();

	useEffect(function () {
		if (isInitialMount.current) {
			isInitialMount.current = false;

			chartShadow = new Chart(canvInnerRef.current, linesCanvasRef.current, priceScaleBarCanvasRef.current, priceBarCanvasRef.current, true);

			chart = new Chart(canvInnerRef.current, linesCanvasRef.current, priceScaleBarCanvasRef.current, priceBarCanvasRef.current);
		}

		chartShadow.draw(props.shadowCandles);

		chart.draw(props.candles, props.setPriceRange, props.reset);
	});

	return (
		<div className={css.canvasContainer}>
			<div className={css.canvasWrap}>
				<div className={css.canvasWrap__inner + ' move-axis-y'}>
					<div ref={canvInnerRef} className={css.canvasWrap__inner + ' move-axis-x'}></div>
					<canvas ref={linesCanvasRef} className={css.linesCanvas}></canvas>
				</div>
			</div>
			<div className={css.rightBar}>
				<div className={css.rightBar__inner + ' move-axis-y'}>
					<canvas ref={priceScaleBarCanvasRef} className={css.priceScaleBar}></canvas>
					<canvas ref={priceBarCanvasRef} className={css.priceBar}></canvas>
				</div>
			</div>
		</div>
	);
}

export default ChartField;