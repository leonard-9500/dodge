/* Program: script.js
 * Programmer: Leonard Michel
 * Start Date: 25.07.2021
 * Last Change:
 * End Date: /
 * License: /
 * Version: 0.0.0.0
*/

/**** INITIALIZATION ****/

const SCREEN_WIDTH = 1280;
const SCREEN_HEIGHT = 720;
// Show debug information like variable values for the player.
const debugMode = true;
const projectionType = "perspective";
const radians = Math.PI / 180;

let canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = SCREEN_WIDTH;
canvas.height = SCREEN_HEIGHT;

// Flip the canvas' y-axis
//ctx.scale(1, -1);

/* Event listener definitions */
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

let leftPressed  = false,
    rightPressed = false,
    upPressed    = false,
    downPressed  = false,
    spacePressed = false;
// If the user has just moved the player this becomes true and the user may only gain the ability to move the player again by first releasing the move button.
let leftPressedBefore  = false,
    rightPressedBefore = false,
    upPressedBefore    = false,
    downPressedBefore  = false,
    spacePressedBefore = false;

function keyDownHandler(e)
{
    if (e.code == "KeyA") { leftPressed  = true; }
    if (e.code == "KeyD") { rightPressed = true; }
    if (e.code == "KeyW") { upPressed    = true; }
    if (e.code == "KeyS") { downPressed  = true; }
    if (e.code == "Space") { spacePressed = true; }
}

function keyUpHandler(e)
{
    if (e.code == "KeyA") { leftPressed  = false; }
    if (e.code == "KeyD") { rightPressed = false; }
    if (e.code == "KeyW") { upPressed    = false; }
    if (e.code == "KeyS") { downPressed  = false; }
    if (e.code == "Space") { spacePressed = false; }
}

/* Class definitions */
class Sun
{
    constructor()
    {
        this.pos = [0, 0, 0];
        this.rot = [0, 0, 0];
        this.intensity = 1.0;
        this.color = "#ffffff";
    }
}

class Cube
{
    constructor()
    {
        // x, y, z
        this.pos = [0, 0, 0];
        this.rot = [0, 0, 0];
        // Don't rename this to "scale". JS won't be able to call the below function as it's called "scale".
        this.scl = [1, 1, 1];
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
        this.faceColor = "#bbbbbb";
        this.edgeColor = "#000000";
        // Render the object as solid (true) or wireframe (false)
        this.renderSolid = true;
        this.renderWireframe = false;
    }

    update()
    {
        this.draw();
    }

    draw()
    {
        this.pointsVP = vertexShader(this.points, this.rot, this.pos, camera.pos, camera.rot);
        fragmentShader(this.pointsVP, this.quads, zoom, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, this.faceColor, this.edgeColor, this.renderSolid, this.renderWireframe, this.pos);
    }

    scale(sx, sy, sz)
    {
        for (let i = 0; i < this.points.length / 3; i++)
        {
            this.points[i * 3]     *= sx;
            this.points[i * 3 + 1] *= sy;
            this.points[i * 3 + 2] *= sz;
        }
    }

