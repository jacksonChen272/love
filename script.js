/**
 * 蠻牛 ❤️ 寶寶 - 一周年紀念網站 JavaScript 核心邏輯
 */

// ==========================================================================
// 1. 全域設定與照片路徑管理
// ==========================================================================
const CONFIG = {
    // 在一起時間：2025年7月3日凌晨0點
    startDate: new Date('2025-07-03T00:00:00'),
    // 一周年時間
    anniversaryDate: new Date('2026-07-03T00:00:00'),
    // 代表歌曲
    music: {
        title: '慢慢喜歡你',
        artist: '蠻牛 to 寶寶',
        audioId: 'loveSongAudio'
    },
    // 照片檔案路徑，集中管理方便替換
    photos: [
        { path: 'photos/photo1.jpg', caption: '我們在一起了 ❤️' },
        { path: 'photos/photo2.jpg', caption: '第一次吵架又和好 🩹' },
        { path: 'photos/photo3.jpg', caption: '第一次實體見面 🏪' },
        { path: 'photos/photo4.jpg', caption: '第一次約會 🍽️' },
        { path: 'photos/photo5.jpg', caption: '第一次看棒球 ⚾' },
        { path: 'photos/photo6.jpg', caption: '第一次探索台北 🗺️' },
        { path: 'photos/photo7.jpg', caption: '一起過生日 🎂' },
        { path: 'photos/photo8.jpg', caption: '最幸福的一天 🥰' },
        { path: 'photos/photo9.jpg', caption: '我們的日常 📱' },
        { path: 'photos/photo10.jpg', caption: '一周年快樂 💖' }
    ]
};

// 遊戲狀態與進度（預設值）
let gameState = {
    currentLevel: 1,
    bingoActiveCells: [],
    flippedCardCount: 0,
    collectedEggs: [], // 已點擊的彩蛋愛心 ID 陣列
    completedWishes: [], // 已勾選的願望 ID 陣列
    isConfessionUnlocked: false
};

// 鍵盤暫存（關卡7）
let passwordBuffer = '';

// ==========================================================================
// 2. 初始化與 LocalStorage 載入
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    loadGameState();
    initBackgroundHearts();
    initTimer();
    initScrollReveal();
    initNavigation();
    initPolaroidGrid();
    initEasterEggs();
    initWishlist();
    
    // 初始化各個遊戲關卡
    setupGameDashboard();
    initBingoGame();
    initFlipCards();
    
    // 綁定基礎事件
    document.getElementById('startStoryBtn').addEventListener('click', startStory);
    document.getElementById('resetProgressBtn').addEventListener('click', resetAllProgress);
    document.getElementById('nextLevelBtn').addEventListener('click', nextLevel);
    
    // 綁定關卡 2, 3 的按鈕
    document.getElementById('submit-level-2').addEventListener('click', checkLevel2);
    document.getElementById('submit-level-3').addEventListener('click', checkLevel3);
    
    // 綁定 Spotify 播放器
    initSpotifyPlayer();
    
    // 綁定 Lightbox
    initLightbox();
});

// 儲存狀態至 localStorage
function saveGameState() {
    localStorage.setItem('manniu_baobao_anniversary', JSON.stringify(gameState));
}

// 從 localStorage 載入狀態
function loadGameState() {
    const saved = localStorage.getItem('manniu_baobao_anniversary');
    if (saved) {
        try {
            gameState = JSON.parse(saved);
        } catch (e) {
            console.error('載入存檔失敗，使用預設值。', e);
        }
    }
}

// 重新開始所有進度
function resetAllProgress() {
    if (confirm('確定要重新開始我們的故事嗎？這會重置所有通關記錄喔！')) {
        localStorage.removeItem('manniu_baobao_anniversary');
        gameState = {
            currentLevel: 1,
            bingoActiveCells: [],
            flippedCardCount: 0,
            collectedEggs: [],
            completedWishes: [],
            isConfessionUnlocked: false
        };
        saveGameState();
        window.location.reload();
    }
}

// ==========================================================================
// 3. 背景愛心飄落動畫 (Canvas)
// ==========================================================================
function initBackgroundHearts() {
    const canvas = document.getElementById('heartsCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let hearts = [];
    const maxHearts = 25; // 背景愛心數量，保持質感不雜亂
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // 創建愛心物件
    class Heart {
        constructor() {
            this.reset(true);
        }
        
        reset(initial = false) {
            this.x = Math.random() * canvas.width;
            this.y = initial ? Math.random() * canvas.height : -20;
            this.size = Math.random() * 8 + 6; // 6px - 14px
            this.speedY = Math.random() * 0.8 + 0.4; // 緩慢飄落
            this.sway = Math.random() * 2; // 左右搖擺幅度
            this.swaySpeed = Math.random() * 0.02 + 0.01;
            this.swayTime = Math.random() * 100;
            this.opacity = Math.random() * 0.4 + 0.15; // 淡淡的光暈
            this.color = Math.random() > 0.5 ? '#FF2E93' : '#FF6B6B';
        }
        
        update() {
            this.y += this.speedY;
            this.swayTime += this.swaySpeed;
            this.x += Math.sin(this.swayTime) * 0.3;
            
            // 越界重置
            if (this.y > canvas.height + 20 || this.x < -20 || this.x > canvas.width + 20) {
                this.reset();
            }
        }
        
        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            
            // 繪製愛心路徑
            ctx.beginPath();
            const topY = this.y - this.size / 2;
            ctx.moveTo(this.x, this.y);
            // 左半邊
            ctx.bezierCurveTo(
                this.x - this.size / 2, this.y - this.size / 2, 
                this.x - this.size, this.y + this.size / 3, 
                this.x, this.y + this.size
            );
            // 右半邊
            ctx.bezierCurveTo(
                this.x + this.size, this.y + this.size / 3, 
                this.x + this.size / 2, this.y - this.size / 2, 
                this.x, this.y
            );
            ctx.fill();
            ctx.restore();
        }
    }
    
    // 初始化愛心群
    for (let i = 0; i < maxHearts; i++) {
        hearts.push(new Heart());
    }
    
    // 動畫迴圈
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        hearts.forEach(heart => {
            heart.update();
            heart.draw();
        });
        requestAnimationFrame(animate);
    }
    
    animate();
}

