// Importing sound effects
const introMusic = new Audio('./music/introSong.mp3')
const shootingSound = new Audio('./music/shooting.mp3')
const killEnemySound = new Audio('./music/killEnemy.mp3')
const gameOverSound = new Audio('./music/gameOver.mp3')
const heavyWeaponSound = new Audio('./music/heavyWeapon.mp3')
const hugeWeaponSound = new Audio('./music/hugeWeapon.mp3')

introMusic.play()
// Basic Environment Setup
const canvas = document.createElement('canvas')
document.querySelector('.myGame').appendChild(canvas)
canvas.height = innerHeight
canvas.width = innerWidth
const context = canvas.getContext('2d')
const LIGHT_WEAPON_DAMAGE = 10
const HEAVY_WEAPON_DAMAGE = 2 * LIGHT_WEAPON_DAMAGE

let difficulty = 2
const form = document.querySelector('form')
const scoreBoard = document.querySelector('.scoreBoard')
let playerScore = 0

const LIGHT_WEAPON_VELOCITY_MULTIPLIER = 6
const HEAVY_WEAPON_VELOCITY_MULTIPLIER = LIGHT_WEAPON_VELOCITY_MULTIPLIER / 2
const PLAYER_RADIUS = 15
const LIGHT_WEAPON_RADIUS = 6
const HEAVY_WEAPON_RADIUS = LIGHT_WEAPON_RADIUS * 3

// Basic Functions


// Event listener for Difficulty form
document.querySelector('input').addEventListener('click', (e) => {
    e.preventDefault();

    // Stopping intro music
    introMusic.pause()

    //Making form invisible
    form.style.display = 'none';
    //Making Scoreboard visible
    scoreBoard.style.display = 'block';

    //Getting Difficulty selected by user
    const userValue = document.getElementById("difficulty").value;

    if (userValue === "Easy") {
        setInterval(spawnEnemy, 2000);
        return difficulty = 2;
    }

    if (userValue === "Medium") {
        setInterval(spawnEnemy, 1400);
        return difficulty = 5;
    }

    if (userValue === "Hard") {
        setInterval(spawnEnemy, 1000);
        return difficulty = 9;
    }

    if (userValue === "Insane") {
        setInterval(spawnEnemy, 700);
        return difficulty = 10;
    }
});

// Endscreen
const gameOverLoader = () => {
    // Creating endscreen div and play again button and high score button
    const gameOverBanner = document.createElement('div')
    const gameOverbutton = document.createElement('button')
    const highScore = document.createElement('div')

    highScore.innerHTML = `High Score: ${localStorage.getItem('highScore') ? localStorage.getItem('highScore') : playerScore}`

    const oldHighScore = localStorage.getItem('highScore') && localStorage.getItem('highScore')
    if (oldHighScore < playerScore) {
        localStorage.setItem('highScore', playerScore)

        // Updating highscore html
        highScore.innerHTML = `High Score: ${playerScore}`
    }

    // Adding text to playagain button
    gameOverbutton.innerText = 'Play Again'
    gameOverBanner.appendChild(highScore)
    gameOverBanner.appendChild(gameOverbutton)

    // Making reload on clicking play again button
    gameOverbutton.onclick = () => {
        window.location.reload()
    }

    gameOverBanner.classList.add('gameover')
    document.querySelector("body").appendChild(gameOverBanner)
}

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
    constructor(x, y, radius, color, velocity, damage) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.damage = damage
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

// Creating Huge Weapon Class
class HugeWeapon {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.color = "rgba(255,0,133,1)"
    }

    draw() {
        context.beginPath()
        context.fillStyle = this.color
        context.fillRect(this.x, this.y, 200, canvas.height)
    }

    update() {
        this.draw()
        this.x += 20
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

// Creating Particle Class
const friction = 0.98
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1
    }

    draw() {
        context.save();
        context.globalAlpha = this.alpha;
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
        context.restore();
    }

    update() {
        this.draw()
        this.velocity.x = this.velocity.x * friction
        this.velocity.y = this.velocity.y * friction
        this.x += this.velocity.x
        this.y += this.velocity.y
        this.alpha -= 0.01
    }
}

// !-- Main logic starts here --!


// Creating Player object, weapons array, enemies array, etc. 
const player = new Player(playerPosition.x, playerPosition.y, PLAYER_RADIUS, "white")

