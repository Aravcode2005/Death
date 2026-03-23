
//import { controls } from "./movement";
class Player {
    Name;
    Era;
    Position;
    Player(name, era, position) {
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
    controls = () => {
        document.addEventListener("keydown", (event) => {
            const keyName = event.key;
            if (keyName === 'U') {
                this.y += 1;

            }
            if (keyName === 'D') {
                this.y -= 1;
            }
            if (keyName === 'R') {
                this.x += 1;

            }
            if (keyName === 'L') {
                this.x -= 1;

            }
        })
    }

    fullinfo() {
        console.log( [this.x,this.y]);
    }
}
const player1 = new Playeractions("Xing", "Past", "Scout");
   player1.controls();
setInterval(() => {
    player1.fullinfo();
}, 1000);



