import { useState, useEffect } from 'react'
import { productApi } from './services/productApi'
import { orderApi } from './services/orderApi'
import { authApi } from './services/authApi'
import { authStore } from './services/authStore'
import ProductList from './components/ProductList'
import ProductForm from './components/ProductForm'
import Header from './components/Header'
import Login from './components/Login'
import Cart from './components/Cart'
import Orders from './components/Orders'
import './App.css'

function App() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingProduct, setEditingProduct] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [showLogin, setShowLogin] = useState(!authStore.isAuthenticated())
  const [showCart, setShowCart] = useState(false)
  const [view, setView] = useState('products')
  const [cart, setCart] = useState(() => {
    try {
      const stored = localStorage.getItem('cart_items')
      if (!stored) return []
      const parsed = JSON.parse(stored)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })
  const [isAdmin, setIsAdmin] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [stockFilter, setStockFilter] = useState('')
  const [isActiveFilter, setIsActiveFilter] = useState('')
  const [sortBy, setSortBy] = useState('id')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [dashboardStats, setDashboardStats] = useState({ totalProducts: 0, totalCategories: 0, lowStockCount: 0, recent: [], lowStockList: [] })
  const pageSize = 10

  const resetPage = () => setPage(0)

  useEffect(() => {
    if (authStore.isAuthenticated()) {
      if (authStore.isDevMode()) setIsAdmin(true)
      else authApi.me().then(u => setIsAdmin(u.roles?.includes('ADMIN'))).catch(() => setIsAdmin(false))
    } else setIsAdmin(false)
  }, [authStore.isAuthenticated()])

  useEffect(() => {
    try {
      if (!cart || cart.length === 0) {
        localStorage.removeItem('cart_items')
      } else {
        localStorage.setItem('cart_items', JSON.stringify(cart))
      }
    } catch {
      // ignore storage errors
    }
  }, [cart])

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { page, size: pageSize, sortBy, sortDir }
      if (searchTerm) params.search = searchTerm
      if (categoryFilter) params.category = categoryFilter
      const min = parseFloat(minPrice), max = parseFloat(maxPrice)
      if (minPrice !== '' && !isNaN(min)) params.minPrice = min
      if (maxPrice !== '' && !isNaN(max)) params.maxPrice = max
      if (stockFilter) params.stockFilter = stockFilter
      if (isActiveFilter === '') params.includeInactive = true
      else params.isActive = isActiveFilter === 'true'
      const data = await productApi.getAll(params)
      const content = data.content ?? data
      const list = Array.isArray(content) ? content : []
      setProducts(list)
      setTotalPages(data.totalPages ?? 1)
      setTotalElements(data.totalElements ?? list.length ?? 0)
      // derive simple dashboard stats
      const lowStock = list.filter(p => p.stockQuantity != null && p.stockQuantity < 5)
      const uniqueCategories = [...new Set(list.map(p => p.category).filter(Boolean))]
      const recent = [...list]
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 4)
      setDashboardStats({
        totalProducts: list.length,
        totalCategories: uniqueCategories.length,
        lowStockCount: lowStock.length,
        recent,
        lowStockList: lowStock.slice(0, 5),
      })
    } catch (err) {
      setError(err.message || 'Failed to fetch products')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProducts() }, [page, searchTerm, categoryFilter, minPrice, maxPrice, stockFilter, isActiveFilter, sortBy, sortDir])

  const handleAddToCart = (product) => {
    const existing = cart.find(c => c.id === product.id)
    if (existing) {
      if (existing.quantity >= product.stockQuantity) return
      setCart(cart.map(c => c.id === product.id ? { ...c, quantity: c.quantity + 1 } : c))
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
    }
    setShowCart(true)
  }

  const handleRemoveFromCart = (idx) => {
    setCart(cart.filter((_, i) => i !== idx))
  }

  const handlePlaceOrder = async () => {
    if (!authStore.getToken()) {
      setError('Please sign in to place an order.')
      setShowLogin(true)
      return
    }
    if (!cart.length) {
      setError('Your cart is empty.')
      return
    }
    try {
      await orderApi.placeOrder(cart.map(c => ({ productId: c.id, quantity: c.quantity })))
      setCart([])
      setShowCart(false)
      setView('orders')
      fetchProducts()
    } catch (err) {
      setError(err.message || 'Order failed')
    }
  }

  const handleAddProduct = () => {
    if (!authStore.isAuthenticated()) { setShowLogin(true); return }
    setEditingProduct(null)
    setShowForm(true)
  }

  const handleEditProduct = (product) => {
    if (!authStore.isAuthenticated()) { setShowLogin(true); return }
    setEditingProduct(product)
    setShowForm(true)
  }

  const handleFormSubmit = async (productData) => {
    try {
      if (editingProduct) await productApi.update(editingProduct.id, productData)
      else await productApi.create(productData)
      setShowForm(false)
      setEditingProduct(null)
      fetchProducts()
    } catch (err) { throw err }
  }

  const handleDeleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return
    try {
      await productApi.delete(id)
      fetchProducts()
      setShowForm(false)
      setEditingProduct(null)
    } catch (err) { setError(err.message || 'Delete failed') }
  }

  const handleCloseForm = () => { setShowForm(false); setEditingProduct(null) }
  const handleLoginSuccess = () => { setShowLogin(false); fetchProducts() }
  const handleLogout = () => { authStore.logout(); setShowLogin(true); setProducts([]); setCart([]) }

  const categories = [...new Set(products.map(p => p.category))].filter(Boolean).sort()

  const handleExportCsv = () => {
    if (!products.length) return
    const header = ['ID', 'Name', 'Category', 'Price', 'Stock', 'Description', 'Image URL', 'Active', 'Discount %']
    const rows = products.map(p => [
      p.id,
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${(p.category || '').replace(/"/g, '""')}"`,
      p.price,
      p.stockQuantity,
      `"${(p.description || '').replace(/"/g, '""')}"`,
      p.imageUrl || '',
      p.active !== false ? 'Yes' : 'No',
      p.discountPercentage ?? 0,
    ])
    const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'products.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  if (showLogin) return <Login onSuccess={handleLoginSuccess} />

  return (
    <div className="app">
      <Header
        onAddProduct={handleAddProduct}
        onShowCart={() => setShowCart(true)}
        onShowOrders={() => setView('orders')}
        onShowProducts={() => setView('products')}
        user={authStore.getUser()}
        cartCount={cart.length}
        isAdmin={isAdmin}
        onLogout={handleLogout}
      />
      <main className="main">
        {view === 'orders' ? (
          <Orders isAdmin={isAdmin} />
        ) : (
          <>
            <section className="dashboard-cards">
              <div className="dash-card">
                <p className="dash-label">Total products</p>
                <p className="dash-value">{dashboardStats.totalProducts}</p>
              </div>
              <div className="dash-card">
                <p className="dash-label">Categories</p>
                <p className="dash-value">{dashboardStats.totalCategories}</p>
              </div>
              <div className="dash-card">
                <p className="dash-label">Low stock (&lt; 5)</p>
                <p className="dash-value dash-value-warning">{dashboardStats.lowStockCount}</p>
              </div>
              {dashboardStats.recent.length > 0 && (
                <div className="dash-card dash-card-wide">
                  <p className="dash-label">Recently added</p>
                  <ul className="dash-recent-list">
                    {dashboardStats.recent.map(p => (
                      <li key={p.id}>{p.name} <span>- {p.category}</span></li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            {dashboardStats.lowStockList.length > 0 && (
              <section className="low-stock-banner">
                <span className="low-stock-title">Low stock alert:</span>
                {dashboardStats.lowStockList.map(p => (
                  <span key={p.id} className="low-stock-chip">
                    {p.name} ({p.stockQuantity})
                  </span>
                ))}
              </section>
            )}

            <div className="filters-section">
              <div className="toolbar-row">
                <span className="toolbar-title">Products</span>
                <div className="toolbar-right">
                  {isAdmin && (
                    <button className="btn btn-secondary" type="button" onClick={handleExportCsv}>
                      Export CSV
                    </button>
                  )}
                </div>
              </div>
              <div className="filters-row filters-primary">
                <input type="text" placeholder="Search by name..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); resetPage() }} className="search-input" />
                <input type="text" placeholder="Filter by category" value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); resetPage() }} className="filter-input" list="category-suggestions" />
                <datalist id="category-suggestions">{categories.map(cat => <option key={cat} value={cat} />)}</datalist>
                <div className="price-range">
                  <input type="number" step="0.01" min="0" placeholder="Min price" value={minPrice} onChange={(e) => { setMinPrice(e.target.value); resetPage() }} className="filter-input price-input" />
                  <span className="filter-sep">–</span>
                  <input type="number" step="0.01" min="0" placeholder="Max price" value={maxPrice} onChange={(e) => { setMaxPrice(e.target.value); resetPage() }} className="filter-input price-input" />
                </div>
                <select value={stockFilter} onChange={(e) => { setStockFilter(e.target.value); resetPage() }} className="filter-select">
                  <option value="">Stock: All</option>
                  <option value="in_stock">In stock</option>
                  <option value="low_stock">Low stock (≤10)</option>
                  <option value="out_of_stock">Out of stock</option>
                </select>
                <select value={isActiveFilter} onChange={(e) => { setIsActiveFilter(e.target.value); resetPage() }} className="filter-select">
                  <option value="">Status: All</option>
                  <option value="true">Active only</option>
                  <option value="false">Inactive only</option>
                </select>
              </div>
              <div className="filters-row filters-sort">
                <span className="sort-label">Sort by</span>
                <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); resetPage() }} className="filter-select">
                  <option value="id">ID</option>
                  <option value="name">Name</option>
                  <option value="price">Price</option>
                  <option value="stockQuantity">Stock (least first)</option>
                </select>
                <select value={sortDir} onChange={(e) => { setSortDir(e.target.value); resetPage() }} className="filter-select">
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>

            {error && <div className="error-banner">{error}</div>}

            {loading ? (
              <div className="loading">Loading products...</div>
            ) : (
              <>
                <ProductList products={products} onEdit={handleEditProduct} onDelete={handleDeleteProduct} onAddToCart={handleAddToCart} isAdmin={isAdmin} />
                {totalPages > 1 && (
                  <div className="pagination">
                    <button disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))}>Previous</button>
                    <span>Page {page + 1} of {totalPages} ({totalElements} total)</span>
                    <button disabled={page >= totalPages - 1} onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}>Next</button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {showForm && <ProductForm product={editingProduct} onSubmit={handleFormSubmit} onClose={handleCloseForm} />}
        {showCart && <Cart items={cart} onRemove={handleRemoveFromCart} onPlaceOrder={handlePlaceOrder} onClose={() => setShowCart(false)} />}
      </main>
    </div>
  )
}

export default App
