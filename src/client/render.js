//this file handles what is rendered to the screen
const Constants = require('../shared/constants');
import { getCurrentState } from './state';
const GameSpace = require('../shared/GameSpace');
import { sendCanvas, confirmMove, SendExchangedTiles, ToggleActionsDiv } from './networking';
import { debounce } from 'throttle-debounce';

const canvas = document.getElementById('game-canvas');
const actions_div = document.getElementById('actions-div');
const tile_div = document.getElementById('blank-tile-div');
const exchange_div = document.getElementById('exchange-tiles-div');
const exchange_input = document.getElementById('exchange-tiles-input');
const lobbyWaitDiv = document.getElementById('lobby-wait-div');
const fullLobbyDiv = document.getElementById('full-lobby-div');
const context = canvas.getContext('2d');
var bInitalizedCanvas = false;
var bRegisteredMyTurn = false;
var bRegisteredNotMyTurn = false;
var bCheckedForBlank = false;
var bInGame = false;
var boardspaceSize = (Constants.BOARD.SIZE - Constants.BOARD.BORDER_WIDTH) / Constants.BOARD_TILES;
setCanvasDimensions();
var myScore = 0;
var blankTileLetter = " ";

function setCanvasDimensions() {
  // On small screens (e.g. phones), we want to "zoom out" so players can still see at least
  // 800 in-game units of width.
  const scaleRatio = Math.max(1, 800 / window.innerWidth);
  canvas.width = scaleRatio * window.innerWidth;
  canvas.height = scaleRatio * window.innerHeight;
  bInitalizedCanvas = false;
}

window.addEventListener('resize', debounce(40, setCanvasDimensions));


export function setBlankTileLetter(letter)
{
  if( letter.toUpperCase() != letter.toLowerCase() )
  {
    blankTileLetter = letter;
  }
}

export function exchangeTiles(letters)
{

  SendExchangedTiles(letters);


}

function render() {
  const {t,me,lobbyboard,board} = getCurrentState();
  if (!me)
  {
    return;
  }
  else
  {
    if (!bInGame)
    {
      fullLobbyDiv.classList.add("hidden");
      bInGame = true;
    }
  }

  // Draw background
  renderBackground();
  if (board)
  {
    if (!lobbyWaitDiv.classList.contains('hidden'))
    {
      lobbyWaitDiv.classList.add('hidden');
    }
    if (me.bMyTurn)
    {
      if (!bRegisteredMyTurn)
      {
        actions_div.classList.remove("hidden");
        exchange_input.value = "";
        exchange_div.classList.remove("hidden");
        bRegisteredMyTurn = true;
        bRegisteredNotMyTurn = false;
        for (let i = 0; i < me.tiles.length;i++)
        {
          if (me.tiles[i].bWasBlank)
          {
            tile_div.classList.remove("hidden");
          }
        }
      }

    }
    else
    {
      if (!bRegisteredNotMyTurn)
      {
        actions_div.classList.add("hidden");
        tile_div.classList.add("hidden");
        exchange_div.classList.add("hidden");

        bRegisteredMyTurn = false;
        bRegisteredNotMyTurn = true;
      }

    }
    //render board
    RenderBoard();
    //render tile rack
    RenderTileRack();
    if (bInitalizedCanvas == false)
    {
      //send client's canvas information to the server

      let boardSpaces = []
      for (let row = 0; row < Constants.BOARD_TILES; row++)
      {
        boardSpaces[row] = []
        for (let col = 0; col < Constants.BOARD_TILES; col++)
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
      spaces[2] = blankTileLetter;
      sendCanvas(spaces);
      bInitalizedCanvas = true;

    }
    else
    {
      RenderBoardSpaces(me,board);
      RenderTileRackTiles(me);
      if (me.clickPosition[0] != -1)
      {

        if (CheckForObjectClick(me)) // check if a game object was clicked
        {
          let spaces = [];
          spaces[0] = me.boardSpaces;
          spaces[1] = me.tileRackSpaces
          spaces[2] = blankTileLetter;
          sendCanvas(spaces);
        }
      }
      me.clickPosition = [-1,-1];


    }
  }
  else
  {
    if (lobbyWaitDiv.classList.contains('hidden'))
    {
      lobbyWaitDiv.classList.remove('hidden');
    }
    actions_div.classList.add("hidden");
    tile_div.classList.add("hidden");
    exchange_div.classList.add("hidden");
    bInitalizedCanvas = false;
    bRegisteredMyTurn = false;
    bRegisteredNotMyTurn = false;
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

        if (Constants.BOARD_LAYOUT[row][col] == 1)
        {
          context.fillStyle = Constants.BOARD.BOARD_SPACES.TRIPLE_WORD_COLOR;
        }
        else if (Constants.BOARD_LAYOUT[row][col] == 2)
        {
          context.fillStyle = Constants.BOARD.BOARD_SPACES.DOUBLE_LETTER_COLOR;
        }
        else if (Constants.BOARD_LAYOUT[row][col] == 3)
        {
          context.fillStyle = Constants.BOARD.BOARD_SPACES.TRIPLE_LETTER_COLOR;
        }
        else if (Constants.BOARD_LAYOUT[row][col] == 4)
        {
          context.fillStyle = Constants.BOARD.BOARD_SPACES.DOUBLE_WORD_COLOR;
        }
        context.fillRect
        (
          me.boardSpaces[row][col].xPosition,
          me.boardSpaces[row][col].yPosition,
          me.boardSpaces[row][col].width,
          me.boardSpaces[row][col].height
        );
        context.fillStyle = Constants.BOARD.BOARD_SPACES.COLOR;


        if (board.boardSpaces[row][col].bOccupied)
        {
          RenderBoardTile(me.boardSpaces[row][col],board.boardSpaces[row][col]);
          context.fillStyle = Constants.BOARD.BOARD_SPACES.COLOR;
        }
        // if board space is highlighted
        if (me.boardSpaces[row][col].bSelected)
        {
          context.strokeStyle = "black";
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
          context.strokeStyle = "black";
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
    if (me.bMyTurn)
    {
      for (let row = 0; row < Constants.BOARD_TILES; row++)
      {
        for (let col = 0; col < Constants.BOARD_TILES; col++)
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
            me.boardSpaces[row][col].bSelected = true;
          }
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
        me.tileRackSpaces[i].bSelected = true;

      }
    }

  }
  return bClickedSomething;
}


function BoardContains(position) // check if board contains the given (x,y) position
{
  return canvas.width / 2 - Constants.BOARD.SIZE/2 <= position[0] && position[0] <= canvas.width / 2 - Constants.BOARD.SIZE/2 + Constants.BOARD.SIZE &&
         canvas.height / 2 - Constants.BOARD.SIZE/2 <= position[1] && position[1] <= canvas.height / 2 - Constants.BOARD.SIZE/2 + Constants.BOARD.SIZE;
}

function TileRackContains(position) // check if tile rack contains the given (x,y) position
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
  confirmMove(blankTileLetter);
}



export function startRendering() {
  var renderInterval = setInterval(render, 1000 / 60);
}
