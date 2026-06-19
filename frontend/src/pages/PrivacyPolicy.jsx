import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPolicy() {
  return (
    <main className="policy-page">
      <motion.div
        className="policy-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1
          className="policy-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Privacy Policy
        </motion.h1>

        <motion.div
          className="policy-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="policy-placeholder">We're still writing this one</p>
          <p className="policy-subtext">
            Our full Privacy Policy is being finalized and will be published
            here shortly. In the meantime, your data is handled with the same
            care and security CoRide promises everywhere else in the app.
          </p>
        </motion.div>

        <motion.div
          className="policy-footer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link to="/" className="policy-back-link">
            <ArrowLeft size={18} />
            Back to Home
          </Link>
        </motion.div>
      </motion.div>

      <style>{`
        .policy-back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: 999px;
          background: transparent;
          border: 1px solid rgba(22, 163, 74, 0.3);
          color: #16a34a;
          font-weight: 500;
          font-size: 0.95rem;
          text-decoration: none;
          transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
        }

        .policy-back-link:hover {
          background: #16a34a;
          border-color: #16a34a;
          color: #ffffff;
          transform: translateX(-2px);
        }

        .policy-back-link:active {
          transform: translateX(-1px) scale(0.98);
        }

        .policy-back-link svg {
          transition: transform 0.2s ease;
        }

        .policy-back-link:hover svg {
          transform: translateX(-3px);
        }
      `}</style>
    </main>
  )
}