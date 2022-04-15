import React, { useEffect, useRef } from 'react';
import { useGetCandlesQuery } from '../../app/volatilityApi';
import css from './Volatility.module.scss';

const Canvas: any = {
	centerY: 0,
	maxPerc: 0,

    init: function (canvEl: any) {
		this.canvEl = canvEl;

		canvEl.width = canvEl.offsetWidth;
		canvEl.height = canvEl.offsetHeight;

		this.centerY = canvEl.height / 2;

		this.ctx = canvEl.getContext('2d');
	},

	draw: function (dataArr: any) {
		this.ctx.clearRect(0, 0, this.canvEl.width, this.canvEl.height);

		this.ctx.font = '10px sans-serif';
		this.ctx.textAlign = 'center';

		dataArr.forEach((el: any) => {
			const perc = Math.abs(el.trendChangePerc);

			if (perc > this.maxPerc) {
				this.maxPerc = perc;
			}
		});

		const pix = (this.canvEl.height / this.maxPerc) / 2;

		dataArr.forEach((el: any, i: number) => {
			const barX = i * 56 + 3 * i,
				barH = Math.ceil(el.trendChangePerc * pix * -1);

			if (el.trendChangePerc > 0) {
				this.ctx.fillStyle = '#008000';
			} else {
				this.ctx.fillStyle = '#ff0000';
			}

			this.ctx.fillRect(barX, this.centerY, 56, barH);

			this.ctx.fillStyle = '#000000';

			this.ctx.fillText(el.symbol, barX + 28, this.centerY + 12);
			this.ctx.fillText(el.trendChangePerc.toFixed(2), barX + 28, this.centerY + 25);
		});
	}
};

let isInitialMount: any,
	canvasRef: any,
	infoRef: any;

// exported component
function Volatility(props: any) {
	const {data, isSuccess} = useGetCandlesQuery();

	if (isSuccess && data && data.wsStream) {
		console.log(data);
		let { s: symbol, k: ticks } = data.wsStream;
		let {t: openTime, o: open, h: high, l: low, c: close, x: isFinal } = ticks;

		
	}

	// isInitialMount = useRef(true);
	// canvasRef = React.createRef();
	// infoRef = React.createRef();

	// useEffect(function () {
	// 	if (isInitialMount.current) {
	// 		isInitialMount.current = false;

	// 		Canvas.init(canvasRef.current);

	// 		infoRef.current.innerHTML = 'Trend ' + props.info;
	// 	}

	// 	Canvas.draw(props.data);
	// });

	return (
		<div className={css.canvasContainer}>
			<canvas ref={canvasRef} className={css.canvas}></canvas>
			<div ref={infoRef} className={css.info}></div>
		</div>
	);
}

export default Volatility;