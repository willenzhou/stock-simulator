import React from 'react';
import { useState } from 'react';
import './App.css';
import FilterableStockTable from './FilterSTable';
import { StockInfo } from './StockInfo';

const STOCKS = [
    {
        name: 'stock1',
        price: 3.28,
        favorite: false,
        num_shares: 0
    },
    {
        name: 'stock2',
        price: 5.63,
        favorite: true,
        num_shares: 10
    },
    {
        name: 'stock3',
        price: 1,
        favorite: false,
        num_shares: 0
    },
    {
        name: 'stock4',
        price: 100,
        favorite: true,
        num_shares: 5
    }
]

const Profile = () => {
    const [stocks, setStocks] = useState<StockInfo[]>(STOCKS);
    return(
        <div>
            <h1 className="display-6">Profile</h1>
            <br />
            <FilterableStockTable stocks={stocks} callback={setStocks} />
        </div>
    )
}

export default Profile;