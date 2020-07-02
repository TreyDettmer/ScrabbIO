# ScrabbIO
**Browser Based Online Two Player Scrabble Game**
## Where To Play
Visit https://scrabbio.herokuapp.com/ and have a friend do the same. Two players can be playing the game at a time. If your screen size is too small or there are already two people playing on the server, then you won't be able to play.

## How To Play
Watch [this video](https://www.youtube.com/watch?v=CFA-1d8oTLw&feature=youtu.be) to learn how to play. You can view the official Scrabble rules [here](https://scrabble.hasbro.com/en-us/rules).


## Motivation For Project
I was inspired to build this game because my brother and I had been playing a lot of Scrabble and I wanted to see if I could build a browser based online version of the game. Of course, this idea already existed, but I wanted to build it for my own enjoyment and challenge.

## The Development Process
I had never developed an online multiplayer application before (outside of using game engines) so figuring out how to do that was the first task. Fortunately, I found an awesome [tutorial by Victor Zhou](https://victorzhou.com/blog/build-an-io-game-part-1/) on how to build a multiplayer (.io) web game from scratch. Without that tutorial, this project would have been a lot harder to complete. I copy and pasted his example project and gutted it down to the bare-bones framework. From there, I started planning out and coding the different game classes that the game needed. 

One initial challenge that I faced was figuring out an easy and moduable way to handle how players play tiles and do other actions. I had to manually check if tiles or board spaces were clicked based on where on the screen a player clicked. This involved sending information back and forth between the clients and server about which game objects were selected and where the player clicked. For some parts of the game I was able to use raw HTML buttons and text boxes which was convenient.

The major challenge that I faced was enforcing the game rules. Here is a general outline of the logic that the game follows to make sure that a player's turn was valid.
- Everything below happens once the player clicks on the "End Turn" button.
1. The game ensures that the tiles that were added to the board are in the same row or column
2. The game iterates over the board looking for possible words
   * Look at each row and find clumps of letters
   * Look at each column and find clumps of letters
3. The game stores the possible words and the positions of each tile in each word 
4. The game checks that each possible word is not isolated (not connected to any other words)
5. The game looks up each possible word in the English dictionary to confirm that the word is an actual English word
6. If all of the above have been done and there are no issues, then the game calculates the score for that turn
   * Look at the array of possible words and their positions and filter out the words from previous turns.
   * For each new word, iterate over each board space that the word's tiles occupy
       * Apply the board space's bonus to the word and/or tile
   * Keep track of how many points have been score
