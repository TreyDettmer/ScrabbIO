module.exports = Object.freeze({
  TILES_PER_PLAYER: 7,
  MAP_SIZE: 3000,
  BOARD_TILES: 15,
  MSG_TYPES: {
    JOIN_GAME: 'join_game',
    GAME_UPDATE: 'update',
    INPUT: 'input',
    GAME_OVER: 'dead',
    INIT_CANVAS: 'init_canvas',
    PLAYER_ACTION:
    {
      CONFIRM_MOVE: 'confirm_move',
      END_TURN: 'end_turn'
    }
  },
  BOARD: {
    SIZE: 600,
    COLOR: '#d9d9d9',
    BORDER_WIDTH: 2,
    BORDER_COLOR: '#8a7754',
    BOARD_SPACES: {
      COLOR: '#c4baa3',
      CENTER_COLOR: '#deb8c8',
      PADDING: 0.03,
    },
  },
  TILES: {
    COLOR: '#e8c884',
    PADDING: 0.01,
  },
  RACK_WIDTH: .6
})
