import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import imgBioFertilizer from '../assets/ProductCategories/bio-fertilizer.png'
import imgBioStimulants from '../assets/ProductCategories/Bio Stimulants & Boosters.jpg'
import imgSoilConditioners from '../assets/ProductCategories/Soil Conditioners.jpg'
import imgOrganicFertilizers from '../assets/ProductCategories/Organic Fertilizers.webp'
import imgOrganicManure from '../assets/ProductCategories/Organic Manure.jpg'
import imgBoostPlantGrowth from '../assets/ProductCategories/Boost Plant Growth.jpg'
import imgImproveFlowering from '../assets/Solutionbased/Improve Flowering & Fruiting.jpg'
import imgStartYourGarden from '../assets/Solutionbased/Start Your Garden.jpg'
import { fetchPublicCategories } from '../services/catalogApi'
import '../styles/ProductCategories.css'

// Static cards keep their visual copy and fallback counts here.
// Live product counts are fetched from the backend catalog API when available.
const CATEGORIES = [
  {
    title: 'Bio Fertilizers',
    slug: 'bio-fertilizers',
    description: 'Living microorganisms that improve nutrient availability, root activity, and overall crop resilience naturally.',
    image: imgBioFertilizer,
    localCount: 19,
    tags: ['N Fixers', 'P Solubilizers', 'K Mobilizers'],
    isPopular: true,
  },
  {
    title: 'Bio Stimulants',
    slug: 'bio-stimulants',
    description: 'Growth activators that improve vigour, stress tolerance, and crop quality, including Potassium Phosphite solutions.',
    image: imgBioStimulants,
    localCount: 9,
    tags: ['Amino', 'Seaweed', 'Phosphite'],
    isPopular: true,
  },
  {
    title: 'Organic Fertilizers',
    slug: 'organic-fertilizers',
    description: 'Balanced organic nutrition for vegetative growth, flowering, and yield quality with better soil health over time.',
    image: imgOrganicFertilizers,
    localCount: 6,
    tags: ['NPK', 'Bone Meal', 'Crop Nutrition'],
    isPopular: false,
  },
  {
    title: 'Organic Manure',
    slug: 'organic-manure',
    description: 'Rich, decomposed organic matter that improves soil texture, fertility, microbial life, and moisture retention.',
    image: imgOrganicManure,
    localCount: 6,
    tags: ['Compost', 'Soil Life', 'Organic Carbon'],
    isPopular: false,
  },
  {
    title: 'Soil Conditioners',
    slug: 'soil-conditioners',
    description: 'Conditioners that restore soil structure and nutrient efficiency, including Potassium Humate for root-zone support.',
    image: imgSoilConditioners,
    localCount: 14,
    tags: ['Humates', 'Gypsum', 'Soil Structure'],
    isPopular: true,
  },
  {
    title: 'Chelated Micronutrients',
    slug: 'chelated-micronutrients',
    description: 'Targeted micronutrient correction to prevent deficiency symptoms and improve flowering, fruit quality, and uniform growth.',
    image: imgImproveFlowering,
    localCount: null,
    tags: ['Zn', 'Fe', 'Micronutrients'],
    isPopular: false,
  },
  {
    title: 'Water Soluble Fertilizers (WSF)',
    slug: 'water-soluble-fertilizers',
    description: 'Fast-acting soluble nutrition for foliar spray and fertigation to support rapid growth and critical crop stages.',
    image: imgBoostPlantGrowth,
    localCount: null,
    tags: ['Fertigation', 'Foliar', 'Quick Uptake'],
    isPopular: false,
  },
  {
    title: 'Growing Media',
    slug: 'growing-media',
    description: 'Clean and stable media blends designed for seedling establishment, kitchen gardens, nurseries, and protected cultivation.',
    image: imgStartYourGarden,
    localCount: 0,
    tags: ['Nursery', 'Garden Start', 'Root Zone'],
    isPopular: false,
  },
]

const ProductCategories = () => {
  const [counts, setCounts] = useState({})

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const categories = await fetchPublicCategories()
        const countMap = {}

        categories.forEach((category) => {
          countMap[category.slug] = Number(category.productCount || 0)
        })

        setCounts(countMap)
      } catch {
        setCounts({})
      }
    }

    fetchCounts()
  }, [])

  const getBadge = (category) => {
    const count = counts[category.slug] ?? category.localCount ?? 0
    // dynamic — from Directus
    if (count === 0) return { label: 'Coming Soon', type: 'coming-soon' }
    return { label: `${count}+ Products`, type: 'count' }
  }

  return (
    <section id="product-categories" className="product-categories">
      <div className="product-categories-container">
        <div className="product-categories-header">
          <div className="product-categories-badge">
            <span className="badge-dot"></span>
            PRODUCT RANGE
          </div>
          <h2 className="product-categories-title">
            Our Product <span className="highlight">Categories</span>
          </h2>
          <p className="product-categories-subtitle">
            Discover our complete category range built for soil health, plant performance, and sustainable farming growth.
          </p>
        </div>

        <div className="product-categories-grid">
          {CATEGORIES.map((category, index) => {
            const badge = getBadge(category)
            return (
              <div
                key={index}
                className="category-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="category-card-header">
                  <div className="category-card-badges">
                    <span className={badge.type === 'coming-soon' ? 'coming-soon-badge' : 'product-count-badge'}>
                      {badge.label}
                    </span>
                    {category.isPopular && <span className="popular-badge">POPULAR</span>}
                  </div>
                  <div className="category-card-image">
                    <img src={category.image} alt={category.title} loading="lazy" />
                  </div>
                </div>

                <div className="category-card-content">
                  <h3 className="category-card-title">{category.title}</h3>
                  <p className="category-card-description">{category.description}</p>

                  <div className="category-card-tags">
                    {category.tags.map((tag, tagIndex) => (
                      <span key={tagIndex} className="category-tag">{tag}</span>
                    ))}
                  </div>

                  <Link to={`/category/${category.slug}`} className="category-card-link">
                    View More <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default ProductCategories
