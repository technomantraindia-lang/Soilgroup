import Header from './Header'
import Footer from './Footer'

const ProductLandingLayout = ({ children, showFooter = true }) => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      {children}
      {showFooter && <Footer />}
    </div>
  )
}

export default ProductLandingLayout
