import { StockInfo } from './StockInfo';

type SumProps = {
  readonly stocks: StockInfo[];
}

const StockSum = (stocks: SumProps) => {
  let sum: number = 0;
  let sumFunct = function (a: number, b: number) {
    return a + b;
  }

  stocks.stocks.forEach(function (stock) {
    sum = sumFunct(sum, (parseFloat((stock.price * stock.num_shares).toFixed(2))));
  })
  return (
    <div>
      <h4 > Total Holdings = {parseFloat(sum.toFixed(2))} </h4>
    </div>
  )
}

export default StockSum