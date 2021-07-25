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
//ctx.scale(1, -1);

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
        this.pos = [0, 0, 2];
        // The vertices of the player's mesh. A cube
        // ftl, ftr,fbr, fbl, btl, btr, bbr, bbl
        // front-top-left, front-top-right, front-bottom-right, front-bottom-left, back-top-left, back-top-right, back-bottom-right, back-bottom-left
        this.points = [-1,  1, -1,
                        1,  1, -1,
                        1, -1, -1,
                       -1, -1, -1,
                       -1,  1,  1,
                        1,  1,  1,
                        1, -1,  1,
                       -1, -1,  1];
        // front-bottom-left (origin), front-top-left, front-top-right, front-bottom-right, back-bottom-left, back-top-left, back-top-right, back-bottom-right
        // This has the origin in the front bottom left corner just like the collision detection uses.
        /*
        this.points = [0, 0, 0,
                       0, 1, 0,
                       1, 1, 0,
                       1, 0, 0,
                       0, 0, 1,
                       0, 1, 1,
                       1, 1, 1,
                       1, 0, 1];
        */
        // Front, left, back, right, top, bottom face.
        this.quads = [0, 1, 2, 3,
                      0, 3, 7, 4,
                      4, 7, 6, 5,
                      5, 6, 2, 1,
                      4, 5, 1, 0,
                      7, 6, 2, 3];
        // The points projected onto the viewing plane.
        this.pointsVP = [];
    }

    getInput()
    {
    }

    update()
    {
        this.getInput();
        this.draw();
        console.log("finished drawing\n\n\n\n\n\n\n\n");
    }

    draw()
    {
        ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

        // Project points onto viewing plane
        for (let i = 0; i < this.points.length / 3; i++) {
            // x
            this.pointsVP[i * 3] = (this.points[i * 3] + this.pos[0]) / (this.points[i * 3 + 2] + this.pos[2]);
            // y
            this.pointsVP[i * 3 + 1] = (this.points[i * 3 + 1] + this.pos[1]) / (this.points[i * 3 + 2] + this.pos[2]);
            // z
            this.pointsVP[i * 3 + 2] = 1;
        }
        console.log(this.pointsVP);

        // Draw all 6 quads
        for (let i = 0; i < this.quads.length/4; i++)
        {
            ctx.beginPath();
            // SCREEN_HEIGHT -  flips the y-axis of the canvas.
            ctx.moveTo(originCX + this.pointsVP[this.quads[i * 4    ]  * 3] * zoom, -originCY + SCREEN_HEIGHT - this.pointsVP[this.quads[i * 4    ]  * 3 + 1 ] * zoom);
            ctx.lineTo(originCX + this.pointsVP[this.quads[i * 4 + 1]  * 3] * zoom, -originCY + SCREEN_HEIGHT - this.pointsVP[this.quads[i * 4 + 1]  * 3 + 1 ] * zoom);
            ctx.lineTo(originCX + this.pointsVP[this.quads[i * 4 + 2]  * 3] * zoom, -originCY + SCREEN_HEIGHT - this.pointsVP[this.quads[i * 4 + 2]  * 3 + 1 ] * zoom);
            ctx.lineTo(originCX + this.pointsVP[this.quads[i * 4 + 3]  * 3] * zoom, -originCY + SCREEN_HEIGHT - this.pointsVP[this.quads[i * 4 + 3]  * 3 + 1 ] * zoom);
            ctx.lineTo(originCX + this.pointsVP[this.quads[i * 4    ]  * 3] * zoom, -originCY + SCREEN_HEIGHT - this.pointsVP[this.quads[i * 4    ]  * 3 + 1 ] * zoom);
            ctx.stroke();
        }
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

let zoom = 100;
// The position of the origin on the canvas. This centers the origin on the canvas.
let originCX = 256;
let originCY = 256;
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

