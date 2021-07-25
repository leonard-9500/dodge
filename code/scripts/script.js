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
        this.edges = [];
        // Front, left, back, right, top, bottom face.
        this.quads = [0, 1, 2, 3,
                      0, 3, 7, 4,
                      4, 7, 6, 5,
                      5, 6, 2, 1,
                      4, 5, 1, 0,
                      7, 6, 2, 3];
        // The points in screen space
        this.pointsSP = [];
        // The player's transformation matrix.
        let mat = [];
    }

    getInput()
    {
    }

    update()
    {
        let ang = 30* (Math.PI / 180);
        let s = Math.sin(ang);
        let c = Math.cos(ang);

        this.draw(points, quads, m);

        for (let i = 0; i < this.points.length/3; i++)
        {
            this.pointsSP[i*3] = this.points[i*3]/this.points[i*3 + 2];
            this.pointsSP[i * 3 + 1] = this.points[i * 3 + 1] / this.points[i * 3 + 2];
            this.pointsSP[i*3 + 2] = 1;
        }
        console.log(this.pointsSP);
    }

    draw(ps, ts, m)
    {
        for (let i = 0; i < ts.length; i += 3)
        {
            let p0 = ts[i]*3, p1 = ts[i+1]*3, p2 = ts[i+2]*3;
            let a = vertexShader(ps[p0], ps[p0 + 1], ps[p0 + 2], m);
            let b = vertexShader(ps[p1], ps[p1 + 1], ps[p1 + 2], m);
            let c = vertexShader(ps[p2], ps[p2 + 1], ps[p2 + 2], m);
            fragmentShader(a, b, c);
        }
        // Draw faces
        /*
        for (let i = 0; i < this.faces.length/4; i++)
        {
            ctx.beginPath();
            ctx.moveTo(this.pointsSP[this.faces[i]     * i] * 100, this.pointsSP[this.faces[i]     * i + 1] * 100);
            ctx.lineTo(this.pointsSP[this.faces[i + 1] * i] * 100, this.pointsSP[this.faces[i + 1] * i + 1] * 100);
            ctx.lineTo(this.pointsSP[this.faces[i + 2] * i] * 100, this.pointsSP[this.faces[i + 2] * i + 1] * 100);
            ctx.lineTo(this.pointsSP[this.faces[i + 3] * i] * 100, this.pointsSP[this.faces[i + 3] * i + 1] * 100);
            ctx.lineTo(this.pointsSP[this.faces[i]     * i] * 100, this.pointsSP[this.faces[i    ] * i + 1] * 100);
            ctx.stroke();
        }
        */
        /* draw points
        for (let i = 0; i < this.points.length/3; i++)
        {
            ctx.fillRect(this.pointsSP[i*3]*100, this.pointsSP[i*3+1]*100, 8, 8);
        }
        */
    }

    vertexShader(x, y, z, m)
    {
        var x0 = m[0] * x + m[1] * y + m[ 2] * z + m[ 3];
        var y0 = m[4] * x + m[5] * y + m[ 6] * z + m[ 7];
        var z0 = m[8] * x + m[9] * y + m[10] * z + m[11];
        return x0, y0, z0;
    }

    fragmentShader(a, b, c)
    {
        let x0 = 200 + 300 * a[0] / a[2], y0 = 150 + 300 * a[1] / a[2];
        let x1 = 200 + 300 * b[0] / b[2], y1 = 150 + 300 * b[1] / b[2];
        let x2 = 200 + 300 * c[0] / c[2], y2 = 150 + 300 * c[1] / c[2];

        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x0, y0);
        ctx.stroke();
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

    player.getInput();
    player.update();
    player.draw();
}

// Start the game loop
main();

