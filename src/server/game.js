const Constants = require('../shared/constants');
const Player = require('./player');
const Board = require('./Board');
const Tile = require('./Tile');
const TileData = require('./TileData');
// const applyCollisions = require('./collisions');

class Game {
  constructor() {
    this.sockets = {};
    this.players = {};
    this.bullets = [];
    this.tiles = [];
    this.board = null;
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
    for (let row = 0; row < 19; row++)
    {
      this.players[socket.id].boardSpaces[row] = []
      for (let col = 0; col < 19; col++)
      {
        this.players[socket.id].boardSpaces[row][col] = spaces[row][col];
      }
    }
    
  }

  handleInput(socket, coord) {
    if (this.players[socket.id])
    {
      //console.log("handled inpu");
      this.players[socket.id].setClickPosition(coord[0],coord[1]);
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
    this.board.boardspaces[1][1].assignTile(this.tiles[1]);
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
        //console.log(player.clickPosition);
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
