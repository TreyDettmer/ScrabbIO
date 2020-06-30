//server creation and handling of client messages to server

const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const socketio = require('socket.io');

const Constants = require('../shared/constants');
const Game = require('./game');
//const webpackConfig = require('../../webpack.dev.js');

// Setup an Express server
const app = express();
app.use(express.static(__dirname + 'public'));

if (process.env.NODE_ENV === 'development') {
  // Setup Webpack for development
  // const compiler = webpack(webpackConfig);
  // app.use(webpackDevMiddleware(compiler));
} else {
  // Static serve the dist/ folder in production
  app.use(express.static('dist'));
}

// Listen on port
const port = process.env.PORT || 3000;
const server = app.listen(port);
console.log(`Server listening on port ${port}`);

// Setup socket.io
const io = socketio(server);

// Listen for socket.io connections
io.on('connection', socket => {
  console.log('Player connected!', socket.id);

  socket.on(Constants.MSG_TYPES.JOIN_GAME, joinGame);
  socket.on(Constants.MSG_TYPES.INPUT, handleInput);
  socket.on(Constants.MSG_TYPES.INIT_CANVAS,receiveCanvas);
  socket.on(Constants.MSG_TYPES.PLAYER_ACTION.CONFIRM_MOVE,confirmMove);
  socket.on(Constants.MSG_TYPES.PLAYER_ACTION.END_TURN,endTurn);
  socket.on(Constants.MSG_TYPES.PLAYER_ACTION.CANCEL_MOVES,cancelMoves);
  socket.on(Constants.MSG_TYPES.PLAYER_ACTION.EXCHANGE_TILES,sendExchangedTiles)
  socket.on('disconnect', onDisconnect);
});

// Setup the Game
const game = new Game();

function joinGame(username) {
  game.addPlayer(this, username);
}

function handleInput(coord) {
  //console.log(coord[0],coord[1])
  game.handleInput(this, coord);
}

function onDisconnect() {
  game.removePlayer(this);
}

function receiveCanvas(spaces){
  game.handleCanvas(this,spaces);
}

function confirmMove(blankLetter){
  game.confirmMove(this,blankLetter);
}

function sendExchangedTiles(letters)
{
  game.handleExchangedTiles(this,letters);
}

function endTurn(){
  game.endTurn(this);
}

function cancelMoves(){
  game.cancelMoves(this);
}