// ==========================================================================
// 4. 第一章：電影開場與轉場
// ==========================================================================
function startStory() {
    const introSection = document.getElementById('chapter-intro');
    const mainContent = document.getElementById('main-content');
    
    // V2：先播放 Netflix 風格 TUDUM 音效（使用者點擊後瀏覽器允許播放）
    const introSound = document.getElementById('introSound');
    if (introSound) {
        introSound.currentTime = 0;
        introSound.play().catch(err => console.log('開場音效播放被阻擋', err));
    }
    
    // 音樂自動播放嘗試（配合使用者點擊，瀏覽器才允許播放）
    const audio = document.getElementById(CONFIG.music.audioId);
    if (audio) {
        setTimeout(() => {
            audio.play().then(() => {
                // 同步更新 Spotify 播放器狀態
                setSpotifyPlaying(true);
            }).catch(err => {
                console.log('音樂自動播放被瀏覽器阻擋，將在播放器中手動啟動', err);
            });
        }, 2200);
    }
    
    // 轉場動畫
    introSection.classList.add('fade-out');
    
    setTimeout(() => {
        introSection.style.display = 'none';
        mainContent.classList.remove('hidden');
        // 強制瀏覽器重繪以觸發過渡
        void mainContent.offsetWidth;
        mainContent.classList.add('visible');
        
        // 觸發一次 Scroll Reveal 檢查
        checkScrollReveal();
        
        // 顯示隱藏彩蛋 Widget
        document.getElementById('easterEggWidget').classList.remove('hidden');
    }, 1000);
}

// ==========================================================================
// 5. 第二章：戀愛計時器
// ==========================================================================
function initTimer() {
    const daysEl = document.getElementById('timer-days');
    const hoursEl = document.getElementById('timer-hours');
    const minutesEl = document.getElementById('timer-minutes');
    const secondsEl = document.getElementById('timer-seconds');
    
    if (!daysEl) return;
    
    function updateTimer() {
        const now = new Date();
        const diffMs = now - CONFIG.startDate; // 在一起毫秒差
        
        if (diffMs < 0) {
            // 防止設定日期在未來時顯示負數
            daysEl.textContent = '000';
            hoursEl.textContent = '00';
            minutesEl.textContent = '00';
            secondsEl.textContent = '00';
            return;
        }
        
        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        const displayDays = String(diffDays).padStart(3, '0');
        const displayHours = String(diffHours % 24).padStart(2, '0');
        const displayMinutes = String(diffMinutes % 60).padStart(2, '0');
        const displaySeconds = String(diffSeconds % 60).padStart(2, '0');
        
        daysEl.textContent = displayDays;
        hoursEl.textContent = displayHours;
        minutesEl.textContent = displayMinutes;
        secondsEl.textContent = displaySeconds;
    }
    
    updateTimer();
    setInterval(updateTimer, 1000);
}

// ==========================================================================
// 6. RWD 捲動動畫與 Navigation ScrollSpy
// ==========================================================================
function initScrollReveal() {
    window.addEventListener('scroll', checkScrollReveal);
    // 立即觸發一次
    checkScrollReveal();
}

function checkScrollReveal() {
    const reveals = document.querySelectorAll('.scroll-reveal');
    const triggerBottom = window.innerHeight * 0.85;
    
    reveals.forEach(reveal => {
        const revealTop = reveal.getBoundingClientRect().top;
        if (revealTop < triggerBottom) {
            reveal.classList.add('revealed');
        }
    });
}

function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.story-section');
    
    // 平滑捲動
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                const headerOffset = 70; // 扣除 Sticky Nav 高度
                const elementPosition = targetSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // ScrollSpy 高亮目前單元
    window.addEventListener('scroll', () => {
        let current = '';
        const scrollPos = window.scrollY + 120; // 偏移量
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-target') === current) {
                link.classList.add('active');
            }
        });
    });
}

// ==========================================================================
// 7. 第四章：戀愛闖關遊戲主控台
// ==========================================================================
const LEVEL_NAMES = [
    "關卡 1/7 : 回憶大考驗",
    "關卡 2/7 : 第一次約會地點",
    "關卡 3/7 : 棒球場的特別回憶",
    "關卡 4/7 : 我們的戀愛賓果",
    "關卡 5/7 : 愛心接接樂",
    "關卡 6/7 : 蠻牛的真心話翻牌",
    "關卡 7/7 : 最終密碼"
];

function setupGameDashboard() {
    const current = gameState.currentLevel;
    
    // 更新進度條寬度
    const fillPercent = ((current - 1) / 6) * 100;
    document.getElementById('gameProgressFill').style.width = `${fillPercent}%`;
    
    // 更新節點樣式
    for (let i = 1; i <= 7; i++) {
        const node = document.getElementById(`node-${i}`);
        if (!node) continue;
        
        node.classList.remove('active', 'completed');
        
        if (i < current) {
            node.classList.add('completed');
            node.innerHTML = '<i class="fas fa-check"></i>';
        } else if (i === current) {
            node.classList.add('active');
            if (i === 7) {
                node.innerHTML = '<i class="fas fa-lock-open"></i>';
            } else {
                node.textContent = i;
            }
        } else {
            if (i === 7) {
                node.innerHTML = '<i class="fas fa-lock"></i>';
            } else {
                node.textContent = i;
            }
        }
    }
    
    // 更新頂部狀態文字
    document.getElementById('gameStatusText').textContent = LEVEL_NAMES[current - 1] || "恭喜解鎖最終結局！";
    
    // 切換關卡顯示
    document.querySelectorAll('.game-level').forEach(level => {
        level.classList.remove('active');
    });
    
    const activeLevelEl = document.getElementById(`level-${current}`);
    if (activeLevelEl) {
        activeLevelEl.classList.add('active');
    }
    
    // 預設鎖定下一關按鈕，通關後解鎖
    lockNextLevelBtn();
    
    // 如果之前就已經通過此關，自動解鎖下一關按鈕
    checkLevelPreCompleted();
}

