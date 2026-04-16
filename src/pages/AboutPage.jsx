import TopBar from '../components/TopBar'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { Link } from 'react-router-dom'
import bannerImg from '../assets/Categorypagebanner/ORGANIC FERTILIZERS.jpg'
import aboutImg from '../assets/aboutus/about1.png'
import whyImg from '../assets/aboutus/about3.webp'
import visionImg from '../assets/aboutus/about2.webp'
import '../styles/AboutPage.css'

const CheckIcon = () => (
  <svg className="about-check-icon" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="11" fill="#dcfce7" />
    <path d="M6.5 11.5L9.5 14.5L15.5 8" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const StatIconFarmer = () => (
  <svg className="about-stat-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const StatIconProduct = () => (
  <svg className="about-stat-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
)

const StatIconCategory = () => (
  <svg className="about-stat-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
  </svg>
)

const StatIconLeaf = () => (
  <svg className="about-stat-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22V12" />
    <path d="M12 12C12 7 7 3 2 3c0 5.5 4.5 9 10 9z" />
    <path d="M12 12c0-5 5-9 10-9-1.5 5-5.5 9-10 9z" />
  </svg>
)

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <TopBar />
      <Header />

      {/* ── Hero Banner ── */}
      <div className="about-banner">
        <img src={bannerImg} alt="About Soil+ Organics" className="about-banner-img" loading="eager" />
        <div className="about-banner-overlay">
          <div className="about-banner-content">
            <span className="about-banner-eyebrow">Who We Are</span>
            <h1 className="about-banner-title">About Us</h1>
            <p className="about-banner-sub">Delivering simple solutions. Creating strong results.</p>
          </div>
        </div>
      </div>

      {/* ── Intro Strip ── */}
      <div className="about-intro-strip">
        <div className="about-intro-inner">
          <span className="about-intro-badge">Simple Solutions, Strong Results</span>
          <p className="about-intro-desc">
            At Soil+ Organics, we combine the power of organic inputs with the precision of modern science —
            built for farmers who demand results without compromise.
          </p>
        </div>
      </div>

      {/* ── About Us ── */}
      <section className="about-sec about-sec-white" id="about-us">
        <span className="about-sec-watermark">01</span>
        <div className="about-container">
          <div className="about-grid">

            <div className="about-text-col">
              <span className="about-eyebrow">Our Story</span>
              <h2 className="about-heading">About Us</h2>
              <p className="about-lead">
                At Soil+ Organics, we believe in delivering simple solutions that lead to strong results for farmers.
              </p>
              <p className="about-body">
                We offer a complete range of solutions across plant nutrition, crop activation, soil support,
                and farm efficiency — designed to work together as a unified system.
              </p>
              <p className="about-list-label">Our solutions help farmers:</p>
              <ul className="about-check-list">
                <li><CheckIcon />Improve yield consistently season after season</li>
                <li><CheckIcon />Use inputs more efficiently to reduce waste</li>
                <li><CheckIcon />Make confident decisions in the field</li>
              </ul>
            </div>

            <div className="about-image-col">
              <div className="about-image-frame">
                <img src={aboutImg} alt="About Soil+ Organics" loading="lazy" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Stats Band ── */}
      <div className="about-stats-band">
        <div className="about-container">
          <div className="about-stats-grid">
            <div className="about-stat-card">
              <div className="about-stat-icon-wrap"><StatIconFarmer /></div>
              <span className="about-stat-num">500+</span>
              <span className="about-stat-lbl">Farmers Served</span>
            </div>
            <div className="about-stat-card">
              <div className="about-stat-icon-wrap"><StatIconProduct /></div>
              <span className="about-stat-num">40+</span>
              <span className="about-stat-lbl">Products</span>
            </div>
            <div className="about-stat-card">
              <div className="about-stat-icon-wrap"><StatIconCategory /></div>
              <span className="about-stat-num">6</span>
              <span className="about-stat-lbl">Categories</span>
            </div>
            <div className="about-stat-card">
              <div className="about-stat-icon-wrap"><StatIconLeaf /></div>
              <span className="about-stat-num">100%</span>
              <span className="about-stat-lbl">Organic Focus</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Why Soil+ Organics ── */}
      <section className="about-sec about-sec-tinted" id="why-us">
        <span className="about-sec-watermark">02</span>
        <div className="about-container">
          <div className="about-grid about-grid-reverse">

            <div className="about-image-col">
              <div className="about-image-frame about-image-frame-alt">
                <img src={whyImg} alt="Why Soil+ Organics" loading="lazy" />
              </div>
            </div>

            <div className="about-text-col">
              <span className="about-eyebrow">Our Difference</span>
              <h2 className="about-heading">Why Soil+ Organics</h2>
              <p className="about-lead">
                Farming today stands between two extremes — purely organic and fully chemical. Neither alone
                solves the real challenges farmers face every day.
              </p>
              <p className="about-body">
                At Soil+ Organics, we bridge that gap. We bring together the benefits of organic inputs with
                the precision of modern solutions to create a balanced, performance-driven approach.
              </p>
              <p className="about-list-label">This helps farmers:</p>
              <ul className="about-check-list">
                <li><CheckIcon />Achieve consistent and high yields</li>
                <li><CheckIcon />Maintain better soil health over time</li>
                <li><CheckIcon />Improve overall return on investment</li>
              </ul>
              <blockquote className="about-quote">
                It's not about choosing sides — it's about bridging the gap between organic and chemical
                farming to achieve high performance while protecting soil health.
              </blockquote>
            </div>

          </div>
        </div>
      </section>

      {/* ── Mission Band ── */}
      <div className="about-mission-band">
        <div className="about-container">
          <div className="about-mission-inner">
            <div className="about-mission-line" />
            <p className="about-mission-text">
              "Better farming is not about using more — it's about using <em>smarter</em>."
            </p>
            <div className="about-mission-line" />
          </div>
        </div>
      </div>

      {/* ── Vision ── */}
      <section className="about-sec about-sec-white" id="vision">
        <span className="about-sec-watermark">03</span>
        <div className="about-container">
          <div className="about-grid">

            <div className="about-text-col">
              <span className="about-eyebrow">Looking Ahead</span>
              <h2 className="about-heading">Our Vision</h2>
              <p className="about-lead">
                Our vision is to make farming simple, efficient, and deeply rewarding.
              </p>
              <p className="about-body">
                We aim to help farmers achieve the maximum return from their hard work — with solutions that
                are easy to use, reliable in performance, and practical for real farming conditions.
              </p>
              <p className="about-body">
                We believe better farming is not about using more products, but about using nutrients
                and inputs effectively.
              </p>
              <p className="about-vision-close">
                When farmers grow with confidence, they build stronger families, stronger communities —
                and a stronger future for their country.
              </p>
            </div>

            <div className="about-image-col">
              <div className="about-image-frame">
                <img src={visionImg} alt="Our Vision" loading="lazy" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="about-cta">
        <div className="about-cta-inner">
          <span className="about-cta-eyebrow">Start Growing Today</span>
          <h3>Ready to grow with Soil+ Organics?</h3>
          <p>Explore our full range of solutions or reach out with any questions.</p>
          <div className="about-cta-buttons">
            <Link to="/category/bio-fertilizers" className="about-cta-btn-primary">Explore Products</Link>
            <Link to="/enquiry" className="about-cta-btn-secondary">Send Enquiry</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default AboutPage
