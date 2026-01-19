
import type { LogicElement, LogicPin, Wire } from '../../types/logicTypes.js';

/**
 * Evaluate all logic gates in the circuit and update their output pin states.
 * Pure function: does not interact with DOM.
 */
export function evaluateLogicGates(elements: LogicElement[], pins: LogicPin[]): void {
  // Helper to get pin state by pin id
  function getPinState(pinId?: number): boolean {
    if (typeof pinId !== 'number') return false;
    const pin = pins.find(p => p.id === pinId);
    return pin ? !!pin.state : false;
  }
  for (const el of elements) {
    if (!el.pins || el.pins.length === 0) continue;
    const inputPins = el.pins.filter((p: LogicPin) => p.dir === 'in');
    const outputPins = el.pins.filter((p: LogicPin) => p.dir === 'out');
    let result = false;
    switch (el.type) {
      case 'logic-and':
        result = inputPins.length === 2 &&
          inputPins[0] !== undefined && inputPins[1] !== undefined &&
          getPinState(inputPins[0].incommingPinID) && getPinState(inputPins[1].incommingPinID);
        break;
      case 'logic-or':
        result = inputPins.length === 2 &&
          inputPins[0] !== undefined && inputPins[1] !== undefined &&
          (getPinState(inputPins[0].incommingPinID) || getPinState(inputPins[1].incommingPinID));
        break;
      case 'logic-nand':
        result = inputPins.length === 2 &&
          inputPins[0] !== undefined && inputPins[1] !== undefined &&
          !(getPinState(inputPins[0].incommingPinID) && getPinState(inputPins[1].incommingPinID));
        break;
      case 'logic-xor':
        result = inputPins.length === 2 &&
          inputPins[0] !== undefined && inputPins[1] !== undefined &&
          (getPinState(inputPins[0].incommingPinID) !== getPinState(inputPins[1].incommingPinID));
        break;
      case 'logic-not':
        result = inputPins.length === 1 &&
          inputPins[0] !== undefined &&
          !getPinState(inputPins[0].incommingPinID);
        break;
      case 'input-switch':
        continue;
      default:
        continue;
    }
    if (outputPins.length > 0 && outputPins[0] !== undefined) {
      outputPins[0].state = result;
    }
  }
}
