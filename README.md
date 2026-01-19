
# Kids Logic

Kids Logic is a visual digital logic simulator for experimenting with basic logic gates and circuits. It features a drag-and-drop interface, interactive simulation, and visual feedback for learning and prototyping logic networks.

## Features

- **Logic Elements Menu:**
	- Add elements like Input Switch, Output Light, AND, OR, NOT, XOR, and NAND gates from the left panel.
- **Grid Placement:**
	- Place elements anywhere on the grid by selecting from the menu and clicking on the grid.
- **Wiring with Logic Pins:**
	- Each element has logic pins (input/output). Connect elements by selecting pins and drawing wires between them.
	- Wires are colored: black in edit mode, green/red in simulation mode (showing signal state).
- **Simulation Mode:**
	- Toggle simulation with the 'Start Simulation' button. In simulation mode:
		- Input switches can be toggled ON/OFF.
		- Output lights show ON/OFF state (green/red).
		- Logic gates evaluate their outputs in real time.
- **Visual Feedback:**
	- Hovering over pins highlights them for easy wiring.
	- Cursor and pin selection are visually indicated.
- **Save & Replay (Planned):**
	- The codebase is structured to allow saving and replaying logic networks, though UI for this may be in progress.

## How to Use

1. **Add Elements:**
	 - Click a component button (e.g., AND, OR, Input Switch) in the left panel.
	 - Move your mouse to the grid and click to place the element.
2. **Wire Elements:**
	 - Click on a pin to select it, then click another pin to connect them with a wire.
	 - Wires connect outputs to inputs (e.g., switch output to gate input).
3. **Simulate:**
	 - Click 'Start Simulation' to enter simulation mode.
	 - Toggle input switches by clicking them; outputs and wires update live.
	 - Click 'Stop Simulation' to return to edit mode.
4. **Save & Replay:**
	 - (Planned) Save your logic network and replay its behavior later.

## Logic Elements Supported

- **Input Switch:** User-togglable input (ON/OFF)
- **Output Light:** Shows output state (ON = green, OFF = yellow)
- **AND, OR, NOT, XOR, NAND Gates:** Standard logic gates with real-time evaluation

## Educational Purpose

Kids Logic is designed for learning and experimenting with digital logic. It’s simple, visual, and interactive—ideal for students and beginners.
