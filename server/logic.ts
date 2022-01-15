/** Utils! */

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
};

const getDistanceFromGoal = (player) => {
  return Math.abs(player.x - goal.x) + Math.abs(player.y - goal.y);
};

const getRandomLocation = () => {
  return {
    x: getRandomInt(-20, 20) * 20,
    y: getRandomInt(-20, 20) * 20,
  };
};

const getPlayerColor = (id) => {
  const player = gameState.players[id];
  const dist = Math.min(getDistanceFromGoal(player) / 800, 1);
  const blueValue = (1 - dist) * 255;
  const redValue = dist * 255;
  return `rgb(${redValue}, 0, ${blueValue})`;
};

/** constants */
const goal = getRandomLocation();

enum ClickState {
  Tower,
  Minion,
  MinionFirstTower,
  Explosion,
}

enum Size {
  Small,
  Medium,
  Large,
}

/** game state */
type Tower = {
  health: Number;
  location: [Number, Number];
  size: Size;
};

type Minion = {
  location: [Number, Number];
  targetLocation: [Number, Number];
  direction: Number;
  size: Size;
  targetTower: String | null; // id
};

type Player = {
  gold: Number;
  towers: Map<String, Tower>;
  minions: Map<String, Minion>;
  clickState: ClickState;
  towerClicked: String; // id
  showInfo: Boolean;
  inGame: Boolean;
};

type Game = {
  timer: Date;
  winner: String | null;
  players: Map<String, Player>;
};

const gameState: Map<String, Game> = new Map();
// represents all active games

/** game logic */

/** Adds a player to the game state, initialized with a random location */
const addPlayer = (id) => {
  gameState.players[id] = getRandomLocation();
  gameState.players[id].color = getPlayerColor(id);
};

/**
 * Moves a player based off the sent data from the "move" socket msg
 * id: the player to move
 * dir: "up", "down", "left", or "right", passed to server through socket from input.js
 */
const movePlayer = (id, dir) => {
  if (dir === "up") {
    gameState.players[id].y += 20;
  } else if (dir === "down") {
    gameState.players[id].y -= 20;
  } else if (dir === "left") {
    gameState.players[id].x -= 20;
  } else if (dir === "right") {
    gameState.players[id].x += 20;
  }
  gameState.players[id].color = getPlayerColor(id);
  // TODO Step 2 check win on move
};

/** Checks whether a player has won, if a player won, change the game state */
const checkWin = () => {
  // TODO Step 2
};

/** Remove a player from the game state if they DC */
const removePlayer = (id) => {
  delete gameState.players[id];
};

module.exports = {
  gameState,
  addPlayer,
  movePlayer,
  removePlayer,
};
