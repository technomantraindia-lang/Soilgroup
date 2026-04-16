import React from 'react'
import { ArrowRight, CheckCircle, Leaf, Target, Award, Users } from 'lucide-react'
import aboutImg from '../assets/ABOUT SOIL+ ORGANICS.avif'
import '../styles/AdvancingFarming.css'

const AdvancingFarming = () => {
  const benefits = [
    'From backyard garden to commercial cultivation',
    'Tested formulas | pure & effective ingredients',
    'Bio-organics are clean, sludge-free inputs',
    'Proven on farmland, continually verified and refined',
  ]

  const stats = [
    { icon: <Users size={24} />, value: '10K+', label: 'Farmers Trust Us' },
    { icon: <Leaf size={24} />, value: '50+', label: 'Products' },
    { icon: <Award size={24} />, value: '15+', label: 'Years Experience' },
  ]

  return (
    <section id="brand-story" className="advancing-farming">
      <div className="advancing-farming-container">
        <div className="advancing-farming-grid">
          {/* Left Side - Image */}
          <div className="advancing-farming-image-wrapper">
            <div className="advancing-farming-image-container">
              <img 
                src={aboutImg}
                alt="Organic farming"
                className="advancing-farming-main-image"
                loading="lazy"
              />
              
              {/* Overlay Gradient */}
              <div className="advancing-farming-image-overlay"></div>
              
              {/* Experience Badge */}
              <div className="advancing-farming-experience-badge">
                <span className="experience-years">15+</span>
                <span className="experience-text">Years of<br />Excellence</span>
              </div>
            </div>
            
            {/* Stats Row */}
            <div className="advancing-farming-stats">
              {stats.map((stat, index) => (
                <div key={index} className="advancing-stat-item">
                  <div className="advancing-stat-icon">{stat.icon}</div>
                  <div className="advancing-stat-content">
                    <span className="advancing-stat-value">{stat.value}</span>
                    <span className="advancing-stat-label">{stat.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Content */}
          <div className="advancing-farming-content">
            <div className="advancing-farming-label">
              <span className="label-line"></span>
              <span>ABOUT SOIL+ ORGANICS</span>
            </div>
            
            <h2 className="advancing-farming-title">
              Rooted in science,
              <br />
              <span className="highlight">grown with purpose.</span>
            </h2>
            
            <p className="advancing-farming-description">
              Soil+ Organics is focused on building a true organic farming legacy. 
              Hand-crafted products that nourish the land without compromise. Our 
              science-driven formulas are designed to solve real farmer challenges, 
              including pests, soil problems, weather and inconsistency.
            </p>
            
            <p id="vision-mission" className="advancing-farming-description secondary">
              This path continues a tradition from our founder, and reflects his 
              passion for quality products in order to help millions of farmers, hobbyists, and 
              smaller home growers by making farming simple.
            </p>

            <div className="advancing-farming-benefits">
              {benefits.map((benefit, index) => (
                <div 
                  key={index} 
                  className="advancing-benefit-item"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CheckCircle className="benefit-icon" size={22} />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            <a href="#" className="advancing-farming-btn">
              Learn More About Us
              <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AdvancingFarming
