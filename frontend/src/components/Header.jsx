import './Header.css'

export default function Header({ onAddProduct, onShowCart, onShowOrders, onShowProducts, user, cartCount, isAdmin, onLogout }) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-top">
          <div className="header-brand">
            <div className="logo-circle">PM</div>
            <div>
              <h1>Product Management System</h1>
              <p className="header-subtitle">Modern dashboard for products and orders</p>
            </div>
          </div>
          <nav className="header-nav">
            <button className="nav-link" onClick={onShowProducts}>
              <span className="nav-icon">📦</span>
              <span>Products</span>
            </button>
            <button className="nav-link" onClick={onShowOrders}>
              <span className="nav-icon">📑</span>
              <span>Orders</span>
            </button>
            {!isAdmin && (
            <button className="nav-link cart-btn" onClick={onShowCart}>
              <span className="nav-icon">🛒</span>
              <span>Cart</span>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
            )}
            {isAdmin && (
              <button className="btn btn-success" onClick={onAddProduct}>
                + Add Product
              </button>
            )}
            {user && (
              <div className="header-user-block">
                <span className="header-user-avatar">{user.charAt(0).toUpperCase()}</span>
                <span className="header-user">{user}</span>
                <button className="btn btn-outline" onClick={onLogout}>Logout</button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
