import React, { useCallback } from 'react';
import ReactDOM from 'react-dom';
import ChartField from './ChartField';
import Volume from './Volume';
import css from './ChartContainer.module.css';
import Order from './Order';

// move
let startCursorPos = { X: 0, Y: 0 },
	pos = { X: 0, Y: 0 },
	newPos = { X: 0, Y: 0 };

function moveCanvas(contEl, moveXEls, moveYEls) {
	function move(e) {
		const dX = e.pageX - startCursorPos.X,
			posX = pos.X - dX,
			dY = e.pageY - startCursorPos.Y,
			posY = pos.Y + dY;

		for (let i = 0; i < moveXEls.length; i++) {
			moveXEls[i].style.right = posX + 'px';
		}

		for (let i = 0; i < moveYEls.length; i++) {
			moveYEls[i].style.top = posY + 'px';
		}

		newPos.X = posX;
		newPos.Y = posY;
	}

	function start(e) {
		contEl.classList.add(css.chartContainer_moving);

		startCursorPos.X = e.pageX;
		startCursorPos.Y = e.pageY;

		contEl.addEventListener('mousemove', move);
	}

	function stop() {
		contEl.classList.remove(css.chartContainer_moving);

		contEl.removeEventListener('mousemove', move);

		pos.X = newPos.X;
		pos.Y = newPos.Y;
	}

	contEl.addEventListener('mousedown', start);
	contEl.addEventListener('mouseup', stop);
}

// component
const interval = '1h';

class ChartContainer extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			candles: [],
			shadowCandles: [],
			priceVolume: [],
			openOrders: [],
		}

		this.containerRef = React.createRef();
		this.infoRef = React.createRef();
		this.selectRef = React.createRef();

		this.setPriceRange = this.setPriceRange.bind(this);
		this.priceRange = {};

		this.selectChart = this.selectChart.bind(this);
		this.resetChart = false;

		this.candlesWS = null;
	}

	componentDidMount() {
		let lastShadowCandleIsFinal = false;

		// shadow
		fetch('http://127.0.0.1:8080/candlesticks?symbol=BTCUSDT&interval=' + interval + '&limit=100', {
			method: 'GET'
		}).then((res) => {
			return res.json();
		}).then((lastCandles) => {
			this.setState({ shadowCandles: lastCandles });

			const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@kline_' + interval);

			ws.onmessage = (res) => {
				let { e: eventType, E: eventTime, s: symbol, k: ticks } = JSON.parse(res.data);
				let { o: open, h: high, l: low, c: close, v: volume, n: trades, i: interval, x: isFinal, q: quoteVolume, V: buyVolume, Q: quoteBuyVolume, t: startTime, T: endTime } = ticks;

				let candles = this.state.shadowCandles;

				if (!candles.length || lastShadowCandleIsFinal) {
					candles.push({ open: +open, high: +high, low: +low, close: +close, isFinal, volume: +volume });

					if (lastShadowCandleIsFinal) {
						lastShadowCandleIsFinal = false;
					}
				} else {
					candles[candles.length - 1] = { open: +open, high: +high, low: +low, close: +close, isFinal, volume: +volume };
				}

				if (isFinal) {
					lastShadowCandleIsFinal = true;
				}

				this.setState({ shadowCandles: candles });
			}
		});

		const node = ReactDOM.findDOMNode(this),
			moveXEls = node.querySelectorAll('.move-axis-x'),
			moveYEls = node.querySelectorAll('.move-axis-y');

		moveCanvas(this.containerRef.current, moveXEls, moveYEls);
	}

	selectChart() {
		let lastCandleIsFinal = false;
		const symbol = this.selectRef.current.value;

		this.infoRef.current.innerHTML = symbol + '/' + interval;

		this.resetChart = true;

		if (this.candlesWS) {
			this.candlesWS.close();
		}

		fetch('http://127.0.0.1:8080/candlesticks?symbol=' + symbol + '&interval=' + interval + '&limit=100', {
			method: 'GET'
		}).then((res) => {
			return res.json();
		}).then((lastCandles) => {
			this.setState({ candles: lastCandles });

			this.candlesWS = new WebSocket('wss://stream.binance.com:9443/ws/' + symbol.toLowerCase() + '@kline_' + interval);

			this.candlesWS.onmessage = (res) => {
				let { e: eventType, E: eventTime, s: symbol, k: ticks } = JSON.parse(res.data);
				let { o: open, h: high, l: low, c: close, v: volume, n: trades, i: interval, x: isFinal, q: quoteVolume, V: buyVolume, Q: quoteBuyVolume, t: startTime, T: endTime } = ticks;

				let candles = this.state.candles;

				if (!candles.length || lastCandleIsFinal) {
					candles.push({ open: +open, high: +high, low: +low, close: +close, isFinal, volume: +volume });

					if (lastCandleIsFinal) {
						lastCandleIsFinal = false;
					}
				} else {
					candles[candles.length - 1] = { open: +open, high: +high, low: +low, close: +close, isFinal, volume: +volume };
				}

				if (isFinal) {
					lastCandleIsFinal = true;
				}

				this.setState({ candles });

				this.resetChart = false;

				document.title = +close + ((+close > +open) ? ' \u21D1' : ' \u21D3');
			}
		});
	}

	setPriceRange(priceRange) {
		this.priceRange = priceRange;
	}

	render() {
		const selOpt = this.props.symbols.map(s => React.createElement('option', { key: s }, s));

		return (
			<div ref={this.containerRef} className={css.chartContainer}>
				<ChartField
					candles={this.state.candles}
					shadowCandles={this.state.shadowCandles}
					priceVolume={this.state.priceVolume}
					setPriceRange={this.setPriceRange}
					reset={this.resetChart}
				/>

				<Volume candles={this.state.candles} reset={this.resetChart} />

				{/* <Order orders={this.props.orders} priceRange={this.priceRange} /> */}

				<div ref={this.infoRef} className={css.info}></div>

				<select ref={this.selectRef} onChange={() => { this.selectChart() }} className={css.select}>
					{selOpt}
				</select>
			</div>
		);
	}
}

export default ChartContainer;