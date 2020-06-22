const GameObject = require('./GameObject');

class BoardSpace extends GameObject {
  constructor()
  {
    super();
    this.tile = null;
    this.bOccupied = false;
  }
  assignTile(tile)
  {
    this.tile = tile;
    this.bOccupied = true;
  }
}

module.exports = BoardSpace;
