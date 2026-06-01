const AK = {
    bg: 0x050e08,
    floor: 0x071410,
    floorEm: 0x0d2e18,
    grid1: 0x2dd4bf,
    grid2: 0x0a1f10,
    fog: 0x050e08,
    hemi_sky: 0x4ade80,
    hemi_gnd: 0x14532d,
    light1: 0xa8ff3e,
    light2: 0x2dd4bf,
    light3: 0xe8d97a,
    label_bg: 'rgba(5,14,8,0.90)',
    label_border: 'rgba(168,255,62,0.38)',
    label_color: '#a8ff3e',
    label_shadow: '0 0 8px rgba(168,255,62,0.85)',
    label_font: "'Quicksand', sans-serif",
    hp_color: '#e8d97a',
    hp_shadow: '0 0 7px rgba(232,217,122,0.75)',
    hp_border: 'rgba(232,217,122,0.28)',
};

const Scene = new THREE.Scene();
Scene.background = new THREE.Color(AK.bg);
Scene.fog = new THREE.FogExp2(AK.fog, 0.011);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.18);
const socket = io("http://localhost:3000");
Scene.background = new THREE.Color(0x262626);
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
Scene.add(ambientLight);

const hemiLight = new THREE.HemisphereLight(AK.hemi_sky, AK.hemi_gnd, 0.55);
Scene.add(hemiLight);

const pLightLime = new THREE.PointLight(AK.light1, 3.5, 120);
pLightLime.position.set(-40, 30, -40);
Scene.add(pLightLime);

const pLightTeal = new THREE.PointLight(AK.light2, 3.0, 120);
pLightTeal.position.set(90, 25, 90);
Scene.add(pLightTeal);

const pLightGold = new THREE.PointLight(AK.light3, 2.0, 100);
pLightGold.position.set(0, 50, 0);
Scene.add(pLightGold);

const PerspectiveCamera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const labelRenderer = new THREE.CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'fixed';
labelRenderer.domElement.style.top = '0px';
labelRenderer.domElement.style.left = '0px';
labelRenderer.domElement.style.zIndex = '10';
labelRenderer.domElement.style.pointerEvents = 'none';
document.body.appendChild(labelRenderer.domElement);

const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200, 32, 32),
    new THREE.MeshStandardMaterial({
        color: AK.floor,
        roughness: 0.38,
        metalness: 0.52,
        emissive: new THREE.Color(AK.floorEm),
        emissiveIntensity: 0.28,
    })
);
floor.rotation.x = -Math.PI / 2;
Scene.add(floor);

const grid = new THREE.GridHelper(200, 50, AK.grid1, AK.grid2);
grid.material.opacity = 0.18;
grid.material.transparent = true;
grid.position.y = 0.01;
Scene.add(grid);

const ringGeom = new THREE.TorusGeometry(101, 0.25, 8, 120);
const ringMat = new THREE.MeshStandardMaterial({
    color: 0x4ade80,
    emissive: new THREE.Color(0x4ade80),
    emissiveIntensity: 1.2,
    transparent: true,
    opacity: 0.5,
});
const arenaRing = new THREE.Mesh(ringGeom, ringMat);
arenaRing.rotation.x = -Math.PI / 2;
arenaRing.position.y = 0.15;
Scene.add(arenaRing);

