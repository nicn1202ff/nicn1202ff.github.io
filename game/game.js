// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let gameRunning = false;
let gameOver = false;
let currentLevel = 1;
let attempts = 1;
let playerY = canvas.height - 100;
let playerVelocity = 0;
let isJumping = false;
let scrollOffset = 0;
let gameSpeed = 4 + (currentLevel * 0.5);

// Player object
const player = {
    x: 50,
    y: playerY,
    width: 40,
    height: 40,
    rotation: 0,
    jumpPower: 15
};

// Arrays
let obstacles = [];
let platforms = [];
let particles = [];

// Generate level
function generateLevel(level) {
    obstacles = [];
    platforms = [];
    scrollOffset = 0;
    playerY = canvas.height - 100;
    player.y = playerY;
    playerVelocity = 0;
    isJumping = false;
    gameSpeed = 4 + (level * 0.5);

    const levelLength = 3000 + level * 500;
    const spacing = 150 + level * 20;
    
    for (let i = spacing; i < levelLength; i += spacing) {
        if (Math.random() < 0.7) {
            obstacles.push({
                x: i,
                y: canvas.height - 80,
                width: 30,
                height: 80,
                type: 'spike',
                height: 40 + Math.random() * 20
            });
        }

        if (Math.random() < 0.3) {
            platforms.push({
                x: i,
                y: canvas.height - 150 - Math.random() * 100,
                width: 80,
                height: 15
            });
        }
    }

    // Add goal
    obstacles.push({
        x: 3000 + level * 500,
        y: canvas.height - 100,
        width: 50,
        height: 50,
        type: 'goal'
    });
}

// Keyboard input
window.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
        e.preventDefault();
        if (gameRunning) jump();
    }
});

// Mouse input
canvas.addEventListener('click', () => {
    if (gameRunning) jump();
});

// Jump
function jump() {
    if (!isJumping) {
        playerVelocity = -player.jumpPower;
        isJumping = true;
        createJumpParticles();
    }
}

// Restart level
function restartLevel() {
    attempts++;
    generateLevel(currentLevel);
    document.getElementById('attempts').textContent = attempts;
    document.getElementById('gameOver').classList.remove('show');
    gameRunning = true;
    gameOver = false;
}

// Next level
function nextLevel() {
    currentLevel++;
    attempts = 1;
    generateLevel(currentLevel);
    document.getElementById('level').textContent = currentLevel;
    document.getElementById('attempts').textContent = attempts;
    document.getElementById('gameOver').classList.remove('show');
    gameRunning = true;
    gameOver = false;
}

// Start game
function startGame() {
    document.getElementById('instructions').classList.add('hidden');
    currentLevel = 1;
    attempts = 1;
    generateLevel(currentLevel);
    document.getElementById('level').textContent = currentLevel;
    document.getElementById('attempts').textContent = attempts;
    gameRunning = true;
    gameOver = false;
    gameLoop();
}

// Update game
function update() {
    if (!gameRunning) return;

    // Apply gravity
    playerVelocity += 0.6;
    player.y += playerVelocity;

    // Rotate player
    player.rotation += 0.1;

    // Scroll the world
    scrollOffset += gameSpeed;

    // Check platform collisions
    for (let platform of platforms) {
        if (playerVelocity > 0 &&
            player.y + player.height >= platform.y &&
            player.y + player.height <= platform.y + platform.height + 10 &&
            player.x + player.width > platform.x &&
            player.x < platform.x + platform.width &&
            scrollOffset > platform.x - player.x - 100) {
            
            playerVelocity = -12;
            isJumping = true;
            createJumpParticles();
        }
    }

    // Check ground collision
    if (player.y + player.height >= canvas.height - 60) {
        player.y = canvas.height - 100;
        playerVelocity = 0;
        isJumping = false;
    }

    // Check obstacle collisions
    for (let obstacle of obstacles) {
        if (obstacle.type === 'spike') {
            if (player.x + player.width > obstacle.x - scrollOffset + player.x &&
                player.x < obstacle.x - scrollOffset + player.x + obstacle.width &&
                player.y + player.height > canvas.height - obstacle.height) {
                
                createExplosion(player.x + player.width / 2, player.y + player.height / 2);
                endLevel();
                return;
            }
        } else if (obstacle.type === 'goal') {
            if (player.x + player.width > obstacle.x - scrollOffset + player.x &&
                player.x < obstacle.x - scrollOffset + player.x + obstacle.width &&
                player.y + player.height > obstacle.y) {
                
                completeLevel();
                return;
            }
        }
    }

    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].life--;
        particles[i].x += particles[i].vx;
        particles[i].y += particles[i].vy;
        particles[i].vy += 0.2;

        if (particles[i].life <= 0) {
            particles.splice(i, 1);
        }
    }

    // Fall off screen
    if (player.y > canvas.height + 100) {
        createExplosion(player.x + player.width / 2, canvas.height);
        endLevel();
    }
}

