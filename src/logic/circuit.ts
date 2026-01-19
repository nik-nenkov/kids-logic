import type { LogicElement, LogicPin, Wire, Circuit } from '../../types/logicTypes.js';

/**
 * Serialize a circuit to JSON.
 */
export function serializeCircuit(circuit: Circuit): string {
  return JSON.stringify(circuit, null, 2);
}

/**
 * Deserialize a circuit from JSON.
 */
export function deserializeCircuit(json: string): Circuit {
  return JSON.parse(json);
}
