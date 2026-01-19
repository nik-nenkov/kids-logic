# Kids Logic - Architecture & Refactoring Plan

## Goals
- Modular, maintainable, and scalable codebase
- Clear separation of concerns (logic, rendering, UI, data)
- Type safety and modern tooling (TypeScript, SCSS)
- Support for saving/loading circuits as JSON

## Proposed Folder Structure

src/
  logic/
    circuit.ts         # Data types, serialization, deserialization
    simulation.ts      # Logic evaluation, simulation state
  ui/
    renderer.ts        # Drawing elements, wires, pins
    events.ts          # UI event handlers
    state.ts           # UI state management
  main.ts              # Entry point, bootstrapping
public/
  index.html
  styles.scss
  assets/             # (optional) images, icons, etc.
types/
  logicTypes.ts        # Shared TypeScript types/interfaces

## Extraction Plan

- Extract data types (LogicElement, LogicPin, Wire, Circuit) into types/logicTypes.ts
- Move all logic evaluation and simulation code to src/logic/simulation.ts (pure functions, no DOM)
- Move all DOM/SVG rendering to src/ui/renderer.ts
- Move all event listeners and handlers to src/ui/events.ts
- Centralize state (elements, pins, wires, simulation mode) in src/ui/state.ts
- Implement JSON serialization/deserialization in src/logic/circuit.ts
- Use TypeScript for all new/extracted code
- Use SCSS for styles in public/styles.scss

## Migration Steps

1. Set up new folder structure and .gitignore
2. Extract and type data models (LogicElement, LogicPin, Wire, Circuit)
3. Refactor logic evaluation and simulation into pure functions
4. Refactor rendering and event handling into separate modules
5. Implement JSON save/load for circuits
6. Migrate UI and main logic to TypeScript
7. Replace CSS with SCSS
8. Integrate build tools (e.g., Vite, Webpack) for TS/SCSS

## Notes
- Each file/class should have a single responsibility
- Methods in a file/class should operate at similar abstraction
- Favor composition and clear separation of concerns
- Keep files and methods short and easy to read/upgrade