const discGeom = new THREE.CircleGeometry(2, 32);
const discMat = new THREE.MeshStandardMaterial({
    color: 0xa8ff3e,
    emissive: new THREE.Color(0xa8ff3e),
    emissiveIntensity: 1.0,
    transparent: true,
    opacity: 0.35,
});
const disc = new THREE.Mesh(discGeom, discMat);
disc.rotation.x = -Math.PI / 2;
disc.position.y = 0.02;
Scene.add(disc);


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
};

}
class Playeractions extends Player {
    x = 0;
    y = 0;
    z = 0;
    theta;
    color;
    mass;
    moveUp = false;
    moveDown = false;
    moveLeft = false;
    moveRight = false;
    moveForward = false;
    moveBackward = false;
    rotate = false;
    movementdynamics = [];
    health = [];
    constructor(name, era, position, X, Y, Z, Color, arr = [], health = [], mass) {
        super(name, era, position);
        this.x = X;
        this.y = Y;
        this.z = Z;
        this.color = Color;
        this.mass = mass;
        this.health[0] = 50;
        this.movementdynamics = [[X, Y, Z]];
        this.player = new THREE.Mesh(
            new THREE.BoxGeometry(1, 2, 3),
            new THREE.MeshStandardMaterial({
                color: this.color,
                roughness: 0.45,
                metalness: 0.5,
                emissive: new THREE.Color(this.color),
                emissiveIntensity: 0.75,
            })
        this.movementdynamics = [[X, Y, Z]];
        this.player = new THREE.Mesh(
            new THREE.BoxGeometry(1, 2, 3),
            new THREE.MeshStandardMaterial({ color: this.color, roughness: 0.9 })
        );
        this.player.position.set(X, Y, Z);
        const div = document.createElement('div');
        div.textContent = this.name;
        div.style.fontFamily = AK.label_font;
        div.style.fontSize = '11px';
        div.style.fontWeight = '500';
        div.style.letterSpacing = '1px';
        div.style.color = AK.label_color;
        div.style.textShadow = AK.label_shadow;
        div.style.background = AK.label_bg;
        div.style.border = '1px solid ' + AK.label_border;
        div.style.padding = '4px 10px';
        div.style.whiteSpace = 'nowrap';
        div.style.pointerEvents = 'none';
        div.style.borderRadius = '2px';
        div.style.clipPath = 'polygon(0 0,100% 0,100% calc(100% - 5px),calc(100% - 5px) 100%,0 100%)';
        const div2 = document.createElement('div');
        div2.textContent = this.health[0];
        div2.style.fontFamily = AK.label_font;
        div2.style.fontSize = '10px';
        div2.style.fontWeight = '400';
        div2.style.color = AK.hp_color;
        div2.style.textShadow = AK.hp_shadow;
        div2.style.background = AK.label_bg;
        div2.style.border = '1px solid ' + AK.hp_border;
        div2.style.padding = '3px 10px';
        div2.style.borderRadius = '2px';
        div2.style.pointerEvents = 'none';
        this.hpDiv = div2;
        const label2 = new THREE.CSS2DObject(div2);
        const label = new THREE.CSS2DObject(div);
        label.position.set(0, 2, 0);
        label2.position.set(0, 4, 0);
        this.player.add(label);
        this.player.add(label2);
        Scene.add(this.player);
    }

    fullinfo() {
        console.log(this.name, this.era, this.position, this.movementdynamics);
    }

    gravity(delta) {

        if (this.y > 0) {
            this.y -= 9.8 * delta;
        }
        if (this.y < 0) {
            this.y = 0;
        }
    }

};
let cnt = 0;
const playerrecord = [];
const players = {};
const colors = [0x00FF00, 0xFF7F00, 0xFFFF00, 0x00FF00, 0x0000FF, 0x4B0082]
socket.on('connect', () => {
    console.log("Hello  i am the players file");
    console.log('Connected', socket.id);
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});

socket.on('lobby-update', (data) => {
    console.log(JSON.stringify(data.squad));
    const OBJ = data.squad;
    console.log("The length of the object is :)", Object.keys(OBJ).length);
    const matrix = [];
    for (let i = 1; i <= Object.keys(OBJ).length; i++) {
        console.log("Hello" + JSON.stringify(OBJ[i.toString()]));
        matrix.push((OBJ[i.toString()]));
    }

    console.log("Displaying the matrix");
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            if (!players[matrix[i][j].socketId]) {
                cnt += 10;
                players[matrix[i][j].socketId] = new Playeractions("Xing", "Past", "Monk", cnt, 0, 0, colors[(cnt / 10) - 1], [], [], 5)
            }
        }
    }
});

