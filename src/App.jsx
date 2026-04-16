import React, { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import TopBar from './components/TopBar'
import Header from './components/Header'
import Hero from './components/Hero'
import WhatLookingFor from './components/WhatLookingFor'
import AdvancingFarming from './components/AdvancingFarming'
import ProductCategories from './components/ProductCategories'
import BuiltForGrowers from './components/BuiltForGrowers'
import Testimonials from './components/Testimonials'
import Footer from './components/Footer'
import EnquiryPage from './pages/EnquiryPage'
import CategoryPage from './pages/CategoryPage'
import SearchResultsPage from './pages/SearchResultsPage'
import ProductPage from './pages/ProductPage'
import AboutPage from './pages/AboutPage'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

function ScrollToHash() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) {
      return
    }

    const id = hash.replace('#', '')

    window.requestAnimationFrame(() => {
      const element = document.getElementById(id)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })
  }, [pathname, hash])

  return null
}

function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <TopBar />
      <Header />
      <main>
        <Hero />
        <WhatLookingFor />
        <ProductCategories />
        <AdvancingFarming />
        <BuiltForGrowers />
        <Testimonials />
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <>
      <ScrollToTop />
      <ScrollToHash />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/enquiry" element={<EnquiryPage />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/product/:slug" element={<ProductPage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </>
  )
}

export default App

