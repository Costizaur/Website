# Build prompt: Folder worlds

Paste everything below the line into a new chat opened in `/Users/costinsarghiuta/Documents/GitHub/Website`.

---

I want you to rebuild my portfolio site so it matches a prototype I already approved, called Folder worlds. The new design replaces the current site completely. Read this whole message before touching anything.

## Who I am and what the site is for

I'm Costin Sarghiuta, a student who does UI/UX design, game design and front-end. The site is www.costinsarghiuta.com, hosted on GitHub Pages. Its job is to get me internships and junior roles, and the people I most want to win over are UI/UX product teams. `Portofolio website/PRODUCT.md` has the full background. Read it first.

## Where things are

- **Source:** `Portofolio website/` (Vite + React 19, plain CSS, Phosphor icons). The folder name really is spelled "Portofolio".
- **Live build:** `docs/`. GitHub Pages serves this folder from `main`. `npm run build` empties and rewrites it.
- **The approved prototype:** `design-directions/round-3-folder-worlds/index.html`. One self-contained file with all its CSS and JavaScript inline, images in `img/` next to it. Open it in a browser and click through it before you read its code. Add `#w2` to the URL to land inside the Game Design folder, or `#w2p0` to land on the Muster project.
- **Earlier explorations:** `design-directions/round-1` and `round-2`. Background only. Do not build from them.

## What the prototype does, and what I want built

1. **Home.** My name large across the top, one line under it, and my four folders on a desk: UI/UX Design, Web Development, Game Design, Apps. The folders are the same CSS drawing as the current site, with project icons peeking out, and they fan open on hover.
2. **Open a folder.** Its colour pours out from the folder until it covers the screen. The four folders shrink into a sidebar on the left with the open one highlighted. The projects fly out of the folder and land as white sheets. Each folder is a world with its own colour, typeface and background pattern.
3. **Open a project.** The sheet grows until it fills the screen. The screenshot travels from the sheet to its place on the page and the text comes in after it. Each project has its own backdrop (Muster sits on its wood table, ShiftPro on a clean page) while keeping the typeface and accent colour of the folder it came from.
4. **Going back.** A back arrow, a breadcrumb path (Projects, then folder, then project) and Escape. Everything runs the same path in reverse. Clicking another folder in the sidebar switches worlds directly.

Match the prototype's look and motion closely. I chose it on how it feels, so the feel is the spec.

## Colours follow the system: light or dark

This is new and is not in the prototype, which only has a light version. The site must follow the visitor's system setting through `prefers-color-scheme`, with no toggle, and switch live if the system setting changes.

- **Light system:** what the prototype shows.
- **Dark system:** a dark version of everything. The home stage, the sheets and the text all flip. A folder world should not flash a bright full-screen colour at someone in dark mode, so each world needs a deep version of its folder colour with light text on it. The folder drawings themselves keep their four colours in both modes.
- Project backdrops that are already dark (Muster, Calorie App, both finance projects, the portfolio, Earshot) can stay as they are. The light or bright ones (ShiftPro, Duck Shoot) need a dark counterpart.
- Set `color-scheme` and the `theme-color` meta tag for both modes. Keep body text at WCAG AA contrast in both.

Starting values to tune by eye:

| | Light | Dark |
|---|---|---|
| Home stage / text | `#e9eaee` / `#111216` | `#101116` / `#ecedf2` |
| Sheets | `#ffffff` | `#1b1d25` |
| UI/UX world (folder `#ff7a6b`) | `#ff7a6b` / ink `#2b0d09` | `#3a1612` / ink `#ffd9d3` |
| Web world (folder `#4d8dff`) | `#4d8dff` / ink `#06163a` | `#0f2147` / ink `#d6e4ff` |
| Games world (folder `#ffc53d`) | `#ffc53d` / ink `#20160a` | `#3a2a08` / ink `#ffe9b0` |
| Apps world (folder `#3ddc97`) | `#3ddc97` / ink `#05281a` | `#0b3524` / ink `#c9f7e2` |

In dark mode, buttons and highlights use the bright folder colour with dark text on it.

## What the prototype leaves out, which you need to design

The prototype is a fixed 16:10 stage sized in container units. The real site fills the browser window and has to work at every size. These parts have no approved design yet, so build a first version and show me before polishing:

