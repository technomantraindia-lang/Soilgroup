import React from 'react'
import { Link } from 'react-router-dom'
import { Phone, Mail, Facebook, Twitter, Instagram, Linkedin, Youtube, MapPin, ArrowRight } from 'lucide-react'
import logo from '../assets/logo.png'
import '../styles/Footer.css'

const Footer = () => {
  const footerLinks = {
    products: {
      title: 'Our Products',
      links: [
        { name: 'Bio Fertilizers', to: '/category/bio-fertilizers' },
        { name: 'Bio Stimulants', to: '/category/bio-stimulants' },
        { name: 'Organic Fertilizers', to: '/category/organic-fertilizers' },
        { name: 'Organic Manure', to: '/category/organic-manure' },
        { name: 'Soil Conditioners', to: '/category/soil-conditioners' },
        { name: 'Chelated Micronutrients', to: '/category/chelated-micronutrients' },
        { name: 'Water Soluble Fertilizers', to: '/category/water-soluble-fertilizers' },
        { name: 'Growing Media', to: '/category/growing-media' },
      ],
    },
    company: {
      title: 'Company',
      links: [
        { name: 'Home', to: '/' },
        { name: 'Brand Story', to: '/#brand-story' },
        { name: 'Why Choose Us', to: '/#why-choose-us' },
      ],
    },
    support: {
      title: 'Support',
      links: [
        { name: 'Send Enquiry', to: '/enquiry' },
        { name: 'Export Enquiry', to: '/enquiry#export-enquiry' },
        { name: 'Privacy Policy', to: '/' },
        { name: 'Terms of Service', to: '/' },
      ],
    },
  }

  const socialLinks = [
    { icon: <Facebook size={20} />, href: '#', label: 'Facebook' },
    { icon: <Twitter size={20} />, href: '#', label: 'Twitter' },
    { icon: <Instagram size={20} />, href: '#', label: 'Instagram' },
    { icon: <Linkedin size={20} />, href: '#', label: 'LinkedIn' },
    { icon: <Youtube size={20} />, href: '#', label: 'YouTube' },
  ]

  return (
    <footer className="footer">
      <div className="footer-decoration">
        <div className="footer-decoration-line"></div>
      </div>

      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <div className="footer-logo-wrapper">
                <img src={logo} alt="Soil+ Organics" />
              </div>
            </Link>

            <p className="footer-description">
              Making organic farming simple. We create science-backed, nature-inspired products that help farmers and gardeners grow better, naturally.
            </p>

            <div className="footer-contact">
              <a href="tel:+917506177573" className="footer-contact-item">
                <div className="footer-contact-icon">
                  <Phone size={16} />
                </div>
                <span>+91 7506177573</span>
              </a>
              <a href="mailto:kakkad.bhushan@gmail.com" className="footer-contact-item">
                <div className="footer-contact-icon">
                  <Mail size={16} />
                </div>
                <span>kakkad.bhushan@gmail.com</span>
              </a>
              <div className="footer-contact-item">
                <div className="footer-contact-icon">
                  <MapPin size={16} />
                </div>
                <span>India</span>
              </div>
            </div>

            <div className="footer-social">
              <span className="footer-social-label">Follow Us</span>
              <div className="footer-social-links">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    className="footer-social-link"
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="footer-links-grid">
            {Object.values(footerLinks).map((section) => (
              <div key={section.title} className="footer-links-column">
                <h4 className="footer-links-title">{section.title}</h4>
                <ul className="footer-links-list">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link to={link.to} className="footer-link">
                        <ArrowRight size={14} className="footer-link-arrow" />
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            � {new Date().getFullYear()} Soil+ Organics. All rights reserved. Designed by <a href="https://technomantra.in/" target="_blank" rel="noopener noreferrer" className="footer-designer">TechnoMantra</a>
          </p>
          <div className="footer-legal">
            <Link to="/">Privacy Policy</Link>
            <span className="footer-legal-divider">�</span>
            <Link to="/">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
