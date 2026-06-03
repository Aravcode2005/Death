require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const socketIo = require('socket.io');
const http = require('http');
const server = http.createServer(app);
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const session = require('express-session');
const flash = require('connect-flash');
const multer = require('multer');
const cors = require('cors');
app.use(cors());
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const cookieParser = require('cookie-parser');
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    }
    else {
        cb(null, false);
    }
};
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));
app.use(express.json());
const ConnectDB = require('./util/database');
const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
})
app.use(sessionMiddleware);

app.use(flash());
app.get('/', (req, res, next) => {
    console.log('Cookies:', JSON.stringify(req.cookies));
    res.render('Eco', {
        pageTitle: "Echoes of Oblivion",
        junglelink: '/mainScene',
        sealink: '/sea'
    })
})
app.get('/EchoesOfOblivion', (req, res, next) => {
    res.render('Eco', {
        pageTitle: "Echoes of Oblivion",
        junglelink: '/mainScene',
        sealink: '/sea'
    })
})

app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.get('/sea', (req, res, next) => {
    res.render("Sea", {
        pageTitle: "seaScene"
    })
})
app.get('/heartBeat', (req, res, next) => {
    res.render('dil', {
        pageTitle: "HeartBeat"
    })
})
app.use(authRoutes);
app.use(userRoutes);
try {
    io.use((socket, next) => {
        sessionMiddleware(socket.request, {}, next);
    })
}
catch (error) {
    console.log(error);
}
const rooms = {};
const maxCapacity = 6;
const playerlist = {};
const activeUsers = new Map();
io.on('connection', (socket) => {
    let assignedroomId = null;
    console.log("New socket id is", socket.id);
    if (!socket.request.session.username) {
        socket.disconnect(true);
        return;
    }
    console.log("Checkpoint 1 crossed");
    const username = socket.request.session.username;
    console.log(`Now we have the username ${username}`);
    if (activeUsers.has(username)) {
        io.to(socket.id).emit('duplicate', {
            message: "You are already connected mf"
        })
    }
    else if (!activeUsers.has(username)) {
        activeUsers.set(socket.request.session.username, socket.id);
        console.log(`Current record state ${JSON.stringify(activeUsers)}`);
        console.log("Rooms", rooms);
        console.log(`Current state of the rooms is ${JSON.stringify(rooms)} `);
        for (const i in rooms) {
            if (rooms[i].length < maxCapacity) {
                assignedroomId = i;
                break;
            }
        }

        if (assignedroomId) {
            console.log(`We have the assignedroomId room id ${assignedroomId}`);
            console.log("Checkpoint 2.a crossed");
        }
        else if (!assignedroomId) {
            console.log("Assigning new roomId");
            assignedroomId = Math.random().toString(36).slice(2);
            rooms[assignedroomId] = [];
        }
        console.log("The final assigned room id is ", assignedroomId);
        console.log("Naya ponda aagya");
        rooms[assignedroomId].push({
            socketId: socket.id,
            user: username
        })

        if (!playerlist[assignedroomId]) {
            playerlist[assignedroomId] = [];
        }
        const OBJ = {
            socketId: socket.id,
            Name: username
        }
        playerlist[assignedroomId].push(OBJ);
        socket.roomId = assignedroomId;

        console.log(`Room state before player with ${socket.request.session.username} joined ${JSON.stringify(rooms)}`);
        socket.on('join-room', () => {
            console.log(`Player ${username} joined the room whose id is ${assignedroomId}`);
            socket.join(socket.roomId);
            console.log(`Room state after player with ${socket.request.session.username} joined ${JSON.stringify(rooms)}`);
            console.log(`Player:${socket.request.session.username} Assigned roomid is ${assignedroomId}`);
            console.log(rooms);
            console.log("This is the playerlist" + JSON.stringify(playerlist));
            try {
                io.to(socket.roomId).emit('chat message', {
                    username: 'System',
                    msg: `${socket.request.session.username} has joined!`
                })
                io.to(socket.roomId).emit('lobby-update', {
                    squad: playerlist,
                })
            }
            catch (error) {
                console.log(error);
            }
        })


        socket.on('disconnect', () => {
            const leftuser = socket.request.session.username;
            for (const i in playerlist) {
                playerlist[i] = playerlist[i].filter(obj => obj.socketId !== socket.id);
            }

            for (const roomid in rooms) {
                rooms[roomid] = rooms[roomid].filter(obj => obj.socketId !== socket.id);
            }
            activeUsers.delete(leftuser);
            console.log(playerlist);
            socket.to(socket.roomId).emit('leave-room', {
                left: leftuser,
                id: socket.id
            })
        })
        socket.on('start typing', () => {
            try {
                socket.to(socket.roomId).emit('start typing', {
                    username: socket.request.session.username,
                    userId: socket.id
                })
            }
            catch (error) {
                console.log(error);
            }
        })
        socket.on('stop typing', () => {
            try {
                socket.to(socket.roomId).emit('stop typing', {
                    username: socket.request.session.username,
                    userId: socket.id
                })
            }
            catch (error) {
                console.log(error);
            }
        })

        socket.on('chat message', (data) => {
            socket.to(socket.roomId).emit('chat message', {
                msg: data.msg,
                username: data.username
            });
        });
        socket.on('update-movement', (data) => {
            io.to(socket.roomId).emit('movement', {
                id: socket.id,
                pos: data,
            })
        })
        socket.on('update health', (data) => {
            try {
                io.to(socket.roomId).emit('health info', {
                    id: socket.id,
                    health: data
                })
            }
            catch (error) {
                console.log(error);
            }
        })
    }

});


const PORT = process.env.PORT1;
const FALLBACKPORT = process.env.PORT2;
ConnectDB.then(() => {
    server.listen(PORT, () => console.log(`http://localhost:${PORT}`))
}).catch(error => {

    server.on('error', err => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Falling back to port${FALLBACKPORT}`);
            server.listen(FALLBACKPORT, () => console.log(`http://localhost:${FALLBACKPORT}`));
        }
    });

    console.log("Error found in connecting " + error);
})

