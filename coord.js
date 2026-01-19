window.selectedComponentType = null;
window.floatingDiv = null;
window.box = document.getElementById("grid");
window.logicElements = [];
window.mouseGridX = 0;
window.mouseGridY = 0;
window.logicPins = [{"id":0,"x":0,"y":0,"dir":"out","state":false}];
window.wires = [];
window.hoveredPinID=null;
window.selectedPinID=null;

const cursorDot = document.getElementById("cursor-dot");

function showCursorDot(e,rect){
    let found = false;
    const mouseX=Math.round(e.clientX - rect.left);
    const mouseY=Math.round(e.clientY - rect.top);


    // console.log("mouse X:"+mouseX);
    // console.log("mouse Y:"+mouseY);

    // loop through all elements and their pins
    for (const el of window.logicElements) {
        for (const pin of el.pins) {
            const dx = mouseX - pin.x;
            const dy = mouseY - pin.y;
            const dist = Math.sqrt(dx*dx + dy*dy);

            if (dist <= 10) {  // 10px radius
                found = true;
                window.hoveredPinID = pin.id;
                break;
            }
        }
        if (found) break;
    }

    if (found) {
        cursorDot.style.left = mouseX + "px";
        cursorDot.style.top = mouseY + "px";
        cursorDot.style.display = "block";
    } else {
        cursorDot.style.display = "none";
        window.hoveredPinID = null;
    }
}

function drawLine(x1, y1, x2, y2, color="green", width=3) {
  // Draw a temporary SVG line for wire preview
  const svg = document.getElementById("grid");
  let tempLine = document.getElementById("temp-wire-line");
  if (!tempLine) {
    tempLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    tempLine.setAttribute("id", "temp-wire-line");
    svg.appendChild(tempLine);
  }
  // Always black in edit mode, green in simulation mode
  let strokeColor = color;
  if (typeof window !== 'undefined' && window.simulationMode === false) strokeColor = 'black';
  if (typeof window !== 'undefined' && window.simulationMode === true && !color) strokeColor = 'green';
  tempLine.setAttribute("x1", x1);
  tempLine.setAttribute("y1", y1);
  tempLine.setAttribute("x2", x2);
  tempLine.setAttribute("y2", y2);
  tempLine.setAttribute("stroke", strokeColor);
  tempLine.setAttribute("stroke-width", width);
  tempLine.setAttribute("pointer-events", "none");
}

function removeTempWireLine() {
  const tempLine = document.getElementById("temp-wire-line");
  if (tempLine && tempLine.parentNode) {
    tempLine.parentNode.removeChild(tempLine);
  }
}

(function () {
  const data = document.getElementById("coords");
  const selected = document.getElementById("select");

  box.addEventListener("mousemove", function (e) {
    const rect = window.box.getBoundingClientRect();

    window.mouseGridX = -12+Math.floor((e.clientX - rect.left) / 25) * 25;
    window.mouseGridY = -12+Math.floor((e.clientY - rect.top) / 25) * 25;

    data.textContent = "x:" + window.mouseGridX + " y:" + window.mouseGridY;
    selected.textContent = "s:" + window.selectedComponentType;
    if(window.floatingDiv){
      window.floatingDiv.style.left = window.mouseGridX + "px";
      window.floatingDiv.style.top = window.mouseGridY + "px";
    }

    if(window.selectedPinID){
      let pin = window.logicPins.find(p => p.id === window.selectedPinID);
      drawLine(pin.x, pin.y, window.mouseGridX+24, window.mouseGridY+24);
    } else {
      removeTempWireLine();
    }
    showCursorDot(e,rect);
  });
})();
