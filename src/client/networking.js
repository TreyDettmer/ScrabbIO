//this file handles sending messages from the client to the server.

import io from 'socket.io-client';
import { throttle } from 'throttle-debounce';
import { processGameUpdate } from './state';

const Constants = require('../shared/constants');

const socketProtocol = (window.location.protocol.includes('https')) ? 'wss' : 'ws';
const socket = io(`${socketProtocol}://${window.location.host}`, { reconnection: false });
const connectedPromise = new Promise(resolve => {
  socket.on('connect', () => {
    console.log('Connected to server!');
    resolve();
  });
});

export const connect = () => (
  connectedPromise.then(() => {
    // Register callbacks
    socket.on(Constants.MSG_TYPES.GAME_UPDATE, processGameUpdate);
  })
);

export const play = username => {
  socket.emit(Constants.MSG_TYPES.JOIN_GAME, username);
};

export const sendInput = throttle(20, (x,y) => {
  socket.emit(Constants.MSG_TYPES.INPUT, [x,y]);
});

export const sendCanvas = spaces => {
  socket.emit(Constants.MSG_TYPES.INIT_CANVAS,spaces);
}

export const confirmMove = blankLetter => {
  socket.emit(Constants.MSG_TYPES.PLAYER_ACTION.CONFIRM_MOVE,blankLetter);
}

export const endTurn = () => {
  socket.emit(Constants.MSG_TYPES.PLAYER_ACTION.END_TURN);
}

export const cancelMoves = () => {
  socket.emit(Constants.MSG_TYPES.PLAYER_ACTION.CANCEL_MOVES);
}

export const SendExchangedTiles = letters => {
  socket.emit(Constants.MSG_TYPES.PLAYER_ACTION.EXCHANGE_TILES,letters);
}
