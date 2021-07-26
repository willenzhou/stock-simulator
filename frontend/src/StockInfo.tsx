import React, { useEffect, useState } from 'react';
import StockScreen from './StockScreen';
import { useHistory } from 'react-router'
import { useLocation, useParams } from 'react-router-dom';

export type StockInfo = {
    readonly name: string,
    readonly price: number,
    readonly favorite: boolean,
    readonly num_shares: number
}

export type Stock = {
    readonly name: string,
    readonly price: number
};
type Param = {
    stockId: string
}
const StockInfo = () => {

    const [currstock, setCurrstock] = useState<Stock>({name: "Stock Not Found", price: 0.00} as Stock);
    const params: Param = useParams();
    useEffect(() => {
    fetch(`/stock?name=${params.stockId.toUpperCase()}`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
        })
            .then((response) =>
                response.json())
            .then((d) => setCurrstock(d));
    }, [params])


    // useEffect(() => {
    //     fetch(`/userStocks/${firebase.auth().currentUser?.getIdToken}`)
    //       .then(res => res.json())
    //       .then(data => {
    //         setCurrstocks(data);
    //       })
    //   }, [currstocks])

    console.log(params)
    return (
        <div>
            <StockScreen stock={currstock} />
        </div>
    )
}

export default StockInfo;