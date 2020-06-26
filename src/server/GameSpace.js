const GameObject = require('./GameObject');

class GameSpace extends GameObject {
  constructor(xPosition = 0,yPosition = 0,width=1,height=1,bSelected=false,letterMultiply = 1.0,wordMultiply = 1.0)
  {
    super(xPosition,yPosition,width,height,bSelected);
    this.tile = null;
    this.bOccupied = false;
    this.bUsedLetterMultiply = false;
    this.bUsedWordMultiply = false;
    this.letterMultiply = letterMultiply;
    this.wordMultiply = wordMultiply;
  }
  assignTile(tile)
  {
    this.tile = tile;
    this.bOccupied = true;
  }
  // toString()
  // {
  //   return `xPosition: ${this.xPosition},
  //           yPosition: ${this.yPosition},
  //           width: ${this.width},
  //           height: ${this.height},
  //           tile: ${this.tile},
  //           bOccupied: ${this.bOccupied}`
  // }
}

module.exports = GameSpace;