const weapons = []
const hugeWeapons = []
const enemies = []
const particles = []


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

    // Rendering player score in scoreboard html element
    scoreBoard.innerHTML = `Score : ${playerScore}`

    //Clearing canvas on each frame
    context.fillStyle = "rgba(49, 49, 49, 0.2)";
    context.fillRect(0, 0, canvas.width, canvas.height)

    //Drawing player
    player.draw()

    // Generating particles
    particles.forEach((particle, particleIndex) => {
        if (particle.alpha <= 0) {
            particles.splice(particleIndex, 1)
        } else {
            particle.update();
        }
    })

    // Generating huge weapon
    hugeWeapons.forEach((hugeWeapon, hugeWeaponIndex) => {
        if (hugeWeapon.x > canvas.width) {
            hugeWeapons.splice(hugeWeaponIndex, 1)
        } else {
            hugeWeapon.update()
        }
    })

    //Generating bullets
    weapons.forEach((weapon, weaponIndex) => {
        weapon.update()

        // Removing weapon if it goes out of screen
        if (weapon.x + weapon.radius < 1 || weapon.x - weapon.radius > canvas.width || weapon.y + weapon.radius < 1 || weapon.y - weapon.radius > canvas.height) {
            weapons.splice(weaponIndex, 1)
        }
    })

    //Generating enemies
    enemies.forEach((enemy, enemyIndex) => {
        enemy.update()

        // Finding distance between player and enemy
        const distanceBetweenPlayerAndEnemy = Math.hypot(player.x - enemy.x, player.y - enemy.y)

        // Stopping game if enemey hit player
        if (distanceBetweenPlayerAndEnemy - player.radius - enemy.radius < 1) {
            cancelAnimationFrame(animationId)
            gameOverSound.play()
            hugeWeaponSound.pause()
            shootingSound.pause()
            heavyWeaponSound.pause()
            killEnemySound.pause()
            return gameOverLoader()
        }

        hugeWeapons.forEach((hugeWeapon, hugeWeaponIndex) => {
            // Finding distance between huge weapon and enemy
            const distanceBetweenHugeWeaponAndEnemy = hugeWeapon.x - enemy.x

            if (distanceBetweenHugeWeaponAndEnemy <= 200 && distanceBetweenHugeWeaponAndEnemy >= -200) {
                // Increasing player score on killing one enemy
                playerScore += 10

                // Removing enemy if it hits huge weapon
                setTimeout(() => {
                    killEnemySound.play()
                    enemies.splice(enemyIndex, 1)
                }, 0)
            }
        })

        weapons.forEach((weapon, weaponIndex) => {

            // Finding distance between weapon and enemy
            const distanceBetweenWeaponAndEnemy = Math.hypot(weapon.x - enemy.x, weapon.y - enemy.y)

            // Reducing size of enemy if it is hit by weapon
            if (distanceBetweenWeaponAndEnemy - weapon.radius - enemy.radius < 1) {
                killEnemySound.play()
                if (enemy.radius > weapon.damage + 8) {
                    gsap.to(enemy, {
                        radius: enemy.radius - weapon.damage
                    })
                    setTimeout(() => {
                        weapons.splice(weaponIndex, 1)
                    }, 0)
                }
                // Removing enemy if it is hit by weapon and they are below 18
                else {
                    for (let i = 0; i < enemy.radius * 5; i++) {
                        particles.push(new Particle(weapon.x, weapon.y, Math.random() * 2, enemy.color, { x: (Math.random() - 0.5) * (Math.random() * 7), y: (Math.random() - 0.5) * (Math.random() * 7) }))
                    }

                    // Increasing player score on killing one enemy
                    playerScore += 10

                    // Rendering player score in scoreboard html element
                    scoreBoard.innerHTML = `Score : ${playerScore}`
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
    shootingSound.play()

    //Finding angle between player position(center position) and mouse position(click coordinates)
    const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2)

    // Making velocity or speed for LIGHT weapon
    const velocity = { x: Math.cos(angle) * LIGHT_WEAPON_VELOCITY_MULTIPLIER, y: Math.sin(angle) * LIGHT_WEAPON_VELOCITY_MULTIPLIER }

    //Adding LIGHT weapon in weapons array
    weapons.push(new Weapon(canvas.width / 2, canvas.height / 2, LIGHT_WEAPON_RADIUS, "white", velocity, LIGHT_WEAPON_DAMAGE))
})

// Event listener for HEAVY weapon aka right click
canvas.addEventListener("contextmenu", (event) => {
    event.preventDefault()

    if (playerScore <= 0) return
    heavyWeaponSound.play()

    // Decreasing player score for using HEAVY weapon
    playerScore -= 2
    // Rendering player score in scoreboard html element
    scoreBoard.innerHTML = `Score : ${playerScore}`


    //Finding angle between player position(center position) and mouse position(click coordinates)
    const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2)

    // Making velocity or speed for LIGHT weapon
    const velocity = { x: Math.cos(angle) * HEAVY_WEAPON_VELOCITY_MULTIPLIER, y: Math.sin(angle) * HEAVY_WEAPON_VELOCITY_MULTIPLIER }

    //Adding LIGHT weapon in weapons array
    weapons.push(new Weapon(canvas.width / 2, canvas.height / 2, HEAVY_WEAPON_RADIUS, "cyan", velocity, HEAVY_WEAPON_DAMAGE))
})

// Event listener for HUGE weapon aka space bar key press
addEventListener("keypress", (event) => {
    // If player press spacebar
    if (event.key === ' ') {
        if (playerScore < 20) return

        // Decreasing player score for using HUGE weapon
        playerScore -= 20
        // Rendering player score in scoreboard html element
        scoreBoard.innerHTML = `Score : ${playerScore}`
        hugeWeaponSound.play()
        hugeWeapons.push(new HugeWeapon(0, 0))
    }
})

addEventListener("contextmenu", (event) => {
    event.preventDefault()
})

addEventListener("resize", (event) => {
    window.location.reload()
})

animation()
