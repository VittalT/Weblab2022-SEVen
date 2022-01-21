import assert from "assert";
import {
  ClickState,
  Size,
  TowerConstants,
  MinionConstants,
  Point,
  toString,
  makeCopy,
  sumPoints,
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
  getTeamId,
  getGame,
} from "./models/GameState";
import { updateDisplay } from "./server-socket";
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
  const towerSizeConstants = towerConstants[towerSize];
  if (towerSizeConstants.cost > player.gold) {
    updateDisplay(userId, `${toString(loc)} ; Not enough money`);
  } else if (!closeEnough(game, userId, loc, towerSizeConstants.maxAdjBuildRadius)) {
    updateDisplay(userId, `${toString(loc)} ; Not close enough to an ally tower`);
  } else if (!farEnough(game, userId, loc, towerSizeConstants.minAdjBuildRadius)) {
    updateDisplay(userId, `${toString(loc)} ; Too close to an ally tower`);
  } else {
    player.gold -= towerSizeConstants.cost;
    const newTower: Tower = {
      health: towerSizeConstants.health,
      location: loc,
      size: towerSize,
      enemyMinionIds: [],
    };
    const newTowerId = ++game.maxTowerId;
    game.towers[newTowerId] = newTower;
    player.towerIds.push(newTowerId);
  }
};

const removeTower = (game: GameState, towerId: number) => {
  const tower = getTower(game, towerId);
  for (const minionId of tower.enemyMinionIds) {
    const minion = getMinion(game, minionId);
    minion.targetTowerId = null;
  }
  for (const player of Object.values(game.players)) {
    const idx = player.towerIds.indexOf(towerId);
    if (idx !== -1) {
      player.towerIds.splice(idx, 1);
    }
  }
  delete game.towers[towerId];
};

const angle = (loc1: Point, loc2: Point): number => {
  return Math.atan2(loc2.y - loc1.y, loc2.x - loc1.x);
};

const addMinion = (
  game: GameState,
  userId: string,
  minionSize: Size,
  allyTowerId: number,
  enemyTowerId: number
) => {
  const player = getPlayer(game, userId);

  const minionSizeConstants = minionConstants[minionSize];
  const allyTower = getTower(game, allyTowerId);
  const enemyTower = getTower(game, enemyTowerId);

  if (minionSizeConstants.cost <= player.gold) {
    player.gold -= minionSizeConstants.cost;
    const dir = angle(allyTower.location, enemyTower.location);
    const allyRadius = towerConstants[allyTower.size].hitRadius;
    const enemyRadius = towerConstants[enemyTower.size].hitRadius;
    const startOffset = { x: allyRadius * Math.cos(dir), y: allyRadius * Math.sin(dir) };
    const endOffset = { x: -enemyRadius * Math.cos(dir), y: -enemyRadius * Math.sin(dir) };
    const newMinion: Minion = {
      location: sumPoints(makeCopy(allyTower.location), startOffset),
      targetLocation: sumPoints(makeCopy(enemyTower.location), endOffset),
      direction: dir,
      size: minionSize,
      targetTowerId: enemyTowerId,
      reachedTarget: false,
    };
    const newMinionId = ++game.maxMinionId;
    game.minions[newMinionId] = newMinion;
    player.minionIds.push(newMinionId);
    enemyTower.enemyMinionIds.push(newMinionId);
  } else {
    updateDisplay(
      userId,
      `${toString(allyTower.location)} -> ${toString(enemyTower.location)} ; Not enough money`
    );
  }
};

const removeMinion = (game: GameState, minionId: number) => {
  for (const player of Object.values(game.players)) {
    const minion = getMinion(game, minionId);
    const targetTower = getTower(game, minion.targetTowerId ?? assert.fail());
    const idx2 = targetTower.enemyMinionIds.indexOf(minionId);
    targetTower.enemyMinionIds.splice(idx2, 1);

    const idx = player.minionIds.indexOf(minionId);
    if (idx !== -1) {
      player.minionIds.splice(idx, 1);
    }
  }
  delete game.minions[minionId];
};

const explode = (game: GameState, userId: string, towerId: number) => {
  const tower = getTower(game, towerId);
  for (const enemyMinionId of tower.enemyMinionIds) {
    removeMinion(game, enemyMinionId);
  }
  tower.enemyMinionIds = [];
};

export const timeUpdate = (delta_t_s: number) => {
  for (const game of Object.values(gameState)) {
    updateMinionLocs(delta_t_s, game);
    updateMinionDamage(delta_t_s, game);
    updateTowerRegenHealth(delta_t_s, game);
    updateTowerDeath(delta_t_s, game);
    updateGold(delta_t_s, game);
  }
};

