// Every folder and project on the site. This is the single source for the content:
// the copy below is what the folders, the sheets and the project pages all read from.

// Import assets (Images/Videos)
import calorieApp from '../assets/calorie-app.png';
import shiftProFinal from '../assets/shiftpro-final.jpg';
import shiftProResearch from '../assets/shiftpro-1-research.jpg';
import shiftProLoFi from '../assets/shiftpro-2-lofi.jpg';
import shiftProHiFi from '../assets/shiftpro-3-hifi.jpg';
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
import portfolioProject from '../assets/portfolio-project.jpg';
import financeLiveScale from '../assets/finance-live-scale.jpg';
import financeLiveCheck from '../assets/finance-live-check.jpg';
import financeLiveDecide from '../assets/finance-live-decide.jpg';
import musterMenu from '../assets/muster-menu.jpg';
import musterPhase from '../assets/muster-muster-phase.jpg';
import musterLineup from '../assets/muster-lineup.jpg';
import musterBattle from '../assets/muster-battle.jpg';
import musterHowToPlay from '../assets/muster-how-to-play.jpg';
import musterPhone from '../assets/muster-phone.jpg';

// App icons shown in the Finder and on the folder papers
import iconShiftPro from '../assets/icons/shiftpro.png';
import iconCalorie from '../assets/icons/calorie-app.png';
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
        longDescription: 'A Design Thinking project that went from interviews to three rounds of prototypes: grey lo-fi wireframes, a hi-fi version and a final version. I tested the lo-fi with 3 people and the hi-fi with 9, and their feedback decided what changed next.',
        tags: ['Figma', 'UI/UX', 'User Research', 'Usability Testing'],
        tools: ['Figma', 'Figma Make'],
        notes: [
          { title: "Process", items: ["Picked a real problem from my job: the Primark schedule only exists as a printed sheet in the hallway", "Interviewed a colleague and an HR assistant to hear both sides of the story", "Both blamed the paper: staff can't check or swap shifts easily, and HR reprints it every week"] },
          { title: "Concept", items: ["Tried Deputy, Planday and Quinyx to see how other apps handle swaps and time off", "A customer journey map showed that swapping a shift is the worst moment, so it became the priority", "Planned a simple app: log in, then one tap to your schedule, swaps, sick reports and news"] },
          { title: "Design", items: ["Started with grey lo-fi wireframes for one task: change your shift", "Moved to hi-fi with a logo, Primark-inspired blue and shifts grouped by day on clear cards", "Split the unclear 'swap' button into Request (post your shift) and Pick Up (take someone else's)"] },
          { title: "Test & Decide", items: ["Lo-fi, 3 tests: the screens were clear, but changing the shift was hard and the layout needed grouping and colour", "Hi-fi, 9 tests: people found it simple and familiar, and ==3 of them asked for a way to look ahead by date==", "Final version: added a calendar view, moved the profile to the top and made faded text fully readable"] }
        ]
      },
      {
        title: 'Calorie App',
        icon: iconCalorie,
        src: calorieApp,
        description: 'A prototype of how I would add game elements to an ordinary calorie-tracking app, with missions, badges and a ranking, so people stay motivated to keep logging.',
        designLink: 'https://www.figma.com/proto/hQbNFs1uEQt65pwNjoC4nO/Untitled?page-id=0%3A1&node-id=1-2&viewport=-155%2C334%2C0.51&t=tpcoy8Bx0x2wpUVq-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=1%3A2',
        notes: [
          { title: "Process", items: ["Looked at common calorie-tracking apps to see where people lose interest and stop logging", "Ran a survey in Google Forms to find out what keeps people logging regularly", "Set the main challenge: turn a boring data-entry task into a habit"] },
          { title: "Concept", items: ["Explored different game mechanics, from mini-games to points and social leaderboards", "Came up with a Mission tab that keeps your goals in one place and shows your progress", "Focused on extrinsic rewards (badges and rankings) to keep people going once logging gets boring"] },
          { title: "Design", items: ["Kept to the app's existing look and UI patterns, so the new features feel like part of it", "Designed a set of badges and a ranking screen where you compete with others", "Also made a smartwatch prototype for quick logging on the go"] },
          { title: "Test & Decide", items: ["Asked potential users in a survey whether they preferred complex mini-games or a simple ranking", "==Kept badges and rankings== and cut the mini-games, because people preferred clear goals they could reach"] }
        ]
      }
    ],
    folderImages: [iconShiftPro, iconCalorie], // Icons that pop out of the folder
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
        extraImages: [portfolioHero, portfolioWork, portfolioProject, portfolioAbout],
        description: 'The site you are looking at. Four folders sit on a desk and each one opens into its own world, with its own colour, typeface and pattern. A project grows out of its sheet until it fills the screen, and going back runs the same path in reverse.',
        longDescription: 'I built it in React with plain CSS and no animation library. I wrote the motion myself so it can turn around halfway, for example when you close a folder that is still opening, and it only moves transform, opacity and clip-path so it stays smooth. The colours follow your system light or dark setting, phones get their own layout where the folders become a row of tabs, and keyboard users and anyone with reduced motion turned on skip the animation.',
        tags: ['React', 'CSS', 'Motion', 'Responsive'],
        tools: ['React', 'Vite', 'CSS', 'JavaScript']
      },
      {
        title: 'Live Finance Dashboard',
        icon: iconFinanceLive,
        src: financeLiveScale,
        extraImages: [financeLiveScale, financeLiveCheck, financeLiveDecide],
        description: 'Go for growth or play it safe this month? My Google Sheet model weighs thirty market signals and picks one ETF a month. This page puts the model on a see-saw, so someone with no finance knowledge can see which way it leans, check any ETF against the base and follow it to a decision.',
        longDescription: 'Each group of signals is a weight sized by its share of the decision, so the beam tips by exactly the score the sheet decides with. Tap a signal to flip its vote and the scores, the scale and the pick are worked out again with the sheet’s own formulas. A small server reads the sheet, so its address never reaches the browser, and the page says so openly when data is missing.',
        tags: ['React', 'Google Apps Script', 'Google Sheets', 'Data visualisation'],
        liveLink: '/finance/'
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
        description: 'A dice strategy duel for two players that takes about 7 to 10 minutes. Each turn you roll three dice and spend them on taxes, the forge and recruits, and pay iron for upgrades, scouting and sabotage. Then you secretly line up your troops for a battle where the class triangle and wounds decide who holds the line.',
        longDescription: 'My goal was a short match where every die is a real decision and no single strategy wins. Dice work like workers, a three-class triangle keeps every unit useful, hidden armies make scouting and reading your opponent pay off, and I balanced the numbers by simulating thousands of bot matches. After the first playtests I rebuilt the rules, the tutorial and the battle screen around what testers could not follow. Playable in the browser on desktop and phone.',
        tags: ['Game Design', 'Systems Design', 'Balancing', 'Playtesting'],
        tools: ['Unity', 'C#', 'Figma', 'Excel'],
        gameLink: '/muster/index.html',
        notes: [
          { title: "Process", items: ["Set the design goals: a short match (about 7 to 10 minutes), every die a meaningful choice, and no dominant strategy", "Defined the core loop: roll, assign dice, build an army, line up in secret, battle", "Kept every tunable number in one config and an Excel balance model, so rules could change without rewriting code"] },
          { title: "Concept", items: ["Dice as workers: three dice a turn go on Tax, Forge or Recruit, and the stronger units need a higher roll", "A three-class triangle (Knight → Ranger → Mage → Knight) so no unit is simply the best", "Hidden armies: opponents only see your unit count, which makes Scout and Sabotage worth their iron"] },
          { title: "Design", items: ["Two resources with hard caps and use-it-or-lose-it dice, so hoarding never beats spending: gold buys troops, iron buys tricks", "Attrition battles: winners carry their wounds into the next duel, so one strong unit can't carry a whole army", "Designed a chunky tabletop UI in Figma, then adapted it into a landscape phone layout for playtesting"] },
          { title: "Test & Decide", items: ["Built bots for four strategies and simulated about 24,000 matches on each version of the rules to measure win rates", "Playtesters could not follow the first version, so I cut four units to a triangle, made the support actions cost iron instead of a die, hid the opponent's resources and replaced the tutorial tour with hints", "==Elite (58%), balanced (60%) and counter (61%) play now sit within 3 points of each other==; spamming the cheapest unit stays weak (21%) because one class loses to its counter"] }
        ]
      },
      {
        title: 'River Racer',
        description: 'A local multiplayer racing game where your phone is the paddle. Scan a QR code, hold both sides to paddle, let go of one to turn, and race a friend down the river.',
        longDescription: 'I wanted anyone to be able to pick it up within seconds: joining takes one scan or a four-letter code, and the controls are just two buttons. Hitting a rock or log stuns you, knocks you back and buzzes your phone, so every mistake is felt. Fall behind the screen for five seconds and you are out, which turns every collision into a comeback moment for the other player. Phones connect directly when the network allows it and fall back to a relay, so it works on school Wi-Fi and mobile data too.',
        tags: ['Game Design', 'Local Multiplayer', 'Phone Controls'],
        tools: ['p5.js', 'WebRTC', 'MQTT', 'JavaScript'],
        gameLink: '/game2/index.html',
        icon: iconRiverRacer,
        src: riverRacerRace,
        extraImages: [riverRacerRace, riverRacerLobby, riverRacerController, riverRacerResults],
        notes: [
          { title: "Process", items: ["Started from one idea: the phone in your pocket is the controller, so you join from the browser with nothing to install", "Built the race in p5.js and the controller as a plain web page, linked phone to screen over WebRTC", "Made a first version in a few days in January 2026, then called Boat Race, and rebuilt it in September"] },
          { title: "Concept", items: ["Two buttons only: hold both sides to paddle, let go of one to turn", "Every mistake is felt: hitting a rock or log stuns you for a second, knocks you back and buzzes your phone", "Fall behind the screen for five seconds and you are out, so every crash is a chance for the other player to catch up"] },
          { title: "Design", items: ["The current pushes idle boats back, so you have to keep paddling to stay in the race", "Joining takes one QR scan, or a four-letter room code typed on the /play page", "Added a tutorial, a countdown, a progress bar and a results screen, and players stay connected between races"] },
          { title: "Test & Decide", items: ["Added a main menu and a one-player mode to the first version, so you can also race alone", "Direct phone connections did not work on every network, so I added a relay over public MQTT servers for when WebRTC is blocked", "==Phones now join from school Wi-Fi and mobile data too==, and get their place back after a refresh"] }
        ]
      },
      {
        title: 'Duck Shoot',
        description: 'A tribute to the light-gun duck games on old home consoles, played with your phone as the gun: point it at the screen, press the big red Fire button, and hit enough of the 10 ducks to clear each round.',
        longDescription: 'An experiment in motion controls and nostalgia. I wanted the phone to feel like the plastic light gun I grew up with, so you aim by pointing it like a remote and every shot blacks out the screen for a frame, just like the originals. The classic rules are all there: three shots per duck, a ten-duck hit counter, a quota to clear each round and ducks that fly away when you miss. Up to four phones can play at once, and a mouse works too.',
        tags: ['Game Design', 'Motion Controls', 'Phone Controls', 'Retro'],
        tools: ['p5.js', 'WebRTC', 'MQTT', 'JavaScript'],
        gameLink: '/game/index.html',
        icon: iconDuckShoot,
        src: duckShootPlay,
        extraImages: [duckShootPlay, duckShootTitle, duckShootFlyAway, duckShootController],
        notes: [
          { title: "Process", items: ["Wanted the phone to feel like the plastic light gun I grew up with", "Kept the classic rules: 10 ducks a round, 3 shots per duck, and a hit quota that rises from 6 to 10 as the rounds go on", "Made a first version in January 2026 and rebuilt it in September with original pixel art"] },
          { title: "Concept", items: ["Aim by pointing the phone like a remote: turn it to move left and right, tilt it to move up and down", "Each shot flashes the screen black with white boxes where the ducks are, like the real light gun, and the flash can be turned off", "Up to four phones play at once, each in its own colour, and a mouse works too"] },
          { title: "Design", items: ["A big red Fire button that buzzes on every shot", "A Re-center button: point at the middle of the screen and tap it to reset your aim", "Game A with one duck at a time and Game B with two, a top score, and ducks that fly away when you run out of shots or time"] },
          { title: "Test & Decide", items: ["The first controller moved the aim the wrong way up and down, so I flipped the vertical axis", "Phones only share their motion sensors with https pages, so ==the controller now says why motion aiming is off and switches to a drag pad== instead", "Rebuilt the connection the same way as River Racer, so up to four phones can join from any network"] }
        ]
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

// --- HOW EACH FOLDER AND PROJECT PRESENTS ITSELF ---
// The folder worlds need a few things the list above does not have: a short name, an ink
// colour and a one-line blurb for each folder, and for each project the line on its sheet,
// the facts and buttons on its page, and its own backdrop. They are matched to the entries
// above by folder id and by project title.

// `ink` is the text colour on the folder colour. `deep` and `deepInk` are the dark-mode world:
// a deep version of the folder colour with light text on it.
const WORLD_LOOK = {
  1: {
    key: 'uiux', short: 'UI/UX', ink: '#2b0d09', deep: '#3a1612', deepInk: '#ffd9d3',
    blurb: 'Research, prototypes and usability tests, from the first interview to the final Figma file.'
  },
  2: {
    key: 'web', short: 'Web', ink: '#06163a', deep: '#0f2147', deepInk: '#d6e4ff',
    blurb: 'Things I designed and then coded myself, in React and JavaScript.'
  },
  3: {
    key: 'games', short: 'Games', ink: '#20160a', deep: '#3a2a08', deepInk: '#ffe9b0',
    blurb: 'Games where every choice matters, the feedback is clear and the balance is fair. All three play in your browser.'
  },
  4: {
    key: 'apps', short: 'Apps', ink: '#05281a', deep: '#0b3524', deepInk: '#c9f7e2',
    blurb: 'Native tools I built to fix everyday annoyances.'
  }
};

// `action` is the main button: a link (`href`) or a jump to a part of the page (`to`).
// `more` is the second button and always jumps down the page.
// `backdrop.dark` is only needed where the normal backdrop is light or bright.
const PROJECT_LOOK = {
  'ShiftPro': {
    slug: 'shiftpro',
    type: 'Figma, user research',
    line: 'A shift-swap app for Primark staff, tested with 12 people.',
    pitch: 'At Primark the schedule is a printed sheet in a hallway. ShiftPro lets staff check their shifts anywhere, swap them and read company news.',
    facts: [['12', 'usability testers'], ['3', 'prototype rounds'], ['Figma', 'design and prototype']],
    action: { label: 'Open the prototype', href: 'designLink' },
    more: { label: 'Read the process', to: 'notes' },
    notesTitle: 'The process',
    shotPosition: '0% 50%',
    backdrop: { bg: '#f4f6fb', fg: '#0e1630', dark: { bg: '#0d1224', fg: '#e3e9fb' } }
  },
  'Calorie App': {
    slug: 'calorie-app',
    type: 'Figma, gamification',
    line: 'A calorie tracker with missions, badges and a ranking to keep people logging.',
    pitch: 'A prototype that tries to make calorie logging a habit: a missions tab, badges, a ranking, and a smartwatch app for logging on the go.',
    facts: [['Survey', 'Google Forms research'], ['Kept', 'badges and rankings'], ['Cut', 'mini-games']],
    action: { label: 'Open the prototype', href: 'designLink' },
    more: { label: 'Read the process', to: 'notes' },
    notesTitle: 'The process',
    backdrop: { bg: '#060606', fg: '#f1f5ee' }
  },
  'Portfolio Website': {
    slug: 'portfolio-website',
    type: 'React, CSS',
    line: 'This site, designed and coded in React.',
    pitch: 'Reusable React components, animation written by hand, and the folder idea you just clicked through.',
    facts: [['React', 'reusable components'], ['CSS', 'hand-written animation'], ['Vite', 'built for GitHub Pages']],
    action: { label: 'See it on GitHub', href: 'https://github.com/Costizaur' },
    backdrop: { bg: '#111110', fg: '#f3efe6' }
  },
  'Live Finance Dashboard': {
    slug: 'live-finance-dashboard',
    type: 'React, Apps Script',
    line: 'Thirty market signals on a see-saw, read live from a Google Sheet.',
    pitch: 'Go for growth or play it safe this month? The page weighs thirty signals from my Google Sheet model and walks anyone, finance or not, to the month’s one ETF pick.',
    facts: [['30', 'market signals, weighed'], ['Live', 'from a Google Sheet'], ['1', 'ETF picked each month']],
    action: { label: 'Open the live app', href: 'liveLink' },
    titleScale: 0.8,
    backdrop: { bg: '#0e1117', fg: '#e6e9ef' }
  },
  'Muster': {
    slug: 'muster',
    type: 'Unity, systems design',
    line: 'A dice strategy duel for two players.',
    pitch: 'Roll three dice, spend them to grow your economy and recruit an army, then line up in secret and hold the line.',
    facts: [['7–10 min', 'for a full match'], ['24,000', 'bot matches for balance'], ['Unity', 'and C#']],
    action: { label: 'Play Muster', href: 'gameLink' },
    more: { label: 'Read the case study', to: 'notes' },
    notesTitle: 'The case study',
    backdrop: {
      bg: 'linear-gradient(160deg, #70421f 0%, #4a2a14 55%, #2a170c 100%)', fg: '#fff3d6',
      title: '#ffc53d', titleShadow: '0 calc(var(--u) * 0.5) 0 #1c0f07'
    }
  },
  'River Racer': {
    slug: 'river-racer',
    type: 'p5.js, phone controls',
    line: 'A racing game where your phone is the paddle.',
    pitch: 'Scan a QR code, hold both sides to paddle, let go of one to turn, and race a friend down the river.',
    facts: [['2', 'players, one screen'], ['2', 'buttons to learn'], ['p5.js', 'and WebRTC']],
    action: { label: 'Play River Racer', href: 'gameLink' },
    more: { label: 'Read the process', to: 'notes' },
    notesTitle: 'The process',
    backdrop: { bg: 'linear-gradient(180deg, #0f7f93, #0a5d6d)', fg: '#f2fffd' }
  },
  'Duck Shoot': {
    slug: 'duck-shoot',
    type: 'p5.js, motion controls',
    line: 'A light-gun tribute played with your phone.',
    pitch: 'Point your phone at the screen like a remote, press the big red Fire button and hit enough ducks to clear the round.',
    facts: [['4', 'phones at once'], ['3', 'shots per duck'], ['p5.js', 'and WebRTC']],
    action: { label: 'Play Duck Shoot', href: 'gameLink' },
    more: { label: 'Read the process', to: 'notes' },
    notesTitle: 'The process',
    backdrop: { bg: '#5c94fc', fg: '#08153f', dark: { bg: '#101c46', fg: '#dfe7ff' } }
  },
  'Earshot': {
    slug: 'earshot',
    type: 'Swift, Core Audio',
    line: 'A macOS menu bar app that gives every app its own speaker.',
    pitch: 'Chrome on the monitor speakers, everything else on the laptop, without ever changing the system output.',
    facts: [['7 to 14 ms', 'to switch a route'], ['Swift', 'and Core Audio'], ['No driver', 'nothing to install']],
    action: { label: 'Read the case study', to: 'story' },
    backdrop: { bg: 'radial-gradient(90% 90% at 20% 80%, #0f3a3a 0%, #0a1517 70%)', fg: '#e6f4f1' }
  }
};

// The folders as the site uses them: each one a world, with its projects inside
export const worlds = projects.map(folder => ({
  ...folder,
  ...WORLD_LOOK[folder.id],
  projects: folder.images.map(item => {
    const look = PROJECT_LOOK[item.title];
    // A button's link can name the field above that holds the address
    const href = look.action.href && (item[look.action.href] || look.action.href);
    return {
      ...item,
      ...look,
      action: { ...look.action, href },
      // A project whose main button leaves the site still gets a way down the page
      more: look.more || (href ? { label: 'About the project', to: 'story' } : undefined),
      // Project fields override the folder's, as they always have
      tags: item.tags || folder.tags || [],
      tools: item.tools || item.tags || folder.tags || [],
      shots: item.extraImages && item.extraImages.length > 0 ? item.extraImages : [item.src]
    };
  })
}));
