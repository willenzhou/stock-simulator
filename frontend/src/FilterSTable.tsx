import { ChangeEvent, useEffect, useState } from 'react';
import { StockInfo } from './StockInfo';
import StockTable from './STable';
import StockSum from './StockSum';
import firebase from 'firebase';
import { Form, Spinner } from 'react-bootstrap';

type SearchProps = {
  readonly filterText: string;
  readonly favoriteOnly: boolean;
  readonly descending: boolean;
  readonly handleFilterTextChange: (e: ChangeEvent<HTMLInputElement>) => void;
  readonly handleCheckBoxChange: (e: ChangeEvent<HTMLInputElement>) => void;
  readonly handleCheckBoxChange2: (e: ChangeEvent<HTMLInputElement>) => void;
};

const SearchBar = ({
  filterText,
  favoriteOnly,
  handleFilterTextChange,
  handleCheckBoxChange,
  descending,
  handleCheckBoxChange2,
}: SearchProps) => (
  <Form inline className="justify-content-center">
    <Form.Control
      type="text"
      placeholder="search here"
      value={filterText}
      onChange={handleFilterTextChange}
    />
    <Form.Check inline
      type="checkbox"
      checked={favoriteOnly}
      onChange={handleCheckBoxChange}
      label="Only show watching stocks"
    />
    <Form.Check inline
      type="checkbox"
      checked={descending}
      onChange={handleCheckBoxChange2}
      label="Sort by descending holdings in $"
    />
  </Form>
);

type TableProps = {
  readonly stocks: StockInfo[];
  readonly callback: React.Dispatch<React.SetStateAction<StockInfo[]>>;
};

const FilterableStockTable = ({ stocks, callback }: TableProps) => {
  const [currstocks, setCurrstocks] = useState<StockInfo[]>(stocks);
  const [filterText, setFilterText] = useState('');
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [descending, setDescending] = useState(false);

  useEffect(() => {
    fetch(`/userStocks/${firebase.auth().currentUser?.getIdToken}`)
      .then(res => res.json())
      .then(data => {
        setCurrstocks(data);
      })
  }, [currstocks])

  const changeStocks = (ss: StockInfo[]) => {
    setCurrstocks(ss);
    callback(ss);
  }

  const handleFilterTextChange = (e: ChangeEvent<HTMLInputElement>) =>
    setFilterText(e.target.value);
  const handleCheckBoxChange = (e: ChangeEvent<HTMLInputElement>) =>
    setFavoriteOnly(e.target.checked);
  const handleCheckBoxChange2 = (e: ChangeEvent<HTMLInputElement>) =>
    setDescending(e.target.checked);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => setLoading(false), 3000);
  }, [favoriteOnly, descending]);

  return loading ? (
    <Spinner animation="border" variant="primary" />
  ) : (
    <div>
      <SearchBar
        filterText={filterText}
        favoriteOnly={favoriteOnly}
        handleFilterTextChange={handleFilterTextChange}
        handleCheckBoxChange={handleCheckBoxChange}
        descending={descending}
        handleCheckBoxChange2={handleCheckBoxChange2}
      />
      <StockSum stocks={currstocks} />
      <StockTable
        stocks={currstocks}
        filterText={filterText}
        favoriteOnly={favoriteOnly}
        descending={descending}
        callback={changeStocks}
      />
    </div>
  );
};

export default FilterableStockTable;