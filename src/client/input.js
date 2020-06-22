
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
  //window.addEventListener('mousemove', onMouseInput);
  canvas.addEventListener('click', onMouseInput);
  //window.addEventListener('touchstart', onTouchInput);
  //window.addEventListener('touchmove', onTouchInput);
}

export function stopCapturingInput() {
  //window.removeEventListener('mousemove', onMouseInput);
  canvas.removeEventListener('click', onMouseInput);
  //window.removeEventListener('touchstart', onTouchInput);
  //window.removeEventListener('touchmove', onTouchInput);
}
