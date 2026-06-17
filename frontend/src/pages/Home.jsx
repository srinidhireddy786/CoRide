import { useEffect, useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Car, MapPin, MessageCircle, Navigation, Users, Star, TrendingUp, Shield } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { POPULAR_ROUTES } from '../lib/hyderabad'
import useScrollReveal from '../hooks/useScrollReveal'

function SearchIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

const FEATURES = [
  { icon: Car, gradient: 'purple', title: 'Offer a Ride', desc: 'Publish your trip route and earn while helping others reach their destination.' },
  { icon: SearchIcon, gradient: 'blue', title: 'Find a Ride', desc: 'Search for rides heading your way and book a seat instantly.' },
  { icon: Navigation, gradient: 'green', title: 'Live Tracking', desc: 'Track your ride in real-time with GPS location sharing.' },
  { icon: MessageCircle, gradient: 'orange', title: 'In-App Chat', desc: 'Stay connected with your driver or passengers via built-in chat.' },
]

const TESTIMONIALS = [
  { name: 'Priya S.', role: 'Regular Rider', text: 'CoRide has made my daily commute so much easier and affordable. Love the live tracking feature!', rating: 5 },
  { name: 'Rahul K.', role: 'Frequent Driver', text: 'I\'ve been offering rides for months. Great way to meet new people and share costs.', rating: 5 },
  { name: 'Ananya M.', role: 'College Student', text: 'Safe, reliable, and super convenient. The chat feature helps coordinate pickups easily.', rating: 5 },
  { name: 'Vikram R.', role: 'Daily Commuter', text: 'Best carpooling app in Hyderabad! The route matching is always accurate.', rating: 5 },
]

const STATS = [
  { icon: Users, value: 10, suffix: 'K+', label: 'Active Riders' },
  { icon: MapPin, value: 50, suffix: '+', label: 'Cities Covered' },
  { icon: TrendingUp, value: 25, suffix: 'K+', label: 'Rides Completed' },
  { icon: Star, value: 4.8, suffix: '', label: 'Average Rating' },
  { icon: Shield, value: 100, suffix: '%', label: 'Safe Rides' },
]

function AnimatedCounter({ target, suffix, isVisible }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isVisible) return
    let start = 0
    const duration = 2000
    const step = Math.max(1, Math.floor(target / (duration / 16)))

    const timer = setInterval(() => {
      start += step
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(start)
      }
    }, 16)

    return () => clearInterval(timer)
  }, [target, isVisible])

  return <>{count}{suffix}</>
}

