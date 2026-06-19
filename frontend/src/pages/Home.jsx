import { useEffect, useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { POPULAR_ROUTES } from '../lib/hyderabad'
import useScrollReveal from '../hooks/useScrollReveal'
import toast from 'react-hot-toast'

function SectionLabel({ children }) {
  const [ref, isVisible] = useScrollReveal()
  return (
    <motion.span
      ref={ref}
      className="section-label"
      initial={{ opacity: 0, y: 10 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.span>
  )
}

function LandingPage() {
  const [scrolled, setScrolled] = useState(false)

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 50)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const [heroRef, heroVisible] = useScrollReveal({ threshold: 0.1 })
  const [overviewRef, overviewVisible] = useScrollReveal({ threshold: 0.1 })
  const [featuresRef, featuresVisible] = useScrollReveal({ threshold: 0.1 })
  const [trackingRef, trackingVisible] = useScrollReveal({ threshold: 0.1 })
  const [routesRef, routesVisible] = useScrollReveal({ threshold: 0.1 })
  const [stepsRef, stepsVisible] = useScrollReveal({ threshold: 0.1 })
  const [visionRef, visionVisible] = useScrollReveal({ threshold: 0.1 })
  const [ctaRef, ctaVisible] = useScrollReveal({ threshold: 0.1 })

  const handleShare = useCallback(async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: 'CoRide', text: 'Join CoRide - Premium ride-sharing for professionals', url })
      } catch {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard!')
    }
  }, [])

  return (
    <div className="landing">
      <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: 28, fontVariationSettings: "'FILL' 1" }}>directions_car</span>
          <span className="landing-logo">CoRide</span>
        </div>
        <div className="landing-nav-links">
          <a href="#features">Features</a>
          <a href="#routes">Routes</a>
          <a href="#tracking">Tracking</a>
          <Link to="/login" className="landing-btn-secondary">Login</Link>
          <Link to="/register" className="landing-btn-primary">Join CoRide</Link>
        </div>
      </nav>

      {/* Hero */}
      <header className="hero" ref={heroRef}>
        <div className="hero-bg">
          <div className="hero-overlay" />
          <img src="/images/hero-bg.jpg" alt="Hyderabad Cityscape" className="hero-bg-img" />
        </div>
        <div className="hero-content">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={heroVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="hero-tag">
              <span className="hero-tag-dot" />
              Now Live in Hyderabad
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={heroVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            Ride Together,<br /><span className="text-primary">Save Together</span>
          </motion.h1>
          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0, y: 30 }}
            animate={heroVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            The premium ride-sharing community designed exclusively for Hyderabad's professionals. Connect with colleagues and commute in comfort.
          </motion.p>
          <motion.div
            className="hero-btns"
            initial={{ opacity: 0, y: 20 }}
            animate={heroVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.45 }}
          >
            <Link to="/register" className="landing-btn-primary hero-btn-primary">
              <span className="material-symbols-outlined">search</span>
              Find a Ride
            </Link>
            <Link to="/register" className="landing-btn-secondary hero-btn-secondary">
              <span className="material-symbols-outlined">add_circle</span>
              Offer a Ride
            </Link>
          </motion.div>
        </div>
      </header>

      {/* Overview: What is CoRide? */}
      <section className="section-overview" ref={overviewRef}>
        <div className="section-overview-inner">
          <motion.div
            className="overview-header"
            initial={{ opacity: 0, y: 20 }}
            animate={overviewVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <h2>What is CoRide?</h2>
            <p>We bridge the gap between solo commutes and crowded public transport by connecting car owners with empty seats to verified professional passengers.</p>
          </motion.div>
          <div className="overview-grid">
            <motion.div
              className="overview-card"
              initial={{ opacity: 0, x: -30 }}
              animate={overviewVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="overview-card-img">
                <img src="/images/driver.jpg" alt="Professional Driver" />
              </div>
              <div className="overview-card-body">
                <div className="overview-card-icon">
                  <span className="material-symbols-outlined">drive_eta</span>
                </div>
                <h3>For the Driver</h3>
                <p>Offset your fuel costs and maintenance while helping the environment. Meet fellow professionals during your daily commute.</p>
                <ul>
                  <li><span className="material-symbols-outlined">check_circle</span> Reduce monthly commute expenses</li>
                  <li><span className="material-symbols-outlined">check_circle</span> Flexible scheduling</li>
                  <li><span className="material-symbols-outlined">check_circle</span> Professional network</li>
                </ul>
              </div>
            </motion.div>
            <motion.div
              className="overview-card"
              initial={{ opacity: 0, x: 30 }}
              animate={overviewVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="overview-card-img">
                <img src="/images/passenger.jpg" alt="Professional Passenger" />
              </div>
              <div className="overview-card-body">
                <div className="overview-card-icon passenger-icon">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <h3>For the Passenger</h3>
                <p>Skip the stress of navigating Hyderabad traffic. Enjoy a premium carpool experience with door-to-door convenience and transparent pricing.</p>
                <ul>
                  <li><span className="material-symbols-outlined">check_circle</span> Premium vehicle comfort</li>
                  <li><span className="material-symbols-outlined">check_circle</span> Safety first tracking</li>
                  <li><span className="material-symbols-outlined">check_circle</span> Cost-effective premium travel</li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="section-features" id="features" ref={featuresRef}>
        <div className="section-features-inner">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={featuresVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            Sophisticated Ecosystem
          </motion.h2>
          <div className="features-bento">
            <motion.div
              className="bento-card bento-wide"
              initial={{ opacity: 0, y: 20 }}
              animate={featuresVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="bento-flex">
                <div className="bento-text">
                  <div className="bento-icon-wrap">
                    <span className="material-symbols-outlined">security</span>
                  </div>
                  <h4>Verified Rating System</h4>
                  <p>Our community-driven rating system ensures that only the most reliable and courteous commuters stay on the platform. Safety and trust are our priorities.</p>
                </div>

              </div>
            </motion.div>
            <motion.div
              className="bento-card bento-primary"
              initial={{ opacity: 0, y: 20 }}
              animate={featuresVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <span className="material-symbols-outlined bento-primary-icon">how_to_reg</span>
              <div>
                <h4>Simple Signup</h4>
                <p>Register in under 2 minutes with your corporate ID and LinkedIn.</p>
              </div>
            </motion.div>
            <motion.div
              className="bento-card"
              initial={{ opacity: 0, y: 20 }}
              animate={featuresVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <span className="material-symbols-outlined bento-icon">chat</span>
              <h4>Secure Chat</h4>
              <p>Coordinate pickups without sharing personal contact numbers.</p>
            </motion.div>
          <motion.div
            className="bento-card"
            initial={{ opacity: 0, y: 20 }}
            animate={featuresVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <span className="material-symbols-outlined bento-icon">search</span>
            <h4>Easy Search</h4>
            <p>Smart filters for time, route, vehicle type and preferences.</p>
          </motion.div>
          </div>
        </div>
      </section>

      {/* Live Tracking */}
      <section className="section-tracking" id="tracking" ref={trackingRef}>
        <div className="section-tracking-inner">
          <motion.div
            className="tracking-content"
            initial={{ opacity: 0, x: -30 }}
            animate={trackingVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2>Real-Time Sync</h2>
            <p>Transparency builds trust. Our advanced tracking interface provides real-time updates for both parties, ensuring you're never left guessing.</p>
            <div className="tracking-pulse">
              <div className="pulse-dot" />
              <span>Live Pulse System</span>
            </div>
            <div className="tracking-feature-card">
              <span className="material-symbols-outlined">location_on</span>
              <div>
                <p className="tracking-feature-title">Precision Tracking</p>
                <p className="tracking-feature-desc">Accurate within 5 meters for seamless pickup experiences.</p>
              </div>
            </div>
          </motion.div>
          <motion.div
            className="tracking-mockup"
            initial={{ opacity: 0, x: 30 }}
            animate={trackingVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="mockup-frame">
              <img src="/images/tracking.jpg" alt="Real-time Tracking Interface" />
              <div className="mockup-overlay-top">
                <div className="mockup-chip">
                  <span className="mockup-dot" />
                  En Route to HITEC City
                </div>
                <div className="mockup-time">14 MINS</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Popular Routes */}
      <section className="section-routes" id="routes" ref={routesRef}>
        <div className="section-routes-inner">
          <motion.div
            className="routes-header"
            initial={{ opacity: 0, y: 20 }}
            animate={routesVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <div>
              <h2>Popular Routes</h2>
              <p>Fastest commute patterns for Hyderabad professionals.</p>
            </div>
          </motion.div>
          <div className="routes-grid-new">
            {POPULAR_ROUTES.slice(0, 6).map((route, i) => (
              <motion.div
                key={i}
                className="route-card-new"
                initial={{ opacity: 0, y: 20 }}
                animate={routesVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.06 }}
              >
                <div className="route-card-header">
                  <div>
                    <span className="route-label">Starting from</span>
                    <span className="route-city">{route.from}</span>
                  </div>
                  <span className="material-symbols-outlined route-arrow">trending_flat</span>
                  <div className="route-end">
                    <span className="route-label">Ending at</span>
                    <span className="route-city">{route.to}</span>
                  </div>
                </div>
                <div className="route-card-footer">
                  <div className="route-avatars">
                    <div className="route-avatar" />
                    <div className="route-avatar" />
                    <div className="route-avatar-more">+N</div>
                  </div>
                  <span className="route-count">POPULAR ROUTE</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-steps" ref={stepsRef}>
        <div className="section-steps-inner">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={stepsVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            How CoRide Works
          </motion.h2>
          <div className="steps-grid">
            {[
              { icon: 'person_add', title: 'Join', desc: 'Complete your profile with professional verification.' },
              { icon: 'manage_search', title: 'Match', desc: 'Search or offer rides based on your daily schedule.' },
              { icon: 'handshake', title: 'Confirm', desc: 'Review profile ratings and confirm through secure chat.' },
              { icon: 'celebration', title: 'Ride', desc: 'Share the cost, conversation, and a better commute.' },
            ].map((step, i) => (
              <motion.div
                key={i}
                className="step-item"
                initial={{ opacity: 0, y: 30 }}
                animate={stepsVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.12 }}
              >
                <div className={`step-circle ${i === 3 ? 'step-circle-primary' : ''}`}>
                  <span className="material-symbols-outlined">{step.icon}</span>
                </div>
                <h5>{step.title}</h5>
                <p>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Future Vision */}
      <section className="section-vision" ref={visionRef}>
        <div className="section-vision-inner">
          <motion.div
            className="vision-content"
            initial={{ opacity: 0, y: 30 }}
            animate={visionVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="vision-label">Roadmap 2026</span>
            <h2>What's Coming to CoRide</h2>
            <p>We are constantly evolving to make your commute even safer and more seamless. Here's a glimpse into the future of urban mobility in Hyderabad.</p>
            <div className="vision-grid">
              {[
                { icon: 'smartphone', text: 'Native iOS & Android Apps' },
                { icon: 'payments', text: 'Seamless Auto-Pay' },
                { icon: 'female', text: 'Women-Only Ride Toggles' },
                { icon: 'electric_car', text: 'EV Commute Priority' },
              ].map((item, i) => (
                <div key={i} className="vision-item">
                  <span className="material-symbols-outlined vision-item-icon">{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-cta" ref={ctaRef}>
        <div className="section-cta-inner">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={ctaVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2>Ready to transform your daily commute?</h2>
            <p>Start riding smarter, together with Hyderabad professionals.</p>
            <div className="cta-btns-row">
              <Link to="/register" className="cta-btn-primary">Start Riding Today</Link>
              <Link to="/login" className="cta-btn-secondary">Sign In</Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <h3>CoRide</h3>
            <p>Redefining the daily professional commute with security, community, and efficiency at the core.</p>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <Link to="/privacy-policy" className="footer-link">Privacy Policy</Link>
            <Link to="/terms-of-service" className="footer-link">Terms of Service</Link>
          </div>
          <div className="footer-col">
            <h4>Connect</h4>
            <div className="footer-social">
              <button className="social-icon" onClick={handleShare} aria-label="Share">
                <span className="material-symbols-outlined">share</span>
              </button>
              <a href="mailto:support@coride.com" className="social-icon" aria-label="Email us">
                <span className="material-symbols-outlined">mail</span>
              </a>
              <Link to="/" className="social-icon" aria-label="Home">
                <span className="material-symbols-outlined">language</span>
              </Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 CoRide Technologies. Premium Commuting for Hyderabad.</p>
        </div>
      </footer>
    </div>
  )
}

export default function Home() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return
    if (user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, loading, navigate])

  if (loading) {
    return (
      <div className="home-loading">
        <motion.h1
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          CoRide
        </motion.h1>
        <div className="spinner spinner-lg" />
      </div>
    )
  }

  if (user) {
    return (
      <div className="home-loading">
        <div className="spinner spinner-lg" />
      </div>
    )
  }

  return <LandingPage />
}
