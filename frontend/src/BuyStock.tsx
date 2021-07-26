import { StockInfo } from './StockInfo';
import React from 'react';
import firebase from 'firebase';
import { Button } from 'react-bootstrap';

type Props = {
  readonly stock: StockInfo,
  readonly callback: React.Dispatch<StockInfo>;
  // readonly callback: React.Dispatch<React.SetStateAction<StockInfo>>;
}

const BuyStock = ({ stock, callback }: Props) => {

  const buyStock = ({ name, price, favorite, num_shares }: StockInfo) => {

    fetch(`/transaction/${firebase.auth().currentUser?.getIdToken}?name=${stock.name}?type=buy`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(num_shares)
    })

    callback({ name: name, price: price, favorite: favorite, num_shares: num_shares + 1 });
  }
  return (
    <Button variant="primary" onClick={() => buyStock(stock)} > Buy one share </Button >
  )
}

export default BuyStock;

