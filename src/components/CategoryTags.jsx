import React from 'react'
import '../styles/CategoryTags.css'

const CategoryTags = () => {
  const categories = [
    { name: 'Bio Fertilizers', active: true },
    { name: 'Bio Stimulants', active: false },
    { name: 'Organic Fertilizers', active: false },
    { name: 'Organic Manure', active: false },
    { name: 'Soil Conditioners', active: false },
    { name: 'Chelated Micronutrients', active: false },
    { name: 'Water Soluble Fertilizers (WSF)', active: false },
    { name: 'Growing Media', active: false },
  ]

  return (
    <section className="category-tags">
      <div className="category-tags-container">
        <div className="category-tags-scroll">
          {categories.map((category, index) => (
            <button
              key={index}
              className={`category-tag ${category.active ? 'active' : 'inactive'}`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CategoryTags