function StatItem({ icon: Icon, value, suffix, label }) {
  const [ref, isVisible] = useScrollReveal()

  return (
    <div ref={ref} className="stat-item">
      <div className="stat-icon"><Icon size={28} /></div>
      <div className="stat-number">
        <AnimatedCounter target={value} suffix={suffix} isVisible={isVisible} />
      </div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

function FeatureCard({ icon: Icon, gradient, title, desc, index }) {
  const [ref, isVisible] = useScrollReveal()

  return (
    <motion.div
      ref={ref}
      className="feature-card"
      initial={{ opacity: 0, y: 40 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.12, ease: 'easeOut' }}
    >
      <div className={`feature-icon ${gradient}`}>
        <Icon size={24} />
      </div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </motion.div>
  )
}

function TestimonialCard({ name, role, text, rating, index }) {
  const [ref, isVisible] = useScrollReveal()

  return (
    <motion.div
      ref={ref}
      className="testimonial-card"
      initial={{ opacity: 0, y: 30 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
    >
      <div className="testimonial-stars">{'★'.repeat(rating)}</div>
      <p className="testimonial-text">"{text}"</p>
      <div className="testimonial-author">
        <div className="testimonial-avatar">{name.charAt(0)}</div>
        <div>
          <div className="testimonial-name">{name}</div>
          <div className="testimonial-role">{role}</div>
        </div>
      </div>
    </motion.div>
  )
}

function RouteCard({ route, index }) {
  const [ref, isVisible] = useScrollReveal()

  return (
    <motion.div
      ref={ref}
      className="route-card"
      initial={{ opacity: 0, x: -20 }}
      animate={isVisible ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.06, ease: 'easeOut' }}
    >
      <div className="route-card-icon">
        <MapPin size={20} />
      </div>
      <div className="route-card-info">
        <h4>{route.from} → {route.to}</h4>
        <p>via Hyderabad</p>
      </div>
    </motion.div>
  )
}

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

function FeaturesSection() {
  const [ref, isVisible] = useScrollReveal()

  return (
    <div className="section" id="features">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <SectionLabel>Features</SectionLabel>
        <h2>Everything you need for <span className="gradient-text">smart travel</span></h2>
        <p className="section-desc">
          From finding rides to live tracking, CoRide makes carpooling seamless and safe.
        </p>
      </motion.div>
      <div className="features-grid">
        {FEATURES.map((f, i) => (
          <FeatureCard key={i} {...f} index={i} />
        ))}
      </div>
    </div>
  )
}

function StatsSection() {
  const [ref, isVisible] = useScrollReveal({ threshold: 0.3 })

  return (
    <div className="stats-section" ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <SectionLabel>Our Impact</SectionLabel>
        <h2>Growing stronger every day</h2>
        <p className="section-desc" style={{ margin: '0 auto', color: 'rgba(255,255,255,0.6)' }}>
          Join thousands of happy riders and drivers across Hyderabad.
        </p>
      </motion.div>
      <div className="stats-grid">
        {STATS.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <StatItem {...s} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function RoutesSection() {
  const [ref, isVisible] = useScrollReveal()

  return (
    <div className="section" id="routes">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <SectionLabel>Popular Routes</SectionLabel>
        <h2>Explore <span className="gradient-text">Hyderabad</span> routes</h2>
        <p className="section-desc">
          Frequently traveled routes in the city. Pick one and start your journey.
        </p>
      </motion.div>
      <div className="routes-grid">
        {POPULAR_ROUTES.slice(0, 9).map((r, i) => (
          <RouteCard key={i} route={r} index={i} />
        ))}
      </div>
    </div>
  )
}

function TestimonialsSection() {
  const [ref, isVisible] = useScrollReveal()

  return (
    <div className="section" id="testimonials">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <SectionLabel>Testimonials</SectionLabel>
        <h2>What our <span className="gradient-text">riders</span> say</h2>
        <p className="section-desc">
          Real experiences from the CoRide community.
        </p>
      </motion.div>
      <div className="testimonials-grid">
        {TESTIMONIALS.map((t, i) => (
          <TestimonialCard key={i} {...t} index={i} />
        ))}
      </div>
    </div>
  )
}

function CTASection() {
  const [ref, isVisible] = useScrollReveal({ threshold: 0.3 })

  return (
    <div className="cta-section" ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <h2>Ready to ride together?</h2>
        <p>Join CoRide today and make your travel smarter, cheaper, and more social.</p>
        <div className="cta-btns">
          <Link to="/register" className="landing-btn-primary" style={{ padding: '14px 36px', fontSize: '1rem' }}>
            Get Started Free
          </Link>
          <Link to="/login" className="landing-btn-secondary" style={{ padding: '14px 36px', fontSize: '1rem' }}>
            Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

function Footer() {
  return (
    <footer className="landing-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <h3>CoRide</h3>
          <p>Making Hyderabad commute smarter, cheaper, and more social. Ride together, save together.</p>
        </div>
        <div className="footer-col">
          <h4>Quick Links</h4>
          <a href="#features">Features</a>
          <a href="#routes">Routes</a>
          <a href="#testimonials">Testimonials</a>
        </div>
        <div className="footer-col">
          <h4>Support</h4>
          <a href="#">Help Center</a>
          <a href="#">Safety</a>
          <a href="#">Contact</a>
        </div>
        <div className="footer-col">
          <h4>Legal</h4>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 CoRide. All rights reserved.</span>
        <span>Made with ❤️ in Hyderabad</span>
      </div>
    </footer>
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

  return (
    <div className="landing">
      <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
        <span className="landing-logo">CoRide</span>
        <div className="landing-nav-links">
          <a href="#features">Features</a>
          <a href="#routes">Routes</a>
          <a href="#testimonials">Reviews</a>
          <Link to="/login" className="landing-btn-primary">Get Started</Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-bg-shapes">
          <div className="hero-shape hero-shape-1" />
          <div className="hero-shape hero-shape-2" />
          <div className="hero-shape hero-shape-3" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="hero-tag">
            <span className="hero-tag-dot" />
            Now Available in Hyderabad
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
        >
          Ride together,<br />
          <span className="gradient-text">save together</span>
        </motion.h1>

        <motion.p
          className="hero-subtitle"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
        >
          The smart way to commute in Hyderabad. Offer a ride, find a ride,
          and make every journey count.
        </motion.p>

        <motion.div
          className="hero-btns"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
        >
          <Link to="/register" className="landing-btn-primary" style={{ padding: '14px 32px', fontSize: '1rem' }}>
            Start Your Journey
          </Link>
          <a href="#features" className="landing-btn-secondary" style={{ padding: '14px 32px', fontSize: '1rem' }}>
            Learn More
          </a>
        </motion.div>

        <motion.div
          className="hero-stats-row"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <div className="hero-stat">
            <div className="hero-stat-number">10K+</div>
            <div className="hero-stat-label">Active Riders</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-number">25K+</div>
            <div className="hero-stat-label">Rides Completed</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-number">4.8</div>
            <div className="hero-stat-label">Avg Rating</div>
          </div>
        </motion.div>

        <div className="hero-scroll-indicator">
          <div className="mouse" />
          <span>Scroll to explore</span>
        </div>
      </section>

      <FeaturesSection />
      <StatsSection />
      <RoutesSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
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
