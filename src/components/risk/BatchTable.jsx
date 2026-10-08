/* Inventory batches in FEFO order (First Expiry, First Out) */
import { formatDate } from '../../utils/format';

export default function BatchTable({ batches, showProduct = false, productLookup }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th scope="col">FEFO Order</th>
            <th scope="col">Batch</th>
            {showProduct && <th scope="col">Product</th>}
            <th scope="col" className="num">Quantity</th>
            <th scope="col">Date Received</th>
            <th scope="col">Expiry Date</th>
            <th scope="col" className="num">Days Left</th>
            <th scope="col" className="num">Est. at Risk</th>
            <th scope="col">Priority</th>
          </tr>
        </thead>
        <tbody>
          {batches.map((b, index) => (
            <tr key={b.id}>
              <td>{index + 1}</td>
              <td className="cell-title nowrap">{b.id}</td>
              {showProduct && <td>{productLookup(b.productId)?.name}</td>}
              <td className="num">{b.quantity}</td>
              <td>{formatDate(b.receivedDate)}</td>
              <td>{formatDate(b.expiryDate)}</td>
              <td className={`num${b.daysLeft <= 3 ? ' text-danger' : ''}`}>{b.daysLeft}</td>
              <td className="num">{b.atRiskUnits}</td>
              <td>
                {index === 0 ? (
                  <span className="badge badge-high">Sell first</span>
                ) : (
                  <span className="badge badge-neutral">Next</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
