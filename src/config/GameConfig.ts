// Game Configuration based on Chef's Last Stand GDD

export const GAME_CONFIG = {
  width: Math.min(1280, window.innerWidth),
  height: Math.min(720, window.innerHeight),
  targetFPS: 60,
  backgroundColor: '#1a1a2e'
};

export const PLAYER_CONFIG = {
  speed: 150,
  baseHealth: 100,
  baseDefense: 0,
  collisionRadius: 16
};

export const ENEMY_CONFIG = {
  spawnInterval: 1200, // 1.2 seconds (faster spawning)
  maxEnemies: 300, // More enemies on screen
  spawnDistance: 400,
  // Difficulty scaling
  healthScaling: 1.08, // 8% health increase per minute
  damageScaling: 1.05, // 5% damage increase per minute
  speedScaling: 1.03, // 3% speed increase per minute
  spawnRateScaling: 0.95 // Spawn 5% faster each minute (multiplier decreases interval)
};

export const WEAPON_CONFIG = {
  // Hamburger Station (base weapon)
  hamburger: {
    damage: 10,
    cooldown: 1500,
    projectileSpeed: 200,
    range: 250,
    pierce: 0
  },
  // Pizza Cutter (melee spin)
  pizzaCutter: {
    damage: 8,
    cooldown: 500,
    radius: 80,
    duration: 2000
  },
  // Soda Fountain (area effect)
  sodaFountain: {
    damage: 5,
    cooldown: 3000,
    radius: 150,
    duration: 3000,
    slowEffect: 0.5
  },
  // Coffee Machine (rapid fire)
  coffeeMachine: {
    damage: 6,
    cooldown: 300,
    projectileSpeed: 300,
    range: 200
  },
  // Fryer Oil (pools)
  fryerOil: {
    damage: 15,
    cooldown: 5000,
    poolCount: 3,
    poolRadius: 60,
    duration: 5000
  },
  // Ice Cream Scoop (orbital)
  iceCreamScoop: {
    damage: 12,
    cooldown: 2000,
    orbitRadius: 100,
    orbitSpeed: 2
  }
};

export const CHARACTER_STATS = {
  rookie: {
    name: '🍳 신입 셰프',
    health: 100,
    speed: 150,
    damage: 1.0,
    defense: 0,
    startWeapon: 'hamburger'
  },
  grillMaster: {
    name: '🔥 그릴 마스터',
    health: 120,
    speed: 140,
    damage: 1.2,
    defense: 5,
    startWeapon: 'hamburger'
  },
  pastryChef: {
    name: '🧁 제과 셰프',
    health: 90,
    speed: 160,
    damage: 0.9,
    defense: 0,
    startWeapon: 'iceCreamScoop'
  },
  sushiChef: {
    name: '🍣 스시 셰프',
    health: 95,
    speed: 170,
    damage: 1.1,
    defense: 0,
    startWeapon: 'pizzaCutter'
  },
  headChef: {
    name: '👨‍🍳 수석 셰프',
    health: 130,
    speed: 130,
    damage: 1.15,
    defense: 10,
    startWeapon: 'hamburger'
  },
  lineChef: {
    name: '⚡ 라인 셰프',
    health: 110,
    speed: 155,
    damage: 1.05,
    defense: 3,
    startWeapon: 'coffeeMachine'
  },
  sousChef: {
    name: '🎖️ 수셰프',
    health: 105,
    speed: 145,
    damage: 1.1,
    defense: 5,
    startWeapon: 'sodaFountain'
  },
  fryChef: {
    name: '🍟 튀김 셰프',
    health: 115,
    speed: 135,
    damage: 1.25,
    defense: 8,
    startWeapon: 'fryerOil'
  }
};

export const ENEMY_TYPES = {
  normal: {
    name: 'Normal Customer',
    health: 30, // Increased from 20
    speed: 60, // Increased from 50
    damage: 12, // Increased from 10
    xp: 1,
    color: 0x00ff00
  },
  hungry: {
    name: 'Hungry Customer',
    health: 25, // Increased from 15
    speed: 90, // Increased from 80
    damage: 10, // Increased from 8
    xp: 2,
    color: 0xffff00
  },
  karen: {
    name: 'Karen',
    health: 70, // Increased from 50
    speed: 50, // Increased from 40
    damage: 20, // Increased from 15
    xp: 5,
    color: 0xff00ff
  },
  influencer: {
    name: 'Influencer',
    health: 18, // Increased from 10
    speed: 100, // Increased from 90
    damage: 8, // Increased from 5
    xp: 3,
    color: 0x00ffff
  },
  foodCritic: {
    name: 'Food Critic',
    health: 150, // Increased from 100
    speed: 40, // Increased from 30
    damage: 35, // Increased from 25
    xp: 10,
    color: 0xff0000
  },
  boss: {
    name: 'Angry Manager',
    health: 1500, // Increased from 1000
    speed: 70, // Increased from 60
    damage: 40, // Increased from 30
    xp: 100,
    color: 0xff4400
  }
};

export const XP_CONFIG = {
  levelUpBase: 10,
  levelUpMultiplier: 1.2,
  xpCollectionRadius: 50
};

export const GAME_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds
