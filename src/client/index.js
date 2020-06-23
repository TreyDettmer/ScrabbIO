import { connect, play, endTurn } from './networking';
import { startRendering, ConfirmedAction} from './render';
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


Promise.all([
  connect(onGameOver),
]).then(() => {
  playMenu.classList.remove("hidden");
  usernameInput.focus();
  playButton.onclick = () => {
    play(usernameInput.value);
    playMenu.classList.add("hidden");
    initState();
    startCapturingInput();
    startRendering();
    setLobbyboardHidden(false);

  }
  confirmActionButton.onclick = () => {
    ConfirmedAction();
  };
  endTurnButton.onclick = () => {
    endTurn();
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
