import React from 'react';
import logo from './logo.svg';
// import { Counter } from './features/counter/Counter';
import './App.css';
import ChartContainer from './components/chart/ChartContainer';
import ScreenerContainer from './components/screener/ScreenerContainer';
import OrderContainer from './components/order/OrderContainer';
import Volatility from './modules/Volatility/Volatility';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import BotPage from './pages/bot';

const symbols = ['ADAUSDT', 'ATOMUSDT', 'BATUSDT', 'BCHUSDT', 'BNBUSDT', 'BTCUSDT', 'DASHUSDT', 'DOGEUSDT', 'EOSUSDT', 'ETCUSDT', 'ETHUSDT', 'IOSTUSDT', 'IOTAUSDT', 'LINKUSDT', 'LTCUSDT', 'MATICUSDT', 'NEOUSDT', 'ONTUSDT', 'QTUMUSDT', 'RVNUSDT', 'TRXUSDT', 'VETUSDT', 'XLMUSDT', 'XMRUSDT', 'XRPUSDT', 'ZECUSDT', 'XTZUSDT'];

function App() {
    return (
		<BrowserRouter>
			<Routes>
                <Route path="/bot" element={<BotPage />} />
            </Routes>
		</BrowserRouter>
	);

    // return (
    //     <div className="row">
    //         <div className="col col_grow">
    //             {/* <ChartContainer symbols={symbols} /> */}
    //             {/* <ScreenerContainer symbols={symbols} /> */}
    //             {/* <AtrContainer /> */}
    //             <Volatility />
    //         </div>
    //         <div className="col">
    //             {/* <OrderContainer /> */}
    //         </div>
    //     </div>
    // );
}

export default App;
