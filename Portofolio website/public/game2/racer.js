// River Racer: the big-screen side.
// Phones join through GameLink (../shared/link.js) and become two-button paddles.
// Hold both sides to paddle forward, release one to turn.

// ====== TUNING (per 60 Hz step, world units) ======
const ACCELERATION_RATE = 0.05;
const MAX_SPEED_FORWARD = -14;
const DRIFT_SPEED = 2;            // the current pushes idle boats back
const STEER_SPEED = 8;
const STUN_STEPS = 60;
const STUN_KNOCKBACK = 8;
const BOAT_RADIUS = 22;
const TRACK_W = 560;
const RACE_LEN = 9000;
const OUT_SECONDS = 5;
const STEP = 1 / 60;

const PLAYER_STYLE = [
    { name: 'Red', color: '#ff5b47', dark: '#b8321f', keys: '← →' },
    { name: 'Blue', color: '#4d8dff', dark: '#2455b8', keys: 'A D' }
];

let host;
let slots = [null, null];
let obstacles = [];
let decor = [];
let particles = [];
let ripples = [];
let state = 'LOBBY';             // LOBBY | COUNTDOWN | RACING | FINISHED
let camY = 0;
let Z = 1;
let raceTime = 0;
let clock = 0;
let accumulator = 0;
let autoStartTimer = null;
let hudCache = '';
let bestTime = null;
const keys = {};

const $ = (id) => document.getElementById(id);
const players = () => slots.filter(Boolean);

