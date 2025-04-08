// src/components/Navbar.js
"use client";

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav
      style={{ backgroundColor: '#6B46C1' }}
      className="text-white p-4 flex justify-between items-center shadow-lg"
    >
      {/* Logo */}
      <Link href="/" className="text-2xl font-bold tracking-tight">
        PosterCraft
      </Link>

      {/* Hamburger Icon (Visible on Mobile) */}
      <button
        className="md:hidden focus:outline-none"
        onClick={toggleMobileMenu}
        aria-label="Toggle mobile menu"
      >
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={isMobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
          />
        </svg>
      </button>

      {/* Desktop Menu (Hidden on Mobile) */}
      <div className="hidden md:flex space-x-6 items-center">
        <Link href="/templates" className="hover:text-gray-300 transition-colors">
          Templates
        </Link>
        <Link href="/design/start" className="hover:text-gray-300 transition-colors">
          Design
        </Link>
        <Link href="/pricing" className="hover:text-gray-300 transition-colors">
          Pricing
        </Link>
        {session ? (
          <>
            <span className="text-sm">{session.user.email}</span>
            <button
              onClick={() => signOut()}
              className="bg-gray-300 text-purple-800 px-4 py-2 rounded-full font-semibold hover:bg-gray-400 transition-colors"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link href="/signup" className="hover:text-gray-300 transition-colors">
              Sign Up
            </Link>
            <Link href="/signin" className="hover:text-gray-300 transition-colors">
              Sign In
            </Link>
          </>
        )}
      </div>

      {/* Mobile Menu (Visible on Mobile when Open) */}
      <div
        className={`${
          isMobileMenuOpen ? 'flex' : 'hidden'
        } md:hidden absolute top-16 left-0 w-full h-[calc(100vh-4rem)] bg-purple-700 flex-col items-center justify-center space-y-6 text-xl transition-all duration-300 z-50`}
      >
        <Link
          href="/templates"
          className="hover:text-gray-300 transition-colors"
          onClick={toggleMobileMenu}
        >
          Templates
        </Link>
        <Link
          href="/design/start"
          className="hover:text-gray-300 transition-colors"
          onClick={toggleMobileMenu}
        >
          Design
        </Link>
        <Link
          href="/pricing"
          className="hover:text-gray-300 transition-colors"
          onClick={toggleMobileMenu}
        >
          Pricing
        </Link>
        {session ? (
          <>
            <span className="text-sm">{session.user.email}</span>
            <button
              onClick={() => {
                signOut();
                toggleMobileMenu();
              }}
              className="bg-gray-300 text-purple-800 px-4 py-2 rounded-full font-semibold hover:bg-gray-400 transition-colors"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link
              href="/signup"
              className="hover:text-gray-300 transition-colors"
              onClick={toggleMobileMenu}
            >
              Sign Up
            </Link>
            <Link
              href="/signin"
              className="hover:text-gray-300 transition-colors"
              onClick={toggleMobileMenu}
            >
              Sign In
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}