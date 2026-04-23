
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
class Player {
    Name;
    Era;
    Position;
    constructor(name, era, position) {
        this.Name = name;
        this.Era = era;
        this.Position = position;
    }
    lifeeventlogs() {
        console.log("Gathering the info......" + "name->" + this.Name + "Era->" + this.Era + "Position" + this.Position);
    }
}
const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200, 32, 32), new THREE.MeshStandardMaterial({
    roughness: 0.9,
    color: 0x7cb342
  })
);
floor.rotation.x = -Math.PI / 2;
Scene.add(floor);
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
        this.movementdynamics = arr;
        this.player = new THREE.Mesh(
            new THREE.BoxGeometry(1, 2, 3),
            new THREE.MeshStandardMaterial({ color: this.color, roughness: 0.9 })
        );
        this.player.position.set(X, Y, Z);
        Scene.add(this.player);
    }

    fullinfo() {
        console.log(this.Name, this.Era, this.Position, this.movementdynamics);
    }
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
            if (p.moveRight) p.x++;
            if (p.moveLeft) p.x--;
            if (p.moveForward) p.Z--;
            if (p.moveBackward) p.Z++;
            if (p.moveUp) p.y++;
            if (p.moveDown) p.y--;

            p.player.position.set(p.x, p.y, p.Z);

            if (p.movementdynamics.length > 100) {
                p.movementdynamics.shift();
            }
            p.movementdynamics.push([p.x, p.y, p.Z]);
        }


        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                id: activePlayer.Name,
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
const player1 = new Playeractions("Xing", "Past", "Monk", 0, -10, 0, 0xff0000, [], 45);
const player2 = new Playeractions("Zeus", "Medieval", "Warrior", 0, 0, 0, 0x00ff00, [], 45);
const player3 = new Playeractions("Alex", "Future", "Engineer", 0, 10, 0, 0x0000ff, [], 45);
const player4 = new Playeractions("Xong", "Past", "Monk", 10, -10, 0, 0xff0000, [], 45);
const player5 = new Playeractions("Zous", "Medieval", "Warrior", 20, 0, 0, 0x00ff00, [], 45);
const player6 = new Playeractions("Alegx", "Future", "Engineer", 15, 10, 0, 0x0000ff, [], 45);
const ghostplayer1 = new Ghost(player1.Name, 0, 0, 0, 1, 2, 3, player1.color, 0.9, player1.movementdynamics);
const ghostplayer2 = new Ghost(player2.Name, 0, 0, 0, 1, 2, 3, player2.color, 0.9, player2.movementdynamics);
const ghostplayer3 = new Ghost(player3.Name, 0, 0, 0, 1, 2, 3, player3.color, 0.9, player3.movementdynamics);
const ghostplayer4 = new Ghost(player4.Name, 0, 0, 0, 1, 2, 3, player4.color, 0.9, player4.movementdynamics);
const ghostplayer5 = new Ghost(player5.Name, 0, 0, 0, 1, 2, 3, player5.color, 0.9, player5.movementdynamics);
const ghostplayer6 = new Ghost(player6.Name, 0, 0, 0, 1, 2, 3, player6.color, 0.9, player6.movementdynamics);
const ghosts = [ghostplayer1, ghostplayer2, ghostplayer3, ghostplayer4, ghostplayer5, ghostplayer6];
const playerrecord = [player1, player2, player3, player4, player5, player6];
let activePlayer = player1;
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
        activePlayer = playerrecord[Number(key) - 1];
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
    console.log("This is X coordinate of the current player" + activePlayer.x);
    console.log("This is the y coordinate of the active player" + activePlayer.y);
    console.log("This is the z coordinate of the activeplayer" + activePlayer.Z);
})
socket.on('disconnected', () => {
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