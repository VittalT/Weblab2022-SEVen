import assert from "assert";
import {
  ClickState,
  Size,
  Point,
  Tower,
  Minion,
  Player,
  GameState,
  towerConstants,
  minionConstants,
  gameState,
  getPlayer,
  getTower,
  getMinion,
} from "./models/GameState";
/** game logic */

export const toggleInfo = (game: GameState, userId: string) => {
  const player = getPlayer(game, userId);
  player.showInfo = !player.showInfo;
};

const distance = (p1: Point, p2: Point): number => {
  return Math.pow(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2), 0.5);
};

const closeEnough = (game: GameState, userId: string, loc: Point, maxDist: number): boolean => {
  const player = getPlayer(game, userId);
  for (const towerId of player.towerIds) {
    const tower = getTower(game, towerId);
    if (distance(tower.location, loc) <= maxDist) {
      return true;
    }
  }
  return false;
};

const farEnough = (game: GameState, userId: string, loc: Point, minDist: number): boolean => {
  const player = getPlayer(game, userId);
  for (const towerId of player.towerIds) {
    const tower = getTower(game, towerId);
    if (distance(tower.location, loc) < minDist) {
      return false;
    }
  }
  return true;
};

const addTower = (game: GameState, userId: string, towerSize: Size, loc: Point) => {
  const player = getPlayer(game, userId);
  const towerSizeConstants = towerConstants.get(towerSize) ?? assert.fail();
  if (towerSizeConstants.cost > player.gold) {
    console.log("Not enough money"); // TODO Display this
  } else if (!closeEnough(game, userId, loc, towerSizeConstants.maxAdjBuildRadius)) {
    console.log("Not close enough to an ally tower"); // TODO Display this
  } else if (!farEnough(game, userId, loc, towerSizeConstants.minAdjBuildRadius)) {
    console.log("Too close to an ally tower"); // TODO Display this
  } else {
    player.gold -= towerSizeConstants.cost;
    const newTower: Tower = {
      health: towerSizeConstants.health,
      location: loc,
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

  const minionSizeConstants = minionConstants.get(minionSize) ?? assert.fail();
  const allyTower = getTower(game, allyTowerId);
  const enemyTower = getTower(game, enemyTowerId);

  if (minionSizeConstants.cost <= player.gold) {
    player.gold -= minionSizeConstants.cost;
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

export const timeUpdate = (delta_t_s: number) => {
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
        const speed = (minionConstants.get(minion.size) ?? assert.fail()).speed;
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
        targetTower.health -=
          (minionConstants.get(minion.size) ?? assert.fail()).damageRate * delta_t_s;
      }
    }
  }
};

const updateTowerRegenHealth = (delta_t_s: number, game: GameState) => {
  for (const player of game.players.values()) {
    for (const towerId of player.towerIds) {
      const tower = getTower(game, towerId);
      tower.health += (towerConstants.get(tower.size) ?? assert.fail()).healthRegenRate * delta_t_s;
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
      player.gold += (towerConstants.get(tower.size) ?? assert.fail()).goldRate * delta_t_s;
    }
  }
};

export const updateGamePanelClickState = (
  gameId: number,
  userId: string,
  clickType: ClickState,
  size: Size
) => {
  const game = gameState.get(gameId) ?? assert.fail();
  const player = getPlayer(game, userId);
  player.clickState = clickType;
  player.sizeClicked = size;
};

const getClickedAllyTowerId = (game: GameState, userId: string, loc: Point) => {
  const player = getPlayer(game, userId);
  for (const towerId of player.towerIds) {
    const tower = getTower(game, towerId);
    if (
      distance(tower.location, loc) <= (towerConstants.get(tower.size) ?? assert.fail()).hitRadius
    ) {
      return towerId;
    }
  }
  return -1;
};

const getClickedEnemyTowerId = (game: GameState, userId: string, loc: Point) => {
  for (const otherId of game.players.keys()) {
    if (otherId !== userId) {
      const possTowerId = getClickedAllyTowerId(game, otherId, loc);
      if (possTowerId !== -1) {
        return possTowerId;
      }
    }
  }
  return -1;
};

export const updateGameMapClickState = (gameId: number, userId: string, x: number, y: number) => {
  const game = gameState.get(gameId) ?? assert.fail();
  const player = getPlayer(game, userId);
  const loc: Point = { x, y };
  if (player.clickState === ClickState.Minion || player.clickState === ClickState.Explosion) {
    const allyTowerId = getClickedAllyTowerId(game, userId, loc);
    if (allyTowerId !== -1) {
      if (player.clickState === ClickState.Minion) {
        player.clickState = ClickState.MinionFirstTower;
        player.towerClickedId = allyTowerId;
      } else {
        // ClickState.Explosion
        explode(game, userId, allyTowerId);
      }
    }
  } else if (player.clickState === ClickState.Tower) {
    addTower(game, userId, player.sizeClicked, loc);
  } else {
    // ClickState.MinionFirstTower
    const enemyTowerId = getClickedEnemyTowerId(game, userId, loc);
    addMinion(game, userId, player.sizeClicked, player.towerClickedId, enemyTowerId);
  }
};

/** Checks whether a player has won, if a player won, change the game state */
const checkWin = () => {
  // TODO Step 2
};

module.exports = {
  toggleInfo,
  timeUpdate,
  updateGamePanelClickState,
  updateGameMapClickState,
};
