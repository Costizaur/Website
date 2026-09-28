// Duck Shoot: a tribute to the light-gun duck games on old home consoles.
// This is the big-screen side. Phones join through GameLink (../shared/link.js)
// and become the gun; a mouse works too. All art is original pixel art.

const MAX_PLAYERS = 4;
const COLORS = ['#fca044', '#3cbcfc', '#e40058', '#80d010'];
const STEP = 1 / 60;               // fixed step, so 120 Hz screens play at the same speed
const DUCKS_PER_ROUND = 10;
const SHOTS_PER_DUCK = 3;
const HUD_H = 34;                  // dirt strip height, in game pixels
const SKY = '#64b0ff';
const SKY_FLYAWAY = '#fcbcb0';

// Duck types: points, speed multiplier and palette
const TYPES = {
    black: { points: 500, speed: 1, B: '#503000', D: '#2a1800', H: '#00a800' },
    blue: { points: 1000, speed: 1.15, B: '#0058f8', D: '#0000bc', H: '#004058' },
    red: { points: 1500, speed: 1.35, B: '#d82800', D: '#881400', H: '#503000' },
    gold: { points: 3000, speed: 1.5, B: '#fcd000', D: '#ac7c00', H: '#fcfcfc' }
};

// --- 22x16 duck sprites, facing right. k outline, B body, D wing, H head, w white, y beak, c belly
const HEAD = [
    '......................',
    '......................',
    '...............kkk....',
    '..............kHHHk...',
    '.............kHHwkHk..',
    '.............kHHHHHyyy',
    '.............kHHHHkyy.',
    '............kwwwwk....'
];
const BODY = [
    '...kkkkkkkkkBBBBk.....',
    '.kkBBBBBBBBBBBBBBk....',
    'kBBBBBBBBBBBBBBBBk....',
    '.kBBBBBBBBBccccccBk...',
    '..kkBBBBcccccccccck...',
    '....kkkkkkkkkkkkkk....',
    '......................',
    '......................'
];
const FRAMES = {
    up: [
        '......kk..............',
        '.....kDDk.............',
        '.....kDDDk.....kkk....',
        '......kDDDk...kHHHk...',
        '......kDDDDk.kHHwkHk..',
        '.......kDDDDkkHHHHHyyy',
        '.......kDDDDDkHHHHkyy.',
        '........kDDDkwwwwk....',
        '...kkkkkDDDkBBBBk.....',
        ...BODY.slice(1)
    ],
    mid: [
        ...HEAD,
        '...kkkkkkkkkBBBBk.....',
        '.kkBkkkkkkkBBBBBBk....',
        'kBBkDDDDDDDkBBBBBk....',
        '.kBBBkkkkkkccccccBk...',
        ...BODY.slice(4)
    ],
    down: [
        ...HEAD,
        ...BODY.slice(0, 4),
        '..kkBBkDDDDkcccccck...',
        '....kkkDDDDDkkkkkk....',
        '......kDDDk...........',
        '.......kk.............'
    ]
};
FRAMES.shock = FRAMES.mid.map((row, i) => i === 4 ? '.............kHHwwHk..' : row);

const FIXED = { k: '#000000', w: '#fcfcfc', y: '#fca044', c: '#fce0a8' };

let host;
let slots = [null, null, null, null];
let sprites = {};
let ducks = [];
let popups = [];
let clouds = [];
let pg, backLayer, frontLayer;
let SCALE = 4, W = 320, H = 200, groundY = 150;

let state = 'TITLE';               // TITLE | PLAY | OVER
let phase = '';                    // intro | fly | flyaway | settle | clear | over
let phaseT = 0;
let flyTimer = 0;
let mode = 1;                      // ducks per wave
let roundNo = 1;
let duckIndex = 0;
let hits = [];
let skyColor = SKY;
let accumulator = 0;
let flashFrames = 0;
let lastFlash = 0;
let flashOn = true;
let hudCache = '';
let topScore = 0;

