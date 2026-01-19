/**
 * Update output lights: show ON/OFF label and color in simulation mode, reset in edit mode.
 */
import type { LogicElement } from '../../types/logicTypes.js';

export function updateOutputLights(
	elements: LogicElement[],
	pins: LogicPin[],
	simulationMode: boolean
): void {
	document.querySelectorAll<HTMLDivElement>('.floating.output-1').forEach(div => {
		// Find the corresponding logic element
		const x = parseInt(div.style.left || '0', 10);
		const y = parseInt(div.style.top || '0', 10);
		const el = elements.find(el => el.x === x && el.y === y && el.type === 'output-light');
		if (!el || !el.pins || el.pins.length === 0) return;
		const inputPin = el.pins.find(p => p.dir === 'in');
		let state = false;
		if (inputPin && inputPin.incommingPinID !== undefined) {
			// Get the state from the connected output pin
			const fromPin = pins.find(p => p.id === inputPin.incommingPinID);
			state = fromPin ? !!fromPin.state : false;
			inputPin.state = state;
		}
		// Add or update label
		let label = div.querySelector<HTMLDivElement>('.output-label');
		if (!simulationMode) {
			// Remove all children and reset to plain emoji and style, just like input switch reset
			while (div.firstChild) div.removeChild(div.firstChild);
			div.innerText = '';
			div.style.backgroundColor = 'lightyellow';
			div.className = 'floating output-1';
			div.appendChild(document.createTextNode('💡'));
			return;
		}
		// Show label and color in simulation mode
		if (!label) {
			label = document.createElement('div');
			label.className = 'output-label';
			div.appendChild(label);
		}
		label.style.display = 'block';
		label.style.fontSize = '1rem';
		label.style.margin = '0 auto';
		label.style.marginTop = '2px';
		label.style.textAlign = 'center';
		label.style.position = 'relative';
		label.textContent = state ? 'ON' : 'OFF';
		label.style.color = state ? '#28a745' : '#dc3545';
		div.style.background = state ? 'lightgreen' : 'lightyellow';
	});
}

import type { LogicPin, Wire } from '../../types/logicTypes.js';

/**
 * Render all wires with color based on signal.
 */
export function renderWires(
	wires: Wire[],
	pins: LogicPin[],
	simulationMode: boolean
): void {
	const grid = document.getElementById('grid');
	if (!grid) return;
	Array.from(grid.querySelectorAll('line.wire-line')).forEach(line => line.remove());
	for (const wire of wires) {
		const fromPin = pins.find(p => p.id === wire.from);
		const toPin = pins.find(p => p.id === wire.to);
		if (!fromPin || !toPin) continue;
		// In simulation mode, propagate the signal from output pin to input pin
		if (simulationMode && toPin.dir === 'in') {
			toPin.state = !!fromPin.state;
		}
		let color = 'black';
		if (simulationMode) {
			color = fromPin.state ? 'green' : 'red';
		}
		const wireLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
		wireLine.setAttribute('x1', fromPin.x.toString());
		wireLine.setAttribute('y1', ((fromPin.y ?? 0) - 1).toString());
		wireLine.setAttribute('x2', toPin.x.toString());
		wireLine.setAttribute('y2', ((toPin.y ?? 0) - 1).toString());
		wireLine.setAttribute('stroke', color);
		wireLine.setAttribute('stroke-width', '3');
		wireLine.setAttribute('class', 'wire-line');
		grid.appendChild(wireLine);
	}
}
