import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ChevronDown, ChevronRight, Leaf, Droplets,
  Sprout, Package, FlaskConical, Send,
} from 'lucide-react'
import EnquiryModal from '../components/EnquiryModal'
import ProductLandingLayout from '../components/ProductLandingLayout'
import ProductCard from '../components/ProductCard'
import { fetchPublicProductBySlug, fetchPublicRelatedProducts } from '../services/catalogApi'
import { getCatalogProductBySlug, getCategoryConfig, getCategoryProducts, resolveCategorySlug } from '../data/catalog'
import { generateProductSlug, getProductBySlug } from '../data/productDetails'
import '../styles/ProductPage.css'

// ─── Safe JSON parse ───────────────────────────────────────────────────────
const safeJSON = (val, fallback = []) => {
  if (!val) return fallback
  if (typeof val === 'string') {
    try { return JSON.parse(val) } catch { return fallback }
  }
  return val
}

// ─── Rich text renderer for Directus what_it_is (text string) ─────────────
// Lines starting with • or -  → green rounded chip card
// Lines starting with *       → bold dark summary paragraph
// Regular lines               → plain <p>
const renderFormattedText = (text) => {
  if (!text) return null
  const paragraphs = text.split(/\n\n+/)

  const isBullet  = (l) => /^[•\-]\s/.test(l.trim()) || l.trim().startsWith('•')
  const isSummary = (l) => /^\*[^*]/.test(l.trim())

  return paragraphs.map((para, pIdx) => {
    const lines = para.split('\n').filter(Boolean)
    return (
      <div key={pIdx} className="prod-para-block">
        {lines.map((line, lIdx) => {
          if (isBullet(line)) {
            return (
              <div key={lIdx} className="prod-whatitis-chip">
                {line.replace(/^[•\-]\s*/, '')}
              </div>
            )
          }
          if (isSummary(line)) {
            return (
              <p key={lIdx} className="prod-whatitis-summary">
                {line.replace(/^\*\s*/, '')}
              </p>
            )
          }
          return (
            <p key={lIdx} className="prod-section-text">
              {line}
            </p>
          )
        })}
      </div>
    )
  })
}

// ─── Structured renderer for local whatItIs data ───────────────────────────
const renderLocalWhatItIs = (local) => {
  const hasContent = local.whatItIs || (local.whatItIsPoints && local.whatItIsPoints.length > 0)
  if (!hasContent) return null
  return (
    <div className="prod-para-block">
      {local.whatItIs && (
        <p className="prod-section-text">{local.whatItIs}</p>
      )}
      {local.whatItIsPoints && local.whatItIsPoints.length > 0 && (
        <div className="prod-whatitis-bullets">
          {local.whatItIsPoints.map((point, i) => (
            <div key={i} className="prod-whatitis-chip">{point}</div>
          ))}
        </div>
      )}
      {local.whatItIsSummary && (
        <p className="prod-whatitis-summary">{local.whatItIsSummary}</p>
      )}
    </div>
  )
}

// ─── Renderer for local dropdown sections ─────────────────────────────────
const renderLocalDropdownContent = (dropdown) => (
  <>
    {dropdown.sections?.map((section, sIdx) => (
      <div key={sIdx} className="prod-dropdown-subsection">
        {section.heading && (
          <p className="prod-dropdown-subheading">{section.heading}</p>
        )}
        {section.items?.length > 0 && (
          <ul className="prod-dropdown-list">
            {section.items.map((item, iIdx) => (
              <li key={iIdx}>{item}</li>
            ))}
          </ul>
        )}
      </div>
    ))}
    {dropdown.footer && (
      <p className="prod-dropdown-footer">{dropdown.footer}</p>
    )}
  </>
)

