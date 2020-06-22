class Player {
  constructor(id, username)
  {
    this.id = id;
    this.username = username;
    this.tiles = [];
    this.clickPosition = [-1,-1];
    this.boardSpaces = [];
    this.tileRackSpaces = [];
  }

  serializeForUpdate()
  {
    return {
      id: this.id,
      username: this.username,
      tiles: this.tiles,
      clickPosition: this.clickPosition,
      boardSpaces: this.boardSpaces,
      tileRackSpaces: this.tileRackSpaces
    };
  }

  setClickPosition(x,y)
  {
    //console.log("x: " + x + " y: " + y);
    this.clickPosition = [x,y];
  }


}

module.exports = Player;
