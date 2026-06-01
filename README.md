# Echoes of Oblivion

A Node.js multiplayer game portal with authentication, user profile management, file upload, email signup confirmation, and room-based socket communication.

## Project Overview

`Echoes of Oblivion` is a full-stack Express application built with:

- `Express` for server-side routing
- `EJS` for server-rendered views
- `MongoDB` / `Mongoose` for user storage
- `Socket.io` for multiplayer room communication
- `express-session` + cookies for authentication state
- `JWT` cookies for authorization middleware
- `multer` for image uploads
- `nodemailer` + SendGrid for signup confirmation email

The app supports:

- signup with image upload
- signin using email and password
- protected user profile pages
- a multiplayer game lobby / chat room system
- profile editing and persistent game counters

---

## Folder Structure

```
Echoes of Oblivion/
├── controllers/
│   ├── auth.js           # Authentication and page controller logic
│   └── user.js           # User page and profile handlers
├── models/
│   └── user.js           # Mongoose user schema
├── routes/
│   ├── auth.js           # signup/signin/mainScene routes
│   └── user.js           # user/profile routes
├── util/
│   └── database.js       # MongoDB connection
├── views/                # EJS templates
├── public/               # Static client-side assets
├── images/               # Uploaded user images
├── package.json          # Dependencies and scripts
├── server.js             # Main Express + Socket.io app
└── README.md             # Project documentation
```

---

## Required Prerequisites

Before starting, install these tools:

- Node.js (recommended v18 or newer)
- npm (bundled with Node.js)
- MongoDB Atlas account or local MongoDB instance
- SendGrid account or SMTP-compatible email provider if you want signup emails

---

## Dependencies

The application uses the following packages:

- `express` - web server framework
- `ejs` - server-side HTML templates
- `mongoose` - MongoDB object modeling
- `body-parser` - parse form POST bodies
- `cookie-parser` - parse cookies
- `express-session` - session state management
- `connect-flash` - flash messages for errors
- `bcryptjs` - hash and compare passwords
- `jsonwebtoken` - sign and verify JWT tokens
- `multer` - handle image uploads
- `nodemailer` - send emails
- `socket.io` - WebSocket communication for multiplayer
- `cors` - cross-origin support
- `nodemon` - development process reloader

---

## Environment Variables

Create a `.env` file at the project root with the following variables:

```env
MONGO_DB_URI=your-mongodb-connection-string
SESSION_SECRET=some-long-secret-value
JWT_SECRET=some-other-secret-value
JWT_EXPIRES_IN=1h
PORT1=3000
PORT2=3001
SGKEY=your-sendgrid-api-key
NODE_ENV=development
```

### What each variable does

- `MONGO_DB_URI` – MongoDB connection string.
- `SESSION_SECRET` – secret for `express-session`.
- `JWT_SECRET` – secret used to sign JWT auth tokens.
- `JWT_EXPIRES_IN` – token expiration, e.g. `1h` or `3600s`.
- `PORT1` – preferred HTTP port.
- `PORT2` – fallback port if `PORT1` is in use.
- `SGKEY` – SendGrid API key for signup emails.
- `NODE_ENV` – set to `production` in production.

> If you do not need email sending, you can still keep `SGKEY` but the signup email logic expects SendGrid SMTP.

---

## Install and Run Locally

1. Open a terminal in the project root.
2. Install dependencies:

```bash
npm install
```

3. Create `.env` with the variables above.
4. Start the app:

```bash
npm start
```

5. Open the app in your browser:

```text
http://localhost:3000
```

6. If port `3000` is already in use, the app will attempt the fallback port from `PORT2`.

---

## Application Flow

### Public pages

- `/` or `/EchoesOfOblivion` – home page
- `/sea` – sea scene page
- `/heartBeat` – heartbeat scene page
- `/signup` – registration page
- `/signin` – login page
- `/error` – generic error page

### Authenticated pages

- `/mainScene` – protected main game scene
- `/editProfile` – edit profile page
- `/user` – user dashboard page
- `/profile` – profile details page

### Authentication flow

1. Signup uploads a user image and stores a hashed password.
2. If signup succeeds, the app sends a welcome email.
3. Signin checks the email and password.
4. On successful login, it sets session variables and a JWT cookie.
5. Protected routes validate both the JWT and session state.

---

## Key Files Explained

### `server.js`

- Loads environment variables with `dotenv`
- Configures Express, EJS views, static directories, and body parsing
- Defines multer storage and upload filters for images
- Connects to MongoDB via `./util/database`
- Mounts auth and user route modules
- Creates a Socket.io server for multiplayer room communication
- Assigns players into rooms, emits lobby updates, chat, typing, and movement events
- Starts the HTTP server on `PORT1` or fallback `PORT2`

