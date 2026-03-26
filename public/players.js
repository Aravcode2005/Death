
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
    movementdynamics = [];
    constructor(name, era, position, X, Y, Z, Color, arr = [], Theta) {
        super(name, era, position);
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

    controls = () => {
        document.addEventListener("keydown", (event) => {
            const keyName = event.key.toLowerCase();
            if (this !== activePlayer) {
                return;
            }
            if (keyName === 'u') {
                this.y += 1;
                this.player.position.set(this.x, this.y, this.Z);
                console.log("Updating y towards upside " + this.y);
                this.movementdynamics.push([this.x, this.y, this.Z]);
            }
            if (keyName === 'd') {
                this.y -= 1;
                console.log("Updating y towards down " + this.y);
                this.player.position.set(this.x, this.y, this.Z);
                this.movementdynamics.push([this.x, this.y, this.Z]);
            }
            if (keyName === 'r') {
                this.x += 1;
                console.log("Updating x towards right " + this.x);
                this.player.position.set(this.x, this.y, this.Z);
                this.movementdynamics.push([this.x, this.y, this.Z]);
            }
            if (keyName === 'l') {
                this.x -= 1;
                console.log("Updating x towards left  " + this.x);
                this.player.position.set(this.x, this.y, this.Z);
                this.movementdynamics.push([this.x, this.y, this.Z]);
            }
            if (keyName === 'f') {
                this.Z -= 1;
                console.log("Updating z towards forward " + this.Z);
                this.player.position.set(this.x, this.y, this.Z);
                this.movementdynamics.push([this.x, this.y, this.Z]);
            }

            if (keyName === 'b') {
                this.Z += 1;
                console.log("Updating z towards back " + this.Z);
                this.player.position.set(this.x, this.y, this.Z);
                this.movementdynamics.push([this.x, this.y, this.Z]);
            }

            if (keyName === 's') {
                const newX = this.x * Math.cos(this.theta) - this.y * Math.sin(this.theta);
                const newY = this.x * Math.sin(this.theta) + this.y * Math.cos(this.theta);
                this.x = newX;
                this.y = newY;
                console.log("Rotating");
                this.player.position.set(this.x, this.y, this.Z);
                this.movementdynamics.push([this.x, this.y, this.Z])
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
const player1 = new Playeractions("Xing", "Past", "Monk", 0, -10, 0, 0xff0000, [], 45);
player1.controls();
const player2 = new Playeractions("Zeus", "Medivial", "Warrior", 0, 0, 0, 0x00ff00, [], 45);
player2.controls();
const player3 = new Playeractions("Alex", "Future", "Engineer", 0, 10, 0, 0x0000ff, [], 45);
player3.controls();
const player4 = new Playeractions("Xong", "Past", "Monk", 10, -10, 0, 0xff0000, [], 45);
player4.controls();
const player5 = new Playeractions("Zous", "Medivial", "Warrior", 20, 0, 0, 0x00ff00, [], 45);
player5.controls();
const player6 = new Playeractions("Alegx", "Future", "Engineer", 15, 10, 0, 0x0000ff, [], 45);
player6.controls();
let activePlayer = player1;
playerrecord=[player1,player2,player3,player4,player5,player6];
document.addEventListener("keydown", (event) => {
    const button = event.key;

    if (button >= '1' && button <= '6') {
        activePlayer = playerrecord[Number(button)-1];
        return;
    }
});
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


