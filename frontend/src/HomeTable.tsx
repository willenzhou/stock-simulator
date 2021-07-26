import { ReactElement, useEffect, useState } from "react"
import { Carousel, Table } from "react-bootstrap";
import { StockInfo } from './StockInfo';

type StockRowProps = {
  readonly stock: StockInfo;
};

const StockRow = ({ stock }: StockRowProps) => {
  return (
    <tr>
      <td>{stock.name}</td>
      <td>{stock.price}</td>
    </tr>
  );
};

const HomeTable = () => {
  const [stocks, setStocks] = useState<StockInfo[]>([]);

  useEffect(() => {
    fetch('/stocks/')
      .then(res => res.json())
      .then(data => {
        setStocks(data);
      })
  }, [stocks])

  const rows: ReactElement[] = [];
  stocks.forEach((stock) => {
    rows.push(<StockRow key={stock.name} stock={stock} />);
  })
  const numToShow = Math.min(5, stocks.length)
  const cards: ReactElement[] = []
  stocks.slice(0, numToShow).forEach((stock) => {
    cards.push(
      <Carousel.Item>
        <Carousel.Caption>
          <h3>{stock.name}</h3>
          <p>{stock.price}</p>
        </Carousel.Caption>
      </Carousel.Item>
    )
  })
  return (
    <div>
      <Carousel>
      {cards}
      </Carousel>
      <Table responsive="sm" striped bordered hover>
        <thead>
          <th>Name</th>
          <th>Price</th>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </div>

  )
};

export default HomeTable;