function lockNextLevelBtn() {
    const btn = document.getElementById('nextLevelBtn');
    btn.classList.add('disabled');
    btn.disabled = true;
}

function unlockNextLevelBtn() {
    const btn = document.getElementById('nextLevelBtn');
    btn.classList.remove('disabled');
    btn.disabled = false;
    btn.style.boxShadow = '0 0 15px var(--pink-glow)';
}

// 進入下一關
function nextLevel() {
    if (gameState.currentLevel < 7) {
        gameState.currentLevel++;
        saveGameState();
        setupGameDashboard();
        
        // 如果進入關卡5，自動初始化或準備遊戲
        if (gameState.currentLevel === 5) {
            document.getElementById('gameStartOverlay').classList.remove('hidden');
        }
    }
}

// 檢查此關是否已通關（載入網頁時或重載關卡時）
function checkLevelPreCompleted() {
    const current = gameState.currentLevel;
    
    if (current === 1) {
        // 點過正確選項即通關
        const successMsg = document.getElementById('feedback-1-success');
        if (successMsg && !successMsg.classList.contains('hidden')) {
            unlockNextLevelBtn();
        }
    } else if (current === 2) {
        const successMsg = document.getElementById('feedback-2-success');
        if (successMsg && !successMsg.classList.contains('hidden')) {
            unlockNextLevelBtn();
        }
    } else if (current === 3) {
        const successMsg = document.getElementById('feedback-3-success');
        if (successMsg && !successMsg.classList.contains('hidden')) {
            unlockNextLevelBtn();
        }
    } else if (current === 4) {
        if (checkBingoWin(false)) {
            unlockNextLevelBtn();
        }
    } else if (current === 5) {
        const successMsg = document.getElementById('feedback-5-success');
        if (successMsg && !successMsg.classList.contains('hidden')) {
            unlockNextLevelBtn();
        }
    } else if (current === 6) {
        if (gameState.flippedCardCount >= 8) {
            document.getElementById('feedback-6-success').classList.remove('hidden');
            unlockNextLevelBtn();
        }
    }
}

// 關卡 1 : 選擇題
const level1Options = document.querySelectorAll('#level-1 .option-btn');
level1Options.forEach(btn => {
    btn.addEventListener('click', () => {
        if (gameState.currentLevel !== 1) return;
        
        const ans = btn.getAttribute('data-answer');
        const errEl = document.getElementById('feedback-1-err');
        const succEl = document.getElementById('feedback-1-success');
        
        // 重置樣式
        level1Options.forEach(b => b.classList.remove('selected-correct', 'selected-wrong'));
        errEl.classList.add('hidden');
        succEl.classList.add('hidden');
        
        if (ans === 'A') {
            btn.classList.add('selected-correct');
            succEl.classList.remove('hidden');
            unlockNextLevelBtn();
        } else {
            btn.classList.add('selected-wrong');
            errEl.classList.remove('hidden');
            lockNextLevelBtn();
        }
    });
});

// 關卡 2 : 第一次約會 (台北101、薩利亞)
function checkLevel2() {
    const input = document.getElementById('answer-2');
    const val = input.value.trim().toLowerCase();
    const errEl = document.getElementById('feedback-2-err');
    const succEl = document.getElementById('feedback-2-success');
    
    errEl.classList.add('hidden');
    succEl.classList.add('hidden');
    
    // 比對關鍵字（寬鬆比對，避免因輸入法、全半角或標點符號不合而卡關）
    const has101 = val.includes('101') || val.includes('１０１') || val.includes('一百零一');
    const hasSalia = val.includes('薩') || val.includes('薩利亞') || val.includes('Saizeriya') || val.includes('saizeriya');
    
    if (has101 && hasSalia) {
        succEl.classList.remove('hidden');
        unlockNextLevelBtn();
    } else {
        errEl.classList.remove('hidden');
        lockNextLevelBtn();
    }
}

// 關卡 3 : 棒球回憶 (張志豪回歸第一次上場)
function checkLevel3() {
    const input = document.getElementById('answer-3');
    const val = input.value.trim();
    const errEl = document.getElementById('feedback-3-err');
    const succEl = document.getElementById('feedback-3-success');
    
    errEl.classList.add('hidden');
    succEl.classList.add('hidden');
    
    // 只要有主角「張志豪」就放行通關
    if (val.includes('張志豪') || val.includes('志豪')) {
        succEl.classList.remove('hidden');
        unlockNextLevelBtn();
    } else {
        errEl.classList.remove('hidden');
        lockNextLevelBtn();
    }
}

// ==========================================================================
// 8. 關卡 4 : 戀愛賓果 (3x3 Grid)
// ==========================================================================
const BINGO_ITEMS = [
    "第一次見面", "第一次約會", "第一次看棒球",
    "一起打王者", "一起視訊", "一起打電話",
    "一起吵架又和好", "一起過生日", "一周年"
];

