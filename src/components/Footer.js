// src/components/Footer.js
import Link from 'next/link';

export default function Footer() {
  return (
    <footer
      className="text-white py-8"
      style={{
        background: 'linear-gradient(135deg, #1a202c, #3182ce)', // Dark gray to blue gradient
      }}
    >
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-bold mb-4" style={{ color: '#ffffff' }}>
            Quick Links
          </h3>
          <ul className="space-y-2">
            <li>
              <Link href="/" className="hover:underline" style={{ color: '#e2e8f0' }}>
                Home
              </Link>
            </li>
            <li>
              <Link href="/design" className="hover:underline" style={{ color: '#e2e8f0' }}>
                Design
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="hover:underline" style={{ color: '#e2e8f0' }}>
                Pricing
              </Link>
            </li>
            <li>
              <Link href="/signup" className="hover:underline" style={{ color: '#e2e8f0' }}>
                Sign Up
              </Link>
            </li>
            <li>
              <Link href="/signin" className="hover:underline" style={{ color: '#e2e8f0' }}>
                Sign In
              </Link>
            </li>
          </ul>
        </div>

        {/* Newsletter Signup */}
        <div>
          <h3 className="text-xl font-bold mb-4" style={{ color: '#ffffff' }}>
            Stay Updated
          </h3>
          <p className="mb-4" style={{ color: '#e2e8f0' }}>
            Subscribe to our newsletter for the latest updates and offers.
          </p>
          <form className="flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full p-2 rounded-lg text-gray-800 focus:outline-none"
              style={{ backgroundColor: '#f7fafc', borderColor: '#cbd5e0' }}
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg font-semibold"
              style={{ backgroundColor: '#ffffff', color: '#3182ce' }}
            >
              Subscribe
            </button>
          </form>
        </div>

        {/* Social Media Icons */}
        <div>
          <h3 className="text-xl font-bold mb-4" style={{ color: '#ffffff' }}>
            Follow Us
          </h3>
          <div className="flex gap-4 justify-center md:justify-start">
            {/* Twitter Icon */}
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <svg
                className="w-8 h-8"
                fill="#e2e8f0"
                viewBox="0 0 24 24"
                style={{ transition: 'fill 0.3s' }}
                onMouseOver={(e) => (e.currentTarget.style.fill = '#1DA1F2')}
                onMouseOut={(e) => (e.currentTarget.style.fill = '#e2e8f0')}
              >
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
              </svg>
            </a>
            {/* Instagram Icon */}
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <svg
                className="w-8 h-8"
                fill="#e2e8f0"
                viewBox="0 0 24 24"
                style={{ transition: 'fill 0.3s' }}
                onMouseOver={(e) => (e.currentTarget.style.fill = '#E1306C')}
                onMouseOut={(e) => (e.currentTarget.style.fill = '#e2e8f0')}
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
            {/* Facebook Icon */}
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <svg
                className="w-8 h-8"
                fill="#e2e8f0"
                viewBox="0 0 24 24"
                style={{ transition: 'fill 0.3s' }}
                onMouseOver={(e) => (e.currentTarget.style.fill = '#4267B2')}
                onMouseOut={(e) => (e.currentTarget.style.fill = '#e2e8f0')}
              >
                <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-8 text-center border-t pt-4" style={{ borderColor: '#4a5568' }}>
        <p style={{ color: '#e2e8f0' }}>
          © 2025 PosterCraft. All rights reserved.
        </p>
      </div>
    </footer>
  );
}