const keyMap = {
    u: 'moveUp',
    d: 'moveDown',
    r: 'moveRight',
    l: 'moveLeft',
    f: 'moveForward',
    b: 'moveBackward',
    s: 'rotate',
};
const playerpositions = [];
document.addEventListener('keydown', (event) => {
    if (!players[socket.id]) {

        return;
    }
    const key = event.key.toLowerCase();

    if (keyMap[key] === 'moveUp') {
        console.log("Upward movement");
        players[socket.id].moveUp = true;
    }

    if (keyMap[key] === 'moveDown') {
        console.log("downward movement");
        if (players[socket.id].y >= 1) {
            players[socket.id].moveDown = true;
        }

    fullinfo() {
        console.log(this.name, this.era, this.position, this.movementdynamics);
    }

    if (keyMap[key] === 'moveRight') {
        console.log("rightward movement");
        if (players[socket.id].x <= 99) {
            players[socket.id].moveRight = true;
        }
    }

    if (keyMap[key] === 'moveLeft') {
        console.log("leftward movement")
        if (players[socket.id].x >= -99) {
            players[socket.id].moveLeft = true;
        }

    }
    if (keyMap[key] === 'moveForward') {
        console.log("foward movement");
        if (players[socket.id].z <= 99) {
            players[socket.id].moveForward = true;
const player1 = new Playeractions("Xing", "Past", "Monk", 0, -10, 0, 0xC94F74, [], 45);
const player2 = new Playeractions("Zeus", "Medieval", "Warrior", 0, 0, 0, 0x00ff00, [], 45);
const player3 = new Playeractions("Alex", "Future", "Engineer", 0, 10, 0, 0x9367AB, [], 45);
const player4 = new Playeractions("Xong", "Past", "Monk", 10, -10, 0, 0x9DAB67, [], 45);
const player5 = new Playeractions("Zous", "Medieval", "Warrior", 20, 0, 0, 0x000000, [], 45);
const player6 = new Playeractions("Alegx", "Future", "Engineer", 15, 10, 0, 0x0000ff, [], 45);
const playerrecord = [player1, player2, player3, player4, player5, player6];
let activePlayer = player1;
function willCollide(pos, other) {
    return (
        (Math.abs(pos[0] - other.x) < 1 &&
            Math.abs(pos[1] - other.y) < 2 &&
            Math.abs(pos[2] - other.Z) < 3)
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
                let nextpos = [p.x + 1, p.y, p.Z];
                let canMove = true;
                for (let other of this.playerList) {
                    if (other === p) {
                        continue;
                    }
                    if (willCollide(nextpos, other)) {
                        canMove = false;
                        break;
                    }

                }

                if (canMove) {
                    p.x++;
                }
            }
            if (p.moveLeft) {
                let nextpos = [p.x - 1, p.y, p.Z];
                let canMove = true;
                for (let other of this.playerList) {
                    if (other === p) {
                        continue;
                    }
                    if (willCollide(nextpos, other)) {
                        canMove = false;
                        break;
                    }
                }
                if (canMove) {
                    p.x--;
                }
            }
            if (p.moveForward) {
                let nextpos = [p.x, p.y, p.Z - 1];
                let canMove = true;
                for (let other of this.playerList) {
                    if (other === p) {
                        continue;
                    }

                    if (willCollide(nextpos, other)) {
                        canMove = false;
                        break;
                    }
                }

                if (canMove) {
                    p.Z--;
                }
            }
            if (p.moveBackward) {
                let nextpos = [p.x, p.y, p.Z + 1];
                let canMove = true;
                for (let other of this.playerList) {
                    if (other === p) { 
                        continue;
                    }
                    if (willCollide(nextpos, other)) {
                        canMove = false;
                        break;
                    }

                }
                if (canMove) {
                    p.Z++;
                }
            }
            if (p.moveUp) {
                let nextpos = [p.x, p.y + 1, p.Z];
                let canMove = true;
                for (let other of this.playerList) {
                    if (other === p) {
                        continue;
                    }
                    if (willCollide(nextpos, other)) {
                        canMove = false;
                        break;
                    }
                }

                if (canMove) {
                    p.y++;
                }
            }
            if (p.moveDown) {
                let nextpos = [p.x, p.y - 1, p.Z]
                let canMove = true;
                for (let other of this.playerList) {
                    if (other === p) {
                        continue;
                    }

                    if (willCollide(nextpos, other)) {
                        canMove = false;
                        break;
                    }
                }
                if (canMove) {
                    p.y--;
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
    if (keyMap[key] === 'moveBackward') {
        console.log("down ward movement");
        if (players[socket.id].z >= -99) {
            players[socket.id].moveBackward = true;
        }
    }

});

document.addEventListener('keyup', (event) => {
    if (!players[socket.id]) {
        return;
    }
    const key = event.key.toLowerCase();

    if (key !== undefined) {
        players[socket.id][keyMap[key]] = false;
    }

})

const canvas = document.getElementById('gameCanvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

window.addEventListener('resize', () => {
    PerspectiveCamera.aspect = window.innerWidth / window.innerHeight;
    PerspectiveCamera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
});
const velocity = 15;
const targetPosition = new THREE.Vector3();
const lookAtTarget = new THREE.Vector3();
const clock = new THREE.Clock();



function willcollide(currc = [], othercoordinates = []) {
    if (Math.abs(currc[0] - othercoordinates[0]) < 1 &&
        Math.abs(currc[1] - othercoordinates[1]) < 2 &&
        Math.abs(currc[2] - othercoordinates[2]) < 3) {
        return true;
    }
    return false;
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
    const delta = clock.getDelta();
    requestAnimationFrame(animate);
    if (!players[socket.id]) {
        renderer.render(Scene, PerspectiveCamera);
        return;
    }
    players[socket.id].hpDiv.textContent = players[socket.id].health[0];
    if (players[socket.id].moveDown) {
        let canmove = true;
        let newpos = [players[socket.id].x, players[socket.id].y - velocity * delta, players[socket.id].z];
        for (const it in players) {
            let newarr = [
                players[it].x,
                players[it].y,
                players[it].z
            ];
            if (it === socket.id) continue;
            if (willcollide(newpos, newarr)) {
                canmove = false;
                break;
            }
        }

        if (canmove) {
            players[socket.id].y -= velocity * delta;
        }
    }
    if (players[socket.id].moveUp) {
        let canmove = true;
        let newpos = [players[socket.id].x, players[socket.id].y + velocity * delta, players[socket.id].z];
        for (const it in players) {
            let newarr = [
                players[it].x,
                players[it].y,
                players[it].z
            ];
            if (it === socket.id) continue;
            if (willcollide(newpos, newarr)) {
                canmove = false;
                break;
            }
        }
        if (canmove) {
            players[socket.id].y += velocity * delta;
        }
    }
    if (players[socket.id].moveForward) {
        let canmove = true;
        let newpos = [players[socket.id].x, players[socket.id].y, players[socket.id].z + velocity * delta];
        for (const it in players) {
            let newarr = [
                players[it].x,
                players[it].y,
                players[it].z
            ];
            if (it === socket.id) continue;
            if (willcollide(newpos, newarr)) {
                canmove = false;
                break;
            }
        }
        if (canmove) {
            players[socket.id].z += velocity * delta;
        }
    }
    if (players[socket.id].moveBackward) {
        let canmove = true;
        let newpos = [players[socket.id].x, players[socket.id].y, players[socket.id].z - velocity * delta];

        for (const it in players) {
            let newarr = [
                players[it].x,
                players[it].y,
                players[it].z
            ];
            if (it === socket.id) continue;
            if (willcollide(newpos, newarr)) {
                canmove = false;
                break;
            }
        }

        if (canmove) {
            players[socket.id].z -= velocity * delta;
        }
    }
    if (players[socket.id].moveLeft) {
        let newpos = [players[socket.id].x - velocity * delta, players[socket.id].y, players[socket.id].z];
        let canmove = true;
        for (const it in players) {
            let newarr = [
                players[it].x,
                players[it].y,
                players[it].z
            ];
            if (it === socket.id) continue;
            if (willcollide(newpos, newarr)) {
                canmove = false;
                break;
            }
        }
        if (canmove) {
            players[socket.id].x -= velocity * delta;
        }
    }
    if (players[socket.id].moveRight) {

        let newpos = [players[socket.id].x + velocity * delta, players[socket.id].y, players[socket.id].z];
        let canmove = true;
        for (const it in players) {
            let newarr = [
                players[it].x,
                players[it].y,
                players[it].z
            ];
            if (it === socket.id) continue;
            if (willcollide(newpos, newarr)) {
                canmove = false;
                break;
            }
        }
        if (canmove) {
            players[socket.id].x += velocity * delta;
        }
    }
    players[socket.id].gravity(delta);
    players[socket.id].player.position.set(players[socket.id].x, players[socket.id].y, players[socket.id].z);

    if (playerpositions.length > 10) {
        playerpositions.shift();
    }
    playerpositions.push([players[socket.id].x, players[socket.id].y, players[socket.id].z]);
    const offset = new THREE.Vector3(0, 5, -15);
    targetPosition.set(players[socket.id].x, players[socket.id].y, players[socket.id].z).add(offset);
    PerspectiveCamera.position.lerp(targetPosition, 0.05);
    lookAtTarget.set(players[socket.id].x, players[socket.id].y, players[socket.id].z);
    PerspectiveCamera.lookAt(lookAtTarget);
    const offset = new THREE.Vector3(0, 5, 10);
    const targetPosition = new THREE.Vector3(activePlayer.x, activePlayer.y, activePlayer.Z).add(offset);
    PerspectiveCamera.position.lerp(targetPosition, 0.1);
    PerspectiveCamera.lookAt(activePlayer.x, activePlayer.y, activePlayer.Z);
    renderer.render(Scene, PerspectiveCamera);
    labelRenderer.render(Scene, PerspectiveCamera);
}
function network() {
    if (!players[socket.id]) {
        return;
    }
    socket.emit("update-movement", {
        x: players[socket.id].x,
        y: players[socket.id].y,
        z: players[socket.id].z,
    },);
}
socket.on('movement', (data) => {
    const id = data.id;
    const pos = data.pos;
    if (!players[id]) {
        return;
    }
    players[id].x = pos.x;
    players[id].y = pos.y;
    players[id].z = pos.z;
    players[id].player.position.set(players[id].x, players[id].y, players[id].z);
animate();
//For collision we need the current coordinates of each player not just the active player

})
setInterval(() => network(), 100);
animate();
