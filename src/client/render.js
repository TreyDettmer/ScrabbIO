
const Constants = require('../shared/constants');
import { getCurrentState } from './state';
import { MyRect } from './CanvasObjectLocations';
const GameSpace = require('../server/GameSpace');
import { sendCanvas, confirmMove } from './networking';
import { ToggleActionsDiv } from './index';
const { MAP_SIZE } = Constants;

// Get the canvas graphics context
const canvas = document.getElementById('game-canvas');
const actions_div = document.getElementById('actions-div');
const context = canvas.getContext('2d');
var bInitalizedCanvas = false;
var bRegisteredMyTurn = false;
var bRegisteredNotMyTurn = false;
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
    if (me.bMyTurn)
    {
      if (!bRegisteredMyTurn)
      {
        actions_div.classList.remove("hidden");
        bRegisteredMyTurn = true;
      }
      context.fillStyle = "white";
      context.font = '1.5em serif';
      context.fillText("Your Turn",canvas.width / 6, canvas.height / 6);
    }
    else
    {
      if (!bRegisteredNotMyTurn)
      {
        actions_div.classList.add("hidden");
        bRegisteredNotMyTurn = true;
      }
      context.fillStyle = "white";
      context.font = '1.5em serif';
      context.fillText("Opponent's Turn",canvas.width / 6, canvas.height / 6);
    }
    //render board
    RenderBoard();
    RenderTileRack();
    if (bInitalizedCanvas == false)
    {
      let boardSpaces = []
      //initalize canvas
      for (let row = 0; row < 19; row++)
      {
        boardSpaces[row] = []
        for (let col = 0; col < 19; col++)
        {
          let x = canvas.width / 2 - Constants.BOARD.SIZE/2 + Constants.BOARD.BORDER_WIDTH + ((boardspaceSize)  * col);
          let y = canvas.height / 2 - Constants.BOARD.SIZE/2 + Constants.BOARD.BORDER_WIDTH + ((boardspaceSize) * row);
          let boardSpace = new GameSpace();
          boardSpace.set
          (
            x + Constants.BOARD.BOARD_SPACES.PADDING*boardspaceSize,
            y + Constants.BOARD.BOARD_SPACES.PADDING*boardspaceSize,
            boardspaceSize - 2*Constants.BOARD.BOARD_SPACES.PADDING*boardspaceSize,
            boardspaceSize - 2*Constants.BOARD.BOARD_SPACES.PADDING*boardspaceSize
          );
          boardSpaces[row][col] = boardSpace;

        }
      }

      let tileRackSpaces = [];
      let tileRackSpaceSize = Constants.BOARD.SIZE*Constants.RACK_WIDTH / Constants.TILES_PER_PLAYER;
      let x = canvas.width / 2 - Constants.BOARD.SIZE*Constants.RACK_WIDTH/2 + Constants.BOARD.BORDER_WIDTH;
      let y = canvas.height / 2 + Constants.BOARD.SIZE/2 + Constants.BOARD.BORDER_WIDTH + 2;
      for (let i = 0; i < Constants.TILES_PER_PLAYER; i++)
      {

        let xPos = x + tileRackSpaceSize * i;
        let boardSpace = new GameSpace();
        boardSpace.set
        (
            .1*tileRackSpaceSize + xPos,
            .1*tileRackSpaceSize + y,
            tileRackSpaceSize - .2*tileRackSpaceSize,
            tileRackSpaceSize - .2*tileRackSpaceSize
        );
        tileRackSpaces[i] = boardSpace;
      }
      let spaces = [];
      spaces[0] = boardSpaces;
      spaces[1] = tileRackSpaces;
      
      sendCanvas(spaces);
      bInitalizedCanvas = true;

    }
    else
    {

      RenderBoardSpaces(me,board);
      RenderTileRackTiles(me);
      if (me.clickPosition[0] != -1)
      {
        if (me.bMyTurn)
          if (CheckForObjectClick(me))
          {
            let spaces = [];
            spaces[0] = me.boardSpaces;
            spaces[1] = me.tileRackSpaces;
            sendCanvas(spaces);
          }
        //console.log("clicked at: " + me.clickPosition);
      }
      me.clickPosition = [-1,-1];


    }
  }



}

