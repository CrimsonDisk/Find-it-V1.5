// ============================================
// FND IT! - FIND THE DIFFERENCES GAME
// Version 2.0 - Optimized & Enhanced
// ============================================

// ============================================
// SAVE VERSION & MIGRATION
// ============================================

const SAVE_VERSION = 2;

/**
 * Migrate save data to current version
 */
function migrateSaveData(data) {
    // If no version, treat as v1
    if (!data.version || data.version < SAVE_VERSION) {
        // Ensure players structure exists
        if (!data.players) {
            data.players = {};
        }
        
        // Ensure dailyScores exists
        if (!data.dailyScores) {
            data.dailyScores = {};
        }
        
        // Ensure currentPlayer exists
        if (!data.currentPlayer) {
            data.currentPlayer = 'Guest';
        }
        
        // Migrate each player to ensure all required fields exist
        Object.keys(data.players).forEach(playerName => {
            const player = data.players[playerName];
            
            // Ensure all required fields exist with defaults
            if (typeof player.totalScore !== 'number') player.totalScore = 0;
            if (typeof player.highestScore !== 'number') player.highestScore = 0;
            if (typeof player.gamesPlayed !== 'number') player.gamesPlayed = 0;
            if (typeof player.bestTimeRemaining !== 'number') player.bestTimeRemaining = 0;
            if (typeof player.totalDifferenceBonuses !== 'number') player.totalDifferenceBonuses = 0;
            if (typeof player.leaderboardRank !== 'number') player.leaderboardRank = 0;
            
            // Remove any deprecated fields (if needed in future)
            // For now, keep all fields
        });
        
        // Ensure Guest player exists
        if (!data.players['Guest']) {
            data.players['Guest'] = createPlayerData();
        }
        
        // Update version
        data.version = SAVE_VERSION;
    }
    
    return data;
}

// ============================================
// ELEMENT REFERENCES
// ============================================

// Canvas elements
const canvasLeft = document.getElementById('canvasLeft');
const canvasRight = document.getElementById('canvasRight');
const ctxLeft = canvasLeft.getContext('2d');
const ctxRight = canvasRight.getContext('2d');

// Screen elements
const mainMenu = document.getElementById('mainMenu');
const settingsPanel = document.getElementById('settingsPanel');
const gameScreen = document.getElementById('gameScreen');
const leaderboardsScreen = document.getElementById('leaderboardsScreen');
const managePlayersScreen = document.getElementById('managePlayersScreen');

// Menu elements
const splashText = document.getElementById('splashText');
const playButton = document.getElementById('playButton');
const dailyChallengeButton = document.getElementById('dailyChallengeButton');
const leaderboardsButton = document.getElementById('leaderboardsButton');
const managePlayersButton = document.getElementById('managePlayersButton');
const dailyBadge = document.getElementById('dailyBadge');

// Settings elements
const difficultySelect = document.getElementById('difficultySelect');
const customDifficulty = document.getElementById('customDifficulty');
const mapSizeSelect = document.getElementById('mapSizeSelect');
const customWidth = document.getElementById('customWidth');
const customHeight = document.getElementById('customHeight');
const customSizeInputs = document.getElementById('customSizeInputs');
const timerSelect = document.getElementById('timerSelect');
const customTimer = document.getElementById('customTimer');
const startButton = document.getElementById('startButton');
const backToMenuButton = document.getElementById('backToMenuButton');

// Game elements
const foundCountSpan = document.getElementById('foundCount');
const totalCountSpan = document.getElementById('totalCount');
const timerDisplay = document.getElementById('timerDisplay');
const comboDisplay = document.getElementById('comboDisplay');
const comboMultiplier = document.getElementById('comboMultiplier');
const restartButton = document.getElementById('restartButton');
const backToMenuFromGame = document.getElementById('backToMenuFromGame');
const currentPlayerDisplay = document.getElementById('currentPlayerDisplay');

// Score display elements
const totalScoreDisplay = document.getElementById('totalScoreDisplay');
const highestScoreDisplay = document.getElementById('highestScoreDisplay');
const gamesPlayedDisplay = document.getElementById('gamesPlayedDisplay');

// Leaderboard elements
const leaderboardContent = document.getElementById('leaderboardContent');
const backFromLeaderboards = document.getElementById('backFromLeaderboards');

// Player management elements
const currentPlayerName = document.getElementById('currentPlayerName');
const playerList = document.getElementById('playerList');
const newPlayerName = document.getElementById('newPlayerName');
const createPlayerButton = document.getElementById('createPlayerButton');
const exportPlayerButton = document.getElementById('exportPlayerButton');
const exportAllPlayersButton = document.getElementById('exportAllPlayersButton');
const importPlayerButton = document.getElementById('importPlayerButton');
const importPlayerFile = document.getElementById('importPlayerFile');
const backFromPlayers = document.getElementById('backFromPlayers');

// Overlay elements
const winOverlay = document.getElementById('winOverlay');
const timeUpOverlay = document.getElementById('timeUpOverlay');
const newGameButton = document.getElementById('newGameButton');
const restartAfterTimeUp = document.getElementById('restartAfterTimeUp');
const backToMenuFromWin = document.getElementById('backToMenuFromWin');
const backToMenuFromTimeUp = document.getElementById('backToMenuFromTimeUp');
const differenceBonusesDisplay = document.getElementById('differenceBonusesDisplay');
const comboBonusDisplay = document.getElementById('comboBonusDisplay');
const timeBonusDisplay = document.getElementById('timeBonusDisplay');
const roundScoreDisplay = document.getElementById('roundScoreDisplay');
const timeRemainingDisplay = document.getElementById('timeRemainingDisplay');
const dailyScoreNote = document.getElementById('dailyScoreNote');

// New UI elements
const shapeCircle = document.getElementById('shapeCircle');
const shapeSquare = document.getElementById('shapeSquare');
const shapeStar = document.getElementById('shapeStar');
const shapeBox = document.getElementById('shapeBox');
const shapeTriangle = document.getElementById('shapeTriangle');
const shapePentagon = document.getElementById('shapePentagon');
const shapeEgg = document.getElementById('shapeEgg');
const colorRed = document.getElementById('colorRed');
const colorBlue = document.getElementById('colorBlue');
const colorOrange = document.getElementById('colorOrange');
const colorGreen = document.getElementById('colorGreen');
const colorPurple = document.getElementById('colorPurple');
const colorBlack = document.getElementById('colorBlack');
const colorCyan = document.getElementById('colorCyan');
const colorLime = document.getElementById('colorLime');
const colorBrown = document.getElementById('colorBrown');
const hintButton = document.getElementById('hintButton');
const mathQuestionModal = document.getElementById('mathQuestionModal');
const mathQuestionText = document.getElementById('mathQuestionText');
const mathAnswerInput = document.getElementById('mathAnswerInput');
const submitMathAnswer = document.getElementById('submitMathAnswer');
const cancelMathQuestion = document.getElementById('cancelMathQuestion');
const mathFeedback = document.getElementById('mathFeedback');

// ============================================
// GAME STATE VARIABLES
// ============================================

let originalShapes = [];
let modifiedShapes = [];
let differences = [];
let foundDifferences = [];
let totalDifferences = 0;
let gameActive = false;
let timerInterval = null;
let currentTimer = 0;
let totalTimer = 0;
let differenceBonuses = 0;
let comboBonus = 0;
let currentSettings = {};
let isDailyChallenge = false;
let dailySeed = null;
let currentMathQuestion = null;
let currentMathAnswer = null;
let hintedDifferences = []; // Track which differences were revealed by hints

// Combo system
let comboCount = 0;
let comboMultiplierValue = 1.0;
let lastFindTime = 0;
const COMBO_TIMEOUT = 3000; // 3 seconds

// Particle system
let particles = [];
let lastFrameTime = 0;

// Player data structure
let playerData = {
    version: SAVE_VERSION,
    players: {},
    currentPlayer: 'Guest',
    dailyScores: {}
};

// ============================================
// 100-LINE SPLASH TEXT PACK (WITH SHAPE JOKES)
// ============================================

