import React from 'react';
import Atr from './Atr';

const symbols = ['BTCUSDT' , 'BCHUSDT', 'ETHUSDT', 'LTCUSDT', 'ETCUSDT', 'BNBUSDT', 'EOSUSDT', 'XRPUSDT', 'TRXUSDT', 'LINKUSDT', 'DASHUSDT', 'XMRUSDT', 'ZECUSDT', 'ATOMUSDT', 'VETUSDT', 'ADAUSDT', 'ONTUSDT', 'MATICUSDT', 'XLMUSDT', 'XTZUSDT', 'NEOUSDT', 'QTUMUSDT', 'IOSTUSDT', 'IOTAUSDT', 'BATUSDT', 'RVNUSDT'],
	interval = '1d',
	intervalCount = 14,
	symbObj = {},
	streams = symbols.map(s => s.toLowerCase() + '@kline_' + interval),
	info = intervalCount + '/' + interval;

class AtrContainer extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			data: {}
		}
	}

	componentDidMount() {
		const ws = () => {
			const ws = new WebSocket('wss://stream.binance.com:9443/stream?streams=' + streams.join('/'));

			const wasFinal = {};

			ws.onmessage = (res) => {
				let { e: eventType, E: eventTime, s: symbol, k: ticks } = JSON.parse(res.data).data;
				let { o: open, h: high, l: low, c: close, v: volume, n: trades, i: interval, x: isFinal, q: quoteVolume, V: buyVolume, Q: quoteBuyVolume, t: startTime, T: endTime } = ticks;

				symbObj[symbol].change = (+high - +low) / (+low / 100);

				this.setState({ data: symbObj });
			}
		}

		let fetchCount = 0;

		symbols.forEach(s => {
			fetch('http://127.0.0.1:8080/candlesticks?symbol=' + s + '&interval=' + interval  + '&limit=' + (intervalCount + 1), {
				method: 'GET'
			}).then((res) => {
				return res.json();
			}).then((candles) => {
				fetchCount++;

				const lastCandle = candles[candles.length - 1],
				change = (lastCandle.high - lastCandle.low) / (lastCandle.low / 100);

				symbObj[s] = {
					symbol: s,
					atr: 0,
					change
				};

				candles.pop();

				const atrArr = candles.map((c, i) => (candles[i].high - c.low) / (c.low / 100)),
				atrSum = atrArr.reduce((sum, cur) => sum + cur);

				symbObj[s].atr = atrSum / candles.length;

				if (symbols.length === fetchCount) {
					this.setState({ data: symbObj });
					ws();
				}
			});
		});

	}

	render() {
		return (
			<Atr data={this.state.data} info={info} />
		);
	}
}

export default AtrContainer;