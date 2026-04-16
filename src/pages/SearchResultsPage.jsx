import React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import TopBar from '../components/TopBar'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import { getFallbackSuggestions, getRelatedProducts, searchProducts } from '../data/catalog'
import '../styles/CategoryPage.css'

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams()
  const searchTerm = (searchParams.get('search') || '').trim()
  const matchedProducts = searchTerm ? searchProducts(searchTerm) : []
  const relatedProducts = matchedProducts.length > 0
    ? getRelatedProducts(matchedProducts, {
        excludeNames: matchedProducts.map((product) => product.name),
        limit: 4,
      })
    : getFallbackSuggestions(searchTerm, 4)

  return (
    <div className="min-h-screen bg-white">
      <TopBar />
      <Header />

      <section className="cat-section cat-search-page">
        <div className="cat-container">
          <div className="cat-section-header">
            <div className="cat-product-count">
              <span className="cat-product-count-dot" />
              {searchTerm ? `${matchedProducts.length} Result${matchedProducts.length === 1 ? '' : 's'}` : 'Search Products'}
            </div>
            <h2>Product Search</h2>
            <p>
              {searchTerm
                ? `Showing all products that match "${searchTerm}" across the catalog.`
                : 'Use the search bar above to find products by name, category, or keyword.'}
            </p>
            {searchTerm && (
              <div className="cat-search-actions">
                <span className="cat-search-pill">Search: {searchTerm}</span>
                <Link to="/" className="cat-search-clear">Back to Home</Link>
              </div>
            )}
          </div>

          {searchTerm && matchedProducts.length > 0 ? (
            <div className="cat-grid">
              {matchedProducts.map((product) => (
                <ProductCard
                  key={`${product.categorySlug}-${product.name}-search`}
                  product={product}
                  actionLabel="Open Product"
                  showCategory
                />
              ))}
            </div>
          ) : searchTerm ? (
            <div className="cat-empty-state">
              <h3>No product found for "{searchTerm}"</h3>
              <p>Try another keyword, or explore these suggested products from our range.</p>
              <Link to="/" className="cat-search-clear">Browse all categories</Link>
            </div>
          ) : (
            <div className="cat-empty-state">
              <h3>Search the product catalog</h3>
              <p>Type a keyword like Amino, Compost, Bloom, or NPK in the header search bar to jump to matching products.</p>
            </div>
          )}

          {relatedProducts.length > 0 && (
            <div className="cat-related-block">
              <div className="cat-related-header">
                <h3>{matchedProducts.length > 0 ? 'Related Products' : 'Suggested Products'}</h3>
                <p>
                  {matchedProducts.length > 0
                    ? 'These products come from the same matching categories and may also be useful.'
                    : 'A few products you can explore while refining your search.'}
                </p>
              </div>
              <div className="cat-grid">
                {relatedProducts.map((product) => (
                  <ProductCard
                    key={`${product.categorySlug}-${product.name}-related-search`}
                    product={product}
                    actionLabel="Open Product"
                    showCategory
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default SearchResultsPage