const SPLASH_TEXTS = [
    "Why did the circle get promoted? It always went around in the right direction!",
    "A square walked into a bar… and couldn't fit through the door!",
    "What's a star's favorite social media? Instagram, of course.",
    "Boxes hate parties… they always feel boxed in.",
    "Why did the triangle fail math? It couldn't find its angles.",
    "Pentagon tried to join a band, but it was too edgy.",
    "Eggs never tell secrets—they might crack under pressure.",
    "Circle applied for a job… it had round-the-clock experience.",
    "Square went to therapy… it felt too cornered.",
    "Stars don't gossip, they just twinkle.",
    "A box at a party says: \"I'm just here for the wrapping.\"",
    "Triangle told a joke… it was a real sharp one.",
    "Pentagon prefers math class… it's well-rounded there.",
    "Eggs enjoy comedy shows… they scramble with laughter.",
    "Circle went to the gym… it wanted to shape up.",
    "Squares always follow the rules… they hate curves.",
    "Stars get jealous… but only of the moon.",
    "Box ran a marathon… it boxed its way through.",
    "Triangle had a crush… it fell for an acute angle.",
    "Pentagon joined a gym… to stay in shape.",
    "Eggs love math… they're good at multiplication.",
    "Circle hates corners… they make it uncomfortable.",
    "Squares are loyal friends… they never curve.",
    "Star: \"I'm too bright for this dark room.\"",
    "Box tried karaoke… it sang in a flat tone.",
    "Triangles make bad liars… they're too sharp to hide.",
    "Pentagon is confident… all angles covered.",
    "Eggs: \"We're egg-cited for the weekend!\"",
    "Circle loves puzzles… it completes the loop.",
    "Square: \"I'm straight to the point.\"",
    "Stars love camping—they sparkle at night.",
    "Box loves secrets… they're always inside.",
    "Triangle wanted fame… it wanted to be acute star.",
    "Pentagon can't lie… its edges show everything.",
    "Eggs are patient… they wait to hatch ideas.",
    "Circle went on vacation… it went full round.",
    "Squares are fashionable—they love sharp lines.",
    "Star: \"I've got a lot of points in life.\"",
    "Box has a dream… to be unboxed someday.",
    "Triangle told a story… it had three sides to it.",
    "Pentagon enjoys parties… it brings shape to chaos.",
    "Eggs love the internet… they're great at cracking codes.",
    "Circle tried comedy… it went around in circles.",
    "Squares dislike surprises… everything must fit.",
    "Star: \"I'm a little spaced out today.\"",
    "Box is thoughtful… it always has a lid on it.",
    "Triangle wanted to be an artist… it always drew attention.",
    "Pentagon went to a dentist… for sharp teeth.",
    "Eggs love sports… they're egg-cellent athletes.",
    "Circle: \"Life comes full circle sometimes.\"",
    "Squares are serious… they don't go off track.",
    "Star went to therapy… it needed to shine inside.",
    "Box is reliable… it always carries the load.",
    "Triangle loves climbing… it's always acute up top.",
    "Pentagon: \"I'm well-structured for success.\"",
    "Eggs are funny—they always have yolks.",
    "Circle is smooth… it never gets rough edges.",
    "Squares have parties… but everyone sits in lines.",
    "Star: \"I need a little space.\"",
    "Box likes routines… everything is squared away.",
    "Triangle went on a diet… it cut corners.",
    "Pentagon studied hard… it aced all angles.",
    "Eggs: \"Don't put all your eggs in one basket!\"",
    "Circle loves meditation… it finds inner peace.",
    "Squares are punctual… they stick to the timetable.",
    "Star is adventurous… it's always shooting for more.",
    "Box loves music… it always keeps it in tune.",
    "Triangle went hiking… it loves peaks.",
    "Pentagon joined a debate… it has strong points.",
    "Eggs are artistic… they love shell-fies.",
    "Circle enjoys yoga… it's all about the flow.",
    "Squares plan vacations… everything in order.",
    "Star went swimming… it's a twinkle in the water.",
    "Box: \"I like to think inside the box.\"",
    "Triangle tried math… it found it acute challenge.",
    "Pentagon loves chess… every move has a point.",
    "Eggs are curious… always cracking mysteries.",
    "Circle: \"I'm rolling with it!\"",
    "Squares are reliable… they always line up.",
    "Star loves winter… snowflakes remind it of itself.",
    "Box has secrets… it keeps everything boxed up.",
    "Triangle loves puzzles… three sides, endless possibilities.",
    "Pentagon walks with confidence… it has all corners covered.",
    "Eggs are comedians… they crack up easily.",
    "Circle: \"I can go on forever.\"",
    "Squares are strong… they hold their shape.",
    "Star: \"I'm small but mighty—look at my points!\"",
    "Got nothing to do? You do now.",
    "Your eyes are either amazing or doomed.",
    "These shapes fear you.",
    "Warning: Circles detected in the area.",
    "Try not to blink. Seriously.",
    "If you lose, blame the lighting.",
    "Scientifically verified time waster.",
    "Spot stuff. Win nothing.",
    "The differences hide because they're scared.",
    "Circles are round. Squares are square. Good luck.",
    "Got nothing to do? Time to spot some sneaky shapes!",
    "Your eyes vs. my randomness. Good luck.",
    "Warning: These circles bite.",
    "Find them before they find you.",
    "Train your eyes. Impress nobody.",
    "The shapes are watching. Always watching.",
    "Difference detection: Expert mode activated.",
    "Your mission: Find what shouldn't be there.",
    "Shapes have feelings too. Find them anyway.",
    "This game is harder than it looks. Probably.",
    "Spot the difference. Or don't. We're not judging.",
    "Warning: May cause temporary blindness.",
    "The shapes are plotting against you.",
    "Find differences. Save the world. Or just pass time.",
    "Your eyesight will be tested. And possibly broken.",
    "Circles and squares are conspiring. Find them.",
    "The ultimate test of observation skills.",
    "Shapes don't lie. But they do hide.",
    "Can you spot what's different? Probably not.",
    "This is harder than finding Waldo. Maybe.",
    "The shapes are restless. Find the rebels.",
    "Warning: Contains traces of difficulty.",
    "Your eyes will thank you. Or curse you.",
    "Find the differences. Or find something else to do.",
    "The shapes are hiding. They're not very good at it.",
    "Spot stuff. Feel accomplished. Repeat.",
    "This game: Now with 100% more shapes!",
    "The differences are shy. Help them come out.",
    "Your eyes vs. random shapes. Place your bets.",
    "Warning: May cause excessive squinting.",
    "Find them all. Or find most of them. Or some.",
    "The shapes are different. You just need to see it.",
    "This is like Where's Waldo, but with shapes.",
    "The ultimate shape-spotting challenge.",
    "Your eyesight: About to be tested.",
    "Shapes are sneaky. But you're sneakier. Maybe.",
    "Find the differences. Or don't. Your choice.",
    "Warning: Shapes may cause confusion.",
    "The shapes are waiting. They're very patient.",
    "Spot the difference. It's right there. Probably.",
    "This game: Because staring at shapes is fun."
];

// ============================================
// SEEDED RANDOM NUMBER GENERATOR (Daily Challenge)
// ============================================

class SeededRandom {
    constructor(seed) {
        // Ensure seed is a positive integer
        this.seed = Math.abs(Math.floor(seed)) || 1;
    }

    // LCG (Linear Congruential Generator) - deterministic PRNG
    next() {
        this.seed = (this.seed * 1664525 + 1013904223) % Math.pow(2, 32);
        return this.seed / Math.pow(2, 32);
    }

    // Random float 0-1
    randomFloat() {
        return this.next();
    }

    // Random integer min-max (inclusive)
    randomInt(min, max) {
        return Math.floor(this.next() * (max - min + 1)) + min;
    }

    // Pick random element from array
    pick(array) {
        return array[this.randomInt(0, array.length - 1)];
    }
}

// Global seeded RNG (null for normal mode, SeededRandom instance for daily)
let seededRNG = null;

/**
 * Generate seed from date (YYYY-MM-DD)
 */
function getDailySeed() {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
        const char = dateStr.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    
    return Math.abs(hash);
}

/**
 * Seed daily RNG
 */
function seedDailyRNG(seed) {
    seededRNG = new SeededRandom(seed);
}

/**
 * Daily random float (0-1)
 */
function dailyRandom() {
    if (!seededRNG) return Math.random();
    return seededRNG.randomFloat();
}

/**
 * Daily random integer
 */
function dailyRandomInt(min, max) {
    if (!seededRNG) return Math.floor(Math.random() * (max - min + 1)) + min;
    return seededRNG.randomInt(min, max);
}

/**
 * Daily pick from array
 */
