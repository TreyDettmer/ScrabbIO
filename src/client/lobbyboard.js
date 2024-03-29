//despite the files name, this file handles updating the client's html

const lobbyboard = document.getElementById("lobbyboard");
const rows = document.querySelectorAll('#lobbyboard table tr');
const turnDiv = document.getElementById('turn-div');
const feedTable = document.getElementById('#game-feed table');
const feedRows = document.querySelectorAll('#game-feed table tr');
const tilesLeftDiv = document.getElementById('tiles-left-div');
const actionsDiv = document.getElementById('actions-div');
export function updateLobbyboard(data)
{
  for (let i = 0; i < data.length; i++)
  {
    //draw score board
    rows[i+1].innerHTML = `<td>${data[i].username.slice(0,15) || 'Anonymous'}</td><td>${
    data[i].score}</td>`;
    //draw whose turn it is
    if (data[i].bMyTurn)
    {
      turnDiv.innerHTML = data[i].username.slice(0,15) + "\'s turn";
    }
    //draw feed
    if (data[i].feed.length == 0)
    {
      for (let i = 0; i < feedRows.length;i++)
      {
        feedRows[i].innerHTML = "";
        feedRows[i].style.backgroundColor = "rgba(200, 200, 200,0.0)";
        feedRows[i].style.color = "rgba(0, 0, 0,0.0)";
      }
    }
    else
    {
      for (let f = 0; f < data[i].feed.length;f++)
      {
        if (f != data[i].feed.length -1 )
        {
          feedRows[f].style.backgroundColor = "rgba(200, 200, 200,0.1)";
          feedRows[f].style.color = "rgba(0, 0, 0,0.2)";
        }
        else
        {
          feedRows[f].style.backgroundColor = "rgba(200, 200, 200, .7)";
          feedRows[f].style.color = "black";
        }
        feedRows[f].innerHTML = `<td>${data[i].feed[f]}</td>`;
      }
    }
    //draw how many tiles are left
    tilesLeftDiv.innerHTML = " Tiles Left: " + data[i].tilesLeft;

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
