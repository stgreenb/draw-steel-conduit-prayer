# Changelog

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