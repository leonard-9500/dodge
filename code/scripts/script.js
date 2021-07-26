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
// Show debug information like variable values for the player.
const debugMode = true;
const projectionType = "perspective";

let canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = SCREEN_WIDTH;
canvas.height = SCREEN_HEIGHT;

// Flip the canvas' y-axis
//ctx.scale(1, -1);

/* Event listener definitions */
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

let leftPressed = false,
    rightPressed = false,
    upPressed = false,
    downPressed = false;
// If the user has just moved the player this becomes true and the user may only gain the ability to move the player again by first releasing the move button.
let leftPressedBefore  = false,
    rightPressedBefore = false,
    upPressedBefore    = false,
    downPressedBefore  = false;

function keyDownHandler(e)
{
    if (e.code == "KeyA") { leftPressed  = true; }
    if (e.code == "KeyD") { rightPressed = true; }
    if (e.code == "KeyW") { upPressed    = true; }
    if (e.code == "KeyS") { downPressed  = true; }
}

function keyUpHandler(e)
{
    if (e.code == "KeyA") { leftPressed  = false; }
    if (e.code == "KeyD") { rightPressed = false; }
    if (e.code == "KeyW") { upPressed    = false; }
    if (e.code == "KeyS") { downPressed  = false; }
}

/* Class definitions */
class Player
{
    constructor()
    {
        // x, y, z
        this.pos = [0, 0, 0];
        this.rot = [0, 0, 0];
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
        this.points = [-0.5,  0.5, -0.5,
                        0.5,  0.5, -0.5,
                        0.5, -0.5, -0.5,
                       -0.5, -0.5, -0.5,
                       -0.5,  0.5,  0.5,
                        0.5,  0.5,  0.5,
                        0.5, -0.5,  0.5,
                       -0.5, -0.5,  0.5];
        // Front, left, back, right, top, bottom face.
        this.quads = [0, 1, 2, 3,
                      0, 3, 7, 4,
                      4, 7, 6, 5,
                      5, 6, 2, 1,
                      4, 5, 1, 0,
                      7, 6, 2, 3];
        // The points projected onto the viewing plane.
        this.pointsVP = [];
        // How long is the break between player movement, in ms. So the user has to wait 100ms after moving, before he can move again.
        this.moveInterval = 100;
        this.moveTick = Date.now();
        this.color = "#000000";
        // Experimental
        this.rotatedPoints = this.points;
        // Rotate
        for (let i = 0; i < this.points.length / 3; i++)
        {
            // For player rotation about the y-axis
            // If you uncomment these two lines, the this.points array will get changed for some reason.
            //this.rotatedPoints[i * 3] = this.points[i * 3] + Math.sin(this.rot[1] * Math.PI / 180);
            //this.rotatedPoints[i * 3 + 2] = this.points[i * 3 + 2] + Math.cos(this.rot[1] * Math.PI / 180);
        }
    }

    handleInput()
    {
        // Only move the player if the wait time has been passed.
        if (tp1 - this.moveTick >= this.moveInterval)
        {
            console.log("Wait time has been passed\n");
            console.log(tp1 - this.moveTick + "\n");

            if (leftPressed)
            {
                // This has the effect that the user must first release one of the move buttons before making another move. He cannot continuously move the player
                // by holding down a move button. This makes the movement easier by eliminating accidental double steps due to holding the move button down too long.
                // This is the setting for all 4 move directions.
                if (leftPressedBefore == false)
                {
                    // Move only if player won't be out of bounds then.
                    if (this.pos[0] > 0)
                    {
                        this.pos[0] -= 1;
                        leftPressedBefore = true;

                        this.moveTick = Date.now();
                    }
                }
            }
            if (leftPressed == false)
            {
                leftPressedBefore = false;
            }

            if (rightPressed)
            {
                if (rightPressedBefore == false)
                {
                    // Move only if player won't be out of bounds then.
                    if (this.pos[0] < playFieldSize[0]-1)
                    {
                        this.pos[0] += 1;
                        rightPressedBefore = true;

                        this.moveTick = Date.now();
                    }
                }
            }
            if (rightPressed == false)
            {
                rightPressedBefore = false;
            }

            if (upPressed)
            {
                if (upPressedBefore == false)
                {
                    // Move only if player won't be out of bounds then.
                    if (this.pos[1] < playFieldSize[1] - 1)
                    {
                        this.pos[1] += 1;
                        upPressedBefore = true;

                        this.moveTick = Date.now();
                    }
                }
            }
            if (upPressed == false)
            {
                upPressedBefore = false;
            }

            if (downPressed)
            {
                if (downPressedBefore == false)
                {
                    // Move only if player won't be out of bounds then.
                    if (this.pos[1] > 0)
                    {
                        this.pos[1] -= 1;
                        downPressedBefore = true;

                        this.moveTick = Date.now();
                    }
                }
            }
            if (downPressed == false)
            {
                downPressedBefore = false;
            }
        }
    }