// ─── Accordion content renderer for Directus learn_more text ──────────────
const renderAccordionContent = (text) => {
  if (!text) return null
  const paragraphs = text.split(/\n\n+/)

  return paragraphs.map((para, pIdx) => {
    const lines = para.split('\n').map(l => l.trim()).filter(Boolean)
    if (lines.length === 0) return null

    const result = []

    const isSubheading = (i) => {
      const line = lines[i]
      const next = lines[i + 1]
      return !/^[•\-]/.test(line) && !/^\*/.test(line) && next && /^[•\-]/.test(next)
    }

    const lastLine = lines[lines.length - 1]
    const lastIsExplicitFooter = /^\*[^*]/.test(lastLine)
    const lastIsSentence = /[.!?]$/.test(lastLine.replace(/\s+$/, ''))
    const footerIndex = (lastIsExplicitFooter || lastIsSentence)
      ? lines.length - 1
      : -1

    let listBuf = []
    const flushBuf = (key) => {
      if (listBuf.length > 0) {
        result.push(
          <ul key={`ul-${key}`} className="prod-dropdown-list">
            {listBuf.map((item, j) => <li key={j}>{item}</li>)}
          </ul>
        )
        listBuf = []
      }
    }

    lines.forEach((line, i) => {
      if (i === footerIndex) {
        flushBuf(i)
        result.push(
          <p key={i} className="prod-dropdown-footer">
            {line.replace(/^\*\s*/, '')}
          </p>
        )
      } else if (isSubheading(i)) {
        flushBuf(i)
        result.push(<p key={i} className="prod-dropdown-subheading">{line}</p>)
      } else {
        listBuf.push(line.replace(/^[•\-]\s*/, ''))
      }
    })

    flushBuf('end')
    return <div key={pIdx} className="prod-accordion-block">{result}</div>
  })
}

const SHARED_TAB_CONTENT = {
  whatItIs:
    'This product supports balanced crop nutrition and stronger plant development through efficient nutrient availability and root-zone support.',
  whatItIsPoints: [
    'Improves nutrient use efficiency in the root zone',
    'Supports healthy root growth and better plant vigor',
    'Helps crops perform better under regular field stress',
  ],
  whatItIsSummary:
    'Consistent use improves crop growth quality, nutrient uptake, and overall field performance.',
  primaryUse:
    'Supports complete crop nutrition and stronger growth through better soil-plant nutrient interaction.',
  keyBenefits: [
    'Promotes stronger early growth and improved plant establishment',
    'Enhances nutrient uptake efficiency and crop response',
    'Supports better flowering, fruiting, and yield quality',
    'Improves root activity and overall field performance',
    'Helps build long-term soil productivity with sustainable nutrition',
  ],
  whenToUse: [
    'Use during early growth stages',
    'Apply before or at transplanting stage',
    'Use during vegetative growth and crop development',
    'Repeat as per crop cycle and field condition',
  ],
  crops: [
    'Cereals & millets',
    'Fruits & vegetables',
    'Flowers & ornamentals',
    'Sugarcane',
    'Plantation and field crops',
  ],
  applicationDosage: [
    {
      method: 'Soil Application',
      steps: [
        'Apply with well-decomposed organic manure',
        'Distribute evenly near root zone on moist soil',
      ],
    },
    {
      method: 'Drenching / Foliar (As required)',
      steps: [
        'Prepare solution as per recommended dose',
        'Apply during cool hours for better absorption',
      ],
    },
  ],
  dropdowns: [
    {
      title: 'Nutrient Deficiency Can Lead To',
      sections: [
        {
          items: [
            'Weak growth and low plant vigor',
            'Poor root establishment',
            'Reduced flowering and fruit set',
            'Lower yield and quality output',
          ],
        },
      ],
      footer: 'Balanced nutrient support is essential for consistent crop performance.',
    },
    {
      title: 'Why Field Performance Drops',
      sections: [
        {
          items: [
            'Nutrients remain unavailable in soil form',
            'Imbalanced fertilizer practices',
            'Low organic matter and microbial activity',
            'Nutrient losses through leaching and fixation',
          ],
        },
      ],
      footer: 'Even with fertilizer use, crops may not get balanced available nutrition.',
    },
    {
      title: 'How This Product Helps',
      sections: [
        {
          items: [
            'Improves nutrient availability near root zone',
            'Supports stronger roots and active growth',
            'Improves fertilizer use efficiency',
            'Supports better yield and produce quality',
          ],
        },
      ],
      footer: 'Suitable for a wide range of crops under regular farming conditions.',
    },
  ],
}

