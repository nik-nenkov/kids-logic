// sim.js - Simulation mode logic and helpers

export function isSimulationMode() {
  return window.simulationMode === true;
}

export function setSimulationMode(val) {
  window.simulationMode = !!val;
}

export function updateSimButton() {
  const btn = document.getElementById("start-sim-btn");
  if (!btn) return;
  if (isSimulationMode()) {
    btn.textContent = "Stop Simulation";
    btn.style.background = "#dc3545";
    btn.style.color = "white";
  } else {
    btn.textContent = "Start Simulation";
    btn.style.background = "#28a745";
    btn.style.color = "white";
  }
}

export function updateInputSwitchLabel(div) {
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
}

export function setInputSwitchState(div, state) {
  div.dataset.state = state ? 'true' : 'false';
  updateInputSwitchLabel(div);
}

export function toggleInputSwitch(div) {
  const current = div.dataset.state === 'true';
  setInputSwitchState(div, !current);
}

export function findInputSwitchLogicElement(x, y) {
  return window.logicElements.find(el => el.x === x && el.y === y && el.type === 'input-switch');
}

export function updateAllInputSwitchLabels() {
  document.querySelectorAll('.floating.input-1').forEach(div => {
    updateInputSwitchLabel(div);
    div.style.cursor = isSimulationMode() ? 'pointer' : '';
  });
}

export function removeAllInputSwitchLabels() {
  document.querySelectorAll('.floating.input-1 .switch-label').forEach(label => label.remove());
  document.querySelectorAll('.floating.input-1').forEach(div => div.style.cursor = '');
}