function dailyPick(array) {
    if (!seededRNG) return array[Math.floor(Math.random() * array.length)];
    return seededRNG.pick(array);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Random number generator (uses seeded RNG if available)
 */
function random(min, max) {
    if (seededRNG) {
        return seededRNG.randomInt(min, max);
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Random float (uses seeded RNG if available)
 */
function randomFloat() {
    if (seededRNG) {
        return seededRNG.randomFloat();
    }
    return Math.random();
}

/**
 * Pick random element from array
 */
function pickRandom(array) {
    if (seededRNG) {
        return seededRNG.pick(array);
    }
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

/**
 * Calculate color difference (Euclidean distance in RGB space)
 */
function getColorDifference(color1, color2) {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    
    const dr = rgb1.r - rgb2.r;
    const dg = rgb1.g - rgb2.g;
    const db = rgb1.b - rgb2.b;
    
    return Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * Brighten a color
 */
function brightenColor(color, factor = 1.3) {
    const rgb = hexToRgb(color);
    rgb.r = Math.min(255, Math.floor(rgb.r * factor));
    rgb.g = Math.min(255, Math.floor(rgb.g * factor));
    rgb.b = Math.min(255, Math.floor(rgb.b * factor));
    
    return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

/**
 * Get available colors based on user selection
 */
function getAvailableColors() {
    const allColors = {
        red: '#FF0000',
        blue: '#0000FF',
        orange: '#FFA500',
        green: '#008000',
        purple: '#800080',
        black: '#000000',
        cyan: '#00FFFF',
        lime: '#00FF00',
        brown: '#A52A2A'
    };
    
    const available = [];
    if (colorRed.checked) available.push(allColors.red);
    if (colorBlue.checked) available.push(allColors.blue);
    if (colorOrange.checked) available.push(allColors.orange);
    if (colorGreen.checked) available.push(allColors.green);
    if (colorPurple.checked) available.push(allColors.purple);
    if (colorBlack.checked) available.push(allColors.black);
    if (colorCyan.checked) available.push(allColors.cyan);
    if (colorLime.checked) available.push(allColors.lime);
    if (colorBrown.checked) available.push(allColors.brown);
    
    // If no colors selected, use all colors
    return available.length > 0 ? available : Object.values(allColors);
}

/**
 * Generate random color from available colors
 */
function randomColor() {
    const availableColors = getAvailableColors();
    return pickRandom(availableColors);
}

/**
 * Parse timer input
 */
function parseTimerInput(input) {
    if (!input || input.trim() === '') return 60;
    const trimmed = input.trim().toLowerCase();
    const minuteMatch = trimmed.match(/^(\d+)\s*(?:m|min|minute|minutes)$/);
    if (minuteMatch) {
        return parseInt(minuteMatch[1]) * 60;
    }
    const seconds = parseInt(trimmed);
    return isNaN(seconds) ? 60 : Math.max(1, seconds);
}

/**
 * Switch between screens
 */
function showScreen(screenElement) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
        screen.classList.add('hidden');
    });
    screenElement.classList.remove('hidden');
    screenElement.classList.add('active');
}

// ============================================
// PARTICLE ANIMATION SYSTEM
// ============================================

/**
 * Create particle burst effect
 */
function createParticleBurst(x, y, shapeColor) {
    const particleCount = random(10, 20);
    const brightColor = brightenColor(shapeColor, 1.5);
    
    for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount + (randomFloat() * 0.5 - 0.25);
        const speed = random(50, 200);
        const lifetime = 0.3 + randomFloat() * 0.4; // 0.3-0.7 seconds
        
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1.0,
            maxLife: lifetime,
            size: random(2, 6),
            color: brightColor
        });
    }
}

/**
 * Update all particles
 */
