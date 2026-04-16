import { useState, useEffect } from 'react'
import { X, Send } from 'lucide-react'
import '../styles/EnquiryModal.css'

const EnquiryModal = ({ isOpen, onClose, productName = '', categorySlug = '' }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    businessName: '',
    phone: '',
    email: '',
    category: '',
    state: '',
    message: '',
    agreed: false,
  })

  useEffect(() => {
    if (isOpen) {
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
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Enquiry submitted:', formData)
    onClose()
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
              <label>State / Region</label>
              <select name="state" value={formData.state} onChange={handleChange}>
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

          <button type="submit" className="enq-submit">
            <span>Send Enquiry</span>
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  )
}

export default EnquiryModal

