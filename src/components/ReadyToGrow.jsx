import React from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'
import '../styles/ReadyToGrow.css'

const ReadyToGrow = () => {
  const benefits = [
    'Exclusive product catalogues available on request',
    'Competitive bulk & trade pricing for B2B partners',
    'Customised crop-specific solutions & field support',
    'Dedicated account manager for every partner',
    'Fast response — within 1 business day',
  ]

  return (
    <section className="ready-to-grow">
      {/* Background Image */}
      <div className="ready-to-grow-bg">
        <img 
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=75" 
          alt="Farm field"
          loading="lazy"
        />
        <div className="ready-to-grow-overlay"></div>
      </div>

      {/* Floating Elements */}
      <div className="ready-to-grow-floats">
        <div className="float-circle float-1"></div>
        <div className="float-circle float-2"></div>
        <div className="float-circle float-3"></div>
      </div>

      <div className="ready-to-grow-container">
        <div className="ready-to-grow-grid">
          {/* Left Content */}
          <div className="ready-to-grow-content">
            <div className="ready-to-grow-badge">
              <Sparkles size={14} />
              <span>PARTNER WITH US</span>
            </div>
            
            <h2 className="ready-to-grow-title">
              Ready to grow
              <br />
              with <span className="highlight">Soil+ Organics</span>?
            </h2>

            <p className="ready-to-grow-description">
              Join our growing network of distributors, retailers, and agri-input suppliers across India. We offer end-to-end partner support — from onboarding to field-level assistance.
            </p>

            {/* Trust Indicators */}
            <div className="ready-to-grow-trust">
              <div className="trust-item">
                <span className="trust-value">1000+</span>
                <span className="trust-label">Active Partners</span>
              </div>
              <div className="trust-divider"></div>
              <div className="trust-item">
                <span className="trust-value">50+</span>
                <span className="trust-label">Products</span>
              </div>
              <div className="trust-divider"></div>
              <div className="trust-item">
                <span className="trust-value">Pan India</span>
                <span className="trust-label">Network</span>
              </div>
            </div>
          </div>

          {/* Right Card */}
          <div className="ready-to-grow-card">
            <div className="ready-to-grow-card-glow"></div>
            
            <div className="ready-to-grow-card-content">
              <ul className="ready-to-grow-benefits">
                {benefits.map((benefit, index) => (
                  <li 
                    key={index} 
                    className="ready-to-grow-benefit"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <span className="benefit-dot"></span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              
              <button className="ready-to-grow-btn">
                <span>Send an Enquiry</span>
                <ArrowRight size={18} />
              </button>
              
              <p className="ready-to-grow-privacy">
                We respect your privacy. No spam, ever.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ReadyToGrow