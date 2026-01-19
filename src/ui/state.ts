
import type { LogicElement, LogicPin, Wire } from '../../types/logicTypes.js';

export interface AppState {
	selectedComponentType: string | null;
	floatingDiv: HTMLDivElement | null;
	logicElements: LogicElement[];
	logicPins: LogicPin[];
	wires: Wire[];
	simulationMode: boolean;
	hoveredPinID: number | null;
	selectedPinID: number | null;
	mouseGridX: number;
	mouseGridY: number;
}

export const state: AppState = {
	selectedComponentType: null,
	floatingDiv: null,
	logicElements: [],
	logicPins: [{ id: 0, x: 0, y: 0, dir: 'out', state: false }],
	wires: [],
	simulationMode: false,
	hoveredPinID: null,
	selectedPinID: null,
	mouseGridX: 0,
	mouseGridY: 0,
};
