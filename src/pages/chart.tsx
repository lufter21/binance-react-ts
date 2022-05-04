import { useGetSymbolsQuery } from '../app/binanceApi';
import Chart from '../components/chart/Chart';


export default function ChartPage() {
    const { data: _symbols, isSuccess } = useGetSymbolsQuery();
    return !isSuccess ? null : <Chart symbols={_symbols} />;
}