const $ = (id) => document.getElementById(id);
const players = () => slots.filter(Boolean);
const quota = (r) => r <= 10 ? 6 : r <= 12 ? 7 : r <= 14 ? 8 : r <= 19 ? 9 : 10;
const roundMult = (r) => r <= 5 ? 1 : r <= 10 ? 1.6 : 2;
const pad = (n) => String(n).padStart(6, '0');

// ---------------------------------------------------------------
// Setup
// ---------------------------------------------------------------
function setup() {
    const cnv = createCanvas(windowWidth, windowHeight);
    cnv.elt.addEventListener('pointerdown', onCanvasPointer);
    noSmooth();
    buildSprites();
    layout();

    try { topScore = parseInt(localStorage.getItem('duckshoot-top') || '0', 10) || 0; } catch { /* private mode */ }
    try { flashOn = localStorage.getItem('duckshoot-flash') !== 'off'; } catch { /* private mode */ }
    $('top-score').textContent = pad(topScore);
    $('flash-btn').textContent = `FLASH: ${flashOn ? 'ON' : 'OFF'}`;

    host = GameLink.createHost({
        game: 'duck',
        codePrefix: 'D',
        maxPlayers: MAX_PLAYERS,
        onJoin: handleJoin,
        onLeave: handleLeave,
        onMessage: handleMessage,
        onStatus: ({ relay, direct }) => {
            $('st-relay').classList.toggle('on', relay > 0);
            $('st-direct').classList.toggle('on', direct);
        }
    });
    $('room-code').textContent = host.code;
    new QRCode($('qr'), { text: host.joinUrl('controller.html'), width: 196, height: 196, correctLevel: QRCode.CorrectLevel.M });

    document.querySelectorAll('.menu-item').forEach(el => el.addEventListener('click', () => selectMode(+el.dataset.mode)));
    $('start-btn').addEventListener('click', startGame);
    $('again-btn').addEventListener('click', startGame);
    $('title-btn').addEventListener('click', toTitle);
    $('mouse-btn').addEventListener('click', toggleMousePlayer);
    $('flash-btn').addEventListener('click', () => {
        flashOn = !flashOn;
        $('flash-btn').textContent = `FLASH: ${flashOn ? 'ON' : 'OFF'}`;
        try { localStorage.setItem('duckshoot-flash', flashOn ? 'on' : 'off'); } catch { /* ignore */ }
    });
    window.addEventListener('keydown', onKey);
    renderSlots();
}

function buildSprites() {
    const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16), 255];
    Object.entries(TYPES).forEach(([type, t]) => {
        const pal = { ...FIXED, B: t.B, D: t.D, H: t.H };
        sprites[type] = {};
        Object.entries(FRAMES).forEach(([name, rows]) => {
            const img = createImage(22, 16);
            img.loadPixels();
            rows.forEach((row, y) => [...row].forEach((ch, x) => {
                if (pal[ch]) img.set(x, y, hex(pal[ch]));
            }));
            img.updatePixels();
            sprites[type][name] = img;
        });
    });
}

