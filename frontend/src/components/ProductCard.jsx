import './ProductList.css'

export default function ProductCard({ product, onEdit, onDelete, onAddToCart, isAdmin }) {

  const price = Number(product.price || 0)
  const discount = Number(product.discountPercentage || 0)
  const finalPrice = discount > 0 ? price * (1 - discount / 100) : price
  const imgUrl = product.imageUrl ? (product.imageUrl.startsWith('http') ? product.imageUrl : product.imageUrl) : null

  return (
    <article className={`product-card ${product.active === false ? 'product-inactive' : ''}`}>
      {imgUrl && (
        <div className="product-image">
          <img src={imgUrl} alt={product.name} />
        </div>
      )}
      <div className="product-card-header">
        <h3>{product.name}</h3>
        <div className="product-badges">
          <span className="product-category">{product.category}</span>
          {discount > 0 && <span className="badge badge-discount">{discount}% off</span>}
          {product.active !== false && <span className="badge badge-active">Active</span>}
          {product.active === false && <span className="badge badge-inactive">Inactive</span>}
        </div>
      </div>
      <div className="product-card-body">
        <div className="product-price-row">
          {discount > 0 && <span className="price-original">${price.toFixed(2)}</span>}
          <span className="price-final">${finalPrice.toFixed(2)}</span>
        </div>
        <div className="product-stat">
          <span className="label">Stock</span>
          <span className={`value ${product.stockQuantity < 10 ? 'low-stock' : ''} ${product.stockQuantity === 0 ? 'out-of-stock' : ''}`}>
  {product.stockQuantity}
  {product.stockQuantity < 5 && (
    <span style={{color:"red", marginLeft:"6px"}}>
      ⚠ Low Stock
    </span>
  )}
</span>
        </div>

        {product.description && <p className="product-description">{product.description}</p>}
      </div>
      <div className="product-card-actions">
        {isAdmin && (
          <>
            <button className="btn btn-edit" onClick={() => onEdit(product)}>Edit</button>
            <button className="btn btn-delete" onClick={() => onDelete(product.id)}>Delete</button>
          </>
        )}
        {!isAdmin && product.stockQuantity > 0 && product.active !== false && (
          <button className="btn btn-primary" onClick={() => onAddToCart(product)}>Add to Cart</button>
        )}
      </div>
    </article>
  )
}