function RenderBoard()
{
  context.fillStyle = Constants.BOARD.COLOR;
  context.fillRect(canvas.width / 2 - Constants.BOARD.SIZE/2, canvas.height / 2 - Constants.BOARD.SIZE/2,Constants.BOARD.SIZE,Constants.BOARD.SIZE);
}

function RenderTileRack()
{
  context.fillStyle = Constants.BOARD.BOARD_SPACES.COLOR;
  let rackX = canvas.width / 2 - Constants.BOARD.SIZE*Constants.RACK_WIDTH/2 + Constants.BOARD.BORDER_WIDTH;
  let rackY = canvas.height / 2 + Constants.BOARD.SIZE/2 + Constants.BOARD.BORDER_WIDTH + 2;
  context.fillRect(rackX,rackY,Constants.BOARD.SIZE*Constants.RACK_WIDTH,Constants.BOARD.SIZE*.08);
}

function RenderBoardTile(boardSpaceCanvas,boardSpaceObject)
{
  //draw tile background
  context.fillStyle = Constants.TILES.COLOR;
  context.fillRect
  (
    (Constants.BOARD.BOARD_SPACES.PADDING + Constants.TILES.PADDING)*boardspaceSize + boardSpaceCanvas.xPosition,
    (Constants.BOARD.BOARD_SPACES.PADDING + Constants.TILES.PADDING)*boardspaceSize + boardSpaceCanvas.yPosition,
    boardspaceSize - 2*(Constants.BOARD.BOARD_SPACES.PADDING + Constants.TILES.PADDING)*boardspaceSize,
    boardspaceSize - 2*(Constants.BOARD.BOARD_SPACES.PADDING + Constants.TILES.PADDING)*boardspaceSize
  );
  //draw tile letter
  context.fillStyle = "black";
  context.font = '1.5em serif';
  context.fillText(boardSpaceObject.tile.letter.toUpperCase(),
    boardSpaceCanvas.xPosition + boardspaceSize*.18,
    boardSpaceCanvas.yPosition + boardspaceSize*.65
  );
  //draw tile value
  context.font = '0.6em serif';
  context.fillText(boardSpaceObject.tile.value,
    boardSpaceCanvas.xPosition + boardspaceSize*.7,
    boardSpaceCanvas.yPosition + boardspaceSize*.9
  );
}

function RenderBoardSpaces(me,board)
{
  if (me.boardSpaces.length > 0)
  {
    context.fillStyle = Constants.BOARD.BOARD_SPACES.COLOR;
    for (let row = 0; row < me.boardSpaces.length; row++)
    {
      for (let col = 0; col < me.boardSpaces[0].length; col++)
      {
        context.fillRect
        (
          me.boardSpaces[row][col].xPosition,
          me.boardSpaces[row][col].yPosition,
          me.boardSpaces[row][col].width,
          me.boardSpaces[row][col].height
        );

        if (board.boardSpaces[row][col].bOccupied)
        {
          RenderBoardTile(me.boardSpaces[row][col],board.boardSpaces[row][col]);
          context.fillStyle = Constants.BOARD.BOARD_SPACES.COLOR;
        }
        // if board space is highlighted
        if (me.boardSpaces[row][col].bSelected)
        {
          context.strokeStyle = "white";
          context.strokeRect
          (
            me.boardSpaces[row][col].xPosition,
            me.boardSpaces[row][col].yPosition,
            me.boardSpaces[row][col].width,
            me.boardSpaces[row][col].height
          );
        }
      }
    }
  }
}

