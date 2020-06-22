
const Constants = require('../shared/constants');
import { getCurrentState } from './state';
import { MyRect } from './CanvasObjectLocations';
const BoardSpace = require('../server/BoardSpace');
import { sendCanvas } from './networking';

const { MAP_SIZE } = Constants;

// Get the canvas graphics context
const canvas = document.getElementById('game-canvas');
const context = canvas.getContext('2d');
var bInitalizedCanvas = false;
var boardBackground;
var boardBorder;
var boardSpaces = [];
var rackTiles = [];
var boardTile;
var boardTileLetter;
var boardTileValue;
var rack;
var rackTile;
var bDebug = false;
var boardspaceSize = (Constants.BOARD.SIZE - Constants.BOARD.BORDER_WIDTH) / 19;
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
    //render board
    RenderBoard();
    if (bInitalizedCanvas == false)
    {
      let spaces = []
      //initalize canvas
      for (let row = 0; row < 19; row++)
      {
        spaces[row] = []
        for (let col = 0; col < 19; col++)
        {
          let x = canvas.width / 2 - Constants.BOARD.SIZE/2 + Constants.BOARD.BORDER_WIDTH + ((boardspaceSize)  * col);
          let y = canvas.height / 2 - Constants.BOARD.SIZE/2 + Constants.BOARD.BORDER_WIDTH + ((boardspaceSize) * row);
          var boardSpace = new BoardSpace();
          boardSpace.set(
            x + Constants.BOARD.BOARD_SPACES.PADDING*boardspaceSize,
            y + Constants.BOARD.BOARD_SPACES.PADDING*boardspaceSize,
            boardspaceSize - 2*Constants.BOARD.BOARD_SPACES.PADDING*boardspaceSize,
            boardspaceSize - 2*Constants.BOARD.BOARD_SPACES.PADDING*boardspaceSize
          )
          spaces[row][col] = boardSpace;

        }
      }
      console.log(spaces);
      sendCanvas(spaces);

      bInitalizedCanvas = true;

    }
    else
    {

      if (me.boardSpaces.length > 0)
      {
        context.fillStyle = Constants.BOARD.BOARD_SPACES.COLOR;
        for (let row = 0; row < me.boardSpaces.length; row++)
        {
          for (let col = 0; col < me.boardSpaces[0].length; col++)
          {
            context.fillRect(
              me.boardSpaces[row][col].xPosition,
              me.boardSpaces[row][col].yPosition,
              me.boardSpaces[row][col].width,
              me.boardSpaces[row][col].height);
          }
        }
      }
    }
  }
  // if (board)
  // {
  //   if (!bSetObjectLocations)
  //   {
  //     initializeCanvasObjects(me);
  //     bSetObjectLocations = true;
  //   }
  //   renderCanvas(board,me);
  //   //renderBoard(board);
  //   //renderTileRack(me);
  //
  // }
  // if (me.clickPosition[0] != -1 && me.clickPosition[1] != -1)
  // {
  //   if (bSetObjectLocations)
  //   {
  //     console.log("Clicked at: " + me.clickPosition);
  //     if (boardBackground.contains(me.clickPosition[0],me.clickPosition[1]))
  //     {
  //       for (let i = 0; i < boardSpaces.length; i++)
  //       {
  //         if (boardSpaces[i].contains(me.clickPosition[0],me.clickPosition[1]))
  //         {
  //           console.log("Clicked inside a space at index " + i);
  //         }
  //       }
  //
  //       //console.log("Clicked inside the board");
  //     }
  //     else if (rack.contains(me.clickPosition[0],me.clickPosition[1]))
  //     {
  //       for (let i = 0; i < me.tiles.length; i++)
  //       {
  //         if (rackTiles[i].rect.contains(me.clickPosition[0],me.clickPosition[1]))
  //         {
  //           console.log("Clicked tile ", rackTiles[i].tile);
  //           me.tiles[i].bHighlighted = !me.tiles[i].bHighlighted;
  //         }
  //       }
  //     }
  //   }
  //
  //   //context.fillStyle = "red";
  //
  //   //context.fillRect(me.clickPosition[0],me.clickPosition[1],20,20);
  //
  // }
  // me.clickPosition = [-1,-1];


}

function RenderBoard()
{
  context.fillStyle = Constants.BOARD.COLOR;
  context.fillRect(canvas.width / 2 - Constants.BOARD.SIZE/2, canvas.height / 2 - Constants.BOARD.SIZE/2,Constants.BOARD.SIZE,Constants.BOARD.SIZE);
}

