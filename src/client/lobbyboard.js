
const lobbyboard = document.getElementById("lobbyboard");
const rows = document.querySelectorAll('#lobbyboard table tr');
const turnDiv = document.getElementById('turn-div');
export function updateLobbyboard(data)
{
  for (let i = 0; i < data.length; i++)
  {
    rows[i+1].innerHTML = `<td>${data[i].username.slice(0,15) || 'Anonymous'}</td><td>${
    data[i].score}</td>`;
    if (data[i].bMyTurn)
    {
      turnDiv.innerHTML = data[i].username.slice(0,15) + "\'s turn";
    }


  }
  if (data.length == 1)
  {
    rows[2].innerHTML = '<td>-</td><td>-</td>';
  }



}

export function setLobbyboardHidden(hidden) {
  if (hidden) {
    lobbyboard.classList.add('hidden');
  } else {
    lobbyboard.classList.remove('hidden');
  }
}
