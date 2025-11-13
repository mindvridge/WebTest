# Chef's Last Stand

A restaurant-themed survivor-like game built with Phaser 3, TypeScript, and Vite.

## Game Overview

Survive the 24-hour fast food night shift as angry customers pour in! Use cooking tools and food items as weapons to defend yourself in this bullet-heaven style game inspired by Vampire Survivors.

## Features

- **8 Playable Chefs**: Each with unique stats and starting weapons
  - Rookie Chef, Grill Master, Pastry Chef, Sushi Chef, Head Chef, Line Chef, Sous Chef, and Fry Chef

- **6 Unique Weapons**:
  - Hamburger Station: Throws burgers at enemies
  - Pizza Cutter: Spinning melee attack
  - Soda Fountain: Area of effect with slow
  - Coffee Machine: Rapid-fire projectiles
  - Fryer Oil: Damaging pools on the ground
  - Ice Cream Scoop: Orbital defense

- **5 Enemy Types + Boss**:
  - Normal Customer
  - Hungry Customer (faster)
  - Karen (tanky)
  - Influencer (fast but weak)
  - Food Critic (high damage)
  - Angry Manager (boss)

- **Progression System**:
  - Level up by collecting XP from defeated enemies
  - Choose weapon upgrades and stat improvements
  - Evolving difficulty as the shift progresses

## Tech Stack

- **Game Engine**: Phaser 3
- **Language**: TypeScript
- **Build Tool**: Vite
- **Physics**: Arcade Physics

## Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Game Controls

- **WASD** or **Arrow Keys**: Move your chef
- Weapons auto-attack nearby enemies
- Survive for 30 minutes to win!

## Development

The game is structured as follows:

- `src/main.ts`: Game initialization
- `src/config/`: Game configuration and constants
- `src/scenes/`: Game scenes (Menu, Game, UI)
- `src/entities/`: Game entities (Player, Enemy, Weapon, XPGem)

## Design Documents

This game is based on comprehensive design documents including:
- Main Game Design Document (GDD)
- Visual Style Guide
- Detailed Korean Design Specifications

## Deployment

This game is optimized for **Cloudflare Pages** deployment:

- **Free unlimited bandwidth**
- **Global CDN** for fast worldwide performance
- **Automatic deployments** from Git
- **Free SSL** and analytics included

### Quick Deploy to Cloudflare Pages

1. Push this repository to GitHub/GitLab
2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → Pages
3. Connect your repository
4. Use these settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Node version**: `20`
5. Click "Save and Deploy"

Your game will be live in ~3 minutes at `https://chefs-last-stand.pages.dev`

📖 **Full deployment guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions, CLI deployment, GitHub Actions, and troubleshooting.

### Alternative Hosting Options

- **Netlify**: 100GB bandwidth/month free
- **Vercel**: Good for Next.js (requires Pro for commercial)
- **GitHub Pages**: Simple but slower performance
- **itch.io**: Game community platform with built-in monetization

## License

This project is created based on the Chef's Last Stand game design documents.
