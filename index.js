// Basic Environment Setup
const canvas = document.createElement('canvas')
document.querySelector('.myGame').appendChild(canvas)
canvas.height = innerHeight
canvas.width = innerWidth
const context = canvas.getContext('2d')


let difficulty = 2
const form = document.querySelector('form')
const scoreBoard = document.querySelector('.scoreBoard')

const WEAPON_VELOCITY_MULTIPLIER = 6
const PLAYER_RADIUS = 15
const WEAPON_RADIUS = 6

// Basic Functions


// Event listener for Difficulty form
document.querySelector('input').addEventListener('click', (e) => {
    e.preventDefault();

    //Making form invisible
    form.style.display = 'none';
    //Making Scoreboard visible
    scoreBoard.style.display = 'block';

    //Getting Difficulty selected by user
    const userValue = document.getElementById("difficulty").value;

    if (userValue === "Easy") {
        setInterval(spawnEnemy, 2000);
        return difficulty = 5;
    }

    if (userValue === "Medium") {
        setInterval(spawnEnemy, 1400);
        return difficulty = 8;
    }

    if (userValue === "Hard") {
        setInterval(spawnEnemy, 1000);
        return difficulty = 10;
    }

    if (userValue === "Insane") {
        setInterval(spawnEnemy, 700);
        return difficulty = 12;
    }
});


// !-- Creating Player, Enemy, Weapon, Etc. Classes --!

// Setting Player position to center
playerPosition = {
    x: canvas.width / 2,
    y: canvas.height / 2
}

// Creating Player Class
class Player {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }

    draw() {
        context.beginPath()
        context.arc(
            this.x,
            this.y,
            this.radius,
            (Math.PI / 180) * 0,
            (Math.PI / 180) * 360,
            false
        )
        context.fillStyle = this.color
        context.fill()
    }
}

// Creating Weapon Class
class Weapon {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw() {
        context.beginPath()
        context.arc(
            this.x,
            this.y,
            this.radius,
            (Math.PI / 180) * 0,
            (Math.PI / 180) * 360,
            false
        )
        context.fillStyle = this.color
        context.fill()
    }

    update() {
        this.draw()
        this.x += this.velocity.x
        this.y += this.velocity.y
    }
}

// Creating Enemy Class
class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw() {
        context.beginPath()
        context.arc(
            this.x,
            this.y,
            this.radius,
            (Math.PI / 180) * 0,
            (Math.PI / 180) * 360,
            false
        )
        context.fillStyle = this.color
        context.fill()
    }

    update() {
        this.draw()
        this.x += this.velocity.x
        this.y += this.velocity.y
    }
}

// !-- Main logic starts here --!


// Creating Player object, weapons array, enemies array, etc. 
const player = new Player(playerPosition.x, playerPosition.y, PLAYER_RADIUS, "white")

const weapons = []
const enemies = []


// Function to spawn enemy at random locations
const spawnEnemy = () => {
    //Generating random size for enemy
    const enemySize = Math.random() * (40 - 5) + 5

    //Generating random color for enemy
    const enemyColor = `hsl(${Math.floor(Math.random() * 360)}, 100%, 50%)`

    //Random is enemy spawn position
    let random;

    //Making enemy location random but only from outside of screen  
    if (Math.random() > 0.5) {
        random = {
            // Setting x to very left off the sreen or very right off the screen anf y to randomly anywhere vertically
            x: Math.random() < 0.5 ? canvas.width + enemySize : -enemySize,
            y: Math.random() * canvas.height
        }
    } else {
        // Setting y to very top off the sreen or very bottom off the screen anf x to randomly anywhere horizontally
        random = {
            x: Math.random() * canvas.width,
            y: Math.random() < 0.5 ? canvas.height + enemySize : -enemySize
        }
    }

    // Finding angle between center(means player position) and enemy position
    const angle = Math.atan2(canvas.height / 2 - random.y, canvas.width / 2 - random.x)

    // Making velocity or speed of enemy by multiplying chosen difficulty to radian
    const velocity = { x: Math.cos(angle) * difficulty, y: Math.sin(angle) * difficulty }

    // Adding enemy to enemies array
    enemies.push(new Enemy(random.x, random.y, enemySize, enemyColor, velocity))
}

// !-- Creating animation function --!


let animationId;
function animation() {
    //Making recursion
    animationId = requestAnimationFrame(animation)

    //Clearing canvas on each frame
    context.fillStyle = "rgba(49, 49, 49, 0.2)";
    context.fillRect(0, 0, canvas.width, canvas.height)

    //Drawing player
    player.draw()

    //Generating bullets
    weapons.forEach((weapon, weaponIndex) => {
        weapon.update()

        if (weapon.x + weapon.radius < 1 || weapon.x - weapon.radius > canvas.width || weapon.y + weapon.radius < 1 || weapon.y - weapon.radius > canvas.height) {
            weapons.splice(weaponIndex, 1)
        }
    })

    //Generating enemies
    enemies.forEach((enemy, enemyIndex) => {
        enemy.update()

        const distanceBetweenPlayerAndEnemy = Math.hypot(player.x - enemy.x, player.y - enemy.y)

        if (distanceBetweenPlayerAndEnemy - player.radius - enemy.radius < 1) {
            cancelAnimationFrame(animationId)
        }

        weapons.forEach((weapon, weaponIndex) => {

            const distanceBetweenWeaponAndEnemy = Math.hypot(weapon.x - enemy.x, weapon.y - enemy.y)

            if (distanceBetweenWeaponAndEnemy - weapon.radius - enemy.radius < 1) {
                if (enemy.radius > 10) {
                    enemy.radius -= 5
                    weapons.splice(weaponIndex, 1)
                }
                else {
                    setTimeout(() => {
                        enemies.splice(enemyIndex, 1)
                        weapons.splice(weaponIndex, 1)
                    }, 0)
                }
            }
        })
    })
}

// Adding event listener

// Event listener for LIGHT weapon aka left click
canvas.addEventListener("click", (event) => {
    //Finding angle between player position(center position) and mouse position(click coordinates)
    const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2)

    // Making velocity or speed for LIGHT weapon
    const velocity = { x: Math.cos(angle) * WEAPON_VELOCITY_MULTIPLIER, y: Math.sin(angle) * WEAPON_VELOCITY_MULTIPLIER }

    //Adding LIGHT weapon in weapons array
    weapons.push(new Weapon(canvas.width / 2, canvas.height / 2, WEAPON_RADIUS, "white", velocity))
})

animation()
