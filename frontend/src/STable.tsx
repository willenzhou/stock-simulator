import { ReactElement, useState } from "react"
import { StockInfo } from './StockInfo';
import BuyStock from './BuyStock';
import FavoriteStock from './FavoriteStock';
import SellStock from "./SellStock";
import firebase from "firebase";
import { Button, Table } from "react-bootstrap";

type StockRowProps = {
  readonly stock: StockInfo;
  readonly stocks: StockInfo[];
  readonly callback: React.Dispatch<StockInfo[]>;
};

const StockRow = ({ stock, stocks, callback }: StockRowProps) => {
  const [currstock, setCurrstock] = useState<StockInfo>(stock);
  const [currstocks, setCurrstocks] = useState<StockInfo[]>(stocks);
  const [sum, setSum] = useState(0);

  const changeStock = (s: StockInfo) => {
    callback(currstocks);
    let indx: number = 0;
    for (let i = 0; i < currstocks.length; i++) {
      if (currstocks[i].name === s.name) {
        indx = i;
      }
    }
    // let filtered: StockInfo[] = [];
    // filtered[indx] = stock;
    let filtered: StockInfo[] = [...currstocks.slice(0, indx), s, ...currstocks.slice(indx + 1)];
    // let filtered: StockInfo[] = currstocks.filter(s => s.name !== stock.name);
    // const return_stocks: StockInfo[] = [...filtered, stock];
    setCurrstock(s);
    setCurrstocks(filtered);


    // set sum in here, so every time you add or subtract you know, then callback to 
    // stock table, where the sum resides and directly pass in a number
    let sumFunct = function (a: number, b: number) {
      return a + b;
    }

    currstocks.forEach(function (stock) {
      setSum(sumFunct(sum, (parseFloat((stock.price * stock.num_shares).toFixed(2)))));
    })

  }
  const name = currstock.favorite ? (
    currstock.name
  ) : (
    <span style={{ color: 'red' }}>{currstock.name}</span>
  );

  const deleteStock = () => {
    fetch(`/deleteStock/${firebase.auth().currentUser?.getIdToken}?name=${stock.name}`, {
      method: 'DELETE',
      headers: {
        'content-type': 'application/json',
      },
    })
  };

  return (
      <tr>
        <td>{name}</td>
        <td>{currstock.price}</td>
        <td>{currstock.num_shares}</td>
        <td>{parseFloat((currstock.price * currstock.num_shares).toFixed(2))}</td>
        <td><BuyStock stock={currstock} callback={changeStock} /></td>
        <td><SellStock stock={currstock} callback={changeStock} /></td>
        <td><FavoriteStock stock={currstock} callback={changeStock} /></td>
        <td> <Button variant="danger" onClick={() => deleteStock()}>delete</Button> </td>
      </tr>

  );
};

type Props = {
  readonly stocks: StockInfo[];
  readonly filterText: string;
  readonly favoriteOnly: boolean;
  readonly descending: boolean;
  readonly callback: React.Dispatch<StockInfo[]>;
}

const StockTable = ({ stocks, filterText, favoriteOnly, descending, callback }: Props) => {
  const rows: ReactElement[] = [];

  let [currstocks, setCurrstocks] = useState<StockInfo[]>(stocks);
  let return_stocks: StockInfo[] = stocks;

  const changeStocks = (ss: StockInfo[]) => {
    setCurrstocks(ss);
    callback(ss);
  }

  if (descending === false) {
    return_stocks = currstocks.sort((a, b) => (a.price * a.num_shares) - (b.price * b.num_shares));
    return_stocks.forEach((stock) => {
      if (stock.name.indexOf(filterText) === -1) return;
      if (favoriteOnly && !stock.favorite) return;
      rows.push(<StockRow key={stock.name} stock={stock} stocks={currstocks} callback={changeStocks} />);
    })
  } else {
    return_stocks = currstocks.sort((a, b) => (b.price * b.num_shares) - (a.price * a.num_shares));
    return_stocks.forEach((stock) => {
      if (stock.name.indexOf(filterText) === -1) return;
      if (favoriteOnly && !stock.favorite) return;
      rows.push(<StockRow key={stock.name} stock={stock} stocks={currstocks} callback={changeStocks} />);
    })
  }

  return (
    <div>
      <Table responsive="sm" striped bordered hover>
        <thead>
          <th>Name</th>
          <th>Price</th>
          <th>Holdings (# shares)</th>
          <th>Holdings ($)</th>
          <th>Buy Stocks</th>
          <th>Sell Stocks</th>
          <th>Watch/Unwatch Stocks</th>
          <th>Delete Stocks from List</th>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </div>

  )
}

export default StockTable