// src/app/page.js
"use client";

import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>Welcome to PosterCraft</h1>
          <p className={styles.heroSubtitle}>Design stunning event flyers and business posters with ease.</p>
          <Link href="/design" className={styles.ctaButton}>Start Designing</Link>
        </section>

        <section className={styles.features}>
          <div className={styles.featureCard}>
            <h2 className={styles.featureTitle}>Custom Templates</h2>
            <p className={styles.featureText}>Choose from a variety of sleek, pre-designed templates to kickstart your project.</p>
          </div>
          <div className={styles.featureCard}>
            <h2 className={styles.featureTitle}>Powerful Tools</h2>
            <p className={styles.featureText}>Add text, images, and shapes with our intuitive drag-and-drop editor.</p>
          </div>
          <div className={styles.featureCard}>
            <h2 className={styles.featureTitle}>Premium Access</h2>
            <p className={styles.featureText}>Unlock exclusive features with our affordable subscription plans.</p>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 bg-gray-100">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-12" style={{ color: '#1a202c' }}>
              What Our Users Say
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                <p className="text-lg italic mb-4" style={{ color: '#4a5568' }}>
                  “PosterCraft made designing my event flyer so easy! The templates are beautiful and the editor is super intuitive.”
                </p>
                <p className="font-semibold" style={{ color: '#3182ce' }}>- Sarah M.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                <p className="text-lg italic mb-4" style={{ color: '#4a5568' }}>
                  “I upgraded to the Premium plan and it was worth every penny. The advanced tools saved me so much time!”
                </p>
                <p className="font-semibold" style={{ color: '#3182ce' }}>- John D.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                <p className="text-lg italic mb-4" style={{ color: '#4a5568' }}>
                  “The drag-and-drop editor is a game-changer. I created a professional poster in minutes!”
                </p>
                <p className="font-semibold" style={{ color: '#3182ce' }}>- Emily R.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Banner */}
        <section className="py-16" style={{ backgroundColor: '#3182ce' }}>
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4" style={{ color: '#ffffff' }}>
              Ready to Create Your Masterpiece?
            </h2>
            <p className="text-lg mb-6" style={{ color: '#e2e8f0' }}>
              Join thousands of users who are designing stunning posters with PosterCraft. Start for free or upgrade for premium features!
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/design"
                className="inline-block px-6 py-3 rounded-lg font-semibold"
                style={{ backgroundColor: '#ffffff', color: '#3182ce' }}
              >
                Start Designing Now
              </Link>
              <Link
                href="/pricing"
                className="inline-block px-6 py-3 rounded-lg font-semibold border-2"
                style={{ borderColor: '#ffffff', color: '#ffffff' }}
              >
                View Pricing Plans
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}