import { useEffect, useState } from 'react';
import { StockInfo, Stock } from './StockInfo';
import FavoriteStock from './FavoriteStock';
import firebase from 'firebase';
import { Button, Table } from 'react-bootstrap';

type Props = {
  readonly stock: Stock,
}

const StockScreen = ({ stock }: Props) => {
  // const [currstock, setCurrstock] = useState<StockInfo>(stock);

  // const changeStock = (s: StockInfo) => {
  //   setCurrstock(s);
  // }

  // const name = stock.favorite ? (
  //   stock.name
  // ) : (
  //   <span style={{ color: 'red' }}>{stock.name}</span>
  // );

  const addStock = (stock: Stock) => {
    fetch(`/userstocks/${firebase.auth().currentUser?.getIdToken}?name=${stock.name}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
    })
  }


  return (
    <div>
      <h1 className="display-6">Info for {stock.name}</h1>
      <Table responsive="sm" striped bordered hover>
        <thead>
          <th>Name</th>
          <th>Price</th>
        </thead>
        <tbody>
          <td>{stock.name}</td>
          <td>{stock.price}</td>
        </tbody>
      </Table>
      <Button variant="primary" onClick={() => addStock(stock)} > Add to Profile </Button >
    </div>
  )
}

export default StockScreen