    collisionDetection()
    {
        // If the closest enemy and the player have the same x- and y-values and if the enemy is within the player along the z-axis.
        if (enemy.enemies[0] == this.pos[0] && enemy.enemies[1] == this.pos[1] &&
            enemy.enemies[2] > this.pos[2] && enemy.enemies[2] < this.pos[2] + 1)
        {
            this.color = "#ff0000";
        }
        else
        {
            this.color = "#000000";
        }
    }

    update()
    {
        this.handleInput();
        this.collisionDetection();

        this.draw();
        //console.log("finished drawing\n\n\n\n\n\n\n\n");
    }

    draw()
    {
        this.pointsVP = vertexShader(this.points, this.pos, camera.pos);
        fragmentShader(this.pointsVP, this.quads, zoom, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, this.color);

        // Show debug information
        if (debugMode)
        {
            ctx.font = "12px sans-serif";
            ctx.fillText("Player World Coordinate X: " + player.pos[0], 0, 15);
            ctx.fillText("Player World Coordinate Y: " + player.pos[1], 0, 30);
            ctx.fillText("Player World Coordinate Z: " + player.pos[2], 0, 45);

            ctx.fillText("Camera World Coordinate X: " + camera.pos[0], 0, 75);
            ctx.fillText("Camera World Coordinate Y: " + camera.pos[1], 0, 90);
            ctx.fillText("Camera World Coordinate Z: " + camera.pos[2], 0, 105);
        }
    }
}

class Enemy
{
    constructor()
    {
        this.points = [-1,  1, -1,
                        1,  1, -1,
                        1, -1, -1,
                       -1, -1, -1,
                       -1,  1,  1,
                        1,  1,  1,
                        1, -1,  1,
                       -1, -1,  1];
        this.points = [-0.5,  0.5, -0.5,
                        0.5,  0.5, -0.5,
                        0.5, -0.5, -0.5,
                       -0.5, -0.5, -0.5,
                       -0.5,  0.5,  0.5,
                        0.5,  0.5,  0.5,
                        0.5, -0.5,  0.5,
                       -0.5, -0.5,  0.5];
        this.quads = [0, 1, 2, 3,
                      0, 3, 7, 4,
                      4, 7, 6, 5,
                      5, 6, 2, 1,
                      4, 5, 1, 0,
                      7, 6, 2, 3];
        // The points projected onto the viewing plane.
        this.pointsVP = [];
        // An array of x, y, z triplets that each correspond to one enemy.
        this.enemies = [];
        // The current number of enemy blocks in the level
        this.count = 0;
        this.maxCount = 10;
        // After how many ms seconds can another enemy spawn
        this.spawnInterval = 1000;
        this.spawnTick = Date.now();
        this.enemySpeed = 0.001;
        this.color = "#000000";
        this.spawnLastX = 0;
        this.spawnLastY = 0;
        // Allow the enemy class to randomly spawn blocks that have the same x- and y-values.
        this.consecutiveCoordinates = false;
    }

    update()
    {
        if (this.count != 0)
        {
            for (let i = 0; i < this.count; i++)
            {
                this.enemies[i * 3 + 2] -= this.enemySpeed * elapsedTime;
            }
        }

        // Spawn new enemy if wait time has been passed.
        if (this.count < this.maxCount)
        {
            if (tp1 - this.spawnTick >= this.spawnInterval)
            {
                console.log("Wait time has been passed\n");
                console.log(tp1 - this.spawnTick + "\n");
                this.spawnTick = Date.now();
                // Set the enemies x and y coordinates randomly within the play field
                if (this.consecutiveCoordinates)
                {
                    this.enemies[this.count * 3    ] = this.getRandomIntInclusive(0, playFieldSize[0] - 1);
                    this.enemies[this.count * 3 + 1] = this.getRandomIntInclusive(0, playFieldSize[1] - 1);
                }
                // Set the enemy's x or y coordinate to a different value than the previous enemy's.
                else if (this.consecutiveCoordinates == false)
                {
                    this.enemies[this.count * 3] = this.spawnLastX;
                    this.enemies[this.count * 3 + 1] = this.spawnLastY;

                    // Set the currently spawned enemy's x- and y-coordinates randomly until they are not the same as the last enemy's x- or y-coordinate.
                    while (this.enemies[this.count * 3] == this.spawnLastX || this.enemies[this.count * 3 + 1] == this.spawnLastY)
                    {
                        this.enemies[this.count * 3] = this.getRandomIntInclusive(0, playFieldSize[0] - 1);
                        this.enemies[this.count * 3 + 1] = this.getRandomIntInclusive(0, playFieldSize[1] - 1);
                    }

                    this.spawnLastX = this.enemies[this.count * 3    ];
                    this.spawnLastY = this.enemies[this.count * 3 + 1];
                }
                // Let the enemy spawn 10 units away from the origin.
                this.enemies[this.count * 3 + 2] = 10;

                this.count += 1;
                console.log("enemy added\n");
                //console.log(this.enemies);
            }
        }

        // Remove enemies that are behind the play field
        if (this.enemies[2] < 0)
        {
            // Delete the coordinates of the nearest enemy (the first 3 values: x, y and z) and reindex the array.
            this.enemies.splice(0, 3);
            this.count -= 1;
            console.log("Removed enemy.\n");
        }

        this.draw();
    }

