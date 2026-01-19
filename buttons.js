// --- Render all wires with color based on signal ---
function renderWires() {
  // Remove all existing wire lines
  const grid = document.getElementById("grid");
  Array.from(grid.querySelectorAll('line.wire-line')).forEach(line => line.remove());
  for (const wire of window.wires) {
    const pinA = window.logicPins.find(p => p.id === wire.from);
    const pinB = window.logicPins.find(p => p.id === wire.to);
    if (!pinA || !pinB) continue;
    let color = 'black';
    if (window.simulationMode) {
      const signal = !!pinA.state;
      color = signal ? 'green' : 'red';
    }
    const wireLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    wireLine.setAttribute("x1", pinA.x);
    wireLine.setAttribute("y1", pinA.y - 1); // 1px higher
    wireLine.setAttribute("x2", pinB.x);
    wireLine.setAttribute("y2", pinB.y - 1); // 1px higher
    wireLine.setAttribute("stroke", color);
    wireLine.setAttribute("stroke-width", "3");
    wireLine.setAttribute("class", "wire-line");
    grid.appendChild(wireLine);
  }
}
// --- Update output lights after logic evaluation ---
function updateOutputLights() {
  document.querySelectorAll('.floating.output-1').forEach(div => {
    // Find the corresponding logic element
    const x = parseInt(div.style.left);
    const y = parseInt(div.style.top);
    let el = window.logicElements.find(el => el.x === x && el.y === y && el.type === 'output-light');
    if (!el || !el.pins || el.pins.length === 0) return;
    let inputPin = el.pins.find(p => p.dir === 'in');
    let state = false;
    if (inputPin && inputPin.incommingPinID) {
      // Get the state from the connected output pin
      const fromPin = window.logicPins.find(p => p.id === inputPin.incommingPinID);
      state = fromPin ? !!fromPin.state : false;
      inputPin.state = state;
    }
    // Add or update label
    let label = div.querySelector('.output-label');
    if (!window.simulationMode) {
      // Hide label and reset background in edit mode
      if (label) label.style.display = 'none';
      div.style.background = 'lightyellow';
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
// --- Logic evaluation for gates ---
function evaluateLogicGates() {
  // Helper to get pin state by pin id
  function getPinState(pinId) {
    const pin = window.logicPins.find(p => p.id === pinId);
    return pin ? !!pin.state : false;
  }
  for (const el of window.logicElements) {
    if (!el.pins || el.pins.length === 0) continue;
    // Find input and output pins
    const inputPins = el.pins.filter(p => p.dir === 'in');
    const outputPins = el.pins.filter(p => p.dir === 'out');
    let result = false;
    switch (el.type) {
      case 'logic-and':
        result = inputPins.length === 2 && getPinState(inputPins[0].incommingPinID) && getPinState(inputPins[1].incommingPinID);
        break;
      case 'logic-or':
        result = inputPins.length === 2 && (getPinState(inputPins[0].incommingPinID) || getPinState(inputPins[1].incommingPinID));
        break;
      case 'logic-nand':
        result = inputPins.length === 2 && !(getPinState(inputPins[0].incommingPinID) && getPinState(inputPins[1].incommingPinID));
        break;
      case 'logic-xor':
        result = inputPins.length === 2 && (getPinState(inputPins[0].incommingPinID) !== getPinState(inputPins[1].incommingPinID));
        break;
      case 'logic-not':
        result = inputPins.length === 1 && !getPinState(inputPins[0].incommingPinID);
        break;
      case 'input-switch':
        // Already handled by user toggle
        continue;
      default:
        continue;
    }
    // Set output pin state
    if (outputPins.length > 0) {
      outputPins[0].state = result;
    }
  }
}
// --- Restore: Only handle input switch toggling in simulation mode, do not block grid click for placement ---
window.addEventListener('DOMContentLoaded', function() {
  document.getElementById('grid-container').addEventListener('click', function(e) {
    if (!window.simulationMode) return;
    let target = e.target;
    while (target && !(target.classList && target.classList.contains('input-1') && target.classList.contains('floating'))) {
      target = target.parentElement;
    }
    if (!target) return;
    let current = target.dataset.state === 'true';
    target.dataset.state = (!current).toString();
    let label = target.querySelector('.switch-label');
    if (label) {
      label.textContent = (!current) ? 'ON' : 'OFF';
      label.style.color = (!current) ? '#28a745' : '#dc3545';
    }
    // Update the corresponding pin state
    const x = parseInt(target.style.left);
    const y = parseInt(target.style.top);
    let el = window.logicElements.find(el => el.x === x && el.y === y && el.type === 'input-switch');
    if (el && el.pins && el.pins.length > 0) {
      let pin = el.pins.find(p => p.dir === 'out');
      if (pin) {
        pin.state = !current;
      }
    }
    evaluateLogicGates();
    updateOutputLights();
    renderWires();
    renderWires();
  });
});
// Simulation mode state
window.simulationMode = false;
const selectedPinLabel = document.getElementById("selected-pin");

function updateSimButton() {
  const btn = document.getElementById("start-sim-btn");
  if (window.simulationMode) {
    btn.textContent = "Stop Simulation";
    btn.style.background = "#dc3545";
    btn.style.color = "white";
    // Immediately update wires and output lights for simulation
    renderWires();
    updateOutputLights();
  } else {
    btn.textContent = "Start Simulation";
    btn.style.background = "#28a745";
    btn.style.color = "white";
    // Reset wires to black and output lights to default
    renderWires();
    document.querySelectorAll('.floating.output-1').forEach(div => {
      // Remove label
      let label = div.querySelector('.output-label');
      if (label) label.style.display = 'none';
      // Reset background
      div.style.background = 'lightyellow';
    });
  }
}

document.getElementById("start-sim-btn").addEventListener("click", function() {
  window.simulationMode = !window.simulationMode;
  updateSimButton();
  // Update all input switches to show ON/OFF label and enable/disable toggling
  document.querySelectorAll('.floating.input-1').forEach(div => {
    if (window.simulationMode) {
      let label = div.querySelector('.switch-label');
      if (!label) {
        label = document.createElement('div');
        label.className = 'switch-label';
        label.style.fontSize = '1rem';
        label.style.textAlign = 'center';
        div.appendChild(label);
      }
      label.textContent = div.dataset.state === 'true' ? 'ON' : 'OFF';
      label.style.color = div.dataset.state === 'true' ? '#28a745' : '#dc3545';
      div.style.cursor = 'pointer';
    } else {
      let label = div.querySelector('.switch-label');
      if (label) label.remove();
      div.style.cursor = '';
    }
  });
});

// Use event delegation on grid-container for toggling input switches
document.getElementById('grid-container').addEventListener('click', function(e) {
  if (!window.simulationMode) return;
  if (e.target.classList.contains('input-1') && e.target.classList.contains('floating')) {
    let current = e.target.dataset.state === 'true';
    e.target.dataset.state = (!current).toString();
    let label = e.target.querySelector('.switch-label');
    if (label) {
      label.textContent = (!current) ? 'ON' : 'OFF';
      label.style.color = (!current) ? '#28a745' : '#dc3545';
    }
    const x = parseInt(e.target.style.left);
    const y = parseInt(e.target.style.top);
    let pin = window.logicPins.find(p => p.x === x+50 && p.y === y+25 && p.dir === 'out');
    if (pin) pin.state = !current;
  }
});

let removeSelected = () => {

  window.selectedComponentType = null;
      document
      .querySelectorAll(".component-button.selected")
      .forEach(b => b.classList.remove("selected"));
}

document.querySelectorAll(".component-button").forEach(btn => {
  btn.addEventListener("click", () => {
    if (window.simulationMode) {
      console.log('[DEBUG] Menu selection disabled in simulation mode');
      return;
    }
    removeSelected();
    btn.classList.add("selected");
    window.selectedComponentType = btn.dataset.type;
    // Remove any existing floatingDiv
    if (window.floatingDiv && window.floatingDiv.parentNode) {
      window.floatingDiv.parentNode.removeChild(window.floatingDiv);
    }
    window.floatingDiv = document.createElement("div");
    window.floatingDiv.className = "floating";
    window.floatingDiv.style.zIndex = 1000;
    switch(window.selectedComponentType){
      case "input-switch":
        window.floatingDiv.innerText = "⏻";
        window.floatingDiv.classList.add("input-1");
        break;
      case "output-light":
        window.floatingDiv.innerText = "💡";
        window.floatingDiv.classList.add("output-1");
        break;
      case "logic-and":
        window.floatingDiv.innerText = "&";
        window.floatingDiv.classList.add("logic");
        break;
      case "logic-or":
        window.floatingDiv.innerText = "∥";
        window.floatingDiv.classList.add("logic");
        break;
      case "logic-xor":
        window.floatingDiv.innerText = "⊻";
        window.floatingDiv.classList.add("logic");
        break;
      case "logic-nand":
        window.floatingDiv.innerText = "⊼";
        window.floatingDiv.classList.add("logic");
        break;
      default:
    }
    document.getElementById("grid-container").appendChild(window.floatingDiv);
  });
});

function preparePins(type,x,y){
  let newPins = [];
  const nextId = window.logicPins.length+1;
    switch(type){
      case "input-switch":
        newPins = [{"id":nextId,"x":x+50,"y":y+25,"dir":"out","state":false}]
        break;
      case "output-light":
        newPins = [{"id":nextId,"x":x,"y":y+25,"dir":"in","incommingPinID":0}]
        break;
      case "logic-and":
      case "logic-or":
      case "logic-xor":
      case "logic-nand":
        newPins = [
          {"id":nextId,"x":x,"y":y+25,"dir":"in","incommingPinID":0},
          {"id":nextId+1,"x":x,"y":y+75,"dir":"in","incommingPinID":0},
          {"id":nextId+2,"x":x+50,"y":y+50,"dir":"out","state":false}
        ];
        break;
      case "logic-not":
        newPins = [
          {"id":nextId,"x":x,"y":y+50,"dir":"in","incommingPinID":0},
          {"id":nextId+1,"x":x+50,"y":y+50,"dir":"out","state":false}
        ];
        break;
      default:
        // fallback for unknown types
        newPins = [];
        break;
    }
  window.logicPins.push(...newPins);
  return newPins;
}


// Allow placement by clicking anywhere in grid-container (not just SVG)
document.getElementById('grid-container').addEventListener('click', function(e) {
  if(window.simulationMode) return; // Prevent adding or wiring in simulation mode
  // 1. Place component if selected
  if(window.selectedComponentType && (!e.target.classList.contains('floating') || e.target === window.floatingDiv)) {
    const newId = window.logicElements.length+1;
    const type = window.selectedComponentType;
    const x = window.mouseGridX;
    const y = window.mouseGridY;
    const pins = preparePins(type, x, y);
    window.logicElements.push({
      "id": newId,
      "type": type,
      "x": x,
      "y": y,
      "pins": pins
    });

    // Render a static div for the placed element
    const elDiv = document.createElement("div");
    elDiv.className = "floating";
    elDiv.style.left = x + "px";
    elDiv.style.top = y + "px";
    elDiv.style.zIndex = 10;
    switch(type){
      case "input-switch":
        elDiv.innerText = "⏻";
        elDiv.classList.add("input-1");
        elDiv.dataset.state = "false";
        break;
      case "output-light":
        elDiv.innerText = "💡";
        elDiv.classList.add("output-1");
        break;
      case "logic-and":
        elDiv.innerText = "&";
        elDiv.classList.add("logic");
        break;
      case "logic-or":
        elDiv.innerText = "∥";
        elDiv.classList.add("logic");
        break;
      case "logic-xor":
        elDiv.innerText = "⊻";
        elDiv.classList.add("logic");
        break;
      case "logic-nand":
        elDiv.innerText = "⊼";
        elDiv.classList.add("logic");
        break;
      default:
    }
    document.getElementById("grid-container").appendChild(elDiv);
    // Remove floating preview after placement
    if (window.floatingDiv && window.floatingDiv.parentNode) {
      window.floatingDiv.parentNode.removeChild(window.floatingDiv);
    }
    window.floatingDiv = null;
    removeSelected();
    return;
  }
  // 2. Wire connection logic (if not placing component)
  // Only allow wiring if a pin is hovered or selected
  if(window.hoveredPinID){
    if(window.selectedPinID===window.hoveredPinID){
      window.selectedPinID = null;
      selectedPinLabel.textContent = "pin: none"
      window.floatingDiv = null;
      if (typeof removeTempWireLine === "function") removeTempWireLine();
      removeSelected();
      return;
    }
    if(window.selectedPinID){
      // connect wires
      const pinA = window.logicPins.find(p => p.id === window.selectedPinID);
      const pinB = window.logicPins.find(p => p.id === window.hoveredPinID);
      window.wires.push({
        from: pinA.id,
        to: pinB.id
      });
      // Immediately render wires as black in edit mode
      if (!window.simulationMode) renderWires();

      if(pinA && pinB && pinA.dir !== pinB.dir){
        if(pinB.dir === "in"){
          pinB.incommingPinID = pinA.id;
        }else{
          pinA.incommingPinID = pinB.id;
        }
      }
      evaluateLogicGates();
      updateOutputLights();
      if (window.simulationMode) renderWires();
      window.selectedPinID = null;
      selectedPinLabel.textContent = "pin: none"
      window.floatingDiv = null;
      if (typeof removeTempWireLine === "function") removeTempWireLine();
      removeSelected();
      return;
    }
    window.selectedPinID = window.hoveredPinID;
    selectedPinLabel.textContent = "pin: "+ window.selectedPinID;
    // temp wire will be shown by mousemove handler
  }else{
    window.selectedPinID = null;
    selectedPinLabel.textContent = "pin: none"
    if (typeof removeTempWireLine === "function") removeTempWireLine();
  }
});