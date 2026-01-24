let peer, conn;
let inputs = { left: false, right: false };
let myColor = '#ccc';
let flashTimer = 0;

// Audio Context for iOS Rumble
let audioCtx;

// Throttling variables
let lastSendTime = 0;
const SEND_RATE = 16;

function setup() {
    let w = max(windowWidth, windowHeight);
    let h = min(windowWidth, windowHeight);
    createCanvas(w, h);
    textAlign(CENTER, CENTER);
    textSize(32);

    // Initialize Audio Context for the rumble
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
    } catch (e) {
        console.warn('Web Audio API not supported');
    }

    const urlParams = new URLSearchParams(window.location.search);
    const hostId = urlParams.get('hostId');

    if (!hostId) { updateStatus("Error: No Host ID found.<br>Scan QR code again."); return; }

    setupNetworking(hostId);
}

function triggerRumble() {
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(60, audioCtx.currentTime);

    gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
}

function setupNetworking(hostId) {
    peer = new Peer();

    peer.on('error', (err) => {
        updateStatus("Connection Error:<br>" + err.type, false);
    });

    peer.on('open', (id) => {
        conn = peer.connect(hostId);

        conn.on('open', () => {
            updateStatus("Connected!<br>Waiting for Player 2...");
            conn.send({ type: 'handshake' });
        });

        conn.on('close', () => {
            updateStatus("Disconnected.<br>Refresh to reconnect.");
        });

        conn.on('data', (data) => {
            if (data.type === 'assignColor') {
                myColor = data.color;
                updateStatus("READY!", true);
            }
            if (data.type === 'gameStart') {
                document.getElementById('status-overlay').style.display = 'none';
            }

            if (data.type === 'collision') {
                if (navigator.vibrate) {
                    navigator.vibrate(400);
                }

                triggerRumble();

                flashTimer = 10;
            }
        });
    });
}

function updateStatus(msg, hide = false) {
    let el = document.getElementById('status-overlay');
    let text = document.getElementById('status-text');
    if (el && text) {
        el.style.display = 'flex';
        text.innerHTML = msg;
        if (hide) setTimeout(() => { el.style.display = 'none'; }, 1500);
    }
}

function draw() {
    if (flashTimer > 0) {
        background(255);
        flashTimer--;
    } else {
        background(30);
    }

    // Input Handling
    if (touches.length === 0) {
        inputs.left = false;
        inputs.right = false;
    } else {
        inputs.left = false;
        inputs.right = false;
        for (let i = 0; i < touches.length; i++) {
            if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();

            if (touches[i].x < width / 2) {
                inputs.left = true;
            } else {
                inputs.right = true;
            }
        }
    }

    if (conn && conn.open && millis() - lastSendTime > SEND_RATE) {
        conn.send({ type: 'input', left: inputs.left, right: inputs.right });
        lastSendTime = millis();
    }

    // UI Drawing
    noStroke();
    if (inputs.left) fill(myColor); else fill(60);
    rect(0, 0, width / 2, height);

    if (inputs.right) fill(myColor); else fill(90);
    rect(width / 2, 0, width / 2, height);

    stroke(255); strokeWeight(4);
    line(width / 2, 0, width / 2, height);

    fill(255); noStroke(); textStyle(BOLD);
    text("LEFT", width / 4, height / 2);
    text("RIGHT", width * 3 / 4, height / 2);
}

function windowResized() {
    resizeCanvas(max(windowWidth, windowHeight), min(windowWidth, windowHeight));
}

function touchStarted() {
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return false;
}
function touchMoved() { return false; }
function touchEnded() { return false; }