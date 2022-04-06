import React from 'react';
import PriceChange from './PriceChange';
import TrendPriceChange from './TrendPriceChange';
import Volatility from './Volatility';

const interval = '15m',
	intervalCount = 4,
	symbObj = {},
	info = intervalCount + '/' + interval;

class ScreenerContainer extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			data: []
		}

		this.streams = props.symbols.map(s => s.toLowerCase() + '@kline_' + interval);
	}

	componentDidMount() {
		const ws = () => {
			const ws = new WebSocket('wss://stream.binance.com:9443/stream?streams=' + this.streams.join('/'));

			const wasFinal = {};

			ws.onmessage = (res) => {
				let { e: eventType, E: eventTime, s: symbol, k: ticks } = JSON.parse(res.data).data;
				let { o: open, h: high, l: low, c: close, v: volume, n: trades, i: interval, x: isFinal, q: quoteVolume, V: buyVolume, Q: quoteBuyVolume, t: startTime, T: endTime } = ticks;

				const symbArr = [];

				if (isFinal) {
					wasFinal[symbol] = true;
				}

				if (wasFinal[symbol]) {
					wasFinal[symbol] = false;

					symbObj[symbol].openArr.push(+open);
					symbObj[symbol].closeArr.push(+close);
					symbObj[symbol].highArr.push(+high);
					symbObj[symbol].lowArr.push(+low);

					if (symbObj[symbol].openArr.length > intervalCount) {
						symbObj[symbol].openArr.shift();
						symbObj[symbol].closeArr.shift();
						symbObj[symbol].highArr.shift();
						symbObj[symbol].lowArr.shift();
					}
				}

				symbObj[symbol].openArr[symbObj[symbol].openArr.length - 1] = +open;
				symbObj[symbol].closeArr[symbObj[symbol].closeArr.length - 1] = +close;

				symbObj[symbol].highArr[symbObj[symbol].highArr.length - 1] = +high;
				symbObj[symbol].lowArr[symbObj[symbol].lowArr.length - 1] = +low;

				for (const key in symbObj) {
					if (symbObj.hasOwnProperty(key)) {
						const el = symbObj[key];

						// price change
						const open = el.openArr[0],
							close = el.closeArr[el.closeArr.length - 1];

						let changePerc = 0;

						if (close > open) {
							changePerc = (close - open) / (close / 100);
						} else {
							changePerc = (close - open) / (open / 100);
						}

						// trend price change
						let trend,
							fstOpen;

						el.openArr.forEach((open, i) => {
							if (el.closeArr[i] >= open) {
								if (trend !== 'up') {
									fstOpen = open;
								}

								trend = 'up';
							} else {
								if (trend !== 'down') {
									fstOpen = open;
								}

								trend = 'down';
							}
						});

						const trendChangePerc = (el.closeArr[el.closeArr.length - 1] - fstOpen) / (fstOpen / 100);

						// volatility
						const vPArr = el.lowArr.map((low, i) => (el.highArr[i] - low) / (low / 100));

						let volatilityPerc = vPArr.reduce((sum, cur) => sum + cur);

						volatilityPerc = volatilityPerc / el.lowArr.length;

						// result array
						symbArr.push({ symbol: el.symbol, changePerc, trendChangePerc, volatilityPerc });
					}
				}

				// symbArr.sort((a, b) => Math.abs(b.changePerc) - Math.abs(a.changePerc));

				this.setState({ data: symbArr });
			}
		}

		let fetchCount = 0;

		this.props.symbols.forEach(s => {
			fetch('http://127.0.0.1:8080/candlesticks?symbol=' + s + '&interval=' + interval + '&limit=' + intervalCount, {
				method: 'GET'
			}).then((res) => {
				return res.json();
			}).then((candles) => {
				fetchCount++;

				symbObj[s] = {
					symbol: s,
					openArr: [],
					closeArr: [],
					highArr: [],
					lowArr: []
				};

				candles.forEach(c => {
					symbObj[s].openArr.push(c.open);
					symbObj[s].closeArr.push(c.close);
					symbObj[s].highArr.push(c.high);
					symbObj[s].lowArr.push(c.low);
				});

				if (this.props.symbols.length === fetchCount) {
					ws();
				}
			});
		});

	}

	render() {
		return (
			<React.Fragment>
				<PriceChange data={this.state.data} info={info} />
				<TrendPriceChange data={this.state.data} info={info} />
				{/* <Volatility data={this.state.data} info={info} /> */}
			</React.Fragment>
		);
	}
}

export default ScreenerContainer;