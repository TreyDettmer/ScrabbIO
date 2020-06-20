import { connect, play } from './networking';
import { startRendering} from './render';

import './css/style.css';

const playMenu = document.getElementById('play-menu');
const playButton = document.getElementById('play-button');
const usernameInput = document.getElementById('username-input');

Promise.all([
  connect(onGameOver),
]).then(() => {
  playMenu.classList.remove("hidden");
  usernameInput.focus();
  playButton.onclick = () => {
    play(usernameInput.value);
    playMenu.classList.add("hidden");
  }




  startRendering();

}).catch(console.error);



function onGameOver() {
  console.log("GameOver?");
}