// ---------------------------------------------------------------
// Setup
// ---------------------------------------------------------------
function setup() {
    createCanvas(windowWidth, windowHeight);
    layout();
    buildCourse();

    try { bestTime = parseFloat(localStorage.getItem('riverracer-best')) || null; } catch { /* private mode */ }

    host = GameLink.createHost({
        game: 'river',
        codePrefix: 'R',
        maxPlayers: 2,
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

    $('start-btn').addEventListener('click', startCountdown);
    $('again-btn').addEventListener('click', startCountdown);
    $('lobby-btn').addEventListener('click', backToLobby);
    $('kb-btn').addEventListener('click', addKeyboardPlayer);
    window.addEventListener('keydown', e => onKey(e, true));
    window.addEventListener('keyup', e => onKey(e, false));
    renderSlots();
}

function layout() {
    Z = min((width * 0.62) / TRACK_W, height / 720);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    layout();
}

// A fresh river every race: rocks and logs with room to get through
function buildCourse() {
    obstacles = [];
    const half = TRACK_W / 2;
    for (let y = -520; y > -RACE_LEN + 300; y -= random(230, 290)) {
        const count = random() < 0.45 ? 2 : 1;
        for (let i = 0; i < count; i++) {
            for (let attempt = 0; attempt < 40; attempt++) {
                const isLog = random() < 0.3;
                const o = isLog
                    ? { type: 'log', x: random(-half + 90, half - 90), y: y + random(-60, 60), len: random(110, 170), ang: random(-0.35, 0.35), r: 15, drift: random(0.3, 0.8) * (random() < 0.5 ? -1 : 1) }
                    : { type: 'rock', x: random(-half + 50, half - 50), y: y + random(-80, 80), r: random(26, 44), seed: random(1000) };
                const clear = obstacles.every(p => dist(o.x, o.y, p.x, p.y) > (o.len || o.r * 2) / 2 + (p.len || p.r * 2) / 2 + 70);
                if (clear) {
                    if (o.type === 'rock') o.shape = Array.from({ length: 9 }, (_, k) => 0.82 + noise(o.seed + k) * 0.3);
                    obstacles.push(o);
                    break;
                }
            }
        }
    }

    // Banks: trees and reeds; water: lily pads near the edges
    decor = [];
    for (let y = 300; y > -RACE_LEN - 900; y -= random(70, 150)) {
        const side = random() < 0.5 ? -1 : 1;
        decor.push({ type: 'tree', x: side * (half + random(70, 260)), y, r: random(34, 60) });
        if (random() < 0.5) decor.push({ type: 'reed', x: side * (half + random(8, 28)), y: y + random(-40, 40) });
        if (random() < 0.35) decor.push({ type: 'lily', x: -side * (half - random(18, 40)), y: y + random(-40, 40), r: random(10, 16), rot: random(TWO_PI) });
    }
}

// ---------------------------------------------------------------
// Players
// ---------------------------------------------------------------
function makePlayer(slot, source, link) {
    const style = PLAYER_STYLE[slot];
    return {
        slot, source, link,
        name: style.name, color: style.color, dark: style.dark,
        keys: slot === 0 ? { left: 'ArrowLeft', right: 'ArrowRight' } : { left: 'KeyA', right: 'KeyD' },
        x: 0, y: 0, speedY: 0, stunned: 0,
        inputs: { left: false, right: false },
        offScreen: 0, finished: false, out: false, time: null, paddle: 0
    };
}

function resetPlayer(p) {
    p.x = players().length === 2 ? (p.slot === 0 ? -110 : 110) : 0;
    p.y = 0;
    p.speedY = 0;
    p.stunned = 0;
    p.offScreen = 0;
    p.finished = false;
    p.out = false;
    p.time = null;
}

function handleJoin(link) {
    const slot = slots.findIndex(s => s === null);
    if (slot === -1 || state === 'RACING' || state === 'COUNTDOWN') return false;
    slots[slot] = makePlayer(slot, 'phone', link);
    resetPlayer(slots[slot]);
    renderSlots();
    maybeAutoStart();
    return { slot, name: slots[slot].name, color: slots[slot].color, state: state.toLowerCase() };
}

function handleLeave(link) {
    const i = slots.findIndex(s => s && s.link === link);
    if (i !== -1) slots[i] = null;
    renderSlots();
    if ((state === 'RACING' || state === 'COUNTDOWN') && players().length === 0) backToLobby();
}

function handleMessage(link, msg) {
    const p = slots.find(s => s && s.link === link);
    if (!p) return;
    if (msg.t === 'input') p.inputs = { left: !!msg.left, right: !!msg.right };
    else if (msg.t === 'start' && (state === 'LOBBY' || state === 'FINISHED')) startCountdown();
}

function addKeyboardPlayer() {
    const slot = slots.findIndex(s => s === null);
    if (slot === -1 || state !== 'LOBBY') return;
    slots[slot] = makePlayer(slot, 'keyboard', null);
    resetPlayer(slots[slot]);
    renderSlots();
    maybeAutoStart();
}

function onKey(e, down) {
    keys[e.code] = down;
    players().forEach(p => {
        if (p.source !== 'keyboard') return;
        p.inputs = { left: !!keys[p.keys.left], right: !!keys[p.keys.right] };
    });
    if (down && e.code === 'Enter') {
        if (state === 'LOBBY' && !players().length) addKeyboardPlayer();
        else if (state === 'LOBBY' || state === 'FINISHED') startCountdown();
    }
    if (e.code.startsWith('Arrow')) e.preventDefault();
}

function sendTo(p, msg) {
    if (p.link) host.send(p.link, msg);
}

// Two players ready: start on our own after a short pause
function maybeAutoStart() {
    clearTimeout(autoStartTimer);
    if (state === 'LOBBY' && players().length === 2) {
        $('start-btn').textContent = 'Starting…';
        autoStartTimer = setTimeout(startCountdown, 2500);
    }
}

// ---------------------------------------------------------------
// Race flow
// ---------------------------------------------------------------
function startCountdown() {
    if (!players().length || state === 'COUNTDOWN' || state === 'RACING') return;
    clearTimeout(autoStartTimer);
    buildCourse();
    players().forEach(resetPlayer);
    particles = [];
    ripples = [];
    camY = 0;
    raceTime = 0;
    state = 'COUNTDOWN';
    $('lobby').classList.add('hidden');
    $('results').classList.add('hidden');
    $('hud').classList.remove('hidden');
    hudCache = '';
    host.broadcast({ t: 'state', state: 'countdown' });

    let n = 3;
    const tick = () => {
        if (state !== 'COUNTDOWN') return;
        $('countdown').classList.remove('hidden');
        if (n > 0) {
            $('countdown').innerHTML = `<span>${n}</span>`;
            n--;
            setTimeout(tick, 800);
        } else {
            $('countdown').innerHTML = '<span>GO!</span>';
            setTimeout(() => $('countdown').classList.add('hidden'), 700);
            state = 'RACING';
            host.broadcast({ t: 'state', state: 'racing' });
        }
    };
    tick();
}

function finishRace(winner) {
    if (state !== 'RACING') return;
    state = 'FINISHED';
    const solo = players().length === 1;

    let title;
    if (solo) {
        const p = players()[0];
        const isBest = p.time != null && (bestTime == null || p.time < bestTime);
        if (isBest) {
            bestTime = p.time;
            try { localStorage.setItem('riverracer-best', String(bestTime)); } catch { /* ignore */ }
        }
        $('results-kicker').textContent = isBest ? 'New best time!' : `Best time ${bestTime ? bestTime.toFixed(1) + ' s' : '—'}`;
        title = p.time != null ? `${p.time.toFixed(1)} s` : 'Swept away!';
    } else {
        $('results-kicker').textContent = 'Race over';
        title = winner ? `${winner.name} wins!` : 'Nobody made it!';
    }
    $('results-title').textContent = title;
    $('results-title').style.color = winner ? winner.color : '';

    const ranked = players().slice().sort((a, b) => (a === winner ? -1 : b === winner ? 1 : a.y - b.y));
    $('scoreboard').innerHTML = ranked.map((p, i) => {
        const pct = Math.round(constrain(-p.y / RACE_LEN, 0, 1) * 100);
        const detail = p.time != null ? `${p.time.toFixed(1)} s` : p.out ? 'Fell behind' : `${pct}%`;
        return `<div class="score-row" style="--c:${p.color};animation-delay:${i * 0.08}s">
            <span class="score-rank">#${i + 1}</span>
            <span class="score-name">${p.name} <small>${p.source === 'phone' ? 'Phone' : 'Keyboard'}</small></span>
            <span class="score-value">${detail}</span>
        </div>`;
    }).join('');

    setTimeout(() => {
        $('hud').classList.add('hidden');
        $('results').classList.remove('hidden');
    }, 1200);

    players().forEach(p => sendTo(p, { t: 'result', won: p === winner || (solo && p.time != null), time: p.time, solo }));
    host.broadcast({ t: 'state', state: 'finished' });
}

function backToLobby() {
    clearTimeout(autoStartTimer);
    state = 'LOBBY';
    $('results').classList.add('hidden');
    $('hud').classList.add('hidden');
    $('countdown').classList.add('hidden');
    $('lobby').classList.remove('hidden');
    players().forEach(resetPlayer);
    camY = 0;
    renderSlots();
    host.broadcast({ t: 'state', state: 'lobby' });
}

// ---------------------------------------------------------------
// Simulation
// ---------------------------------------------------------------
function screenY(worldY) {
    return height * 0.62 + (worldY - camY) * Z;
}

function segmentDistance(px, py, o) {
    const hx = Math.cos(o.ang) * o.len / 2;
    const hy = Math.sin(o.ang) * o.len / 2;
    const ax = o.x - hx, ay = o.y - hy, bx = o.x + hx, by = o.y + hy;
    const t = constrain(((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / ((bx - ax) ** 2 + (by - ay) ** 2), 0, 1);
    return dist(px, py, ax + t * (bx - ax), ay + t * (by - ay));
}

function update() {
    clock += STEP;
    const half = TRACK_W / 2;

    // Logs drift slowly across the river
    obstacles.forEach(o => {
        if (o.type !== 'log') return;
        o.x += o.drift * 0.4;
        if (o.x < -half + 70 || o.x > half - 70) o.drift *= -1;
    });

    if (state === 'RACING') {
        raceTime += STEP;
        const active = players().filter(p => !p.finished && !p.out);

        active.forEach(p => {
            const { left, right } = p.inputs;
            if (p.stunned > 0) {
                p.stunned--;
                p.speedY = lerp(p.speedY, 3, 0.1);
            } else if (left && right) {
                p.speedY = lerp(p.speedY, MAX_SPEED_FORWARD, ACCELERATION_RATE);
                if (frameCount % 5 === 0) ripples.push({ x: p.x, y: p.y + 30, r: 10, a: 1 });
            } else {
                p.speedY = lerp(p.speedY, DRIFT_SPEED, 0.05);
            }
            if (p.stunned <= 0) {
                if (left && !right) p.x -= STEER_SPEED;
                if (right && !left) p.x += STEER_SPEED;
            }
            if (left || right) p.paddle += 0.25;

            p.y += p.speedY;
            p.y = min(p.y, 60);
            p.x = constrain(p.x, -half + 30, half - 30);

            // Collisions
            if (p.stunned <= 0) {
                for (const o of obstacles) {
                    const d = o.type === 'log' ? segmentDistance(p.x, p.y, o) : dist(p.x, p.y, o.x, o.y);
                    if (d < o.r + BOAT_RADIUS) {
                        p.stunned = STUN_STEPS;
                        p.speedY = STUN_KNOCKBACK;
                        for (let i = 0; i < 16; i++) {
                            particles.push({ x: p.x, y: p.y - 20, vx: random(-4, 4), vy: random(-5, 1), life: 1 });
                        }
                        sendTo(p, { t: 'bump' });
                        break;
                    }
                }
            }

            // Finish line
            if (p.y < -RACE_LEN) {
                p.finished = true;
                p.time = raceTime;
                finishRace(p);
            }
        });

        // Two players: falling off the bottom for too long knocks you out
        if (state === 'RACING' && players().length === 2) {
            active.forEach(p => {
                if (screenY(p.y) > height + 10) {
                    p.offScreen += STEP;
                    if (Math.floor(p.offScreen * 2) !== Math.floor((p.offScreen - STEP) * 2)) sendTo(p, { t: 'warn', secs: Math.ceil(OUT_SECONDS - p.offScreen) });
                    if (p.offScreen >= OUT_SECONDS) {
                        p.out = true;
                        finishRace(players().find(o => o !== p));
                    }
                } else {
                    p.offScreen = 0;
                }
            });
        }
    }

    // Camera follows the leader
    const racers = players().filter(p => !p.out);
    if (racers.length) {
        const leaderY = min(racers.map(p => p.y));
        camY = lerp(camY, leaderY, state === 'RACING' ? 0.08 : 0.2);
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        const s = particles[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.25;
        s.life -= 0.03;
        if (s.life <= 0) particles.splice(i, 1);
    }
    for (let i = ripples.length - 1; i >= 0; i--) {
        ripples[i].r += 2.2;
        ripples[i].a -= 0.02;
        if (ripples[i].a <= 0) ripples.splice(i, 1);
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
    if (state === 'LOBBY') camY -= 0.6; // slow drift behind the lobby

    background('#3f9d4f');
    push();
    translate(width / 2, height * 0.62);
    scale(Z);
    translate(0, -camY);

    const top = camY - (height * 0.62) / Z - 100;
    const bottom = camY + (height * 0.38) / Z + 100;
    drawBanks(top, bottom);
    drawWater(top, bottom);
    drawLines();
    decor.filter(d => d.type === 'lily' && d.y > top && d.y < bottom).forEach(drawLily);
    ripples.forEach(r => {
        noFill();
        stroke(255, 255, 255, r.a * 160);
        strokeWeight(3);
        arc(r.x, r.y, r.r * 2, r.r, 0, PI);
    });
    obstacles.filter(o => o.y > top - 100 && o.y < bottom + 100).forEach(drawObstacle);
    players().filter(p => !p.out).forEach(drawBoat);
    particles.forEach(s => {
        noStroke();
        fill(255, 255, 255, s.life * 230);
        circle(s.x, s.y, 7 * s.life + 2);
    });
    decor.filter(d => d.type !== 'lily' && d.y > top - 80 && d.y < bottom + 80).forEach(d => d.type === 'tree' ? drawTree(d) : drawReed(d));
    pop();

    if (state === 'RACING' || state === 'FINISHED') {
        drawProgress();
        drawOffScreenWarnings();
        updateHud();
    }
}

function drawBanks(top, bottom) {
    // Grass texture: darker tufts on a fixed grid so they scroll with the world
    noStroke();
    const cell = 60;
    const w = (width / 2) / Z + 60;
    for (let y = Math.floor(top / cell) * cell; y < bottom; y += cell) {
        for (let x = -Math.ceil(w / cell) * cell; x < w; x += cell) {
            const n = noise(x * 0.07, y * 0.07);
            if (n < 0.45) continue;
            fill(n > 0.6 ? '#358a44' : '#4aa95a');
            ellipse(x + n * 30, y + n * 20, 26 * n + 10, 14 * n + 6);
        }
    }
}

function drawWater(top, bottom) {
    const half = TRACK_W / 2;
    noStroke();
    // Sand edges
    fill('#e8cf8e');
    rect(-half - 16, top, TRACK_W + 32, bottom - top);
    // Water with darker edges
    const ctx = drawingContext;
    const g = ctx.createLinearGradient(-half, 0, half, 0);
    g.addColorStop(0, '#15798b');
    g.addColorStop(0.18, '#1f9fb4');
    g.addColorStop(0.82, '#1f9fb4');
    g.addColorStop(1, '#15798b');
    ctx.fillStyle = g;
    ctx.fillRect(-half, top, TRACK_W, bottom - top);

    // Foam along both banks
    stroke(255, 255, 255, 170);
    strokeWeight(4);
    noFill();
    [-1, 1].forEach(side => {
        beginShape();
        for (let y = top; y < bottom; y += 24) {
            vertex(side * (half - 3 + sin(y * 0.05 + clock * 2) * 3), y);
        }
        endShape();
    });

    // Current: dashes that drift towards the start
    stroke(255, 255, 255, 60);
    strokeWeight(3);
    const cell = 110;
    const shift = (clock * 70) % cell;
    for (let y = Math.floor(top / cell) * cell; y < bottom; y += cell) {
        for (let i = 0; i < 5; i++) {
            const x = -half + 50 + ((i * 131 + y * 0.37) % (TRACK_W - 100) + TRACK_W) % (TRACK_W - 100);
            const yy = y + shift + (i * 37) % cell;
            line(x, yy, x, yy + 26);
        }
    }
}

function drawLines() {
    const half = TRACK_W / 2;
    noStroke();
    // Start line and finish banner, checkered
    [0, -RACE_LEN].forEach((y, k) => {
        const n = 14;
        const w = TRACK_W / n;
        for (let r = 0; r < 2; r++) {
            for (let i = 0; i < n; i++) {
                fill((i + r) % 2 ? 20 : 250);
                rect(-half + i * w, y - 12 + r * 12, w, 12);
            }
        }
        // Posts and label
        fill('#503000');
        rect(-half - 26, y - 30, 10, 50, 3);
        rect(half + 16, y - 30, 10, 50, 3);
        fill(k ? '#ffc53d' : '#f3efe6');
        textAlign(CENTER, CENTER);
        textFont('Bricolage Grotesque');
        textStyle(BOLD);
        textSize(34);
        text(k ? 'FINISH' : 'START', 0, y - 48);
    });
}

function drawLily(d) {
    push();
    translate(d.x, d.y);
    rotate(d.rot);
    noStroke();
    fill('#2f8f52');
    arc(0, 0, d.r * 2, d.r * 2, 0.5, TWO_PI);
    fill('#ff9fc4');
    circle(d.r * 0.2, -d.r * 0.2, d.r * 0.5);
    pop();
}

function drawObstacle(o) {
    noStroke();
    if (o.type === 'rock') {
        // Foam ring, shadow, then a lumpy rock
        fill(255, 255, 255, 90 + 40 * sin(clock * 3 + o.seed));
        ellipse(o.x, o.y + 4, o.r * 2.5, o.r * 2.1);
        fill(0, 0, 0, 50);
        ellipse(o.x + 6, o.y + 8, o.r * 2, o.r * 1.8);
        fill('#7d8591');
        beginShape();
        o.shape.forEach((k, i) => {
            const a = (i / o.shape.length) * TWO_PI;
            curveVertex(o.x + Math.cos(a) * o.r * k, o.y + Math.sin(a) * o.r * k);
        });
        o.shape.slice(0, 3).forEach((k, i) => {
            const a = (i / o.shape.length) * TWO_PI;
            curveVertex(o.x + Math.cos(a) * o.r * k, o.y + Math.sin(a) * o.r * k);
        });
        endShape();
        fill('#a7aeb8');
        ellipse(o.x - o.r * 0.25, o.y - o.r * 0.3, o.r * 0.9, o.r * 0.6);
    } else {
        push();
        translate(o.x, o.y);
        rotate(o.ang);
        fill(255, 255, 255, 80);
        rect(-o.len / 2 - 8, -o.r - 6, o.len + 16, o.r * 2 + 12, 20);
        fill('#7a4a24');
        rect(-o.len / 2, -o.r, o.len, o.r * 2, o.r);
        fill('#5c3517');
        rect(-o.len / 2 + 10, -o.r * 0.35, o.len * 0.55, 4, 2);
        rect(-o.len / 4, o.r * 0.25, o.len * 0.5, 3, 2);
        fill('#c8955e');
        ellipse(o.len / 2 - 2, 0, 12, o.r * 2 - 4);
        fill('#9c6b3d');
        ellipse(o.len / 2 - 2, 0, 6, o.r - 2);
        pop();
    }
}

function drawBoat(p) {
    const moving = p.inputs.left && p.inputs.right && p.stunned <= 0;
    let turn = 0;
    if (p.inputs.left && !p.inputs.right) turn = -0.22;
    if (p.inputs.right && !p.inputs.left) turn = 0.22;
    if (p.stunned > 0) turn = sin(p.stunned * 0.6) * 0.4;

    push();
    translate(p.x, p.y);
    rotate(turn);

    // Wake
    const speed = constrain(-p.speedY / 14, 0, 1);
    if (speed > 0.2) {
        noFill();
        stroke(255, 255, 255, 140 * speed);
        strokeWeight(3);
        line(-10, 30, -34, 30 + 60 * speed);
        line(10, 30, 34, 30 + 60 * speed);
    }

    // Hull shadow, hull and inside
    noStroke();
    fill(0, 0, 0, 60);
    drawHull(5, 7, 1.02);
    const flashing = p.stunned > 0 && floor(p.stunned / 5) % 2 === 0;
    fill(flashing ? '#ffffff' : p.color);
    drawHull(0, 0, 1);
    fill(flashing ? '#dddddd' : p.dark);
    drawHull(0, 2, 0.72);

    // Paddle, swapping sides as it strokes
    const side = p.inputs.left && !p.inputs.right ? 1 : p.inputs.right && !p.inputs.left ? -1 : (floor(p.paddle) % 2 ? 1 : -1);
    const stroke01 = (p.paddle % 1);
    stroke('#503000');
    strokeWeight(4);
    const px = side * 26;
    const py = -6 + stroke01 * 22;
    line(0, 4, px, py);
    noStroke();
    fill('#c8955e');
    ellipse(px, py, 10, 18);

    // Paddler
    fill('#f1c27d');
    circle(0, 4, 18);
    fill(p.dark);
    arc(0, 4, 19, 19, PI, TWO_PI);
    pop();

    // Name tag
    noStroke();
    fill(0, 0, 0, 120);
    textFont('JetBrains Mono');
    textStyle(BOLD);
    textSize(13);
    textAlign(CENTER, CENTER);
    rect(p.x - 22, p.y + 42, 44, 20, 8);
    fill(p.color);
    text(p.name.toUpperCase(), p.x, p.y + 52);
}

function drawHull(dx, dy, s) {
    beginShape();
    vertex(dx, dy - 40 * s);
    bezierVertex(dx + 18 * s, dy - 22 * s, dx + 18 * s, dy + 22 * s, dx, dy + 36 * s);
    bezierVertex(dx - 18 * s, dy + 22 * s, dx - 18 * s, dy - 22 * s, dx, dy - 40 * s);
    endShape(CLOSE);
}

function drawTree(d) {
    noStroke();
    fill(0, 0, 0, 55);
    circle(d.x + 12, d.y + 14, d.r * 2);
    fill('#2f7d3f');
    circle(d.x, d.y, d.r * 2);
    fill('#3f9d4f');
    circle(d.x - d.r * 0.25, d.y - d.r * 0.25, d.r * 1.3);
    fill('#58b868');
    circle(d.x - d.r * 0.4, d.y - d.r * 0.4, d.r * 0.5);
}

function drawReed(d) {
    stroke('#2f6b33');
    strokeWeight(3);
    for (let i = -1; i <= 1; i++) {
        const sway = sin(clock * 2 + d.y + i) * 3;
        line(d.x + i * 5, d.y, d.x + i * 7 + sway, d.y - 26);
    }
    noStroke();
    fill('#7a4a24');
    ellipse(d.x + sin(clock * 2 + d.y) * 3, d.y - 28, 5, 12);
}

// Race progress on the right edge
function drawProgress() {
    const x = width - 34;
    const y0 = height * 0.2;
    const y1 = height * 0.8;
    stroke(255, 255, 255, 90);
    strokeWeight(6);
    line(x, y0, x, y1);
    noStroke();
    fill('#ffc53d');
    rect(x - 12, y0 - 4, 24, 8, 3);
    players().forEach(p => {
        const t = constrain(-p.y / RACE_LEN, 0, 1);
        fill(p.color);
        stroke(12);
        strokeWeight(3);
        circle(x, lerp(y1, y0, t), 18);
    });
}

function drawOffScreenWarnings() {
    players().forEach(p => {
        if (p.out || p.offScreen <= 0) return;
        const sx = width / 2 + p.x * Z;
        const secs = Math.ceil(OUT_SECONDS - p.offScreen);
        noStroke();
        fill(p.color);
        triangle(sx - 18, height - 70, sx + 18, height - 70, sx, height - 44);
        fill(12, 11, 10, 200);
        circle(sx, height - 110, 60);
        fill(p.color);
        textFont('Bricolage Grotesque');
        textStyle(BOLD);
        textSize(34);
        textAlign(CENTER, CENTER);
        text(secs, sx, height - 112);
    });
}

// ---------------------------------------------------------------
// DOM UI
// ---------------------------------------------------------------
function renderSlots() {
    $('slots').innerHTML = slots.map((p, i) => {
        const s = PLAYER_STYLE[i];
        return p
            ? `<div class="slot filled" style="--c:${s.color}"><span class="slot-dot"></span><div>${s.name}<small>${p.source === 'phone' ? 'Phone' : 'Keyboard ' + s.keys}</small></div></div>`
            : `<div class="slot" style="--c:${s.color}"><span class="slot-dot" style="opacity:.35"></span><div>${s.name}<small>Waiting…</small></div></div>`;
    }).join('');
    $('start-btn').disabled = players().length === 0;
    $('start-btn').textContent = players().length === 1 ? 'Race solo' : 'Start race';
    $('kb-btn').disabled = slots.every(Boolean);
    if (players().length === 2 && state === 'LOBBY') $('start-btn').textContent = 'Starting…';
}

function updateHud() {
    const t = raceTime.toFixed(1);
    const key = t + players().map(p => Math.round(-p.y / 10)).join();
    if (key === hudCache) return;
    hudCache = key;
    $('hud-time').textContent = t;
    const pill = (p) => p
        ? `<div class="hud-pill" style="--c:${p.color}"><i></i>${p.name}<b>${Math.max(0, Math.round(-p.y / 10))} m</b></div><div class="keys">${p.source === 'phone' ? 'Phone' : 'Keys ' + PLAYER_STYLE[p.slot].keys}</div>`
        : '';
    $('hud-left').innerHTML = pill(slots[0]);
    $('hud-right').innerHTML = pill(slots[1]);
}