function createFallbackProduct(slug, localProduct, catalogProduct) {
  if (!localProduct && !catalogProduct) {
    return null
  }

  const categorySlug = resolveCategorySlug(localProduct?.categorySlug || catalogProduct?.categorySlug || '')
  const category = getCategoryConfig(categorySlug)
  const titleFromSlug = String(slug || '')
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

  return {
    id: slug,
    slug,
    name: localProduct?.name || catalogProduct?.name || titleFromSlug || 'Product',
    subtitle: localProduct?.subtitle || '',
    short_description:
      localProduct?.primaryUse ||
      catalogProduct?.shortDescription ||
      category?.description ||
      'Detailed product information is available on enquiry.',
    product_image: null,
    image: catalogProduct?.image || null,
    form: localProduct?.form || '',
    category: {
      id: '',
      slug: categorySlug,
      name: localProduct?.categoryTitle || catalogProduct?.categoryTitle || category?.title || '',
    },
    contents: [],
    key_benefits: [],
    available_sizes: [],
    when_to_use: [],
    recommended_crops: [],
    application_dosage: [],
    learn_more: [],
    what_it_is: '',
  }
}

function createLocalRelatedProducts(categorySlug, currentSlug) {
  if (!categorySlug) {
    return []
  }

  return getCategoryProducts(categorySlug)
    .filter((item) => generateProductSlug(item.slug || item.name) !== currentSlug)
    .slice(0, 4)
    .map((item) => ({
      id: item.name,
      name: item.name,
      slug: generateProductSlug(item.slug || item.name),
      image: item.image,
      product_image: null,
      category: {
        id: '',
        slug: item.categorySlug,
        name: item.categoryTitle,
      },
    }))
}

