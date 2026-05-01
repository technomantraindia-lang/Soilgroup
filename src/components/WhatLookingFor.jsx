import React from 'react'
import { Link } from 'react-router-dom'
import imgBoostPlantGrowth from '../assets/Solutionbased/Boost Plant Growth.jpg'
import imgImproveFlowering from '../assets/Solutionbased/Improve Flowering & Fruiting.jpg'
import imgImproveSoilHealth from '../assets/Solutionbased/Improve Soil Health.webp'
import imgProtectPlants from '../assets/Solutionbased/Protect Plants.avif'
import imgStartYourGarden from '../assets/Solutionbased/Start Your Garden.jpg'
import imgStrengthenRoots from '../assets/Solutionbased/Strengthen Roots.jpeg'
import '../styles/WhatLookingFor.css'

const tagToSlug = {
  'Bio Fertilizers': '/category/bio-fertilizers',
  'Organic Fertilizers': '/category/organic-fertilizers',
  'Organic Manure': '/category/organic-manure',
  'Soil Conditioners': '/category/soil-conditioners',
  'Bio Stimulants': '/category/bio-stimulants',
  'Water Soluble Fertilizers (WSF)': '/category/water-soluble-fertilizers',
  'Chelated Micronutrients': '/category/chelated-micronutrients',
  'Growing Media': '/category/growing-media',
}

const WhatLookingFor = () => {
  const solutions = [
    {
      number: '01',
      title: 'Improve Soil Health',
      description: 'Rebuild soil structure, microbial life and long-term fertility for thriving crops.',
      image: imgImproveSoilHealth,
      tags: ['Soil Conditioners', 'Organic Fertilizers', 'Organic Manure', 'Bio Fertilizers'],
    },
    {
      number: '02',
      title: 'Boost Plant Growth',
      description: 'Accelerate vegetative growth and improve overall plant health and vigour.',
      image: imgBoostPlantGrowth,
      tags: ['Bio Stimulants', 'Water Soluble Fertilizers (WSF)', 'Chelated Micronutrients'],
    },
    {
      number: '03',
      title: 'Strengthen Roots',
      description: 'Build deep, resilient root systems that anchor plants and boost nutrient uptake.',
      image: imgStrengthenRoots,
      tags: ['Bio Stimulants', 'Water Soluble Fertilizers (WSF)', 'Soil Conditioners'],
    },
    {
      number: '04',
      title: 'Protect & Strengthen Plants',
      description: 'Support crop resilience biologically with Bio Fertilizers and Bio Stimulants (including Potassium Phosphite).',
      image: imgProtectPlants,
      tags: ['Bio Fertilizers', 'Bio Stimulants'],
    },
    {
      number: '05',
      title: 'Improve Flowering & Fruiting',
      description: 'Enhance bloom quality, fruit set, and yield through targeted nutrition and bio-active support.',
      image: imgImproveFlowering,
      tags: ['Water Soluble Fertilizers (WSF)', 'Chelated Micronutrients', 'Bio Stimulants'],
    },
    {
      number: '06',
      title: 'Start Your Garden',
      description: 'Everything a new garden needs - from the right growing media to enriched organic nutrition.',
      image: imgStartYourGarden,
      tags: ['Growing Media', 'Organic Manure', 'Organic Fertilizers'],
    },
  ]

  return (
    <section id="shop-by-goal" className="what-looking-for">
      <div className="what-looking-for-container">
        <div className="what-looking-for-header">
          <h2 className="what-looking-for-title">
            Choose your <span className="highlight">Goal</span>
          </h2>
          <p className="what-looking-for-subtitle">
            Find the exact Soil+ Organics product range mapped to your specific farming or gardening challenge.
          </p>
        </div>

        <div className="what-looking-for-grid">
          {solutions.map((solution, index) => (
            <div
              key={index}
              className="solution-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="solution-card-image">
                <img src={solution.image} alt={solution.title} loading="lazy" decoding="async" />
                <div className="solution-card-overlay"></div>
                <div className="solution-card-number">{solution.number}</div>
              </div>

              <div className="solution-card-content">
                <h3 className="solution-card-title">{solution.title}</h3>
                <p className="solution-card-description">{solution.description}</p>

                <div className="solution-card-tags">
                  {solution.tags.map((tag, tagIndex) => (
                    <Link
                      key={tagIndex}
                      to={tagToSlug[tag] || '/'}
                      className="solution-tag"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default WhatLookingFor
