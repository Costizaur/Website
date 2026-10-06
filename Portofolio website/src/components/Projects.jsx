import React, { useState } from 'react';
import { ArrowRight } from '@phosphor-icons/react';

// Import sub-components
import Folder from './Folder';
import ProjectWindow from './ProjectWindow';
import Featured from './Featured';
import './Projects.css';

// Import assets (Images/Videos)
import calorieApp from '../assets/calorie-app.png';
import shiftProFinal from '../assets/shiftpro-final.jpg';
import shiftProResearch from '../assets/shiftpro-1-research.jpg';
import shiftProLoFi from '../assets/shiftpro-2-lofi.jpg';
import shiftProHiFi from '../assets/shiftpro-3-hifi.jpg';
import unfoldStart from '../assets/unfold-g.webm';
import unfoldEnd from '../assets/unfold-g-reverse.webm';
import unfoldStartMobile from '../assets/unfold-g-90.webm';
import unfoldEndMobile from '../assets/unfold-g-90-reverse.webm';
import riverRacerRace from '../assets/river-racer-race.jpg';
import riverRacerLobby from '../assets/river-racer-lobby.jpg';
import riverRacerController from '../assets/river-racer-controller.jpg';
import riverRacerResults from '../assets/river-racer-results.jpg';
import duckShootPlay from '../assets/duck-shoot-play.jpg';
import duckShootTitle from '../assets/duck-shoot-title.jpg';
import duckShootFlyAway from '../assets/duck-shoot-flyaway.jpg';
import duckShootController from '../assets/duck-shoot-controller.jpg';
import portfolioHero from '../assets/portfolio-hero.jpg';
import portfolioAbout from '../assets/portfolio-about.jpg';
import portfolioWork from '../assets/portfolio-work.jpg';
import financeDashboard from '../assets/finance-dashboard.png';
import musterMenu from '../assets/muster-menu.jpg';
import musterPhase from '../assets/muster-muster-phase.jpg';
import musterLineup from '../assets/muster-lineup.jpg';
import musterBattle from '../assets/muster-battle.jpg';
import musterHowToPlay from '../assets/muster-how-to-play.jpg';
import musterPhone from '../assets/muster-phone.jpg';

// App icons shown in the Finder and on the folder papers
import iconShiftPro from '../assets/icons/shiftpro.png';
import iconCalorie from '../assets/icons/calorie-app.png';
import iconFinanceDesign from '../assets/icons/finance-design.png';
import iconFinanceLive from '../assets/icons/finance-live.png';
import iconPortfolio from '../assets/icons/portfolio.png';
import iconMuster from '../assets/icons/muster.png';
import iconRiverRacer from '../assets/icons/river-racer.png';
import iconDuckShoot from '../assets/icons/duck-shoot.png';
import iconEarshot from '../assets/icons/earshot.png';
import earshotHero from '../assets/earshot-hero.jpg';
import earshotHow from '../assets/earshot-how.jpg';
import earshotMenu from '../assets/earshot-menu.png';

