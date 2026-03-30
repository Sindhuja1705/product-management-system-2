import { useState, useEffect } from 'react'
import './ProductForm.css'

export default function ProductForm({ product, onSubmit, onClose }) {
  const isEdit = !!product
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stockQuantity: '',
    description: '',
    imageUrl: '',
    discountPercentage: '',
    active: true,
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        category: product.category,
        price: String(product.price),
        stockQuantity: String(product.stockQuantity),
        description: product.description || '',
        imageUrl: product.imageUrl || '',
        discountPercentage: product.discountPercentage != null ? String(product.discountPercentage) : '',
        active: product.active !== false,
      })
    } else {
      setFormData({
        name: '',
        category: '',
        price: '',
        stockQuantity: '',
        description: '',
        imageUrl: '',
        discountPercentage: '',
        active: true,
      })
    }
  }, [product])

  const validate = () => {
    const err = {}
    if (!formData.name?.trim()) err.name = 'Name is required'
    if (!formData.category?.trim()) err.category = 'Category is required'
    const price = parseFloat(formData.price)
    if (isNaN(price) || price <= 0) err.price = 'Valid price is required'
    const stock = parseInt(formData.stockQuantity, 10)
    if (isNaN(stock) || stock < 0) err.stockQuantity = 'Valid stock quantity is required'
    const discount = formData.discountPercentage === '' ? 0 : parseFloat(formData.discountPercentage)
    if (formData.discountPercentage !== '' && (isNaN(discount) || discount < 0 || discount > 100)) err.discountPercentage = 'Discount must be 0-100'
    setErrors(err)
    return Object.keys(err).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await onSubmit({
        name: formData.name.trim(),
        category: formData.category.trim(),
        price: parseFloat(formData.price),
        stockQuantity: parseInt(formData.stockQuantity, 10),
        description: formData.description.trim() || null,
        imageUrl: formData.imageUrl?.trim() || null,
        discountPercentage: formData.discountPercentage === '' ? 0 : parseFloat(formData.discountPercentage),
        active: formData.active,
      })
    } catch (err) {
      setErrors({ submit: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="product-form">
          {errors.submit && <div className="form-error">{errors.submit}</div>}
          <div className="form-group">
            <label htmlFor="name">Product Name *</label>
            <input
              id="name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Wireless Headphones"
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <input
              id="category"
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g. Electronics"
            />
            {errors.category && <span className="field-error">{errors.category}</span>}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Price *</label>
              <input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
              />
              {errors.price && <span className="field-error">{errors.price}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="stock">Stock Quantity *</label>
              <input
                id="stock"
                type="number"
                min="0"
                value={formData.stockQuantity}
                onChange={e => setFormData({ ...formData, stockQuantity: e.target.value })}
                placeholder="0"
              />
              {errors.stockQuantity && <span className="field-error">{errors.stockQuantity}</span>}
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="imageUrl">Image URL (optional)</label>
            <input
              id="imageUrl"
              type="text"
              value={formData.imageUrl || ''}
              onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://... or /uploads/..."
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              rows="3"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional product description"
            />
          </div>
          <div className="form-group">
            <label htmlFor="discount">Discount % (0-100)</label>
            <input
              id="discount"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={formData.discountPercentage}
              onChange={e => setFormData({ ...formData, discountPercentage: e.target.value })}
              placeholder="0"
            />
            {errors.discountPercentage && <span className="field-error">{errors.discountPercentage}</span>}
          </div>
          <div className="form-group form-checkbox">
            <label>
              <input
                type="checkbox"
                checked={formData.active}
                onChange={e => setFormData({ ...formData, active: e.target.checked })}
              />
              Active (product visible and available)
            </label>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : (isEdit ? 'Update Product' : 'Add Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
