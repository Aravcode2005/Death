
const Scene = new THREE.Scene();
const socket = io("http://localhost:3000");
Scene.background = new THREE.Color(0x262626);
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
Scene.add(ambientLight);
const PerspectiveCamera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200, 32, 32), new THREE.MeshStandardMaterial({
    roughness: 0.9,
    color: 0x7cb342
})
);
floor.rotation.x = -Math.PI / 2;
Scene.add(floor);
class Player {
    name;
    era;
    position;
    constructor(name, era, position) {
        this.name = name;
        this.era = era;
        this.position = position;
    }
}
class Playeractions extends Player {
    x = 0;
    y = 0;
    Z = 0;
    theta;
    color;
    moveUp = false;
    moveDown = false;
    moveLeft = false;
    moveRight = false;
    moveForward = false;
    moveBackward = false;
    rotate = false;
    movementdynamics = [];
    constructor(name, era, position, X, Y, Z, Color, arr = [], Theta) {
        super(name, era, position);
        this.x = X;
        this.y = Y;
        this.Z = Z;
        this.theta = Theta;
        this.color = Color;
        this.movementdynamics = [[X,Y,Z]];
        this.player = new THREE.Mesh(
            new THREE.BoxGeometry(1, 2, 3),
            new THREE.MeshStandardMaterial({ color: this.color, roughness: 0.9 })
        );
        this.player.position.set(X, Y, Z);
        Scene.add(this.player);
    }
    fullinfo() {
        console.log(this.name, this.era, this.position, this.movementdynamics);
    }
}

//at each point or on each change show the movement dynamics to the server 
const player1 = new Playeractions("Xing", "Past", "Monk", 0, -10, 0, 0xff0000, [], 45);
const player2 = new Playeractions("Zeus", "Medieval", "Warrior", 0, 0, 0, 0x00ff00, [], 45);
const player3 = new Playeractions("Alex", "Future", "Engineer", 0, 10, 0, 0x0000ff, [], 45);
const player4 = new Playeractions("Xong", "Past", "Monk", 10, -10, 0, 0xff0000, [], 45);
const player5 = new Playeractions("Zous", "Medieval", "Warrior", 20, 0, 0, 0x00ff00, [], 45);
const player6 = new Playeractions("Alegx", "Future", "Engineer", 15, 10, 0, 0x0000ff, [], 45);
const playerrecord = [player1, player2, player3, player4, player5, player6];
let activePlayer = player1;
function willCollide(pos = [], movementdynamics) {
    if (movementdynamics.length === 0) {
        return 0;
    }
    const latest = movementdynamics[movementdynamics.length - 1];
    return (
        (Math.abs(pos[0] - latest[0]) <= 1 && Math.abs(pos[1] - latest[1]) <= 1 && Math.abs(pos[2] - latest[2]) <= 1)
    )
}
class World {
    pulse;
    playerList = [];
    constructor(heartPulse, Players = []) {
        this.pulse = heartPulse;
        this.playerList = Players;
    }
    tick() {
        for (let i = 0; i < this.playerList.length; i++) {
            let p = this.playerList[i];
            if (p.moveRight) {
                for (let i = 1; i <= 6; i++) {
                    if (playerrecord[i - 1] === p) {
                        continue;
                    }
                    if (!willCollide([p.x, p.y, p.Z], playerrecord[i - 1].movementdynamics)) {
                        p.x++;
                    }
                    else {
                        console.log("Colliding between current player and " + i + "th player");
                    }
                }
            }
            if (p.moveLeft) {
                for (let i = 1; i <= 6; i++) {
                    if (playerrecord[i - 1] === p) {
                        continue;
                    }
                    if (!willCollide([p.x, p.y, p.Z], playerrecord[i - 1].movementdynamics)) {
                        p.x--;
                    }
                    else {
                        console.log("Colliding between current player and " + i + "th player");
                    }

                }
            }
            if (p.moveForward) {
                for (let i = 1; i <= 6; i++) {
                    if (playerrecord[i - 1] === p) {
                        continue;
                    }

                    if (!willCollide([p.x, p.y, p.Z], playerrecord[i - 1].movementdynamics)) {
                        p.Z--;
                    }
                    else {
                        console.log("Colliding between current player and " + i + "th player");
                    }

                }
            }
            if (p.moveBackward) {
                for (let i = 1; i <= 6; i++) {
                    if (playerrecord[i - 1] === p) {
                        continue;
                    }
                    if (!willCollide([p.x, p.y, p.Z], playerrecord[i - 1].movementdynamics)) {
                        p.Z++;
                    }
                    else {
                        console.log("Colliding between current player and " + i + "th player");
                    }
                }
            }
            if (p.moveUp) {
                for (let i = 1; i <= 6; i++) {
                    if (playerrecord[i - 1] === p) {
                        continue;
                    }
                    if (!willCollide([p.x, p.y, p.Z], playerrecord[i - 1].movementdynamics)) {
                        p.y++;
                    }
                    else {
                        console.log("Colliding between current player and " + i + "th player");
                    }
                }
            }
            if (p.moveDown) {
                for (let i = 1; i <= 6; i++) {
                    if (playerrecord[i - 1] === p) {
                        continue;
                    }
                    if (!willCollide([p.x, p.y, p.Z], playerrecord[i - 1].movementdynamics)) {
                        p.y--;
                    }
                    else {
                        console.log("Colliding between current player and " + i + "th player");
                    }
                }
            }
            p.player.position.set(p.x, p.y, p.Z);
            if (p.movementdynamics.length > 3) {
                p.movementdynamics.shift();
            }
            p.movementdynamics.push([p.x, p.y, p.Z]);
        }
        if (socket.connected) {
            socket.emit(JSON.stringify({
                id: activePlayer.name,
                positions: [activePlayer.x, activePlayer.y, activePlayer.Z],
            }));
        }

        ghosts.forEach(g => g.follow());
    }
}
class Ghost {
    name;
    ghostx = 0;
    ghosty = 0;
    ghostz = 0;
    h; l; b;
    color;
    roughness;
    movementarray;
    index = 0;
    constructor(name, x, y, z, h, l, b, color, roughness, ghostpath) {
        this.movementarray = ghostpath;
        this.h = h;
        this.l = l;
        this.b = b;
        this.color = color;
        this.roughness = roughness;
        this.name = name;
        this.ghostx = x;
        this.ghosty = y;
        this.ghostz = z;
        this.spirit = new THREE.Mesh(
            new THREE.BoxGeometry(this.h, this.l, this.b),
            new THREE.MeshStandardMaterial({
                color: this.color,
                roughness: this.roughness,
                opacity: 0.4,
                transparent: true
            })
        );
        this.spirit.position.set(x, y, z);
        Scene.add(this.spirit);
    }

