const GameSpace = require('./GameSpace');
const Constants = require('../shared/constants.js');


class Board {
  constructor()
  {
    this.boardSpaces = [];
    this.init();
  }

  init()
  {
    for (let row = 0; row < Constants.BOARD_TILES; row++)
    {
      this.boardSpaces[row] = []
      for (let col = 0; col < Constants.BOARD_TILES; col++)
      {
        this.boardSpaces[row][col] = new GameSpace();
      }
    }
  }


}


module.exports = Board;