### `util/database.js`

- Uses `mongoose.connect()` with robust socket and timeout options
- Exports the connection promise used by `server.js`
- Logs connection success or failure

### `models/user.js`

Defines the user schema with:

- `name`
- `email`
- `password`
- `imageUrl` (required)
- `gamesplayed`

### `routes/auth.js`

- `/signup` (GET/POST)
- `/signin` (GET/POST)
- `/mainScene` (GET POST)
- `/editProfile` (GET/POST)
- `/error` (GET)

### `routes/user.js`

- `/user` (GET/POST)
- `/profile` (GET)

### `controllers/auth.js`

Handles:

- signup with duplicate checks and password hashing
- signin with bcrypt password validation
- JWT cookie generation and session setup
- auth middleware: `verifyJwt` and `isAuthenticated`
- profile editing
- logout and session destroy

### `controllers/user.js`

Handles:

- rendering the logged-in user page
- redirecting to profile or main scene based on form actions
- rendering the profile page with session data

---

## How to Rebuild This Project from Scratch

Follow these steps if you want to recreate it manually.

### Step 1: Create the folder and initialize npm

```bash
mkdir Echoes-of-Oblivion
cd Echoes-of-Oblivion
npm init -y
```

### Step 2: Install packages

```bash
npm install express ejs mongoose body-parser cookie-parser express-session connect-flash bcryptjs jsonwebtoken multer nodemailer socket.io cors dotenv
npm install --save-dev nodemon
```

### Step 3: Create the main server file

Create `server.js` and add:

- `require('dotenv').config()`
- Express app setup
- EJS view engine
- `bodyParser.urlencoded({ extended: false })`
- `cookieParser()`
- `express.static()` for `public` and `images`
- multer config for file upload
- session middleware using `express-session`
- `connect-flash()`
- route mounting for auth and user routers
- Socket.io setup using `http.createServer(app)`
- `ConnectDB.then(...)` to start server

### Step 4: Add database helper

Create `util/database.js` with `mongoose.connect()` and export the promise.

### Step 5: Create the user schema

Create `models/user.js` with the schema fields above.

### Step 6: Build auth controllers

Create `controllers/auth.js` with methods:

- `getSignup`
- `postSignup`
- `getSignin`
- `postSignin`
- `verifyJwt`
- `isAuthenticated`
- `getMainScene`
- `postMainScene`
- `postLogout`
- `geteditProfile`
- `posteditProfile`
- `geterror`

### Step 7: Build user controllers

Create `controllers/user.js` with:

- `getuserpage`
- `postuserpage`
- `getProfile`

### Step 8: Create routes

Create `routes/auth.js` and `routes/user.js` and register controllers.

### Step 9: Create view templates

Make an EJS `views` folder and add templates for:

- `Eco.ejs`
- `Sea.ejs`
- `dil.ejs`
- `signin.ejs`
- `signup.ejs`
- `user.ejs`
- `profile.ejs`
- `mainScene.ejs`
- `editProfile.ejs`
- `error.ejs`

Each view should render the form fields and UI used in the route handlers.

### Step 10: Add static assets

Create `public/` and add any JavaScript or CSS files required by the client pages.

### Step 11: Create an `.env` file

Add the required environment variables listed earlier.

### Step 12: Start the app

```bash
npm start
```

---

## Important Notes

- The app expects image uploads on signup and edit profile.
- If `multer` does not receive an image, signup redirects to `/error`.
- JWT token is stored in an HTTP-only cookie named `jwt`.
- Sessions are stored in memory by default. For production, use a session store.
- Socket.io uses the session data to attach username to the socket.

---

## Troubleshooting

### `Error: EADDRINUSE`

If the first port is taken, the app will automatically fall back to the `PORT2` value.

### MongoDB connection issues

- Confirm `MONGO_DB_URI` is valid
- Confirm MongoDB is running or Atlas is accessible
- Check network access and firewall settings

### Signup email fails

- Ensure `SGKEY` is a valid SendGrid API key
- Verify SendGrid SMTP credentials
- If you do not need email, skip or replace the email provider logic

### Session or auth problems

- Confirm `SESSION_SECRET` and `JWT_SECRET` are set
- Confirm `JWT_EXPIRES_IN` is valid
- Check browser cookies are accepted

---

## Feedback and Improvements

If you want to extend this project, consider:

- adding persistent session storage (Redis, MongoDB store)
- improving form validation and user feedback
- creating a proper lobby UI for rooms
- using secure HTTPS in production
- separating Socket.io code into its own module

---

## License

ISC
