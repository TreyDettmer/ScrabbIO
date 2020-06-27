import { connect, play, endTurn, cancelMoves } from './networking';
import { startRendering, ConfirmedAction, setBlankTileLetter} from './render';
import { initState } from './state';
import { startCapturingInput, stopCapturingInput } from './input';
import {setLobbyboardHidden} from './lobbyboard';
import './css/style.css';

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


Promise.all([
  connect(onGameOver),
]).then(() => {
  playMenu.classList.remove("hidden");
  usernameInput.focus();
  playButton.onclick = () => {
    if (/\S/.test(usernameInput.value))
    {
      play(usernameInput.value);
      playMenu.classList.add("hidden");
      turnDiv.classList.remove("hidden");
      //tileDiv.classList.remove("hidden");
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

export function ToggleActionsDiv(hide)
{
  if (hide)
  {
    console.log("hiding")
    actionsDiv.className = "hidden";
  }
  else
  {
    actionsDiv.classList.remove("hidden");
  }
}



function onGameOver() {
  stopCapturingInput();
  console.log("GameOver?");
}