- **Phone layout.** Folders in a 2 by 2 grid on the home screen. Inside a world the sidebar becomes a row of folder tabs, the way the current Finder window does it on phones, and the sheets stack in one scrolling column. A project is a scrolling page with the screenshot first.
- **The rest of each project page.** The prototype shows only the top. Below it, the page scrolls to everything the current site already has for that project: the screenshot carousel, the long description, tags and tools, the links, and the process notes (`unfoldText`: Process, Concept, Design, Test & Decide). "Read the process" and "Read the case study" scroll to those notes. Keep my unfold-the-paper idea if you can make it fit; ask me if it doesn't.
- **Next and previous** project inside a folder.
- **About and Contact.** Same content as today, in the new look. Keep the Web3Forms contact form working exactly as it does now, with its access key, states and error messages.
- **Links that work.** Use hash links so a folder or a project can be opened directly (for example `#games` and `#games/muster`), and so the browser's Back button goes back one level. No router that needs server rewrites, because this is GitHub Pages.

## What must carry over from the current site

- All project content. The single source is the `projects` array in `src/components/Projects.jsx`. Reuse it; do not retype the copy. The Video Production folder stays hidden.
- The three playable games in `public/` (`/muster/`, `/game2/`, `/game/`) and their links. Do not touch the game files.
- The CV link in the menu, my email, LinkedIn and GitHub.
- The page title, description and social tags in `index.html`, the skip link, visible focus rings and keyboard access to everything.
- A "Play Muster" button reachable from the first screen.
- The Portfolio Website project inside the Web Development folder describes the old site. Once the new one is built, give that entry new screenshots and a description of this design.

## How the motion works in the prototype

Read the script at the bottom of the prototype file. The short version:

- Two reversible clocks drive a folder opening: one for the folders travelling to the sidebar (0.7 s) and one for the colour, header and sheets (0.95 s). Each element animates over its own slice of the clock, which gives the stagger. Closing runs the same clocks backwards about 1.35 times faster. Reversing halfway just turns the clock around.
- The colour is a `clip-path: circle()` growing from the centre of the clicked folder. The sheets start at the folder's mouth, small and rotated, and overshoot slightly as they land.
- Opening a project is a measured shared-element move: the page is clipped with `clip-path: inset()` from the sheet's rectangle out to full screen, and the screenshot is transformed from its place on the sheet to its place on the page. A spring drives it (stiffness 150, damping ratio 0.92 to open; 230 and 1.0 to close).
- Escape and keyboard-activated clicks skip the animation and go straight to the end state. The current site already works this way, so keep it.
- With reduced motion, everything jumps to its end state.

In React, drive these animations imperatively through refs. Do not put per-frame values in React state. Animate only `transform`, `opacity` and `clip-path`. Take frame times from the `requestAnimationFrame` timestamp only; mixing it with `performance.now()` broke the animation in testing.

## Fonts

Self-host them, the way the project already does with `@fontsource`: Archivo (variable, with the width axis, for the home screen), Bricolage Grotesque (UI/UX world, already installed), JetBrains Mono (Web world), Lilita One (Games world), Geist (body text, already installed). The Apps world uses the system font stack on purpose.

## How I want you to work

- Use the design skills I have installed: `impeccable`, `emil-design-eng`, `apple-design`, `design-taste-frontend` and `mobile-native`. The direction is already chosen by me, so do not run a new direction search or propose alternatives. Use the skills for craft, motion and the phone layout.
- **Git.** The repo is on a branch called `redesign` with uncommitted changes from an older redesign attempt. Before anything else, show me `git status` and ask whether to commit that work. Then create a new branch called `folder-worlds` and do everything there. Do not push, do not merge into `main`, and do not run `npm run build`, because it rewrites the live `docs/` folder. To test a production build, send it to a temporary folder with `npx vite build --outDir` followed by a scratch path.
- **Show me before it goes live.** I like to see things before they are final. When the desktop version works, start the dev server and show me. Do the same for the phone layout, the dark version, and About and Contact. Wait for my OK before the final build and deploy.
- The old sections and components the new design replaces (hero with dice, marquee, featured panel, Finder window, modal) should be removed once nothing uses them, not left behind.
- Check your own work in a browser at laptop and phone widths, in light and dark, with reduced motion on, and with the keyboard alone. Run `npm run lint`. Tell me plainly what you checked and what you could not.

## Done means

- The site matches the prototype's look and motion on a laptop, in both light and dark, following the system setting.
- It works on a phone.
- Every project from the current site is reachable, with all its content and links.
- About, Contact, the CV and the three games work.
- I have seen it and said yes. Only then: build into `docs/`, commit, and ask me before pushing.
