import React from 'react';

// Import all page sections
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Marquee from './components/Marquee';
import About from './components/About';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Footer from './components/Footer';

function App() {
  return (
    <div className="app">
      <a href="#main" className="skip-link">Skip to content</a>

      {/* Navigation Bar */}
      <Navbar />

      <main id="main">
        {/* Main Hero Section (Top of page) */}
        <Hero />

        {/* Skills ticker tape */}
        <Marquee />

        {/* Portfolio Projects Section */}
        <Projects />

        {/* About Me Section */}
        <About />

        {/* Contact Section */}
        <Contact />
      </main>

      <Footer />
    </div>
  );
}

export default App;
