// Sword vs Gun: the big-screen side.
// Two phones join through GameLink (../shared/link.js). Each round one player has the gun and
// the other the sword. The gun tilts to aim and fires; the sword tilts to put its blade in the
// bullet's way (a cut) and flicks as it lands to send it back. Rounds last two minutes, then the
// roles swap. Health carries over until someone runs out.
//
// Phones are 20-300 ms behind (direct link or relay), so the screen decides every hit and is
// forgiving: a bullet can still be cut for a moment after it reaches the blade's guard, and a
// flick counts if it came shortly before.

// ====== TUNING (design space is 1600 x 900, scaled to the window) ======
const W = 1600;
const H = 900;
const FLOOR = 780;
const MAX_HP = 100;
const BULLET_DAMAGE = 6;       // a bullet that gets through to the sword player
const RETURN_DAMAGE = 10;      // a bullet sent back that hits the gun player
const ROUND_SECONDS = 120;
const MAG_SIZE = 6;
const FIRE_GAP_MS = 380;
const RELOAD_MS = 1800;
const BULLET_SPEED = 1500;     // units per second on the way in
const RETURN_SECONDS = 0.42;
const BLADE_LEN = 360;
const GUARD = 0.82;            // bullets meet the blade this far along it
const BLOCK_RADIUS = 46;       // how close the blade must pass to where the bullet crosses
const CONTACT_MS = 140;        // the blade can still cut a bullet this long after it arrives
const SWING_EARLY_MS = 350;    // a flick up to this long before the bullet arrives still counts
const AIM_EASE = 0.4;
const KEY_TURN = 210;          // keyboard sword: degrees per second
const KEY_AIM = 1.5;           // keyboard gun: aim range per second
const STEP = 1 / 60;

// Where everyone stands
const GUN_X = 240;
const SWORD_X = 1350;
const HANDS = { x: 1255, y: 700 };   // the sword is held low, in front
const GUARD_R = BLADE_LEN * GUARD;

