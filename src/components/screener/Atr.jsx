import React, { useEffect, useRef } from 'react';
import css from './Atr.module.css';

const Canvas = {
	canvEl: null,
	ctx: null,
	centerY: 0,
	maxPerc: 0,
	canvWidthIsSet: false,

	draw: function (data) {
		if (!this.canvWidthIsSet) {
			this.setDims(data);
		}

		for (const key in data) {
			if (data.hasOwnProperty(key)) {
				const perc = Math.abs(data[key].atr);

				if (perc > this.maxPerc) {
					this.maxPerc = perc;
				}
			}
		}

		this.ctx.clearRect(0, 0, this.canvEl.width, this.canvEl.height);

		this.ctx.font = '10px sans-serif';
		this.ctx.textAlign = 'center';

		const pix = this.canvEl.height / this.maxPerc;

		let i = 0;

		for (const key in data) {
			if (data.hasOwnProperty(key)) {
				const symb = data[key],
					barX = i * 86 + 3 * i,
					barChX = barX + 56,
					barH = Math.ceil(symb.atr * pix * -1),
					barChH = Math.ceil(symb.change * pix * -1);

				this.ctx.fillStyle = '#aaaaaa';
				this.ctx.fillRect(barX, this.canvEl.height, 56, barH);

				this.ctx.fillStyle = '#cccccc';
				this.ctx.fillRect(barChX, this.canvEl.height, 30, barChH);

				this.ctx.fillStyle = '#000000';

				this.ctx.fillText(symb.symbol, barX + 28, this.canvEl.height - 25);
				this.ctx.fillText(symb.atr.toFixed(2), barX + 28, this.canvEl.height - 12);

				this.ctx.fillText(symb.change.toFixed(2), barChX + 15, this.canvEl.height - 12);

				i++;
			}
		}
	},

	setDims: function (data) {
		let c = 0;

		for (const key in data) {
			if (data.hasOwnProperty(key)) {
				c++;
			}
		}

		if (c) {
			this.canvWidthIsSet = true;
		}

		const canvW = 89 * c;

		this.canvEl.width = canvW;
		this.canvEl.style.width = canvW + 'px';

		this.canvEl.height = this.canvEl.offsetHeight;
	},

	init: function (canvEl) {
		this.canvEl = canvEl;

		this.ctx = canvEl.getContext('2d');
	}
}

let isInitialMount,
	canvasRef,
	infoRef;

// exported component
function Atr(props) {
	isInitialMount = useRef(true);
	canvasRef = React.createRef();
	infoRef = React.createRef();

	useEffect(function () {
		if (isInitialMount.current) {
			isInitialMount.current = false;

			Canvas.init(canvasRef.current);

			infoRef.current.innerHTML = 'ATR ' + props.info;
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

export default Atr;