import React, { useEffect } from 'react';

// Import all page sections
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Marquee from './components/Marquee';
import About from './components/About';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Cursor from './components/Cursor';

function App() {
  // Fade sections in as they scroll into view
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="app">
      {/* Follower cursor (desktop only) */}
      <Cursor />

      {/* Navigation Bar */}
      <Navbar />

      {/* Main Hero Section (Top of page) */}
      <Hero />

      {/* Crossing ticker tapes */}
      <Marquee />

      {/* About Me Section */}
      <About />

      {/* Portfolio Projects Section */}
      <Projects />

      {/* Contact Section */}
      <Contact />

      <Footer />
    </div>
  );
}

export default App;
