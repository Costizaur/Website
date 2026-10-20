// Phone <-> screen link for the party games.
//
// Two transports run side by side:
//  - a WebSocket relay through public MQTT brokers, which works on any network
//    (school Wi-Fi, mobile data, guest networks), and
//  - a direct WebRTC channel through PeerJS, used when the network allows it
//    because it has lower latency.
// Controllers send over WebRTC when it is open, otherwise over the relay.
// Needs the `mqtt` and `Peer` globals (mqtt.js and PeerJS script tags).
(function () {
    const BROKERS = [
        'wss://broker.hivemq.com:8884/mqtt',
        'wss://test.mosquitto.org:8081',
        'wss://broker.emqx.io:8084/mqtt'
    ];
    const TOPIC_ROOT = 'costinsarghiuta/games/v1';
    const PEER_PREFIX = 'costinsarghiuta-v1-';
    const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no 0/O, 1/I/L
    const PLAYER_TIMEOUT_MS = 10000;
    const HOST_TIMEOUT_MS = 8000;

    const now = () => Date.now();
    const randomChars = (n) => Array.from({ length: n }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');
    const topicFor = (game, code) => `${TOPIC_ROOT}/${game}/${code}`;
    const peerIdFor = (game, code) => `${PEER_PREFIX}${game}-${code}`;

    const parse = (payload) => {
        try { return JSON.parse(typeof payload === 'string' ? payload : new TextDecoder().decode(payload)); }
        catch { return null; }
    };

    // A stable id per tab, so a refreshed controller gets its old slot back
    function tabClientId(game) {
        const key = `cs-link-${game}-id`;
        try {
            const saved = sessionStorage.getItem(key);
            if (saved) return saved;
            const id = 'c' + randomChars(8);
            sessionStorage.setItem(key, id);
            return id;
        } catch {
            return 'c' + randomChars(8);
        }
    }

    // ---------------------------------------------------------------
    // HOST (the big screen)
    // ---------------------------------------------------------------
    function createHost({ game, codePrefix = '', maxPlayers = 4, onJoin, onLeave, onMessage, onStatus }) {
        const code = codePrefix + randomChars(4 - codePrefix.length);
        const room = topicFor(game, code);
        const players = new Map();
        const brokers = [];
        let peer = null;
        let accepting = true;
        let destroyed = false;

        const status = () => {
            if (!onStatus) return;
            onStatus({
                relay: brokers.filter(c => c.connected).length,
                direct: !!(peer && peer.open && !peer.disconnected)
            });
        };

        const publishDown = (client, id, msg) => {
            if (client && client.connected) client.publish(`${room}/down/${id}`, JSON.stringify(msg));
        };

        const send = (p, msg) => {
            if (p.rtc && p.rtc.open) {
                try { p.rtc.send(msg); return; } catch { p.rtc = null; }
            }
            publishDown(p.mqtt, p.id, msg);
        };

        const reply = (via, id, msg) => {
            if (via.type === 'rtc') { try { via.conn.send(msg); } catch { /* channel closed */ } }
            else publishDown(via.client, id, msg);
        };

        const removePlayer = (p, reason) => {
            if (!players.has(p.id)) return;
            players.delete(p.id);
            if (onLeave) onLeave(p, reason);
        };

        const handle = (msg, via) => {
            if (destroyed || !msg || typeof msg !== 'object' || !msg.from || !msg.t) return;
            let p = players.get(msg.from);

            if (msg.t === 'hello') {
                if (!p) {
                    if (!accepting || players.size >= maxPlayers) {
                        reply(via, msg.from, { t: 'full' });
                        return;
                    }
                    p = { id: msg.from, info: msg.info || {}, last: now(), seq: -1, rtc: null, mqtt: null, welcome: {} };
                    players.set(p.id, p);
                    if (via.type === 'rtc') p.rtc = via.conn; else p.mqtt = via.client;
                    const welcome = onJoin ? onJoin(p) : {};
                    if (welcome === false) {
                        // The game has no room for them
                        players.delete(p.id);
                        reply(via, msg.from, { t: 'full' });
                        return;
                    }
                    p.welcome = welcome || {};
                }
                if (via.type === 'rtc') p.rtc = via.conn; else p.mqtt = via.client;
                p.last = now();
                p.seq = -1; // a refreshed controller restarts its counter
                send(p, { t: 'welcome', ...p.welcome });
                return;
            }

            if (!p) {
                // Host restarted or dropped them; ask the controller to say hello again
                reply(via, msg.from, { t: 'unknown' });
                return;
            }

            if (via.type === 'rtc') p.rtc = via.conn; else if (!p.mqtt || !p.mqtt.connected) p.mqtt = via.client;
            p.last = now();

            if (typeof msg.seq === 'number') {
                if (msg.seq <= p.seq) return; // duplicate after switching transport
                p.seq = msg.seq;
            }

            if (msg.t === 'ping') { send(p, { t: 'pong' }); return; }
            if (msg.t === 'bye') { removePlayer(p, 'left'); return; }
            if (onMessage) onMessage(p, msg);
        };

        // Relay: listen on every broker, so the controller can use whichever it reaches first
        if (typeof mqtt !== 'undefined') {
            BROKERS.forEach(url => {
                const client = mqtt.connect(url, { reconnectPeriod: 3000, connectTimeout: 8000, keepalive: 30, clean: true });
                client.on('connect', () => {
                    client.subscribe(`${room}/up`);
                    status();
                });
                client.on('close', status);
                client.on('error', () => { /* retried by mqtt.js */ });
                client.on('message', (topic, payload) => handle(parse(payload), { type: 'mqtt', client }));
                brokers.push(client);
            });
        }

        // Direct: a PeerJS id derived from the room code
        const startPeer = () => {
            if (typeof Peer === 'undefined' || destroyed) return;
            peer = new Peer(peerIdFor(game, code), { debug: 0 });
            peer.on('open', status);
            peer.on('connection', conn => {
                conn.on('data', data => handle(data, { type: 'rtc', conn }));
                conn.on('close', () => {
                    players.forEach(p => { if (p.rtc === conn) p.rtc = null; });
                });
            });
            peer.on('disconnected', () => {
                status();
                if (!destroyed && !peer.destroyed) setTimeout(() => { try { peer.reconnect(); } catch { /* retry below */ } }, 1500);
            });
            peer.on('error', err => {
                status();
                // The relay still works if the signalling server is down; retry the direct link later
                if (['network', 'server-error', 'socket-error', 'socket-closed', 'unavailable-id'].includes(err.type)) {
                    try { peer.destroy(); } catch { /* ignore */ }
                    setTimeout(startPeer, 5000);
                }
            });
        };
        startPeer();

        // Drop players who stop sending heartbeats
        const sweeper = setInterval(() => {
            const cutoff = now() - PLAYER_TIMEOUT_MS;
            players.forEach(p => { if (p.last < cutoff) removePlayer(p, 'timeout'); });
        }, 1000);

        return {
            code,
            joinUrl: (controllerPath) => new URL(`${controllerPath}?room=${code}`, window.location.href).href,
            players,
            send,
            broadcast: (msg) => players.forEach(p => send(p, msg)),
            kick: (p, msg) => { if (msg) send(p, msg); removePlayer(p, 'kicked'); },
            setAccepting: (value) => { accepting = value; },
            destroy: () => {
                destroyed = true;
                clearInterval(sweeper);
                brokers.forEach(c => c.end(true));
                if (peer) peer.destroy();
            }
        };
    }

    // ---------------------------------------------------------------
    // CONTROLLER (the phone)
    // ---------------------------------------------------------------
    function joinRoom({ game, code, info = {}, onStatus, onMessage }) {
        code = (code || '').toUpperCase().trim();
        const id = tabClientId(game);
        const room = topicFor(game, code);
        let broker = null;
        let rtc = null;
        let peer = null;
        let seq = 0;
        let state = 'connecting';
        let lastHostMessage = 0;
        let left = false;

        const setState = (s, detail) => {
            if (state === s && !detail) return;
            state = s;
            if (onStatus) onStatus(s, detail);
        };

        const raw = (msg) => {
            msg.from = id;
            if (rtc && rtc.open) {
                try { rtc.send(msg); return true; } catch { rtc = null; }
            }
            if (broker && broker.connected) {
                broker.publish(`${room}/up`, JSON.stringify(msg));
                return true;
            }
            return false;
        };

        const send = (msg) => raw({ ...msg, seq: ++seq });
        const hello = () => raw({ t: 'hello', info });

        const handle = (msg) => {
            if (!msg || !msg.t) return;
            lastHostMessage = now();
            if (msg.t === 'welcome') setState('joined', msg);
            else if (msg.t === 'unknown') hello();
            else if (msg.t === 'full') setState('full');
            if (msg.t !== 'pong' && onMessage) onMessage(msg);
        };

        // Relay: race all brokers and keep the first that connects
        if (typeof mqtt !== 'undefined') {
            const candidates = BROKERS.map(url => {
                const client = mqtt.connect(url, { reconnectPeriod: 2000, connectTimeout: 8000, keepalive: 30, clean: true });
                client.on('error', () => { /* retried by mqtt.js */ });
                client.once('connect', () => {
                    if (broker) return;
                    broker = client;
                    candidates.forEach(c => { if (c !== client) c.end(true); });
                    client.on('connect', () => { client.subscribe(`${room}/down/${id}`); hello(); });
                    client.subscribe(`${room}/down/${id}`, () => hello());
                    client.on('message', (topic, payload) => handle(parse(payload)));
                });
                return client;
            });
        }

        // Direct: connect to the host's PeerJS id (skip with ?relay=1 to test the relay alone)
        const relayOnly = new URLSearchParams(window.location.search).get('relay') === '1';
        const startPeer = () => {
            if (typeof Peer === 'undefined' || left || relayOnly) return;
            peer = new Peer({ debug: 0 });
            peer.on('open', () => {
                const conn = peer.connect(peerIdFor(game, code), { serialization: 'json', reliable: true });
                conn.on('open', () => { rtc = conn; hello(); });
                conn.on('data', handle);
                conn.on('close', () => { if (rtc === conn) rtc = null; });
            });
            peer.on('error', () => { /* relay keeps us connected */ });
        };
        startPeer();

        // Heartbeat, rejoin, and host-lost detection
        const beat = setInterval(() => {
            if (left) return;
            if (state === 'joined') send({ t: 'ping' });
            else if (state !== 'full') hello();

            if (state === 'joined' && now() - lastHostMessage > HOST_TIMEOUT_MS) setState('lost');
            if (state === 'lost' && now() - lastHostMessage < HOST_TIMEOUT_MS) setState('joined');
        }, 2000);

        // After 12 s with no answer at all, tell the player
        setTimeout(() => { if (state === 'connecting') setState('slow'); }, 12000);

        const leave = () => {
            if (left) return;
            raw({ t: 'bye', seq: ++seq });
            left = true;
            clearInterval(beat);
        };
        window.addEventListener('pagehide', leave);

        return {
            id,
            code,
            send,
            get state() { return state; },
            get direct() { return !!(rtc && rtc.open); },
            leave
        };
    }

    // Room codes carry the game in their first letter: D = Duck Shoot, R = River Racer, S = Sword vs Gun
    const GAME_BY_PREFIX = {
        D: { game: 'duck', controller: '/game/controller.html' },
        R: { game: 'river', controller: '/game2/controller.html' },
        S: { game: 'duel', controller: '/game3/controller.html' }
    };

    window.GameLink = { createHost, joinRoom, GAME_BY_PREFIX, CODE_CHARS };
})();
