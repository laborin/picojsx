# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
