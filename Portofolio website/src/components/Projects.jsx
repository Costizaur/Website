import React, { useState } from 'react';
import Folder from './Folder';
import Modal from './Modal';
import './Projects.css';
import canva from '../assets/canva.png';
import sketch from '../assets/sketch.png';
import figma from '../assets/figma.png';
import html from '../assets/html.png';
import css from '../assets/css.png';
import js from '../assets/js.png';
import unfoldStart from '../assets/unfold-g.webm';
import unfoldEnd from '../assets/unfold-g-reverse.webm';
import unfoldStartMobile from '../assets/unfold-g-90.webm';
import unfoldEndMobile from '../assets/unfold-g-90-reverse.webm';


const projects = [
  {
    id: 1,
    title: 'UI/UX Design Portfolio',
    description: 'A showcase of my design projects using industry-standard tools. Explore my work in Figma, Canva, and Sketch.',
    tags: ['Figma', 'Canva', 'Sketch'],
    link: '#', // Replace with actual project link
    color: '#6366f1', // Indigo
    images: [
      {
        src: figma, description: 'I built a high-fidelity app prototype in Figma based on an Instagram-style vertical swipe, translating familiar social media interaction patterns into a student matching experience. The design focuses on ease of use, fast decision-making, and clear information, reducing the learning curve and making browsing matches feel natural and intuitive.', unfoldVideoStart: unfoldStart, unfoldVideoEnd: unfoldEnd, unfoldVideoStartMobile: unfoldStartMobile, unfoldVideoEndMobile: unfoldEndMobile, unfoldText: [
          { title: "🧭 Process", items: ["Analyzed student housing platforms to identify usability and trust issues", "Studied popular social media apps to understand familiar interaction patterns", "Defined core needs: speed, clarity, and compatibility"] },
          { title: "Concept", items: ["Explored swipe-based matching to reduce decision fatigue", "Defined key matching criteria (budget, location, lifestyle)", "Created simple, fast user flows"] },
          { title: "Design", items: ["Designed low- to high-fidelity prototypes", "Built a mobile-first, card-based interface", "Focused on clear, scannable profile information"] },
          { title: "Test & Decide", items: ["A/B tested: Instagram-like vertical swipe vs Tinder-like horizontal swipe", "Chose vertical swiping for its familiarity and ease of use", "Finalized a matching experience optimized for quick browsing"] }
        ]
      },
      { src: sketch, description: 'Sketch: Utilized for vector-based icon and layout design.', unfoldVideoStart: unfoldStart, unfoldVideoEnd: unfoldEnd, unfoldVideoStartMobile: unfoldStartMobile, unfoldVideoEndMobile: unfoldEndMobile, unfoldText: 'Click to Reverse' },
      { src: canva, description: 'Canva: Created rapid mockups and presentation assets.', unfoldVideoStart: unfoldStart, unfoldVideoEnd: unfoldEnd, unfoldVideoStartMobile: unfoldStartMobile, unfoldVideoEndMobile: unfoldEndMobile, unfoldText: 'Click to Reverse' }
    ],
    folderImages: [figma, sketch, canva],
    longDescription: ''
  },
  {
    id: 2,
    title: 'Portfolio Website',
    description: "This portfolio website is a custom project built with React, HTML, and CSS, created to demonstrate my growth and experience in front-end development.",
    tags: ['React', 'HTML', 'CSS'],
    link: '#',
    color: '#ec4899',
    images: [
      { src: html, description: 'HTML5: Structured the semantic foundation of the application.', unfoldVideoStart: unfoldStart, unfoldVideoEnd: unfoldEnd, unfoldVideoStartMobile: unfoldStartMobile, unfoldVideoEndMobile: unfoldEndMobile, unfoldText: 'Click to Reverse' },
      { src: css, description: 'CSS3: Styled the interface with responsive and modern techniques.', unfoldVideoStart: unfoldStart, unfoldVideoEnd: unfoldEnd, unfoldVideoStartMobile: unfoldStartMobile, unfoldVideoEndMobile: unfoldEndMobile, unfoldText: 'Click to Reverse' },
      { src: js, description: 'JavaScript: Implemented dynamic features and real-time interactions.', unfoldVideoStart: unfoldStart, unfoldVideoEnd: unfoldEnd, unfoldVideoStartMobile: unfoldStartMobile, unfoldVideoEndMobile: unfoldEndMobile, unfoldText: 'Click to Reverse' }
    ],
    folderImages: [html, css, js],
    longDescription: "This portfolio website is a custom project built with React, HTML, and CSS, created to demonstrate my growth and experience in front-end development."
  },
  {
    id: 3,
    title: 'Project 3',
    description: 'Coming Soon',
    tags: [],
    link: '#',
    color: '#10b981',
    images: ['#10b981', '#34d399', '#6ee7b7'],
    folderImages: ['#10b981', '#34d399', '#6ee7b7'],
    longDescription: 'Coming Soon'
  }
];

const Projects = () => {
  const [selectedProject, setSelectedProject] = useState(null);

  const handleViewProject = (e, project) => {
    e.preventDefault();
    setSelectedProject(project);
  };

  return (
    <section id="projects" className="section projects-section">
      <div className="container">
        <h2 className="section-title">Featured Projects</h2>
        <div className="projects-grid">
          {projects.map((project) => (
            <div key={project.id} className="project-card">
              <div className="project-folder-container">
                <Folder
                  size={2}
                  color={project.color}
                  transparentPapers={!!project.folderImages}
                  items={(project.folderImages || project.images).map((item, index) => (
                    typeof item === 'string' && item.startsWith('#') ? (
                      <div
                        key={index}
                        className="gallery-item"
                        style={{ backgroundColor: item }}
                      >
                        <span>Img {index + 1}</span>
                      </div>
                    ) : (
                      <img
                        key={index}
                        src={item}
                        alt={`Project ${index + 1}`}
                        className="gallery-item-image"
                        style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '4px', background: 'transparent' }}
                      />
                    )
                  ))}
                />
              </div>
              <div
                className="project-content"
                onClick={(e) => handleViewProject(e, project)}
                style={{ cursor: 'pointer' }}
              >
                <h3 className="project-title">{project.title}</h3>
                <p className="project-description">{project.description}</p>
                <div className="project-tags">
                  {project.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
                <a href={project.link} className="project-link" onClick={(e) => handleViewProject(e, project)}>
                  View Project &rarr;
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedProject && (
        <Modal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </section>
  );
};

export default Projects;
