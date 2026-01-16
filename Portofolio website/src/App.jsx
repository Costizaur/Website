import React from 'react';

// Import all page sections
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Contact from './components/Contact';

function App() {
  return (
    <div className="app">
      {/* Navigation Bar */}
      <Navbar />

      {/* Main Hero Section (Top of page) */}
      <Hero />

      {/* About Me Section */}
      <About />

      {/* Portfolio Projects Section */}
      <Projects />

      {/* Contact Section */}
      <Contact />
    </div>
  );
}

export default App;
