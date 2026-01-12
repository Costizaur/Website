import React, { useState } from 'react';
import Folder from './Folder';
import Modal from './Modal';
import './Projects.css';
import Finder from './Finder';
import figma from '../assets/figma.png';
import calorieApp from '../assets/calorie-app.png';
import roomerrLogo from '../assets/roomerr-logo.png';
import roomerrScreens1 from '../assets/roomerr-screens-1.png';
import roomerrScreens2 from '../assets/roomerr-screens-2.png';
import unfoldStart from '../assets/unfold-g.webm';
import unfoldEnd from '../assets/unfold-g-reverse.webm';
import unfoldStartMobile from '../assets/unfold-g-90.webm';
import unfoldEndMobile from '../assets/unfold-g-90-reverse.webm';


const projects = [
  {
    id: 1,
    title: 'UI/UX Design Portfolio',
    description: 'A showcase of my design projects using industry-standard tools. Explore my work in Figma, Canva, and Sketch.',
    tags: ['Figma'],
    link: '#', // Replace with actual project link
    color: '#6366f1', // Indigo
    images: [
      {
        title: 'Roomerr',
        src: roomerrLogo,
        extraImages: [roomerrScreens1, roomerrScreens2],
        designLink: 'https://www.figma.com/proto/GsGKhpn6RRXChjF1Ux9aot/Untitled?page-id=0%3A1&node-id=136-1722&p=f&viewport=-7268%2C-3208%2C0.66&t=e9NU9ARW2bsyHmj4-1&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=136%3A1722',
        description: 'I built a high-fidelity app prototype in Figma based on an Instagram-style vertical swipe, translating familiar social media interaction patterns into a student matching experience. The design focuses on ease of use, fast decision-making, and clear information, reducing the learning curve and making browsing matches feel natural and intuitive.', unfoldVideoStart: unfoldStart, unfoldVideoEnd: unfoldEnd, unfoldVideoStartMobile: unfoldStartMobile, unfoldVideoEndMobile: unfoldEndMobile, unfoldText: [
          { title: "Process", items: ["Analyzed student housing platforms to identify usability and trust issues", "Studied popular social media apps to understand familiar interaction patterns", "Defined core needs: speed, clarity, and compatibility"] },
          { title: "Concept", items: ["Explored swipe-based matching to reduce decision fatigue", "Defined key matching criteria (budget, location, lifestyle)", "Created simple, fast user flows"] },
          { title: "Design", items: ["Designed low- to high-fidelity prototypes", "Built a mobile-first, card-based interface", "Focused on clear, scannable profile information"] },
          { title: "Test & Decide", items: ["A/B tested: Instagram-like vertical swipe vs Tinder-like horizontal swipe", "Chose vertical swiping for its familiarity and ease of use", "Finalized a matching experience optimized for quick browsing"] }
        ]
      },
      {
        title: 'Calorie App', src: calorieApp, description: 'This prototype exemplifies how I would gamify a simple calorie-tracking app to motivate people to continue their journey by adding rankings and badges. The app becomes more engaging and lively. Alongside this app, I also created a watch companion prototype that helps users log their food and track their progress.', designLink: 'https://www.figma.com/proto/hQbNFs1uEQt65pwNjoC4nO/Untitled?page-id=0%3A1&node-id=1-2&viewport=-155%2C334%2C0.51&t=tpcoy8Bx0x2wpUVq-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=1%3A2', unfoldVideoStart: unfoldStart, unfoldVideoEnd: unfoldEnd, unfoldVideoStartMobile: unfoldStartMobile, unfoldVideoEndMobile: unfoldEndMobile, unfoldText: [
          { title: "Process", items: ["Analyzed standard calorie-tracking apps to identify user churn and engagement drop-offs", "Conducted user research via Google Forms to understand what motivates users to log data consistently", "Defined the core challenge: transforming a monotonous data-entry task into a rewarding habit"] },
          { title: "Concept", items: ["Explored diverse gamification mechanics, ranging from mini-games to point systems and social leaderboards", "Conceptualized a \"Mission Tab\" to centralize goals and visualize progress", "Focused on extrinsic motivation triggers (badges and rankings) to combat user fatigue"] },
          { title: "Design", items: ["Integrated new features seamlessly by strictly adhering to the app’s existing visual language and UI patterns", "Designed a cohesive system of badges and a competitive ranking interface", "Expanded the ecosystem by creating a watch companion prototype for friction-free, on-the-go logging"] },
          { title: "Test & Decide", items: ["Surveyed potential users to compare the appeal of complex mini-games versus streamlined ranking systems", "Prioritized badges and rankings based on user preference for clear, achievement-based motivation"] }
        ]
      }
    ],
    folderImages: [roomerrLogo, calorieApp],
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
      { title: 'Coming Soon', description: 'Detailed breakdown of the portfolio development process coming soon.' }
    ],
    folderImages: ['#ec4899', '#fbcfe8', '#fce7f3'],
    longDescription: "This portfolio website is a custom project built with React, HTML, and CSS, created to demonstrate my growth and experience in front-end development."
  },
  {
    id: 3,
    title: 'Creative Coding',
    description: 'Experiments with code, interactivity, and generative art.',
    tags: ['p5.js', 'PeerJS'],
    link: '#',
    color: '#10b981',
    images: [
      { title: 'PeerJS Game', description: 'A game experiment using PeerJS for WebRTC connection. Scan the QR code with your phone to control the player on the screen using device orientation.', gameLink: '/game/index.html' }
    ],
    folderImages: ['#10b981', '#34d399', '#6ee7b7'],
    longDescription: 'Coming Soon'
  }
];

