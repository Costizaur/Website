// Stress-test data for the Finder window and the project view. DEV ONLY.
// Open the site with ?data=worst (or empty, one, many) to swap it in; see DataToggle.jsx.
// Every value is something a real project could plausibly have: long Dutch and Romanian
// titles, a two-letter title, missing icons, a pasted URL, too many tags, odd image shapes.
import wide from '../assets/finance-dashboard.png';
import tall from '../assets/duck-shoot-controller.jpg';
import portrait from '../assets/earshot-menu.png';
import shotA from '../assets/muster-menu.jpg';
import shotB from '../assets/river-racer-race.jpg';
import shotC from '../assets/shiftpro-final.jpg';
import iconA from '../assets/icons/muster.png';
import iconB from '../assets/icons/earshot.png';
import unfoldStart from '../assets/unfold-g.webm';
import unfoldEnd from '../assets/unfold-g-reverse.webm';
import unfoldStartMobile from '../assets/unfold-g-90.webm';
import unfoldEndMobile from '../assets/unfold-g-90-reverse.webm';

const unfold = {
    unfoldVideoStart: unfoldStart,
    unfoldVideoEnd: unfoldEnd,
    unfoldVideoStartMobile: unfoldStartMobile,
    unfoldVideoEndMobile: unfoldEndMobile
};

const worst = [
    {
        id: 1,
        title: 'Interaction Design & User Research for Public Transport Ticketing',
        description: 'Two semesters of research and interface design for a regional public transport operator: field observation at eleven stations, forty-two intercept interviews, three rounds of prototypes and a final accessibility audit against WCAG 2.2 AA, written up for the operator and for the municipality.',
        tags: ['Figma', 'UI/UX'],
        color: '#ff7a6b',
        folderImages: [iconA, iconB, '#4d8dff'],
        images: [
            {
                title: 'Toegankelijkheidsonderzoek kaartautomaten voor de Nederlandse Spoorwegen (afstudeerproject, tweede versie)',
                icon: iconA,
                src: wide,
                extraImages: [wide, tall, portrait, shotA, shotB, shotC, 'https://example.invalid/missing-screenshot.png', wide, tall, shotA, shotB, shotC, portrait, wide, shotA, shotB, shotC, tall, wide, shotA, shotB, shotC, portrait, wide],
                description: 'Reizigers met een visuele beperking konden de bestaande kaartautomaat niet zelfstandig gebruiken. Full research notes: https://www.figma.com/proto/iy2G6HL5QwJBaxSke646jH/Design-Thinking?page-id=0%3A1&node-id=304-590&scaling=scale-down&content-scaling=fixed&starting-point-node-id=304%3A590',
                longDescription: 'I shadowed eleven travellers, mapped where each of them got stuck, and rebuilt the purchase flow so the most common ticket takes three taps instead of nine. The second version was tested with fourteen people, including four screen reader users and two wheelchair users, at Enschede Centraal and at Hengelo. The operator asked for a hand-over document, so the last month went into writing down every decision and the evidence behind it.',
                tags: ['User Research', 'Accessibility', 'Human-Computer Interaction Research Methods', 'Figma', 'Usability Testing', 'Service Design', 'WCAG 2.2', 'Field Study', 'Interviews'],
                tools: ['Figma', 'FigJam', 'Maze', 'Dovetail', 'Miro', 'Notion', 'VoiceOver', 'NVDA', 'Axe DevTools', 'Lookback', 'Optimal Workshop', 'Excel', 'Premiere Pro', 'After Effects'],
                designLink: 'https://www.figma.com/',
                gameLink: '/muster/index.html',
                liveLink: 'https://example.com/',
                ...unfold,
                unfoldText: [
                    { title: 'Research, Interviews & Synthesis', items: ['Observed eleven travellers buying a ticket at three stations, at rush hour and late at night, and timed every step', 'Ran forty-two short intercept interviews; the three most common complaints were glare on the screen, the order of the questions and the card reader position', 'Clustered 318 notes into nine themes with two classmates, so the grouping was not just my own reading'] },
                    { title: 'Concept', items: ['Start from the destination, not from the ticket type', 'One decision per screen, with the answer to the previous one always visible'] },
                    { title: 'Design', items: ['Type never below 24px, contrast never below 7:1, targets never below 15 mm', 'A physical "start here" marker that a cane can find'] },
                    { title: 'Test & Decide', items: ['Round one, 6 people: nobody found the language switch', 'Round two, 14 people: median purchase time fell from 96 to 41 seconds', 'Kept the receipt question, because 9 of 14 said they would look for it'] },
                    { title: 'Hand-over', items: ['A 38-page decision log for the operator', 'Annotated Figma file with every component state'] },
                    { title: 'What I would do differently', items: ['Recruit screen reader users before the first prototype, not after it'] }
                ]
            },
            {
                title: 'Go',
                src: tall,
                extraImages: [tall],
                description: 'A two-letter title.'
            },
            {
                title: 'Șoarecele și pisica 🐭',
                src: '#3ddc97'
            },
            {
                title: '東京メトロ路線図リデザイン',
                icon: iconB,
                src: portrait,
                description: 'A redesign study of a metro map, with one sentence only.',
                tags: []
            }
        ]
    },
    { id: 2, title: 'Web', description: 'Short.', tags: [], color: '#4d8dff', folderImages: [iconB], images: [] },
    ...['Game Design', 'Apps', 'Motion Graphics & Title Sequences', 'Hardware Prototypes', 'Workshops', 'Writing', 'Photography', 'Open Source', 'Teaching Material', 'Experiments That Did Not Work'].map((title, i) => ({
        id: 3 + i,
        title,
        description: `${title}: a folder that only exists to make the sidebar long.`,
        tags: [],
        color: ['#ffc53d', '#3ddc97', '#ff7a6b', '#4d8dff'][i % 4],
        folderImages: [iconA, iconB].slice(0, (i % 2) + 1),
        images: [{ title: `${title} sample`, icon: iconA, src: shotA, description: 'One item.' }]
    }))
];

// Every folder is empty
const empty = worst.slice(0, 4).map(folder => ({ ...folder, folderImages: [], images: [] }));

// One folder, one project, counts at exactly 1
const one = [{ ...worst[0], title: 'UI/UX Design', images: [worst[0].images[1]], folderImages: [iconA] }];

// One folder with forty projects
const many = [{
    id: 1,
    title: 'Game Jam Entries',
    description: 'Forty weekend prototypes.',
    tags: ['Game Design'],
    color: '#ffc53d',
    folderImages: [iconA, iconB, iconA],
    images: Array.from({ length: 40 }, (_, i) => ({
        title: i % 7 === 3 ? `Jam ${i + 1}: The Lighthouse Keeper Who Could Not Sleep` : `Jam ${i + 1}`,
        icon: i % 5 === 0 ? undefined : (i % 2 ? iconA : iconB),
        src: [shotA, shotB, shotC, wide, tall][i % 5],
        description: i % 3 === 0 ? undefined : 'Made in 48 hours with two friends. Theme: you are not supposed to be here.'
    }))
}];

const sets = { worst, empty, one, many };

// Returns the stress set named in the URL, or the real data
export const withStressData = (realData) => {
    const name = new URLSearchParams(window.location.search).get('data');
    return sets[name] || realData;
};
