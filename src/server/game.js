const Constants = require('../shared/constants');
const Player = require('./player');
const Board = require('./Board');
const Tile = require('./Tile');
const TileData = require('./TileData');
// const applyCollisions = require('./collisions');
const fs = require('fs');
const path = require('path');
const lineReader = require('line-reader');
const alphabet = "abcdefghijklmnopqrstuvwxyz";

class Game {
  constructor() {
    this.sockets = {};
    this.players = {};
    this.bullets = [];
    this.tiles = [];
    this.hotBoardSpaces = [];
    this.board = null;
    this.playerTurnIndex = 0;
    this.initGame();

    this.lastUpdateTime = Date.now();
    this.bGameStarted = false;
    this.shouldSendUpdate = false;

    setInterval(this.update.bind(this), 1000 / 60);

  }

  addPlayer(socket, username) {
    this.sockets[socket.id] = socket;
    this.players[socket.id] = new Player(socket.id, username);
    console.log('added player with name: ' + username);
  }

  removePlayer(socket) {
    console.log("removing player");
    delete this.sockets[socket.id];
    delete this.players[socket.id];
  }

  handleCanvas(socket,spaces)
  {
    //console.log(this.players[socket.id].selectedObjects);
    for (let row = 0; row < 19; row++)
    {
      this.players[socket.id].boardSpaces[row] = []
      for (let col = 0; col < 19; col++)
      {
        this.players[socket.id].boardSpaces[row][col] = spaces[0][row][col];
        if (spaces[0][row][col].bSelected)
        {
          if (this.ObjectAlreadySelected(this.players[socket.id],true) == false)
          {
            console.log("adding boardSpace to selected objects")
            this.players[socket.id].selectedObjects.push({boardSpace: this.players[socket.id].boardSpaces[row][col], rowcol: [row,col]});
          }
        }
      }
    }
    for (let i = 0; i < Constants.TILES_PER_PLAYER;i++)
    {
      this.players[socket.id].tileRackSpaces[i] = spaces[1][i];
      if (spaces[1][i].bSelected)
      {
        if (this.ObjectAlreadySelected(this.players[socket.id],false,i) == false)
        {
          // console.log("adding tile to selected objects")
          this.players[socket.id].selectedObjects.push({tileRackSpace:this.players[socket.id].tileRackSpaces[i],rowcol:[i]});
        }


      }
    }

  }

  ObjectAlreadySelected(player,bBoardSpace,index = -1)
  {
    if (bBoardSpace)
    {
      let bFoundBoardSpace = false;
      for (let i = 0; i < player.selectedObjects.length;i++)
      {

          if ("boardSpace" in player.selectedObjects[i])
          {
            bFoundBoardSpace = true;
          }

      }
      return bFoundBoardSpace;
    }
    else
    {
      let bFoundTileRackSpace = false;


      for (let i = 0; i < player.selectedObjects.length;i++)
      {
          if ("tileRackSpace" in player.selectedObjects[i] && player.selectedObjects[i].rowcol == index)
          {
            bFoundTileRackSpace = true;
          }

      }



      return bFoundTileRackSpace;

    }


  }


  confirmMove(socket)
  {
    var player = this.players[socket.id];
    if (player.selectedObjects.length == 2)
    {
      if ('tileRackSpace' in player.selectedObjects[0])
      {
        if ('boardSpace' in player.selectedObjects[1])
        {
          let tile = player.tiles[player.selectedObjects[0].rowcol[0]];
          //console.log("Tile chosen: " + tile.letter);
          let boardSpace = this.board.boardSpaces[player.selectedObjects[1].rowcol[0]][player.selectedObjects[1].rowcol[1]];
          if (boardSpace.tile)
          {
            player.tileRackSpaces[player.selectedObjects[0].rowcol[0]].bSelected = false;
            player.boardSpaces[player.selectedObjects[1].rowcol[0]][player.selectedObjects[1].rowcol[1]].bSelected = false;
            player.selectedObjects = [];
            console.log("can't put there");
            return;
          }
          //console.log("BoardSpace chosen: " + boardSpace);
          boardSpace.assignTile(tile)
          this.hotBoardSpaces.push(boardSpace);
          player.tiles.splice(player.selectedObjects[0].rowcol[0],1);
          player.tileRackSpaces[player.selectedObjects[0].rowcol[0]].bSelected = false;
          player.boardSpaces[player.selectedObjects[1].rowcol[0]][player.selectedObjects[1].rowcol[1]].bSelected = false;
          player.selectedObjects = [];
          console.log("Played tile");
        }
      }
    }
  }

  endTurn(socket)
  {
    var player = this.players[socket.id];
    //look for words
    this.CheckWords();
  }

  CheckWords()
  {
    //horizontal pass
    let firstLetterIndex = -1;
    let lastLetterIndex = 19;
    let words = []
    let currentWord = [];
    for (let row = 0; row < 19; row++)
    {
      for (let col = 0; col < 19; col++)
      {
        if (this.board.boardSpaces[row][col].tile)
        {
          if (currentWord.length == 0)
          {
            firstLetterIndex = col;
          }
          currentWord.push(this.board.boardSpaces[row][col].tile.letter);


        }
        else
        {
          if (currentWord.length > 0)
          {
            lastLetterIndex = col-1;
            words.push(currentWord.join(''));
            currentWord = [];

          }
        }
      }
    }

    let foundIllegalWord = false;
    console.log("Words: " + words);
    for (let i = 0; i < words.length;i++)
    {

      if (!this.lookUpWord(words[i]))
      {

        foundIllegalWord = true;
        break;
      }
    }
    if (foundIllegalWord)
    {
      console.log("Found illegal word");
    }
    else
    {
      console.log("all words are legal");
    }
  }

