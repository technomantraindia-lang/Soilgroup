import React, { useState } from 'react'
import { Phone, Mail, MapPin, Send, MessageSquare, Globe2, PhoneCall, MessageCircle } from 'lucide-react'
import { submitEnquiry } from '../services/api'
import '../styles/ContactSection.css'

const initialFormData = {
  fullName: '',
  businessName: '',
  phone: '',
  email: '',
  category: '',
  state: '',
  message: '',
  agreed: false,
}

const ContactSection = () => {
  const [formData, setFormData] = useState(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setSubmitError('')
    setSubmitSuccess('')
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setIsSubmitting(true)
    setSubmitError('')
    setSubmitSuccess('')

    try {
      await submitEnquiry(formData)
      setFormData(initialFormData)
      setSubmitSuccess("Your enquiry has been saved. Our team will get back to you soon.")
    } catch (error) {
      setSubmitError(error.message || 'Unable to send your enquiry right now. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactInfo = [
    {
      icon: <Phone size={20} />,
      title: 'Phone',
      value: '+91 7506177573',
      link: 'tel:+917506177573',
    },
    {
      icon: <Mail size={20} />,
      title: 'Email',
      value: 'kakkad.bhushan@gmail.com',
      link: 'mailto:kakkad.bhushan@gmail.com',
    },
    {
      icon: <MapPin size={20} />,
      title: 'Headquarters',
      value: 'The Division - Soil+ Organics',
      link: '#',
    },
  ]

  return (
    <section id="contact-form" className="contact-section">
      <div className="contact-bg-pattern"></div>
      <div className="contact-bg-gradient"></div>

      <div className="contact-container">
        <div className="contact-grid">
          <div className="contact-content">
            <div className="contact-label">
              <span className="label-line"></span>
              <span>ENQUIRY & CONTACT</span>
            </div>

            <h2 className="contact-title">
              Let's talk
              <br />
              <span className="highlight">business.</span>
            </h2>

            <p className="contact-description">
              Whether you're a distributor, retailer, or farm supplier, we'd love to discuss how Soil+ Organics products can fit your portfolio.
            </p>

            <div className="contact-info-grid">
              {contactInfo.map((info, index) => (
                <a
                  href={info.link}
                  key={index}
                  className="contact-info-card"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="contact-info-icon">
                    {info.icon}
                  </div>
                  <div className="contact-info-content">
                    <span className="contact-info-title">{info.title}</span>
                    <span className="contact-info-value">{info.value}</span>
                  </div>
                </a>
              ))}
            </div>

            <div className="contact-response-badge">
              <MessageSquare size={18} />
              <span>We typically respond within <strong>24 hours</strong></span>
            </div>

            <div className="contact-extra-ctas">
              <div id="export-enquiry" className="contact-extra-card">
                <div className="contact-extra-head">
                  <Globe2 size={20} />
                  <h4>Export Enquiry</h4>
                </div>
                <p>For export pricing, documents, and country-specific product support, reach our export desk directly.</p>
                <a href="mailto:kakkad.bhushan@gmail.com?subject=Export%20Enquiry" className="contact-extra-link">Send Export Enquiry</a>
              </div>

              <div id="call-whatsapp-cta" className="contact-extra-card">
                <div className="contact-extra-head">
                  <PhoneCall size={20} />
                  <h4>Call / WhatsApp CTA</h4>
                </div>
                <p>Need quick assistance? Connect instantly with our team for product guidance and dealer support.</p>
                <div className="contact-extra-actions">
                  <a href="tel:+917506177573" className="contact-extra-link">Call Now</a>
                  <a
                    href="https://wa.me/917506177573?text=Hello%20Soil%2B%20Organics%2C%20I%20would%20like%20to%20know%20more%20about%20your%20products."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-extra-link whatsapp"
                  >
                    <MessageCircle size={16} /> WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="contact-form-wrapper">
            <div className="contact-form-card">
              <div className="contact-form-header">
                <h3>Send us a message</h3>
                <p>Fill the form below and we'll get back to you.</p>
              </div>

              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name <span className="required">*</span></label>
                    <input
                      type="text"
                      name="fullName"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Business Name</label>
                    <input
                      type="text"
                      name="businessName"
                      placeholder="Your Company"
                      value={formData.businessName}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Phone Number <span className="required">*</span></label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="+91 98xxx xxxxx"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address <span className="required">*</span></label>
                    <input
                      type="email"
                      name="email"
                      placeholder="you@company.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Product Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                    >
                      <option value="">Select Category</option>
                      <option value="bio-fertilizers">Bio Fertilizers</option>
                      <option value="bio-stimulants">Bio Stimulants</option>
                      <option value="organic-fertilizers">Organic Fertilizers</option>
                      <option value="organic-manure">Organic Manure</option>
                      <option value="soil-conditioners">Soil Conditioners</option>
                      <option value="chelated-micronutrients">Chelated Micronutrients</option>
                      <option value="water-soluble-fertilizers">Water Soluble Fertilizers (WSF)</option>
                      <option value="growing-media">Growing Media</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>State / Region</label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                    >
                      <option value="">Select State</option>
                      <option value="maharashtra">Maharashtra</option>
                      <option value="gujarat">Gujarat</option>
                      <option value="karnataka">Karnataka</option>
                      <option value="tamil-nadu">Tamil Nadu</option>
                      <option value="andhra-pradesh">Andhra Pradesh</option>
                      <option value="telangana">Telangana</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Your Message <span className="required">*</span></label>
                  <textarea
                    name="message"
                    placeholder="Tell us about your requirements, business scale, and how we can help..."
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>

                <div className="form-checkbox">
                  <input
                    type="checkbox"
                    id="agreed"
                    name="agreed"
                    checked={formData.agreed}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="agreed">
                    By submitting this form, I agree to Soil+ Organics <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.
                  </label>
                </div>

                {submitError ? (
                  <p className="contact-form-status error" role="alert">
                    {submitError}
                  </p>
                ) : null}

                {submitSuccess ? (
                  <p className="contact-form-status success" role="status">
                    {submitSuccess}
                  </p>
                ) : null}

                <button type="submit" className="contact-submit-btn" disabled={isSubmitting}>
                  <span>{isSubmitting ? 'Sending...' : 'Send Enquiry'}</span>
                  <Send size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactSection
