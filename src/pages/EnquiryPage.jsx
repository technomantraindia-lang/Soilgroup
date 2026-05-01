import React from 'react'
import Header from '../components/Header'
import ContactSection from '../components/ContactSection'
import Footer from '../components/Footer'

const EnquiryPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <ContactSection />
      </main>
      <Footer />
    </div>
  )
}

export default EnquiryPage