function initBingoGame() {
    const board = document.getElementById('bingoBoard');
    if (!board) return;
    board.innerHTML = '';
    
    BINGO_ITEMS.forEach((item, index) => {
        const cell = document.createElement('div');
        cell.className = 'bingo-cell';
        cell.textContent = item;
        cell.setAttribute('data-index', index);
        
        // 恢復之前的選擇狀態
        if (gameState.bingoActiveCells.includes(index)) {
            cell.classList.add('active');
        }
        
        cell.addEventListener('click', () => {
            if (gameState.currentLevel !== 4) return;
            
            cell.classList.toggle('active');
            
            // 更新狀態
            const cellIdx = parseInt(cell.getAttribute('data-index'));
            if (cell.classList.contains('active')) {
                if (!gameState.bingoActiveCells.includes(cellIdx)) {
                    gameState.bingoActiveCells.push(cellIdx);
                }
            } else {
                gameState.bingoActiveCells = gameState.bingoActiveCells.filter(idx => idx !== cellIdx);
            }
            saveGameState();
            
            // 檢查是否連線成功
            checkBingoWin(true);
        });
        
        board.appendChild(cell);
    });
    
    // 初始檢查一遍
    checkBingoWin(false);
}

function checkBingoWin(showFeedback = true) {
    const cells = document.querySelectorAll('.bingo-cell');
    const active = gameState.bingoActiveCells;
    const succEl = document.getElementById('feedback-4-success');
    
    // 3x3 賓果連線組合
    const winCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // 橫線
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // 直線
        [0, 4, 8], [2, 4, 6]             // 對角線
    ];
    
    let isWin = false;
    let winningCombo = [];
    
    for (const combo of winCombinations) {
        if (combo.every(idx => active.includes(idx))) {
            isWin = true;
            winningCombo = combo;
            break;
        }
    }
    
    // 清除所有贏的閃爍樣式
    cells.forEach(c => c.classList.remove('winning'));
    
    if (isWin) {
        // 高亮獲勝線路
        winningCombo.forEach(idx => {
            const match = Array.from(cells).find(c => parseInt(c.getAttribute('data-index')) === idx);
            if (match) match.classList.add('winning');
        });
        
        if (showFeedback && succEl) {
            succEl.classList.remove('hidden');
        }
        unlockNextLevelBtn();
        return true;
    } else {
        if (succEl) succEl.classList.add('hidden');
        lockNextLevelBtn();
        return false;
    }
}

// ==========================================================================
// 9. 關卡 5 : 愛心接接樂 (Canvas 2D 互動遊戲)
// ==========================================================================
let catchGameId = null;
let catchScore = 0;
let catchTimeLeft = 30;
let catchBasket = { x: 130, y: 265, width: 70, height: 18 };
let catchHearts = [];
let isCatchPlaying = false;
let catchGameTimerInterval = null;

const catchCanvas = document.getElementById('catchCanvas');
const catchCtx = catchCanvas ? catchCanvas.getContext('2d') : null;

if (catchCanvas) {
    // 監聽滑鼠或觸控拖曳移動花籃
    catchCanvas.addEventListener('mousemove', moveBasket);
    catchCanvas.addEventListener('touchmove', (e) => {
        e.preventDefault(); // 阻止滾動
        const touch = e.touches[0];
        const rect = catchCanvas.getBoundingClientRect();
        // 算出觸控在 canvas 內的相對 X 坐標
        const relativeX = (touch.clientX - rect.left) * (catchCanvas.width / rect.width);
        catchBasket.x = Math.max(0, Math.min(catchCanvas.width - catchBasket.width, relativeX - catchBasket.width / 2));
    }, { passive: false });
    
    document.getElementById('startCatchGameBtn').addEventListener('click', startCatchGame);
}

function moveBasket(e) {
    const rect = catchCanvas.getBoundingClientRect();
    const relativeX = (e.clientX - rect.left) * (catchCanvas.width / rect.width);
    catchBasket.x = Math.max(0, Math.min(catchCanvas.width - catchBasket.width, relativeX - catchBasket.width / 2));
}

function startCatchGame() {
    document.getElementById('gameStartOverlay').classList.add('hidden');
    document.getElementById('feedback-5-err').classList.add('hidden');
    document.getElementById('feedback-5-success').classList.add('hidden');
    
    catchScore = 0;
    catchTimeLeft = 30;
    catchHearts = [];
    isCatchPlaying = true;
    
    document.getElementById('catchScore').textContent = '0';
    document.getElementById('catchTimer').textContent = '30';
    
    // 啟動倒數計時器
    if (catchGameTimerInterval) clearInterval(catchGameTimerInterval);
    catchGameTimerInterval = setInterval(() => {
        catchTimeLeft--;
        document.getElementById('catchTimer').textContent = catchTimeLeft;
        
        if (catchTimeLeft <= 0) {
            endCatchGame();
        }
    }, 1000);
    
    // 啟動繪製與更新循環
    if (catchGameId) cancelAnimationFrame(catchGameId);
    runCatchLoop();
}

function runCatchLoop() {
    if (!isCatchPlaying) return;
    
    updateCatchGame();
    drawCatchGame();
    
    catchGameId = requestAnimationFrame(runCatchLoop);
}

function updateCatchGame() {
    // 隨機生成落下的愛心 ( spawn機率 )
    if (Math.random() < 0.04) {
        catchHearts.push({
            x: Math.random() * (catchCanvas.width - 20) + 10,
            y: -10,
            speed: Math.random() * 2.5 + 2, // 落下速度
            size: Math.random() * 5 + 15, // 15px - 20px
            symbol: Math.random() > 0.8 ? '💖' : '❤️' // 接到 💖 加特別高分
        });
    }
    
    // 更新愛心位置
    for (let i = catchHearts.length - 1; i >= 0; i--) {
        const h = catchHearts[i];
        h.y += h.speed;
        
        // 碰撞檢測：花籃 (Y在265以上，高度18以內)
        const isCollidedY = h.y + h.size >= catchBasket.y && h.y <= catchBasket.y + catchBasket.height;
        const isCollidedX = h.x + h.size >= catchBasket.x && h.x <= catchBasket.x + catchBasket.width;
        
        if (isCollidedY && isCollidedX) {
            // 接到了！
            const addScore = h.symbol === '💖' ? 8 : 5;
            catchScore += addScore;
            document.getElementById('catchScore').textContent = catchScore;
            
            // 粒子音效/畫面回饋：刪除該心
            catchHearts.splice(i, 1);
            
            // 超過50分即代表通關資格具備
            if (catchScore >= 50) {
                unlockNextLevelBtn();
            }
            continue;
        }
        
        // 落地刪除
        if (h.y > catchCanvas.height + 10) {
            catchHearts.splice(i, 1);
        }
    }
}

