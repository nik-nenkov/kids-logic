// Draw a temporary SVG line for wire preview
function drawTempWireLine(x1: number, y1: number, x2: number, y2: number, color = 'black', width = 3) {
	const svg = document.getElementById('grid');
	if (!svg) return;
	let tempLine = document.getElementById('temp-wire-line') as SVGLineElement | null;
	if (!tempLine) {
		tempLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
		tempLine.setAttribute('id', 'temp-wire-line');
		svg.appendChild(tempLine);
	}
	tempLine.setAttribute('x1', x1.toString());
	tempLine.setAttribute('y1', y1.toString());
	tempLine.setAttribute('x2', x2.toString());
	tempLine.setAttribute('y2', y2.toString());
	tempLine.setAttribute('stroke', color);
	tempLine.setAttribute('stroke-width', width.toString());
	tempLine.setAttribute('pointer-events', 'none');
}

function removeTempWireLine() {
	const tempLine = document.getElementById('temp-wire-line');
	if (tempLine && tempLine.parentNode) {
		tempLine.parentNode.removeChild(tempLine);
	}
}
// Setup wiring logic for connecting pins
export function setupWiring() {
	const gridContainer = document.getElementById('grid-container');
	const selectedPinLabel = document.getElementById('selected-pin');
	if (!gridContainer || !selectedPinLabel) return;
	gridContainer.addEventListener('click', function (e) {
		if (state.simulationMode) return;
		// Only allow wiring if a pin is hovered or selected
		if (state.hoveredPinID) {
			if (state.selectedPinID === state.hoveredPinID) {
				state.selectedPinID = null;
				selectedPinLabel.textContent = 'pin: none';
				state.floatingDiv = null;
				removeTempWireLine();
				return;
			}
			if (state.selectedPinID) {
				// connect wires: always from output pin to input pin
				const pinA = state.logicPins.find(p => p.id === state.selectedPinID);
				const pinB = state.logicPins.find(p => p.id === state.hoveredPinID);
				if (pinA && pinB && pinA.dir !== pinB.dir) {
					let fromPin, toPin;
					if (pinA.dir === 'out' && pinB.dir === 'in') {
						fromPin = pinA;
						toPin = pinB;
					} else if (pinB.dir === 'out' && pinA.dir === 'in') {
						fromPin = pinB;
						toPin = pinA;
					} else {
						// Invalid connection (e.g., in-in or out-out)
						return;
					}
					// Prevent duplicate wires
					if (!state.wires.some(w => w.from === fromPin.id && w.to === toPin.id)) {
						state.wires.push({ from: fromPin.id, to: toPin.id });
						toPin.incommingPinID = fromPin.id;
						removeTempWireLine();
						// Render wires immediately in edit mode (black)
						renderWires(state.wires, state.logicPins, false);
					}
				}
				state.selectedPinID = null;
				selectedPinLabel.textContent = 'pin: none';
				state.floatingDiv = null;
				removeTempWireLine();
				return;
			}
			state.selectedPinID = state.hoveredPinID;
			selectedPinLabel.textContent = 'pin: ' + state.selectedPinID;
			// temp wire will be shown by mousemove handler
		} else {
			state.selectedPinID = null;
			selectedPinLabel.textContent = 'pin: none';
			removeTempWireLine();
		}
	});
}
import type { LogicElement, LogicPin } from '../../types/logicTypes.js';
import { renderWires } from './renderer.js';
// Helper to remove selected state from all component buttons
function removeSelected() {
	state.selectedComponentType = null;
	document.querySelectorAll('.component-button.selected').forEach(b => b.classList.remove('selected'));
	// Remove floating preview if present
	if (state.floatingDiv && state.floatingDiv.parentNode) {
		state.floatingDiv.parentNode.removeChild(state.floatingDiv);
	}
	state.floatingDiv = null;
}
// Cancel selection on Escape or right-click
function setupCancelSelectionEvents() {
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape' && state.selectedComponentType) {
			removeSelected();
		}
	});
	document.addEventListener('contextmenu', (e) => {
		if (state.selectedComponentType) {
			e.preventDefault();
			removeSelected();
		}
	});
}


// Setup component button click events
export function setupComponentButtons() {
	document.querySelectorAll('.component-button').forEach(btn => {
		btn.addEventListener('click', () => {
			if (state.simulationMode) return;
			removeSelected();
			btn.classList.add('selected');
			state.selectedComponentType = btn.getAttribute('data-type');
			const div = document.createElement('div');
			div.className = 'floating';
			div.style.zIndex = '1000';
			switch (state.selectedComponentType) {
				case 'input-switch':
					div.innerText = '⏻';
					div.classList.add('input-1');
					break;
				case 'output-light':
					div.innerText = '💡';
					div.classList.add('output-1');
					break;
				case 'logic-and':
					div.innerText = '&';
					div.classList.add('logic');
					break;
				case 'logic-or':
					div.innerText = '∥';
					div.classList.add('logic');
					break;
				case 'logic-xor':
					div.innerText = '⊻';
					div.classList.add('logic');
					break;
				case 'logic-nand':
					div.innerText = '⊼';
					div.classList.add('logic');
					break;
				case 'logic-not':
					div.innerText = '¬';
					div.classList.add('logic');
					break;
			}
			state.floatingDiv = div;
			document.getElementById('grid-container')?.appendChild(div);
		});
	});

	// Setup cancel selection events
	setupCancelSelectionEvents();
}

// Global pin ID counter to guarantee unique pin IDs
let globalPinId = (() => {
	// Find the max pin id in state.logicPins (for reloads)
	if (Array.isArray(state.logicPins) && state.logicPins.length > 0) {
		return Math.max(...state.logicPins.map(p => p.id)) + 1;
	}
	return 1;
})();

