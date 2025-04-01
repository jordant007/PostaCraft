"use client";


import { SessionProvider } from 'next-auth/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/globals.css'; // Import global styles

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <SessionProvider>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}