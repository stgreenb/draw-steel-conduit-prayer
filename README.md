# Draw Steel: Conduit Prayer Module

Conduit class prayer mechanics for Draw Steel.

## Features

- **Prayer Mechanics**: Single-roll prayer system at turn start:
  - Prayer 1: +1 piety + 1d6+level psychic damage (unblockable)
  - Prayer 2: +1 piety (safe)
  - Prayer 3: +2 piety + domain effect activation
- **Enricher Integration**: Uses Draw Steel's `/gain` system for proper resource management
- **Ownership-based Dialogs**: Only appears on the owning player's client
- **Foundry v14 Support**: Full compatibility with Application V2 and pop-out dialogs

## ⚠️ Version 3.0.0 Breaking Changes

This version is a **major update** that requires Foundry v14 and Draw Steel 1.0. Older versions are **not compatible**.

**Minimum Requirements:**
- Foundry VTT **v14.360+** (previously v12+)
- Draw Steel System **v1.0.0+** (previously 0.10.0+)
- lib-wrapper module

**Not Compatible With:**
- Foundry v12-v13
- Draw Steel 0.x versions

If you are still on older versions, please remain on v2.x of this module.

## Installation

1. In Foundry VTT, go to **Game Settings** → **Manage Modules**
2. Click **Add Module** → **Install Module**
3. Enter the Manifest URL:
   ```
   https://github.com/stgreenb/draw-steel-conduit-prayer/releases/latest/download/module.json
   ```
4. Click **Install** and enable the module

## Migration Guide

If upgrading from v2.x:

1. **Upgrade Foundry** to v14.360 or later (see [Foundry release notes](https://foundryvtt.com/releases))
2. **Upgrade Draw Steel** system to v1.0.0 or later
3. **Update this module** to v3.0.0
4. **Test** prayer prompts and piety suppression in a test scene before using in live game

**Note:** Your existing games will continue to work, but the module may not initialize until all dependencies are upgraded.

## What's New in v3.0.0

- Complete rewrite of chat message suppression for Draw Steel 1.0's new `parts` system
- Scans **all message parts** (not just first) for accurate detection
- Handles both legacy `data.flavor` and new `system.parts` formats
- Verified compatibility with Foundry v14's pop-out/detached window dialogs
- Improved error handling for edge cases (empty parts arrays, undefined properties)

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