function updateParticles(deltaTime) {
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        
        // Update position
        particle.x += particle.vx * deltaTime;
        particle.y += particle.vy * deltaTime;
        
        // Update life
        particle.life -= deltaTime / particle.maxLife;
        
        // Remove dead particles
        if (particle.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

/**
 * Render all particles
 */
function renderParticles(ctx) {
    particles.forEach(particle => {
        ctx.save();
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
}

/**
 * Animation loop for particles
 */
function animateParticles() {
    const now = performance.now();
    const deltaTime = (now - lastFrameTime) / 1000; // Convert to seconds
    lastFrameTime = now;
    
    if (particles.length > 0) {
        updateParticles(deltaTime);
        
        // Redraw canvas with particles
        renderRightCanvas();
        renderParticles(ctxRight);
        
        requestAnimationFrame(animateParticles);
    } else {
        // No particles, just redraw canvas
        renderRightCanvas();
    }
}

// ============================================
// MENU SYSTEM
// ============================================

/**
 * Initialize menu
 */
function initMenu() {
    // Set random splash text from 50-line pack
    const randomSplash = pickRandom(SPLASH_TEXTS);
    splashText.textContent = randomSplash;
}

// ============================================
// PLAYER MANAGEMENT SYSTEM
// ============================================

/**
 * Create default player data
 */
function createPlayerData() {
    return {
        totalScore: 0,
        highestScore: 0,
        gamesPlayed: 0,
        bestTimeRemaining: 0,
        totalDifferenceBonuses: 0,
        leaderboardRank: 0
    };
}

/**
 * Load player data from localStorage
 */
function loadPlayerData() {
    const saved = localStorage.getItem('findDifferencesPlayers');
    if (saved) {
        try {
            const loaded = JSON.parse(saved);
            // Migrate save data
            playerData = migrateSaveData(loaded);
        } catch (e) {
            console.error('Error loading player data:', e);
            playerData = {
                version: SAVE_VERSION,
                players: {},
                currentPlayer: 'Guest',
                dailyScores: {}
            };
        }
    }
    
    // Ensure current player exists
    if (!playerData.players[playerData.currentPlayer]) {
        playerData.players[playerData.currentPlayer] = createPlayerData();
    }
    
    updatePlayerDisplay();
}

/**
 * Save player data to localStorage
 */
function savePlayerData() {
    try {
        playerData.version = SAVE_VERSION;
        localStorage.setItem('findDifferencesPlayers', JSON.stringify(playerData));
    } catch (e) {
        console.error('Error saving player data:', e);
    }
}

/**
 * Get current player data
 */
function getCurrentPlayer() {
    return playerData.players[playerData.currentPlayer] || createPlayerData();
}

/**
 * Update player display
 */
function updatePlayerDisplay() {
    const player = getCurrentPlayer();
    currentPlayerDisplay.textContent = playerData.currentPlayer;
    currentPlayerName.textContent = playerData.currentPlayer;
    totalScoreDisplay.textContent = player.totalScore;
    highestScoreDisplay.textContent = player.highestScore;
    gamesPlayedDisplay.textContent = player.gamesPlayed;
}

/**
 * Create new player
 */
function createPlayer(name) {
    if (!name || name.trim() === '') {
        alert('Please enter a player name');
        return;
    }
    
    const trimmedName = name.trim();
    
    if (playerData.players[trimmedName]) {
        alert('Player already exists!');
        return;
    }
    
    playerData.players[trimmedName] = createPlayerData();
    playerData.currentPlayer = trimmedName;
    savePlayerData();
    updatePlayerList();
    updatePlayerDisplay();
    newPlayerName.value = '';
}

/**
 * Switch player
 */
function switchPlayer(name) {
    playerData.currentPlayer = name;
    savePlayerData();
    updatePlayerList();
    updatePlayerDisplay();
}

/**
 * Delete player
 */
function deletePlayer(name) {
    if (playerData.currentPlayer === name) {
        alert('Cannot delete current player. Switch to another player first.');
        return;
    }
    
    if (confirm(`Delete player "${name}"?`)) {
        delete playerData.players[name];
        savePlayerData();
        updatePlayerList();
    }
}

/**
 * Update player list display
 */
function updatePlayerList() {
    playerList.innerHTML = '';
    
    const playerNames = Object.keys(playerData.players).sort();
    
    playerNames.forEach(name => {
        const player = playerData.players[name];
        const item = document.createElement('div');
        item.className = `player-item ${playerData.currentPlayer === name ? 'current' : ''}`;
        
        item.innerHTML = `
            <div>
                <div class="player-name">${name}</div>
                <div class="player-stats">
                    High Score: ${player.highestScore} | Games: ${player.gamesPlayed}
                </div>
            </div>
            <div>
                <button onclick="switchPlayer('${name}')">Switch</button>
                <button onclick="deletePlayer('${name}')">Delete</button>
            </div>
        `;
        
        playerList.appendChild(item);
    });
}

/**
 * Export current player
 */
function exportCurrentPlayer() {
    const player = getCurrentPlayer();
    const data = {
        playerName: playerData.currentPlayer,
        playerData: player
    };
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `player_${playerData.currentPlayer}_backup.json`;
    link.click();
    URL.revokeObjectURL(url);
}

/**
 * Export all players
 */
function exportAllPlayers() {
    const dataStr = JSON.stringify(playerData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'all_players_backup.json';
    link.click();
    URL.revokeObjectURL(url);
}

/**
 * Trigger player file import
 */
function triggerPlayerFileImport() {
    importPlayerFile.click();
}

/**
 * Handle player file import
 */
function handlePlayerFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            
            // Check if it's a single player or all players
            if (imported.players) {
                // All players backup - migrate it
                const migrated = migrateSaveData(imported);
                playerData.players = { ...playerData.players, ...migrated.players };
                if (migrated.currentPlayer) {
                    playerData.currentPlayer = migrated.currentPlayer;
                }
                if (migrated.dailyScores) {
                    playerData.dailyScores = { ...playerData.dailyScores, ...migrated.dailyScores };
                }
                savePlayerData();
                updatePlayerList();
                updatePlayerDisplay();
                alert('All players imported successfully!');
            } else if (imported.playerName && imported.playerData) {
                // Single player
                playerData.players[imported.playerName] = imported.playerData;
                savePlayerData();
                updatePlayerList();
                updatePlayerDisplay();
                alert(`Player "${imported.playerName}" imported successfully!`);
            } else {
                alert('Invalid player file format.');
            }
        } catch (e) {
            alert('Error reading file.');
            console.error('Import error:', e);
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

// ============================================
// LEADERBOARD SYSTEM
// ============================================

/**
 * Update leaderboard rankings
 */
function updateLeaderboardRankings() {
    const players = Object.keys(playerData.players).map(name => ({
        name: name,
        ...playerData.players[name]
    }));
    
    // Sort by highest score
    players.sort((a, b) => b.highestScore - a.highestScore);
    
    // Assign ranks
    players.forEach((player, index) => {
        playerData.players[player.name].leaderboardRank = index + 1;
    });
    
    savePlayerData();
}

/**
 * Render overall leaderboard
 */
function renderOverallLeaderboard() {
    const players = Object.keys(playerData.players).map(name => ({
        name: name,
        ...playerData.players[name]
    }));
    
    players.sort((a, b) => b.highestScore - a.highestScore);
    
    leaderboardContent.innerHTML = '';
    
    const top10 = players.slice(0, 10);
    
    top10.forEach((player, index) => {
        const item = document.createElement('div');
        item.className = `leaderboard-item ${playerData.currentPlayer === player.name ? 'current-player' : ''}`;
        item.innerHTML = `
            <div class="leaderboard-rank">#${index + 1}</div>
            <div class="leaderboard-name">${player.name}</div>
            <div class="leaderboard-score">${player.highestScore} pts</div>
        `;
        leaderboardContent.appendChild(item);
    });
    
    // Show current player if not in top 10
    const currentPlayerRank = players.findIndex(p => p.name === playerData.currentPlayer);
    if (currentPlayerRank >= 10) {
        const player = players[currentPlayerRank];
        const item = document.createElement('div');
        item.className = 'leaderboard-item current-player';
        item.innerHTML = `
            <div class="leaderboard-rank">#${currentPlayerRank + 1}</div>
            <div class="leaderboard-name">${player.name} (You)</div>
            <div class="leaderboard-score">${player.highestScore} pts</div>
        `;
        leaderboardContent.appendChild(item);
    }
}

/**
 * Render daily leaderboard
 */
function renderDailyLeaderboard() {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const dailyScores = playerData.dailyScores[dateStr] || [];
    dailyScores.sort((a, b) => b.score - a.score);
    
    leaderboardContent.innerHTML = '';
    
    if (dailyScores.length === 0) {
        leaderboardContent.innerHTML = '<p style="text-align: center; padding: 20px;">No scores yet for today\'s challenge!</p>';
        return;
    }
    
    dailyScores.forEach((entry, index) => {
        const item = document.createElement('div');
        item.className = `leaderboard-item ${playerData.currentPlayer === entry.player ? 'current-player' : ''}`;
        item.innerHTML = `
            <div class="leaderboard-rank">#${index + 1}</div>
            <div class="leaderboard-name">${entry.player}</div>
            <div class="leaderboard-score">${entry.score} pts</div>
        `;
        leaderboardContent.appendChild(item);
    });
}

// ============================================
// COMBO SYSTEM
// ============================================

/**
 * Update combo on difference found
 */
function updateCombo() {
    const now = Date.now();
    
    // Check if combo should reset (more than 3 seconds since last find)
    if (lastFindTime > 0 && (now - lastFindTime) > COMBO_TIMEOUT) {
        comboCount = 0;
        comboMultiplierValue = 1.0;
    }
    
    // Increment combo
    comboCount++;
    lastFindTime = now;
    
    // Calculate multiplier
    if (comboCount === 1) {
        comboMultiplierValue = 1.0;
    } else if (comboCount === 2) {
        comboMultiplierValue = 1.2;
    } else if (comboCount === 3) {
        comboMultiplierValue = 1.4;
    } else if (comboCount === 4) {
        comboMultiplierValue = 1.6;
    } else if (comboCount === 5) {
        comboMultiplierValue = 1.8;
    } else {
        comboMultiplierValue = Math.min(2.0, comboMultiplierValue + 0.1);
    }
    
    // Update display
    comboMultiplier.textContent = `×${comboMultiplierValue.toFixed(1)}`;
    comboDisplay.classList.add('combo-active');
    setTimeout(() => {
        comboDisplay.classList.remove('combo-active');
    }, 300);
}

/**
 * Reset combo
 */
function resetCombo() {
    comboCount = 0;
    comboMultiplierValue = 1.0;
    lastFindTime = 0;
    comboMultiplier.textContent = '×1.0';
}

/**
 * Check combo timeout (called periodically)
 */
function checkComboTimeout() {
    if (lastFindTime > 0 && (Date.now() - lastFindTime) > COMBO_TIMEOUT) {
        resetCombo();
    }
}

// ============================================
// SHAPE GENERATION
// ============================================

// All available shape types
const SHAPE_TYPES = ['circle', 'square', 'star', 'box', 'triangle', 'pentagon', 'egg'];

/**
 * Get available shape types based on user selection
 */
function getAvailableShapeTypes() {
    const allShapes = {
        circle: shapeCircle.checked,
        square: shapeSquare.checked,
        star: shapeStar.checked,
        box: shapeBox.checked,
        triangle: shapeTriangle.checked,
        pentagon: shapePentagon.checked,
        egg: shapeEgg.checked
    };
    
    const available = [];
    Object.keys(allShapes).forEach(shape => {
        if (allShapes[shape]) {
            available.push(shape);
        }
    });
    
    // If no shapes selected, use all shapes
    return available.length > 0 ? available : SHAPE_TYPES;
}

/**
 * Create a single random shape with type selection
 */
function createRandomShape(canvasWidth, canvasHeight, availableTypes = null) {
    // If shape balancing is enabled and types are provided, use them
    let shapeType;
    if (availableTypes && availableTypes.length > 0) {
        shapeType = pickRandom(availableTypes);
    } else {
        shapeType = pickRandom(SHAPE_TYPES);
    }
    
    const shape = {
        type: shapeType,
        x: random(50, canvasWidth - 50),
        y: random(50, canvasHeight - 50),
        size: random(30, 80),
        color: randomColor(),
        isModified: false,
        differenceIndex: -1
    };
    
    return shape;
}

/**
 * Generate shapes with difficulty scaling
 */
function generateShapes() {
    originalShapes = [];
    
    let numShapes;
    if (isDailyChallenge) {
        numShapes = 30; // Fixed for daily challenge
    } else {
        const difficulty = getDifficulty();
        const baseCount = difficulty * 3;
        const randomAdd = random(0, 5);
        numShapes = Math.min(40, baseCount + randomAdd);
    }
    
    // Get available shape types based on user selection
    const availableTypes = getAvailableShapeTypes();
    
    // Generate shapes using only selected types
    for (let i = 0; i < numShapes; i++) {
        const shape = createRandomShape(canvasLeft.width, canvasLeft.height, availableTypes);
        originalShapes.push(shape);
    }
    
    modifiedShapes = JSON.parse(JSON.stringify(originalShapes));
}

// ============================================
// OVERLAP DETECTION
// ============================================

function getShapeBounds(shape) {
    // All shapes use similar bounding boxes
    const halfSize = shape.size / 2;
    const maxRadius = shape.size; // For circular/star shapes
    
    // Use the larger dimension for bounding box
    return {
        x: shape.x - maxRadius,
        y: shape.y - maxRadius,
        width: maxRadius * 2,
        height: maxRadius * 2
    };
}

function shapesOverlap(shape1, shape2, padding = 20) {
    const bounds1 = getShapeBounds(shape1);
    const bounds2 = getShapeBounds(shape2);
    
    bounds1.x -= padding;
    bounds1.y -= padding;
    bounds1.width += padding * 2;
    bounds1.height += padding * 2;
    
    bounds2.x -= padding;
    bounds2.y -= padding;
    bounds2.width += padding * 2;
    bounds2.height += padding * 2;
    
    return !(
        bounds1.x + bounds1.width < bounds2.x ||
        bounds2.x + bounds2.width < bounds1.x ||
        bounds1.y + bounds1.height < bounds2.y ||
        bounds2.y + bounds2.height < bounds1.y
    );
}

function overlapsWithModifiedShapes(shapeIndex, modifiedIndices, modifiedShape) {
    for (let i = 0; i < modifiedIndices.length; i++) {
        const otherIndex = modifiedIndices[i];
        const otherShape = modifiedShapes[otherIndex];
        
        if (shapesOverlap(modifiedShape, otherShape)) {
            return true;
        }
    }
    
    return false;
}

// ============================================
// SHAPE MODIFICATION (IMPROVED - NO DISAPPEARANCE)
// ============================================

/**
 * Modify shape with improved rules (includes shape changes)
 * @param {Object} shape - Shape to modify
 * @param {Object} originalShape - Original shape for reference
 * @param {Function} rngFn - Random function (Math.random or dailyRandom)
 */
function modifyShape(shape, originalShape, rngFn = randomFloat) {
    // Get random function based on mode
    const rand = rngFn;
    const randInt = seededRNG ? (min, max) => seededRNG.randomInt(min, max) : (min, max) => random(min, max);
    
    // 4 modification types: color, size, position, shape change
    const modificationType = randInt(0, 3);
    
    switch (modificationType) {
        case 0:  // Color change (more obvious)
            const availableColors = getAvailableColors();
            let newColor = pickRandom(availableColors);
            let attempts = 0;
            // Ensure color is different from current color
            while (newColor === shape.color && attempts < 20 && availableColors.length > 1) {
                newColor = pickRandom(availableColors);
                attempts++;
            }
            shape.color = newColor;
            break;
            
        case 1:  // Size change (subtle but noticeable)
            const sizeChange = 0.15 + rand() * 0.20; // 15-35% change
            const multiplier = rand() < 0.5 ? (1.0 + sizeChange) : (1.0 - sizeChange);
            shape.size = Math.max(20, Math.min(100, Math.floor(shape.size * multiplier)));
            break;
            
        case 2:  // Position shift
            const shiftX = randInt(-40, 40);
            const shiftY = randInt(-40, 40);
            shape.x = Math.max(50, Math.min(canvasRight.width - 50, shape.x + shiftX));
            shape.y = Math.max(50, Math.min(canvasRight.height - 50, shape.y + shiftY));
            break;
            
        case 3:  // Shape change (different shape in same position)
            // Pick a different shape type
            const otherTypes = SHAPE_TYPES.filter(t => t !== shape.type);
            if (otherTypes.length > 0) {
                shape.type = pickRandom(otherTypes);
            }
            break;
    }
    
    shape.isModified = true;
}

// ============================================
// DIFFERENCE CREATION (IMPROVED)
// ============================================

function createDifferences() {
    differences = [];
    foundDifferences = [];
    differenceBonuses = 0;
    comboBonus = 0;
    resetCombo();
    
    const numDifferences = getDifficulty();
    totalDifferences = numDifferences;
    
    const modifiedIndices = [];
    const availableIndices = [];
    for (let i = 0; i < modifiedShapes.length; i++) {
        availableIndices.push(i);
    }
    
    let attempts = 0;
    const maxAttempts = 2000;
    
    // Get RNG function based on mode
    const rngFn = seededRNG ? () => seededRNG.randomFloat() : () => Math.random();
    
    for (let i = 0; i < numDifferences && availableIndices.length > 0 && attempts < maxAttempts; i++) {
        let shapeIndex;
        let foundNonOverlapping = false;
        let modificationAttempts = 0;
        const maxModificationAttempts = 100;
        
        while (!foundNonOverlapping && availableIndices.length > 0 && attempts < maxAttempts) {
            attempts++;
            
            const randomIndex = random(0, availableIndices.length - 1);
            shapeIndex = availableIndices[randomIndex];
            
            const originalOverlaps = overlapsWithModifiedShapes(shapeIndex, modifiedIndices, modifiedShapes[shapeIndex]);
            
            if (originalOverlaps && modificationAttempts < 10) {
                modificationAttempts++;
            } else if (originalOverlaps) {
                availableIndices.splice(randomIndex, 1);
                modificationAttempts = 0;
                continue;
            }
            
            const testShape = JSON.parse(JSON.stringify(modifiedShapes[shapeIndex]));
            modifyShape(testShape, originalShapes[shapeIndex], rngFn);
            
            if (!overlapsWithModifiedShapes(shapeIndex, modifiedIndices, testShape)) {
                foundNonOverlapping = true;
                Object.assign(modifiedShapes[shapeIndex], testShape);
                availableIndices.splice(randomIndex, 1);
            } else {
                modificationAttempts++;
                if (modificationAttempts >= maxModificationAttempts) {
                    availableIndices.splice(randomIndex, 1);
                    modificationAttempts = 0;
                }
            }
        }
        
        if (foundNonOverlapping) {
            modifiedIndices.push(shapeIndex);
            modifiedShapes[shapeIndex].differenceIndex = i;
            differences.push(shapeIndex);
        }
    }
    
    totalDifferences = differences.length;
    totalCountSpan.textContent = totalDifferences;
    foundCountSpan.textContent = 0;
}

// ============================================
// DIFFICULTY & SETTINGS
// ============================================

function getDifficulty() {
    if (isDailyChallenge) {
        return 10; // Fixed for daily
    }
    if (difficultySelect.value === 'custom') {
        const custom = parseInt(customDifficulty.value);
        return isNaN(custom) || custom < 1 ? 5 : Math.min(50, Math.max(1, custom));
    }
    return parseInt(difficultySelect.value);
}

function getMapSize() {
    if (isDailyChallenge) {
        return { width: 600, height: 400 }; // Fixed for daily
    }
    if (mapSizeSelect.value === 'custom') {
        const width = parseInt(customWidth.value);
        const height = parseInt(customHeight.value);
        return {
            width: isNaN(width) || width < 200 ? 600 : Math.min(2000, Math.max(200, width)),
            height: isNaN(height) || height < 200 ? 400 : Math.min(2000, Math.max(200, height))
        };
    }
    
    const sizes = {
        small: { width: 400, height: 300 },
        medium: { width: 600, height: 400 },
        large: { width: 800, height: 600 },
        huge: { width: 1000, height: 800 }
    };
    
    return sizes[mapSizeSelect.value] || sizes.medium;
}

function getTimerDuration() {
    if (isDailyChallenge) {
        return 60; // Fixed for daily
    }
    if (timerSelect.value === 'custom') {
        return parseTimerInput(customTimer.value);
    }
    return parseInt(timerSelect.value) || 60;
}

function applyDifficulty() {
    const numDifferences = getDifficulty();
    
    let attempts = 0;
    while (originalShapes.length < numDifferences && attempts < 100) {
        generateShapes();
        attempts++;
    }
    
    while (originalShapes.length < numDifferences) {
        originalShapes.push(createRandomShape(canvasLeft.width, canvasLeft.height));
    }
    
    modifiedShapes = JSON.parse(JSON.stringify(originalShapes));
}

function updateCanvasSize() {
    const size = getMapSize();
    canvasLeft.width = size.width;
    canvasLeft.height = size.height;
    canvasRight.width = size.width;
    canvasRight.height = size.height;
}

// ============================================
// RENDERING
// ============================================

/**
 * Draw a shape on canvas (supports all 7 shape types)
 */
function drawShape(ctx, shape, highlight = false, hintHighlight = false) {
    ctx.save();
    
    // Hint highlight (blue)
    if (hintHighlight) {
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#3498DB';
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#3498DB';
    } else if (highlight) {
        // Found highlight (gold)
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#FFD700';
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#FFD700';
    }
    
    ctx.fillStyle = shape.color;
    const halfSize = shape.size / 2;
    
    switch (shape.type) {
        case 'circle':
            ctx.beginPath();
            ctx.arc(shape.x, shape.y, shape.size, 0, Math.PI * 2);
            ctx.fill();
            if (highlight || hintHighlight) {
                ctx.stroke();
            }
            break;
            
        case 'square':
        case 'box':
            ctx.fillRect(
                shape.x - halfSize,
                shape.y - halfSize,
                shape.size,
                shape.size
            );
            if (highlight || hintHighlight) {
                ctx.strokeRect(
                    shape.x - halfSize,
                    shape.y - halfSize,
                    shape.size,
                    shape.size
                );
            }
            break;
            
        case 'star':
            drawStar(ctx, shape.x, shape.y, shape.size);
            if (highlight || hintHighlight) {
                ctx.stroke();
            }
            break;
            
        case 'triangle':
            drawTriangle(ctx, shape.x, shape.y, shape.size);
            if (highlight || hintHighlight) {
                ctx.stroke();
            }
            break;
            
        case 'pentagon':
            drawPentagon(ctx, shape.x, shape.y, shape.size);
            if (highlight || hintHighlight) {
                ctx.stroke();
            }
            break;
            
        case 'egg':
            drawEgg(ctx, shape.x, shape.y, shape.size);
            if (highlight || hintHighlight) {
                ctx.stroke();
            }
            break;
    }
    
    ctx.restore();
}

/**
 * Draw a star shape
 */
function drawStar(ctx, x, y, size) {
    const spikes = 5;
    const outerRadius = size;
    const innerRadius = size * 0.4;
    
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (Math.PI * i) / spikes - Math.PI / 2;
        const px = x + Math.cos(angle) * radius;
        const py = y + Math.sin(angle) * radius;
        
        if (i === 0) {
            ctx.moveTo(px, py);
        } else {
            ctx.lineTo(px, py);
        }
    }
    ctx.closePath();
    ctx.fill();
}

/**
 * Draw a triangle shape
 */
function drawTriangle(ctx, x, y, size) {
    const height = size * 0.866; // Equilateral triangle height
    ctx.beginPath();
    ctx.moveTo(x, y - height * 0.67);
    ctx.lineTo(x - size * 0.5, y + height * 0.33);
    ctx.lineTo(x + size * 0.5, y + height * 0.33);
    ctx.closePath();
    ctx.fill();
}

/**
 * Draw a pentagon shape
 */
function drawPentagon(ctx, x, y, size) {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        const px = x + Math.cos(angle) * size;
        const py = y + Math.sin(angle) * size;
        
        if (i === 0) {
            ctx.moveTo(px, py);
        } else {
            ctx.lineTo(px, py);
        }
    }
    ctx.closePath();
    ctx.fill();
}

/**
 * Draw an egg shape
 */
function drawEgg(ctx, x, y, size) {
    ctx.beginPath();
    ctx.ellipse(x, y, size * 0.6, size * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
}

function renderRightCanvas() {
    ctxRight.clearRect(0, 0, canvasRight.width, canvasRight.height);
    
    modifiedShapes.forEach((shape, index) => {
        const isFound = foundDifferences.includes(index);
        const isHinted = hintedDifferences.includes(index);
        drawShape(ctxRight, shape, isFound, isHinted);
    });
    
    // Render particles on top
    if (particles.length > 0) {
        renderParticles(ctxRight);
    }
}

function renderLeftCanvas() {
    ctxLeft.clearRect(0, 0, canvasLeft.width, canvasLeft.height);
    originalShapes.forEach((shape, index) => {
        const isHinted = hintedDifferences.includes(index);
        drawShape(ctxLeft, shape, false, isHinted);
    });
}

// ============================================
// ANIMATED HIGHLIGHTS
// ============================================

/**
 * Create animated highlight ring
 */
function createHighlightAnimation(x, y, size) {
    let ringRadius = 0;
    const ringMaxRadius = size + 30;
    const duration = 300; // 300ms
    const startTime = performance.now();
    
    const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease-out function
        const eased = 1 - Math.pow(1 - progress, 3);
        ringRadius = ringMaxRadius * eased;
        
        const alpha = 1 - progress;
        
        if (progress < 1) {
            ctxRight.save();
            ctxRight.globalAlpha = alpha * 0.6;
            ctxRight.strokeStyle = '#FFD700';
            ctxRight.lineWidth = 3;
            ctxRight.beginPath();
            ctxRight.arc(x, y, ringRadius, 0, Math.PI * 2);
            ctxRight.stroke();
            ctxRight.restore();
            
            requestAnimationFrame(animate);
        } else {
            // Animation complete, redraw canvas
            renderRightCanvas();
            if (particles.length > 0) {
                lastFrameTime = performance.now();
                animateParticles();
            }
        }
    };
    
    animate();
}

// ============================================
// CLICK DETECTION
// ============================================

function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Check if click is inside a shape (supports all shape types)
 */
function isClickInShape(clickX, clickY, shape) {
    const dist = distance(clickX, clickY, shape.x, shape.y);
    const maxRadius = shape.size; // Maximum radius for all shapes
    
    // For circular shapes (circle, star, pentagon, egg)
    if (['circle', 'star', 'pentagon', 'egg'].includes(shape.type)) {
        return dist <= maxRadius;
    }
    
    // For rectangular shapes (square, box)
    if (['square', 'box'].includes(shape.type)) {
        const halfSize = shape.size / 2;
        return (
            clickX >= shape.x - halfSize &&
            clickX <= shape.x + halfSize &&
            clickY >= shape.y - halfSize &&
            clickY <= shape.y + halfSize
        );
    }
    
    // For triangle (approximate with circle check)
    if (shape.type === 'triangle') {
        return dist <= maxRadius;
    }
    
    return false;
}

/**
 * Handle click on either canvas (both panels are interactive)
 */
function handleCanvasClick(event, isLeftCanvas = false) {
    if (!gameActive) return;
    
    const canvas = isLeftCanvas ? canvasLeft : canvasRight;
    const shapes = isLeftCanvas ? originalShapes : modifiedShapes;
    
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const scaledX = clickX * scaleX;
    const scaledY = clickY * scaleY;
    
    // Check modified shapes for differences
    modifiedShapes.forEach((shape, index) => {
        if (shape.isModified && !foundDifferences.includes(index)) {
            // Check if click matches this shape's position
            const checkShape = isLeftCanvas ? originalShapes[index] : shape;
            if (isClickInShape(scaledX, scaledY, checkShape)) {
                foundDifferences.push(index);
                
                // Update combo
                updateCombo();
                
                // Calculate per-difference bonus
                const baseBonus = calculateDifferenceBonus();
                const bonusWithCombo = Math.floor(baseBonus * comboMultiplierValue);
                differenceBonuses += bonusWithCombo;
                comboBonus += (bonusWithCombo - baseBonus);
                
                // Get shape position for animation
                const animX = shape.x;
                const animY = shape.y;
                const animSize = shape.size;
                
                // Create highlight animation and particle burst
                createHighlightAnimation(animX, animY, animSize);
                createParticleBurst(animX, animY, shape.color);
                
                foundCountSpan.textContent = foundDifferences.length;
                renderLeftCanvas();
                renderRightCanvas();
                
                // Check for win condition
                if (foundDifferences.length === totalDifferences) {
                    stopTimer();
                    endGameWin();
                }
            }
        }
    });
}

/**
 * Handle click on right canvas (backward compatibility)
 */
function handleDifferenceClick(event) {
    handleCanvasClick(event, false);
}

// ============================================
// TIMER SYSTEM
// ============================================

function startTimer() {
    stopTimer();
    
    totalTimer = getTimerDuration();
    currentTimer = totalTimer;
    updateTimerDisplay();
    
    timerInterval = setInterval(() => {
        currentTimer--;
        updateTimerDisplay();
        checkComboTimeout();
        
        if (currentTimer <= 0) {
            stopTimer();
            endGameTimeUp();
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function updateTimerDisplay() {
    const minutes = Math.floor(currentTimer / 60);
    const seconds = currentTimer % 60;
    timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    if (currentTimer <= 10) {
        timerDisplay.style.color = '#d9534f';
    } else if (currentTimer <= 30) {
        timerDisplay.style.color = '#f0ad4e';
    } else {
        timerDisplay.style.color = '#5cb85c';
    }
}

function endGameTimeUp() {
    gameActive = false;
    canvasRight.style.cursor = 'not-allowed';
    // Add AI fail feedback
    const overlay = timeUpOverlay.querySelector('.win-message');
    overlay.innerHTML = `<h2>⏰ Time's Up!</h2>
        <p>Ooo... Try again, better luck next time!</p>
        <div class="ai-tip"><strong>Tip:</strong> ${pickAITip()}</div>
        <button id="restartAfterTimeUp">Restart with Same Settings</button>
        <button id="backToMenuFromTimeUp">Back to Menu</button>`;
    // Re-hook listeners (since buttons replaced)
    document.getElementById('restartAfterTimeUp').onclick = () => {
        timeUpOverlay.classList.add('hidden');
        restartGame();
    };
    document.getElementById('backToMenuFromTimeUp').onclick = () => {
        timeUpOverlay.classList.add('hidden');
        isDailyChallenge = false;
        seededRNG = null;
        dailyBadge.classList.add('hidden');
        showScreen(mainMenu);
    };
    timeUpOverlay.classList.remove('hidden');
}

// ============================================
// SCORING SYSTEM
// ============================================

function calculateDifferenceBonus() {
    if (totalTimer === 0) return 0;
    
    const percentLeft = (currentTimer / totalTimer) * 100;
    
    if (percentLeft >= 90) return 10;
    if (percentLeft >= 75) return 8;
    if (percentLeft >= 50) return 5;
    if (percentLeft >= 25) return 3;
    return 1;
}

function calculateFinalScore() {
    const timeBonus = currentTimer * 3;
    const totalRoundScore = differenceBonuses + timeBonus;
    
    return {
        differenceBonuses: differenceBonuses - comboBonus,
        comboBonus: comboBonus,
        timeBonus: timeBonus,
        totalRoundScore: totalRoundScore,
        timeRemaining: currentTimer
    };
}

// ============================================
// GAME FLOW
// ============================================

function generatePuzzle() {
    currentSettings = {
        difficulty: getDifficulty(),
        mapSize: getMapSize(),
        timer: getTimerDuration()
    };
    
    updateCanvasSize();
    applyDifficulty();
    createDifferences();
    renderLeftCanvas();
    renderRightCanvas();
}

function startGame() {
    winOverlay.classList.add('hidden');
    timeUpOverlay.classList.add('hidden');
    
    foundDifferences = [];
    differenceBonuses = 0;
    comboBonus = 0;
    particles = []; // Clear particles
    hintedDifferences = []; // Clear hints
    gameActive = true;
    canvasRight.style.cursor = 'crosshair';
    canvasLeft.style.cursor = 'crosshair';
    resetCombo();
    
    generatePuzzle();
    startTimer();
    
    showScreen(gameScreen);
}

function startDailyChallenge() {
    isDailyChallenge = true;
    dailySeed = getDailySeed();
    seedDailyRNG(dailySeed);
    
    dailyBadge.classList.remove('hidden');
    
    // Disable custom settings
    difficultySelect.disabled = true;
    mapSizeSelect.disabled = true;
    timerSelect.disabled = true;
    customDifficulty.disabled = true;
    customWidth.disabled = true;
    customHeight.disabled = true;
    customTimer.disabled = true;
    
    startGame();
}

function endGameWin() {
    gameActive = false;
    canvasRight.style.cursor = 'not-allowed';
    const finalScore = calculateFinalScore();
    const player = getCurrentPlayer();
    
    // Update player data
    player.totalScore += finalScore.totalRoundScore;
    player.gamesPlayed++;
    player.totalDifferenceBonuses += finalScore.differenceBonuses;
    
    if (finalScore.totalRoundScore > player.highestScore) {
        player.highestScore = finalScore.totalRoundScore;
    }
    
    if (finalScore.timeRemaining > player.bestTimeRemaining) {
        player.bestTimeRemaining = finalScore.timeRemaining;
    }
    
    playerData.players[playerData.currentPlayer] = player;
    
    // Update leaderboard rankings
    updateLeaderboardRankings();
    
    // Handle daily challenge score
    if (isDailyChallenge) {
        const today = new Date();
        const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        
        if (!playerData.dailyScores[dateStr]) {
            playerData.dailyScores[dateStr] = [];
        }
        
        playerData.dailyScores[dateStr].push({
            player: playerData.currentPlayer,
            score: finalScore.totalRoundScore
        });
        
        dailyScoreNote.classList.remove('hidden');
    } else {
        dailyScoreNote.classList.add('hidden');
    }
    
    savePlayerData();
    updatePlayerDisplay();
    
    // Custom AI feedback for win
    let comparisonMsg = '';
    let aiTipWin = pickAITip();
    // Compare to personal best and combos
    if (finalScore.totalRoundScore > player.highestScore) {
        comparisonMsg += `<div class='ai-congrats'>🏆 New High Score! 🥇</div>`;
    } else {
        comparisonMsg += `<div class='ai-congrats'>Awesome! You scored ${finalScore.totalRoundScore} points (Best: ${player.highestScore})</div>`;
    }
    comparisonMsg += `<div>Combo: <strong>${comboMultiplierValue.toFixed(1)}×</strong> | Time left: <strong>${finalScore.timeRemaining}s</strong></div>`;
    // Insert dynamic win overlay message
    const overlay = winOverlay.querySelector('.win-message');
    overlay.innerHTML =
        `<h2>🎉 You Win! 🎉</h2>
        ${comparisonMsg}
        <div class="score-summary">
            <p><strong>Round Score Breakdown:</strong></p>
            <p>Per-Difference Bonuses: <span id="differenceBonusesDisplay">${finalScore.differenceBonuses}</span> points</p>
            <p>Combo Multiplier Bonus: <span id="comboBonusDisplay">${finalScore.comboBonus}</span> points</p>
            <p>Time Bonus (seconds left × 3): <span id="timeBonusDisplay">${finalScore.timeBonus}</span> points</p>
            <p><strong>Total Round Score: <span id="roundScoreDisplay">${finalScore.totalRoundScore}</span> points</strong></p>
            <p>Time Remaining: <span id="timeRemainingDisplay">${finalScore.timeRemaining}</span> seconds</p>
            <p id="dailyScoreNote" class="${isDailyChallenge ? '' : 'hidden'}"><em>Daily Challenge Score</em></p>
        </div>
        <div class="ai-tip"><strong>Tip:</strong> ${aiTipWin}</div>
        <button id="newGameButton">Play Again</button>
        <button id="backToMenuFromWin">Back to Menu</button>`;
    document.getElementById('newGameButton').onclick = () => {
        winOverlay.classList.add('hidden');
        restartGame();
    };
    document.getElementById('backToMenuFromWin').onclick = () => {
        winOverlay.classList.add('hidden');
        showScreen(mainMenu);
    };
    setTimeout(() => {
        winOverlay.classList.remove('hidden');
    }, 300);
}

function restartGame() {
    stopTimer();
    
    if (isDailyChallenge) {
        // Regenerate with same seed
        seedDailyRNG(dailySeed);
        startGame();
    } else {
        startGame();
    }
}

// ============================================
// GEMINI FACT QUIZ SETUP
// ============================================

const GEMINI_API_KEY = "AIzaSyAUZBwArUrhCMfloZszezpoAU9jxerz9Ug"; 
const GEMINI_MODEL = "gemini-2.5-flash"; 
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

/**
 * Generate a random fact quiz question using Gemini
 */
async function generateFactQuiz() {
    // You can customize prompt for facts: theme, age group, etc.
    const prompt = "Generate a single, interesting, general knowledge fact as a quiz question with 1 correct answer and 3 plausible false choices. Output JSON like: {\"question\": ..., \"choices\": [...], \"answer\": ...}.";
    
    const requestData = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.5, candidateCount: 1 }
    };
    try {
        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        });
        const data = await response.json();
        if (data?.candidates && data.candidates[0]?.content?.parts[0]?.text) {
            let quizObj;
            try {
                quizObj = JSON.parse(data.candidates[0].content.parts[0].text);
            } catch {
                // If not valid JSON, treat as normal string
                return {
                    question: "Fact: " + data.candidates[0].content.parts[0].text,
                    choices: [],
                    answer: ""
                };
            }
            return quizObj;
        }
        return {
            question: 'Could not fetch fact quiz. Try again.',
            choices: [],
            answer: ''
        };
    } catch (e) {
        return {
            question: 'Error fetching AI quiz.',
            choices: [],
            answer: ''
        };
    }
}

// ============================================
// HINT SYSTEM (AI FACT QUIZ)
// ============================================

/**
 * Show AI fact quiz modal for hints
 */
async function showHintQuestion() {
    if (!gameActive) return;
    // Find unfound differences
    const unfoundDifferences = differences.filter(index => !foundDifferences.includes(index));
    if (unfoundDifferences.length === 0) {
        alert('All differences have been found!');
        return;
    }

    // Show loading state
    mathQuestionText.textContent = 'Loading AI quiz...';
    mathAnswerInput.type = 'text';
    mathAnswerInput.value = '';
    mathAnswerInput.placeholder = 'Your answer or choice letter';
    mathFeedback.textContent = '';
    mathFeedback.className = '';
    mathQuestionModal.classList.remove('hidden');
    mathAnswerInput.disabled = true;
    submitMathAnswer.disabled = true;
    mathAnswerInput.focus();

    // Generate quiz via Gemini
    const quiz = await generateFactQuiz();
    // Save for answer check
    currentFactQuiz = quiz;

    // Build display
    let content = quiz.question || 'No quiz question.';
    if (quiz.choices && quiz.choices.length) {
        // Letter labels (A, B, ...)
        content += '\n';
        quiz.choices.forEach((choice, i) => {
            content += `\n${String.fromCharCode(65 + i)}. ${choice}`;
        });
        mathAnswerInput.placeholder = 'Type letter (A/B/C/D) or answer';
    } else {
        mathAnswerInput.placeholder = 'Type your answer';
    }

    mathQuestionText.textContent = content;
    mathAnswerInput.value = '';
    mathAnswerInput.disabled = false;
    submitMathAnswer.disabled = false;
    mathAnswerInput.focus();
}

/**
 * Check AI fact quiz answer and reveal hint
 */
function checkMathAnswer() {
    if (!currentFactQuiz) {
        mathFeedback.textContent = 'No quiz loaded!';
        mathFeedback.className = 'incorrect';
        return;
    }
    let userVal = mathAnswerInput.value.trim();
    if (!userVal) {
        mathFeedback.textContent = 'Please enter an answer!';
        mathFeedback.className = 'incorrect';
        return;
    }
    let isCorrect = false;
    if (currentFactQuiz.choices && currentFactQuiz.choices.length) {
        // Accept letter or answer string
        const index = 'ABCD'.indexOf(userVal.toUpperCase());
        if (index !== -1 && currentFactQuiz.choices[index] === currentFactQuiz.answer) isCorrect = true;
        if (userVal.toLowerCase() === (currentFactQuiz.answer||'').toLowerCase()) isCorrect = true;
    } else {
        if (userVal.toLowerCase() === (currentFactQuiz.answer||'').toLowerCase()) isCorrect = true;
    }
    if (isCorrect) {
        mathFeedback.textContent = 'Correct! Revealing a difference...';
        mathFeedback.className = 'correct';
        // Reveal a difference
        const unfoundDifferences = differences.filter(index => !foundDifferences.includes(index));
        if (unfoundDifferences.length > 0) {
            const hintIndex = pickRandom(unfoundDifferences);
            hintedDifferences.push(hintIndex);
            // Close modal after short delay
            setTimeout(() => {
                mathQuestionModal.classList.add('hidden');
                renderLeftCanvas();
                renderRightCanvas();
            }, 1000);
        }
    } else {
        mathFeedback.textContent = 'Incorrect! Try again.';
        mathFeedback.className = 'incorrect';
        mathAnswerInput.value = '';
        mathAnswerInput.focus();
    }
}

// ============================================
// EVENT LISTENERS
// ============================================

// Menu buttons
playButton.addEventListener('click', () => {
    showScreen(settingsPanel);
});

dailyChallengeButton.addEventListener('click', () => {
    startDailyChallenge();
});

leaderboardsButton.addEventListener('click', () => {
    updateLeaderboardRankings();
    renderOverallLeaderboard();
    showScreen(leaderboardsScreen);
});

managePlayersButton.addEventListener('click', () => {
    updatePlayerList();
    showScreen(managePlayersScreen);
});

// Settings
difficultySelect.addEventListener('change', function() {
    customDifficulty.classList.toggle('hidden', this.value !== 'custom');
});

mapSizeSelect.addEventListener('change', function() {
    customSizeInputs.classList.toggle('hidden', this.value !== 'custom');
});

timerSelect.addEventListener('change', function() {
    customTimer.classList.toggle('hidden', this.value !== 'custom');
});

startButton.addEventListener('click', () => {
    isDailyChallenge = false;
    seededRNG = null;
    dailyBadge.classList.add('hidden');
    
    // Re-enable settings
    difficultySelect.disabled = false;
    mapSizeSelect.disabled = false;
    timerSelect.disabled = false;
    customDifficulty.disabled = false;
    customWidth.disabled = false;
    customHeight.disabled = false;
    customTimer.disabled = false;
    
    startGame();
});

backToMenuButton.addEventListener('click', () => {
    showScreen(mainMenu);
});

// Game controls
restartButton.addEventListener('click', restartGame);
backToMenuFromGame.addEventListener('click', () => {
    stopTimer();
    isDailyChallenge = false;
    seededRNG = null;
    dailyBadge.classList.add('hidden');
    showScreen(mainMenu);
});

// Canvas clicks (both panels are interactive)
canvasRight.addEventListener('click', (e) => handleCanvasClick(e, false));
canvasLeft.addEventListener('click', (e) => handleCanvasClick(e, true));

// Leaderboard tabs
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        if (this.dataset.tab === 'overall') {
            renderOverallLeaderboard();
        } else {
            renderDailyLeaderboard();
        }
    });
});