function RenderTileRackTiles(me)
{
  if (me.tileRackSpaces.length > 0)
  {

    for (let i = 0; i < Constants.TILES_PER_PLAYER; i++)
    {
      if (me.tiles.length -1 >= i)
      {
        context.fillStyle = Constants.TILES.COLOR;
        //draw tile background
        context.fillRect
        (
          me.tileRackSpaces[i].xPosition,
          me.tileRackSpaces[i].yPosition,
          me.tileRackSpaces[i].width,
          me.tileRackSpaces[i].height
        );
        //draw tile letter
        context.fillStyle = "black";
        context.font = '1.5em serif';
        context.fillText(me.tiles[i].letter.toUpperCase(),
          me.tileRackSpaces[i].xPosition + me.tileRackSpaces[i].width*.18,
          me.tileRackSpaces[i].yPosition + me.tileRackSpaces[i].height*.65
        );
        //draw tile value
        context.font = '0.6em serif';
        context.fillText(me.tiles[i].value,
          me.tileRackSpaces[i].xPosition + me.tileRackSpaces[i].width*.7,
          me.tileRackSpaces[i].yPosition + me.tileRackSpaces[i].height*.9
        );
        // if tile is highlighted
        if (me.tileRackSpaces[i].bSelected)
        {
          context.strokeStyle = "white";
          context.strokeRect
          (
            me.tileRackSpaces[i].xPosition,
            me.tileRackSpaces[i].yPosition,
            me.tileRackSpaces[i].width,
            me.tileRackSpaces[i].height
          );
        }


      }


    }
  }
}


function CheckForObjectClick(me)
{
  let bClickedSomething = false;
  if (BoardContains(me.clickPosition))
  {
    for (let row = 0; row < 19; row++)
    {
      for (let col = 0; col < 19; col++)
      {
        let boardSpace = new GameSpace
        (
          me.boardSpaces[row][col].xPosition,
          me.boardSpaces[row][col].yPosition,
          me.boardSpaces[row][col].width,
          me.boardSpaces[row][col].height,
          me.boardSpaces[row][col].bSelected
        );
        if (boardSpace.contains(me.clickPosition))
        {
          bClickedSomething = true;
          console.log("Clicked on tile at row: " + (row + 1) + " col: " + (col + 1));
          me.boardSpaces[row][col].bSelected = !me.boardSpaces[row][col].bSelected;
        }
      }
    }
  }
  else if (TileRackContains(me.clickPosition))
  {
    for (let i = 0; i < Constants.TILES_PER_PLAYER;i++)
    {
      let tileRackSpace = new GameSpace
      (
        me.tileRackSpaces[i].xPosition,
        me.tileRackSpaces[i].yPosition,
        me.tileRackSpaces[i].width,
        me.tileRackSpaces[i].height,
        me.tileRackSpaces[i].bSelected
      );
      if (tileRackSpace.contains(me.clickPosition))
      {
        bClickedSomething = true;
        console.log("Clicked on rackTileSpace at index " + i);
        me.tileRackSpaces[i].bSelected = !me.tileRackSpaces[i].bSelected;

      }
    }

  }
  return bClickedSomething;
}


function BoardContains(position)
{
  return canvas.width / 2 - Constants.BOARD.SIZE/2 <= position[0] && position[0] <= canvas.width / 2 - Constants.BOARD.SIZE/2 + Constants.BOARD.SIZE &&
         canvas.height / 2 - Constants.BOARD.SIZE/2 <= position[1] && position[1] <= canvas.height / 2 - Constants.BOARD.SIZE/2 + Constants.BOARD.SIZE;
}

function TileRackContains(position)
{
  let rackX = canvas.width / 2 - Constants.BOARD.SIZE*Constants.RACK_WIDTH/2 + Constants.BOARD.BORDER_WIDTH;
  let rackY = canvas.height / 2 + Constants.BOARD.SIZE/2 + Constants.BOARD.BORDER_WIDTH + 2;

  return rackX <= position[0] && position[0] <= rackX + Constants.BOARD.SIZE*Constants.RACK_WIDTH &&
         rackY <= position[1] && position[1] <= rackY + Constants.BOARD.SIZE*.08;
}

function renderBackground() {

  context.fillStyle = 'blue';
  context.fillRect(0, 0, canvas.width, canvas.height);
}



export function ConfirmedAction()
{

  confirmMove();
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