// Create jump particles
function createJumpParticles() {
    for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 * i) / 5;
        const speed = Math.random() * 2 + 1;
        particles.push({
            x: player.x + player.width / 2,
            y: player.y + player.height,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed + 1,
            life: 20,
            maxLife: 20,
            color: '#00ff00'
        });
    }
}

// Create explosion particles
function createExplosion(x, y) {
    for (let i = 0; i < 15; i++) {
        const angle = (Math.PI * 2 * i) / 15;
        const speed = Math.random() * 4 + 2;
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 30,
            maxLife: 30,
            color: '#ff0000'
        });
    }
}

// End level
function endLevel() {
    gameRunning = false;
    gameOver = true;
    document.getElementById('gameOverTitle').textContent = 'CRASHED!';
    document.getElementById('gameOverMessage').textContent = `Attempt ${attempts} failed. Try again!`;
    document.getElementById('gameOver').classList.add('show');
}

// Complete level
function completeLevel() {
    gameRunning = false;
    gameOver = true;
    document.getElementById('gameOverTitle').textContent = 'LEVEL COMPLETE!';
    document.getElementById('gameOverMessage').textContent = `Completed in ${attempts} attempts!`;
    document.getElementById('gameOver').classList.add('show');
}

// Draw game
function draw() {
    // Clear canvas
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#ff69b4');
    gradient.addColorStop(0.5, '#9933ff');
    gradient.addColorStop(1, '#3366ff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw ground
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, canvas.height - 60, canvas.width, 60);

    // Draw platforms
    ctx.fillStyle = '#00ff00';
    for (let platform of platforms) {
        const screenX = platform.x - scrollOffset + player.x;
        if (screenX > -100 && screenX < canvas.width + 100) {
            ctx.shadowColor = 'rgba(0, 255, 0, 0.8)';
            ctx.shadowBlur = 10;
            ctx.fillRect(screenX, platform.y, platform.width, platform.height);
        }
    }
    ctx.shadowBlur = 0;

    // Draw obstacles
    for (let obstacle of obstacles) {
        const screenX = obstacle.x - scrollOffset + player.x;
        
        if (screenX > -100 && screenX < canvas.width + 100) {
            if (obstacle.type === 'spike') {
                ctx.fillStyle = '#ff0000';
                ctx.shadowColor = 'rgba(255, 0, 0, 0.8)';
                ctx.shadowBlur = 10;
                
                // Draw spike as triangle
                ctx.beginPath();
                ctx.moveTo(screenX, canvas.height - 60);
                ctx.lineTo(screenX + obstacle.width / 2, canvas.height - 60 - obstacle.height);
                ctx.lineTo(screenX + obstacle.width, canvas.height - 60);
                ctx.closePath();
                ctx.fill();
            } else if (obstacle.type === 'goal') {
                ctx.fillStyle = '#ffff00';
                ctx.shadowColor = 'rgba(255, 255, 0, 0.8)';
                ctx.shadowBlur = 15;
                ctx.fillRect(screenX, obstacle.y, obstacle.width, obstacle.height);
            }
        }
    }
    ctx.shadowBlur = 0;

    // Draw player cube
    ctx.save();
    ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
    ctx.rotate(player.rotation);
    
    ctx.fillStyle = '#00d4ff';
    ctx.shadowColor = 'rgba(0, 212, 255, 0.8)';
    ctx.shadowBlur = 15;
    ctx.fillRect(-player.width / 2, -player.height / 2, player.width, player.height);
    
    ctx.fillStyle = '#ff0055';
    ctx.fillRect(-player.width / 2 + 10, -player.height / 2 + 10, 8, 8);
    ctx.fillRect(player.width / 2 - 18, -player.height / 2 + 10, 8, 8);
    
    ctx.shadowBlur = 0;
    ctx.restore();

    // Draw particles
    for (let particle of particles) {
        ctx.fillStyle = `${particle.color}`;
        ctx.globalAlpha = particle.life / particle.maxLife;
        ctx.shadowColor = `${particle.color}`;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    // Draw progress bar
    const progress = Math.min(scrollOffset / (3000 + currentLevel * 500), 1) * 100;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(10, 10, 200, 20);
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(10, 10, 200 * progress / 100, 20);
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 200, 20);
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
