
const Constants = require('../shared/constants');

const { MAP_SIZE } = Constants;

// Get the canvas graphics context
const canvas = document.getElementById('game-canvas');
const context = canvas.getContext('2d');
setCanvasDimensions();

function setCanvasDimensions() {
  // On small screens (e.g. phones), we want to "zoom out" so players can still see at least
  // 800 in-game units of width.
  const scaleRatio = Math.max(1, 800 / window.innerWidth);
  canvas.width = scaleRatio * window.innerWidth;
  canvas.height = scaleRatio * window.innerHeight;
}

//window.addEventListener('resize', debounce(40, setCanvasDimensions));

function render() {
  // const { me, others, bullets } = getCurrentState();
  // if (!me) {
  //   return;
  // }

  // Draw background
  renderBackground();


}

function renderBackground() {

  context.fillStyle = 'blue';
  context.fillRect(0, 0, canvas.width, canvas.height);
}






//let renderInterval = setInterval(renderMainMenu, 1000 / 60);

// Replaces main menu rendering with game rendering.
export function startRendering() {
  //clearInterval(renderInterval);
  var renderInterval = setInterval(render, 1000 / 60);
}

// // Replaces game rendering with main menu rendering.
// export function stopRendering() {
//   clearInterval(renderInterval);
//   renderInterval = setInterval(renderMainMenu, 1000 / 60);
// }
