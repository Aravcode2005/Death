
const Scene = new THREE.Scene();
Scene.background = new THREE.Color(0x262626)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
Scene.add(ambientLight);
const PerspectiveCamera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
PerspectiveCamera.position.z = 15;
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
};
class Playeractions extends Player {
    x = 0;
    y = 0;
    Z = 0;
    theta;
    color;
    moveUp;
    moveDown;
    moveLeft;
    moveRight;
    moveForward;
    moveBackward;
    rotate;
    movementdynamics = [];
    constructor(name, era, position, X, Y, Z, Color, arr = [], Theta) {
        super(name, era, position);
        this.moveRight = false;
        this.moveLeft = false;
        this.moveForward = false;
        this.moveBackward = false;
        this.x = X;
        this.y = Y;
        this.Z = Z;
        this.theta = Theta;
        this.color = Color;
        this.movementdynamics = arr;
        this.player = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 3), new THREE.MeshStandardMaterial({
            color: this.color,
            roughness: 0.9,
        }));
        this.player.position.set(X, Y, Z);
        Scene.add(this.player);
    }
    intent = () => {
        document.addEventListener("keydown", (event) => {
            const keyName = event.key.toLowerCase();
            if (this !== activePlayer) {
                return;
            }
            if (keyName === 'u') {
                this.moveUp = true;
            }
            if (keyName === 'd') {
                this.moveDown = true;
            }
            if (keyName === 'r') {
                this.moveRight = true;
            }
            if (keyName === 'l') {
                this.moveLeft = true;
            }
            if (keyName === 'f') {
                this.moveForward = true;
            }
            if (keyName === 'b') {
                this.moveBackward = true;
            }

            if (keyName === 's') {
                this.rotate = true;
            }
        })

        document.addEventListener("keyup", (event) => {
            const keyName = event.key.toLowerCase();
            if (this !== activePlayer) {
                return;
            }
            if (keyName === 'u') {

                this.moveUp = false;
            }
            if (keyName === 'd') {

                this.moveDown = false;
            }
            if (keyName === 'r') {

                this.moveRight = false;
            }
            if (keyName === 'l') {

                this.moveLeft = false;
            }
            if (keyName === 'f') {

                this.moveForward = false;
            }
            if (keyName === 'b') {

                this.moveBackward = false;
            }

            if (keyName === 's') {

                this.rotate = false;
            }
        })
    }
    fullinfo() {
        console.log(this.Name);
        console.log(this.Era);
        console.log(this.Position);
        console.log(this.movementdynamics);
    }
}

class World {
    pulse;
    playerList = [];
    constructor(x, y, z, heartPulse, Players = []) {
        this.pulse = heartPulse;
        this.playerList = Players;
    }

    tick() {
        for (let i = 0; i < this.playerList.length; i++) {
            let currentplayer = this.playerList[i];
            if (currentplayer.moveRight) {
                currentplayer.x++;
                currentplayer.player.position.set(currentplayer.x, currentplayer.y, currentplayer.Z);
            }
            if (currentplayer.moveLeft) {
                currentplayer.x--;
                currentplayer.player.position.set(currentplayer.x, currentplayer.y, currentplayer.Z);
            }
            if (currentplayer.moveForward) {
                currentplayer.Z--;
                currentplayer.player.position.set(currentplayer.x, currentplayer.y, currentplayer.Z);
            }

            if (currentplayer.moveBackward) {
                currentplayer.Z++;
                currentplayer.player.position.set(currentplayer.x, currentplayer.y, currentplayer.Z);
            }
        }

    }
}

const player1 = new Playeractions("Xing", "Past", "Monk", 0, -10, 0, 0xff0000, [], 45);
player1.intent();
const player2 = new Playeractions("Zeus", "Medivial", "Warrior", 0, 0, 0, 0x00ff00, [], 45);
player2.intent();
const player3 = new Playeractions("Alex", "Future", "Engineer", 0, 10, 0, 0x0000ff, [], 45);
player3.intent();
const player4 = new Playeractions("Xong", "Past", "Monk", 10, -10, 0, 0xff0000, [], 45);
player4.intent();
const player5 = new Playeractions("Zous", "Medivial", "Warrior", 20, 0, 0, 0x00ff00, [], 45);
player5.intent();
const player6 = new Playeractions("Alegx", "Future", "Engineer", 15, 10, 0, 0x0000ff, [], 45);
player6.intent();
let activePlayer = player1;
playerrecord = [player1, player2, player3, player4, player5, player6];
document.addEventListener("keydown", (event) => {
    const button = event.key;

    if (button >= '1' && button <= '6') {
        activePlayer = playerrecord[Number(button) - 1];
        return;
    }
});
const world = new World(0, 0, 0, 100, playerrecord);
setInterval(() => {
    world.tick();
}, world.pulse);
setInterval(() => activePlayer.fullinfo(), 10000);
const canvas = document.getElementById("gameCanvas");
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
});
function animate() {
    requestAnimationFrame(animate);
    renderer.render(Scene, PerspectiveCamera);
}
animate();

