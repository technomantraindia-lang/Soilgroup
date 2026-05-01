import { useState, useEffect } from 'react'
import { X, Send } from 'lucide-react'
import { sendEnquiryViaWhatsApp } from '../services/whatsappEnquiry'
import { CONTACT_COUNTRY_OPTIONS } from '../data/contactCountries'
import '../styles/EnquiryModal.css'

const EnquiryModal = ({ isOpen, onClose, productName = '', categorySlug = '' }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    businessName: '',
    phone: '',
    email: '',
    category: '',
    country: '',
    message: '',
    agreed: false,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState('')

  useEffect(() => {
    if (isOpen) {
      setSubmitError('')
      setSubmitSuccess('')
      setFormData((prev) => ({
        ...prev,
        category: categorySlug,
        message: productName ? `I'm interested in ${productName}. Please share more details.` : '',
      }))
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, productName, categorySlug])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setSubmitError('')
    setSubmitSuccess('')
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    setIsSubmitting(true)
    setSubmitError('')
    setSubmitSuccess('')

    const opened = sendEnquiryViaWhatsApp(formData, { productName })
    setIsSubmitting(false)

    if (opened) {
      setSubmitSuccess('WhatsApp opened with your enquiry. Send the chat to complete.')
      setFormData({
        fullName: '',
        businessName: '',
        phone: '',
        email: '',
        category: categorySlug,
        country: '',
        message: productName ? `I'm interested in ${productName}. Please share more details.` : '',
        agreed: false,
      })
      setTimeout(() => {
        onClose()
      }, 2500)
      return
    }

    setSubmitError(
      'Could not open WhatsApp. Allow pop-ups for this site, or contact us manually on WhatsApp.'
    )
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="enq-overlay" onClick={handleOverlayClick}>
      <div className="enq-modal">
        {/* Header */}
        <div className="enq-header">
          <div>
            <h3 className="enq-title">Send Enquiry</h3>
            {productName && <p className="enq-product-label">For: {productName}</p>}
          </div>
          <button className="enq-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="enq-form">
          <div className="enq-row">
            <div className="enq-field">
              <label>Full Name <span className="enq-req">*</span></label>
              <input
                type="text"
                name="fullName"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="enq-field">
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

          <div className="enq-row">
            <div className="enq-field">
              <label>Phone Number <span className="enq-req">*</span></label>
              <input
                type="tel"
                name="phone"
                placeholder="+91 98xxx xxxxx"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            <div className="enq-field">
              <label>Email Address <span className="enq-req">*</span></label>
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

          <div className="enq-row">
            <div className="enq-field">
              <label>Product Category</label>
              <select name="category" value={formData.category} onChange={handleChange}>
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
            <div className="enq-field">
              <label>Country</label>
              <select name="country" value={formData.country} onChange={handleChange}>
                <option value="">Select Country</option>
                {CONTACT_COUNTRY_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="enq-field">
            <label>Your Message <span className="enq-req">*</span></label>
            <textarea
              name="message"
              placeholder="Tell us about your requirements..."
              rows="3"
              value={formData.message}
              onChange={handleChange}
              required
            />
          </div>

          <div className="enq-checkbox">
            <input
              type="checkbox"
              id="enq-agreed"
              name="agreed"
              checked={formData.agreed}
              onChange={handleChange}
              required
            />
            <label htmlFor="enq-agreed">
              I agree to Soil+ Organics <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.
            </label>
          </div>

          {submitError ? (
            <p className="enq-status error" role="alert">
              {submitError}
            </p>
          ) : null}

          {submitSuccess ? (
            <p className="enq-status success" role="status">
              {submitSuccess}
            </p>
          ) : null}

          <button type="submit" className="enq-submit" disabled={isSubmitting || submitSuccess}>
            <span>
              {isSubmitting ? 'Opening WhatsApp…' : submitSuccess ? 'Opened' : 'Send on WhatsApp'}
            </span>
            {!submitSuccess && <Send size={16} />}
          </button>
        </form>
      </div>
    </div>
  )
}

export default EnquiryModal

