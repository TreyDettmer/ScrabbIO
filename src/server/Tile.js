const GameObject = require('./GameObject');


class Tile{
  constructor(letter,value,bWasBlank = false)
  {
    this.letter = letter;
    this.value = value;
    this.bHighlighted = false;
    this.bWasBlank = bWasBlank;
  }

  serializeForUpdate()
  {
    return {
      letter: this.letter,
      value: this.value,
      bHighlighted: this.bHighlighted,
      bWasBlank: this.bWasBlank
    };
  }
}

module.exports = Tile;
