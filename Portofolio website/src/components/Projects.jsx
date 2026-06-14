import React, { useState } from 'react';

// Import sub-components
import Folder from './Folder';
import Modal from './Modal';
import Finder from './Finder';
import './Projects.css';

// Import assets (Images/Videos)
import figma from '../assets/figma.png';
import calorieApp from '../assets/calorie-app.png';
import roomerrLogo from '../assets/roomerr-logo.png';
import roomerrScreens1 from '../assets/roomerr-screens-1.png';
import roomerrScreens2 from '../assets/roomerr-screens-2.png';
import unfoldStart from '../assets/unfold-g.webm';
import unfoldEnd from '../assets/unfold-g-reverse.webm';
import unfoldStartMobile from '../assets/unfold-g-90.webm';
import unfoldEndMobile from '../assets/unfold-g-90-reverse.webm';
import riverRacerTitle from '../assets/river-racer-title.png';
import riverRacerGameplay from '../assets/river-racer-gameplay.png';

// --- PROJECT DATA ---
const projects = [
  {
    id: 1,
    title: 'UI/UX Design',
    description: 'A showcase of my user interface and user experience designs using Figma, Sketch, and other industry tools.',
    tags: ['Figma', 'UI/UX'],
    link: '#',
    color: '#6366f1', // Indigo
    images: [
      {
        title: 'Roomerr',
        src: roomerrLogo,
        extraImages: [roomerrScreens1, roomerrScreens2],
        designLink: 'https://www.figma.com/proto/GsGKhpn6RRXChjF1Ux9aot/Untitled?page-id=0%3A1&node-id=136-1722&p=f&viewport=-7268%2C-3208%2C0.66&t=e9NU9ARW2bsyHmj4-1&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=136%3A1722',
        description: 'I built a high-fidelity app prototype in Figma based on an Instagram-style vertical swipe, translating familiar social media interaction patterns into a student matching experience.',
        unfoldVideoStart: unfoldStart,
        unfoldVideoEnd: unfoldEnd,
        unfoldVideoStartMobile: unfoldStartMobile,
        unfoldVideoEndMobile: unfoldEndMobile,
        unfoldText: [
          { title: "Process", items: ["Analyzed student housing platforms to identify usability and trust issues", "Studied popular social media apps to understand familiar interaction patterns", "Defined core needs: speed, clarity, and compatibility"] },
          { title: "Concept", items: ["Explored swipe-based matching to reduce decision fatigue", "Defined key matching criteria (budget, location, lifestyle)", "Created simple, fast user flows"] },
          { title: "Design", items: ["Designed low- to high-fidelity prototypes", "Built a mobile-first, card-based interface", "Focused on clear, scannable profile information"] },
          { title: "Test & Decide", items: ["A/B tested: Instagram-like vertical swipe vs Tinder-like horizontal swipe", "Chose vertical swiping for its familiarity and ease of use", "Finalized a matching experience optimized for quick browsing"] }
        ]
      },
      {
        title: 'Calorie App',
        src: calorieApp,
        description: 'This prototype exemplifies how I would gamify a simple calorie-tracking app to motivate people to continue their journey by adding rankings and badges.',
        designLink: 'https://www.figma.com/proto/hQbNFs1uEQt65pwNjoC4nO/Untitled?page-id=0%3A1&node-id=1-2&viewport=-155%2C334%2C0.51&t=tpcoy8Bx0x2wpUVq-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=1%3A2',
        unfoldVideoStart: unfoldStart,
        unfoldVideoEnd: unfoldEnd,
        unfoldVideoStartMobile: unfoldStartMobile,
        unfoldVideoEndMobile: unfoldEndMobile,
        unfoldText: [
          { title: "Process", items: ["Analyzed standard calorie-tracking apps to identify user churn and engagement drop-offs", "Conducted user research via Google Forms to understand what motivates users to log data consistently", "Defined the core challenge: transforming a monotonous data-entry task into a habit-forming routine"] },
          { title: "Concept", items: ["Explored diverse gamification mechanics, ranging from mini-games to point systems and social leaderboards", "Conceptualized a \"Mission Tab\" to centralize goals and visualize progress", "Focused on extrinsic motivation triggers (badges and rankings) to combat user fatigue"] },
          { title: "Design", items: ["Integrated new features seamlessly by strictly adhering to the app’s existing visual language and UI patterns", "Designed a cohesive system of badges and a competitive ranking interface", "Expanded the ecosystem by creating a watch companion prototype for friction-free, on-the-go logging"] },
          { title: "Test & Decide", items: ["Surveyed potential users to compare the appeal of complex mini-games versus streamlined ranking systems", "Prioritized badges and rankings based on user preference for clear, achievement-based motivation"] }
        ]
      },
      {
        title: 'Finance Dashboard (Design)',
        src: '#4f46e5',
        description: 'A premium, modern dark-mode financial dashboard prototype designed in Figma. Features detailed holdings charts, asset allocation graphs, and custom UI components.',
        designLink: 'https://www.figma.com/',
        longDescription: 'This UI/UX project showcases high-fidelity mockups of a comprehensive financial tracking application, using polished glassmorphism effects, consistent layout grids, and visual hierarchy optimized for readability.'
      }
    ],
    folderImages: [roomerrLogo, calorieApp], // Icons shown on the closed folder
    longDescription: 'A collection of my user experience research and user interface design works.'
  },
  {
    id: 2,
    title: 'Web Development',
    description: 'Custom-built web applications and front-end implementations with React, JavaScript, HTML, and CSS.',
    tags: ['React', 'HTML', 'CSS', 'JavaScript'],
    link: '#',
    color: '#ec4899', // Pink
    images: [
      {
        title: 'Portfolio Website',
        src: figma,
        description: 'My custom developer portfolio website built using React, CSS, and interactive components like macOS-style windows and animations.',
        longDescription: 'This site is coded with reusable React components, custom responsive CSS animations, and macOS desktop mimicking file navigations.'
      },
      {
        title: 'Streamlit Finance Dashboard',
        src: '#2563eb',
        description: 'A live financial dashboard built with Python and Streamlit, connecting to a Google Sheets database to pull, process, and display live investment metrics and signals.',
        longDescription: 'Leverages the GSheetsConnection API to read real-time scorecards, automatically evaluates indicator strengths, and renders dynamic, color-coded Plotly gauge widgets representing strong buy/buy/hold/sell signals.',
        tags: ['Python', 'Streamlit', 'Plotly', 'Google Sheets API']
      }
    ],
    folderImages: ['#ec4899', '#fbcfe8', '#fce7f3'],
    longDescription: 'Responsive and dynamic web applications built with modern frontend tools.'
  },
  {
    id: 3,
    title: 'Game Development',
    description: 'Interactivity, multiplayer systems, and game mechanics built using p5.js and PeerJS.',
    tags: ['p5.js', 'PeerJS', 'Games'],
    link: '#',
    color: '#10b981', // Emerald
    images: [
      {
        title: 'River Racer',
        description: 'A retro-style local multiplayer racing game. Use your smartphone as a controller to navigate dangerous waters, avoid obstacles, and outlast your friends.',
        gameLink: '/game2/index.html',
        src: riverRacerTitle,
        extraImages: [riverRacerTitle, riverRacerGameplay]
      },
      {
        title: 'PeerJS Game',
        description: 'A multiplayer game experiment leveraging PeerJS for direct browser-to-browser connections.',
        gameLink: '/game/index.html'
      }
    ],
    folderImages: ['#10b981', riverRacerTitle],
    longDescription: 'Engaging interactive mechanics and local multiplayer web games.'
  },
  {
    id: 4,
    title: 'Video Production',
    description: 'Cinematic ads, marketing materials, and video edits created using CapCut and professional editing tools.',
    tags: ['CapCut', 'Video Editing', 'Media'],
    link: '#',
    color: '#f59e0b', // Amber
    images: [
      {
        title: 'Car Advertisement Ad',
        src: '#f59e0b',
        extraImages: ['#f59e0b', '/car-ad-video.mp4'],
        description: 'A high-impact promotional ad for a luxury car, designed and edited in CapCut. Focuses on music synchronization, dynamic sound design, transitions, and speed ramping.',
        longDescription: 'A complete car commercial edit from scratch, demonstrating timing, visual pacing, audio engineering, and color grading techniques in CapCut.'
      },
      {
        title: 'Promotional Video',
        src: '#fbbf24',
        extraImages: ['#fbbf24', '/promotional-video.mp4'],
        description: 'A promotional branding and marketing video utilizing motion graphics and professional post-production workflows.',
        longDescription: 'Video showcase exhibiting brand values, product highlights, and cinematic cuts.'
      }
    ],
    folderImages: ['#f59e0b', '#fbbf24'],
    longDescription: 'Video editing, storytelling, and digital marketing materials.'
  }
];


