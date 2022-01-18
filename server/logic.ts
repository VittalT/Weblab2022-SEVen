import assert from "assert";
import {
  Size,
  Point,
  Tower,
  Minion,
  Player,
  GameState,
  towerInfo,
  minionInfo,
  gameState,
  getPlayer,
  getTower,
  getMinion,
} from "./models/GameState";
/** game logic */

const toggleInfo = (game: GameState, userId: string) => {
  const player = getPlayer(game, userId);
  player.showInfo = !player.showInfo;
};

const distance = (x1: number, y1: number, x2: number, y2: number): number => {
  return Math.pow(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2), 0.5);
};

const closeEnough = (
  game: GameState,
  userId: string,
  x: number,
  y: number,
  maxDist: number
): boolean => {
  const player = getPlayer(game, userId);
  for (const towerId of player.towerIds) {
    const tower = getTower(game, towerId);
    if (distance(tower.location.x, tower.location.y, x, y) <= maxDist) {
      return true;
    }
  }
  return false;
};

const farEnough = (
  game: GameState,
  userId: string,
  x: number,
  y: number,
  minDist: number
): boolean => {
  const player = getPlayer(game, userId);
  for (const towerId of player.towerIds) {
    const tower = getTower(game, towerId);
    if (distance(tower.location.x, tower.location.y, x, y) < minDist) {
      return false;
    }
  }
  return true;
};

const addTower = (game: GameState, userId: string, towerSize: Size, x: number, y: number) => {
  const player = getPlayer(game, userId);
  const towerSizeInfo = towerInfo.get(towerSize) ?? assert.fail();
  if (towerSizeInfo.cost > player.gold) {
    console.log("Not enough money"); // TODO Display this
  } else if (!closeEnough(game, userId, x, y, towerSizeInfo.maxAdjBuildRadius)) {
    console.log("Not close enough to an ally tower"); // TODO Display this
  } else if (!farEnough(game, userId, x, y, towerSizeInfo.minAdjBuildRadius)) {
    console.log("Too close to an ally tower"); // TODO Display this
  } else {
    player.gold -= towerSizeInfo.cost;
    const newTower: Tower = {
      health: towerSizeInfo.health,
      location: { x, y },
      size: towerSize,
      enemyMinionIds: new Set(),
    };
    const newTowerId = game.maxTowerId++;
    game.towers.set(newTowerId, newTower);
    player.towerIds.add(newTowerId);
  }
};

const removeTower = (game: GameState, towerId: number) => {
  game.towers.delete(towerId);
  // TODO assign remaining enemy minions to a new tower
};

const angle = (loc1: Point, loc2: Point): number => {
  return Math.atan2(loc2.y, loc2.x) - Math.atan2(loc1.y, loc1.x);
};

const addMinion = (
  game: GameState,
  userId: string,
  minionSize: Size,
  allyTowerId: number,
  enemyTowerId: number
) => {
  const player = getPlayer(game, userId);

  const minionSizeInfo = minionInfo.get(minionSize) ?? assert.fail();
  const allyTower = getTower(game, allyTowerId);
  const enemyTower = getTower(game, enemyTowerId);

  if (minionSizeInfo.cost <= player.gold) {
    player.gold -= minionSizeInfo.cost;
    const newMinion: Minion = {
      location: allyTower.location,
      targetLocation: enemyTower.location,
      direction: angle(allyTower.location, enemyTower.location),
      size: minionSize,
      targetTowerId: enemyTowerId,
      reachedTarget: false,
    };
    const newMinionId = game.maxMinionId++;
    game.minions.set(newMinionId, newMinion);
    player.minionIds.add(newMinionId);
  } else {
    console.log("Not enough money"); // TODO Display this
  }
};

const removeMinion = (game: GameState, minionId: number) => {
  game.minions.delete(minionId);
};

const explode = (game: GameState, userId: string, towerId: number) => {
  const tower = getTower(game, towerId);
  for (const enemyMinionId of tower.enemyMinionIds) {
    game.minions.delete(enemyMinionId);
  }
  // TODO cleanup to delete tower or minion not in game
};

const timeUpdate = (delta_t_s: number) => {
  for (const game of gameState.values()) {
    updateMinionLocs(delta_t_s, game);
    updateMinionDamage(delta_t_s, game);
    updateTowerRegenHealth(delta_t_s, game);
    updateTowerDeath(delta_t_s, game);
    updateGold(delta_t_s, game);
  }
};

const updateMinionLocs = (delta_t_s: number, game: GameState) => {
  for (const player of game.players.values()) {
    for (const minionId of player.minionIds) {
      const minion = getMinion(game, minionId);
      if (!minion.reachedTarget) {
        const speed = (minionInfo.get(minion.size) ?? assert.fail()).speed;
        const xSpeed = speed * Math.cos(minion.direction);
        const ySpeed = speed * Math.sin(minion.direction);
        minion.location.x += xSpeed * delta_t_s;
        minion.location.y += ySpeed * delta_t_s;
        if ((minion.location.x - minion.targetLocation.x) * xSpeed > 0) {
          minion.location = minion.targetLocation;
          minion.reachedTarget = true;
        }
      }
    }
  }
};

const updateMinionDamage = (delta_t_s: number, game: GameState) => {
  for (const player of game.players.values()) {
    for (const minionId of player.minionIds) {
      const minion = getMinion(game, minionId);
      if (minion.targetTowerId && minion.reachedTarget) {
        const targetTower = getTower(game, minion.targetTowerId);
        targetTower.health -= (minionInfo.get(minion.size) ?? assert.fail()).damageRate * delta_t_s;
      }
    }
  }
};

const updateTowerRegenHealth = (delta_t_s: number, game: GameState) => {
  for (const player of game.players.values()) {
    for (const towerId of player.towerIds) {
      const tower = getTower(game, towerId);
      tower.health += (towerInfo.get(tower.size) ?? assert.fail()).healthRegenRate * delta_t_s;
    }
  }
};

const updateTowerDeath = (delta_t_s: number, game: GameState) => {
  for (const player of game.players.values()) {
    for (const towerId of player.towerIds) {
      const tower = getTower(game, towerId);
      if (tower.health < 0) {
        removeTower(game, towerId);
      }
    }
  }
};

const updateGold = (delta_t_s: number, game: GameState) => {
  for (const player of game.players.values()) {
    for (const towerId of player.towerIds) {
      const tower = getTower(game, towerId);
      player.gold += (towerInfo.get(tower.size) ?? assert.fail()).goldRate * delta_t_s;
    }
  }
};

// const handleBoardClick = (userId: string, x: number, y: number) => {
//   const gameId = gameOfPlayer(userId);
//   gameState.get(gameId).players.get(userId).clickState = click;
//   gameState.get(gameId).players.get(userId).towerClicked = towerClickedId;
// };

/** Checks whether a player has won, if a player won, change the game state */
const checkWin = () => {
  // TODO Step 2
};

module.exports = {
  gameState,
  timeUpdate,
};
