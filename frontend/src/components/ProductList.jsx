import ProductCard from './ProductCard'
import './ProductList.css'
import SalesChart from './SalesChart'

export default function ProductList({ products, onEdit, onDelete, onAddToCart, isAdmin }) {
  if (products.length === 0) {
    return (
      <div className="empty-state">
        <p>No products found. Adjust filters or add your first product.</p>
      </div>
    )
  }

  return (
    <>
    <SalesChart products={products} />
    <div className="product-grid">
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddToCart={onAddToCart}
          isAdmin={isAdmin}
        />
      ))}
    </div>
    </>
  )
}