function preparePins(type: string, x: number, y: number): LogicPin[] {
	let newPins: LogicPin[] = [];
	switch (type) {
		case 'input-switch':
			newPins = [{ id: globalPinId++, x: x + 50, y: y + 25, dir: 'out', state: false }];
			break;
		case 'output-light':
			newPins = [{ id: globalPinId++, x: x, y: y + 25, dir: 'in', incommingPinID: 0 }];
			break;
		case 'logic-and':
		case 'logic-or':
		case 'logic-xor':
		case 'logic-nand':
			newPins = [
				{ id: globalPinId++, x: x, y: y + 25, dir: 'in', incommingPinID: 0 },
				{ id: globalPinId++, x: x, y: y + 75, dir: 'in', incommingPinID: 0 },
				{ id: globalPinId++, x: x + 50, y: y + 50, dir: 'out', state: false }
			];
			break;
		case 'logic-not':
			newPins = [
				{ id: globalPinId++, x: x, y: y + 50, dir: 'in', incommingPinID: 0 },
				{ id: globalPinId++, x: x + 50, y: y + 50, dir: 'out', state: false }
			];
			break;
		default:
			newPins = [];
			break;
	}
	state.logicPins.push(...newPins);
	return newPins;
}

// Setup grid click for placing components
export function setupGridPlacement() {
	const gridContainer = document.getElementById('grid-container');
	if (!gridContainer) return;
	gridContainer.addEventListener('click', function (e) {
		if (state.simulationMode) return;
		if (state.selectedComponentType && (!((e.target as HTMLElement).classList?.contains('floating')) || e.target === state.floatingDiv)) {
			const newId = state.logicElements.length + 1;
			const type = state.selectedComponentType;
			const x = state.mouseGridX;
			const y = state.mouseGridY;
			const pins = preparePins(type!, x, y);
			state.logicElements.push({
				id: newId,
				type: type!,
				x,
				y,
				pins
			});
			// Render a static div for the placed element
			const elDiv = document.createElement('div');
			elDiv.className = 'floating';
			elDiv.style.left = x + 'px';
			elDiv.style.top = y + 'px';
			elDiv.style.zIndex = '10';
			switch (type) {
				case 'input-switch':
					elDiv.innerText = '⏻';
					elDiv.classList.add('input-1');
					(elDiv as any).dataset.state = 'false';
					break;
				case 'output-light':
					elDiv.innerText = '💡';
					elDiv.classList.add('output-1');
					break;
				case 'logic-and':
					elDiv.innerText = '&';
					elDiv.classList.add('logic');
					break;
				case 'logic-or':
					elDiv.innerText = '∥';
					elDiv.classList.add('logic');
					break;
				case 'logic-xor':
					elDiv.innerText = '⊻';
					elDiv.classList.add('logic');
					break;
				case 'logic-nand':
					elDiv.innerText = '⊼';
					elDiv.classList.add('logic');
					break;
				case 'logic-not':
					elDiv.innerText = '¬';
					elDiv.classList.add('logic');
					break;
			}
			document.getElementById('grid-container')?.appendChild(elDiv);
			// Remove floating preview after placement
			if (state.floatingDiv && state.floatingDiv.parentNode) {
				state.floatingDiv.parentNode.removeChild(state.floatingDiv);
			}
			state.floatingDiv = null;
			removeSelected();
			return;
		}
		// TODO: Add wiring logic here
	});
}

import { state } from './state.js';

// Mouse/grid coordinate and cursor feedback logic
export function setupGridMouseEvents() {
	const box = document.getElementById('grid');
	const cursorDot = document.getElementById('cursor-dot') as HTMLDivElement;
	const data = document.getElementById('coords');
	const selected = document.getElementById('select');
	if (!box || !cursorDot || !data || !selected) return;

	box.addEventListener('mousemove', function (e) {
		const rect = box.getBoundingClientRect();
		state.mouseGridX = -12 + Math.floor((e.clientX - rect.left) / 25) * 25;
		state.mouseGridY = -12 + Math.floor((e.clientY - rect.top) / 25) * 25;
		data.textContent = `x:${state.mouseGridX} y:${state.mouseGridY}`;
		selected.textContent = `s:${state.selectedComponentType}`;
		if (state.floatingDiv) {
			state.floatingDiv.style.left = state.mouseGridX + 'px';
			state.floatingDiv.style.top = state.mouseGridY + 'px';
		}
		// Draw temp wire from selected pin to mouse
		if (state.selectedPinID !== null) {
			const pin = state.logicPins.find(p => p.id === state.selectedPinID);
			if (pin) {
				drawTempWireLine(pin.x, pin.y, state.mouseGridX + 24, state.mouseGridY + 24);
			}
		} else {
			removeTempWireLine();
		}
		// Show/hide cursor dot based on proximity to pins, but only in edit mode
		if (state.simulationMode) {
			cursorDot.style.display = 'none';
			state.hoveredPinID = null;
			return;
		}
		let found = false;
		const mouseX = Math.round(e.clientX - rect.left);
		const mouseY = Math.round(e.clientY - rect.top);
		for (const el of state.logicElements) {
			for (const pin of el.pins) {
				const dx = mouseX - pin.x;
				const dy = mouseY - pin.y;
				const dist = Math.sqrt(dx * dx + dy * dy);
				if (dist <= 10) {
					found = true;
					state.hoveredPinID = pin.id;
					break;
				}
			}
			if (found) break;
		}
		if (found) {
			cursorDot.style.left = mouseX + 'px';
			cursorDot.style.top = mouseY + 'px';
			cursorDot.style.display = 'block';
		} else {
			cursorDot.style.display = 'none';
			state.hoveredPinID = null;
		}
	});
}