const updateMinionLocs = (delta_t_s: number, game: GameState) => {
  for (const player of Object.values(game.players)) {
    for (const minionId of player.minionIds) {
      const minion = getMinion(game, minionId);
      if (!minion.reachedTarget) {
        const speed = minionConstants[minion.size].speed;
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
  for (const player of Object.values(game.players)) {
    for (const minionId of player.minionIds) {
      const minion = getMinion(game, minionId);
      if (minion.targetTowerId && minion.reachedTarget) {
        const targetTower = getTower(game, minion.targetTowerId);
        targetTower.health = Math.max(
          targetTower.health - minionConstants[minion.size].damageRate * delta_t_s,
          -1
        );
      }
    }
  }
};

const updateTowerRegenHealth = (delta_t_s: number, game: GameState) => {
  for (const player of Object.values(game.players)) {
    for (const towerId of player.towerIds) {
      const tower = getTower(game, towerId);
      const maxHealth = towerConstants[tower.size].health;
      tower.health = Math.min(
        tower.health + towerConstants[tower.size].healthRegenRate * delta_t_s,
        maxHealth
      );
    }
  }
};

const updateTowerDeath = (delta_t_s: number, game: GameState) => {
  for (const player of Object.values(game.players)) {
    for (const towerId of player.towerIds) {
      const tower = getTower(game, towerId);
      if (tower.health <= 0) {
        removeTower(game, towerId);
      }
    }
  }
};

const updateGold = (delta_t_s: number, game: GameState) => {
  for (const player of Object.values(game.players)) {
    for (const towerId of player.towerIds) {
      const tower = getTower(game, towerId);
      player.gold += towerConstants[tower.size].goldRate * delta_t_s;
    }
  }
};

export const updateGamePanelClickState = (
  gameId: number,
  userId: string,
  clickType: ClickState,
  size: Size
) => {
  console.log(`D ${clickType} ${size}`);
  const game = gameState[gameId];
  const player = getPlayer(game, userId);
  player.clickState = clickType;
  player.sizeClicked = size;
};

const getClickedAllyTowerId = (game: GameState, userId: string, loc: Point) => {
  const player = getPlayer(game, userId);
  for (const towerId of player.towerIds) {
    const tower = getTower(game, towerId);
    if (distance(tower.location, loc) <= towerConstants[tower.size].hitRadius) {
      return towerId;
    }
  }
  return -1;
};

const getClickedEnemyTowerId = (game: GameState, userId: string, loc: Point) => {
  for (const otherId of Object.keys(game.players)) {
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
  console.log(`D ${x} ${y}`);
  const game = gameState[gameId];
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
    } else {
      updateDisplay(userId, "Must click on an ally tower");
    }
  } else if (player.clickState === ClickState.Tower) {
    addTower(game, userId, player.sizeClicked, loc);
  } else {
    // ClickState.MinionFirstTower
    const enemyTowerId = getClickedEnemyTowerId(game, userId, loc);
    if (enemyTowerId !== -1) {
      addMinion(game, userId, player.sizeClicked, player.towerClickedId, enemyTowerId);
    } else {
      updateDisplay(userId, "Must click on an enemy tower");
    }
  }
};

/** Checks whether a player has won, if a player won, change the game state */
const checkWin = () => {
  // TODO Step 2
};

const createGameState = (gameId: number, userIds: Array<string>) => {
  console.log("D");
  let game = {
    timer: new Date(),
    winnerId: null,
    towers: {} as Record<number, Tower>,
    maxTowerId: userIds.length - 1,
    minions: {} as Record<number, Minion>,
    maxMinionId: 0,
    players: {} as Record<string, Player>,
    playerToTeamId: {} as Record<string, number>,
  };

  for (let teamId = 0; teamId < userIds.length; teamId++) {
    const userId = userIds[teamId];
    const startTowerId = teamId;
    const dir = (2 * Math.PI) / userIds.length;
    const startTowerLoc = { x: 800 + 300 * Math.cos(dir), y: 375 + 300 * Math.sin(dir) };
    const startTower: Tower = {
      health: 50,
      location: startTowerLoc,
      size: Size.Small,
      enemyMinionIds: [],
    };
    const player: Player = {
      gold: 50,
      towerIds: [startTowerId],
      minionIds: [],
      clickState: ClickState.Tower,
      towerClickedId: -1,
      sizeClicked: Size.Small,
      showInfo: false,
      inGame: true,
    };
    game.towers[startTowerId] = startTower;
    game.players[userId] = player;
    game.playerToTeamId[userId] = teamId;

    gameState[gameId] = game;
  }
};

module.exports = {
  toggleInfo,
  timeUpdate,
  createGameState,
  updateGamePanelClickState,
  updateGameMapClickState,
};
