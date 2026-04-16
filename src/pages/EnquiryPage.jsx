import React from 'react'
import TopBar from '../components/TopBar'
import Header from '../components/Header'
import ContactSection from '../components/ContactSection'
import Footer from '../components/Footer'

const EnquiryPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <TopBar />
      <Header />
      <main>
        <ContactSection />
      </main>
      <Footer />
    </div>
  )
}

export default EnquiryPage