    follow() {
        if (this.movementarray.length === 0) return;
        const latest = this.movementarray.length - 1;
        const target = new THREE.Vector3(...this.movementarray[latest]);
        this.spirit.position.lerp(target, 0.5);
    }
}
const ghostplayer1 = new Ghost(player1.name, 0, 0, 0, 1, 2, 3, player1.color, 0.9, player1.movementdynamics);
const ghostplayer2 = new Ghost(player2.name, 0, 0, 0, 1, 2, 3, player2.color, 0.9, player2.movementdynamics);
const ghostplayer3 = new Ghost(player3.name, 0, 0, 0, 1, 2, 3, player3.color, 0.9, player3.movementdynamics);
const ghostplayer4 = new Ghost(player4.name, 0, 0, 0, 1, 2, 3, player4.color, 0.9, player4.movementdynamics);
const ghostplayer5 = new Ghost(player5.name, 0, 0, 0, 1, 2, 3, player5.color, 0.9, player5.movementdynamics);
const ghostplayer6 = new Ghost(player6.name, 0, 0, 0, 1, 2, 3, player6.color, 0.9, player6.movementdynamics);
const ghosts = [ghostplayer1, ghostplayer2, ghostplayer3, ghostplayer4, ghostplayer5, ghostplayer6];
const keyMap = {
    'u': 'moveUp',
    'd': 'moveDown',
    'r': 'moveRight',
    'l': 'moveLeft',
    'f': 'moveForward',
    'b': 'moveBackward',
    's': 'rotate',
};
document.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    if (key >= '1' && key <= '6') {
        console.log("Key pressed!");
        activePlayer = playerrecord[Number(key) - 1];
        console.log("The active player is" + playerrecord[Number(key) - 1]);
        return;
    }
    if (keyMap[key] !== undefined) {
        activePlayer[keyMap[key]] = true;
    }
});
document.addEventListener("keyup", (event) => {
    const key = event.key.toLowerCase();
    if (keyMap[key] !== undefined) {
        activePlayer[keyMap[key]] = false;
    }
});
socket.on('connect', () => {
    console.log("Connected", socket.id);
    console.log("This is X coordinate of the current player", activePlayer.x);
    console.log("This is the y coordinate of the active player", activePlayer.y);
    console.log("This is the z coordinate of the activeplayer", activePlayer.Z);
    console.log("The coordinates of the player 1", player1.movementdynamics);
    console.log("The coordinates of the second player 2", player2.movementdynamics);
    console.log("The coordinates of the player 3 ", player3.movementdynamics);
    console.log("The coordinates of the player 4", player4.movementdynamics);
    console.log("The coordinates of the player 5", player5.movementdynamics);
    console.log("The coordinates of the player 6", player6.movementdynamics);
})
socket.on('disconnect', () => {
    console.log('Disconnected from the socket/server');
})
socket.addEventListener('close', () => {
    console.log('Disconnected from server');
});
const world = new World(100, playerrecord);
setInterval(() => world.tick(), world.pulse);
setInterval(() => activePlayer.fullinfo(), 10000);
const canvas = document.getElementById("gameCanvas");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
window.addEventListener('resize', () => {
    PerspectiveCamera.aspect = window.innerWidth / window.innerHeight;
    PerspectiveCamera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
function animate() {
    requestAnimationFrame(animate);
    const offset = new THREE.Vector3(0, 5, 10);
    const targetPosition = new THREE.Vector3(activePlayer.x, activePlayer.y, activePlayer.Z).add(offset);
    PerspectiveCamera.position.lerp(targetPosition, 0.1);
    PerspectiveCamera.lookAt(activePlayer.x, activePlayer.y, activePlayer.Z);
    renderer.render(Scene, PerspectiveCamera);
}
animate();
//For collision we need the current coordinates of each player not just the active player

