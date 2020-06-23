const GameSpace = require('./GameSpace');


class Board {
  constructor()
  {
    this.boardSpaces = [];
    this.init();
  }

  init()
  {
    for (let row = 0; row < 19; row++)
    {
      this.boardSpaces[row] = []
      for (let col = 0; col < 19; col++)
      {
        this.boardSpaces[row][col] = new GameSpace();
      }
    }
  }


}


module.exports = Board;
