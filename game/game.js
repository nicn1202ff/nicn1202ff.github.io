// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let gameRunning = false;
let gameOver = false;
let score = 0;
let lives = 3;
let level = 1;
let enemySpeed = 2;

// Player object
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 50,
    width: 50,
    height: 40,
    dx: 0,
    speed: 5
};

// Arrays
let bullets = [];
let enemies = [];
let particles = [];

// Keyboard input
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ') {
        e.preventDefault();
        if (gameRunning) shoot();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Mouse input
canvas.addEventListener('click', () => {
    if (gameRunning) shoot();
});

// Start game
function startGame() {
    document.getElementById('instructions').classList.add('hidden');
    gameRunning = true;
    gameOver = false;
    score = 0;
    lives = 3;
    level = 1;
    enemySpeed = 2;
    bullets = [];
    enemies = [];
    particles = [];
    player.x = canvas.width / 2 - 25;
    spawnEnemies();
    gameLoop();
}

// Spawn enemies
function spawnEnemies() {
    enemies = [];
    const enemyCount = 5 + level * 2;
    for (let i = 0; i < enemyCount; i++) {
        enemies.push({
            x: Math.random() * (canvas.width - 40),
            y: Math.random() * (canvas.height / 2 - 100) + 50,
            width: 40,
            height: 40,
            dx: (Math.random() - 0.5) * 3,
            dy: Math.random() * 2 + 1
        });
    }
}

// Shoot bullet
function shoot() {
    bullets.push({
        x: player.x + player.width / 2 - 2.5,
        y: player.y,
        width: 5,
        height: 15,
        dy: -7
    });
}

// Update game
function update() {
    if (!gameRunning) return;

    // Player movement
    player.dx = 0;
    if (keys['ArrowLeft'] || keys['a']) player.dx = -player.speed;
    if (keys['ArrowRight'] || keys['d']) player.dx = player.speed;

    player.x += player.dx;

    // Keep player in bounds
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    // Update bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y += bullets[i].dy;
        
        if (bullets[i].y < 0) {
            bullets.splice(i, 1);
            continue;
        }

        // Check collision with enemies
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (checkCollision(bullets[i], enemies[j])) {
                createExplosion(enemies[j].x + enemies[j].width / 2, enemies[j].y + enemies[j].height / 2);
                enemies.splice(j, 1);
                bullets.splice(i, 1);
                score += 10;
                break;
            }
        }
    }

    // Update enemies
    for (let i = 0; i < enemies.length; i++) {
        enemies[i].x += enemies[i].dx;
        enemies[i].y += enemies[i].dy;

        // Bounce off walls
        if (enemies[i].x < 0 || enemies[i].x + enemies[i].width > canvas.width) {
            enemies[i].dx *= -1;
        }

        // Check collision with player
        if (checkCollision(player, enemies[i])) {
            createExplosion(player.x + player.width / 2, player.y + player.height / 2);
            lives--;
            enemies.splice(i, 1);
            
            if (lives <= 0) {
                endGame();
            }
            break;
        }

        // Enemy shoots (random)
        if (Math.random() < 0.01) {
            createEnemyBullet(enemies[i]);
        }
    }

    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].life--;
        particles[i].x += particles[i].vx;
        particles[i].y += particles[i].vy;
        particles[i].vy += 0.1;

        if (particles[i].life <= 0) {
            particles.splice(i, 1);
        }
    }

    // Check if all enemies defeated
    if (enemies.length === 0) {
        level++;
        enemySpeed += 0.5;
        spawnEnemies();
        score += 50;
    }

    // Update HUD
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
    document.getElementById('level').textContent = level;
}

// Create enemy bullet
function createEnemyBullet(enemy) {
    bullets.push({
        x: enemy.x + enemy.width / 2 - 2.5,
        y: enemy.y + enemy.height,
        width: 5,
        height: 15,
        dy: 4,
        isEnemyBullet: true
    });
}

// Create explosion particles
function createExplosion(x, y) {
    for (let i = 0; i < 10; i++) {
        const angle = (Math.PI * 2 * i) / 10;
        const speed = Math.random() * 3 + 2;
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 30,
            maxLife: 30
        });
    }
}

// Check collision
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// End game
function endGame() {
    gameRunning = false;
    gameOver = true;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').classList.add('show');
}

// Draw game
function draw() {
    // Clear canvas with gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#0a0e27');
    gradient.addColorStop(1, '#1a1a3e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw stars background
    ctx.fillStyle = '#fff';
    ctx.globalAlpha = 0.5;
    for (let i = 0; i < 100; i++) {
        const x = (Math.sin(i) * 1000 + Date.now() / 50) % canvas.width;
        const y = (Math.cos(i) * 500 + i * 6) % canvas.height;
        ctx.fillRect(x, y, 1, 1);
    }
    ctx.globalAlpha = 1;

    // Draw player
    ctx.fillStyle = '#00d4ff';
    ctx.shadowColor = 'rgba(0, 212, 255, 0.8)';
    ctx.shadowBlur = 15;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.shadowBlur = 0;

    // Draw player cockpit
    ctx.fillStyle = '#ff0055';
    ctx.fillRect(player.x + 20, player.y + 8, 10, 10);

    // Draw bullets
    ctx.fillStyle = '#ffff00';
    for (let bullet of bullets) {
        if (!bullet.isEnemyBullet) {
            ctx.shadowColor = 'rgba(255, 255, 0, 0.8)';
            ctx.shadowBlur = 10;
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            ctx.shadowBlur = 0;
        }
    }

    // Draw enemy bullets
    ctx.fillStyle = '#ff6600';
    for (let bullet of bullets) {
        if (bullet.isEnemyBullet) {
            ctx.shadowColor = 'rgba(255, 102, 0, 0.8)';
            ctx.shadowBlur = 10;
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            ctx.shadowBlur = 0;
        }
    }

    // Draw enemies
    ctx.fillStyle = '#ff0055';
    for (let enemy of enemies) {
        ctx.shadowColor = 'rgba(255, 0, 85, 0.8)';
        ctx.shadowBlur = 15;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        
        // Enemy eyes
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(enemy.x + 8, enemy.y + 8, 6, 6);
        ctx.fillRect(enemy.x + 26, enemy.y + 8, 6, 6);
        ctx.fillStyle = '#ff0055';
        ctx.shadowBlur = 15;
    }
    ctx.shadowBlur = 0;

    // Draw particles
    for (let particle of particles) {
        ctx.fillStyle = `rgba(255, 212, 0, ${particle.life / particle.maxLife})`;
        ctx.shadowColor = `rgba(255, 212, 0, ${particle.life / particle.maxLife})`;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.shadowBlur = 0;
}

// Game loop
function gameLoop() {
    update();
    draw();
    
    if (gameRunning || gameOver === false) {
        requestAnimationFrame(gameLoop);
    }
}

// Start the game loop on page load
window.addEventListener('load', () => {
    gameLoop();
});