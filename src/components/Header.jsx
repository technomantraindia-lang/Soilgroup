import React, { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Search, Phone, Menu, X, ChevronDown } from 'lucide-react'
import logo from '../assets/logo.png'
import { searchProducts } from '../data/catalog'
import { fetchPublicCategories, searchPublicProducts } from '../services/catalogApi'
import '../styles/Header.css'

const PRODUCT_DROPDOWN_ITEMS = [
  { name: 'Bio Fertilizers', href: '/category/bio-fertilizers' },
  { name: 'Bio Stimulants', href: '/category/bio-stimulants' },
  { name: 'Organic Fertilizers', href: '/category/organic-fertilizers' },
  { name: 'Organic Manure', href: '/category/organic-manure' },
  { name: 'Soil Conditioners', href: '/category/soil-conditioners' },
  { name: 'Chelated Micronutrients', href: '/category/chelated-micronutrients' },
  { name: 'Water Soluble Fertilizers', href: '/category/water-soluble-fertilizers' },
  { name: 'Growing Media', href: '/category/growing-media' },
]

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [productDropdownItems, setProductDropdownItems] = useState(PRODUCT_DROPDOWN_ITEMS)
  const navigate = useNavigate()
  const location = useLocation()
  const searchRef = useRef(null)
  const isScrolledRef = useRef(false)

  useEffect(() => {
    // Hysteresis prevents rapid toggling when the header height changes near the threshold.
    // rAF throttling prevents excessive React state updates during scroll.
    const SCROLL_DOWN_THRESHOLD = 110
    const SCROLL_UP_THRESHOLD = 60

    let rafId = null

    const updateScrolledState = () => {
      rafId = null
      const y = window.scrollY || 0
      const next =
        isScrolledRef.current ? y > SCROLL_UP_THRESHOLD : y > SCROLL_DOWN_THRESHOLD

      if (next !== isScrolledRef.current) {
        isScrolledRef.current = next
        setIsScrolled(next)
      }
    }

    const handleScroll = () => {
      if (rafId != null) return
      rafId = window.requestAnimationFrame(updateScrolledState)
    }

    // Initialize once on mount.
    handleScroll()

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafId != null) {
        window.cancelAnimationFrame(rafId)
      }
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadProductCategories = async () => {
      try {
        const categories = await fetchPublicCategories()

        if (!isMounted || categories.length === 0) {
          return
        }

        setProductDropdownItems(
          categories
            .filter((category) => category.slug)
            .map((category) => ({
              name: category.title || category.name || 'Product Category',
              href: `/category/${category.slug}`,
            }))
        )
      } catch {
        if (isMounted) {
          setProductDropdownItems(PRODUCT_DROPDOWN_ITEMS)
        }
      }
    }

    loadProductCategories()

    return () => {
      isMounted = false
    }
  }, [])

  const navItems = [
    {
      name: 'Home',
      href: '/',
      hasDropdown: true,
      dropdownItems: [
        { name: 'Hero Section', href: '/#hero-section' },
        { name: 'Product Categories', href: '/#product-categories' },
        { name: 'Shop by Goal', href: '/#shop-by-goal' },
        { name: 'Testimonials', href: '/#testimonials' },
      ],
    },
    {
      name: 'About',
      href: '/about',
      hasDropdown: true,
      dropdownItems: [
        { name: 'About Us', href: '/about#about-us' },
        { name: 'Why Soil+ Organics', href: '/about#why-us' },
        { name: 'Vision', href: '/about#vision' },
      ],
    },
    {
      name: 'Products',
      href: '/#product-categories',
      hasDropdown: true,
      dropdownItems: productDropdownItems,
    },
    {
      name: 'Enquiry',
      href: '/enquiry',
      hasDropdown: true,
      dropdownItems: [{ name: 'Contact Form', href: '/enquiry#contact-form' }],
    },
  ]

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    setSearchTerm(params.get('search') || '')
  }, [location.search])

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [])

  const trimmedSearch = searchTerm.trim()

  useEffect(() => {
    let isMounted = true

    if (!trimmedSearch) {
      setSuggestions([])
      return
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        const products = await searchPublicProducts(trimmedSearch, 6)

        if (isMounted) {
          setSuggestions(products)
        }
      } catch {
        if (isMounted) {
          setSuggestions(searchProducts(trimmedSearch).slice(0, 6))
        }
      }
    }, 180)

    return () => {
      isMounted = false
      window.clearTimeout(timeoutId)
    }
  }, [trimmedSearch])

  const handleMouseEnter = (index) => {
    setActiveDropdown(index)
  }

  const handleMouseLeave = () => {
    setActiveDropdown(null)
  }

  const closeMenus = () => {
    setIsMobileMenuOpen(false)
    setIsSearchOpen(false)
  }

  const handleSearchSubmit = (event) => {
    event.preventDefault()

    const query = trimmedSearch
    if (!query) {
      return
    }

    const destination = location.pathname.startsWith('/category/')
      ? `${location.pathname}?search=${encodeURIComponent(query)}`
      : `/search?search=${encodeURIComponent(query)}`

    navigate(destination)
    closeMenus()
  }

  const handleSuggestionSelect = (product) => {
    navigate(`/category/${product.categorySlug}?search=${encodeURIComponent(product.name)}`)
    setSearchTerm(product.name)
    closeMenus()
  }

  const handleSearchChange = (event) => {
    const value = event.target.value
    setSearchTerm(value)
    setIsSearchOpen(Boolean(value.trim()))
  }

  return (
    <header className={`header ${isScrolled ? 'header-scrolled' : ''}`}>
      <div className="header-container">
        <Link to="/" className="header-logo" onClick={closeMenus}>
          <img
            src={logo}
            alt="Soil+ Organics"
            decoding="sync"
            fetchPriority="high"
            height={70}
            width={180}
          />
        </Link>

        <div className="header-search" ref={searchRef}>
          <form className="header-search-form" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => setIsSearchOpen(Boolean(trimmedSearch))}
              placeholder="Search for products, categories..."
            />
            <button type="submit" className="header-search-btn" aria-label="Search products">
              <Search size={18} />
            </button>
          </form>

          {isSearchOpen && (
            <div className="header-search-dropdown">
              <div className="header-search-dropdown-header">Suggested Products</div>
              {suggestions.length > 0 ? (
                <>
                  <div className="header-search-dropdown-list">
                    {suggestions.map((product) => (
                      <button
                        key={`${product.categorySlug}-${product.name}-suggestion`}
                        type="button"
                        className="header-search-item"
                        onClick={() => handleSuggestionSelect(product)}
                      >
                        <span className="header-search-item-copy">
                          <span className="header-search-item-name">{product.name}</span>
                          <span className="header-search-item-category">{product.categoryTitle}</span>
                        </span>
                        <Search size={16} />
                      </button>
                    ))}
                  </div>
                  <button type="button" className="header-search-view-all" onClick={handleSearchSubmit}>
                    Search all results for "{trimmedSearch}"
                  </button>
                </>
              ) : (
                <>
                  <div className="header-search-empty">No direct match found. Search the full catalog for related products.</div>
                  <button type="button" className="header-search-view-all" onClick={handleSearchSubmit}>
                    Search all results for "{trimmedSearch}"
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="header-right">
          <a href="tel:+917506177573" className="header-phone">
            <Phone size={18} />
            <span>+91 7506177573</span>
          </a>

          <Link to="/enquiry" className="header-cta" onClick={closeMenus}>
            Send Enquiry
          </Link>

          <button
            className="header-mobile-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <nav className="header-nav">
        <div className="header-nav-container">
          <Link to="/" className="header-nav-logo" onClick={closeMenus}>
            <img
              src={logo}
              alt="Soil+ Organics"
              decoding="async"
              loading="eager"
              height={52}
              width={136}
            />
          </Link>
          <ul className="header-nav-list">
            {navItems.map((item, index) => (
              <li
                key={index}
                className={`header-nav-item ${item.hasDropdown ? 'has-dropdown' : ''}`}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
              >
                {!item.hasDropdown ? (
                  <Link to={item.href} className="header-nav-link" onClick={closeMenus}>
                    {item.name}
                  </Link>
                ) : item.href.startsWith('/') ? (
                  <Link to={item.href} className="header-nav-link" onClick={closeMenus}>
                    {item.name}
                    <ChevronDown size={16} />
                  </Link>
                ) : (
                  <a href={item.href} className="header-nav-link">
                    {item.name}
                    <ChevronDown size={16} />
                  </a>
                )}

                {item.hasDropdown && (
                  <div className={`header-dropdown ${activeDropdown === index ? 'active' : ''}`}>
                    <ul className="header-dropdown-list">
                      {item.dropdownItems.map((dropItem, dropIndex) => (
                        <li key={dropIndex}>
                          <Link to={dropItem.href} className="header-dropdown-link" onClick={closeMenus}>
                            {dropItem.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className={`header-mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <ul className="mobile-nav-list">
          {navItems.map((item, index) => (
            <li key={index} className="mobile-nav-item">
              {!item.hasDropdown ? (
                <Link to={item.href} className="mobile-nav-link" onClick={closeMenus}>
                  {item.name}
                </Link>
              ) : item.href.startsWith('/') ? (
                <Link to={item.href} className="mobile-nav-link" onClick={closeMenus}>
                  {item.name}
                </Link>
              ) : (
                <a href={item.href} className="mobile-nav-link">
                  {item.name}
                </a>
              )}
              {item.hasDropdown && (
                <ul className="mobile-dropdown">
                  {item.dropdownItems.map((dropItem, dropIndex) => (
                    <li key={dropIndex}>
                      <Link to={dropItem.href} className="mobile-dropdown-link" onClick={closeMenus}>
                        {dropItem.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </header>
  )
}

export default Header
