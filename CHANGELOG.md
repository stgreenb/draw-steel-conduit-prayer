# Changelog

## [2.0.0-alpha.1] - 2026-02-15 [PRE-RELEASE]

### ⚠️ Breaking Changes
- Requires Draw Steel 0.10.0+ (not compatible with 0.9.x)
- Requires lib-wrapper module

### Changed
- **Chat Message Suppression**: Replaced `renderChatMessageHTML` hook with `preCreateChatMessage` hook
- **Parts System**: Uses Draw Steel 0.10.0's parts system for message detection via flavor identifier
- **HeroModel Override**: Replaced direct prototype override with libWrapper.register() for better module compatibility
- Added `HEROIC_RESOURCE_FLAVOR` constant for stable message identification

### Technical Details
- Message suppression now checks both `data.flavor` and `data.system.parts` for resource gain detection
- libWrapper uses MIXED mode to allow other modules to also wrap `_onStartTurn`
- Added null check for `owningUser` in turn start handler

### Note
This is a pre-release for testing with Draw Steel 0.10.0. Do not use with Draw Steel 0.9.x.

## [1.2.0] - 2026-01-15

### Changed
- **Prayer Mechanics**: Simplified to single-roll system
- Prayer roll now uses 1d3 with bonuses based on result
- Skip prayer option provides baseline piety gain

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