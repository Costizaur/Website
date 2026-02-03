// ====== GAME CONSTANTS ======
const ACCELERATION_RATE = 0.05;
const MAX_SPEED_FORWARD = -14;
const STEER_SPEED = 8;
const STUN_DURATION = 60;
const STUN_KNOCKBACK = 8;
const PLAYER_COLLISION_RADIUS = 25;
const FINISH_LINE_Y = -20000; // Longer track
const TRACK_WIDTH = 700;

// ====== VARIABLES ======
let peer;
let playerSlots = [null, null];
let obstacles = [];
let ripples = [];
let gameState = "MENU";
let requiredPlayers = 2;
let cameraY = 0;

// Track local keyboard inputs
let keysPressed = {
    p1: { left: false, right: false },
    p2: { a: false, d: false }
};

// Textures
let waterImg;
let waterPattern;
let grassImg;
let grassPattern;

// ====== PRELOAD & SETUP ======
function preload() {
    waterImg = loadImage('water.png',
        () => console.log('Water texture loaded'),
        () => console.warn('Water texture failed - using fallback')
    );
    grassImg = loadImage('grass.png',
        () => console.log('Grass texture loaded'),
        () => console.warn('Grass texture failed - using fallback')
    );
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    rectMode(CENTER); textAlign(CENTER, CENTER);

    // Generate fallback textures if images fail
    if (!grassImg) {
        let g = createGraphics(250, 250);
        g.background(34, 139, 34);
        g.noStroke();
        g.fill(20, 100, 20);
        for (let i = 0; i < 50; i++) g.rect(random(250), random(250), 5, 5);
        grassImg = g.get();
        g.remove();
    }
    if (!waterImg) {
        let w = createGraphics(250, 250);
        w.background(0, 116, 217);
        waterImg = w.get();
        w.remove();
    }

    // Create smooth tiling for backgrounds
    grassImg.resize(250, 250);
    let g = createGraphics(750, 750);
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            g.image(grassImg, i * 250, j * 250);
        }
    }
    g.filter(BLUR, 3);
    grassImg = g.get(250, 250, 250, 250);
    g.remove();

    waterPattern = drawingContext.createPattern(waterImg.canvas, 'repeat');
    grassPattern = drawingContext.createPattern(grassImg.canvas, 'repeat');

    generateObstacles();
    setupNetworking();
}

function getTrackCenter(y) {
    let rawCurve = Math.sin(y * 0.001) * 180 + Math.cos(y * 0.002) * 80;

    let startZoneEnd = height - 3000;
    let finishZoneStart = FINISH_LINE_Y + 3000;

    let intensity = 1;

    if (y > startZoneEnd) {
        intensity = 0;
    } else if (y > startZoneEnd - 1000) {
        intensity = map(y, startZoneEnd, startZoneEnd - 1000, 0, 1);
    } else if (y < finishZoneStart) {
        intensity = 0;
    } else if (y < finishZoneStart + 1000) {
        intensity = map(y, finishZoneStart + 1000, finishZoneStart, 1, 0);
    }

    return width / 2 + (rawCurve * intensity);
}

function generateObstacles() {
    obstacles = [];
    let startSpawnY = height - 1500;

    for (let y = startSpawnY; y > FINISH_LINE_Y; y -= 250) {
        let count = random() > 0.5 ? 2 : 1;
        for (let i = 0; i < count; i++) {
            let attempts = 0;
            let placed = false;
            while (!placed && attempts < 50) {
                let trackCenterX = getTrackCenter(y);

                let potentialX = random(trackCenterX - TRACK_WIDTH / 2 + 50, trackCenterX + TRACK_WIDTH / 2 - 50);
                let potentialY = y + random(-100, 100);
                let potentialSize = random(60, 100);
                let valid = true;

                for (let other of obstacles) {
                    let d = dist(potentialX, potentialY, other.x, other.y);
                    let requiredDistance = (potentialSize / 2) + (other.size / 2) + 40;
                    if (d < requiredDistance) {
                        valid = false;
                        break;
                    }
                }

                if (valid) {
                    obstacles.push({
                        x: potentialX,
                        y: potentialY,
                        size: potentialSize,
                        shape: random() > 0.5 ? 'box' : 'triangle'
                    });
                    placed = true;
                }
                attempts++;
            }
        }
    }
}

