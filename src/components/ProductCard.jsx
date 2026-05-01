import { Link } from 'react-router-dom'
import { generateProductSlug } from '../data/productDetails'

const ProductCard = ({ product, actionLabel = 'View Product', showCategory = false }) => {
  const productSlug = product.slug || generateProductSlug(product.name)
  const productImage = product.image || product.imageUrl || null

  return (
    <div className="cat-card">
      <Link to={`/product/${productSlug}`} className="cat-card-image">
        {productImage && (
          <img src={productImage} alt={product.name} loading="lazy" decoding="async" />
        )}
      </Link>
      <div className="cat-card-body">
        {showCategory && <span className="cat-card-category">{product.categoryTitle}</span>}
        <h4 className="cat-card-name">{product.name}</h4>
        <Link to={`/product/${productSlug}`} className="cat-card-enquire">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          {actionLabel}
        </Link>
      </div>
    </div>
  )
}

export default ProductCard