// Pick an integer scale so pixels stay square and crisp
function layout() {
    SCALE = max(2, floor(min(windowHeight / 170, windowWidth / 260)));
    W = ceil(windowWidth / SCALE);
    H = ceil(windowHeight / SCALE);
    groundY = H - HUD_H - 10;

    document.documentElement.style.setProperty('--px', `${SCALE}px`);
    document.documentElement.style.setProperty('--hud-h', `${HUD_H * SCALE}px`);

    pg = createGraphics(W, H);
    pg.pixelDensity(1);
    pg.noSmooth();
    pg.textFont('Press Start 2P');

    // Tree behind the ducks
    backLayer = createGraphics(W, H);
    backLayer.pixelDensity(1);
    backLayer.noStroke();
    const tx = floor(W * 0.1);
    const canopyY = floor(H * 0.3);
    backLayer.fill('#ac7c00');
    backLayer.rect(tx - 6, canopyY, 12, groundY - canopyY + 10);
    backLayer.fill('#503000');
    for (let y = canopyY + 4; y < groundY; y += 7) backLayer.rect(tx - 4 + (y % 3), y, 2, 4);
    const blobs = [[0, 0, 26], [-20, 8, 16], [20, 6, 18], [-8, -18, 16], [12, -14, 14]];
    blobs.forEach(([dx, dy, r]) => { backLayer.fill('#006800'); pixelCircle(backLayer, tx + dx, canopyY + dy + 2, r); });
    blobs.forEach(([dx, dy, r]) => { backLayer.fill('#00a800'); pixelCircle(backLayer, tx + dx, canopyY + dy, r - 2); });
    randomSeed(3);
    backLayer.fill('#80d010');
    for (let i = 0; i < 70; i++) {
        const [dx, dy, r] = random(blobs);
        backLayer.rect(tx + dx + floor(random(-r, r) * 0.7), canopyY + dy + floor(random(-r, r) * 0.7), 2, 1);
    }

    // Bush, grass and dirt in front of the ducks
    frontLayer = createGraphics(W, H);
    frontLayer.pixelDensity(1);
    frontLayer.noStroke();
    const bx = floor(W * 0.84);
    [[0, 0, 22], [-20, 7, 15], [20, 6, 16]].forEach(([dx, dy, r]) => {
        frontLayer.fill('#006800'); pixelCircle(frontLayer, bx + dx, groundY - 16 + dy, r);
        frontLayer.fill('#00a800'); pixelCircle(frontLayer, bx + dx - 2, groundY - 18 + dy, r - 3);
    });
    frontLayer.fill('#80d010');
    for (let i = 0; i < 26; i++) frontLayer.rect(bx + floor(random(-30, 30)), groundY - 30 + floor(random(0, 16)), 2, 1);
    const grassTop = groundY - 4;
    frontLayer.fill('#00a800');
    frontLayer.rect(0, grassTop, W, H - grassTop);
    randomSeed(7);
    for (let x = 0; x < W; x++) {
        const h = floor(4 + noise(x * 0.15) * 14 + random(0, 4));
        frontLayer.fill(x % 3 === 0 ? '#006800' : '#00a800');
        frontLayer.rect(x, grassTop - h, 1, h);
        frontLayer.fill('#80d010');
        frontLayer.rect(x, grassTop - h, 1, 2);
    }
    frontLayer.fill('#a05000');
    frontLayer.rect(0, H - HUD_H, W, HUD_H);
    frontLayer.fill('#6c2a00');
    for (let i = 0; i < W * 0.6; i++) frontLayer.rect(floor(random(W)), floor(random(H - HUD_H + 2, H)), 2, 1);
    frontLayer.fill('#80d010');
    frontLayer.rect(0, H - HUD_H, W, 1);

    clouds = [];
    randomSeed();
    for (let i = 0; i < 4; i++) clouds.push({ x: random(W), y: random(12, H * 0.35), r: floor(random(5, 9)), v: random(1, 3) });
}

