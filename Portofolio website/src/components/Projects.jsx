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
import financeDashboard from '../assets/finance-dashboard.png';
import streamlit from '../assets/streamlit.png';
import musterMenu from '../assets/muster-menu.jpg';
import musterPhase from '../assets/muster-muster-phase.jpg';
import musterLineup from '../assets/muster-lineup.jpg';
import musterBattle from '../assets/muster-battle.jpg';
import musterHowToPlay from '../assets/muster-how-to-play.jpg';
import musterPhone from '../assets/muster-phone.jpg';

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
        src: financeDashboard,
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
        title: 'Live Finance Dashboard',
        src: financeDashboard,
        description: 'This project bridges the gap between raw data and actionable insights. Built with Python, Streamlit, and Plotly, this web application connects securely to a live Google Sheet to track multi-month financial momentum.',
        longDescription: 'By applying UX research from professional analytics platforms, I designed a top-down visual hierarchy that automatically cleans complex data and presents immediate, readable strategy signals to the user.',
        tags: ['Python', 'Streamlit', 'Plotly', 'Google Sheets API'],
        liveLink: 'https://financedashboard-lbekvafqjqn6jsvtrtgn6b.streamlit.app/'
      }
    ],
    folderImages: [streamlit, figma],
    longDescription: 'Responsive and dynamic web applications built with modern frontend tools.'
  },
  {
    id: 3,
    title: 'Game Design',
    description: 'Games designed around meaningful decisions, clear feedback and fair balance, from a dice-driven strategy duel to phone-controlled party games.',
    tags: ['Game Design', 'Systems', 'Balancing', 'Playtesting'],
    link: '#',
    color: '#10b981', // Emerald
    images: [
      {
        title: 'Muster',
        src: musterMenu,
        extraImages: [musterMenu, musterPhase, musterLineup, musterBattle, musterHowToPlay, musterPhone],
        description: 'A 5-minute, two-player strategy duel. Each turn you roll three dice and spend them on six actions to grow your economy and recruit an army, then secretly order your troops for a battle where counters and wounds decide who holds the line.',
        longDescription: 'My goal was a short match where every die is a real decision and no single strategy wins. Dice work like workers, a four-unit counter cycle keeps every unit useful, hidden armies make scouting and reading your opponent pay off, and I balanced the numbers by simulating thousands of bot matches. Playable in the browser on desktop and phone.',
        tags: ['Game Design', 'Systems Design', 'Balancing', 'Playtesting'],
        tools: ['Unity', 'C#', 'Figma', 'Excel'],
        gameLink: '/muster/index.html',
        unfoldVideoStart: unfoldStart,
        unfoldVideoEnd: unfoldEnd,
        unfoldVideoStartMobile: unfoldStartMobile,
        unfoldVideoEndMobile: unfoldEndMobile,
        unfoldText: [
          { title: "Process", items: ["Set the design goals: a full match in about 5 minutes, every die a meaningful choice, and no dominant strategy", "Defined the core loop: roll, assign dice, build an army, line up in secret, battle", "Kept every tunable number in one config and an Excel balance model, so rules could change without rewriting code"] },
          { title: "Concept", items: ["Dice as workers: each action needs a certain roll, so even a 1 is useful (Scouting needs a 1 or 2)", "A four-unit counter cycle (Knight → Ranger → Mage → Barbarian) so no unit is simply the best", "Hidden armies: opponents only see your unit count, which makes Scout and Sabotage worth spending a die on"] },
          { title: "Design", items: ["Two resources with hard caps and use-it-or-lose-it dice, so hoarding never beats spending", "Attrition battles: winners carry their wounds into the next duel, so one strong unit can't carry a whole army", "Designed a chunky tabletop UI in Figma, then adapted it into a landscape phone layout for playtesting"] },
          { title: "Test & Decide", items: ["Built bots for four strategies and simulated about 24,000 matches to measure win rates", "Balanced (67%), elite (61%) and counter (58%) play all stay viable; the attrition rule and the full counter cycle stop 'go elite' from dominating", "Kept all-Barbarian spam weak (15%) as a deliberate trap, and gave Red +1 starting gold to offset Blue moving first"] }
        ]
      },
      {
        title: 'River Racer',
        description: 'A local multiplayer racing game where your phone is the controller. Scan a QR code, steer down the river, dodge obstacles and outlast your friends.',
        longDescription: 'Designed for instant, social play: joining takes one scan, and steering uses a single left-right axis so anyone can play within seconds. Hitting an obstacle stuns you, knocks you back and buzzes your phone, so every mistake is felt. Fall behind the screen for too long and you are out, which turns every collision into a comeback moment for the other player.',
        tags: ['Game Design', 'Local Multiplayer', 'Phone Controls'],
        tools: ['p5.js', 'PeerJS', 'JavaScript'],
        gameLink: '/game2/index.html',
        src: riverRacerTitle,
        extraImages: [riverRacerTitle, riverRacerGameplay]
      },
      {
        title: 'Duck Shoot',
        description: 'A light-gun style shooting game played with your phone: tilt to aim the crosshair, hit the big red Fire button, and keep up as the ducks fly faster every wave.',
        longDescription: 'An experiment in motion controls. I wanted the phone to feel like a physical toy gun, so aiming follows the tilt of the phone and every shot flashes the screen. A new wave every 500 points speeds the ducks up, so the challenge keeps climbing as your aim improves.',
        tags: ['Game Design', 'Motion Controls', 'Phone Controls'],
        tools: ['p5.js', 'PeerJS', 'JavaScript'],
        gameLink: '/game/index.html'
      }
    ],
    folderImages: [musterMenu, riverRacerTitle], // Icons shown on the closed folder
    longDescription: 'Games where I led the design: core loops, rules, player feedback and balancing, prototyped in Unity and p5.js.'
  },
  /* Hidden for now — Video Production folder
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
        extraImages: ['https://api.frp2.ovp.kaltura.com/p/10345/embedPlaykitJs/uiconf_id/23456908?iframeembed=true&entry_id=0_jqz24mex&config[provider]={"widgetId":"0_45sdsy6b"}'],
        description: 'This short-form promotional video transforms raw, commercial-grade footage into a cinematic, fast-paced automotive edit. Designed specifically to capture attention on modern social media platforms, the project showcases advanced post-production techniques and a keen eye for visual storytelling. The edit features precise rhythmic pacing, where sudden speed ramps and dynamic cuts are tightly synchronized to a custom audio mix of heavy bass and mechanical exhaust notes.',
        longDescription: 'By utilizing complex environmental tree masks and vibrant color grading, the vehicle is cleanly isolated from distracting backgrounds, maintaining a sharp and professional visual hierarchy. From the initial organization of dozens of fragmented takes to the implementation of dynamic typography and multi-layered sound design, this piece demonstrates a complete, end-to-end video editing pipeline engineered for maximum viewer retention.'
      }
    ],
    folderImages: ['#f59e0b'],
    longDescription: 'Video editing, storytelling, and digital marketing materials.'
  }
  */
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

    // Create a temporary object for the Modal to read (item fields override the folder's)
    const scopedProject = {
      ...project,
      title: selectedItem.title || project.title,
      description: selectedItem.description || project.description,
      longDescription: selectedItem.longDescription || project.longDescription,
      tags: selectedItem.tags || project.tags,
      tools: selectedItem.tools || project.tools,
      images: scopedImages,
      designLink: selectedItem.designLink,
      gameLink: selectedItem.gameLink,
      liveLink: selectedItem.liveLink,
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
