import React, { useEffect, useRef } from 'react'
import heroVideo from '../assets/soil.mp4'
import '../styles/Hero.css'

const Hero = () => {
  const sectionRef = useRef(null)
  const videoRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    const video = videoRef.current
    if (!section || !video) return

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) {
      video.pause()
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const promise = video.play()
          if (promise && typeof promise.catch === 'function') {
            promise.catch(() => {})
          }
          return
        }

        video.pause()
      },
      { root: null, rootMargin: '0px', threshold: 0.08 }
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="hero-section" ref={sectionRef} className="hero">
      <video
        ref={videoRef}
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
