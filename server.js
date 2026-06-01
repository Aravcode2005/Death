require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const socketIo = require('socket.io');
const http = require('http');
const server = http.createServer(app);
const io = socketIo(server);
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const session = require('express-session');
const flash = require('connect-flash');
const multer = require('multer');
//const graphqlHttp = require('express-graphql');
const cors = require('cors');
// const graphqlScehma = require('./graphql/schema');
// const graphqlResolver = require('./graphql/resolvers');
app.use(cors());
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const MongoStore = require('connect-mongo');
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

const dotenv = require('dotenv');
dotenv.config();
const ConnectDB = require('./util/database');
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
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
// app.use('/graphql', graphqlHttp({
//     schema: graphqlScehma,
//     rootValue: graphqlResolver,
//     graphiql:true
// }))
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
let roomcount = 0;
io.on('connection', (socket) => {
    let assignedroomId = null;
    for (const i in rooms) {
        if (rooms[i].length < maxCapacity) {
            assignedroomId = i;
            break;
        }
    }
    if (!assignedroomId) {
        assignedroomId = Math.random().toString(36).slice(2);
        rooms[assignedroomId] = [];
        roomcount++;
    }
    rooms[assignedroomId].push({
        socketId: socket.id,
        user: socket.request.session.username
    })
    if (!playerlist[roomcount]) {
        playerlist[roomcount] = [];
    }
    const OBJ = {
        socketId: socket.id,
    }
    playerlist[roomcount].push(OBJ);
    socket.roomId = assignedroomId;
    socket.on('join-room', () => {
        socket.join(socket.roomId);
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

    socket.on('start typing', () => {
        try {
            socket.to(socket.roomId).emit('start typing', {
                username: socket.request.session.username,
                userId:socket.id
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
                userId:socket.id
            })
        }
         
        catch (error) {
            console.log(error);
        }
    })

    socket.on('chat message', (data) => {
        io.to(socket.roomId).emit('chat message', {
            msg: data.msg,
            username: data.username
        });
    });
    socket.on('update-movement', (data) => {
        io.to(socket.roomId).emit('movement', {
            id: socket.id,
            pos: data
        })
    })
});
const PORT = process.env.PORT1;
const FALLBACKPORT = process.env.PORT2;
ConnectDB.then(() => {
    server.listen(PORT, () => console.log(`http://localhost:${PORT}`))
}).catch(error => {
    if (error === 'EADDRINUSE') {
        console.log(`Falling back to port${FALLBACKPORT}`);
        server.listen(FALLBACKPORT, () => console.log(`http://localhost:${FALLBACKPORT}`));
    }
    console.log("Error found in connecting " + error);
io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('message', (data) => {
        console.log('Message received:', data);
        socket.emit('response', 'Message received');
    });
    socket.on('disconnect', () => console.log('User disconnected'));
});
ConnectDB.then(() => {
    server.listen(3003, () => console.log("http://localhost:3003"));
}).catch(err => {
    console.log("Error found in connecting ");
})