// ====== PLAYER MANAGEMENT ======
function createPlayer(id, color, startX, conn) {
    return {
        conn: conn,
        id: id,
        color: color,
        x: startX,
        y: height - 150,
        speedY: 0,
        stunned: 0,
        inputs: { left: false, right: false },
        finished: false,
        offScreenTimer: 5.0
    };
}

function spawnLocalPlayer() {
    let slot = playerSlots.findIndex(s => s === null);
    if (slot === -1) return;
    let color = slot === 0 ? '#FF4136' : '#0074D9';

    // Spawn based on track center
    let cx = getTrackCenter(height - 150);
    let startX = requiredPlayers === 2 ? cx + (slot === 0 ? -120 : 120) : cx;

    playerSlots[slot] = createPlayer('local-' + slot, color, startX, { send: () => { } });
    checkLobby();
}

// ====== MENU LOGIC ======
function setMode(players) {
    requiredPlayers = players;
    gameState = "LOBBY";
    document.getElementById('menu-screen').style.display = 'none';
    document.getElementById('qrcode-container').style.display = 'block';
    updateLobbyText();
}

// ====== INPUT HANDLING ======
function keyPressed() {
    if (gameState === "LOBBY" && keyCode === ENTER) {
        spawnLocalPlayer();
        return;
    }
    if (keyCode === LEFT_ARROW) keysPressed.p1.left = true;
    if (keyCode === RIGHT_ARROW) keysPressed.p1.right = true;
    if (keyCode === 65) keysPressed.p2.a = true;
    if (keyCode === 68) keysPressed.p2.d = true;
    updateLocalInputs();
}

function keyReleased() {
    if (keyCode === LEFT_ARROW) keysPressed.p1.left = false;
    if (keyCode === RIGHT_ARROW) keysPressed.p1.right = false;
    if (keyCode === 65) keysPressed.p2.a = false;
    if (keyCode === 68) keysPressed.p2.d = false;
    updateLocalInputs();
}

function updateLocalInputs() {
    if (playerSlots[0] && playerSlots[0].id.startsWith('local')) {
        playerSlots[0].inputs.left = keysPressed.p1.left;
        playerSlots[0].inputs.right = keysPressed.p1.right;
    }
    if (playerSlots[1] && playerSlots[1].id.startsWith('local')) {
        playerSlots[1].inputs.left = keysPressed.p2.a;
        playerSlots[1].inputs.right = keysPressed.p2.d;
    }
}

// ====== NETWORKING ======
function setupNetworking() {
    peer = new Peer(null, {
        debug: 2,
        config: { 'iceServers': [{ url: 'stun:stun.l.google.com:19302' }] }
    });

    peer.on('open', (id) => {
        const STATIC_HOST = "https://costinsarghiuta.com/game2";
        let controllerURL = STATIC_HOST + '/controller.html?hostId=' + id;

        // Clear the loading text
        document.getElementById("qrcode").innerHTML = "";
        new QRCode(document.getElementById("qrcode"), { text: controllerURL, width: 200, height: 200 });
    });

    peer.on('connection', (conn) => {
        conn.on('data', (data) => {
            if (data.type === 'handshake') handlePlayerJoin(conn);
            if (data.type === 'input') {
                let p = playerSlots.find(pl => pl && pl.conn.peer === conn.peer);
                if (p) p.inputs = { left: data.left, right: data.right };
            }
        });
    });
}

function handlePlayerJoin(conn) {
    if (gameState !== "LOBBY") {
        conn.send({ type: 'error', message: 'Game already started' });
        setTimeout(() => conn.close(), 100);
        return;
    }

    if (playerSlots.some(p => p && p.id === conn.peer)) {
        console.warn('Player already connected');
        return;
    }

    let slot = playerSlots.findIndex(s => s === null);
    if (requiredPlayers === 1 && slot > 0) return;

    if (slot !== -1) {
        let color = slot === 0 ? '#FF4136' : '#0074D9';

        // Spawn based on track center
        let cx = getTrackCenter(height - 150);
        let startX = requiredPlayers === 2 ? cx + (slot === 0 ? -120 : 120) : cx;

        playerSlots[slot] = createPlayer(conn.peer, color, startX, conn);
        conn.send({ type: 'assignColor', color: color });
        checkLobby();
    }
}

function checkLobby() {
    updateLobbyText();
    let count = playerSlots.filter(p => p).length;
    if (count === requiredPlayers) {
        document.getElementById('lobby-status').innerText = "STARTING...";
        document.getElementById('kb-start-msg').style.display = 'none';
        setTimeout(startRace, 2000);
    }
}