// --- PROJECT DATA ---
const projects = [
  {
    id: 1,
    title: 'UI/UX Design',
    description: 'A showcase of my user interface and user experience designs using Figma, Sketch, and other industry tools.',
    tags: ['Figma', 'UI/UX'],
    link: '#',
    color: '#ff7a6b', // Coral
    images: [
      {
        title: 'ShiftPro',
        icon: iconShiftPro,
        src: shiftProFinal,
        extraImages: [shiftProFinal, shiftProResearch, shiftProLoFi, shiftProHiFi],
        designLink: 'https://www.figma.com/proto/iy2G6HL5QwJBaxSke646jH/Design-Thinking?page-id=0%3A1&node-id=304-590&scaling=scale-down&content-scaling=fixed&starting-point-node-id=304%3A590',
        description: 'At Primark, where I work, the schedule is a printed sheet in a hallway, so swapping a shift comes down to luck. I interviewed a colleague and an HR assistant, then designed ShiftPro: a mobile app where staff can check their shifts anywhere, swap them and read company news.',
        longDescription: 'A Design Thinking project that went from interviews to three rounds of prototypes: grey lo-fi wireframes, a hi-fi version and a final version. I tested each round (3 people on the lo-fi, 9 on the hi-fi) and let the feedback decide what changed next.',
        tags: ['Figma', 'UI/UX', 'User Research', 'Usability Testing'],
        tools: ['Figma', 'Figma Make'],
        unfoldVideoStart: unfoldStart,
        unfoldVideoEnd: unfoldEnd,
        unfoldVideoStartMobile: unfoldStartMobile,
        unfoldVideoEndMobile: unfoldEndMobile,
        unfoldText: [
          { title: "Process", items: ["Picked a real problem from my job: the Primark schedule only exists as a printed sheet in the hallway", "Interviewed a colleague and an HR assistant to hear both sides of the story", "Both blamed the paper: staff can't check or swap shifts easily, and HR reprints it every week"] },
          { title: "Concept", items: ["Tried Deputy, Planday and Quinyx to see how other apps handle swaps and time off", "A customer journey map showed that swapping a shift is the worst moment, so it became the priority", "Planned a simple app: log in, then one tap to your schedule, swaps, sick reports and news"] },
          { title: "Design", items: ["Started with grey lo-fi wireframes for one task: change your shift", "Moved to hi-fi with a logo, Primark-inspired blue and shifts grouped by day on clear cards", "Split the unclear 'swap' button into Request (post your shift) and Pick Up (take someone else's)"] },
          { title: "Test & Decide", items: ["Lo-fi, 3 tests: the screens were clear, but changing the shift was hard and the layout needed grouping and colour", "Hi-fi, 9 tests: people found it simple and familiar, and 3 of them asked for a way to look ahead by date", "Final version: added a calendar view, moved the profile to the top and made faded text fully readable"] }
        ]
      },
      {
        title: 'Calorie App',
        icon: iconCalorie,
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
        icon: iconFinanceDesign,
        src: financeDashboard,
        description: 'A premium, modern dark-mode financial dashboard prototype designed in Figma. Features detailed holdings charts, asset allocation graphs, and custom UI components.',
        designLink: 'https://www.figma.com/',
        longDescription: 'This UI/UX project showcases high-fidelity mockups of a comprehensive financial tracking application, using polished glassmorphism effects, consistent layout grids, and visual hierarchy optimized for readability.'
      }
    ],
    folderImages: [iconShiftPro, iconCalorie, iconFinanceDesign], // Icons that pop out of the folder
    longDescription: 'A collection of my user experience research and user interface design works.'
  },
  {
    id: 2,
    title: 'Web Development',
    description: 'Custom-built web applications and front-end implementations with React, JavaScript, HTML, and CSS.',
    tags: ['React', 'HTML', 'CSS', 'JavaScript'],
    link: '#',
    color: '#4d8dff', // Blue
    images: [
      {
        title: 'Portfolio Website',
        icon: iconPortfolio,
        src: portfolioHero,
        extraImages: [portfolioHero, portfolioAbout, portfolioWork],
        description: 'My custom developer portfolio website built using React, CSS, and interactive components like macOS-style windows and animations.',
        longDescription: 'This site is coded with reusable React components, custom responsive CSS animations, and macOS desktop mimicking file navigations.'
      },
      {
        title: 'Live Finance Dashboard',
        icon: iconFinanceLive,
        src: financeDashboard,
        description: 'This project bridges the gap between raw data and actionable insights. Built with Python, Streamlit, and Plotly, this web application connects securely to a live Google Sheet to track multi-month financial momentum.',
        longDescription: 'By applying UX research from professional analytics platforms, I designed a top-down visual hierarchy that automatically cleans complex data and presents immediate, readable strategy signals to the user.',
        tags: ['Python', 'Streamlit', 'Plotly', 'Google Sheets API'],
        liveLink: 'https://financedashboard-lbekvafqjqn6jsvtrtgn6b.streamlit.app/'
      }
    ],
    folderImages: [iconPortfolio, iconFinanceLive],
    longDescription: 'Responsive and dynamic web applications built with modern frontend tools.'
  },
  {
    id: 3,
    title: 'Game Design',
    description: 'Games designed around meaningful decisions, clear feedback and fair balance, from a dice-driven strategy duel to phone-controlled party games.',
    tags: ['Game Design', 'Systems', 'Balancing', 'Playtesting'],
    link: '#',
    color: '#ffc53d', // Gold
    images: [
      {
        title: 'Muster',
        icon: iconMuster,
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
        description: 'A local multiplayer racing game where your phone is the paddle. Scan a QR code, hold both sides to paddle, let go of one to turn, and race a friend down the river.',
        longDescription: 'Designed for instant, social play: joining takes one scan or a four-letter code, and the whole control scheme is two buttons, so anyone can play within seconds. Hitting a rock or log stuns you, knocks you back and buzzes your phone, so every mistake is felt. Fall behind the screen for five seconds and you are out, which turns every collision into a comeback moment for the other player. Phones connect directly when the network allows it and fall back to a relay, so it works on school Wi-Fi and mobile data too.',
        tags: ['Game Design', 'Local Multiplayer', 'Phone Controls'],
        tools: ['p5.js', 'WebRTC', 'MQTT', 'JavaScript'],
        gameLink: '/game2/index.html',
        icon: iconRiverRacer,
        src: riverRacerRace,
        extraImages: [riverRacerRace, riverRacerLobby, riverRacerController, riverRacerResults]
      },
      {
        title: 'Duck Shoot',
        description: 'A tribute to the light-gun duck games on old home consoles, played with your phone as the gun: point it at the screen, hit the big red Fire button, and hit enough of the 10 ducks to clear each round.',
        longDescription: 'An experiment in motion controls and nostalgia. I wanted the phone to feel like the plastic light gun I grew up with, so you aim by pointing it like a remote and every shot blacks out the screen for a frame, just like the originals. The classic rules are all there: three shots per duck, a ten-duck hit counter, a quota to clear each round and ducks that fly away when you miss. Up to four phones can play at once, and a mouse works too.',
        tags: ['Game Design', 'Motion Controls', 'Phone Controls', 'Retro'],
        tools: ['p5.js', 'WebRTC', 'MQTT', 'JavaScript'],
        gameLink: '/game/index.html',
        icon: iconDuckShoot,
        src: duckShootPlay,
        extraImages: [duckShootPlay, duckShootTitle, duckShootFlyAway, duckShootController]
      }
    ],
    folderImages: [iconMuster, iconRiverRacer, iconDuckShoot], // Icons that pop out of the folder
    longDescription: 'Games where I led the design: core loops, rules, player feedback and balancing, prototyped in Unity and p5.js.'
  },
  {
    id: 4,
    title: 'Apps',
    description: 'Native tools I built to fix everyday annoyances, starting with a macOS menu bar app that gives every app its own speaker.',
    tags: ['Swift', 'macOS', 'Core Audio'],
    link: '#',
    color: '#3ddc97', // Mint
    images: [
      {
        title: 'Earshot',
        icon: iconEarshot,
        src: earshotHero,
        extraImages: [earshotHero, earshotHow, earshotMenu],
        description: 'A macOS menu bar app that sends each app\'s sound to its own output: Chrome on the monitor speakers, everything else on the laptop, without ever changing the system output. Routes can also follow a window as you drag it between screens.',
        longDescription: 'Built on Apple\'s public Core Audio process-tap API, so there is no driver or kernel extension to install. Each routed app is captured and muted at the source, then played through a private device on the chosen speaker, with per-app volume presets and a level meter. I measured and tuned the audio path so a route switches on in 7 to 14 ms when sound starts, and only holds the audio capture while something is actually playing.',
        tags: ['macOS', 'Core Audio', 'Menu Bar App', 'UX'],
        tools: ['Swift', 'SwiftUI', 'AppKit', 'Core Audio', 'Xcode']
      }
    ],
    folderImages: [iconEarshot], // Icons that pop out of the folder
    longDescription: 'Native apps and tools, designed and built end to end.'
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
  // The open window: which folder it shows and which project inside it (null means the file list)
  const [win, setWin] = useState(null);

  // Remember where the click happened, so the window can grow out of that spot
  const originOf = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  };

  // Open the Finder window on a category
  const openFolder = (e, project) => {
    const folder = e.currentTarget.closest('.desk-folder');
    setWin({ categoryId: project.id, itemIndex: null, origin: originOf({ currentTarget: folder || e.currentTarget }) });
  };

  // Jump straight from the featured card to Muster's case study
  const games = projects.find(p => p.id === 3);
  const openMusterCaseStudy = (e) => {
    setWin({
      categoryId: games.id,
      itemIndex: games.images.findIndex(item => item.title === 'Muster'),
      origin: originOf(e)
    });
  };

  return (
    <section id="projects" className="section projects-section">
      <div className="container">
        <h2 className="h2 display">Selected work<span className="pip">.</span></h2>

        {/* Featured, playable project */}
        <Featured onCaseStudy={openMusterCaseStudy} category={games} />

        <div className="folders-head">
          <h3 className="folders-title">Browse the folders</h3>
          <p className="folders-hint">Click a folder to peek inside. Open it to see the projects.</p>
        </div>

        {/* The desk: one folder per category, with its projects peeking out */}
        <ul className="desk">
          {projects.map(project => (
            <li key={project.id} className="desk-folder folder-host" style={{ '--folder': project.color }}>
              <Folder
                color={project.color}
                items={project.folderImages || project.images.map(item => item.icon || item.src)}
              />

              <h4 className="desk-title">{project.title}</h4>
              <p className="desk-count">
                {project.images.length} {project.images.length === 1 ? 'project' : 'projects'}
              </p>

              {/* What's inside the folder, listed like files */}
              <ul className="desk-files">
                {project.images.map(item => (
                  <li key={item.title}>{item.title}</li>
                ))}
              </ul>

              <button type="button" className="desk-open link-arrow" onClick={(e) => openFolder(e, project)}>
                <span className="desk-open-label">
                  Open folder<span className="visually-hidden">: {project.title}</span>
                </span>
                <ArrowRight size={16} weight="bold" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Finder window, with the project detail inside the same frame */}
      {win && (
        <ProjectWindow
          categories={projects}
          win={win}
          onNavigate={setWin}
          onClose={() => setWin(null)}
        />
      )}
    </section>
  );
};

export default Projects;
