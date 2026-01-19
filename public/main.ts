import { setupGridMouseEvents, setupComponentButtons, setupGridPlacement, setupWiring } from '../src/ui/events';
import { state } from '../src/ui/state';
import { renderWires, updateOutputLights } from '../src/ui/renderer';
import { evaluateLogicGates } from '../src/logic/simulation';

// Propagate signals through wires: set input pin state to match output pin state
function propagateWireSignals(): void {
	for (const wire of state.wires) {
		const fromPin = state.logicPins.find(p => p.id === wire.from);
		const toPin = state.logicPins.find(p => p.id === wire.to);
		if (fromPin && toPin && toPin.dir === 'in') {
			toPin.state = !!fromPin.state;
		}
	}
}

// Full simulation update: propagate, evaluate, update outputs, render
function runSimulationUpdate(): void {
	propagateWireSignals();
	evaluateLogicGates(state.logicElements, state.logicPins);
	propagateWireSignals(); // run again in case logic gates changed outputs
	updateOutputLights(state.logicElements, state.logicPins, state.simulationMode);
	renderWires(state.wires, state.logicPins, state.simulationMode);
}

// Entry point for the app. Bootstrapping logic
window.addEventListener('DOMContentLoaded', () => {
	setupGridMouseEvents();
	setupComponentButtons();
	setupGridPlacement();
	setupWiring();

	// Simulation mode toggle
	const simBtn = document.getElementById('start-sim-btn');
	if (simBtn) {
		simBtn.addEventListener('click', () => {
			state.simulationMode = !state.simulationMode;
			updateSimButton();
			// Update all input switches to show ON/OFF label and enable/disable toggling
			document.querySelectorAll('.floating.input-1').forEach(div => {
				let label = div.querySelector('.switch-label');
				if (state.simulationMode) {
					if (!label) {
						label = document.createElement('div');
						label.className = 'switch-label';
						(label as HTMLElement).style.fontSize = '1rem';
						(label as HTMLElement).style.textAlign = 'center';
						div.appendChild(label);
					}
					label.textContent = (div as any).dataset.state === 'true' ? 'ON' : 'OFF';
					(label as HTMLElement).style.color = (div as any).dataset.state === 'true' ? '#28a745' : '#dc3545';
					(div as HTMLElement).style.cursor = 'pointer';
				} else {
					if (label) label.remove();
					(div as HTMLElement).style.cursor = '';
				}
			});
            updateOutputLights(state.logicElements, state.logicPins, state.simulationMode);
			renderWires(state.wires, state.logicPins, state.simulationMode);
		});
	}

	function updateSimButton() {
		const btn = document.getElementById('start-sim-btn');
		if (!btn) return;
		if (state.simulationMode) {
			btn.textContent = 'Stop Simulation';
			btn.style.background = '#dc3545';
			btn.style.color = 'white';
			renderWires(state.wires, state.logicPins, true);
			updateOutputLights(state.logicElements, state.logicPins, true);
		} else {
			btn.textContent = 'Start Simulation';
			btn.style.background = '#28a745';
			btn.style.color = 'white';
			renderWires(state.wires, state.logicPins, false);
			updateOutputLights(state.logicElements, state.logicPins, false);
		}
	}

	// Toggle input switch state on click in simulation mode
	document.getElementById('grid-container')?.addEventListener('click', function (e: MouseEvent) {
		if (!state.simulationMode) return;
		let target = e.target as HTMLElement;
		// If clicking on a child of the input switch, find the parent
		if (target && !target.classList.contains('input-1')) {
			const parent = target.closest('.floating.input-1');
			if (parent) target = parent as HTMLElement;
		}
		if (target && target.classList.contains('input-1')) {
			// Toggle state
			const newState = (target as any).dataset.state === 'true' ? 'false' : 'true';
			(target as any).dataset.state = newState;

			// Find the corresponding logic element and pin by position (x, y)
			const x = parseInt(target.style.left || '0', 10);
			const y = parseInt(target.style.top || '0', 10);
			const el = state.logicElements.find(el => el.type === 'input-switch' && el.x === x && el.y === y);
			if (el && el.pins && el.pins.length > 0) {
				const pin = el.pins.find(p => p.dir === 'out');
				if (pin) pin.state = newState === 'true';
			}

			// Update label for all input switches
			document.querySelectorAll('.floating.input-1').forEach(div => {
				let label = div.querySelector('.switch-label');
				if (!label) {
					label = document.createElement('div');
					label.className = 'switch-label';
					(label as HTMLElement).style.fontSize = '1rem';
					(label as HTMLElement).style.textAlign = 'center';
					div.appendChild(label);
				}
				label.textContent = (div as any).dataset.state === 'true' ? 'ON' : 'OFF';
				(label as HTMLElement).style.color = (div as any).dataset.state === 'true' ? '#28a745' : '#dc3545';
			});
			// Full simulation update (propagate, evaluate, update outputs, render)
			runSimulationUpdate();
		}
	});

	// Initial render
	runSimulationUpdate();
});