function updateLobbyText() {
    let count = playerSlots.filter(p => p).length;
    document.getElementById('lobby-status').innerText = `Scan to Join (${count}/${requiredPlayers})`;
}

function startRace() {
    obstacles = [];
    generateObstacles();
    ripples = [];
    cameraY = 0;

    gameState = "RACING";
    document.getElementById('qrcode-container').style.display = 'none';
    document.getElementById('hud').style.display = 'block';
    playerSlots.forEach(p => { if (p) p.conn.send({ type: 'gameStart' }) });
}

// ====== GAME LOOP ======
function draw() {
    if (gameState === "MENU") {
        background(34, 139, 34);

        push();
        let scrollOffset = (millis() * 0.1) % 250;
        translate(0, scrollOffset);
        drawMenuBackground();
        pop();

        return;
    }

    background(34, 139, 34);

    let activePlayers = playerSlots.filter(p => p !== null);

    let leaderY = height;
    activePlayers.forEach(p => { leaderY = min(leaderY, p.y); });
    if (activePlayers.length === 0) leaderY = height - 100;

    let targetCamY = -leaderY + height * 0.7;
    cameraY = lerp(cameraY, targetCamY, 0.1);

    push();
    translate(0, cameraY);

    drawEnvironment();
    drawRipples();

    activePlayers.forEach((p, index) => {
        let screenY = p.y + cameraY;

        if (gameState === "RACING" && !p.finished) {
            // Off-screen elimination
            if (screenY > height) {
                p.offScreenTimer -= 1 / 60;
                if (p.offScreenTimer <= 0) {
                    p.finished = true;
                    let winnerIndex = -1;
                    if (requiredPlayers === 2) {
                        let otherPlayer = activePlayers.find(pl => pl !== p);
                        if (otherPlayer) winnerIndex = playerSlots.indexOf(otherPlayer);
                    }
                    handleWin(winnerIndex);
                }
            } else {
                p.offScreenTimer = 5.0;
            }

            // Physics
            if (p.stunned > 0) {
                p.stunned--;
                p.speedY = lerp(p.speedY, 3, 0.1);
                fill(255, 0, 0);
            } else {
                if (p.inputs.left && p.inputs.right) {
                    p.speedY = lerp(p.speedY, MAX_SPEED_FORWARD, ACCELERATION_RATE);
                    if (frameCount % 5 === 0) spawnRipple(p.x, p.y + 20);
                } else {
                    p.speedY = lerp(p.speedY, 2, 0.05);
                }

                if (p.inputs.left && !p.inputs.right) p.x -= STEER_SPEED;
                if (p.inputs.right && !p.inputs.left) p.x += STEER_SPEED;
                fill(p.color);
            }

            p.y += p.speedY;

            if (p.y > height - 100) { p.y = height - 100; p.speedY = 0; }

            // DYNAMIC LIMITS (Curved Track)
            let currentCenter = getTrackCenter(p.y);
            let leftLimit = currentCenter - TRACK_WIDTH / 2 + 30;
            let rightLimit = currentCenter + TRACK_WIDTH / 2 - 30;
            p.x = constrain(p.x, leftLimit, rightLimit);

            // Obstacle Collision
            obstacles.forEach(obs => {
                if (dist(p.x, p.y, obs.x, obs.y) < (obs.size / 2 + PLAYER_COLLISION_RADIUS)) {
                    if (p.stunned <= 0) {
                        p.stunned = STUN_DURATION;
                        p.speedY = STUN_KNOCKBACK;
                        p.conn.send({ type: 'collision' });

                        p.conn.send({ type: 'assignColor', color: '#fff' });
                        setTimeout(() => p.conn.send({ type: 'assignColor', color: p.color }), 200);
                    }
                }
            });

            if (p.y < FINISH_LINE_Y) { p.finished = true; handleWin(playerSlots.indexOf(p)); }
        }

        // Draw Player
        push();
        translate(p.x, p.y);
        let turn = 0;
        if (p.inputs.left && !p.inputs.right) turn = -0.2;
        if (p.inputs.right && !p.inputs.left) turn = 0.2;
        rotate(turn);
        stroke(255); strokeWeight(3);
        if (p.stunned > 0) stroke(255, 0, 0);
        triangle(0, -35, -20, 25, 20, 25);
        fill(255); noStroke(); textAlign(CENTER); textSize(14);
        let originalIndex = playerSlots.indexOf(p);
        text("P" + (originalIndex + 1), 0, 10);
        pop();
    });
    pop();

    activePlayers.forEach((p) => {
        if (gameState === "RACING" && p.offScreenTimer < 5.0 && p.offScreenTimer > 0) {
            drawOffScreenArrow(p.x, p.offScreenTimer, p.color);
        }
    });

    updateHUD();
}

