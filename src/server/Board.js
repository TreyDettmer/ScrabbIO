const BoardSpace = require('./BoardSpace');


class Board {
  constructor()
  {
    this.boardspaces = [];
    this.init();
  }

  init()
  {
    for (let row = 0; row < 19; row++)
    {
      this.boardspaces[row] = []
      for (let col = 0; col < 19; col++)
      {
        this.boardspaces[row][col] = new BoardSpace();
      }
    }
  }


}


module.exports = Board;
