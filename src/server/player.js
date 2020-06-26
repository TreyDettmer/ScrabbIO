class Player {
  constructor(id, username)
  {
    this.id = id;
    this.username = username;
    this.bMyTurn = false;
    this.tiles = [];
    this.clickPosition = [-1,-1];
    this.boardSpaces = [];
    this.tileRackSpaces = [];
    this.selectedObjects = [];
    this.score = 0;

  }

  serializeForUpdate()
  {
    return {
      id: this.id,
      username: this.username,
      bMyTurn: this.bMyTurn,
      tiles: this.tiles,
      clickPosition: this.clickPosition,
      boardSpaces: this.boardSpaces,
      tileRackSpaces: this.tileRackSpaces,
      selectedObjects: this.selectedObjects,
      score: this.score
    };
  }

  setClickPosition(x,y)
  {
    //console.log("x: " + x + " y: " + y);
    this.clickPosition = [x,y];
  }


}

module.exports = Player;
