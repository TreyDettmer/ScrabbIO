const Constants = require('../shared/constants');
const Player = require('./player');
const Board = require('./Board');
const Tile = require('./Tile');
const TileData = require('./TileData');
// const applyCollisions = require('./collisions');
const fs = require('fs');
const path = require('path');
const lineReader = require('line-reader-sync');
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

class Game {
  constructor() {
    this.sockets = {};
    this.players = {};
    this.bullets = [];
    this.tiles = [];
    this.hotBoardSpaces = [];
    this.hotBoardSpacesLoc = [];
    this.board = null;
    this.playerTurnIndex = 0;
    this.initGame();
    this.wordsPlayed = [];
    this.wordPositionsPlayed = [];
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
    for (let row = 0; row < Constants.BOARD_TILES; row++)
    {
      this.players[socket.id].boardSpaces[row] = []
      for (let col = 0; col < Constants.BOARD_TILES; col++)
      {
        this.players[socket.id].boardSpaces[row][col] = spaces[0][row][col];
        if (spaces[0][row][col].bSelected)
        {
          if (this.ObjectAlreadySelected(this.players[socket.id],true) == false)
          {
            //console.log("adding boardSpace to selected objects")
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
          boardSpace.bOccupied = true;
          this.hotBoardSpaces.push(boardSpace);
          this.hotBoardSpacesLoc.push([player.selectedObjects[1].rowcol[0],player.selectedObjects[1].rowcol[1]]);
          player.tiles.splice(player.selectedObjects[0].rowcol[0],1);
          player.tileRackSpaces[player.selectedObjects[0].rowcol[0]].bSelected = false;
          player.boardSpaces[player.selectedObjects[1].rowcol[0]][player.selectedObjects[1].rowcol[1]].bSelected = false;
          player.selectedObjects = [];
          //console.log("Played tile");
        }
      }
    }
  }

  endTurn(socket)
  {
    var player = this.players[socket.id];
    //check if valid moves were made
    if (this.CheckWords())
    {
      let tilesNeeded = Constants.TILES_PER_PLAYER - player.tiles.length;
      if (this.tiles.length >= tilesNeeded)
      {
        for (let i = 0; i < tilesNeeded;i++)
        {
          player.tiles.push(this.tiles.pop());
        }

      }
      else
      {
        for (let i = 0; i < this.tiles.length;i++)
        {
          player.tiles.push(this.tiles.pop());
        }
      }
      if (this.players[Object.keys(this.sockets)[0]].bMyTurn)
      {
        this.players[Object.keys(this.sockets)[0]].bMyTurn = false;
        this.players[Object.keys(this.sockets)[1]].bMyTurn = true;
        this.playerTurnIndex = 1;
      }
      else
      {
        this.players[Object.keys(this.sockets)[0]].bMyTurn = true;
        this.players[Object.keys(this.sockets)[1]].bMyTurn = false;
        this.playerTurnIndex = 0;
      }

    }
    else
    {
      for (let i = 0; i < this.hotBoardSpaces.length; i++)
      {
        player.tiles.push(this.hotBoardSpaces[i].tile);
        this.hotBoardSpaces[i].bOccupied = false;
        this.hotBoardSpaces[i].tile = null;
      }
    }
    this.hotBoardSpacesLoc = [];
    this.hotBoardSpaces = [];
  }

  FilterFunction(el)
  {
    return !this.wordPositionsPlayed.includes(el);
  }
  CheckWords()
  {
    let bHorizontalWord = false;
    let bVerticalWord = false;
    let bValid = false;
    for (let spaceIndex = 0; spaceIndex < this.hotBoardSpacesLoc.length;spaceIndex++)
    {
      console.log(this.hotBoardSpacesLoc[spaceIndex]);
      if (spaceIndex == 1)
      {
        if (this.hotBoardSpacesLoc[spaceIndex][0] == this.hotBoardSpacesLoc[0][0])
        {
          bHorizontalWord = true;
          bVerticalWord = false;
        }
        if (this.hotBoardSpacesLoc[spaceIndex][1] == this.hotBoardSpacesLoc[0][1])
        {
          bVerticalWord = true;
          bHorizontalWord = false;
        }
      }
      else if (spaceIndex > 1)
      {
        if (this.hotBoardSpacesLoc[spaceIndex][0] != this.hotBoardSpacesLoc[spaceIndex-1][0] && bHorizontalWord)
        {
          console.log("Illegal Move! (multiple words played)");
          return false;
        }
        if (this.hotBoardSpacesLoc[spaceIndex][1] != this.hotBoardSpacesLoc[spaceIndex-1][1] && bVerticalWord)
        {
          console.log("Illegal Move! (multiple words played)");
          return false;
        }
      }
      if (spaceIndex > 0)
      {
        if (Math.abs(this.hotBoardSpaces[spaceIndex][0] - this.hotBoardSpaces[spaceIndex-1][0]) >= 1 && Math.abs(this.hotBoardSpaces[spaceIndex][1] - this.hotBoardSpaces[spaceIndex-1][1]) >= 1)
        {
          console.log("Illegal Move! (multiple words played - not connected even though on same axis)");
          return false;
        }
      }
    }
    //horizontal pass
    let firstLetterIndex = -1;
    let lastLetterIndex = Constants.BOARD_TILES;
    let words = []
    let wordPositions = [];
    let currentWord = [];
    let currentWordLetterPositions = [];
    let validTurn = true;
    for (let row = 0; row < Constants.BOARD_TILES; row++)
    {
      for (let col = 0; col < Constants.BOARD_TILES; col++)
      {
        if (this.board.boardSpaces[row][col].tile)
        {
          if (currentWord.length == 0)
          {
            firstLetterIndex = col;
          }
          currentWord.push(this.board.boardSpaces[row][col].tile.letter);

          currentWordLetterPositions.push([row,col]);


        }
        else
        {
          if (currentWord.length > 0)
          {
            if (currentWord.length == 1)
            {
              lastLetterIndex = col-1;
              currentWord = [];
              currentWordLetterPositions = [];
            }
            else
            {
              lastLetterIndex = col-1;
              words.push(currentWord.join(''));
              wordPositions.push([...currentWordLetterPositions]);
              currentWordLetterPositions = [];
              currentWord = [];
            }

          }
        }
      }
    }

    //vertical pass
    firstLetterIndex = -1;
    lastLetterIndex = Constants.BOARD_TILES;
    currentWord = [];
    currentWordLetterPositions = [];
    for (let col = 0; col < Constants.BOARD_TILES; col++)
    {
      for (let row = 0; row < Constants.BOARD_TILES; row++)
      {
        if (this.board.boardSpaces[row][col].tile)
        {
          if (currentWord.length == 0)
          {
            firstLetterIndex = row;
          }
          currentWord.push(this.board.boardSpaces[row][col].tile.letter);

          currentWordLetterPositions.push([row,col]);


        }
        else
        {
          if (currentWord.length > 0)
          {
            if (currentWord.length == 1)
            {
              lastLetterIndex = row-1;
              currentWord = [];
              currentWordLetterPositions = [];
            }
            else
            {
              lastLetterIndex = row-1;
              words.push(currentWord.join(''));
              wordPositions.push([...currentWordLetterPositions]);
              currentWordLetterPositions = [];
              currentWord = [];
            }

          }
        }
      }
    }

    //check for isolated words (word that isn't attached to another word)
    let foundIsolatedWord = false;
    if (this.wordsPlayed.length > 0)
    {

      for (var wordIndex = 0; wordIndex < words.length; wordIndex++)
      {
        let _word = words[wordIndex];
        let _wordPosition = wordPositions[wordIndex];
        let foundLetterInOtherWord = false;
        //iterate through current words on the board
        for (let letterIndex = 0; letterIndex < _word.length; letterIndex++)
        {
          let letterPosition = _wordPosition[letterIndex];
          for (let otherWordIndex = 0; otherWordIndex < words.length; otherWordIndex++)
          {
            if (otherWordIndex == wordIndex){continue;}
            let otherWord = words[otherWordIndex];
            let otherWordPosition = wordPositions[otherWordIndex];
            for (let otherWordLetterIndex = 0; otherWordLetterIndex < otherWord.length;otherWordLetterIndex++)
            {
              let otherLetterPosition = otherWordPosition[otherWordLetterIndex];
              if (otherLetterPosition[0] == letterPosition[0] && otherLetterPosition[1] == letterPosition[1])
              {
                foundLetterInOtherWord = true;
              }
            }
          }
          //iterate through past words on the board
          // (for instance if we added an 'h' to 'it' to make 'hit', we want to still look at 'it' as another word)
          for (let oldWordIndex = 0; oldWordIndex < this.wordsPlayed.length;oldWordIndex++)
          {
            let oldWord = this.wordsPlayed[oldWordIndex];
            let oldWordPosition = this.wordPositionsPlayed[oldWordIndex];
            let oldWordPositionString = oldWordPosition.join('').replace(/,/g,"");
            let newWordPositionString = _wordPosition.join('').replace(/,/g,"");
            //checks if word is continuation of old word
            if (newWordPositionString.includes(oldWordPositionString))
            {
              foundLetterInOtherWord = true;
            }
            //checks if word is attached to old word
            for (let oldWordLetterIndex = 0; oldWordLetterIndex < oldWord.length;oldWordLetterIndex++)
            {
              let oldLetterPosition = oldWordPosition[oldWordLetterIndex];
              if (oldLetterPosition[0] == letterPosition[0] && oldLetterPosition[1] == letterPosition[1])
              {
                foundLetterInOtherWord = true;
              }
            }
          }

        }




        if (!foundLetterInOtherWord)
        {
          //the word is isolated so it is illegal
          foundIsolatedWord = true;
          console.log(words[wordIndex] + " is isolated");
          break;

        }
      }

    }
    let foundIsolatedLetter = false;
    //check for single isolated tiles
    for (let row = 0; row < Constants.BOARD_TILES;row++)
    {
      let bShouldContinue = true;
      for (let col = 0; col < Constants.BOARD_TILES;col++)
      {
        let boardSpace = this.board.boardSpaces[row][col];
        if (boardSpace.bOccupied)
        {
          let bIsolated = true;
          //check right
          if (col+1 < Constants.BOARD_TILES){
            if (this.board.boardSpaces[row][col+1] != null)
            {
              if (this.board.boardSpaces[row][col+1].bOccupied)
              {
                bIsolated = false;
              }
            }
          }
          //check left
          if (col-1 >= 0)
          {
            if (this.board.boardSpaces[row][col-1] != null)
            {
              if (this.board.boardSpaces[row][col-1].bOccupied)
              {
                bIsolated = false;
              }
            }
          }
          //check below
          if (row+1 < Constants.BOARD_TILES)
          {
            if (this.board.boardSpaces[row+1][col] != null)
            {
              if (this.board.boardSpaces[row+1][col].bOccupied)
              {
                bIsolated = false;
              }
            }
          }
          //check above
          if (row-1 >= 0)
          {
            if (this.board.boardSpaces[row-1][col] != null)
            {
              if (this.board.boardSpaces[row-1][col].bOccupied)
              {
                bIsolated = false;
              }
            }
          }
          if (bIsolated)
          {
            console.log("Found isolated letter");
            foundIsolatedLetter = true;
            bShouldContinue = false;
            break;
          }
        }
      }
      if (!bShouldContinue)
      {
        break;
      }
    }


    //console.log("words: " + words);

    let foundIllegalWord = false;
    if (foundIsolatedWord || foundIsolatedLetter)
    {
      foundIllegalWord = true;
    }
    if (words.length > 0)
    {
      if (!foundIllegalWord)
      {
        for (let i = 0; i < words.length;i++)
        {

          if (!this.lookUpWord(words[i]))
          {

            foundIllegalWord = true;
            break;
          }
          let wordPosition = wordPositions[i];

          if (this.wordsPlayed.length == 0)
          {
            if (words.length > 1)
            {
              foundIllegalWord = true;
              console.log("You can't play two words on first turn")
            }
            let bFoundCenterTile = false;
            wordPosition.forEach(word => {

              if (word[0] == 7 && word[1] == 7)
              {
                bFoundCenterTile = true;
              }
            })
            if (!bFoundCenterTile){
              console.log("You must play over the center space on the first turn");
              foundIllegalWord = true;
            }
          }
          else
          {

          }
        }
      }
    }
    else
    {
      foundIllegalWord = true;
    }
    if (foundIllegalWord)
    {
      //console.log("wordPositions: " + wordPositions)
      console.log("Illegal Move!");
      validTurn = false;
    }
    else
    {
      // console.log("words before filter: " + words);
      // let indexesToRemove = []
      // for (let i = 0; i < words.length;i++)
      // {
      //   for (let p = 0; p < this.wordsPlayed.length; p++)
      //   {
      //     if (words[i] == this.wordsPlayed[p])
      //     {
      //       indexesToRemove.push(i);
      //     }
      //   }
      // }
      // indexesToRemove.sort(function(a,b){ return b - a; });
      // for (let indexCounter = indexesToRemove.length-1; indexCounter >= 0; indexCounter--)
      // {
      //   words.splice(indexesToRemove[indexCounter],1);
      //   wordPositions.splice(indexesToRemove[indexCounter],1);
      // }
      // // //remove words from previous turns
      // // wordPositions.filter((el) => this.wordPositionsPlayed.indexOf(el) < 0);
      // // words.filter((el) => this.wordsPlayed.indexOf(el) < 0 );
      // console.log("words after filter: " + words);

      this.wordsPlayed.push(words);
      this.wordPositionsPlayed.push(wordPositions);
      let wordsPlayedSoFar = this.wordsPlayed.flat();
      let newWordsPlayedSoFar = wordsPlayedSoFar.filter((item,index) => wordsPlayedSoFar.indexOf(item) === index);
      console.log(newWordsPlayedSoFar);
      // console.log("WordsPlayed Length: " + this.wordsPlayed.length);
      // console.log("WordPositionsPlayed Length: " + this.wordPositionsPlayed.length);
      // for (let i = this.wordsPlayed.length - 1; i >=0; i--)
      // {
      //   if (this.wordsPlayed.indexOf(this.wordsPlayed[i]) != i)
      //   {
      //     console.log(this.wordsPlayed[i] + " is a duplicate so removing")
      //     this.wordsPlayed.slice(i,1);
      //     this.wordPositionsPlayed.slice(i,1);
      //   }
      // }
      // console.log("new WordsPlayed Length: " + this.wordsPlayed.length);
      // console.log("new WordPositionsPlayed Length: " + this.wordPositionsPlayed.length);
      // console.log("Words played so far: " + this.wordsPlayed);
      // for (let index = 0; index < this.wordsPlayed.length;index++)
      // {
      //   console.log(this.wordsPlayed[index]);
      // }

    }
    return validTurn;
  }

  lookUpWord(word)
  {
    let firstLetterWordIndex = word[0].toUpperCase();
    let firstLetterAlphabetIndex = alphabet.indexOf(firstLetterWordIndex);
    let filePath = '../DictionaryData/' + word[0].toUpperCase();
    if (word.length > 1)
    {
      filePath = path.join(__dirname, 'DictionaryData', word[0].toUpperCase(), word[1].toUpperCase() + '.txt');

    }
    else
    {
      filePath = path.join(__dirname, 'DictionaryData', word[0].toUpperCase(), word[0].toUpperCase() + '.txt');
       //'../DictionaryData/' + word[0] + '/' + word[0] + '.txt';
    }
    var bFoundWord = false;
    //var jsonPath = path.join(__dirname, '..', 'DictionaryData', 'dev', 'foobar.json');
    //var dataString = fs.readFileSync(filePath, 'utf8');
    //var data = fs.readFileSync(filePath, 'utf8');
    var lrs = new lineReader(filePath);
    var data = lrs.toLines();
    //data = data.replace(" ","p");
    if (data.includes(word + "\r"))
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

    Object.keys(this.sockets).forEach(playerID => {
      const socket = this.sockets[playerID];
      const player = this.players[playerID];
      for (let j = 0; j < Constants.TILES_PER_PLAYER; j++)
      {
        player.tiles.push(this.tiles.pop());
      }


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