function drawCatchGame() {
    catchCtx.clearRect(0, 0, catchCanvas.width, catchCanvas.height);
    
    // 1. 畫花籃 (用一個浪漫的雙色漸層圓角矩形代表)
    const basketGrad = catchCtx.createLinearGradient(catchBasket.x, 0, catchBasket.x + catchBasket.width, 0);
    basketGrad.addColorStop(0, '#FF2E93');
    basketGrad.addColorStop(1, '#FF8E53');
    
    catchCtx.fillStyle = basketGrad;
    catchCtx.shadowBlur = 10;
    catchCtx.shadowColor = '#FF2E93';
    
    // 畫一個扁圓角矩形代表竹籃
    drawRoundRect(catchCtx, catchBasket.x, catchBasket.y, catchBasket.width, catchBasket.height, 8, true);
    
    // 2. 畫愛心
    catchCtx.shadowBlur = 5;
    catchCtx.shadowColor = '#FF2E93';
    catchCtx.font = '20px Outfit, sans-serif';
    catchCtx.textAlign = 'center';
    catchCtx.textBaseline = 'middle';
    
    catchHearts.forEach(h => {
        catchCtx.fillText(h.symbol, h.x + h.size/2, h.y);
    });
}

function drawRoundRect(ctx, x, y, width, height, radius, fill = true) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) ctx.fill();
    else ctx.stroke();
}

function endCatchGame() {
    isCatchPlaying = false;
    if (catchGameId) cancelAnimationFrame(catchGameId);
    if (catchGameTimerInterval) clearInterval(catchGameTimerInterval);
    
    const errEl = document.getElementById('feedback-5-err');
    const succEl = document.getElementById('feedback-5-success');
    
    if (catchScore >= 50) {
        succEl.classList.remove('hidden');
        unlockNextLevelBtn();
    } else {
        errEl.classList.remove('hidden');
        document.getElementById('gameStartOverlay').classList.remove('hidden');
        lockNextLevelBtn();
    }
}

// ==========================================================================
// 10. 關卡 6 : 真心話翻牌
// ==========================================================================
const SECRETS = [
    "我第一次看到妳，覺得妳超可愛。🥰",
    "我最喜歡和妳打電話。📞",
    "我最期待每天聽到妳的聲音。🎧",
    "和妳打王者榮耀也是我很珍惜的日常。🎮",
    "我知道我們會吵架，但我更想和妳好好走下去。🌹",
    "妳是我的唯一。❤️",
    "未來我還想帶妳去更多地方。✈️",
    "我想和妳結婚。💍"
];

