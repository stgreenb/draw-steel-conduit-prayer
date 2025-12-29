# Draw Steel: Conduit Prayer Module

Automates the Conduit's prayer mechanic for Draw Steel.

## Features

- Prompts Conduit players to pray before piety gain at turn start
- Implements official two-roll prayer system:
  - Prayer 1: +1 piety + psychic damage
  - Prayer 2: +1 piety (safe)
  - Prayer 3: +2 piety + domain effect
- Player-only dialogs (GM doesn't get popups)

## Requirements

- Foundry VTT v13+
- Draw Steel System

## Installation

1. In Foundry VTT, go to **Game Settings** → **Manage Modules**
2. Click **Add Module** → **Install Module**
3. Enter the Manifest URL:
   ```
   https://github.com/stgreenb/draw-steel-conduit-prayer/releases/latest/download/module.json
   ```
4. Click **Install** and enable the module

## Usage

1. Start combat with a Conduit character
2. Prayer dialog appears automatically at turn start
3. Choose to pray or skip

## License

MIT
