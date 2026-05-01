import { useEffect, useState } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import { fetchPublicCategories, fetchPublicProductsByCategory } from '../services/catalogApi'
import { getCategoryConfig, getCategoryProducts, resolveCategorySlug } from '../data/catalog'
import '../styles/CategoryPage.css'

function getTitleFromSlug(value) {
  return String(value || '')
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

const CategoryPage = () => {
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const searchTerm = (searchParams.get('search') || '').trim()

  const [allProducts, setAllProducts] = useState([])
  const [apiCategoryMeta, setApiCategoryMeta] = useState(null)
  const [loading, setLoading] = useState(true)

  const canonicalSlug = resolveCategorySlug(slug)
  const localCategory = getCategoryConfig(canonicalSlug)
  const displayCategory =
    localCategory ||
    apiCategoryMeta || {
      title: getTitleFromSlug(canonicalSlug) || 'Category',
      bannerLabel: getTitleFromSlug(canonicalSlug) || 'Category',
      banner: null,
      description: '',
    }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setApiCategoryMeta(null)

      try {
        const [products, categories] = await Promise.all([
          fetchPublicProductsByCategory(canonicalSlug),
          fetchPublicCategories(),
        ])

        const matchedCategory = categories.find((category) => category.slug === canonicalSlug)

        setAllProducts(products)
        if (matchedCategory) {
          setApiCategoryMeta({
            title: matchedCategory.title || matchedCategory.name || getTitleFromSlug(canonicalSlug),
            bannerLabel: matchedCategory.bannerLabel || matchedCategory.title || matchedCategory.name,
            banner: matchedCategory.banner || null,
            description: matchedCategory.description || '',
          })
        }
      } catch {
        setAllProducts(getCategoryProducts(canonicalSlug))
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [canonicalSlug])

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="cat-not-found"><h2>Loading...</h2></div>
        <Footer />
      </div>
    )
  }

  // Client-side search filtering
  const matchedProducts = searchTerm
    ? allProducts.filter((p) =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.short_description || p.shortDescription || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allProducts

  const matchedNames = new Set(matchedProducts.map((p) => p.name?.toLowerCase()))
  const relatedProducts = searchTerm
    ? allProducts.filter((p) => !matchedNames.has(p.name?.toLowerCase())).slice(0, 4)
    : []

  const hasProducts = allProducts.length > 0
  const hasSearch = Boolean(searchTerm)
  const hasMatches = matchedProducts.length > 0

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="cat-banner">
        {displayCategory.banner && (
          <img
            src={displayCategory.banner}
            alt={displayCategory.title}
            className="cat-banner-img"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        )}
        <div className="cat-banner-overlay">
          <div className="cat-banner-box">
            <span>{displayCategory.bannerLabel || displayCategory.title}</span>
          </div>
        </div>
      </div>

      <section className="cat-section">
        <div className="cat-container">
          {!hasProducts ? (
            <div className="cat-coming-soon">
              <div className="cat-coming-soon-icon">New</div>
              <h3>Products Coming Soon</h3>
              <p>We are currently updating our {displayCategory.title} range. Please check back soon or send us an enquiry.</p>
              <Link to="/enquiry" className="cat-enquire-btn">Send Enquiry</Link>
            </div>
          ) : hasMatches ? (
            <>
              <div className="cat-grid">
                {matchedProducts.map((product, i) => (
                  <ProductCard key={product.id || product.name || i} product={product} />
                ))}
              </div>

              {hasSearch && relatedProducts.length > 0 && (
                <div className="cat-related-block">
                  <div className="cat-related-header">
                    <h3>Related Products In This Category</h3>
                    <p>These products are also part of the {displayCategory.title} range.</p>
                  </div>
                  <div className="cat-grid">
                    {relatedProducts.map((product, i) => (
                      <ProductCard key={`${product.id || product.name}-related-${i}`} product={product} />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="cat-empty-state">
                <h3>No product found for "{searchTerm}"</h3>
                <p>Try a different keyword, or explore these related products from {displayCategory.title}.</p>
                <Link to={`/category/${canonicalSlug}`} className="cat-search-clear">Show all products</Link>
              </div>

              {relatedProducts.length > 0 && (
                <div className="cat-related-block">
                  <div className="cat-related-header">
                    <h3>Suggested Products</h3>
                    <p>These are the closest options available in this category.</p>
                  </div>
                  <div className="cat-grid">
                    {relatedProducts.map((product, i) => (
                      <ProductCard key={`${product.id || product.name}-suggested-${i}`} product={product} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default CategoryPage
