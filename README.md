# Echoes of Oblivion — Project Documentation

> A multiplayer 3D browser game built with Three.js, Node.js, Socket.IO, Express, MongoDB, and JWT-based authentication.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Database — MongoDB & Mongoose](#4-database--mongodb--mongoose)
5. [Server — app.js](#5-server--appjs)
6. [Routing](#6-routing)
7. [Authentication System](#7-authentication-system)
8. [User Controller](#8-user-controller)
9. [Game Frontend — Three.js Scene](#9-game-frontend--threejs-scene)
10. [Real-Time Communication — Socket.IO](#10-real-time-communication--socketio)
11. [Player & World System](#11-player--world-system)
12. [Ghost System](#12-ghost-system)
13. [Session & Cookie Flow](#13-session--cookie-flow)
14. [File Upload — Multer](#14-file-upload--multer)
15. [Email — Nodemailer + SendGrid](#15-email--nodemailer--sendgrid)
16. [Full Request Flow Diagrams](#16-full-request-flow-diagrams)
17. [Environment Variables](#17-environment-variables)
18. [mainScene.ejs — Game View Template](#18-mainsceneejs--game-view-template)

---

## 1. Project Overview

**Echoes of Oblivion** is a web-based multiplayer 3D arena game. Players authenticate via a signup/signin flow, then enter a Three.js-rendered arena where up to 6 named players move around a glowing cyberpunk-styled grid. Player positions and health are synchronized in real time over Socket.IO. Ghost entities trail each player showing recent movement history.

---

## 2. Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend 3D | Three.js (r128) | Scene, camera, mesh rendering |
| Frontend Labels | Three.js CSS2DRenderer | Player name/health overlays |
| Backend Runtime | Node.js + Express | HTTP server, routing, middleware |
| Real-Time | Socket.IO | Bidirectional player sync, chat |
| Database | MongoDB + Mongoose | User model persistence |
| Auth — Sessions | express-session + connect-flash | Server-side login state |
| Auth — Tokens | jsonwebtoken (JWT) | Stateless token issued on login |
| Password Hashing | bcryptjs | Secure password storage |
| File Uploads | Multer | Profile image handling |
| Email | Nodemailer + SendGrid | Signup confirmation emails |
| Templating | EJS | Server-rendered views |
| Security | cookie-parser, cors, httpOnly cookies | XSS/CSRF mitigations |

---

## 3. Project Structure

```
project-root/
├── app.js                    ← Entry point: Express + Socket.IO server
├── .env                      ← Environment secrets (never commit)
├── package.json
│
├── controllers/
│   ├── auth.js               ← Signup, signin, logout, JWT, session middleware
│   └── user.js               ← User dashboard, profile page
│
├── routes/
│   ├── auth.js               ← /signup /signin /mainScene /editProfile /error
│   └── user.js               ← /user /profile
│
├── model/
│   └── user.js               ← Mongoose schema & model
│
├── util/
│   └── database.js           ← MongoDB connection via Mongoose
│
├── views/                    ← EJS templates
│   ├── Eco.ejs               ← Landing page
│   ├── signin.ejs
│   ├── signup.ejs
│   ├── user.ejs              ← Post-login dashboard
│   ├── profile.ejs
│   ├── mainScene.ejs         ← Three.js game canvas
│   ├── editProfile.ejs
│   ├── Sea.ejs
│   ├── dil.ejs               ← Heartbeat view
│   └── error.ejs
│
├── public/                   ← Static assets (JS, CSS, client scripts)
└── images/                   ← Multer upload destination (profile photos)
```

---

## 4. Database — MongoDB & Mongoose

### Connection (`util/database.js`)

```javascript
mongoose.connect(process.env.MONGO_DB_URI, mongoOptions)
```

The connection uses a robust options object:

| Option | Value | Purpose |
|---|---|---|
| `serverSelectionTimeoutMS` | 30000 | How long to wait finding a usable server |
| `connectTimeoutMS` | 30000 | Initial TCP connection timeout |
| `socketTimeoutMS` | 45000 | Inactivity timeout on open socket |
| `maxPoolSize` | 10 | Max simultaneous connections |
| `minPoolSize` | 2 | Keep 2 connections warm at all times |
| `retryWrites` | true | Auto-retry failed writes (replica sets) |

The module exports the **Promise** returned by `mongoose.connect()`. `app.js` chains `.then()` on it so the HTTP server only starts after the database is confirmed connected.

```javascript
// app.js
ConnectDB.then(() => {
    server.listen(PORT, ...)
}).catch(error => console.log(error));
```

A `disconnected` event listener logs any mid-session dropout.

### User Schema (`model/user.js`)

```javascript
const userSchema = new Schema({
    name:     String,           // Display name / username
    email:    String,           // Login identifier
    password: String,           // bcrypt hash — never plaintext
    imageUrl: { type: String, required: true },  // Profile photo path
    position: [Number],         // Reserved for future game-world position sync
    color:    String            // Reserved for future player color preference
}, { timestamps: true });       // Adds createdAt + updatedAt automatically
```

**Field notes:**

- `imageUrl` is the only required field — signup is blocked if no image is uploaded.
- `position` and `color` are scaffolded but not yet written to during normal auth flows; intended for future DB-backed player state persistence.
- `timestamps: true` adds `createdAt` and `updatedAt` Mongoose manages automatically.
- The model is registered as `'user'` → MongoDB collection is `users` (Mongoose pluralises by default).

---

## 5. Server — `app.js`

### Startup sequence

```
dotenv.config()           → loads .env variables
express()                 → creates the app
http.createServer(app)    → wraps app for Socket.IO to share the same port
socketIo(server, {...})   → attaches Socket.IO to that HTTP server
ConnectDB.then(...)       → waits for MongoDB connection before listening
server.listen(PORT)       → starts accepting requests
```

### Middleware pipeline (order matters)

```
cors()                    → allow cross-origin requests (development)
bodyParser.urlencoded()   → parse HTML form POST bodies
cookieParser()            → parse incoming cookies (needed for JWT reads)
multer(...)               → handle multipart/form-data (image uploads)
express.json()            → parse JSON bodies
express-session(...)      → attach req.session to every request
connect-flash()           → req.flash() for one-time error messages
express.static(...)       → serve /public directory statically
/images static            → serve uploaded profile images
```

### Routes

| Method | Path | Handler | Auth Required |
|---|---|---|---|
| GET | `/` | Render landing page (Eco.ejs) | No |
| GET | `/EchoesOfOblivion` | Same landing page | No |
| GET | `/sea` | Sea scene | No |
| GET | `/heartBeat` | Heartbeat debug view | No |
| — | `/` | `authRoutes` | Mixed |
| — | `/` | `userRoutes` | Mixed |

---

## 6. Routing

All routes are defined in two router files and mounted in `app.js` via `app.use(authRoutes)` and `app.use(userRoutes)`.

### Auth Routes (`routes/auth.js`)

| Method | Path | Middleware Chain | Handler | Notes |
|---|---|---|---|---|
| GET | `/signup` | — | `getSignup` | Render signup form |
| POST | `/signup` | — | `postSignup` | Create account |
| GET | `/signin` | — | `getSignin` | Render signin form |
| POST | `/signin` | — | `postSignin` | Login, issue JWT |
| GET | `/mainScene` | `verifyJwt` → `isAuthenticated` | `getMainScene` | **Protected** — game canvas |
| POST | `/mainScene` | — | `postLogout` | Logout action from game screen |
| GET | `/error` | — | `geterror` | Error page |
| GET | `/editProfile` | `verifyJwt` → `isAuthenticated` | `geteditProfile` | **Protected** |
| POST | `/editProfile` | `verifyJwt` → `isAuthenticated` | `posteditProfile` | **Protected** |

### User Routes (`routes/user.js`)

| Method | Path | Middleware Chain | Handler | Notes |
|---|---|---|---|---|
| GET | `/user` | `verifyJwt` | `getuserpage` | Dashboard after login |
| POST | `/user` | — | `postuserpage` | Action dispatcher (profile / game / default) |
| GET | `/profile` | `verifyJwt` | `getProfile` | Read-only profile view |

**Middleware chain logic for protected routes:**

```
Request → verifyJwt → (401/403 if bad token) → isAuthenticated → (redirect /signin if no session) → controller
```

`verifyJwt` and `isAuthenticated` are applied individually per route rather than globally, so public routes (signup, signin, landing) remain accessible without credentials.

---

## 7. Authentication System

### Signup flow (`POST /signup`)

```
1. Multer extracts uploaded image → saved to /images/<timestamp>-<filename>
2. Validate image exists (422 redirect to /error if missing)
3. Check for duplicate username  → redirect /signup if taken
4. Check for duplicate email     → redirect /signin if taken
5. bcrypt.hash(password, 12)     → store hashed password only
6. userdata.create({...})        → save new user to MongoDB
7. Nodemailer sends welcome email via SendGrid SMTP
8. Redirect to /signin
```

### Signin flow (`POST /signin`)

```
1. Find user by email in MongoDB
2. bcrypt.compare(password, user.password)
3. On match:
   a. Set req.session.isLoggedIn = true
   b. Store user info in session (username, email, photo, etc.)
   c. Build JWT payload { id, user, role: "player" }
   d. jwt.sign(payload, JWT_SECRET, { expiresIn })
   e. Set cookie: jwt=<token> (httpOnly, SameSite=strict, 1hr)
   f. Redirect to /user
4. On failure: req.flash('error', ...) → redirect /signin
```

### JWT verification middleware (`verifyJwt`)

```
1. Read req.cookies.jwt
2. If missing → 401 JSON response
3. jwt.verify(token, JWT_SECRET)
4. On success: attach decoded.user to req.session.username → next()
5. On failure: 403 JSON response
```

### Session authentication middleware (`isAuthenticated`)

```
1. Check req.session.isLoggedIn
2. Truthy → next()
3. Falsy  → redirect /signin
```

> **Two-layer auth:** The app uses both session-based and JWT-based auth. Sessions handle server-side rendering (EJS views), while JWT is issued for potential API consumers or future stateless flows.

### Logout (`POST /logout`)

```
1. req.session.destroy()  → invalidates session on server
2. res.clearCookie('jwt') → removes JWT cookie from browser
3. Redirect to /
```

### Edit Profile (`POST /editProfile`)

```
1. Get name and image from request
2. userdata.findByIdAndUpdate(session.user._id, { name, email, password, imageUrl })
3. Redirect to /signin (forces re-login with new data)
```

---

## 8. User Controller (`controllers/user.js`)

### `getuserpage` — GET /user

```
1. Reads req.session.email and req.session.username for debug logging
2. Calls userdata.findById(req.session.user._id)  ← note: result is not awaited
   (currently logs the Promise object; should be awaited in future)
3. Renders user.ejs with pageTitle = username
```

### `postuserpage` — POST /user

Acts as an **action dispatcher** — the form sends an `action` field to decide where to redirect:

```
action === "profile"  → redirect /profile?tag=<username>
action === "game"     → redirect /mainScene?tag=<sessionId>
else                  → redirect /user?tag=<username>
```

The `tag` query param passes context to the destination page (username shown in profile, session ID for game tracking).

### `getProfile` — GET /profile

Reads all display data from the session (no extra DB query) and renders `profile.ejs`:

```javascript
{
    personname:  req.session.username,
    personemail: req.session.email,
    personimage: req.session.photo    // path like '/images/1234-photo.jpg'
}
```

> **Note:** Profile data comes entirely from the session, which is populated at signin time. If the user edits their profile, they are redirected to `/signin` to re-establish the session with fresh data.

---

## 9. Game Frontend — Three.js Scene

### Scene setup

```
THREE.Scene                → main scene graph
THREE.FogExp2              → exponential fog for depth atmosphere
THREE.PerspectiveCamera    → 75° FOV, follows activePlayer
THREE.WebGLRenderer        → renders to #gameCanvas
THREE.CSS2DRenderer        → overlays HTML labels (names + health) in 3D space
```

### Lighting rig

| Light | Color | Role |
|---|---|---|
| AmbientLight | white 0.25 | Flat fill light |
| HemisphereLight | sky #9d00ff / gnd #00f0ff | Atmospheric color gradient |
| PointLight (hot) | #ff2d78 (pink) | Dramatic shadow fill, positioned at (-40,30,-40) |
| PointLight (cyan) | #00f0ff | Rim light at (90,25,90) |
| PointLight (gold) | #ffe600 | Top-down key light at (0,50,0) |

### Arena geometry

```
PlaneGeometry(200,200)     → floor mesh, dark metallic material with emissive glow
GridHelper(200,50)         → cyan/purple grid lines at y=0.01
TorusGeometry(101,...)     → glowing arena ring border, pulsing in animate()
CircleGeometry(2,32)       → center spawn disc, pink emissive
```

### Animate loop

```
requestAnimationFrame(animate)
  → pulse arenaRing.emissiveIntensity  (sin wave)
  → pulse disc.emissiveIntensity       (sin wave, different frequency)
  → highlight activePlayer mesh        (emissiveIntensity 0.85 vs 0.35)
  → lerp camera to offset above activePlayer (smooth follow)
  → renderer.render + labelRenderer.render
```

---

## 10. Real-Time Communication — Socket.IO

### How Socket.IO is initialised

Socket.IO is attached to the **same HTTP server** as Express, so both share one port:

```javascript
const http   = require('http');
const server = http.createServer(app);       // Express app wrapped in HTTP server
const io     = socketIo(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});
server.listen(PORT);                         // one port for HTTP + WebSocket
```

On the client (inside `mainScene.ejs`), the browser connects automatically:

```javascript
const socket = io();   // connects back to same origin over WebSocket
```

The handshake upgrades from HTTP long-polling → WebSocket once the connection is stable.

---

### Server-side event registry (`app.js`)

```
Client connects
    │
    └─ io.on('connection', socket => ...)
          │
          ├─ socket.on('chat message', msg)
          │     └─ io.emit('chat message', msg)
          │        → broadcast msg to ALL connected clients (including sender)
          │
          ├─ socket.on('message', data)
          │     └─ socket.emit('response', 'Message received')
          │        → echo back only to the sender (socket.emit, not io.emit)
          │
          └─ socket.on('disconnect')
                └─ log 'User disconnected'
```

### Client-side event registry (frontend game script)

```
socket.on('connect')
    └─ logs socket.id + all 6 players' initial positions and health values

socket.on('disconnect')
    └─ logs 'Disconnected from the socket/server'
```

---

### `playerpositions` — the game state event

This is the core real-time event that drives multiplayer state. It is emitted from the **client** inside `World.tick()` every `pulse` ms (default 100ms):

```javascript
socket.emit('playerpositions', {
    player1: player1.movementdynamics,   // last 3 [x,y,z] positions (array of arrays)
    h1:      player1.health[0],          // current health (0–50)
    player2: player2.movementdynamics,
    h2:      player2.health[0],
    player3: player3.movementdynamics,
    h3:      player3.health[0],
    player4: player4.movementdynamics,
    h4:      player4.health[0],
    player5: player5.movementdynamics,
    h5:      player5.health[0],
    player6: player6.movementdynamics,
    h6:      player6.health[0],
})
```

**`movementdynamics` structure:**

```javascript
// Rolling window — last 3 ticks only (older entries shifted out)
movementdynamics = [
    [x_t-2, y_t-2, z_t-2],   // two ticks ago
    [x_t-1, y_t-1, z_t-1],   // last tick
    [x_t,   y_t,   z_t  ],   // current position
]
```

This is both used for the Ghost `follow()` and emitted to the server on every tick.

---

### Full WebSocket message timeline

```
Browser                                    Server
  │                                           │
  │── HTTP GET /mainScene ──────────────────> │ (Express serves mainScene.ejs)
  │<── 200 HTML ──────────────────────────── │
  │                                           │
  │  [browser executes socket = io()]         │
  │── WS Upgrade handshake ────────────────> │
  │<── 101 Switching Protocols ────────────  │
  │                                           │
  │<────────────────────────── 'connect' ──  │ socket.id assigned
  │  logs socket.id + all player states       │
  │                                           │
  │  [every 100ms — World.tick()]             │
  │── 'playerpositions' ───────────────────> │ server receives state
  │   { player1:[...], h1:50, ... }           │ (currently logged, not re-broadcast)
  │                                           │
  │── 'chat message' ──────────────────────> │
  │<────────────────── 'chat message' ──────  │ io.emit → all clients get it
  │                                           │
  │── 'message' ───────────────────────────> │
  │<──────────────────── 'response' ────────  │ socket.emit → sender only
  │                                           │
  │  [tab closed / network drop]              │
  │── disconnect ──────────────────────────> │ logs 'User disconnected'
  │  Ghost.follow() stops being called        │
```

---

### Architecture note — client-authoritative model

All game physics (movement, collision, gravity, health) are computed **in the browser**. The server only receives the results. This means:

- No server-side game loop — the browser is the source of truth.
- `playerpositions` is currently received by the server but not re-broadcast to other clients — each browser runs its own independent simulation.
- To make this truly multiplayer (other clients seeing each other move), the server would need to re-emit received positions to all other sockets: `socket.broadcast.emit('playerpositions', data)`.

---

## 11. Player & World System

### Class hierarchy

```
Player (base)
  └── Playeractions (extends Player)
        → owns: Three.js mesh, CSS2D labels, health[], movementdynamics[]
        → controls: moveUp/Down/Left/Right/Forward/Backward/rotate flags
        → velocity(): applies downward gravity when y > 0
```

### Player construction

Each `Playeractions` instance:
- Creates a `BoxGeometry(1,2,3)` mesh with emissive material
- Creates two `CSS2DObject` labels: name (y+2) and health (y+4)
- Starts health at 50, position at given (X, Y, Z)

### Six players

| Name | Era | Role | Color |
|---|---|---|---|
| Xing | Past | Monk | #C94F74 (rose) |
| Zeus | Medieval | Warrior | #00ff00 (green) |
| Alex | Future | Engineer | #9367AB (purple) |
| Xong | Past | Monk | #9DAB67 (olive) |
| Zous | Medieval | Warrior | #000000 (black) |
| Alegx | Future | Engineer | #0000ff (blue) |

### World.tick() — runs every `pulse` ms (default 100ms)

For each player with a movement flag set:

```
1. Calculate nextpos
2. Check collision with ALL other players via willCollide()
3. Check arena boundary (±100 units)
4. If collision or out-of-bounds:
     health[0]--
     if health == 0: respawn at (0,0,0), reset health to 50
     canMove = false
5. If canMove: update x/y/Z
6. Call velocity() → gravity pulls player down if y > 0
7. Sync p.player.position to p.x, p.y, p.Z
8. Track last 3 positions in movementdynamics[]
9. Emit all positions via socket
```

### Collision detection (`willCollide`)

```javascript
Math.abs(pos[0] - other.x) < 1  &&
Math.abs(pos[1] - other.y) < 2  &&
Math.abs(pos[2] - other.Z) < 3
// Matches the BoxGeometry half-extents (1×2×3)
```

### Keyboard controls

| Key | Action |
|---|---|
| `1`–`6` | Switch active player |
| `u` | Move up |
| `d` | Move down |
| `r` | Move right |
| `l` | Move left |
| `f` | Move forward (−Z) |
| `b` | Move backward (+Z) |
| `s` | Rotate (30° around Y axis) |

`keydown` sets flag to `true`; `keyup` sets flag to `false`. `World.tick()` reads the flags each frame.

---

## 12. Ghost System

Each player has a paired `Ghost` object — a semi-transparent, `depthWrite: false` copy of the player mesh that trails behind using the shared `movementdynamics` array.

```
Ghost.follow():
  → reads latest position from movementdynamics[]
  → adds a (1,0,0) offset so ghost sits slightly beside player
  → spirit.position.lerp(target, 0.5)  → smooth interpolation
  → only called when socket.connected
```

Ghost opacity is 0.28, giving a motion-trail / echo effect that visually reflects the player's recent path.

---

## 13. Session & Cookie Flow

```
Browser                    Server
  │                           │
  │── POST /signin ──────────>│
  │                    session created (express-session)
  │                    JWT signed
  │<── Set-Cookie: jwt=... ───│  (httpOnly, SameSite=strict)
  │                           │
  │── GET /user ─────────────>│
  │   Cookie: jwt=...         │  isAuthenticated checks session
  │                           │  verifyJwt checks JWT
  │<── 200 mainScene ─────────│
  │                           │
  │── POST /logout ──────────>│
  │                    session.destroy()
  │<── Clear-Cookie: jwt ─────│
  │<── 302 → / ───────────────│
```

---

## 14. File Upload — Multer

```javascript
multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'images'),
    filename:    (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
})
fileFilter: allow only image/png, image/jpg, image/jpeg
.single('image')  → expects a single file input named "image"
```

Uploaded files are stored in the `/images` directory and served statically at `/images/<filename>`. The path is saved to MongoDB as `imageUrl: '/images/<filename>'`.

---

## 15. Email — Nodemailer + SendGrid

```javascript
nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    auth: { user: 'apikey', pass: process.env.SGKEY }
})

transporter.sendMail({
    to: email,
    from: 'darkcodexismyst@gmail.com',
    subject: 'Signup Succeded!',
    html: '<h1>Welcome to pixelfantasy!</h1>'
})
```

This triggers on every successful new user creation during signup. The SendGrid API key is stored in `.env` as `SGKEY`.

---

## 16. Full Request Flow Diagrams

### Complete auth + navigation flow

```
Browser                                    Server
  │                                           │
  │── GET /                 ─────────────────>│ render Eco.ejs (landing)
  │                                           │
  │── GET /signup           ─────────────────>│ render signup.ejs
  │── POST /signup          ─────────────────>│ validate image → hash password
  │                                           │ → save to MongoDB
  │                                           │ → send SendGrid email
  │<── 302 /signin ─────────────────────────  │
  │                                           │
  │── GET /signin           ─────────────────>│ render signin.ejs
  │── POST /signin          ─────────────────>│ find user → bcrypt compare
  │                                           │ → create session
  │                                           │ → sign JWT
  │<── 302 /user + Set-Cookie: jwt ─────────  │
  │                                           │
  │── GET /user             ─────────────────>│ verifyJwt → render user.ejs
  │── POST /user (action=game) ──────────────>│ redirect /mainScene?tag=<sessionId>
  │── POST /user (action=profile) ───────────>│ redirect /profile?tag=<username>
  │                                           │
  │── GET /mainScene        ─────────────────>│ verifyJwt → isAuthenticated
  │                                           │ → render mainScene.ejs (game)
  │                                           │
  │── GET /profile          ─────────────────>│ verifyJwt → render profile.ejs
  │                                           │   (data from session, no DB call)
  │                                           │
  │── GET /editProfile      ─────────────────>│ verifyJwt → isAuthenticated
  │── POST /editProfile     ─────────────────>│ verifyJwt → isAuthenticated
  │                                           │ → findByIdAndUpdate in MongoDB
  │<── 302 /signin ─────────────────────────  │ (re-login to refresh session)
  │                                           │
  │── POST /mainScene (logout) ──────────────>│ session.destroy() + clearCookie
  │<── 302 / ───────────────────────────────  │
```

### Game tick flow

```
Browser (every 100ms)
    │
    ├─ keydown/keyup → set player.moveXxx flags
    │
    └─ World.tick()
          ├─ for each player: resolve movement, collisions, gravity
          ├─ update Three.js mesh positions
          └─ socket.emit('playerpositions', {...})
                │
                └─ Server io receives 'playerpositions'
                   [client-authoritative: server records state,
                    future: can broadcast to other connected clients]
```

### Session data stored at signin

```javascript
req.session = {
    isLoggedIn: true,
    user:       { _id, name, email, ... },  // full MongoDB document
    username:   user.name,
    email:      user.email,
    pswd:       user.password,              // hashed — used for editProfile re-save
    photo:      user.imageUrl               // '/images/<filename>'
}
```

---

## 17. Environment Variables

| Variable | Used In | Description |
|---|---|---|
| `SESSION_SECRET` | express-session | Signs session cookie |
| `JWT_SECRET` | jsonwebtoken | Signs/verifies JWT tokens |
| `JWT_EXPIRES_IN` | jsonwebtoken | Token expiry (e.g. `"1h"`) |
| `SGKEY` | Nodemailer | SendGrid API key |
| `PORT1` | server.listen | Port to run the HTTP server |
| `NODE_ENV` | Cookie config | `production` enables `secure` on JWT cookie |
| `MONGO_DB_URI` | Mongoose | Full MongoDB connection string (Atlas or local) |

> All variables must be defined in a `.env` file at the project root. Never commit `.env` to version control.

---

*Documentation auto-generated from source review — May 2026*

---

## 18. mainScene.ejs — Game View Template

`mainScene.ejs` is the shell that the browser loads when a player enters the game. It wires together the visual atmosphere layers, the HUD, the chat UI, and all JavaScript dependencies before handing off to the game logic in `players.js`.

### EJS template variables

| Variable | Source | Used for |
|---|---|---|
| `pageTitle` | `req.session.username` | `<title>` tag + sector name in HUD center |
| `username` | `req.session.username` | PILOT name in top-right user tag |

---

### Script loading order

The bottom of `<body>` loads scripts in this exact sequence — order is critical because each script depends on the previous:

```
1. /socket.io/socket.io.js         ← Socket.IO client (served auto by socket.io)
2. Inline <script>                 ← chat form wiring (uses socket — must be after #1)
3. three.min.js  (r128, CDN)       ← Three.js core
4. CSS2DRenderer.js  (CDN)         ← CSS2D label renderer (needs THREE)
5. OrbitControls.js  (CDN)         ← orbit controls (needs THREE, unused currently)
6. /players.js                     ← game logic (needs THREE + socket — must be last)
```

> `OrbitControls` is loaded but the game currently uses a manual lerp camera instead. It's available if you want to enable free orbit later.

---

### Atmosphere layer stack (z-index order)

The visual atmosphere is built from 9 stacked layers, each `position:fixed` with `pointer-events:none` so they never block game input:

| z-index | Element | Effect |
|---|---|---|
| 1 | `#gameCanvas` | Three.js WebGL render output |
| 2 | `.pixel-grid` | Faint 32×32 cyan grid overlay (CSS background-image) |
| 2 | `.glow-orb ×3` | Blurred radial colour blobs (purple, pink, cyan) that drift via animation |
| 3 | `#particleCanvas` | Pixel particle system (rising squares, JS-driven) |
| 3 | `.chroma` | Chromatic aberration strip — pink top, cyan bottom, `mix-blend-mode:screen` |
| 4 | `.vignette` | Radial dark vignette — fades edges to black |
| 6 | `.scanlines` | Scrolling CRT scanline pattern |
| 9 | `.frame` + `.corner ×4` | Cyan border frame with gold accent dots on corners |
| 9 | `.px-diamond ×4` | Rotating pixel diamond accents at each corner, pulsing |
| 9 | `.bottom-bar` | Animated gradient bar across the bottom edge |
| 20 | `.hud` | HUD strip (highest z, always on top) |

---

### CSS design system

All colours are defined as CSS custom properties on `:root`:

```css
--pk-hot:   #ff2d78   /* hot pink  — exit button, glow orb, diamonds */
--pk-cyan:  #00f0ff   /* cyan      — grid, labels, frame, user tag    */
--pk-gold:  #ffe600   /* gold      — sector name, corner dots         */
--pk-purp:  #9d00ff   /* purple    — glow orb, bottom bar             */
--pk-lime:  #39ff14   /* lime      — ACTIVE status pip                */
--pk-navy:  #0a0014   /* near-black — body background                 */
--pk-panel: rgba(8,0,22,0.88)   /* HUD/panel backgrounds              */
```

Font: **Press Start 2P** (Google Fonts) — loaded in `<head>`, applied globally. Matches the in-scene CSS2D labels which also use the same font via the `AK` palette in `players.js`.

`image-rendering: pixelated` is set globally via `*` so any scaled images keep the pixel-art aesthetic.

---

### HUD structure

```
.hud (fixed top bar, z-index 20)
  ├── .exit-form
  │     └── <form POST /mainScene>
  │           └── #exit button  ← triggers postLogout on server
  │
  ├── .hud-center
  │     ├── .sector-label   "SECTOR ONLINE"
  │     ├── .sector-name    <%=pageTitle%>   (flicker animation)
  │     └── .status-pip     blinking dot + "ACTIVE"
  │
  ├── .user-tag
  │     ├── .user-tag-label  "PILOT"
  │     └── .user-tag-name   <%=username%>   (glow pulse animation)
  │
  └── .chat-txt
        ├── <ul #messages>   ← incoming chat messages appended here
        └── <form #chatForm>
              ├── <input #chatIp>    text input
              └── <button>  Send
```

---

### Pixel particle system (inline JS)

A self-contained IIFE runs on `#particleCanvas`, independent of Three.js:

```
spawn()  → creates a particle: random x at bottom, random upward velocity,
           random color from COLORS[], random alpha and decay rate

tick()   → every frame via requestAnimationFrame:
             clear canvas
             for each particle:
               move by vx/vy
               reduce life by decay
               if life <= 0 or off-screen → respawn
               draw 3×3 filled square at rounded position
```

55 particles total, cycling through 5 colours: `#ff2d78`, `#00f0ff`, `#ffe600`, `#9d00ff`, `#39ff14`. Canvas resizes on `window.resize`.

---

### Chat wiring (inline Socket.IO script)

```javascript
// Send
form.addEventListener('submit', e => {
    e.preventDefault();
    socket.emit('chat message', input.value);  // sends to server
    input.value = '';
});

// Receive
socket.on('chat message', msg => {
    const li = document.createElement('li');
    li.textContent = msg;
    messageBody.appendChild(li);               // appends to #messages
    window.scrollTo(0, document.body.scrollHeight);
});
```

The server broadcasts the message to all connected clients via `io.emit('chat message', msg)`, so every player in the game sees every chat message in real time.

---

### Notable details & known issues

- `#exit` id is used **twice** — once on the logout button and once on the chat Send button. Duplicate IDs are invalid HTML; `document.getElementById('exit')` will only ever return the first one. The Send button should use a different id or no id at all.
- The `</div>` closing tag for `.chat-txt` is missing — the div is never closed before `</body>`. Browsers auto-correct this but it's worth fixing for validity.
- `OrbitControls` is imported but never instantiated in `players.js`.
- Chat messages scroll the whole `window` rather than a scrollable chat container, which would scroll the entire page.