    draw()
    {
        //ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

        
        if (this.count != 0)
        {
            // Render each enemy from back to front relative to the origin.
            for (let n = this.count; n > 0; n--)
            {
                // Let pos contain the current enemy's coordinates.
                let pos = [this.enemies[n * 3 - 3], this.enemies[n * 3 - 2], this.enemies[n * 3 - 1]];

                this.pointsVP = vertexShader(this.points, pos, camera.pos);
                fragmentShader(this.pointsVP, this.quads, zoom, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, this.color);
            }
        }
    }

    getRandomIntInclusive(min, max)
    {
        min = Math.ceil(min);
        max = Math.floor(max);
        // The maximum and minimun are inclusive
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
}

class Camera
{
    constructor()
    {
        this.pos = [0, 0, -1];
    }
}

/* Function definitions */
// p = array of points in 3 dimensions like [x, y, z]
function vertexShader(p, objPos, camPos)
{
    // The object's points coordinates relative to the camera and the object's position. So it goes through world space and ends in camera space.
    let pC = [];

    // Move points so they are relative to the camera
    for (let i = 0; i < p.length / 3; i++)
    {
        // x
        pC[i * 3] = p[i * 3] + objPos[0] - camPos[0];
        // y
        pC[i * 3 + 1] = p[i * 3 + 1] + objPos[1] - camPos[1];
        // z
        pC[i * 3 + 2] = p[i * 3 + 2] + objPos[2] - camPos[2];
    }

    // The object's points coordinates in screen space.
    let pS = [];

    // Lines that are parallel in 3d converge in 2d.
    if (projectionType == "perspective")
    {
        // Project points onto viewing plane
        for (let i = 0; i < p.length / 3; i++)
        {
            // x
            pS[i * 3] = pC[i * 3] / pC[i * 3 + 2];
            // y
            pS[i * 3 + 1] = pC[i * 3 + 1] / pC[i * 3 + 2];
            // z
            pS[i * 3 + 2] = 1;
        }
    }
    // Experimental. The results of this are better looked at when camera angles are implemented.
    // Lines that are parallel in 3d stay parallel in 2d.
    else if (projectionType == "orthographic")
    {
        // Project points onto viewing plane
        for (let i = 0; i < p.length / 3; i++)
        {
            // x
            pS[i * 3] = pC[i * 3] / 1;
            // y
            pS[i * 3 + 1] = pC[i * 3 + 1] / 1;
            // z
            pS[i * 3 + 2] = 1;
        }
    }

    return pS;
}

function fragmentShader(p, q, z, offsetX, offsetY, color)
{
    ctx.strokeStyle = color;
    for (let i = 0; i < q.length / 4; i++)
    {
        // The vertices of the current quad to be drawn.
        let a = q[i * 4],
            b = q[i * 4 + 1],
            c = q[i * 4 + 2],
            d = q[i * 4 + 3];
        ctx.beginPath();
        ctx.moveTo(offsetX + p[a * 3] * z, -offsetY + SCREEN_HEIGHT - p[a * 3 + 1] * z);
        ctx.lineTo(offsetX + p[b * 3] * z, -offsetY + SCREEN_HEIGHT - p[b * 3 + 1] * z);
        ctx.lineTo(offsetX + p[c * 3] * z, -offsetY + SCREEN_HEIGHT - p[c * 3 + 1] * z);
        ctx.lineTo(offsetX + p[d * 3] * z, -offsetY + SCREEN_HEIGHT - p[d * 3 + 1] * z);
        ctx.lineTo(offsetX + p[a * 3] * z, -offsetY + SCREEN_HEIGHT - p[a * 3 + 1] * z);
        ctx.stroke();
    }
}

// Time variables
let tp1 = Date.now();
let tp2 = Date.now();
let elapsedTime = 0;

let player = new Player;
let camera = new Camera;
camera.pos[0] = 1;
camera.pos[1] = 1;
let enemy = new Enemy;

let zoom = 100;
// The position of the origin on the canvas. This centers the origin on the canvas.
let originCX = 256;
let originCY = 256;

// x, y, z so the player can move three units on the x- and y- axis but not on the z-axis relative to the play field.
let playFieldSize = [3, 3, 0];
// The position of the play field in which the player moves relative to the origin.
let playFieldPos = [0, 0, 0];

// The game loop
window.main = function()
{
    window.requestAnimationFrame(main);
    // Get elapsed time for last tick.
    tp2 = Date.now();
    elapsedTime = tp2 - tp1;
    //console.log("elapsedTime:" + elapsedTime + "\n");
    tp1 = tp2;

    ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    enemy.update();
    player.update();
}

// Start the game loop
main();

