import { type } from 'os';
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

type Candle = {
	high: number;
	open: number;
	close: number;
	low: number;
}

enum CdlDir {
	up = 'up',
	down = 'down',
}

const fee: number = .1;

// exported component
function Volatility(props: any) {
	const { data, isSuccess } = useGetCandlesQuery();

	if (isSuccess) {
		console.log(data);

		for (const key in data) {
			if (Object.prototype.hasOwnProperty.call(data, key)) {
				const _item = data[key];

				let firstCdlDir: string,
					expectedLastCdlDir: string | undefined,
					falseAccum: number = 0;

				let item = [..._item];

				const lastCandle: Candle = item.pop();

				item.forEach((cdl: Candle, i: number): void => {
					if (!i) {
						if (cdl.close >= cdl.open) {
							firstCdlDir = CdlDir.up;
							expectedLastCdlDir = CdlDir.up;
						} else {
							firstCdlDir = CdlDir.down;
							expectedLastCdlDir = CdlDir.down;
						}

					} else {
						if (firstCdlDir === CdlDir.up) {
							if (
								(i % 2 === 0 && cdl.close < cdl.open) ||
								(i % 2 !== 0 && cdl.close >= cdl.open)
							) {
								falseAccum++;
							}
						}

						if (firstCdlDir === CdlDir.down) {
							if (
								(i % 2 !== 0 && cdl.close < cdl.open) ||
								(i % 2 === 0 && cdl.close >= cdl.open)
							) {
								falseAccum++;
							}
						}
					}
				});

				console.log(falseAccum);

				if (!falseAccum) {
					console.log(key + '- is volatile pair');

					const volatility = {
						minLong: 999,
						minShort: 999
					};

					item.forEach((cdl: Candle, i: number): void => {
						if (cdl.close >= cdl.open) {
							const changePerc = (cdl.high - cdl.low) / (cdl.low / 100);

							if (changePerc < volatility.minLong) {
								volatility.minLong = changePerc;
							}
						} else {
							const changePerc = (cdl.high - cdl.low) / (cdl.high / 100);

							if (changePerc < volatility.minShort) {
								volatility.minShort = changePerc;
							}
						}
					});

					console.log(volatility);

					console.log(expectedLastCdlDir);

					if (expectedLastCdlDir === CdlDir.up) {
						const changePerc = (lastCandle.high - lastCandle.low) / (lastCandle.high / 100);
						
						if (changePerc < volatility.minLong - fee && lastCandle.close >= lastCandle.open) {
							const expectedProfit = volatility.minLong - fee - changePerc;
							
							const possibleLoss = ((lastCandle.close - lastCandle.low) / (lastCandle.close / 100)) + fee;
							
							if (expectedProfit > possibleLoss) {
								console.log('Long. Expected profit - '+ expectedProfit);
								console.log('Possible loss - '+ possibleLoss);
							}
						}
					}

					if (expectedLastCdlDir === CdlDir.down) {
						const changePerc = (lastCandle.high - lastCandle.low) / (lastCandle.high / 100);
						
						if (changePerc < volatility.minShort - fee && lastCandle.close < lastCandle.open) {
							const expectedProfit = volatility.minShort - fee - changePerc;
							
							const possibleLoss = ((lastCandle.high - lastCandle.close) / (lastCandle.close / 100)) + fee;

							if (expectedProfit > possibleLoss) {
								console.log('Short. Expected profit - '+ expectedProfit);
								console.log('Possible loss - '+ possibleLoss);
							}
						}
					}
				}
			}
		}


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