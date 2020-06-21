class Tile {
  constructor(letter,value)
  {
    this.letter = letter;
    this.value = value;
  }

  serializeForUpdate()
  {
    return {
      letter: this.letter,
      value: this.value
    };
  }
}

module.exports = Tile;