  lookUpWord(word)
  {
    let firstLetterWordIndex = word[0];
    let firstLetterAlphabetIndex = alphabet.indexOf(firstLetterWordIndex);
    let filePath = '../DictionaryData/' + word[0];
    if (word.length > 1)
    {
      filePath = path.join(__dirname, 'DictionaryData', word[0], word[1] + '.txt');

    }
    else
    {
      filePath = path.join(__dirname, 'DictionaryData', word[0], word[0] + '.txt');
       //'../DictionaryData/' + word[0] + '/' + word[0] + '.txt';
    }
    var bFoundWord = false;
    //var jsonPath = path.join(__dirname, '..', 'DictionaryData', 'dev', 'foobar.json');
    //var dataString = fs.readFileSync(filePath, 'utf8');
    const data = fs.readFileSync(filePath, 'utf8');

    if (data.includes(word))
    {
      bFoundWord = true;
    }


    return bFoundWord;



  }

  handleInput(socket, coord) {
    if (this.players[socket.id])
    {
      //console.log("handled inpu");
      this.players[socket.id].setClickPosition(coord[0],coord[1]);
    }
  }

  switchTiles(player)
  {
    if ('tileRackSpace' in player.selectedObjects[0] && 'tileRackSpace' in player.selectedObjects[1])
    {
      let tile1 = player.tiles[player.selectedObjects[0].rowcol[0]];
      let tile1Index = player.selectedObjects[0].rowcol[0];
      let tile2 = player.tiles[player.selectedObjects[1].rowcol[0]];
      let tile2Index = player.selectedObjects[1].rowcol[0];
      player.tiles[tile1Index] = tile2;
      player.tiles[tile2Index] = tile1;
      player.tileRackSpaces[tile1Index].bSelected = false;
      player.tileRackSpaces[tile2Index].bSelected = false;
      player.selectedObjects = [];
      console.log("switched tiles");

    }
  }

  initGame()
  {
    this.board = new Board();
    //create all tiles
    TileData.forEach(tile => {
      for (let i = 0; i < tile.count; i++)
      {
        this.tiles.push(new Tile(tile.letter,tile.value));
      }
    })
    //this.board.boardSpaces[1][1].assignTile(this.tiles[1]);
  }

  startGame()
  {
    //shuffle tiles;
    let newPos,temp;
    for (let i = this.tiles.length -1; i > 0; i--)
    {
      newPos = Math.floor(Math.random() * (i+1));
      temp = this.tiles[i];
      this.tiles[i] = this.tiles[newPos];
      this.tiles[newPos] = temp;
    }
    //distribute tiles
    let startingIndex = 0;
    Object.keys(this.sockets).forEach(playerID => {
      const socket = this.sockets[playerID];
      const player = this.players[playerID];
      for (let j = 0 + startingIndex; j - startingIndex < Constants.TILES_PER_PLAYER && j < this.tiles.length; j++)
      {
        player.tiles.push(new Tile(this.tiles[j].letter,this.tiles[j].value));
      }
      startingIndex += Constants.TILES_PER_PLAYER;

    });
    this.players[Object.keys(this.sockets)[0]].bMyTurn = true;


  }

  update() {
    // Calculate time elapsed
    const now = Date.now();
    const dt = (now - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = now;


    // Send a game update to each player every other time
    if (this.shouldSendUpdate) {
      if (Object.keys(this.sockets).length > 1)
      {
        if (!this.bGameStarted)
        {
          this.bGameStarted = true;

          console.log("Starting game!");
          this.startGame();
        }

      }
      else
      {
        if (this.bGameStarted)
        {
          this.bGameStarted = false;
          console.log("Game ending cuz someone quit");
        }
      }
      const lobbyboard = this.getLobbyboard();
      Object.keys(this.sockets).forEach(playerID => {
        const socket = this.sockets[playerID];
        const player = this.players[playerID];

        if (player.selectedObjects.length == 2)
        {

          this.switchTiles(player);
        }
        socket.emit(Constants.MSG_TYPES.GAME_UPDATE,this.createUpdate(player,lobbyboard));
        player.setClickPosition(-1,-1);
      })
      this.shouldSendUpdate = false;
    } else {
      this.shouldSendUpdate = true;
    }
  }

  getLobbyboard()
  {
    return Object.values(this.players)
      .map(p => ({username: p.username, score: Math.round(p.score) }));
  }

  createUpdate(player, lobbyboard)
  {
    if (this.bGameStarted)
    {
      return {
        t: Date.now(),
        me: player.serializeForUpdate(),
        lobbyboard: lobbyboard,
        board: this.board
      };
    }
    else
    {
      return {
        t: Date.now(),
        me: player.serializeForUpdate(),
        lobbyboard: lobbyboard,
        board: null
      };
    }
  }

  // createUpdate(player, leaderboard) {
  //   const nearbyPlayers = Object.values(this.players).filter(
  //     p => p !== player && p.distanceTo(player) <= Constants.MAP_SIZE / 2,
  //   );
  //   const nearbyBullets = this.bullets.filter(
  //     b => b.distanceTo(player) <= Constants.MAP_SIZE / 2,
  //   );
  //
  //   return {
  //     t: Date.now(),
  //     me: player.serializeForUpdate(),
  //     others: nearbyPlayers.map(p => p.serializeForUpdate()),
  //     bullets: nearbyBullets.map(b => b.serializeForUpdate()),
  //     leaderboard,
  //   };
  //}
}

module.exports = Game;
