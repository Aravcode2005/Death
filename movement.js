
export function controls(x, y, log = [x, y]) {
    document.addEventListener("keydown", function (event) {
        const keyName = event.key;
        if (keyName === 'U') {
            y += 1;
            x = x;
            log[1] += 1;
        }
        if (keyName === 'D') {
            y -= 1;
            x = x;
            log[1] -= 1;
        }
        if (keyName === 'R') {
            x += 1;
            log[0] += 1;
        }
        if (keyName === 'L') {
            x -= 1;
            log[0] -= 1;
        }
    })
    console.log("X", log[0]);
    console.log("Y", log[1]);
}

