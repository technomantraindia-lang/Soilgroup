import React, { Suspense, lazy, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Hero from './components/Hero'
import WhatLookingFor from './components/WhatLookingFor'
import AdvancingFarming from './components/AdvancingFarming'
import ProductCategories from './components/ProductCategories'
import BuiltForGrowers from './components/BuiltForGrowers'
import Testimonials from './components/Testimonials'
import Footer from './components/Footer'
import './styles/route-fallback.css'

const EnquiryPage = lazy(() => import('./pages/EnquiryPage'))
const CategoryPage = lazy(() => import('./pages/CategoryPage'))
const SearchResultsPage = lazy(() => import('./pages/SearchResultsPage'))
const ProductPage = lazy(() => import('./pages/ProductPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))

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

function RouteFallback() {
  return (
    <div className="route-fallback-shell" aria-busy="true">
      <span className="sr-only">Loading page…</span>
    </div>
  )
}

function HomePage() {
  return (
    <div className="min-h-screen bg-white">
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
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/enquiry" element={<EnquiryPage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </Suspense>
    </>
  )
}

export default App