backFromLeaderboards.addEventListener('click', () => {
    showScreen(mainMenu);
});

// Player management
createPlayerButton.addEventListener('click', () => {
    createPlayer(newPlayerName.value);
});

exportPlayerButton.addEventListener('click', exportCurrentPlayer);
exportAllPlayersButton.addEventListener('click', exportAllPlayers);
importPlayerButton.addEventListener('click', triggerPlayerFileImport);
importPlayerFile.addEventListener('change', handlePlayerFileImport);
backFromPlayers.addEventListener('click', () => {
    showScreen(mainMenu);
});

// Hint system
hintButton.addEventListener('click', showHintQuestion);
submitMathAnswer.addEventListener('click', checkMathAnswer);
cancelMathQuestion.addEventListener('click', () => {
    mathQuestionModal.classList.add('hidden');
});

// Allow Enter key to submit math answer
mathAnswerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        checkMathAnswer();
    }
});

// Overlays
newGameButton.addEventListener('click', () => {
    winOverlay.classList.add('hidden');
    if (isDailyChallenge) {
        restartGame();
    } else {
        showScreen(settingsPanel);
    }
});

restartAfterTimeUp.addEventListener('click', () => {
    timeUpOverlay.classList.add('hidden');
    restartGame();
});

backToMenuFromWin.addEventListener('click', () => {
    winOverlay.classList.add('hidden');
    isDailyChallenge = false;
    seededRNG = null;
    dailyBadge.classList.add('hidden');
    showScreen(mainMenu);
});