// ====== DRAWING HELPERS ======
function drawOffScreenArrow(x, timer, color) {
    push();
    translate(x, height - 60);
    fill(color);
    stroke(255); strokeWeight(2);
    triangle(-20, 0, 20, 0, 0, 25);
    noStroke(); fill(255, 50, 50);
    textSize(40); textStyle(BOLD);
    text(Math.ceil(timer), 0, -20);
    pop();
}

function spawnRipple(x, y) {
    ripples.push({ x: x, y: y, size: 10, opacity: 255 });
}

function drawRipples() {
    noFill();
    strokeWeight(3);
    for (let i = ripples.length - 1; i >= 0; i--) {
        let r = ripples[i];
        r.size += 4;
        r.opacity -= 3;
        stroke(255, 255, 255, r.opacity);
        arc(r.x, r.y, r.size, r.size / 2, 0, PI);
        if (r.opacity <= 0) ripples.splice(i, 1);
    }
}

function drawMenuBackground() {
    push();
    rectMode(CORNER);

    drawingContext.fillStyle = grassPattern;
    rect(-50, -height, width + 100, height * 3);

    drawingContext.fillStyle = waterPattern;
    rect(width / 2 - TRACK_WIDTH / 2, -height, TRACK_WIDTH, height * 3);

    stroke(255, 255, 255, 50);
    strokeWeight(5);
    line(width / 2 - TRACK_WIDTH / 2, -height, width / 2 - TRACK_WIDTH / 2, height * 2);
    line(width / 2 + TRACK_WIDTH / 2, -height, width / 2 + TRACK_WIDTH / 2, height * 2);

    pop();
}

function drawEnvironment() {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        let obs = obstacles[i];
        if (obs.y + cameraY > height + 200) {
            obstacles.splice(i, 1);
        }
    }

    push();
    rectMode(CORNER);
    drawingContext.fillStyle = grassPattern;
    rect(-2000, -cameraY - 100, width + 4000, height + 200);
    pop();

    push();
    noStroke();
    drawingContext.fillStyle = waterPattern;

    beginShape();
    let step = 50;

    let startDrawY = -cameraY - 100;
    let endDrawY = -cameraY + height + 200;

    if (startDrawY < FINISH_LINE_Y - 500) startDrawY = FINISH_LINE_Y - 500;

    for (let y = startDrawY; y <= endDrawY; y += step) {
        let cx = getTrackCenter(y);
        vertex(cx - TRACK_WIDTH / 2, y);
    }
    vertex(getTrackCenter(endDrawY) - TRACK_WIDTH / 2, endDrawY);

    for (let y = endDrawY; y >= startDrawY; y -= step) {
        let cx = getTrackCenter(y);
        vertex(cx + TRACK_WIDTH / 2, y);
    }
    vertex(getTrackCenter(startDrawY) + TRACK_WIDTH / 2, startDrawY);

    endShape(CLOSE);
    pop();

    stroke(255, 255, 255, 50);
    strokeWeight(5);
    noFill();

    beginShape();
    for (let y = startDrawY; y <= endDrawY; y += step) {
        let cx = getTrackCenter(y);
        vertex(cx - TRACK_WIDTH / 2, y);
    }
    endShape();

    beginShape();
    for (let y = startDrawY; y <= endDrawY; y += step) {
        let cx = getTrackCenter(y);
        vertex(cx + TRACK_WIDTH / 2, y);
    }
    endShape();

    noStroke();
    let finishCx = getTrackCenter(FINISH_LINE_Y);
    for (let i = 0; i < 10; i++) {
        fill(i % 2 == 0 ? 0 : 255);
        let segmentWidth = TRACK_WIDTH / 10;
        rect(finishCx - TRACK_WIDTH / 2 + i * segmentWidth + (segmentWidth / 2), FINISH_LINE_Y, segmentWidth, 40);
    }

    obstacles.forEach(obs => {
        if (obs.y + cameraY < -200 || obs.y + cameraY > height + 200) return;

        fill(120);
        if (obs.shape === 'box') {
            rect(obs.x, obs.y, obs.size, obs.size, 5);
            fill(160); rect(obs.x - 5, obs.y - 5, obs.size - 10, obs.size - 10, 5);
        } else {
            push(); translate(obs.x, obs.y);
            triangle(0, -obs.size / 2, -obs.size / 2, obs.size / 2, obs.size / 2, obs.size / 2);
            fill(160); scale(0.7);
            triangle(0, -obs.size / 2, -obs.size / 2, obs.size / 2, obs.size / 2, obs.size / 2);
            pop();
        }
    });
}

