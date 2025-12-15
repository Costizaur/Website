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

const projects = [
  {
    id: 1,
    title: 'UI/UX Design Portfolio',
    description: 'A showcase of my design projects using industry-standard tools. Explore my work in Figma, Canva, and Sketch.',
    tags: ['Figma', 'Canva', 'Sketch'],
    link: '#', // Not used for modal trigger
    color: '#3b82f6',
    images: ['#3b82f6', '#60a5fa', '#93c5fd'], // Color placeholders for carousel
    folderImages: [figma, sketch, canva], // Reversed images for folder papers
    longDescription: 'multiple projects in this area. This is a detailed view where you can explain your design process, tools used, and the outcome of the project.'

  },
  {
    id: 2,
    title: 'Social Media App',
    description: 'A responsive social platform allowing users to connect, share content, and interact in real-time.',
    tags: ['Vue.js', 'Firebase', 'Sass'],
    link: '#',
    color: '#ec4899',
    images: ['#ec4899', '#f472b6', '#fbcfe8'],
    folderImages: [html, css, js],
    longDescription: 'A comprehensive social media platform built with Vue.js. This project features real-time chat, file sharing, and a responsive design that works seamlessly across devices.'
  },
  {
    id: 3,
    title: 'Task Management Tool',
    description: 'A productivity application designed to help teams organize tasks and collaborate efficiently.',
    tags: ['TypeScript', 'React', 'Redux'],
    link: '#',
    color: '#10b981',
    images: ['#10b981', '#34d399', '#6ee7b7'],
    longDescription: 'An efficient task management tool built with React and TypeScript. It includes drag-and-drop task organization, team collaboration features, and detailed progress tracking.'
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
