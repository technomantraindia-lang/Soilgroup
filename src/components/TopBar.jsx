import React from 'react'
import { Truck, Award, Leaf, Clock, Heart, MapPin } from 'lucide-react'
import '../styles/TopBar.css'

const TopBar = () => {
  const announcements = [
    { icon: Truck, text: '100% Organic Delivery' },
    { icon: Award, text: 'Free Shipping on Bulk Orders' },
    { icon: Leaf, text: '100% Organic Certification' },
    { icon: Clock, text: 'Track & Trace for Pesticide Free Validation' },
    { icon: Heart, text: 'Nourish the Soil to Balanced Ecosystem' },
    { icon: MapPin, text: 'Find the Nearest Dealers in Presence of Partner' },
  ]

  return (
    <div className="topbar">
      <div className="topbar-container">
        {/* First marquee */}
        <div className="topbar-marquee">
          {announcements.map((item, index) => (
            <React.Fragment key={index}>
              <div className="topbar-item">
                <item.icon />
                <span>{item.text}</span>
              </div>
              <span className="topbar-divider">✦</span>
            </React.Fragment>
          ))}
        </div>
        
        {/* Duplicate for seamless loop */}
        <div className="topbar-marquee" aria-hidden="true">
          {announcements.map((item, index) => (
            <React.Fragment key={`dup-${index}`}>
              <div className="topbar-item">
                <item.icon />
                <span>{item.text}</span>
              </div>
              <span className="topbar-divider">✦</span>
            </React.Fragment>
          ))}
        </div>

        {/* Right side CTA */}
        <div className="topbar-cta">
          <span>GET YOUR TESTS</span>
        </div>
      </div>
    </div>
  )
}

export default TopBar
