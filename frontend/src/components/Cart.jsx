import './Cart.css'

export default function Cart({ items, onRemove, onPlaceOrder, onClose }) {
  const total = items.reduce((sum, i) => {
    const p = Number(i.price || 0)
    const d = Number(i.discountPercentage || 0)
    const fp = d > 0 ? p * (1 - d / 100) : p
    return sum + fp * (i.quantity || 1)
  }, 0)

  return (
    <div className="cart-overlay" onClick={onClose}>
      <div className="cart-panel" onClick={e => e.stopPropagation()}>
        <div className="cart-header">
          <h2>Cart</h2>
          <button className="cart-close" onClick={onClose}>&times;</button>
        </div>
        {items.length === 0 ? (
          <p className="cart-empty">Your cart is empty</p>
        ) : (
          <>
            <ul className="cart-items">
              {items.map((item, idx) => {
                const p = Number(item.price || 0)
                const d = Number(item.discountPercentage || 0)
                const fp = d > 0 ? p * (1 - d / 100) : p
                const lineTotal = fp * (item.quantity || 1)
                return (
                  <li key={idx} className="cart-item">
                    <span className="cart-item-name">{item.name}</span>
                    <span className="cart-item-qty">×{item.quantity}</span>
                    <span className="cart-item-price">${lineTotal.toFixed(2)}</span>
                    <button className="btn-remove" onClick={() => onRemove(idx)}>×</button>
                  </li>
                )
              })}
            </ul>
            <div className="cart-footer">
              <div className="cart-total">Total: ${total.toFixed(2)}</div>
              <button className="btn btn-primary" onClick={onPlaceOrder}>Place Order</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