const Projects = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [showFinder, setShowFinder] = useState(false);

  const [currentCategoryProject, setCurrentCategoryProject] = useState(null);

  const handleOpenFinder = (e, project) => {
    e.preventDefault();
    setCurrentCategoryProject(project);
    setShowFinder(true);
  };

  const handleSelectProject = (project, index = 0) => {
    setShowFinder(false);

    // Create a scoped project object for the selected item
    const selectedItem = project.images[index];

    let scopedImages;
    if (selectedItem.extraImages && selectedItem.extraImages.length > 0) {
      scopedImages = selectedItem.extraImages.map((imgSrc, i) => {
        if (i === 0) {
          // Attach metadata to the first image so Modal picks it up
          return {
            src: imgSrc,
            unfoldVideoStart: selectedItem.unfoldVideoStart,
            unfoldVideoEnd: selectedItem.unfoldVideoEnd,
            unfoldVideoStartMobile: selectedItem.unfoldVideoStartMobile,
            unfoldVideoEndMobile: selectedItem.unfoldVideoEndMobile,
            unfoldText: selectedItem.unfoldText
          };
        }
        return imgSrc;
      });
    } else {
      scopedImages = [selectedItem];
    }

    const scopedProject = {
      ...project,
      title: selectedItem.title || project.title,
      description: selectedItem.description || project.description,
      images: scopedImages,
      designLink: selectedItem.designLink,
      gameLink: selectedItem.gameLink,
      initialIndex: 0 // Always start at 0 since there's only 1 item
    };

    setSelectedProject(scopedProject);
  };

  return (
    <section id="projects" className="section projects-section">
      <div className="container">
        <h2 className="section-title">Projects</h2>
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
                onClick={(e) => handleOpenFinder(e, project)}
                style={{ cursor: 'pointer' }}
              >
                <h3 className="project-title">{project.title}</h3>
                <p className="project-description">{project.description}</p>
                <div className="project-tags">
                  {project.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
                <a href={project.link} className="project-link" onClick={(e) => handleOpenFinder(e, project)}>
                  Projects &rarr;
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
          onBack={() => {
            setSelectedProject(null);
            setShowFinder(true);
          }}
        />
      )}

      {showFinder && (
        <Finder
          categories={projects}
          initialCategory={currentCategoryProject}
          onClose={() => setShowFinder(false)}
          onSelectProject={handleSelectProject}
        />
      )}
    </section>
  );
};

export default Projects;