// function initializeCanvasObjects(me)
// {
//   boardBackground = new MyRect(canvas.width / 2 - Constants.BOARD.SIZE/2, canvas.height / 2 - Constants.BOARD.SIZE/2,Constants.BOARD.SIZE,Constants.BOARD.SIZE);
//   boardBorder = new MyRect(canvas.width / 2 - Constants.BOARD.SIZE/2, canvas.height / 2 - Constants.BOARD.SIZE/2,Constants.BOARD.SIZE,Constants.BOARD.SIZE);
//
//   //draw boardSpaces
//
//   for (let row = 0; row < 19; row++)
//   {
//     for (let col = 0; col < 19; col++)
//     {
//       let x = canvas.width / 2 - Constants.BOARD.SIZE/2 + Constants.BOARD.BORDER_WIDTH + ((boardspaceSize)  * col);
//       let y = canvas.height / 2 - Constants.BOARD.SIZE/2 + Constants.BOARD.BORDER_WIDTH + ((boardspaceSize) * row);
//       if (row == 0 && col == 0)
//       {
//         //create boardTile
//         boardTile = new MyRect((Constants.BOARD.BOARD_SPACES.PADDING + Constants.TILES.PADDING)*boardspaceSize,
//         (Constants.BOARD.BOARD_SPACES.PADDING + Constants.TILES.PADDING)*boardspaceSize,
//         boardspaceSize - 2*(Constants.BOARD.BOARD_SPACES.PADDING + Constants.TILES.PADDING)*boardspaceSize,
//         boardspaceSize - 2*(Constants.BOARD.BOARD_SPACES.PADDING + Constants.TILES.PADDING)*boardspaceSize)
//
//         //create rack
//         let rackX = canvas.width / 2 - Constants.BOARD.SIZE*Constants.RACK_WIDTH/2 + Constants.BOARD.BORDER_WIDTH;
//         let rackY = canvas.height / 2 + Constants.BOARD.SIZE/2 + Constants.BOARD.BORDER_WIDTH + 2;
//         rack = new MyRect(rackX,rackY,Constants.BOARD.SIZE*Constants.RACK_WIDTH,Constants.BOARD.SIZE*.08);
//
//         //create rackTile
//         let tileSize = Constants.BOARD.SIZE*Constants.RACK_WIDTH / me.tiles.length;
//         rackTile = new MyRect(.1 * tileSize,.1 * tileSize,tileSize - .2*tileSize, tileSize -.2*tileSize);
//
//       }
//       boardSpaces.push(new MyRect(x + Constants.BOARD.BOARD_SPACES.PADDING*boardspaceSize,y + Constants.BOARD.BOARD_SPACES.PADDING*boardspaceSize,boardspaceSize - 2*Constants.BOARD.BOARD_SPACES.PADDING*boardspaceSize,boardspaceSize - 2*Constants.BOARD.BOARD_SPACES.PADDING*boardspaceSize));
//     }
//   }
// }

// function renderCanvas(board,me)
// {
//   //draw board background
//   context.fillStyle = Constants.BOARD.COLOR;
//   boardBackground.draw(context);
//   //draw board border
//   context.strokeStyle = Constants.BOARD.BORDER_COLOR;
//   context.lineWidth = Constants.BOARD.BORDER_WIDTH;
//   boardBorder.draw(context,true);
//   //draw board spaces
//   context.fillStyle = Constants.BOARD.BOARD_SPACES.COLOR;
//   for (let row = 0; row < 19; row++)
//   {
//     for (let col = 0; col < 19; col++)
//     {
//       let x = canvas.width / 2 - Constants.BOARD.SIZE/2 + Constants.BOARD.BORDER_WIDTH + ((boardspaceSize)  * col);
//       let y = canvas.height / 2 - Constants.BOARD.SIZE/2 + Constants.BOARD.BORDER_WIDTH + ((boardspaceSize) * row);
//       boardSpaces[(row*19)+col].draw(context);
//       if (board.boardspaces[row][col].bOccupied)
//       {
//         //draw tile background
//         context.fillStyle = Constants.TILES.COLOR;
//         boardTile.drawOffset(context,x,y);
//
//         //draw tile letter
//         context.fillStyle = "black";
//         context.font = '1.5em serif';
//         context.fillText(board.boardspaces[row][col].tile.letter.toUpperCase(),
//           x + boardspaceSize*.18,
//           y + boardspaceSize*.65
//         );
//         //draw tile value
//         context.font = '0.6em serif';
//         context.fillText(board.boardspaces[row][col].tile.value,
//           x + boardspaceSize*.7,
//           y + boardspaceSize*.9
//         );
//
//
//         if (board.boardspaces[row][col].tile.bHighlighted)
//         {
//           //draw highlight
//           context.strokeStyle = "white";
//           boardTile.drawOffset(context,x,y,true);
//         }
//         context.fillStyle = Constants.BOARD.BOARD_SPACES.COLOR;
//       }
//     }
//   }
//
//   context.fillStyle = Constants.BOARD.BOARD_SPACES.COLOR;
//   rack.draw(context);
//   if (me.tiles.length > 0)
//   {
//     let tileSize = Constants.BOARD.SIZE*Constants.RACK_WIDTH / me.tiles.length;
//     let x = canvas.width / 2 - Constants.BOARD.SIZE*Constants.RACK_WIDTH/2 + Constants.BOARD.BORDER_WIDTH;
//     let y = canvas.height / 2 + Constants.BOARD.SIZE/2 + Constants.BOARD.BORDER_WIDTH + 2;
//     for (let i = 0; i < me.tiles.length; i++)
//     {
//       context.fillStyle = Constants.TILES.COLOR;
//       let letter = me.tiles[i].letter.toUpperCase();
//       let value = me.tiles[i].value;
//       let xPos = x + tileSize*i;
//       //draw tile background
//       rackTile.drawOffset(context,xPos,y);
//
//       //draw tile letter
//       context.fillStyle = "black";
//       context.font = '1.5em serif';
//       context.fillText(letter,
//         xPos + tileSize*.18,
//         y + tileSize*.65
//       );
//       //draw tile value
//       context.font = '0.6em serif';
//       context.fillText(value,
//         xPos + tileSize*.7,
//         y + tileSize*.9
//       );
//       if (me.tiles[i].bHighlighted)
//       {
//         //draw highlight
//         console.log("highlighted");
//         context.strokeStyle = "white";
//         rackTile.drawOffset(context,xPos,y,true);
//         context.fillStyle = Constants.TILES.COLOR;
//       }
//       rackTiles[i] = {rect: new MyRect(rackTile.x + xPos,rackTile.y + y,rackTile.width,rackTile.height), tile: me.tiles[i]};
//     }
//
//   }
// }



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
