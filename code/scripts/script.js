/* Program: script.js
 * Programmer: Leonard Michel
 * Start Date: 25.07.2021
 * Last Change:
 * End Date: /
 * License: /
 * Version: 0.0.0.0
*/

/**** INITIALIZATION ****/

const SCREEN_WIDTH = 512;
const SCREEN_HEIGHT = 512;

let canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = SCREEN_WIDTH;
canvas.height = SCREEN_HEIGHT;

// Flip the canvas' y-axis
ctx.scale(1, -1);

/* Event listener definitions */
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler()
{
}

function keyUpHandler()
{
}

/* Class definitions */
class Player
{
    constructor()
    {
        // x, y, z
        this.pos = [1, 1, 1];
        // The vertices of the player's mesh. A cube
        // ftl, ftr,fbr, fbl, btl, btr, bbr, bbl
        // front-top-left, front-top-right, front-bottom-right, front-bottom-left, back-top-left, back-top-right, back-bottom-right, back-bottom-left
        this.points = [-1,  1, -1,
                   1,  1, -1,
                   1, -1, -1,
                  -1, -1, -1,
                  -1,  1, -1,
                   1,  1, -1,
                   1, -1, -1,
                  -1, -1, -1];
        // Front, left, back, right, top, bottom face.
        this.quads = [0, 1, 2, 3,
                      0, 3, 7, 4,
                      4, 7, 6, 5,
                      5, 6, 2, 1,
                      4, 5, 1, 0,
                      7, 6, 2, 3];
        // The player's transformation matrix.
        this.mat = [];
        this.ang = 0;
    }

    getInput()
    {
    }

    update()
    {
        this.getInput()

        this.ang += 1 * (Math.PI / 180);
        let s = Math.sin(this.ang);
        let c = Math.cos(this.ang);
        this.mat = [c, 0, -s, 0,
                    0, 1,  0, 0,
                    s, 0,  c, 4];

        ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
        this.draw(this.points, this.quads, this.mat);
        console.log("finished drawing\n\n\n\n\n\n\n\n");
    }

    draw(ps, qs, m)
    {
        for (let i = 0; i < qs.length; i += 4)
        {
            let p0 = qs[i    ] * 4,
                p1 = qs[i + 1] * 4,
                p2 = qs[i + 2] * 4,
                p3 = qs[i + 3] * 4;
            let a = this.vertexShader(ps[p0], ps[p0 + 1], ps[p0 + 2], m);
            let b = this.vertexShader(ps[p1], ps[p1 + 1], ps[p1 + 2], m);
            let c = this.vertexShader(ps[p2], ps[p2 + 1], ps[p2 + 2], m);
            let d = this.vertexShader(ps[p3], ps[p3 + 1], ps[p3 + 2], m);
            this.fragmentShader(a, b, c, d);
        }
    }

    vertexShader(x, y, z, m)
    {
        var x0 = m[0] * x + m[1] * y + m[ 2] * z + m[ 3];
        var y0 = m[4] * x + m[5] * y + m[ 6] * z + m[ 7];
        var z0 = m[8] * x + m[9] * y + m[10] * z + m[11];
        return [x0, y0, z0];
    }

    fragmentShader(a, b, c, d)
    {
        let x0 = 100 + 300 * a[0] / a[2], y0 = -100 + 300 * a[1] / a[2];
        let x1 = 100 + 300 * b[0] / b[2], y1 = -100 + 300 * b[1] / b[2];
        let x2 = 100 + 300 * c[0] / c[2], y2 = -100 + 300 * c[1] / c[2];
        let x3 = 100 + 300 * d[0] / d[2], y3 = -100 + 300 * d[1] / d[2];

        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x3, y3);
        ctx.lineTo(x0, y0);
        ctx.stroke();
        console.log("fragment drawn\n");
    }
}

// x, y, z so the player can move three units on the x- and y- axis but not on the z-axis relative to the play field.
let playFieldSize = [3, 3, 0];
// The position of the play field in which the player moves relative to the origin.
let playFieldPos = [-1.5, -1.5, -10];

// Time variables
let tp1 = Date.now();
let tp2 = Date.now();
let elapsedTime = 0;

let player = new Player;

// The game loop
window.main = function()
{
    window.requestAnimationFrame(main);
    // Get elapsed time for last tick.
    tp2 = Date.now();
    elapsedTime = tp2 - tp1;
    //console.log("elapsedTime:" + elapsedTime + "\n");
    tp1 = tp2;

    player.update();
}

// Start the game loop
main();

