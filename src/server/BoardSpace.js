class BoardSpace {
  constructor()
  {
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
