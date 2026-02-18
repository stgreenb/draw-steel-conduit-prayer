# Draw Steel: Conduit Prayer Module

Conduit class prayer mechanics for Draw Steel.

## Features

- **Prayer Mechanics**: Single-roll prayer system at turn start:
  - Prayer 1: +1 piety + 1d6+level psychic damage (unblockable)
  - Prayer 2: +1 piety (safe)
  - Prayer 3: +2 piety + domain effect activation
- **Enricher Integration**: Uses Draw Steel's `/gain` system for proper resource management
- **Ownership-based Dialogs**: Only appears on the owning player's client

## Requirements

- Foundry VTT v12+
- Draw Steel System 0.10.0+
- lib-wrapper module

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
2. Prayer dialog appears automatically at turn start (only on owning client)
3. Choose to pray or skip
4. **Click the "Gain Resource" button in chat** to receive your piety

## Discord

Join the discussion about this and other Foundry modules in the dedicated thread:
https://discord.com/channels/332362513368875008/1448382845692416000

## License

MIT