// ══════════════════════════════════════════════════════════════════════════
const ProductPage = () => {
  const { slug } = useParams()
  const [product, setProduct]               = useState(null)
  const [localProduct, setLocalProduct]     = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading]               = useState(true)
  const [activeTab, setActiveTab]           = useState('overview')
  const [openDropdowns, setOpenDropdowns]   = useState({})
  const [showEnquiry, setShowEnquiry]       = useState(false)

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true)

      try {
        const local = getProductBySlug(slug)
        const catalog = getCatalogProductBySlug(slug)

        let prod = null

        try {
          prod = await fetchPublicProductBySlug(slug)
        } catch (error) {
          console.error('Error loading product from backend:', error)
        }

        const fallback = createFallbackProduct(slug, local, catalog)
        const resolvedProduct = prod || fallback

        setProduct(resolvedProduct)
        setLocalProduct(local)

        if (prod?.category?.slug) {
          const related = await fetchPublicRelatedProducts(prod.category.slug, slug)
          setRelatedProducts(related || [])
          return
        }

        const fallbackCategorySlug = resolveCategorySlug(
          resolvedProduct?.category?.slug || local?.categorySlug || catalog?.categorySlug || ''
        )

        setRelatedProducts(createLocalRelatedProducts(fallbackCategorySlug, slug))
      } catch (error) {
        console.error('Error preparing product page:', error)
      } finally {
        setLoading(false)
      }
    }
    loadProduct()
  }, [slug])

  const toggleDropdown = (index) =>
    setOpenDropdowns((prev) => ({ ...prev, [index]: !prev[index] }))

  // ── Loading ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <ProductLandingLayout>
        <div className="prod-not-found"><h2>Loading...</h2></div>
      </ProductLandingLayout>
    )
  }

  // ── Not Found ────────────────────────────────────────────────────────
  if (!product) {
    return (
      <ProductLandingLayout>
        <div className="prod-not-found">
          <h2>Product not found</h2>
          <p>The product you're looking for doesn't exist or details are coming soon.</p>
          <Link to="/" className="prod-back-link">Back to Home</Link>
        </div>
      </ProductLandingLayout>
    )
  }

  // ── Parse Directus JSON fields ───────────────────────────────────────
  const cmsContents          = safeJSON(product.contents, [])
  const cmsKeyBenefits       = safeJSON(product.key_benefits, [])
  const cmsAvailableSizes    = safeJSON(product.available_sizes, [])
  const cmsWhenToUse         = safeJSON(product.when_to_use, [])
  const cmsRecommendedCrops  = safeJSON(product.recommended_crops, [])
  const cmsApplicationDosage = safeJSON(product.application_dosage, [])
  const cmsLearnMore         = safeJSON(product.learn_more, [])

  // ── Prefer local data over CMS for content fields ────────────────────
  const effectiveWhatItIs          = localProduct?.whatItIs || product.what_it_is || SHARED_TAB_CONTENT.whatItIs
  const effectiveWhatItIsPoints    = localProduct?.whatItIsPoints?.length > 0
    ? localProduct.whatItIsPoints
    : SHARED_TAB_CONTENT.whatItIsPoints
  const effectiveWhatItIsSummary   = localProduct?.whatItIsSummary || SHARED_TAB_CONTENT.whatItIsSummary
  const effectivePrimaryUse        = localProduct?.primaryUse || product.short_description || SHARED_TAB_CONTENT.primaryUse
  const effectiveKeyBenefits       = localProduct?.keyBenefits?.length > 0
    ? localProduct.keyBenefits
    : (cmsKeyBenefits.length > 0 ? cmsKeyBenefits : SHARED_TAB_CONTENT.keyBenefits)
  const effectiveWhenToUse         = localProduct?.whenToUse?.length > 0
    ? localProduct.whenToUse
    : (cmsWhenToUse.length > 0 ? cmsWhenToUse : SHARED_TAB_CONTENT.whenToUse)
  const effectiveCrops             = localProduct?.crops?.length > 0
    ? localProduct.crops
    : (cmsRecommendedCrops.length > 0 ? cmsRecommendedCrops : SHARED_TAB_CONTENT.crops)
  const effectiveApplicationDosage = localProduct?.applicationDosage?.length > 0
    ? localProduct.applicationDosage
    : (cmsApplicationDosage.length > 0 ? cmsApplicationDosage : SHARED_TAB_CONTENT.applicationDosage)
  const effectiveAvailableSizes    = localProduct?.availability?.length      > 0 ? localProduct.availability      : cmsAvailableSizes
  const effectiveForm              = localProduct?.form || product.form
  const effectiveDropdowns         = localProduct?.dropdowns?.length > 0
    ? localProduct.dropdowns
    : (cmsLearnMore.length > 0 ? null : SHARED_TAB_CONTENT.dropdowns)
  const hasLearnMoreContent        = Boolean(effectiveDropdowns) || cmsLearnMore.length > 0

  // ── Composition source ───────────────────────────────────────────────
  const localComposition = localProduct?.composition
  const effectiveContents = localComposition?.rows?.length > 0
    ? localComposition.rows.map(([parameter, specification]) => ({ parameter, specification }))
    : cmsContents

  const categorySlug = resolveCategorySlug(
    product.category?.slug || product.category?.name || localProduct?.categorySlug || ''
  )
  const localCategory = getCategoryConfig(categorySlug)
  const categoryName = product.category?.name || localCategory?.title || localProduct?.categoryTitle || ''
  const productImage = product.image || product.imageUrl || null
  const bannerImage = localCategory?.banner || productImage

  const mapRelated = (p) => ({
    ...p,
    image: p.image || null,
    categorySlug,
    categoryTitle: categoryName,
  })

  return (
    <ProductLandingLayout>

      {/* ── BANNER ─────────────────────────────────────────────────── */}
      <div className="prod-banner">
        {bannerImage && (
          <img
            src={bannerImage}
            alt={categoryName || product.name}
            className="prod-banner-img"
            loading="eager"
          />
        )}
        <div className="prod-banner-overlay">
          <div className="prod-banner-content">
            <nav className="prod-banner-breadcrumb">
              <Link to="/">Home</Link>
              <ChevronRight size={14} />
              <Link to={`/category/${categorySlug}`}>{categoryName}</Link>
              <ChevronRight size={14} />
              <span>{product.name}</span>
            </nav>
            <h1 className="prod-banner-title">{product.name}</h1>
            {product.subtitle && (
              <p className="prod-banner-subtitle">{product.subtitle}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── PRODUCT HERO ───────────────────────────────────────────── */}
      <section className="prod-hero">
        <div className="prod-container">
          <div className="prod-hero-grid">

            {/* Image */}
            <div className="prod-image-col">
              <div className="prod-image-card">
                {productImage ? (
                  <img src={productImage} alt={product.name} loading="lazy" />
                ) : (
                  <div className="prod-image-placeholder"><Sprout size={64} /></div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="prod-info-col">
              {categoryName && (
                <span className="prod-category-badge">{categoryName}</span>
              )}

              <h2 className="prod-title">
                {product.name}
                {product.subtitle && (
                  <span className="prod-subtitle"> {product.subtitle}</span>
                )}
              </h2>

              {product.short_description && (
                <div className="prod-usp">
                  <FlaskConical size={18} />
                  <p>{product.short_description}</p>
                </div>
              )}

              {/* Composition / Contents table */}
              {effectiveContents.length > 0 && (
                <div className="prod-composition">
                  <h3 className="prod-composition-title">
                    {localComposition?.title || 'Contents'}
                  </h3>
                  <table className="prod-composition-table">
                    <thead>
                      <tr>
                        <th>{localComposition?.columns?.[0] || 'Parameter'}</th>
                        <th>{localComposition?.columns?.[1] || 'Specification'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {effectiveContents.map((row, i) => (
                        <tr key={i}>
                          <td>{row.parameter}</td>
                          <td>{row.specification || row.quantity || ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {localComposition?.note && (
                    <p className="prod-composition-note">{localComposition.note}</p>
                  )}
                </div>
              )}

              {/* Available sizes */}
              {effectiveAvailableSizes.length > 0 && (
                <div className="prod-availability">
                  <Package size={16} />
                  <span className="prod-availability-label">Available in:</span>
                  <div className="prod-availability-tags">
                    {effectiveAvailableSizes.map((size, i) => (
                      <span key={i} className="prod-size-tag">{size}</span>
                    ))}
                  </div>
                </div>
              )}

              {effectiveForm && (
                <p className="prod-form"><strong>Form:</strong> {effectiveForm}</p>
              )}

              <button className="prod-enquiry-btn" onClick={() => setShowEnquiry(true)}>
                <Send size={16} /> Send Enquiry
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── TABS ───────────────────────────────────────────────────── */}
      <section className="prod-tabs-section">
        <div className="prod-container">

          <div className="prod-tabs-header">
            <button
              className={`prod-tab-btn ${activeTab === 'overview' ? 'prod-tab-active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <Leaf size={16} /> Overview
            </button>
            <button
              className={`prod-tab-btn ${activeTab === 'usage' ? 'prod-tab-active' : ''}`}
              onClick={() => setActiveTab('usage')}
            >
              <Droplets size={16} /> How to Use
            </button>
            <button
              className={`prod-tab-btn ${activeTab === 'learnmore' ? 'prod-tab-active' : ''}`}
              onClick={() => setActiveTab('learnmore')}
            >
              <ChevronDown size={16} /> Learn More
            </button>
          </div>

          <div className="prod-tab-content">

            {/* ══ OVERVIEW ══════════════════════════════════════════ */}
            {activeTab === 'overview' && (
              <div className="prod-tab-panel">

                {/* What It Is — local structured data takes priority */}
                <div className="prod-section">
                  <h3 className="prod-section-title">What It Is &amp; How It Works</h3>
                  {localProduct?.whatItIs || localProduct?.whatItIsPoints?.length > 0 ? (
                    renderLocalWhatItIs(localProduct)
                  ) : product.what_it_is ? (
                    renderFormattedText(product.what_it_is)
                  ) : (
                    renderLocalWhatItIs({
                      whatItIs: effectiveWhatItIs,
                      whatItIsPoints: effectiveWhatItIsPoints,
                      whatItIsSummary: effectiveWhatItIsSummary,
                    })
                  )}
                </div>

                {/* Primary Use (local only) */}
                {effectivePrimaryUse && (
                  <div className="prod-section">
                    <div className="prod-usp">
                      <FlaskConical size={18} />
                      <p>{effectivePrimaryUse}</p>
                    </div>
                  </div>
                )}

                {/* Key Benefits */}
                {effectiveKeyBenefits.length > 0 && (
                  <div className="prod-section">
                    <h3 className="prod-section-title">Key Benefits</h3>
                    <ol className="prod-benefits-list">
                      {effectiveKeyBenefits.map((benefit, i) => (
                        <li key={i}>
                          <span className="prod-benefit-number">{i + 1}</span>
                          <span>{typeof benefit === 'string' ? benefit : benefit.benefit || ''}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            )}

            {/* ══ HOW TO USE ════════════════════════════════════════ */}
            {activeTab === 'usage' && (
              <div className="prod-tab-panel">
                <div className="prod-usage-grid">

                  {/* When to Use */}
                  {effectiveWhenToUse.length > 0 && (
                    <div className="prod-section">
                      <h3 className="prod-section-title">When to Use</h3>
                      <ul className="prod-section-list">
                        {effectiveWhenToUse.map((item, i) => (
                          <li key={i}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommended Crops */}
                  {effectiveCrops.length > 0 && (
                    <div className="prod-section">
                      <h3 className="prod-section-title">Recommended Crops</h3>
                      <div className="prod-crop-tags">
                        {effectiveCrops.map((crop, i) => (
                          <span key={i} className="prod-crop-tag">
                            {typeof crop === 'string' ? crop : JSON.stringify(crop)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Application & Dosage */}
                {effectiveApplicationDosage.length > 0 && (
                  <div className="prod-section">
                    <h3 className="prod-section-title">Application &amp; Dosage</h3>
                    <div className="prod-dosage-grid">
                      {effectiveApplicationDosage.map((item, i) => (
                        <div key={i} className="prod-dosage-card">
                          {item.method && (
                            <h4 className="prod-dosage-method">{item.method}</h4>
                          )}
                          {Array.isArray(item.steps) && item.steps.length > 0 && (
                            <ul className="prod-dosage-steps">
                              {item.steps.map((step, j) => (
                                <li key={j}>{step}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ══ LEARN MORE ════════════════════════════════════════ */}
            {activeTab === 'learnmore' && (
              <div className="prod-tab-panel">
                {hasLearnMoreContent && effectiveDropdowns ? (
                  <div className="prod-dropdowns compact">
                    {effectiveDropdowns.map((dropdown, index) => (
                      <div
                        key={index}
                        className={`prod-dropdown ${openDropdowns[index] ? 'prod-dropdown-open' : ''}`}
                      >
                        <button
                          className="prod-dropdown-trigger"
                          onClick={() => toggleDropdown(index)}
                        >
                          <span className="prod-dropdown-title">{dropdown.title}</span>
                          <ChevronDown size={20} className="prod-dropdown-icon" />
                        </button>
                        <div className="prod-dropdown-body">
                          <div className="prod-dropdown-inner">
                            {renderLocalDropdownContent(dropdown)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : hasLearnMoreContent && cmsLearnMore.length > 0 ? (
                  <div className="prod-dropdowns compact">
                    {cmsLearnMore.map((section, index) => (
                      <div
                        key={index}
                        className={`prod-dropdown ${openDropdowns[index] ? 'prod-dropdown-open' : ''}`}
                      >
                        <button
                          className="prod-dropdown-trigger"
                          onClick={() => toggleDropdown(index)}
                        >
                          <span className="prod-dropdown-title">{section.title}</span>
                          <ChevronDown size={20} className="prod-dropdown-icon" />
                        </button>
                        <div className="prod-dropdown-body">
                          <div className="prod-dropdown-inner">
                            {renderAccordionContent(section.content || section.body || '')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="prod-section">
                    <h3 className="prod-section-title">Learn More</h3>
                    <p className="prod-section-text">Detailed educational content is being updated for this product.</p>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </section>

      {/* ── RELATED PRODUCTS ───────────────────────────────────────── */}
      {relatedProducts.length > 0 && (
        <section className="prod-related-section">
          <div className="prod-container">
            <h2 className="prod-related-heading">Related Products</h2>
            <div className="prod-related-grid">
              {relatedProducts.map((rp) => (
                <ProductCard key={rp.id || rp.slug || rp.name} product={mapRelated(rp)} />
              ))}
            </div>
          </div>
        </section>
      )}

      <EnquiryModal
        isOpen={showEnquiry}
        onClose={() => setShowEnquiry(false)}
        productName={product.name}
        categorySlug={categorySlug}
      />
    </ProductLandingLayout>
  )
}

export default ProductPage

