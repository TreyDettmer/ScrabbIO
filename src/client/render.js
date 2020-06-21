
const Constants = require('../shared/constants');
import { getCurrentState } from './state';

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
  const {t,me,lobbyboard,board} = getCurrentState();
  if (!me)
  {
    return;
  }
  // Draw background
  renderBackground();

  if (board)
  {
    renderBoard(board);
    renderTileRack(me);

  }
  if (me.clickPosition[0] != -1 && me.clickPosition[1] != -1)
  {
    console.log("Clicked at: " + me.clickPosition);

  }
  me.clickPosition = [-1,-1];


}

function renderBoard(board)
{
  //draw board background
  context.fillStyle = Constants.BOARD.COLOR;
  context.fillRect(canvas.width / 2 - Constants.BOARD.SIZE/2, canvas.height / 2 - Constants.BOARD.SIZE/2,Constants.BOARD.SIZE,Constants.BOARD.SIZE);
  //draw board border
  context.strokeStyle = Constants.BOARD.BORDER_COLOR;
  context.lineWidth = Constants.BOARD.BORDER_WIDTH;
  context.strokeRect(canvas.width / 2 - Constants.BOARD.SIZE/2, canvas.height / 2 - Constants.BOARD.SIZE/2,Constants.BOARD.SIZE,Constants.BOARD.SIZE);
  //draw board spaces
  var boardspaceSize = (Constants.BOARD.SIZE - Constants.BOARD.BORDER_WIDTH) / 19;
  context.fillStyle = Constants.BOARD.BOARD_SPACES.COLOR;
  for (let row = 0; row < 19; row++)
  {
    for (let col = 0; col < 19; col++)
    {
      let x = canvas.width / 2 - Constants.BOARD.SIZE/2 + Constants.BOARD.BORDER_WIDTH + ((boardspaceSize)  * col);
      let y = canvas.height / 2 - Constants.BOARD.SIZE/2 + Constants.BOARD.BORDER_WIDTH + ((boardspaceSize) * row);
      context.fillRect(x + Constants.BOARD.BOARD_SPACES.PADDING*boardspaceSize,y + Constants.BOARD.BOARD_SPACES.PADDING*boardspaceSize,boardspaceSize - 2*Constants.BOARD.BOARD_SPACES.PADDING*boardspaceSize,boardspaceSize - 2*Constants.BOARD.BOARD_SPACES.PADDING*boardspaceSize);
      //draw tile
      if (board.boardspaces[row][col].bOccupied)
      {
        //draw tile background
        context.fillStyle = Constants.TILES.COLOR;
        context.fillRect(
          x + (Constants.BOARD.BOARD_SPACES.PADDING + Constants.TILES.PADDING)*boardspaceSize,
          y + (Constants.BOARD.BOARD_SPACES.PADDING + Constants.TILES.PADDING)*boardspaceSize,
          boardspaceSize - 2*(Constants.BOARD.BOARD_SPACES.PADDING + Constants.TILES.PADDING)*boardspaceSize,
          boardspaceSize - 2*(Constants.BOARD.BOARD_SPACES.PADDING + Constants.TILES.PADDING)*boardspaceSize
        );
        //draw tile letter
        context.fillStyle = "black";
        context.font = '1.5em serif';
        context.fillText(board.boardspaces[row][col].tile.letter.toUpperCase(),
          x + boardspaceSize*.18,
          y + boardspaceSize*.65
        );
        //draw tile value
        context.font = '0.6em serif';
        context.fillText(board.boardspaces[row][col].tile.value,
          x + boardspaceSize*.7,
          y + boardspaceSize*.9
        );
        context.fillStyle = Constants.BOARD.BOARD_SPACES.COLOR;

      }
    }
  }

}

function renderTileRack(me)
{
  //draw rack
  context.fillStyle = Constants.BOARD.BOARD_SPACES.COLOR;
  let x = canvas.width / 2 - Constants.BOARD.SIZE*Constants.RACK_WIDTH/2 + Constants.BOARD.BORDER_WIDTH;
  let y = canvas.height / 2 + Constants.BOARD.SIZE/2 + Constants.BOARD.BORDER_WIDTH + 2;
  context.fillRect(x,y,Constants.BOARD.SIZE*Constants.RACK_WIDTH,Constants.BOARD.SIZE*.08);
  // draw tiles
  if (me.tiles.length > 0)
  {


    let x = canvas.width / 2 - Constants.BOARD.SIZE*Constants.RACK_WIDTH/2 + Constants.BOARD.BORDER_WIDTH;
    let y = canvas.height / 2 + Constants.BOARD.SIZE/2 + Constants.BOARD.BORDER_WIDTH + 2;
    let tileSize = Constants.BOARD.SIZE*Constants.RACK_WIDTH / me.tiles.length;
    for (let i = 0; i < me.tiles.length; i++)
    {
      context.fillStyle = Constants.TILES.COLOR;
      let letter = me.tiles[i].letter.toUpperCase();
      let value = me.tiles[i].value;
      let xPos = x + tileSize*i;
      //draw tile background
      context.fillRect(xPos + .1 * tileSize,y + .1 * tileSize,tileSize - .2*tileSize, tileSize -.2*tileSize);
      //draw tile letter
      context.fillStyle = "black";
      context.font = '1.5em serif';
      context.fillText(letter,
        xPos + tileSize*.18,
        y + tileSize*.65
      );
      //draw tile value
      context.font = '0.6em serif';
      context.fillText(value,
        xPos + tileSize*.7,
        y + tileSize*.9
      );
    }

  }
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
