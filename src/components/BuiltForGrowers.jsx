import React from 'react'
import { FlaskConical, Smile, Scale, Leaf, Sparkles } from 'lucide-react'
import '../styles/BuiltForGrowers.css'

const BuiltForGrowers = () => {
  const features = [
    {
      icon: <FlaskConical size={32} />,
      title: 'Research-Backed',
      description: 'Every formula backed by scientific research and extensive field testing across diverse agricultural conditions.',
    },
    {
      icon: <Smile size={32} />,
      title: 'Easy to Use',
      description: 'Designed for hassle-free application. Clear instructions and ready-to-use products make farming simple for everyone.',
    },
    {
      icon: <Scale size={32} />,
      title: 'For Every Scale',
      description: 'From home gardens to large farms, our products are formulated to deliver results at any scale with consistent quality.',
    },
    {
      icon: <Leaf size={32} />,
      title: '100% Chemical Free',
      description: 'All our products are completely free from harmful chemicals — safe for soil, crops, farmers, and the environment.',
    },
  ]

  return (
    <section id="why-choose-us" className="built-for-growers">
      {/* Background Pattern */}
      <div className="built-for-growers-pattern"></div>
      
      <div className="built-for-growers-container">
        {/* Header */}
        <div className="built-for-growers-header">
          <div className="built-for-growers-badge">
            <Sparkles size={14} />
            <span>WHY SOIL+ ORGANICS</span>
            <Sparkles size={14} />
          </div>
          <h2 className="built-for-growers-title">
            Farming solutions that are <span className="highlight">good for the earth</span>
          </h2>
          <p className="built-for-growers-subtitle">
            We build organic inputs that work in harmony with nature — improving yields today while protecting soil, water, and ecosystems for generations ahead.
          </p>
        </div>

        {/* Features Grid */}
        <div className="built-for-growers-grid">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="grower-feature-card"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="grower-feature-icon-wrapper">
                <div className="grower-feature-icon">
                  {feature.icon}
                </div>
                <div className="grower-feature-icon-ring"></div>
              </div>
              <h3 className="grower-feature-title">{feature.title}</h3>
              <p className="grower-feature-description">{feature.description}</p>
              
              {/* Hover Indicator */}
              <div className="grower-feature-indicator">
                <span></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default BuiltForGrowers
