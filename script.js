// 遊戲變數
let player;
let bullets = [];
let enemies = [];
let explosions = [];
let score = 0;
let lives = 3;
let gameOver = false;
let enemySpawnRate = 1000; // 敵機生成間隔(毫秒)
let lastEnemySpawn = 0;
let keys = {};
let gameWidth, gameHeight;

// 初始化遊戲
function init() {
    gameWidth = window.innerWidth;
    gameHeight = window.innerHeight;
    
    player = document.getElementById('player');
    player.style.left = (gameWidth / 2 - 25) + 'px';
    player.style.bottom = '50px';
    
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
    document.getElementById('game-over').style.display = 'none';
    
    // 事件監聽
    window.addEventListener('keydown', function(e) {
        keys[e.key] = true;
        
        // 空格鍵射擊
        if (e.key === ' ' && gameOver) {
            resetGame();
        }
    });
    
    window.addEventListener('keyup', function(e) {
        keys[e.key] = false;
    });
    
    // 開始遊戲循環
    gameLoop();
}

// 遊戲主循環
function gameLoop() {
    if (!gameOver) {
        update();
        render();
    }
    requestAnimationFrame(gameLoop);
}

// 更新遊戲狀態
function update() {
    // 玩家移動
    if (keys['ArrowLeft'] && parseInt(player.style.left) > 0) {
        player.style.left = (parseInt(player.style.left) - 8) + 'px';
    }
    if (keys['ArrowRight'] && parseInt(player.style.left) < gameWidth - 50) {
        player.style.left = (parseInt(player.style.left) + 8) + 'px';
    }
    if (keys['ArrowUp'] && parseInt(player.style.bottom) < gameHeight - 50) {
        player.style.bottom = (parseInt(player.style.bottom) + 8) + 'px';
    }
    if (keys['ArrowDown'] && parseInt(player.style.bottom) > 0) {
        player.style.bottom = (parseInt(player.style.bottom) - 8) + 'px';
    }
    
    // 射擊
    if (keys[' '] && !keys['SpacePressed']) {
        keys['SpacePressed'] = true;
        shoot();
    } else if (!keys[' ']) {
        keys['SpacePressed'] = false;
    }
    
    // 生成敵機
    const now = Date.now();
    if (now - lastEnemySpawn > enemySpawnRate) {
        spawnEnemy();
        lastEnemySpawn = now;
        // 隨遊戲進行增加難度
        enemySpawnRate = Math.max(200, enemySpawnRate - 10);
    }
    
    // 更新子彈位置
    bullets.forEach((bullet, index) => {
        bullet.top = parseInt(bullet.style.top) - 10;
        bullet.style.top = bullet.top + 'px';
        
        // 移除超出畫面的子彈
        if (bullet.top < -15) {
            bullet.element.remove();
            bullets.splice(index, 1);
        }
    });
    
    // 更新敵機位置
    enemies.forEach((enemy, eIndex) => {
        enemy.top = parseInt(enemy.style.top) + 3;
        enemy.style.top = enemy.top + 'px';
        
        // 檢查敵機是否超出畫面
        if (enemy.top > gameHeight) {
            enemy.element.remove();
            enemies.splice(eIndex, 1);
        }
        
        // 檢查敵機與玩家碰撞
        if (checkCollision(player, enemy.element)) {
            createExplosion(enemy.left, enemy.top, 40);
            enemy.element.remove();
            enemies.splice(eIndex, 1);
            loseLife();
        }
        
        // 檢查子彈與敵機碰撞
        bullets.forEach((bullet, bIndex) => {
            if (checkCollision(bullet.element, enemy.element)) {
                // 擊中敵機
                createExplosion(enemy.left, enemy.top, 40);
                enemy.element.remove();
                enemies.splice(eIndex, 1);
                bullet.element.remove();
                bullets.splice(bIndex, 1);
                addScore(10);
                break;
            }
        });
    });
    
    // 更新爆炸動畫
    explosions.forEach((explosion, index) => {
        if (!explosion.element.parentNode) {
            explosions.splice(index, 1);
        }
    });
}

// 渲染遊戲
function render() {
    // 主要渲染由CSS和DOM操作處理
}

// 射擊功能
function shoot() {
    const bullet = document.createElement('div');
    bullet.className = 'bullet';
    const playerLeft = parseInt(player.style.left);
    const playerBottom = parseInt(player.style.bottom);
    bullet.style.left = (playerLeft + 22) + 'px';
    bullet.style.top = (gameHeight - playerBottom - 50) + 'px';
    document.getElementById('game-screen').appendChild(bullet);
    
    bullets.push({
        element: bullet,
        top: gameHeight - playerBottom - 50,
        left: playerLeft + 22
    });
}

// 生成敵機
function spawnEnemy() {
    const enemy = document.createElement('div');
    enemy.className = 'enemy';
    const left = Math.random() * (gameWidth - 40);
    enemy.style.left = left + 'px';
    enemy.style.top = '-40px';
    document.getElementById('game-screen').appendChild(enemy);
    
    enemies.push({
        element: enemy,
        top: -40,
        left: left
    });
}

// 碰撞檢測
function checkCollision(obj1, obj2) {
    const rect1 = obj1.getBoundingClientRect();
    const rect2 = obj2.getBoundingClientRect();
    
    return !(
        rect1.right < rect2.left || 
        rect1.left > rect2.right || 
        rect1.bottom < rect2.top || 
        rect1.top > rect2.bottom
    );
}

// 創建爆炸效果
function createExplosion(x, y, size) {
    const explosion = document.createElement('div');
    explosion.className = 'explosion';
    explosion.style.left = (x - size/2) + 'px';
    explosion.style.top = (y - size/2) + 'px';
    explosion.style.width = size + 'px';
    explosion.style.height = size + 'px';
    document.getElementById('game-screen').appendChild(explosion);
    
    explosions.push({
        element: explosion
    });
    
    // 爆炸結束後移除元素
    setTimeout(() => {
        if (explosion.parentNode) {
            explosion.remove();
        }
    }, 500);
}

// 增加分數
function addScore(points) {
    score += points;
    document.getElementById('score').textContent = score;
}

// 失去生命
function loseLife() {
    lives--;
    document.getElementById('lives').textContent = lives;
    
    if (lives <= 0) {
        endGame();
    }
}

// 結束遊戲
function endGame() {
    gameOver = true;
    document.getElementById('game-over').style.display = 'block';
}

// 重置遊戲
function resetGame() {
    // 清除所有敵機和子彈
    enemies.forEach(enemy => enemy.element.remove());
    bullets.forEach(bullet => bullet.element.remove());
    explosions.forEach(explosion => explosion.element.remove());
    
    // 重置變數
    enemies = [];
    bullets = [];
    explosions = [];
    score = 0;
    lives = 3;
    enemySpawnRate = 1000;
    gameOver = false;
    
    // 更新UI
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
    document.getElementById('game-over').style.display = 'none';
}

// 視窗大小改變時調整遊戲
window.addEventListener('resize', function() {
    gameWidth = window.innerWidth;
    gameHeight = window.innerHeight;
});

// 啟動遊戲
window.onload = init;