# Changelog

## [1.2.0] - 2025-01-15

### Fixed
- **Piety Suppression**: Fixed critical bug where automatic Draw Steel piety gain was not being suppressed, causing double piety
- Added `preUpdateCombatant` hook to set flag BEFORE `_onStartTurn` executes
- Added `preUpdateActor` hook to block automatic piety updates when prayer is active
- Added `renderChatMessageHTML` hook to hide automatic piety chat messages
- Proper single-roll implementation matching official Draw Steel rules

### Changed
- Simplified module code with consolidated handlers
- Removed verbose debug logging for cleaner production output
- Streamlined CSS and dialog text

## [1.1.0] - 2024-12-29

### Changed
- **Major Refactor**: Complete codebase cleanup and architecture simplification
- **Prayer Mechanics**: Fixed incorrect piety gains - prayer result 1 now correctly gives +1 piety (not 0)
- **Resource System**: Replaced manual actor updates with Draw Steel's `/gain` enricher system
- **Class Detection**: Simplified from 6 redundant methods to single canonical path
- **Socket Removal**: Eliminated all socket communication complexity
- **Data Access**: Removed non-existent max piety logic and simplified data paths
- **Error Handling**: Cleaned up excessive try-catch blocks and defensive coding
- **Performance**: Improved reliability and maintainability

### Fixed
- Correct prayer roll mechanics to match official Draw Steel rules
- Removed references to non-existent `system.hero.primary.max` path
- Fixed dice rolling to use standard Foundry Roll API with async evaluation
- Improved chat message formatting and CSS variable usage
- Improved code clarity and variable naming

### Removed
- Max piety capping logic (doesn't exist in Draw Steel)
- Socket message handling and cross-client communication
- Multiple redundant class detection methods
- Excessive fallback mechanisms and defensive coding
- Active dialog tracking Map
- Unused getConduitStamina() function

## [1.0.1] - 2024-12-29

### Fixed
- Removed unsupported `dependencies` key from module.json to resolve Foundry VTT manifest validation

## [1.0.0] - 2024-12-29

### Added
- Initial release of Draw Steel: Conduit Prayer module
- Automatic prayer dialog prompting at Conduit turn start
- Two-roll prayer system implementation:
  - Divine Wrath (prayer 1): +1 piety + psychic damage
  - Divine Grace (prayer 2): +1 piety (safe)
  - Divine Favor (prayer 3): +2 piety + domain effect activation
- Player-only dialog system with socket communication
- Integration with Draw Steel's native `_onStartTurn` method
- Proper suppression of normal piety gains during prayer flow
- Cross-client communication for GM-initiated turns
- Error handling and fallback mechanisms
- Minimal console logging with standard classifiers