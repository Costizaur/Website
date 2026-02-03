let peer, conn;
let inputs = { left: false, right: false };
let myColor = '#ccc';

// Throttling variables
let lastSendTime = 0;
const SEND_RATE = 16; // Limit to ~60fps updates

function setup() {
    // Create full screen canvas
    let w = max(windowWidth, windowHeight);
    let h = min(windowWidth, windowHeight);
    createCanvas(w, h);
    textAlign(CENTER, CENTER);
    textSize(32);

    // Get Host ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const hostId = urlParams.get('hostId');

    if (!hostId) { updateStatus("Error: No Host ID found.<br>Scan QR code again."); return; }

    setupNetworking(hostId);
}

function setupNetworking(hostId) {
    peer = new Peer();

    // Handle Peer errors
    peer.on('error', (err) => {
        console.error('Peer error:', err);
        updateStatus("Connection Error:<br>" + err.type, false);
    });

    peer.on('open', (id) => {
        conn = peer.connect(hostId);

        // Handle connection events
        conn.on('open', () => {
            updateStatus("Connected!<br>Waiting for Player 2...");
            conn.send({ type: 'handshake' });
        });

        conn.on('close', () => {
            console.log('Connection closed');
            updateStatus("Disconnected from game.<br>Refresh to reconnect.");
        });

        conn.on('error', (err) => {
            console.error('Connection error:', err);
            updateStatus("Connection lost", false);
        });

        // Listen for messages from host
        conn.on('data', (data) => {
            if (data.type === 'assignColor') {
                myColor = data.color;
                updateStatus("READY!", true);
            }
            if (data.type === 'gameStart') {
                document.getElementById('status-overlay').style.display = 'none';
            }
            // Haptic Feedback
            if (data.type === 'collision') {
                if (navigator.vibrate) {
                    navigator.vibrate(200);
                }
            }
        });
    });
}

// --- UI HELPER ---
function updateStatus(msg, hide = false) {
    let el = document.getElementById('status-overlay');
    let text = document.getElementById('status-text');
    el.style.display = 'flex';
    text.innerHTML = msg;

    if (hide) {
        setTimeout(() => {
            el.style.display = 'none';
        }, 1500);
    }
}

// --- DRAW LOOP ---
function draw() {
    background(30);

    // Handle touch inputs explicitly
    if (touches.length === 0) {
        inputs.left = false;
        inputs.right = false;
    } else {
        inputs.left = false;
        inputs.right = false;
        for (let i = 0; i < touches.length; i++) {
            if (touches[i].x < width / 2) {
                inputs.left = true;
            } else {
                inputs.right = true;
            }
        }
    }

    // Network Throttling
    if (conn && conn.open && millis() - lastSendTime > SEND_RATE) {
        conn.send({ type: 'input', left: inputs.left, right: inputs.right });
        lastSendTime = millis();
    }

    // Draw Controls UI
    noStroke();

    // Left Button Visuals
    if (inputs.left) fill(myColor); else fill(60);
    rect(0, 0, width / 2, height);

    // Right Button Visuals
    if (inputs.right) fill(myColor); else fill(90);
    rect(width / 2, 0, width / 2, height);

    // Divider Line
    stroke(255); strokeWeight(4);
    line(width / 2, 0, width / 2, height);

    // Labels
    fill(255); noStroke(); textStyle(BOLD);
    text("LEFT", width / 4, height / 2);
    text("RIGHT", width * 3 / 4, height / 2);
}

// Handle resizing
function windowResized() {
    let w = max(windowWidth, windowHeight);
    let h = min(windowWidth, windowHeight);
    resizeCanvas(w, h);
}

// Prevent default browser touch actions to stop scrolling/zooming
function touchStarted() { return false; }
function touchMoved() { return false; }
function touchEnded() { return false; }
