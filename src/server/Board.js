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
      let letterMultiply = 1.0;
      let wordMultiply = 1.0;

      for (let col = 0; col < Constants.BOARD_TILES; col++)
      {

        switch(Constants.BOARD_LAYOUT[row][col])
        {
          case 1:
            wordMultiply = 3;
            letterMultiply = 1;
            break;
          case 2:
            letterMultiply = 2;
            wordMultiply = 1;
            break;
          case 3:
            letterMultiply = 3;
            wordMultiply = 1;
            break;
          case 4:
            wordMultiply = 2;
            letterMultiply = 1;
            break;
          case 0:
            letterMultiply = 1;
            wordMultiply = 1;
        }

        this.boardSpaces[row][col] = new GameSpace(0,0,1,1,false,letterMultiply,wordMultiply);
      }
    }
  }


}


module.exports = Board;
