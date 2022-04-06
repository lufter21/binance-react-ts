import React, { useEffect, useRef } from 'react';
import css from './PriceChange.module.css';

const Canvas = {
	canvEl: null,
	ctx: null,
	centerY: 0,
	maxPerc: 0,
	canvWidthIsSet: false,

	draw: function (dataArr) {
		if (!this.canvWidthIsSet) {
			this.setDims(dataArr);
		}

		this.ctx.clearRect(0, 0, this.canvEl.width, this.canvEl.height);

		this.ctx.font = '10px sans-serif';
		this.ctx.textAlign = 'center';

		dataArr.forEach(el => {
			const perc = Math.abs(el.changePerc);

			if (perc > this.maxPerc) {
				this.maxPerc = perc;
			}
		});

		const pix = (this.canvEl.height / this.maxPerc) / 2;

		dataArr.forEach((el, i) => {
			const barX = i * 56 + 3 * i,
				barH = Math.ceil(el.changePerc * pix * -1);

			if (el.changePerc > 0) {
				this.ctx.fillStyle = '#008000';
			} else {
				this.ctx.fillStyle = '#ff0000';
			}

			this.ctx.fillRect(barX, this.centerY, 56, barH);

			this.ctx.fillStyle = '#000000';

			this.ctx.fillText(el.symbol, barX + 28, this.centerY + 12);
			this.ctx.fillText(el.changePerc.toFixed(2), barX + 28, this.centerY + 25);
		});
	},

	setDims: function (data) {
		if (data.length) {
			this.canvWidthIsSet = true;
		}
		
		const canvW = 59 * data.length;

		this.canvEl.width = canvW;
		this.canvEl.style.width = canvW + 'px';

		this.canvEl.height = this.canvEl.offsetHeight;

		this.centerY = Math.round(this.canvEl.height / 2);
	},

	init: function (canvEl) {
		this.canvEl = canvEl;
		this.ctx = canvEl.getContext('2d');
	}
};

let isInitialMount,
	canvasRef,
	infoRef;

// exported component
function PriceChange(props) {
	isInitialMount = useRef(true);
	canvasRef = React.createRef();
	infoRef = React.createRef();

	useEffect(function () {
		if (isInitialMount.current) {
			isInitialMount.current = false;

			Canvas.init(canvasRef.current);

			infoRef.current.innerHTML = 'Price Change ' + props.info;
		}

		Canvas.draw(props.data);
	});

	return (
		<div className={css.canvasContainer}>
			<canvas ref={canvasRef} className={css.canvas}></canvas>
			<div ref={infoRef} className={css.info}></div>
		</div>
	);
}

export default PriceChange;