const Projects = () => {
  const [selectedProject, setSelectedProject] = useState(null); // For Modal
  const [showFinder, setShowFinder] = useState(false); // For Finder window

  const [currentCategoryProject, setCurrentCategoryProject] = useState(null);

  // Open the MacOS-style Finder window for a category
  const handleOpenFinder = (e, project) => {
    e.preventDefault();
    setCurrentCategoryProject(project);
    setShowFinder(true);
  };

  // Select a specific project to show details for
  const handleSelectProject = (project, index = 0) => {
    setShowFinder(false);

    const selectedItem = project.images[index];

    // Prepare images for the carousel/modal
    let scopedImages;
    if (selectedItem.extraImages && selectedItem.extraImages.length > 0) {
      scopedImages = selectedItem.extraImages.map((imgSrc, i) => {
        if (i === 0) {
          // Attach metadata (video/text) to first image
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

    // Create a temporary object for the Modal to read
    const scopedProject = {
      ...project,
      title: selectedItem.title || project.title,
      description: selectedItem.description || project.description,
      images: scopedImages,
      designLink: selectedItem.designLink,
      gameLink: selectedItem.gameLink,
      initialIndex: 0
    };

    setSelectedProject(scopedProject);
  };

  return (
    <section id="projects" className="section projects-section">
      <div className="container">
        <h2 className="section-title">Projects</h2>

        {/* Grid of Project Folders */}
        <div className="projects-grid">
          {projects.map((project) => (
            <div key={project.id} className="project-card">

              {/* Folder Icon Component */}
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

              {/* Project Text Info */}
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

      {/* Project Detail Modal */}
      {selectedProject && (
        <Modal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onBack={() => {
            setSelectedProject(null);
            setShowFinder(true); // Go back to Finder
          }}
        />
      )}

      {/* Categories Finder Window */}
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
