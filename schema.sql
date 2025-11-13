-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  last_login INTEGER NOT NULL,
  total_playtime INTEGER DEFAULT 0,
  total_kills INTEGER DEFAULT 0,
  total_games_played INTEGER DEFAULT 0,
  longest_survival_time INTEGER DEFAULT 0,
  highest_level INTEGER DEFAULT 0,
  most_kills INTEGER DEFAULT 0,
  music_volume REAL DEFAULT 0.7,
  sfx_volume REAL DEFAULT 0.8
);

-- Unlocked characters table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS unlocked_characters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  character_id TEXT NOT NULL,
  unlocked_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, character_id)
);

-- Achievements table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  achievement_id TEXT NOT NULL,
  achieved_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, achievement_id)
);

-- Game saves table
CREATE TABLE IF NOT EXISTS game_saves (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  saved_at INTEGER NOT NULL,
  selected_character TEXT NOT NULL,
  player_level INTEGER NOT NULL,
  current_xp INTEGER NOT NULL,
  required_xp INTEGER NOT NULL,
  kill_count INTEGER NOT NULL,
  game_timer INTEGER NOT NULL,
  player_health INTEGER NOT NULL,
  player_max_health INTEGER NOT NULL,
  player_speed REAL NOT NULL,
  player_defense INTEGER NOT NULL,
  player_damage_multiplier REAL NOT NULL,
  weapons TEXT NOT NULL, -- JSON string
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Sessions table for authentication
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_unlocked_characters_user_id ON unlocked_characters(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_game_saves_user_id ON game_saves(user_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
