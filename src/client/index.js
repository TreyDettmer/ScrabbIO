import { connect, play, endTurn, cancelMoves } from './networking';
import { startRendering, ConfirmedAction, setBlankTileLetter, exchangeTiles} from './render';
import { initState } from './state';
import { startCapturingInput, stopCapturingInput } from './input';
import {setLobbyboardHidden} from './lobbyboard';
import './css/style.css';

const canvas = document.getElementById('game-canvas');
const playMenu = document.getElementById('play-menu');
const playButton = document.getElementById('play-button');
const usernameInput = document.getElementById('username-input');
const actionsDiv = document.getElementById('actions-div');
const confirmActionButton = document.getElementById('confirm-action-button');
const endTurnButton = document.getElementById('end-turn-button');
const cancelMovesButton = document.getElementById('cancel-moves-button');
const turnDiv = document.getElementById('turn-div');
const tileDiv = document.getElementById('blank-tile-div');
const tileInput = document.getElementById('tile-input');
const tileButton = document.getElementById('tile-choose-button');
const tileExchangeDiv = document.getElementById('exchange-tiles-div');
const tileExchangeInput = document.getElementById('exchange-tiles-input');
const tileExchangeButton = document.getElementById('exchange-tiles-button');
const gameFeed = document.getElementById('game-feed');
const tilesLeftDiv = document.getElementById('tiles-left-div');
const keyDiv = document.getElementById('key-div');
const fullLobbyDiv = document.getElementById('full-lobby-div');



Promise.all([
  connect(),
]).then(() => {
  playMenu.classList.remove("hidden");
  usernameInput.focus();
  playButton.onclick = () => {
    if (/\S/.test(usernameInput.value))
    {
      canvas.classList.remove("hidden");
      play(usernameInput.value);
      playMenu.classList.add("hidden");
      turnDiv.classList.remove("hidden");
      gameFeed.classList.remove("hidden");
      tilesLeftDiv.classList.remove("hidden");
      keyDiv.classList.remove("hidden");
      fullLobbyDiv.classList.remove("hidden");
      initState();
      startCapturingInput();
      startRendering();
      setLobbyboardHidden(false);


    }

  }
  tileButton.onclick = () => {
    if (tileInput.value.length == 1)
    {
      setBlankTileLetter(tileInput.value);
    }
  }

  tileExchangeButton.onclick = () => {
    if (tileExchangeInput.value.length >= 1)
    {
      exchangeTiles(tileExchangeInput.value);
    }
  }
  confirmActionButton.onclick = () => {
    ConfirmedAction();
  };
  endTurnButton.onclick = () => {
    endTurn();
  }
  cancelMovesButton.onclick = () => {
    cancelMoves();
  }

}).catch(console.error);
