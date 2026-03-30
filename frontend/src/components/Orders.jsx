import { useState, useEffect } from 'react'
import { orderApi } from '../services/orderApi'
import './Orders.css'

export default function Orders({ isAdmin }) {
  const [orders, setOrders] = useState({ content: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState(isAdmin ? 'admin' : 'my')

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = viewMode === 'admin' && isAdmin
          ? await orderApi.getAllOrders(0, 50)
          : await orderApi.getMyOrders(0, 20)
        setOrders(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [viewMode, isAdmin])

  if (loading) return <div className="loading">Loading orders...</div>
  if (error) return <div className="error-banner">{error}</div>

  const items = orders.content || []

  // Simple daily revenue summary for admin
  let dailySummary = []
  if (isAdmin && items.length > 0) {
    const map = {}
    items.forEach(o => {
      const date = o.createdAt ? new Date(o.createdAt).toLocaleDateString() : 'Unknown date'
      const amount = Number(o.totalAmount || 0)
      if (!map[date]) map[date] = { date, orders: 0, revenue: 0 }
      map[date].orders += 1
      map[date].revenue += amount
    })
    dailySummary = Object.values(map).sort((a, b) => new Date(b.date) - new Date(a.date))
  }

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h2>{isAdmin && viewMode === 'admin' ? 'All Orders (Admin)' : 'My Orders'}</h2>
        {isAdmin && (
          <div className="orders-tabs">
            <button
              className={`orders-tab ${viewMode === 'my' ? 'active' : ''}`}
              onClick={() => setViewMode('my')}
            >
              My orders
            </button>
            <button
              className={`orders-tab ${viewMode === 'admin' ? 'active' : ''}`}
              onClick={() => setViewMode('admin')}
            >
              All orders
            </button>
          </div>
        )}
      </div>

      {isAdmin && viewMode === 'admin' && dailySummary.length > 0 && (
        <div className="orders-summary">
          <h3>Sales summary</h3>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Orders</th>
                <th>Total revenue</th>
              </tr>
            </thead>
            <tbody>
              {dailySummary.map(row => (
                <tr key={row.date}>
                  <td>{row.date}</td>
                  <td>{row.orders}</td>
                  <td>₹{row.revenue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {items.length === 0 ? (
        <p className="orders-empty">No orders yet</p>
      ) : (
        <div className="orders-list">
          {items.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <span className="order-id">#{order.id}</span>
                <span className={`order-status status-${order.status?.toLowerCase()}`}>{order.status}</span>
              </div>
              <div className="order-meta">
                {isAdmin && (
                  <span className="order-user">User: {order.user?.email ?? `ID ${order.userId}`}</span>
                )}
                {order.createdAt && (
                  <span className="order-date">
                    {new Date(order.createdAt).toLocaleString()}
                  </span>
                )}
              </div>
              <div className="order-items">
                {order.items?.map((oi, i) => (
                  <div key={i} className="order-item">
                    {oi.product?.name} × {oi.quantity} = ₹{Number(oi.lineTotal || 0).toFixed(2)}
                  </div>
                ))}
              </div>
              <div className="order-total">Total: ₹{Number(order.totalAmount || 0).toFixed(2)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
