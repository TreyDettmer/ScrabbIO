const GameObject = require('./GameObject');


class Tile{
  constructor(letter,value)
  {
    this.letter = letter;
    this.value = value;
    this.bHighlighted = false;
  }

  serializeForUpdate()
  {
    return {
      letter: this.letter,
      value: this.value,
      bHighlighted: this.bHighlighted
    };
  }
}

module.exports = Tile;
