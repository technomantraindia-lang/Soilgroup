import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react'
import '../styles/Testimonials.css'

const Testimonials = () => {
  const [current, setCurrent] = useState(0)

  const testimonials = [
    {
      name: 'Rajesh Patel',
      role: 'Commercial Farmer',
      location: 'Gujarat',
      rating: 5,
      text: 'Soil+ Organics has completely transformed my farm. After using their Bio NPK and Soil Conditioners, my yield increased by almost 40% within a single season. Highly recommended for any serious farmer.',
      initials: 'RP',
    },
    {
      name: 'Sunita Sharma',
      role: 'Organic Farm Owner',
      location: 'Maharashtra',
      rating: 5,
      text: 'I was skeptical at first, but the results speak for themselves. My crops are healthier, pests are under control, and I no longer rely on chemical inputs. Soil+ Organics has made organic farming truly simple.',
      initials: 'SS',
    },
    {
      name: 'Anil Kumar',
      role: 'Distributor & Agri Retailer',
      location: 'Punjab',
      rating: 5,
      text: 'As a B2B partner, I get excellent trade pricing and fast support. My customers keep coming back for Soil+ Organics products because they see real results in their fields. A trusted brand for our network.',
      initials: 'AK',
    },
    {
      name: 'Meena Reddy',
      role: 'Home Gardener',
      location: 'Karnataka',
      rating: 5,
      text: 'I started using Soil+ Organics for my terrace garden and the difference is incredible. The plants look lush, flowering is much better, and everything is completely organic. Fantastic products!',
      initials: 'MR',
    },
    {
      name: 'Vikram Singh',
      role: 'Large Scale Grower',
      location: 'Rajasthan',
      rating: 5,
      text: 'The Bio Fertilizers and Bio Stimulants range helped us recover crop health during high disease pressure without relying on harsh chemical residues.',
      initials: 'VS',
    },
  ]

  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length)
  const next = () => setCurrent((c) => (c + 1) % testimonials.length)

  const getVisible = () => {
    const indices = []
    for (let i = -1; i <= 1; i++) {
      indices.push((current + i + testimonials.length) % testimonials.length)
    }
    return indices
  }

  return (
    <section id="testimonials" className="testimonials">
      <div className="testimonials-container">

        {/* Header */}
        <div className="testimonials-header">
          <div className="testimonials-badge">
            <span className="badge-dot"></span>
            WHAT OUR CUSTOMERS SAY
          </div>
          <h2 className="testimonials-title">
            Trusted by <span className="highlight">farmers</span> across India
          </h2>
          <p className="testimonials-subtitle">
            Real results from real growers — see how Soil+ Organics is making a difference.
          </p>
        </div>

        {/* Cards */}
        <div className="testimonials-track">
          {getVisible().map((index, position) => {
            const t = testimonials[index]
            const isCenter = position === 1
            return (
              <div
                key={index}
                className={`testimonial-card ${isCenter ? 'center' : 'side'}`}
              >
                <Quote className="testimonial-quote-icon" size={32} />
                <p className="testimonial-text">{t.text}</p>
                <div className="testimonial-stars">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.initials}</div>
                  <div className="testimonial-author-info">
                    <p className="testimonial-name">{t.name}</p>
                    <p className="testimonial-role">{t.role} · {t.location}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Navigation */}
        <div className="testimonials-nav">
          <button className="testimonials-nav-btn" onClick={prev}>
            <ChevronLeft size={22} />
          </button>
          <div className="testimonials-dots">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`testimonials-dot ${i === current ? 'active' : ''}`}
              />
            ))}
          </div>
          <button className="testimonials-nav-btn" onClick={next}>
            <ChevronRight size={22} />
          </button>
        </div>

      </div>
    </section>
  )
}

export default Testimonials

