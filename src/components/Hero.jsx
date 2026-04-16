import React from 'react'
import heroVideo from '../assets/soil.mp4'
import '../styles/Hero.css'

const Hero = () => {
  return (
    <section id="hero-section" className="hero">
      <video
        className="hero-video"
        autoPlay
        muted
        loop
        playsInline
        disablePictureInPicture
        preload="metadata"
      >
        <source src={heroVideo} type="video/mp4" />
      </video>
    </section>
  )
}

export default Hero