function updateHUD() {
    if (gameState !== "RACING") return;
    if (playerSlots[0]) document.getElementById('p1-score').innerText = "P1: " + Math.abs(Math.round(playerSlots[0].y / 10)) + "m";
    if (playerSlots[1]) document.getElementById('p2-score').innerText = "P2: " + Math.abs(Math.round(playerSlots[1].y / 10)) + "m";
}

// ====== GAME OVER & RESTART ======
function handleWin(playerIndex) {
    if (gameState === "FINISHED") return;

    // Connection Cleanup
    playerSlots.forEach(p => {
        if (p && p.conn && p.conn.close && !p.id.startsWith('local')) {
            setTimeout(() => p.conn.close(), 1000);
        }
    });

    gameState = "FINISHED";
    let winnerName = "";
    let color = "#333";
    if (playerIndex === 0) { winnerName = "RED"; color = "#FF4136"; }
    else if (playerIndex === 1) { winnerName = "BLUE"; color = "#0074D9"; }
    else { winnerName = "NO ONE"; color = "#000"; }

    let winDiv = createDiv(winnerName + " WINS!");
    winDiv.class('win-screen');
    winDiv.style('position', 'absolute');
    winDiv.style('top', '50%'); winDiv.style('left', '50%');
    winDiv.style('transform', 'translate(-50%, -50%)');
    winDiv.style('color', color);
    winDiv.style('font-size', '60px');
    winDiv.style('font-family', 'sans-serif');
    winDiv.style('background', 'rgba(255,255,255,0.9)');
    winDiv.style('padding', '40px');
    winDiv.style('border', '5px solid ' + color);
    winDiv.style('border-radius', '20px');
    winDiv.style('box-shadow', '0 10px 30px rgba(0,0,0,0.5)');
    winDiv.style('text-align', 'center');

    let restartBtn = createButton('PLAY AGAIN');
    restartBtn.style('background', '#2ECC40');
    restartBtn.style('color', 'white');
    restartBtn.style('border', '2px solid white');
    restartBtn.style('padding', '15px 30px');
    restartBtn.style('font-size', '20px');
    restartBtn.style('cursor', 'pointer');
    restartBtn.style('margin-top', '20px');
    restartBtn.style('display', 'block');
    restartBtn.style('margin-left', 'auto');
    restartBtn.style('margin-right', 'auto');
    restartBtn.parent(winDiv);
    restartBtn.mousePressed(resetGame);
}

function resetGame() {
    playerSlots.forEach(p => {
        if (p && p.conn && p.conn.close && !p.id.startsWith('local')) {
            p.conn.close();
        }
    });

    playerSlots = [null, null];
    obstacles = [];
    ripples = [];
    gameState = "MENU";
    cameraY = 0;

    document.getElementById('menu-screen').style.display = 'flex';
    document.getElementById('hud').style.display = 'none';
    document.getElementById('qrcode-container').style.display = 'none';
    document.getElementById('kb-start-msg').style.display = 'block';
    document.getElementById('lobby-status').innerText = "Scan to Join";

    let screens = selectAll('.win-screen');
    screens.forEach(s => s.remove());

    generateObstacles();

    if (peer && peer.id) {
        const STATIC_HOST = "https://costinsarghiuta.com/game2";
        let controllerURL = STATIC_HOST + '/controller.html?hostId=' + peer.id;
        document.getElementById("qrcode").innerHTML = "";
        new QRCode(document.getElementById("qrcode"), {
            text: controllerURL,
            width: 200,
            height: 200
        });
    } else {
        document.getElementById("qrcode").innerHTML = "<span style='font-size: 14px; font-weight: bold;'>Generating QR...</span>";
    }
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); }