    reset()
    {
        // x, y, z
        this.pos = [0, 0, 0];
        this.rot = [0, 0, 0];
        this.scale = [1, 1, 1];
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
        this.color = "#000000";
        // Render the object as solid (true) or wireframe (false)
        this.renderSolid = false;
    }
}

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
        this.lastHitTick = Date.now();
        this.hit = false;
        this.faceColor = "#000000";
        this.edgeColor = "#ffca38";
        this.score = 0;
        this.lives = 3;
        this.gameOver = false;
        // Render the object as solid
        this.renderSolid = false;
        // Render the object as wireframe. These can also both be true.
        this.renderWireframe = true;
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

        if (spacePressed)
        {
            if (this.gameOver)
            {
                // Reset the game
                this.reset();
                enemy.reset();
            }
        }
    }

    collisionDetection()
    {
        // If the closest enemy and the player have the same x- and y-values and if the enemy is within the player along the z-axis.
        if (enemy.enemies[0] == this.pos[0] && enemy.enemies[1] == this.pos[1] &&
            enemy.enemies[2] > this.pos[2] && enemy.enemies[2] < this.pos[2] + 1)
        {
            // Only subtract a live once for every enemy. Without this if, the player's live would get taken away within three consecutive ticks.
            if (Date.now() - this.lastHitTick > 1000)
            {
                if (this.lives > 0)
                {
                    this.lives -= 1;
                    console.log(this.lives);
                }
                if (this.lives == 0)
                {
                    this.gameOver = true;
                }

                this.lastHitTick = Date.now();
                this.hit = true;
            }
            // Draw the player in red
            this.faceColor = "#ff0000";
            this.edgeColor = "#ff0000";
        }
        else
        {
            this.faceColor = "#000000";
            this.edgeColor = "#ffca38";
        }
    }

    update()
    {
        this.handleInput();
        this.collisionDetection();

        // Experimental
        //this.rot[1] += 1;
        if (this.gameOver == false)
        {
            this.score = enemy.countDead;
        }
        this.draw();
        //console.log("finished drawing\n\n\n\n\n\n\n\n");
    }

    draw()
    {
        this.pointsVP = vertexShader(this.points, this.rot, this.pos, camera.pos, camera.rot);
        fragmentShader(this.pointsVP, this.quads, zoom, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, this.faceColor, this.edgeColor, this.renderSolid, this.renderWireframe, this.pos);

        // Show score
        ctx.fillStyle = "#000000";
        ctx.font = "16px sans-serif";
        ctx.fillText("Score " + this.score, SCREEN_WIDTH / 2, 50);

        // Game over screen
        if (this.gameOver == true)
        {
            ctx.fillStyle = "#000000";
            ctx.font = "24px sans-serif";
            ctx.fillText("Game Over", SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 12);
            ctx.fillText("You survived " + this.score + " enemies!", SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 12);
        }

        // Show debug information
        if (debugMode)
        {
            ctx.fillStyle = "#000000";
            ctx.font = "12px sans-serif";
            ctx.fillText("Player World Coordinate X: " + player.pos[0], 0, 15);
            ctx.fillText("Player World Coordinate Y: " + player.pos[1], 0, 30);
            ctx.fillText("Player World Coordinate Z: " + player.pos[2], 0, 45);

            ctx.fillText("Camera World Coordinate X: " + camera.pos[0], 0, 75);
            ctx.fillText("Camera World Coordinate Y: " + camera.pos[1], 0, 90);
            ctx.fillText("Camera World Coordinate Z: " + camera.pos[2], 0, 105);
        }
    }

    reset()
    {
        // This resets the player's values to their defaults
        // x, y, z
        this.pos = [0, 0, 0];
        this.rot = [0, 0, 0];
        // How long is the break between player movement, in ms. So the user has to wait 100ms after moving, before he can move again.
        this.moveInterval = 100;
        this.moveTick = Date.now();
        this.lastHitTick = Date.now();
        this.color = "#000000";
        this.score = 0;
        this.lives = 3;
        this.gameOver = false;
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
        this.rot = [0, 0, 0];
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
        // The number of removed enemies.
        this.countDead = 0;
        // After how many ms seconds can another enemy spawn
        this.spawnInterval = 1000;
        this.spawnTick = Date.now();
        this.enemySpeed = 0.001;
        this.faceColor = "#ffffff";
        this.edgeColor = "#ff0000";
        this.renderSolid = true;
        this.renderWireframe = true;
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
            this.countDead += 1;
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

                this.pointsVP = vertexShader(this.points, this.rot, pos, camera.pos, camera.rot);
                fragmentShader(this.pointsVP, this.quads, zoom, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, this.faceColor, this.edgeColor, this.renderSolid, this.renderWireframe, pos);
            }
        }
    }

    getRandomIntInclusive(min, max)
    {
        min = Math.ceil(min);
        max = Math.floor(max);
        // The maximum and minimum are inclusive
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    reset()
    {
        // This resets the enemy's values to their defaults.

        // An array of x, y, z triplets that each correspond to one enemy.
        this.enemies = [];
        // The current number of enemy blocks in the level
        this.count = 0;
        this.maxCount = 10;
        // The number of removed enemies.
        this.countDead = 0;
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
}

class Camera
{
    constructor()
    {
        this.pos = [0, 0, -1];
        this.rot = [0, 0, 0];
    }

    update()
    {
        //this.rot[1] += 0.1;
        //this.pos[0] = player.pos[0] + 0.5;
        //this.pos[1] = player.pos[1] + 0.5;
        //this.pos[2] = -8;
    }
}

/* Function definitions */
// p = array of points in 3 dimensions like [x, y, z] , r = rotation matrix of the object, cr = rotation matrix of the camera.
function vertexShader(p, r, objPos, camPos, cr)
{
    // The buffer array
    let pB = [];
    let sinAngY = 0;
    let cosAngY = 0;

    // Apply object rotation
    sinAngY = Math.sin(r[1] * radians);
    cosAngY = Math.cos(r[1] * radians);
    for (let i = 0; i < p.length / 3; i++)
    {
        // x
        pB[i * 3] = p[i * 3] * cosAngY + p[i * 3 + 1] * 0 + p[i * 3 + 2] * -sinAngY;
        // y
        pB[i * 3 + 1] = p[i * 3 + 1] * 1;
        // z the negative with the brackets makes the object's points follow the left-hand coordinate system convention for rotation.
        // This way when looking towards the positive end of the y-axis, the points rotate counter-clock wise when the angle is positive and clock-wise if negative.
        pB[i * 3 + 2] = -(p[i * 3] * sinAngY + p[i * 3 + 1] * 0 + p[i * 3 + 2] * cosAngY);
    }
    p = pB;

    // Apply object and camera position
    for (let i = 0; i < p.length / 3; i++)
    {
        // x
        pB[i * 3] = p[i * 3] + objPos[0] - camPos[0];
        // y
        pB[i * 3 + 1] = p[i * 3 + 1] + objPos[1] - camPos[1];
        // z
        pB[i * 3 + 2] = p[i * 3 + 2] + objPos[2] - camPos[2];
    }
    p = pB;

    // Apply camera rotation
    sinAngY = Math.sin(cr[1] * radians);
    cosAngY = Math.cos(cr[1] * radians);

    for (let i = 0; i < p.length / 3; i++)
    {
        // x
        pB[i * 3] = p[i * 3] * cosAngY + p[i * 3 + 1] * 0 + p[i * 3 + 2] * -sinAngY;
        // y
        pB[i * 3 + 1] = p[i * 3 + 1] * 1;
        // z the negative with the brackets makes the object's points follow the left-hand coordinate system convention for rotation.
        // This way when looking towards the positive end of the y-axis, the points rotate counter-clock wise when the angle is positive and clock-wise if negative.
        pB[i * 3 + 2] = p[i * 3] * sinAngY + p[i * 3 + 1] * 0 + p[i * 3 + 2] * cosAngY;
    }
    p = pB;

    // Lines that are parallel in 3d converge in 2d.
    if (projectionType == "perspective")
    {
        // Project points onto viewing plane
        for (let i = 0; i < p.length / 3; i++)
        {
            // x
            pB[i * 3] = p[i * 3] / p[i * 3 + 2];
            // y
            pB[i * 3 + 1] = p[i * 3 + 1] / p[i * 3 + 2];
            // z
            pB[i * 3 + 2] = 1;
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
    p = pB;

    return p;
}

function fragmentShader(p, q, z, offsetX, offsetY, faceColor, edgeColor, renderSolid, renderWireframe, objPos)
{
    // Sort the object's faces by depth. Near to far.
    let swapped = false;
    let b0 = 0,
        b1 = 0,
        b2 = 0,
        b3 = 0;
    do
    {
        swapped = false;
        for (let i = 1; i < q.length; i++)
        {
            // Compare the z-values of each vertex
            let q1AvgZ = (p[q[(i - 1) * 4] + 2] + p[q[(i - 1) * 4 + 1] + 2] + p[q[(i - 1) * 4 + 2] + 2] + p[q[(i - 1) * 4 + 3] + 2]) / 4 + objPos[2];
            let q2AvgZ = (p[q[i * 4      ] + 2] + p[q[i * 4 + 1      ] + 2] + p[q[i * 4 + 2      ] + 2] + p[q[i * 4 + 3      ] + 2]) / 4 + objPos[2];
            if (q1AvgZ < q2AvgZ)
            {
                // Store the four vertices that correspond to the quad with the greater average z-value in the buffer.
                b0 = q[(i - 1) * 4    ];
                b1 = q[(i - 1) * 4 + 1];
                b2 = q[(i - 1) * 4 + 2];
                b3 = q[(i - 1) * 4 + 3];

                q[(i - 1) * 4    ] = q[i * 4    ];
                q[(i - 1) * 4 + 1] = q[i * 4 + 1];
                q[(i - 1) * 4 + 2] = q[i * 4 + 2];
                q[(i - 1) * 4 + 3] = q[i * 4 + 3];

                q[i * 4    ] = b0;
                q[i * 4 + 1] = b1;
                q[i * 4 + 2] = b2;
                q[i * 4 + 3] = b3;

                swapped = true;
            }
        }
    } while (swapped);

    ctx.strokeStyle = edgeColor;
    ctx.fillStyle = faceColor;
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
        if (renderSolid)
        {
            // Take the average of the z-values of the current four vertices.
            let qAvgZ = (p[q[i * 4] + 2] + p[q[i * 4 + 1] + 2] + p[q[i * 4 + 2] + 2] + p[q[i * 4 + 3] + 2]) / 4 + objPos[2];
            // Convert the hex color values to rgb.
            let cr = parseInt(faceColor[1], 16) * 16 + parseInt(faceColor[2], 16) * 16;
            let cg = parseInt(faceColor[3], 16) * 16 + parseInt(faceColor[4], 16) * 16;
            let cb = parseInt(faceColor[5], 16) * 16 + parseInt(faceColor[6], 16) * 16;
            ctx.fillStyle = `rgb(${cr / qAvgZ}, ${cg / qAvgZ}, ${cb / qAvgZ})`;
            ctx.fill();
            // Calculate how much light the surface gets.
        }
        if (renderWireframe)
        {
            ctx.stroke();
        }
    }
}

// Time variables
let tp1 = Date.now();
let tp2 = Date.now();
let elapsedTime = 0;

let player = new Player;
let camera = new Camera;
//camera.pos = [20, 4, -20];
//camera.rot = [0, -25, 0];
camera.pos = [1, 1, -4];
let enemy = new Enemy;

// Walls for showing where the play area is.
let leftWall = new Cube;
leftWall.pos = [-1, 1, 9.5]
leftWall.faceColor = "#bbbbbb";
leftWall.renderSolid = true;
leftWall.scale(1, 3, 20);

let bottomWall = new Cube;
bottomWall.pos = [1, -1, 9.5]
bottomWall.faceColor = "#999999";
bottomWall.renderSolid = true;
bottomWall.scale(3, 1, 20);

let backWall = new Cube;
backWall.pos = [1, 1, 20]
backWall.faceColor = "#666666";
backWall.renderSolid = true;
backWall.scale(3, 3, 1);

let sun = new Sun;
sun.color = "#ffd745";

let zoom = 800;
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
    camera.update();

    leftWall.update();
    bottomWall.update();
    backWall.update();

    enemy.update();
    player.update();
}

// Start the game loop
main();

