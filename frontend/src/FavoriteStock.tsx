import { StockInfo } from './StockInfo';
import React from 'react';
import firebase from 'firebase';
import { Button } from 'react-bootstrap';

type Props = {
  readonly stock: StockInfo,
  readonly callback: React.Dispatch<StockInfo>;
  // readonly callback: React.Dispatch<React.SetStateAction<StockInfo>>;
}

const FavoriteStock = ({ stock, callback }: Props) => {
  const favoriteStock = ({ name, price, favorite, num_shares }: StockInfo) => {

    fetch(`/favorite/${firebase.auth().currentUser?.getIdToken}?name=${stock.name}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
    })

    callback({ name: name, price: price, favorite: !favorite, num_shares: num_shares });
  }
  return (
    <Button variant="success" onClick={() => favoriteStock(stock)} > Watch/Unwatch </Button >
  )
}

export default FavoriteStock;
