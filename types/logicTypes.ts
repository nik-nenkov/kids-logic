// Shared types for logic elements, pins, wires, and circuits

export interface LogicPin {
  id: number;
  x: number;
  y: number;
  dir: 'in' | 'out';
  state?: boolean;
  incommingPinID?: number;
}

export interface LogicElement {
  id: number;
  type: string;
  x: number;
  y: number;
  pins: LogicPin[];
}

export interface Wire {
  from: number;
  to: number;
}

export interface Circuit {
  elements: LogicElement[];
  pins: LogicPin[];
  wires: Wire[];
}