const PLAYER_STYLE = [
    { name: 'Blue', color: '#4d8dff', keys: { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight', action: 'Slash', duck: 'Period' }, label: 'Arrows · / · .' },
    { name: 'Coral', color: '#ff5b47', keys: { up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD', action: 'Space', duck: 'ShiftLeft' }, label: 'WASD · Space · Shift' }
];

let host;
let slots = [null, null];
let state = 'LOBBY';           // LOBBY | COUNTDOWN | PLAYING | SWAP | OVER
let simMs = 0;
let accumulator = 0;
let Z = 1;
let round = 1;
let roundLeft = ROUND_SECONDS;
let bullets = [];
let halves = [];
let sparks = [];
let popups = [];
let shake = 0;
let hudCache = '';
let banner = null;
const keys = {};

const $ = (id) => document.getElementById(id);
const players = () => slots.filter(Boolean);
const gunner = () => players().find(p => p.role === 'gun');
const swordsman = () => players().find(p => p.role === 'sword');

// ---------------------------------------------------------------
// Sound (Web Audio, no files)
// ---------------------------------------------------------------
const Sound = {
    ctx: null,
    master: null,
    noise: null,
    muted: false,
    hum: null,

    init() {
        if (this.ctx) return;
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.6;
        this.master.connect(this.ctx.destination);
        const len = this.ctx.sampleRate;
        this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
        const data = this.noise.getChannelData(0);
        for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    },

    resume() {
        this.init();
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
        if (!this.muted) $('sound-note').textContent = 'M to mute';
    },

    toggleMute() {
        this.muted = !this.muted;
        if (this.master) this.master.gain.value = this.muted ? 0 : 0.6;
        $('sound-note').textContent = this.muted ? 'Muted · M for sound' : 'M to mute';
    },

    ready() { return this.ctx && this.ctx.state === 'running'; },

    // The blade's hum: two detuned saws through a low-pass, brighter as it moves
    startHum() {
        if (this.hum || !this.ready()) return;
        const c = this.ctx;
        const a = c.createOscillator(), b = c.createOscillator();
        a.type = 'sawtooth'; b.type = 'sawtooth';
        a.frequency.value = 72; b.frequency.value = 75.5;
        const filter = c.createBiquadFilter();
        filter.type = 'lowpass'; filter.frequency.value = 380; filter.Q.value = 4;
        const gain = c.createGain();
        gain.gain.value = 0;
        a.connect(filter); b.connect(filter); filter.connect(gain); gain.connect(this.master);
        a.start(); b.start();
        this.hum = { a, b, filter, gain };
    },

    setHum(level, speed) {
        if (!this.hum) return;
        const t = this.ctx.currentTime, h = this.hum;
        const s = Math.min(1, speed / 900);
        h.gain.gain.setTargetAtTime(level * (0.035 + s * 0.09), t, 0.04);
        h.a.frequency.setTargetAtTime(72 + s * 55, t, 0.05);
        h.b.frequency.setTargetAtTime(75.5 + s * 58, t, 0.05);
        h.filter.frequency.setTargetAtTime(380 + s * 1400, t, 0.05);
    },

    burst(freq, q, dur, vol) {
        if (!this.ready()) return;
        const c = this.ctx, t = c.currentTime;
        const src = c.createBufferSource();
        src.buffer = this.noise;
        const f = c.createBiquadFilter();
        f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q;
        const g = c.createGain();
        g.gain.setValueAtTime(vol, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        src.connect(f); f.connect(g); g.connect(this.master);
        src.start(t, Math.random() * 0.5, dur + 0.05);
    },

    tone(type, from, to, dur, vol) {
        if (!this.ready()) return;
        const c = this.ctx, t = c.currentTime;
        const o = c.createOscillator();
        o.type = type;
        o.frequency.setValueAtTime(from, t);
        o.frequency.exponentialRampToValueAtTime(to, t + dur);
        const g = c.createGain();
        g.gain.setValueAtTime(vol, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        o.connect(g); g.connect(this.master);
        o.start(t); o.stop(t + dur + 0.02);
    },

    shot() { this.burst(1800, 0.7, 0.12, 0.45); this.tone('square', 220, 70, 0.1, 0.12); },
    empty() { this.tone('square', 900, 850, 0.04, 0.05); },
    reload() { this.tone('square', 500, 700, 0.06, 0.05); setTimeout(() => this.tone('square', 700, 900, 0.06, 0.05), 140); },
    cut() { this.burst(3200, 1.2, 0.18, 0.5); this.tone('sine', 2100, 1500, 0.14, 0.08); },
    sendBack() { this.burst(4200, 1.5, 0.25, 0.6); this.tone('triangle', 900, 2400, 0.22, 0.1); },
    hurt() { this.tone('sine', 140, 40, 0.35, 0.35); this.burst(500, 0.7, 0.25, 0.35); },
    whoosh(s) { this.burst(700 + s * 900, 0.6, 0.22, 0.12 + s * 0.2); },
    ignite() { this.tone('sawtooth', 50, 140, 0.35, 0.08); this.burst(1500, 0.5, 0.3, 0.15); }
};

['pointerdown', 'keydown'].forEach(ev => window.addEventListener(ev, () => Sound.resume()));

// ---------------------------------------------------------------
// Setup
// ---------------------------------------------------------------
function setup() {
    createCanvas(windowWidth, windowHeight);
    layout();

    host = GameLink.createHost({
        game: 'duel',
        codePrefix: 'S',
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

    $('start-btn').addEventListener('click', startMatch);
    $('again-btn').addEventListener('click', startMatch);
    $('lobby-btn').addEventListener('click', backToLobby);
    $('kb-btn').addEventListener('click', addKeyboardPlayer);
    window.addEventListener('keydown', e => onKey(e, true));
    window.addEventListener('keyup', e => onKey(e, false));
    renderSlots();
}

function layout() {
    Z = min(width / W, height / H);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    layout();
}

// ---------------------------------------------------------------
// Players
// ---------------------------------------------------------------
function makePlayer(slot, source, link) {
    const style = PLAYER_STYLE[slot];
    return {
        slot, source, link,
        name: style.name, color: style.color, keys: style.keys,
        role: slot === 0 ? 'gun' : 'sword',
        hp: MAX_HP,
        // Sword
        angle: -45, target: -45, speed: 0, trail: [], lastSwing: -1e9, swingFx: 0, ignite: 0,
        // Gun
        aim: 0, aimTarget: 0, ammo: MAG_SIZE, reloadAt: 0, lastShot: -1e9, ducking: false, recoil: 0,
        hurtFx: 0,
        stats: { shots: 0, cuts: 0, sentBack: 0, hitsTaken: 0 }
    };
}

function handleJoin(link) {
    const slot = slots.findIndex(s => s === null);
    if (slot === -1 || state !== 'LOBBY') return false;
    slots[slot] = makePlayer(slot, 'phone', link);
    renderSlots();
    return { slot, name: slots[slot].name, color: slots[slot].color, state: 'lobby', role: slots[slot].role };
}

function removePlayer(i) {
    slots[i] = null;
    renderSlots();
    if (state !== 'LOBBY') backToLobby();
}

function handleLeave(link) {
    const i = slots.findIndex(s => s && s.link === link);
    if (i !== -1) removePlayer(i);
}

function handleMessage(link, msg) {
    const p = slots.find(s => s && s.link === link);
    if (!p) return;
    if (msg.t === 'a' && typeof msg.r === 'number') p.target = constrain(msg.r, -120, 40);
    else if (msg.t === 'swing') swing(p, constrain(+msg.s || 0.5, 0, 1));
    else if (msg.t === 'aim' && typeof msg.y === 'number') p.aimTarget = constrain(msg.y, -1, 1);
    else if (msg.t === 'fire') fire(p);
    else if (msg.t === 'duck') p.ducking = !!msg.on;
    else if (msg.t === 'start' && (state === 'LOBBY' || state === 'OVER')) startMatch();
}

function addKeyboardPlayer() {
    const slot = slots.findIndex(s => s === null);
    if (slot === -1 || state !== 'LOBBY') return;
    slots[slot] = makePlayer(slot, 'keyboard', null);
    renderSlots();
}

function onKey(e, down) {
    const wasDown = keys[e.code];
    keys[e.code] = down;
    players().forEach(p => {
        if (p.source !== 'keyboard') return;
        if (e.code === p.keys.duck) p.ducking = down;
        if (down && !wasDown && e.code === p.keys.action) {
            if (p.role === 'gun') fire(p); else swing(p, 0.8);
        }
    });
    if (down && !wasDown) {
        if (e.code === 'KeyM') Sound.toggleMute();
        if (e.code === 'Enter' && (state === 'LOBBY' || state === 'OVER')) {
            if (players().length < 2 && state === 'LOBBY') addKeyboardPlayer();
            else startMatch();
        }
    }
    if (e.code.startsWith('Arrow') || e.code === 'Space' || e.code === 'Slash') e.preventDefault();
}

function sendTo(p, msg) {
    if (p && p.link) host.send(p.link, msg);
}

// ---------------------------------------------------------------
// Match flow: rounds, role swaps, the end
// ---------------------------------------------------------------
function startMatch() {
    if (players().length < 2 || state === 'COUNTDOWN' || state === 'PLAYING' || state === 'SWAP') return;
    Sound.resume();
    players().forEach(p => {
        p.hp = MAX_HP;
        p.stats = { shots: 0, cuts: 0, sentBack: 0, hitsTaken: 0 };
        p.role = p.slot === 0 ? 'gun' : 'sword';
    });
    round = 1;
    $('lobby').classList.add('hidden');
    $('results').classList.add('hidden');
    $('hud').classList.remove('hidden');
    startRound();
}

function startRound() {
    bullets = [];
    halves = [];
    roundLeft = ROUND_SECONDS;
    players().forEach(p => {
        p.ammo = MAG_SIZE;
        p.reloadAt = 0;
        p.ducking = false;
        p.aim = p.aimTarget = 0;
        p.ignite = 0;
        sendTo(p, { t: 'role', role: p.role, round });
        sendTo(p, { t: 'ammo', n: p.ammo, reloading: false });
        sendTo(p, { t: 'hp', hp: p.hp });
    });
    hudCache = '';
    state = 'COUNTDOWN';
    host.broadcast({ t: 'state', state: 'countdown' });
    banner = { title: `Round ${round}`, text: `${gunner().name} has the gun · ${swordsman().name} has the sword`, until: simMs + 3200 };
    Sound.ignite();

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
            state = 'PLAYING';
            banner = null;
            host.broadcast({ t: 'state', state: 'playing' });
        }
    };
    setTimeout(tick, 1200);
}

function endRound() {
    state = 'SWAP';
    fizzleBullets();
    host.broadcast({ t: 'state', state: 'swap' });
    banner = { title: 'Time!', text: 'Swap: the sword takes the gun', until: simMs + 2600 };
    setTimeout(() => {
        if (state !== 'SWAP') return;
        players().forEach(p => { p.role = p.role === 'gun' ? 'sword' : 'gun'; });
        round++;
        startRound();
    }, 2600);
}

function endMatch(loser) {
    if (state === 'OVER') return;
    state = 'OVER';
    fizzleBullets();
    const winner = players().find(p => p !== loser);
    $('results-kicker').textContent = `Round ${round} · ${loser.name} is out`;
    $('results-title').textContent = `${winner.name} wins!`;
    $('results-title').style.color = winner.color;
    $('scoreboard').innerHTML = [winner, loser].map((p, i) => `<div class="score-row" style="--c:${p.color};animation-delay:${i * 0.08}s">
            <span class="score-rank">#${i + 1}</span>
            <span class="score-name">${p.name} <small>${p.stats.shots} shots · ${p.stats.cuts} cut · ${p.stats.sentBack} sent back</small></span>
            <span class="score-value">${Math.max(0, Math.round(p.hp))} hp</span>
        </div>`).join('');
    setTimeout(() => {
        $('hud').classList.add('hidden');
        $('results').classList.remove('hidden');
    }, 1600);
    players().forEach(p => sendTo(p, { t: 'result', won: p === winner }));
    host.broadcast({ t: 'state', state: 'over' });
}

function backToLobby() {
    state = 'LOBBY';
    bullets = [];
    banner = null;
    $('results').classList.add('hidden');
    $('hud').classList.add('hidden');
    $('countdown').classList.add('hidden');
    $('lobby').classList.remove('hidden');
    renderSlots();
    host.broadcast({ t: 'state', state: 'lobby' });
}

function fizzleBullets() {
    bullets.forEach(b => burst(b.x, b.y, '#ffe9a8', 8, 4));
    bullets = [];
}

// ---------------------------------------------------------------
// The gun
// ---------------------------------------------------------------
function shoulder(p) {
    return { x: GUN_X + 14, y: shoulderY(p.ducking) };
}

// Aim -1..1 picks a height on the sword player, from the head down to the hips
function aimPoint(aim) {
    return { x: SWORD_X, y: lerp(HANDS.y - GUARD_R * 0.96, HANDS.y - GUARD_R * 0.1, (aim + 1) / 2) };
}

function muzzle(p) {
    const s = shoulder(p), t = aimPoint(p.aim);
    const a = Math.atan2(t.y - s.y, t.x - s.x);
    return { x: s.x + Math.cos(a) * 92, y: s.y + Math.sin(a) * 92, a };
}

function fire(p) {
    if (state !== 'PLAYING' || p.role !== 'gun' || p.ducking) return;
    if (simMs - p.lastShot < FIRE_GAP_MS) return;
    if (p.ammo <= 0) { Sound.empty(); return; }
    p.lastShot = simMs;
    p.ammo--;
    p.recoil = 1;
    p.stats.shots++;
    const m = muzzle(p), t = aimPoint(p.aim);
    const c = guardCrossing(m, t);
    const T = dist(m.x, m.y, c.x, c.y) / BULLET_SPEED * 1000;
    bullets.push({ from: p, sx: m.x, sy: m.y, tx: t.x, ty: t.y, cx: c.x, cy: c.y, t0: simMs, arrives: simMs + T, x: m.x, y: m.y, mode: 'in', cut: false, life: 0 });
    burst(m.x, m.y, '#ffe9a8', 8, 5);
    Sound.shot();
    if (p.ammo === 0) p.reloadAt = simMs + RELOAD_MS;
    sendTo(p, { t: 'ammo', n: p.ammo, reloading: p.ammo === 0 });
}

// Where a shot from m toward t first crosses the circle the blade sweeps
function guardCrossing(m, t) {
    const dx = t.x - m.x, dy = t.y - m.y;
    const fx = m.x - HANDS.x, fy = m.y - HANDS.y;
    const a = dx * dx + dy * dy, b = 2 * (fx * dx + fy * dy), c = fx * fx + fy * fy - GUARD_R * GUARD_R;
    const disc = b * b - 4 * a * c;
    if (disc < 0) return { x: t.x, y: t.y };
    const k = (-b - Math.sqrt(disc)) / (2 * a);
    return { x: m.x + dx * k, y: m.y + dy * k };
}

// ---------------------------------------------------------------
// The sword
// ---------------------------------------------------------------
function swing(p, strength) {
    if (p.role !== 'sword') return;
    p.lastSwing = simMs;
    p.swingFx = Math.max(p.swingFx, 0.5 + strength * 0.5);
    Sound.whoosh(strength);
}

function bladeTip(angle, len = BLADE_LEN) {
    const a = radians(angle);
    return { x: HANDS.x + Math.sin(a) * len, y: HANDS.y - Math.cos(a) * len };
}

function bladeDistance(angle, pt) {
    const tip = bladeTip(angle);
    const dx = tip.x - HANDS.x, dy = tip.y - HANDS.y;
    const t = constrain(((pt.x - HANDS.x) * dx + (pt.y - HANDS.y) * dy) / (dx * dx + dy * dy), 0, 1);
    return dist(pt.x, pt.y, HANDS.x + t * dx, HANDS.y + t * dy);
}

// ---------------------------------------------------------------
// Bullets
// ---------------------------------------------------------------
function updateBullets() {
    const s = swordsman(), g = gunner();
    bullets.forEach(b => {
        if (b.mode === 'in') {
            const k = Math.min(1, (simMs - b.t0) / (b.arrives - b.t0));
            b.x = lerp(b.sx, b.cx, k);
            b.y = lerp(b.sy, b.cy, k);
            if (k >= 1) b.mode = 'contact';
        }
        if (b.mode === 'contact') {
            const c = { x: b.cx, y: b.cy };
            // Either the angle shown or the newest one from the phone can cut it
            if (bladeDistance(s.angle, c) < BLOCK_RADIUS || bladeDistance(s.target, c) < BLOCK_RADIUS) b.cut = true;
            if (b.cut && s.lastSwing >= b.arrives - SWING_EARLY_MS) sendBack(b, s, g);
            else if (simMs >= b.arrives + CONTACT_MS) {
                if (b.cut) cutBullet(b, s);
                else { b.mode = 'through'; b.life = 0; }
            }
        }
        if (b.mode === 'through') {
            // Past the blade: on to the body
            b.life += STEP;
            const k = Math.min(1, b.life / 0.06);
            b.x = lerp(b.cx, b.tx, k);
            b.y = lerp(b.cy, b.ty, k);
            if (k >= 1) {
                b.mode = 'dead';
                hurt(s, BULLET_DAMAGE, b.x, b.y);
            }
        }
        if (b.mode === 'back') {
            b.life += STEP;
            const k = b.life / RETURN_SECONDS;
            b.x = lerp(b.cx, b.rx, k);
            b.y = lerp(b.cy, b.ry, k);
            if (k >= 1 && !b.resolved) {
                b.resolved = true;
                // Ducking lets it fly over
                if (g.ducking) popup(GUN_X, 520, 'DODGED', g.color);
                else { b.mode = 'dead'; hurt(g, RETURN_DAMAGE, b.x, b.y); }
            }
            if (b.x < -60) b.mode = 'dead';
        }
    });
    bullets = bullets.filter(b => b.mode !== 'dead');
}

function cutBullet(b, s) {
    b.mode = 'dead';
    s.stats.cuts++;
    // Two halves spin away
    [-1, 1].forEach(side => halves.push({ x: b.cx, y: b.cy, vx: random(-200, 150), vy: side * random(250, 450) - 150, rot: random(TWO_PI), spin: side * random(10, 20), life: 0.8 }));
    burst(b.cx, b.cy, s.color, 14, 6);
    popup(b.cx, b.cy - 40, 'CUT', s.color);
    Sound.cut();
    sendTo(s, { t: 'fx', kind: 'cut' });
}

function sendBack(b, s, g) {
    b.mode = 'back';
    b.life = 0;
    const sh = { x: GUN_X + 4, y: shoulderY(false) + 20 }; // the gun player's chest when standing
    b.rx = sh.x; b.ry = sh.y;
    s.stats.sentBack++;
    burst(b.cx, b.cy, s.color, 24, 9);
    popup(b.cx, b.cy - 40, 'SENT BACK', s.color);
    Sound.sendBack();
    sendTo(s, { t: 'fx', kind: 'back' });
    sendTo(g, { t: 'fx', kind: 'incoming' });
}

function hurt(p, damage, x, y) {
    p.hp = Math.max(0, p.hp - damage);
    p.hurtFx = 1;
    p.stats.hitsTaken++;
    shake = 12;
    burst(x, y, '#ffe9a8', 18, 7);
    popup(x, y - 50, `-${damage}`, '#ff5b47');
    Sound.hurt();
    sendTo(p, { t: 'fx', kind: 'hurt' });
    sendTo(p, { t: 'hp', hp: p.hp });
    if (p.hp <= 0) endMatch(p);
}

function burst(x, y, color, n, speed) {
    for (let i = 0; i < n; i++) {
        const a = random(TWO_PI), s = random(0.3, 1) * speed * 60;
        sparks.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: random(0.25, 0.55), max: 0.55, color });
    }
}

function popup(x, y, text, color) {
    popups.push({ x, y, text, color, life: 0.9 });
}

// ---------------------------------------------------------------
// Simulation
// ---------------------------------------------------------------
function update() {
    simMs += STEP * 1000;
    const live = state === 'PLAYING';

    players().forEach(p => {
        if (p.source === 'keyboard') {
            if (p.role === 'sword') {
                const dir = (keys[p.keys.right] ? 1 : 0) - (keys[p.keys.left] ? 1 : 0);
                p.target = constrain(p.target + dir * KEY_TURN * STEP, -120, 40);
            } else {
                const dir = (keys[p.keys.down] ? 1 : 0) - (keys[p.keys.up] ? 1 : 0);
                p.aimTarget = constrain(p.aimTarget + dir * KEY_AIM * STEP, -1, 1);
            }
        }
        if (p.role === 'sword') {
            const before = p.angle;
            p.angle = lerp(p.angle, p.target, p.source === 'phone' ? 0.45 : 0.6);
            const moved = Math.abs(p.angle - before) / STEP;
            p.speed = lerp(p.speed, moved + p.swingFx * 700, 0.3);
            p.ignite = Math.min(1, p.ignite + STEP * 3);
            p.swingFx = Math.max(0, p.swingFx - STEP * 3);
            p.trail.push({ a: p.angle, life: 1 });
            p.trail.forEach(t => { t.life -= STEP * 9; });
            p.trail = p.trail.filter(t => t.life > 0);
            Sound.startHum();
            Sound.setHum(state === 'LOBBY' || state === 'OVER' ? 0 : p.ignite, p.speed);
        } else {
            p.aim = lerp(p.aim, p.aimTarget, AIM_EASE);
            p.recoil = Math.max(0, p.recoil - STEP * 6);
            if (p.ammo === 0 && p.reloadAt && simMs >= p.reloadAt) {
                p.ammo = MAG_SIZE;
                p.reloadAt = 0;
                Sound.reload();
                sendTo(p, { t: 'ammo', n: p.ammo, reloading: false });
            }
        }
        p.hurtFx = Math.max(0, p.hurtFx - STEP * 2);
    });

    if (live) {
        roundLeft -= STEP;
        updateBullets();
        if (roundLeft <= 0 && state === 'PLAYING') endRound();
    }

    halves.forEach(h => { h.x += h.vx * STEP; h.y += h.vy * STEP; h.vy += 1400 * STEP; h.rot += h.spin * STEP; h.life -= STEP; });
    halves = halves.filter(h => h.life > 0 && h.y < FLOOR);
    sparks.forEach(s => {
        s.x += s.vx * STEP;
        s.y += s.vy * STEP;
        s.vx *= 0.92;
        s.vy = s.vy * 0.92 + 6;
        s.life -= STEP;
    });
    sparks = sparks.filter(s => s.life > 0);
    popups.forEach(t => { t.y -= 40 * STEP; t.life -= STEP; });
    popups = popups.filter(t => t.life > 0);
    shake *= 0.85;
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

    background('#0b0d14');
    push();
    translate((width - W * Z) / 2, (height - H * Z) / 2);
    scale(Z);
    if (shake > 0.5) translate(random(-shake, shake), random(-shake, shake));

    drawStage();
    const g = gunner(), s = swordsman();
    if (g) drawGunner(g);
    if (s) drawSwordsman(s);
    if (g && s && state !== 'LOBBY') drawSight(g, s);
    bullets.forEach(drawBullet);
    drawHalves();
    if (s) drawBlade(s);
    drawSparks();
    drawPopups();
    if (banner && simMs < banner.until) drawBanner();
    pop();

    if (state !== 'LOBBY') updateHud();
}

function drawStage() {
    noStroke();
    // A dusty street at dusk: sky bands, far buildings, the floor
    for (let i = 0; i < 6; i++) {
        fill(18 + i * 6, 20 + i * 5, 34 + i * 4);
        rect(0, i * 110, W, 110);
    }
    fill('#151826');
    [[60, 380, 160], [250, 300, 120], [420, 420, 200], [700, 340, 150], [900, 400, 240], [1180, 320, 140], [1360, 390, 220]].forEach(([x, y, w]) => rect(x, y, w, FLOOR - y));
    fill(255, 197, 61, 26);
    [[90, 420], [130, 470], [460, 470], [520, 520], [930, 450], [1010, 500], [1400, 440], [1460, 520]].forEach(([x, y]) => rect(x, y, 22, 30, 2));
    fill('#1d1a17');
    rect(0, FLOOR, W, H - FLOOR);
    fill('#2a2622');
    rect(0, FLOOR, W, 8);
}

// A simple figure: legs, body, head. Crouching squashes it so a returned bullet flies over.
const STAND = { legs: 130, body: 170 };
const CROUCH = { legs: 60, body: 100 };

function figure(x, col, crouch) {
    const { legs, body } = crouch ? CROUCH : STAND;
    stroke(col);
    strokeWeight(20);
    strokeCap(ROUND);
    line(x - 20, FLOOR, x - 8, FLOOR - legs);
    line(x + 20, FLOOR, x + 8, FLOOR - legs);
    noStroke();
    fill(col);
    rect(x - 34, FLOOR - legs - body, 68, body, 18);
    circle(x, FLOOR - legs - body - 32, 64);
}

function shoulderY(crouch) {
    const { legs, body } = crouch ? CROUCH : STAND;
    return FLOOR - legs - body + 30;
}

function playerTint(p) {
    const base = color(p.color);
    return p.hurtFx > 0 ? lerpColor(base, color('#ffffff'), p.hurtFx * 0.8) : base;
}

function drawGunner(p) {
    const col = playerTint(p);
    figure(GUN_X, col, p.ducking);
    // Arm and gun, pointing at the aim
    const s = shoulder(p), m = muzzle(p);
    const kick = p.recoil * 10;
    push();
    translate(s.x, s.y);
    rotate(m.a);
    translate(-kick, 0);
    stroke(col);
    strokeWeight(14);
    line(0, 0, 50, 0);
    noStroke();
    fill('#2d2f38');
    rect(40, -12, 58, 18, 4);
    rect(46, 2, 14, 20, 3);
    pop();
    label(p, GUN_X, 'GUN');
}

function drawSwordsman(p) {
    const col = playerTint(p);
    figure(SWORD_X, col, false);
    // Arm down to the hands holding the hilt
    stroke(col);
    strokeWeight(16);
    line(SWORD_X - 14, shoulderY(false), HANDS.x, HANDS.y);
    label(p, SWORD_X, 'SWORD');
}

function label(p, x, role) {
    noStroke();
    textAlign(CENTER, TOP);
    textFont('JetBrains Mono');
    textSize(18);
    fill(p.color);
    text(`${p.name.toUpperCase()} · ${role}${p.source === 'keyboard' ? '  ' + PLAYER_STYLE[p.slot].label : ''}`, x, FLOOR + 22);
}

// The laser sight, and the spot on the blade's sweep where the shot will cross
function drawSight(g, s) {
    if (g.ducking) return;
    const m = muzzle(g), t = aimPoint(g.aim), c = guardCrossing(m, t);
    const col = color(g.color);
    stroke(red(col), green(col), blue(col), 90 + 40 * Math.sin(simMs / 60));
    strokeWeight(2);
    line(m.x, m.y, t.x, t.y);
    noStroke();
    fill(red(col), green(col), blue(col), 200);
    circle(t.x, t.y, 10);
    noFill();
    stroke(255, 255, 255, 110);
    strokeWeight(2);
    circle(c.x, c.y, 26);
    // Guard circle, faint, so the sword player sees where bullets meet the blade
    stroke(255, 255, 255, 18);
    strokeWeight(2);
    arc(HANDS.x, HANDS.y, GUARD_R * 2, GUARD_R * 2, PI, PI * 1.5);
}

function drawBullet(b) {
    const ang = b.mode === 'back' ? Math.atan2(b.ry - b.cy, b.rx - b.cx) : Math.atan2(b.ty - b.sy, b.tx - b.sx);
    push();
    translate(b.x, b.y);
    rotate(ang);
    noStroke();
    blendMode(ADD);
    fill(255, 210, 120, 50);
    ellipse(-30, 0, 70, 10);
    blendMode(BLEND);
    fill(b.mode === 'back' ? swordsman().color : '#ffe9a8');
    ellipse(0, 0, 18, 8);
    pop();
}

function drawHalves() {
    noStroke();
    halves.forEach(h => {
        push();
        translate(h.x, h.y);
        rotate(h.rot);
        fill(255, 233, 168, 255 * Math.min(1, h.life * 2));
        rect(-6, -3, 9, 6, 2);
        pop();
    });
}

function drawBlade(p) {
    const col = color(p.color);
    const r = red(col), g = green(col), bl = blue(col);
    const len = BLADE_LEN * p.ignite;

    // Swing smear: fading copies of where the blade just was
    blendMode(ADD);
    noStroke();
    for (let i = 1; i < p.trail.length; i++) {
        const t0 = p.trail[i - 1], t1 = p.trail[i];
        if (Math.abs(t1.a - t0.a) < 0.4) continue;
        const a0 = bladeTip(t0.a, len), a1 = bladeTip(t1.a, len);
        fill(r, g, bl, 50 * t1.life);
        triangle(HANDS.x, HANDS.y, a0.x, a0.y, a1.x, a1.y);
    }

    // The blade: a wide soft glow down to a white core
    const tip = bladeTip(p.angle, len);
    const bright = 1 + p.swingFx * 0.6;
    strokeCap(ROUND);
    [[40, 18], [26, 40], [15, 110], [8, 230]].forEach(([w, a]) => {
        stroke(r, g, bl, Math.min(255, a * bright));
        strokeWeight(w);
        line(HANDS.x, HANDS.y, tip.x, tip.y);
    });
    stroke(255, 255, 255, 240);
    strokeWeight(4);
    line(HANDS.x, HANDS.y, tip.x, tip.y);
    blendMode(BLEND);

    // Hilt, held in the hands
    push();
    translate(HANDS.x, HANDS.y);
    rotate(radians(p.angle));
    noStroke();
    fill('#8d919c');
    rect(-9, -4, 18, 60, 4);
    fill('#3a3d46');
    for (let y = 8; y < 52; y += 10) rect(-10, y, 20, 4, 2);
    fill(p.color);
    rect(-11, -8, 22, 8, 3);
    pop();
}

function drawSparks() {
    blendMode(ADD);
    sparks.forEach(s => {
        const c = color(s.color);
        stroke(red(c), green(c), blue(c), 255 * (s.life / s.max));
        strokeWeight(3);
        line(s.x, s.y, s.x - s.vx * 0.03, s.y - s.vy * 0.03);
    });
    blendMode(BLEND);
}

function drawPopups() {
    noStroke();
    textAlign(CENTER, CENTER);
    textFont('Bricolage Grotesque');
    textStyle(BOLD);
    popups.forEach(t => {
        const c = color(t.color);
        fill(red(c), green(c), blue(c), 255 * Math.min(1, t.life * 2));
        textSize(32);
        text(t.text, t.x, t.y);
    });
    textStyle(NORMAL);
}

function drawBanner() {
    noStroke();
    fill(12, 11, 10, 200);
    rect(W / 2 - 420, 120, 840, 130, 24);
    textAlign(CENTER, CENTER);
    textFont('Bricolage Grotesque');
    textStyle(BOLD);
    fill('#f3efe6');
    textSize(56);
    text(banner.title, W / 2, 168);
    textStyle(NORMAL);
    textFont('Inter');
    textSize(22);
    fill('#a39e94');
    text(banner.text, W / 2, 218);
}

// ---------------------------------------------------------------
// DOM: lobby slots and the HUD
// ---------------------------------------------------------------
function renderSlots() {
    $('slots').innerHTML = slots.map((p, i) => {
        const s = PLAYER_STYLE[i];
        const role = i === 0 ? 'Gun first' : 'Sword first';
        return p
            ? `<div class="slot filled" style="--c:${s.color}"><span class="slot-dot"></span><div>${s.name}<small>${role} · ${p.source === 'phone' ? 'Phone' : 'Keys ' + s.label}</small></div></div>`
            : `<div class="slot" style="--c:${s.color}"><span class="slot-dot" style="opacity:.35"></span><div>${s.name}<small>${role} · Waiting…</small></div></div>`;
    }).join('');
    $('start-btn').disabled = players().length < 2;
    $('start-btn').textContent = players().length < 2 ? 'Waiting for 2 players' : 'Start the duel';
    $('kb-btn').disabled = slots.every(Boolean);
}

function updateHud() {
    const g = gunner(), s = swordsman();
    if (!g || !s) return;
    const secs = Math.max(0, Math.ceil(roundLeft));
    const key = [g.name, Math.round(g.hp), s.name, Math.round(s.hp), secs, round, g.ammo].join();
    if (key === hudCache) return;
    hudCache = key;
    const pill = (p, role) => `<div class="hud-pill" style="--c:${p.color}"><i></i>${p.name} <span class="role">${role}</span>
        <span class="hp"><span style="width:${p.hp}%"></span></span><b>${Math.round(p.hp)}</b></div>`;
    $('hud-left').innerHTML = pill(g, 'gun') + `<div class="ammo">${'▮'.repeat(g.ammo)}<span>${'▮'.repeat(MAG_SIZE - g.ammo)}</span>${g.ammo === 0 ? ' reloading' : ''}</div>`;
    $('hud-right').innerHTML = pill(s, 'sword');
    $('hud-time').textContent = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
    $('hud-round').textContent = `Round ${round}`;
}
