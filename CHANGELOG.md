# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.3] - 2025-01-15
### Fixed
- Fixed diff algorithm to only unmount child components in replaced subtrees, not the parent component itself, resolving navigation issues when render output types change

## [2.0.2] - 2025-01-15
### Added
- Minimal built-in `Router` class for client-side routing in single-page aplications
- Improvement: Children elements are now properly passed as `props.children` to components

## [2.0.1] - 2025-01-14
### Fixed
- Fixed all ESLint errors and warnings

## [2.0.0] - 2025-01-14
### Added
- Super simple virtual DOM implementation
- Smart diffing algorithm
- Minimal DOM patching
- Support for keyed lists to optimize re-renders

### Changed
- **BREAKING**: MAjor rewrite using virtual DOM architecture
- **BREAKING**: `h()` now returns lightweight VNodes instead of DOM elements or component instances
- **BREAKING**: Component updates now use reconciliation instead of full replacement
- **BREAKING**: Simplified Component class - removed `autoUpdate` property (always automatic now )
- Improved performance with surgical DOM updates
- Natural focus preservation without complex tracking

### Removed
- **BREAKING**: Removed `autoUpdate` property from Component class
- **BREAKING**: Removed `updateDebounceDelay` and debouncing mechanism
- **BREAKING**: Removed complex focus preservation code
- **BREAKING**: Removed fragment markers system
- **BREAKING**: Removed direct DOM manipulation in favor of virtual DOM

## [1.1.0] - 2025-07-21
### Added
- Debouncing mechanism for component updates via `updateDebounceDelay` property.
- Path-based focus restoration that works without requiring element IDs.
- Comprehensive tests for the debouncing functionality.
- Comprehensive tests for path-based focus restoration.
- Documentation and examples for using the debouncing feature.

### Changed
- The `update()` method now supports debouncing when `updateDebounceDelay` is set to a value greater than 0.
- Focus restoration now works automatically without requiring elements to have IDs (backward compatible with ID-based approach).
- `componentWillUnmount` now clears any pending debounced updates automatically.

## [1.0.1] - 2025-05-17
### Added
- GitHub Actions CI workflow for automated testing and linting.
- Status badge for CI in `readme.md`.

### Changed
- Minor code style adjustments and removal of internal/superfluous comments.

## [1.0.0] - 2025-05-17
### Added
- Initial public release of PicoJSX.
- Lightweight JSX-like rendering engine via `h` function.
- Class-based Components with `props`, `state`, and lifecycle methods (`componentDidMount`, `componentWillUnmount`, `componentDidUpdate`).
- Support for simple Functional Components.
- `PicoJSX.Fragment` for grouping multiple elements.
- `ref` support (callback and object refs) for direct DOM element access.
- `createStore` API for global state management, with optional `localStorage` persistence.
- `className` prop support (automatically converted to `class` attribute).
- `dangerouslySetInnerHTML` prop for inserting raw HTML.
- Automatic UI updates on `setState` by default, with option for manual updates.
- Basic focus management attempts.