backToMenuFromTimeUp.addEventListener('click', () => {
    timeUpOverlay.classList.add('hidden');
    isDailyChallenge = false;
    seededRNG = null;
    dailyBadge.classList.add('hidden');
    showScreen(mainMenu);
});

// ===============
// TIPS & FEEDBACK
// ===============
const AI_TIPS = [
    "Try scanning both images in sections instead of darting your eyes randomly.",
    "Want a better score? Try to look for shapes, not colors!",
    "Quick glances can help you spot differences faster than staring.",
    "Practice helps: you’ll get better at spotting subtle changes over time!",
    "Focus on edges and corners—they often hide differences.",
    "Keep an eye on repeating patterns; a missing detail might be there.",
    "Mirroring the direction you scan from time to time can reveal what you missed.",
    "When in doubt, use a hint! Hints are there to help improve your reaction time.",
    "Don't rush! Sometimes taking a second to re-focus lets you see more.",
    "Combos give big bonuses. Try to find differences in rapid succession!",
];
function pickAITip() {
    return AI_TIPS[Math.floor(Math.random() * AI_TIPS.length)];
}

// ============================================
// INITIALIZATION
// ============================================

// Initialize on page load
loadPlayerData();
initMenu();
showScreen(mainMenu);

// Make functions available globally for onclick handlers
window.switchPlayer = switchPlayer;
window.deletePlayer = deletePlayer;
