// import React from 'react';
// import logo from './logo.svg';
// import { Counter } from './features/counter/Counter';
import './App.css';
// import ChartContainer from './components/chart/ChartContainer';
// import ScreenerContainer from './components/screener/ScreenerContainer';
// import OrderContainer from './components/order/OrderContainer';
// import Volatility from './components/volatility/Volatility';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import BotPage from './pages/bot';
import TradePage from './pages/trade';
import ChartPage from './pages/chart';

function App() {
    return (
		<BrowserRouter>
			<Routes>
                <Route path="/bot" element={<BotPage />} />
                <Route path="/trade" element={<TradePage />} />
                <Route path="/chart" element={<ChartPage />} />
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