function initFlipCards() {
    const grid = document.getElementById('cardFlipGrid');
    if (!grid) return;
    grid.innerHTML = '';
    
    SECRETS.forEach((secret, index) => {
        const card = document.createElement('div');
        card.className = 'flip-card';
        card.setAttribute('data-index', index);
        
        card.innerHTML = `
            <div class="flip-card-inner">
                <div class="flip-card-front">
                    💖
                    <span>點擊翻牌</span>
                </div>
                <div class="flip-card-back">
                    <p>${secret}</p>
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => {
            if (gameState.currentLevel !== 6) return;
            if (card.classList.contains('flipped')) return; // 不能重複計算
            
            card.classList.add('flipped');
            
            // 計算翻轉數量
            gameState.flippedCardCount++;
            saveGameState();
            
            if (gameState.flippedCardCount >= 8) {
                document.getElementById('feedback-6-success').classList.remove('hidden');
                unlockNextLevelBtn();
            }
        });
        
        grid.appendChild(card);
    });
}

// ==========================================================================
// 11. 關卡 7 : 最終解鎖密碼 (在一起日期 20250703)
// ==========================================================================
// 這三個函式要掛載在 window 上，因為 index.html 中寫的是 inline onclick
window.pressKey = function(num) {
    if (gameState.currentLevel !== 7) return;
    if (passwordBuffer.length >= 8) return; // 8碼限制
    
    passwordBuffer += num;
    updatePasswordDisplay();
};

window.clearKeys = function() {
    passwordBuffer = '';
    updatePasswordDisplay();
};

function updatePasswordDisplay() {
    const display = document.getElementById('passwordDisplay');
    if (passwordBuffer.length === 0) {
        display.textContent = '--------';
    } else {
        display.textContent = passwordBuffer.padEnd(8, '-');
    }
}

window.checkLevel7 = function() {
    if (gameState.currentLevel !== 7) return;
    
    const errEl = document.getElementById('feedback-7-err');
    const succEl = document.getElementById('feedback-7-success');
    
    errEl.classList.add('hidden');
    succEl.classList.add('hidden');
    
    if (passwordBuffer === '20250703') {
        succEl.classList.remove('hidden');
        gameState.isConfessionUnlocked = true;
        saveGameState();
        
        setTimeout(() => {
            triggerFinalConfession();
        }, 1500);
    } else {
        errEl.classList.remove('hidden');
        passwordBuffer = '';
        updatePasswordDisplay();
    }
};

// ==========================================================================
// 12. 最終告白動畫 (Typewriter & VIP Pass)
// ==========================================================================
const CONFESSION_TEXT = `恭喜妳完成所有挑戰

接下來這段話
只想給妳看

寶寶～

這是我們第一個周年。

未來還有好多個一年。

不管遇到什麼事情
都阻擋不了我跟妳在一起。

妳就是我的唯一。

我愛妳。

寶寶 ❤️`;

function triggerFinalConfession() {
    const screen = document.getElementById('confessionScreen');
    const textEl = document.getElementById('typewriterText');
    const badgeEl = document.getElementById('finalBadge');
    const btnContainer = document.getElementById('confessionButtons');
    const companionPrompt = document.getElementById('companionPrompt');
    
    // 初始化畫面
    textEl.innerHTML = '';
    badgeEl.classList.add('hidden');
    btnContainer.classList.add('hidden');
    if (companionPrompt) companionPrompt.classList.add('hidden');
    document.getElementById('vipCardModal').classList.add('hidden');
    
    screen.classList.add('active');
    
    // 暫停 Spotify 音樂（防止背景嘈雜）
    const audio = document.getElementById(CONFIG.music.audioId);
    if (audio) {
        audio.pause();
        setSpotifyPlaying(false);
    }
    
    // 開始打字機動畫
    let charIndex = 0;
    textEl.classList.add('typewriter-cursor');
    
    function type() {
        if (charIndex < CONFESSION_TEXT.length) {
            const char = CONFESSION_TEXT.charAt(charIndex);
            textEl.innerHTML += char;
            charIndex++;
            
            // 打字速度 (中文字慢點有感覺)
            setTimeout(type, char === '\n' ? 600 : 100);
        } else {
            // 打完字，去除閃爍游標
            textEl.classList.remove('typewriter-cursor');
            
            // 漸入 一周年 季末徽章
            setTimeout(() => {
                badgeEl.classList.remove('hidden');
                
                // V2：先顯示系統偵測陪伴提示，再讓寶寶選續約
                setTimeout(() => {
                    if (companionPrompt) companionPrompt.classList.remove('hidden');
                }, 1000);
            }, 800);
        }
    }
    
    setTimeout(type, 1000);
    
    // 綁定續約按鈕事件
    const continueBtn = document.getElementById('btn-continue-love');
    if (continueBtn) {
        continueBtn.onclick = () => {
            if (companionPrompt) companionPrompt.classList.add('hidden');
            btnContainer.classList.remove('hidden');
        };
    }
    document.getElementById('btn-renew-year').addEventListener('click', showVipCard);
    document.getElementById('btn-renew-forever').addEventListener('click', showVipCard);
    document.getElementById('closeConfessionBtn').addEventListener('click', closeConfession);
}

function showVipCard() {
    document.getElementById('confessionButtons').classList.add('hidden');
    const modal = document.getElementById('vipCardModal');
    modal.classList.remove('hidden');

    // V2：電影結尾效果
    if (!document.getElementById('endingCredit')) {
        const credit = document.createElement('div');
        credit.id = 'endingCredit';
        credit.className = 'ending-credit';
        credit.innerHTML = `
            <div class="names">蠻牛 ❤️ 寶寶</div>
            <div class="forever">2025/07/03 - Forever</div>
            <div class="the-end">The End ❤️</div>
        `;
        modal.appendChild(credit);
    }
}

function closeConfession() {
    document.getElementById('confessionScreen').classList.remove('active');
    
    // 重點播放背景歌曲
    const audio = document.getElementById(CONFIG.music.audioId);
    if (audio) {
        audio.play().then(() => {
            setSpotifyPlaying(true);
        });
    }
}

// ==========================================================================
// 13. 第五章：Spotify 回憶播放器卡片
// ==========================================================================
let simulatedTimer = null;
let currentMockSeconds = 0;
const totalMockSeconds = 300; // 5分鐘 (05:00)

const MEMORY_MARKS = [
    { time: 0, labelId: 'lbl-meet', name: '00:00 相遇' },
    { time: 60, labelId: 'lbl-together', name: '01:00 在一起' },
    { time: 120, labelId: 'lbl-firstmeet', name: '02:00 第一次見面' },
    { time: 180, labelId: 'lbl-firstdate', name: '03:00 第一次約會' },
    { time: 240, labelId: 'lbl-baseball', name: '04:00 第一次看棒球' },
    { time: 300, labelId: 'lbl-anniversary', name: '05:00 一周年' }
];

function initSpotifyPlayer() {
    const playPauseBtn = document.getElementById('spotifyPlayPause');
    const audio = document.getElementById(CONFIG.music.audioId);
    
    // 綁定播放暫停
    playPauseBtn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play().then(() => {
                setSpotifyPlaying(true);
            }).catch(() => {
                // 如果實體 mp3 不存在，依然模擬播放效果
                setSpotifyPlaying(!isVinylSpinning());
            });
        } else {
            audio.pause();
            setSpotifyPlaying(false);
        }
    });
    
    // 實體音樂進度更新
    audio.addEventListener('timeupdate', () => {
        if (!audio.duration) return;
        
        // 將實體音樂的時間對應至 0-300 秒模擬進度
        const pct = audio.currentTime / audio.duration;
        const mockSeconds = pct * totalMockSeconds;
        updateSpotifyProgress(mockSeconds);
    });
    
    audio.addEventListener('ended', () => {
        setSpotifyPlaying(false);
        updateSpotifyProgress(0);
    });
    
    // 綁定時間軸刻度點擊
    MEMORY_MARKS.forEach(mark => {
        const label = document.getElementById(mark.labelId);
        if (label) {
            label.addEventListener('click', () => {
                seekSpotifyTo(mark.time);
            });
        }
    });
    
    // 綁定控制鈕 (上一段 / 下一段)
    document.getElementById('spotifyPrev').addEventListener('click', () => {
        // 尋找小於目前時間且最接近的 mark
        let targetTime = 0;
        for (let i = MEMORY_MARKS.length - 1; i >= 0; i--) {
            if (MEMORY_MARKS[i].time < currentMockSeconds - 2) {
                targetTime = MEMORY_MARKS[i].time;
                break;
            }
        }
        seekSpotifyTo(targetTime);
    });
    
    document.getElementById('spotifyNext').addEventListener('click', () => {
        // 尋找大於目前時間且最接近的 mark
        let targetTime = 300;
        for (let i = 0; i < MEMORY_MARKS.length; i++) {
            if (MEMORY_MARKS[i].time > currentMockSeconds) {
                targetTime = MEMORY_MARKS[i].time;
                break;
            }
        }
        seekSpotifyTo(targetTime);
    });
    
    // 隨機播放與重複播放（純視覺點亮效果）
    const shuffleBtn = document.getElementById('spotifyShuffle');
    const repeatBtn = document.getElementById('spotifyRepeat');
    
    shuffleBtn.addEventListener('click', () => shuffleBtn.classList.toggle('active'));
    repeatBtn.addEventListener('click', () => repeatBtn.classList.toggle('active'));
    
    // 點擊進度條直接跳轉
    const progressBar = document.getElementById('spotifyProgressBar');
    progressBar.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        const targetTime = Math.max(0, Math.min(totalMockSeconds, pct * totalMockSeconds));
        seekSpotifyTo(targetTime);
    });
}

function isVinylSpinning() {
    return document.getElementById('vinylRecord').classList.contains('spinning');
}

function setSpotifyPlaying(isPlaying) {
    const playIcon = document.getElementById('playIcon');
    const vinyl = document.getElementById('vinylRecord');
    const needle = document.getElementById('vinylNeedle');
    
    if (isPlaying) {
        playIcon.className = 'fas fa-pause';
        vinyl.classList.add('spinning');
        needle.classList.add('active');
        
        // 啟動模擬定時器 (如果是模擬播放)
        const audio = document.getElementById(CONFIG.music.audioId);
        // 如果音訊載入失敗（例如路徑沒有實體mp3），我們跑 JS 模擬器
        if (audio.paused || audio.readyState < 2) {
            if (!simulatedTimer) {
                simulatedTimer = setInterval(() => {
                    currentMockSeconds = (currentMockSeconds + 1) % (totalMockSeconds + 1);
                    updateSpotifyProgress(currentMockSeconds);
                }, 1000);
            }
        }
    } else {
        playIcon.className = 'fas fa-play';
        vinyl.classList.remove('spinning');
        needle.classList.remove('active');
        
        // 清除模擬計時器
        if (simulatedTimer) {
            clearInterval(simulatedTimer);
            simulatedTimer = null;
        }
    }
}

function seekSpotifyTo(seconds) {
    currentMockSeconds = seconds;
    
    // 同步到實體音樂
    const audio = document.getElementById(CONFIG.music.audioId);
    if (audio && audio.duration) {
        audio.currentTime = (seconds / totalMockSeconds) * audio.duration;
    }
    
    updateSpotifyProgress(seconds);
}

function updateSpotifyProgress(seconds) {
    currentMockSeconds = seconds;
    const progressPct = (seconds / totalMockSeconds) * 100;
    
    // 更新 UI 進度條與握把位置
    document.getElementById('spotifyProgressFill').style.width = `${progressPct}%`;
    
    // 更新時間文字 (模擬的五分鐘格式)
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    document.getElementById('spotifyCurrentTime').textContent = `${minutes}:${String(secs).padStart(2, '0')}`;
    
    // 更新高亮刻度
    let currentMark = MEMORY_MARKS[0];
    for (let i = 0; i < MEMORY_MARKS.length; i++) {
        if (seconds >= MEMORY_MARKS[i].time) {
            currentMark = MEMORY_MARKS[i];
        }
    }
    
    MEMORY_MARKS.forEach(mark => {
        const label = document.getElementById(mark.labelId);
        if (label) {
            if (mark.labelId === currentMark.labelId) {
                label.classList.add('active');
            } else {
                label.classList.remove('active');
            }
        }
    });
}

// ==========================================================================
// 14. 第六章：Polaroid 相片牆動態載入與隨機旋轉
// ==========================================================================
function initPolaroidGrid() {
    const grid = document.getElementById('polaroidGrid');
    if (!grid) return;
    grid.innerHTML = '';
    
    CONFIG.photos.forEach((photo, index) => {
        const card = document.createElement('div');
        card.className = 'polaroid-card';
        card.setAttribute('data-photo-index', index);
        
        // 隨機旋轉傾斜角 (-6deg 到 6deg 之間)，讓拍立得看起來更隨性真實
        const randomRotate = (Math.random() * 12 - 6).toFixed(1);
        card.style.transform = `rotate(${randomRotate}deg)`;
        
        card.innerHTML = `
            <div class="polaroid-img-wrapper">
                <img src="${photo.path}" alt="${photo.caption}" onerror="this.src='https://placehold.co/400x400/1e1013/ff2a5f?text=Photo+${index+1}'">
            </div>
            <div class="polaroid-caption font-serif">${photo.caption}</div>
        `;
        
        card.addEventListener('click', () => {
            openLightbox(index);
        });
        
        grid.appendChild(card);
    });
}

// ==========================================================================
// 15. Lightbox 畫廊放大縮小與切換邏輯
// ==========================================================================
let currentLightboxIndex = 0;

function initLightbox() {
    const lightbox = document.getElementById('photoLightbox');
    const closeBtn = document.querySelector('.close-lightbox');
    const prevBtn = document.getElementById('lightboxPrevBtn');
    const nextBtn = document.getElementById('lightboxNextBtn');
    
    // 點擊關閉
    closeBtn.addEventListener('click', closeLightbox);
    
    // 點擊黑底背景關閉
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });
    
    // 點擊上/下張
    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateLightbox(-1);
    });
    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateLightbox(1);
    });
    
    // 鍵盤左右控制
    document.addEventListener('keydown', (e) => {
        if (lightbox.style.display === 'flex') {
            if (e.key === 'ArrowLeft') navigateLightbox(-1);
            if (e.key === 'ArrowRight') navigateLightbox(1);
            if (e.key === 'Escape') closeLightbox();
        }
    });
}

function openLightbox(index) {
    const lightbox = document.getElementById('photoLightbox');
    currentLightboxIndex = index;
    updateLightboxContent();
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // 鎖定背景網頁捲動
}

function closeLightbox() {
    document.getElementById('photoLightbox').style.display = 'none';
    document.body.style.overflow = ''; // 還原捲動
}

function updateLightboxContent() {
    const photo = CONFIG.photos[currentLightboxIndex];
    const img = document.getElementById('lightboxImg');
    const caption = document.getElementById('lightboxCaption');
    
    // 先載入預設 placeholder 防止跳動
    img.src = ''; 
    img.src = photo.path;
    
    // 若載入失敗自動顯示 placeholder
    img.onerror = () => {
        img.src = `https://placehold.co/800x600/1e1013/ff2a5f?text=${encodeURIComponent(photo.caption)}`;
    };
    
    caption.textContent = photo.caption;
}

function navigateLightbox(dir) {
    const maxIdx = CONFIG.photos.length;
    currentLightboxIndex = (currentLightboxIndex + dir + maxIdx) % maxIdx;
    updateLightboxContent();
}

// ==========================================================================
// 16. 第七章：隱藏愛心彩蛋收集 (10個)
// ==========================================================================
function initEasterEggs() {
    const countEl = document.getElementById('eggCount');
    if (countEl) {
        countEl.textContent = gameState.collectedEggs.length;
    }
    
    // 綁定秘密房間關閉事件
    const closeSecretRoom = document.querySelector('.close-secret-room');
    if (closeSecretRoom) {
        closeSecretRoom.addEventListener('click', () => {
            document.getElementById('secretRoomModal').style.display = 'none';
        });
    }
    
    // 如果之前已經集滿 10 個，不重複生成
    if (gameState.collectedEggs.length >= 10) return;
    
    // 在網頁不同區塊動態生成 10 個懸浮愛心
    const pageHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
    const body = document.body;
    
    for (let i = 0; i < 10; i++) {
        // 如果這個彩蛋之前就點過了，跳過生成
        if (gameState.collectedEggs.includes(i)) continue;
        
        const egg = document.createElement('div');
        egg.className = 'easter-egg-heart';
        egg.innerHTML = '❤️';
        egg.style.position = 'absolute';
        egg.style.zIndex = '95';
        egg.style.cursor = 'pointer';
        egg.style.fontSize = '1.1rem';
        egg.style.userSelect = 'none';
        
        // 隨機分散在整張長網頁的不同寬高坐標中
        const xPos = Math.random() * 85 + 5; // 5% - 90%
        // 將高度分配到網頁的 10% - 90% 區間
        const yPos = Math.random() * (pageHeight - 200) + 100;
        
        egg.style.left = `${xPos}%`;
        egg.style.top = `${yPos}px`;
        egg.style.opacity = '0.35'; // 淡淡的，需要尋找
        egg.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        
        // 浮動動畫效果
        const pulseAnim = `floatEgg_${i}`;
        const keyframes = `
            @keyframes ${pulseAnim} {
                0% { transform: translateY(0) scale(1); }
                100% { transform: translateY(-8px) scale(1.15); }
            }
        `;
        const styleSheet = document.createElement('style');
        styleSheet.textContent = keyframes;
        document.head.appendChild(styleSheet);
        
        egg.style.animation = `${pulseAnim} ${Math.random()*2 + 2}s infinite alternate ease-in-out`;
        
        // 點擊收集事件
        egg.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // 加入已收集清單
            if (!gameState.collectedEggs.includes(i)) {
                gameState.collectedEggs.push(i);
            }
            saveGameState();
            
            // 粒子爆發與移除
            egg.style.transform = 'scale(2.5)';
            egg.style.opacity = '0';
            setTimeout(() => egg.remove(), 300);
            
            // 更新 UI 計數器
            countEl.textContent = gameState.collectedEggs.length;
            
            // 檢查是否收集完畢
            if (gameState.collectedEggs.length >= 10) {
                setTimeout(() => {
                    openSecretRoom();
                }, 800);
            }
        });
        
        body.appendChild(egg);
    }
}

function openSecretRoom() {
    const modal = document.getElementById('secretRoomModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

// ==========================================================================
// 17. 第八章：未來願望牆
// ==========================================================================
function initWishlist() {
    const validationBox = document.getElementById('marriageValidation');
    
    for (let i = 1; i <= 4; i++) {
        const cb = document.getElementById(`wish-${i}`);
        if (!cb) continue;
        
        // 恢復勾選狀態
        if (gameState.completedWishes.includes(i)) {
            cb.checked = true;
            if (i === 4 && validationBox) {
                validationBox.classList.remove('hidden');
            }
        }
        
        cb.addEventListener('change', () => {
            if (cb.checked) {
                if (!gameState.completedWishes.includes(i)) {
                    gameState.completedWishes.push(i);
                }
                
                // 勾選第四個願望「一起結婚」時，彈出驚喜有效憑證
                if (i === 4 && validationBox) {
                    validationBox.classList.remove('hidden');
                }
            } else {
                gameState.completedWishes = gameState.completedWishes.filter(id => id !== i);
                if (i === 4 && validationBox) {
                    validationBox.classList.add('hidden');
                }
            }
            saveGameState();
        });
    }
}
