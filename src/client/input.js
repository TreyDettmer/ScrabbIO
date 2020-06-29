//this files handles user input 

import { sendInput } from './networking';
const canvas = document.getElementById('game-canvas');

function onMouseInput(e) {
  handleInput(e.clientX, e.clientY);
}

function onTouchInput(e) {
  const touch = e.touches[0];
  handleInput(touch.clientX, touch.clientY);
}


function handleInput(x, y) {
  sendInput(x,y);
}





export function startCapturingInput() {
  canvas.addEventListener('click', onMouseInput);
  canvas.addEventListener('touchstart', onTouchInput);
}

export function stopCapturingInput() {
  canvas.removeEventListener('click', onMouseInput);
  canvas.removeEventListener('touchstart', onTouchInput);
}
