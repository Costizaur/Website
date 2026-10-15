// The CV. One text for the page on the site (components/Cv.jsx) and for the PDF, which is
// that same page printed (see the top of components/Cv.css).

// Each section carries the colour of one of the folders on the desk
const GOLD = '#ffc53d', MINT = '#3ddc97', CORAL = '#ff7a6b', BLUE = '#4d8dff';

export const cv = {
    name: ['Costin', 'Sârghiuță'],
    role: 'Creative Media & Game Technologies · Saxion University · Enschede',
    profile: "I'm a creative media student with a strong interest in how real people interact with digital products, especially those who are often overlooked in the design process. I enjoy talking to users, finding the gap between what a product does and what people actually need, and turning that into something concrete. I have hands-on experience with user research, interactive prototyping and design thinking, and I'm drawn to work where the output genuinely affects people's daily lives.",

    contact: {
        place: 'Enschede, Netherlands',
        email: 'sarghiuta.costin@gmail.com',
        phone: '+40 729 182 631',
        site: 'costinsarghiuta.com'
    },

    // A point is a line of text, or { lead, text } when it starts with a few words in bold
    sections: [
        {
            title: 'Experience',
            color: GOLD,
            entries: [
                {
                    title: 'Game Designer',
                    when: 'Sep 2026 – Feb 2027',
                    sub: 'Thales · Internship, 6 months · Scrum Master',
                    points: [
                        'Designed interface screens and implemented them myself in Unity and C#.',
                        'Built reusable interface components so the team can make new screens in one style.',
                        'Learned the Scrum Master role, running sprint planning, stand-ups and retrospectives.'
                    ]
                },
                {
                    title: 'Retail Assistant & Delivery Driver',
                    when: '2022 – Present',
                    sub: 'Primark & Delivery (Netherlands)',
                    points: [
                        'Worked alongside people from many different backgrounds daily, building natural communication skills across language and cultural barriers.'
                    ]
                }
            ]
        },
        {
            title: 'Projects',
            color: MINT,
            entries: [
                {
                    title: 'XR Lab Enschede: Client Project',
                    when: '2024 · 8 weeks',
                    sub: 'Real-client project · Saxion University · Scrum Master',
                    points: [
                        'Managed the full project cycle for a real client, from initial brief and stakeholder communication through to final presentation.',
                        'Led sprint planning and retrospectives as Scrum Master, keeping the team aligned and the work moving.'
                    ]
                },
                {
                    title: 'Motorised Ping Pong Cannon',
                    when: '2026 · Saxion University',
                    sub: 'Hardware project · Arduino · Interactive installation',
                    points: [
                        'Built a phone-controlled ball cannon using two Arduino boards, combining hardware sensors, motorised components and wireless communication.',
                        'Designed and implemented the full interaction flow, from mobile control input to physical output.'
                    ]
                }
            ]
        },
        {
            title: 'Relevant coursework',
            color: CORAL,
            entries: [
                {
                    title: 'UI/UX Design Course',
                    when: '2023/2024 · Saxion University',
                    sub: 'Weekly sprints · A/B testing · Interactive prototyping · User feedback',
                    points: [
                        'Ran weekly A/B tests with real users, collecting feedback on interface variations and iterating designs based on results.',
                        'Built interactive prototypes in Figma every sprint cycle, testing usability assumptions before moving to higher fidelity.',
                        'Learned to identify what users say versus what they actually do, and how to design around that gap.'
                    ]
                },
                {
                    title: 'Design Thinking Course',
                    when: '2025/2026 · Saxion University',
                    sub: 'Problem discovery · Field surveys · Hi-fi prototype delivery',
                    points: [
                        'Identified a real-world problem by going outside the university environment and gathering surveys from diverse user groups with different backgrounds and needs.',
                        'Centralised and analysed responses to find patterns, then used those insights to define the design direction.',
                        'Delivered a fully working hi-fi prototype/app that addressed the problem, validated against the original research findings.'
                    ]
                }
            ]
        },
        {
            title: 'Education',
            color: BLUE,
            entries: [
                {
                    title: 'Saxion University of Applied Sciences',
                    when: '2022 – Present',
                    sub: 'Creative Media & Game Technologies · Enschede, Netherlands',
                    points: [
                        { lead: 'Relevant courses:', text: 'UI/UX Design, Design Thinking, Interactivity & Programming, Web Development.' },
                        'Worked on 8+ team projects applying Agile/Scrum, including briefing, prototyping, testing and presenting to stakeholders.',
                        'Served as Scrum Master in 3 projects, coordinating sprints, retrospectives and team communication in Jira.'
                    ]
                }
            ]
        }
    ],

    skills: [
        { title: 'UX Research', items: ['User Interviews', 'Usability Testing', 'A/B Testing', 'Surveys', 'Observations', 'Affinity Mapping', 'Accessibility (WCAG)'] },
        { title: 'Design', items: ['Figma', 'Hi-fi Prototyping', 'Lo-fi Wireframes', 'Canva', 'UI/UX Design'] },
        { title: 'Dev & Tools', items: ['React', 'JavaScript', 'HTML / CSS', 'Unity', 'C#', 'Microsoft 365', 'Jira'] },
        { title: 'Workflow', items: ['Design Thinking', 'Scrum / Agile', 'Documentation'] }
    ],

    softSkills: ['Communication', 'Empathy', 'Critical Thinking', 'Planning', 'Teamwork', 'Adaptability', 'Initiative'],

    languages: [
        ['Romanian', 'Native'],
        ['English', 'Advanced (C1)'],
        ['Dutch', 'Beginner (A1)']
    ]
};