function pixelCircle(g, cx, cy, r) {
    for (let dy = -r; dy <= r; dy++) {
        const hw = floor(Math.sqrt(r * r - dy * dy));
        g.rect(cx - hw, cy + dy, hw * 2 + 1, 1);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    layout();
}

// ---------------------------------------------------------------
// Players
// ---------------------------------------------------------------
function makePlayer(slot, source, link) {
    return {
        slot, source, link,
        name: 'P' + (slot + 1),
        color: COLORS[slot],
        ax: 0.5, ay: 0.4, cx: W / 2, cy: H * 0.4,
        ammo: SHOTS_PER_DUCK, score: 0, shots: 0, hits: 0
    };
}

function handleJoin(link) {
    const slot = slots.findIndex(s => s === null);
    if (slot === -1) return false;
    const p = makePlayer(slot, 'phone', link);
    if (state === 'PLAY') p.ammo = phase === 'fly' ? SHOTS_PER_DUCK : 0;
    slots[slot] = p;
    renderSlots();
    sfx.join();
    return { slot, name: p.name, color: p.color, state: state.toLowerCase(), ammo: p.ammo };
}

function handleLeave(link) {
    const i = slots.findIndex(s => s && s.link === link);
    if (i !== -1) slots[i] = null;
    renderSlots();
    if (state === 'PLAY' && players().length === 0) toTitle();
}

function handleMessage(link, msg) {
    const p = slots.find(s => s && s.link === link);
    if (!p) return;
    if (msg.t === 'aim') {
        p.ax = constrain((msg.x + 1) / 2, 0, 1);
        p.ay = constrain((msg.y + 1) / 2, 0, 1);
    } else if (msg.t === 'fire') {
        fire(p);
    } else if (msg.t === 'start') {
        if (state !== 'PLAY') startGame();
    }
}

function toggleMousePlayer() {
    const i = slots.findIndex(s => s && s.source === 'mouse');
    if (i !== -1) slots[i] = null;
    else {
        const slot = slots.findIndex(s => s === null);
        if (slot === -1) return;
        slots[slot] = makePlayer(slot, 'mouse', null);
        sfx.join();
    }
    renderSlots();
}

function sendTo(p, msg) {
    if (p.link) host.send(p.link, msg);
}

function selectMode(m) {
    mode = m;
    document.querySelectorAll('.menu-item').forEach(el => el.classList.toggle('selected', +el.dataset.mode === m));
    sfx.blip();
}

function onCanvasPointer(e) {
    sfx.unlock();
    const p = slots.find(s => s && s.source === 'mouse');
    if (p && e.pointerType === 'mouse') fire(p);
}

function onKey(e) {
    sfx.unlock();
    const p = slots.find(s => s && s.source === 'mouse');
    if (e.code === 'Space' && p) { e.preventDefault(); fire(p); }
    if (state === 'TITLE' && (e.code === 'ArrowUp' || e.code === 'ArrowDown')) { e.preventDefault(); selectMode(mode === 1 ? 2 : 1); }
    if (e.code === 'Enter' && state !== 'PLAY' && players().length) startGame();
}

// ---------------------------------------------------------------
// Game flow
// ---------------------------------------------------------------
function startGame() {
    if (!players().length) return;
    sfx.unlock();
    players().forEach(p => { p.score = 0; p.shots = 0; p.hits = 0; p.ammo = 0; });
    ducks = [];
    popups = [];
    roundNo = 1;
    state = 'PLAY';
    $('title').classList.add('hidden');
    $('results').classList.add('hidden');
    $('hud').classList.remove('hidden');
    document.body.classList.toggle('mouse-aim', players().some(p => p.source === 'mouse'));
    beginRound();
}

function beginRound() {
    duckIndex = 0;
    hits = Array(DUCKS_PER_ROUND).fill('pending');
    phase = 'intro';
    phaseT = 1.8;
    skyColor = SKY;
    showMessage(`ROUND<br>${roundNo}`);
    sfx.roundStart();
    hudCache = '';
    host.broadcast({ t: 'state', state: 'playing', round: roundNo });
}

function startWave() {
    const n = min(mode, DUCKS_PER_ROUND - duckIndex);
    for (let i = 0; i < n; i++) spawnDuck(duckIndex + i);
    duckIndex += n;
    flyTimer = max(3.6, 6.5 - (roundNo - 1) * 0.3);
    phase = 'fly';
    players().forEach(p => { p.ammo = SHOTS_PER_DUCK; sendTo(p, { t: 'ammo', n: p.ammo }); });
}

function spawnDuck(slotIndex) {
    const r = random();
    const type = r < 0.05 ? 'gold' : r < 0.2 ? 'red' : r < 0.5 ? 'blue' : 'black';
    const speed = min(130, 40 + (roundNo - 1) * 5) * TYPES[type].speed;
    const a = radians(random(35, 65));
    const dir = random() < 0.5 ? -1 : 1;
    hits[slotIndex] = 'live';
    ducks.push({
        type, slotIndex, speed,
        x: random(W * 0.2, W * 0.8 - 22),
        y: groundY - 6,
        vx: Math.cos(a) * speed * dir,
        vy: -Math.sin(a) * speed,
        state: 'fly',
        t: 0, turn: random(0.8, 1.6), anim: 0
    });
}

function flyAway() {
    ducks.forEach(d => {
        if (d.state === 'fly') {
            d.state = 'escape';
            hits[d.slotIndex] = 'miss';
        }
    });
    skyColor = SKY_FLYAWAY;
    phase = 'flyaway';
    phaseT = 0.8;
    showMessage('FLY AWAY');
    sfx.flyAway();
    host.broadcast({ t: 'flyaway' });
}

function nextWaveOrRound() {
    hideMessage();
    skyColor = SKY;
    if (duckIndex < DUCKS_PER_ROUND) { startWave(); return; }

    const count = hits.filter(h => h === 'hit').length;
    if (count >= quota(roundNo)) {
        if (count === DUCKS_PER_ROUND) {
            players().forEach(p => { p.score += 10000; sendTo(p, { t: 'hit', points: 10000, score: p.score }); });
            showMessage('PERFECT!!<br>10000');
            sfx.perfect();
        } else {
            showMessage(`ROUND ${roundNo}<br>CLEAR`);
            sfx.clear();
        }
        phase = 'clear';
        phaseT = 2.4;
    } else {
        showMessage('GAME OVER');
        sfx.gameOver();
        phase = 'over';
        phaseT = 2.6;
    }
}

function showResults() {
    state = 'OVER';
    hideMessage();
    $('hud').classList.add('hidden');
    document.body.classList.remove('mouse-aim');

    const ranked = players().slice().sort((a, b) => b.score - a.score);
    const best = ranked.length ? ranked[0].score : 0;
    const isTop = best > topScore;
    if (isTop) {
        topScore = best;
        try { localStorage.setItem('duckshoot-top', String(topScore)); } catch { /* ignore */ }
    }
    $('top-score').textContent = pad(topScore);
    $('results-sub').innerHTML = `YOU REACHED ROUND ${roundNo}<br>${isTop ? 'NEW TOP SCORE!' : `TOP SCORE = ${pad(topScore)}`}`;
    $('board').innerHTML = ranked.map((p, i) => {
        const acc = p.shots ? Math.round((p.hits / p.shots) * 100) : 0;
        return `<div class="board-row" style="--c:${p.color}"><span>${i + 1}.</span><span>${p.name}<small>${p.hits} DUCKS · ${acc}% AIM</small></span><span class="pts">${pad(p.score)}</span></div>`;
    }).join('');
    $('results').classList.remove('hidden');

    ranked.forEach((p, i) => sendTo(p, { t: 'result', rank: i + 1, of: ranked.length, score: p.score, round: roundNo }));
    host.broadcast({ t: 'state', state: 'over' });
}

function toTitle() {
    state = 'TITLE';
    phase = '';
    ducks = [];
    skyColor = SKY;
    hideMessage();
    $('hud').classList.add('hidden');
    $('results').classList.add('hidden');
    $('title').classList.remove('hidden');
    document.body.classList.remove('mouse-aim');
    renderSlots();
    host.broadcast({ t: 'state', state: 'title' });
}

function showMessage(html) {
    $('message').innerHTML = `<div class="box">${html}</div>`;
    $('message').classList.remove('hidden');
}

function hideMessage() {
    $('message').classList.add('hidden');
}

// ---------------------------------------------------------------
// Shooting
// ---------------------------------------------------------------
function fire(p) {
    if (state !== 'PLAY' || phase !== 'fly' || p.ammo <= 0) return;
    p.ammo--;
    p.shots++;
    sfx.shot();
    if (flashOn && millis() - lastFlash > 350) {
        flashFrames = 2;
        lastFlash = millis();
    }

    let target = null;
    let best = Infinity;
    ducks.forEach(d => {
        if (d.state !== 'fly') return;
        const dd = dist(p.cx, p.cy, d.x + 11, d.y + 9);
        if (dd < 13 && dd < best) { best = dd; target = d; }
    });

    if (target) {
        target.state = 'shock';
        target.t = 0.45;
        hits[target.slotIndex] = 'hit';
        const points = Math.round(TYPES[target.type].points * roundMult(roundNo) / 100) * 100;
        p.score += points;
        p.hits++;
        popups.push({ x: target.x + 11, y: target.y + 22, text: String(points), life: 1.4 });
        sfx.hit();
        sendTo(p, { t: 'hit', points, score: p.score });
    }
    sendTo(p, { t: 'ammo', n: p.ammo });
}

// ---------------------------------------------------------------
// Simulation
// ---------------------------------------------------------------
function update() {
    const dt = STEP;
    clouds.forEach(c => { c.x += c.v * dt; if (c.x - c.r * 3 > W) c.x = -c.r * 3; });

    // Title screen: one duck flaps around in the background
    if (state !== 'PLAY' && ducks.length === 0) {
        spawnDuck(0);
        ducks[0].ambient = true;
    }

    ducks.forEach(d => { d.anim += dt; });
    for (let i = ducks.length - 1; i >= 0; i--) {
        const d = ducks[i];
        if (d.state === 'fly') {
            d.x += d.vx * dt;
            d.y += d.vy * dt;
            if (d.x < 0) { d.x = 0; d.vx = Math.abs(d.vx); }
            if (d.x > W - 22) { d.x = W - 22; d.vx = -Math.abs(d.vx); }
            if (d.y < 4) { d.y = 4; d.vy = Math.abs(d.vy); }
            if (d.y > groundY - 34 && d.vy > 0) d.vy = -Math.abs(d.vy);
            d.turn -= dt;
            if (d.turn <= 0) {
                const a = radians(random(25, 65));
                d.vx = Math.cos(a) * d.speed * (random() < 0.5 ? -1 : 1);
                d.vy = Math.sin(a) * d.speed * (random() < 0.5 ? -1 : 1);
                d.turn = random(0.5, 1.4);
            }
        } else if (d.state === 'shock') {
            d.t -= dt;
            if (d.t <= 0) { d.state = 'fall'; sfx.fall(); }
        } else if (d.state === 'fall') {
            d.y += 95 * dt;
            if (d.y > groundY) { ducks.splice(i, 1); sfx.thud(); }
        } else if (d.state === 'escape') {
            d.y -= 130 * dt;
            if (d.y < -30) ducks.splice(i, 1);
        }
    }

    for (let i = popups.length - 1; i >= 0; i--) {
        popups[i].life -= dt;
        if (popups[i].life <= 0) popups.splice(i, 1);
    }

    players().forEach(p => {
        if (p.source === 'mouse') {
            p.cx = constrain(mouseX / SCALE, 0, W);
            p.cy = constrain(mouseY / SCALE, 0, H);
        } else {
            p.cx = lerp(p.cx, p.ax * W, 0.4);
            p.cy = lerp(p.cy, p.ay * (H - HUD_H), 0.4);
        }
    });

    if (state !== 'PLAY') return;

    if (phase === 'intro') {
        phaseT -= dt;
        if (phaseT <= 0) { hideMessage(); startWave(); }
    } else if (phase === 'fly') {
        flyTimer -= dt;
        const flying = ducks.filter(d => d.state === 'fly');
        const outOfAmmo = players().every(p => p.ammo <= 0);
        if (flying.length === 0) { phase = 'settle'; phaseT = 0.5; }
        else if (flyTimer <= 0 || outOfAmmo) flyAway();
    } else if (phase === 'settle' || phase === 'flyaway') {
        if (ducks.length === 0) {
            phaseT -= dt;
            if (phaseT <= 0) nextWaveOrRound();
        }
    } else if (phase === 'clear') {
        phaseT -= dt;
        if (phaseT <= 0) { roundNo++; beginRound(); }
    } else if (phase === 'over') {
        phaseT -= dt;
        if (phaseT <= 0) showResults();
    }
}

// ---------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------
function draw() {
    accumulator += min(deltaTime / 1000, 0.1);
    while (accumulator >= STEP) {
        update();
        accumulator -= STEP;
    }

    pg.noStroke();
    if (state === 'PLAY') updateHud();

    // Light-gun flash: black screen, white boxes where the ducks are
    if (flashFrames > 0) {
        flashFrames--;
        pg.background(0);
        pg.fill(255);
        ducks.forEach(d => { if (d.state === 'fly') pg.rect(round2(d.x) + 3, round2(d.y) + 3, 16, 12); });
        image(pg, 0, 0, width, height);
        return;
    }

    pg.background(skyColor);

    pg.fill('#fcfcfc');
    clouds.forEach(c => {
        pixelCircle(pg, floor(c.x), floor(c.y), c.r);
        pixelCircle(pg, floor(c.x + c.r * 1.3), floor(c.y + 2), c.r - 2);
        pixelCircle(pg, floor(c.x - c.r * 1.2), floor(c.y + 2), c.r - 3);
    });

    pg.image(backLayer, 0, 0);
    ducks.forEach(drawDuck);
    pg.image(frontLayer, 0, 0);

    pg.textSize(8);
    pg.textAlign(CENTER, CENTER);
    popups.forEach(p => {
        if (p.life < 0.3 && frameCount % 4 < 2) return;
        pg.fill(0);
        pg.text(p.text, p.x + 1, p.y + 1);
        pg.fill('#fcfcfc');
        pg.text(p.text, p.x, p.y);
    });

    if (state === 'PLAY') players().forEach(drawCrosshair);

    image(pg, 0, 0, width, height);
}

const round2 = (v) => Math.round(v);

function drawDuck(d) {
    const set = sprites[d.type];
    const x = round2(d.x);
    const y = round2(d.y);
    const cycle = ['up', 'mid', 'down', 'mid'];

    pg.push();
    if (d.state === 'fly') {
        const frame = set[cycle[floor(d.anim * 12) % 4]];
        if (d.vx < 0) { pg.translate(x + 22, y); pg.scale(-1, 1); pg.image(frame, 0, 0); }
        else pg.image(frame, x, y);
    } else if (d.state === 'shock') {
        pg.image(set.shock, x, y);
    } else if (d.state === 'fall') {
        // Head down, flipping side to side as it drops
        pg.translate(x + 11, y + 11);
        pg.rotate(HALF_PI);
        if (floor(d.anim * 8) % 2) pg.scale(1, -1);
        pg.image(set.mid, -11, -8);
    } else if (d.state === 'escape') {
        pg.image(set[floor(d.anim * 12) % 2 ? 'up' : 'down'], x, y);
    }
    pg.pop();
}

function drawCrosshair(p) {
    const x = round2(p.cx);
    const y = round2(p.cy);
    // Black outline, then the player's colour
    [['#000', 1], [p.color, 0]].forEach(([c, o]) => {
        pg.fill(c);
        pg.rect(x - 7 - o, y - 1 - o, 5 + o * 2, 2 + o * 2);
        pg.rect(x + 3 - o, y - 1 - o, 5 + o * 2, 2 + o * 2);
        pg.rect(x - 1 - o, y - 7 - o, 2 + o * 2, 5 + o * 2);
        pg.rect(x - 1 - o, y + 3 - o, 2 + o * 2, 5 + o * 2);
    });
    pg.fill(p.color);
    pg.rect(x - 5, y - 5, 2, 1); pg.rect(x - 5, y - 5, 1, 2);
    pg.rect(x + 4, y - 5, 2, 1); pg.rect(x + 5, y - 5, 1, 2);
    pg.rect(x - 5, y + 5, 2, 1); pg.rect(x - 5, y + 4, 1, 2);
    pg.rect(x + 4, y + 5, 2, 1); pg.rect(x + 5, y + 4, 1, 2);
}

// ---------------------------------------------------------------
// DOM UI
// ---------------------------------------------------------------
function renderSlots() {
    $('slots').innerHTML = slots.map((p, i) => p
        ? `<div class="slot filled" style="--c:${p.color}"><b>${p.name}</b>${p.source === 'mouse' ? 'MOUSE' : 'PHONE'}</div>`
        : `<div class="slot"><b style="color:#555">P${i + 1}</b>----</div>`
    ).join('');
    $('start-btn').disabled = players().length === 0;
    const hasMouse = slots.some(s => s && s.source === 'mouse');
    $('mouse-btn').textContent = hasMouse ? 'REMOVE MOUSE' : 'PLAY WITH MOUSE';
}

function updateHud() {
    const key = [roundNo, hits.join(), players().map(p => `${p.ammo}.${p.score}`).join()].join('|');
    if (key === hudCache) return;
    hudCache = key;

    $('hud-round').textContent = `R=${roundNo}`;
    $('hud-shots').innerHTML = players().map(p =>
        `<div class="shot-row">${[0, 1, 2].map(i => `<i class="shell ${i < p.ammo ? '' : 'used'}" style="--c:${p.color}"></i>`).join('')}</div>`
    ).join('');
    const q = quota(roundNo);
    $('hud-hits').style.setProperty('--q', `calc(var(--px) * ${q * 4.25 - 0.75})`);
    $('hud-hits').innerHTML = hits.map(h => `<i class="hit-icon ${h === 'pending' ? '' : h}"></i>`).join('');
    $('hud-scores').innerHTML = players().map(p =>
        `<div class="score-line" style="--c:${p.color}">${p.name} <span>${pad(p.score)}</span></div>`
    ).join('');
}

// ---------------------------------------------------------------
// Sound: chiptune-style effects synthesised with Web Audio
// ---------------------------------------------------------------
const sfx = (() => {
    let ctx = null;

    const unlock = () => {
        if (!ctx) {
            try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { return; }
        }
        if (ctx.state === 'suspended') ctx.resume();
    };

    const out = (node, t, peak, dur) => {
        const g = ctx.createGain();
        g.gain.setValueAtTime(peak, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        node.connect(g).connect(ctx.destination);
    };

    const tone = (f0, f1, dur, peak = 0.08, delay = 0, type = 'square') => {
        if (!ctx) return;
        const t = ctx.currentTime + delay;
        const o = ctx.createOscillator();
        o.type = type;
        o.frequency.setValueAtTime(f0, t);
        if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
        out(o, t, peak, dur);
        o.start(t);
        o.stop(t + dur + 0.02);
    };

    const noise = (dur, peak, cutoff) => {
        if (!ctx) return;
        const t = ctx.currentTime;
        const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
        const data = buf.getChannelData(0);
        // Stepped noise sounds more like an old sound chip
        let v = 0;
        for (let i = 0; i < data.length; i++) { if (i % 6 === 0) v = Math.random() * 2 - 1; data[i] = v; }
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = cutoff;
        src.connect(lp);
        out(lp, t, peak, dur);
        src.start(t);
    };

    const melody = (notes, len, peak = 0.07) => notes.forEach((f, i) => tone(f, f, len * 0.9, peak, i * len));

    return {
        unlock,
        shot: () => noise(0.25, 0.45, 3000),
        hit: () => { tone(1400, 700, 0.08, 0.07); },
        fall: () => tone(1600, 250, 0.9, 0.05),
        thud: () => noise(0.12, 0.3, 500),
        flyAway: () => melody([784, 740, 698, 659, 622, 587], 0.07),
        roundStart: () => melody([523, 659, 784, 1047, 784, 1047], 0.09),
        clear: () => melody([659, 784, 1047, 1319], 0.11),
        perfect: () => melody([523, 659, 784, 1047, 1319, 1568, 2093], 0.08),
        gameOver: () => melody([392, 370, 349, 330, 262], 0.22, 0.08),
        join: () => melody([880, 1175], 0.07),
        blip: () => tone(1047, 1047, 0.05, 0.05)
    };
})();
