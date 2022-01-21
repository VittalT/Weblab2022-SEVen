import assert from "assert";
/** helper enums */
export enum ClickState {
  Tower = "Tower",
  Minion = "Minion",
  MinionFirstTower = "Minion and Clicked First Tower",
  Explosion = "Explosion",
}

export enum Size {
  Small = "Small",
  Medium = "Medium",
  Large = "Large",
}

/** constants */
export type TowerConstants = {
  health: number;
  healthRegenRate: number;
  goldRate: number;
  cost: number;
  minAdjBuildRadius: number;
  maxAdjBuildRadius: number;
  hitRadius: number;
};

export type MinionConstants = {
  damageRate: number;
  cost: number;
  speed: number;
  boundingRadius: number;
};

export type Point = {
  x: number;
  y: number;
};

export const toString = (p: Point) => {
  return `(${p.x}, ${p.y})`;
};

export const makeCopy = (p: Point) => {
  return { x: p.x, y: p.y };
};

export const sumPoints = (p1: Point, p2: Point) => {
  return { x: p1.x + p2.x, y: p1.y + p2.y };
};

/** game state */

export const towerConstants: Record<Size, TowerConstants> = {
  [Size.Small]: {
    health: 50,
    healthRegenRate: 3,
    goldRate: 3,
    cost: 50,
    minAdjBuildRadius: 100,
    maxAdjBuildRadius: 150,
    hitRadius: 50,
  },
  [Size.Medium]: {
    health: 100,
    healthRegenRate: 5,
    goldRate: 5,
    cost: 100,
    minAdjBuildRadius: 120,
    maxAdjBuildRadius: 200,
    hitRadius: 70,
  },
  [Size.Large]: {
    health: 200,
    healthRegenRate: 10,
    goldRate: 10,
    cost: 200,
    minAdjBuildRadius: 140,
    maxAdjBuildRadius: 250,
    hitRadius: 90,
  },
};
export const minionConstants: Record<Size, MinionConstants> = {
  [Size.Small]: {
    damageRate: 5,
    cost: 10,
    speed: 400,
    boundingRadius: 10,
  },
  [Size.Medium]: {
    damageRate: 10,
    cost: 25,
    speed: 300,
    boundingRadius: 20,
  },
  [Size.Large]: {
    damageRate: 20,
    cost: 50,
    speed: 200,
    boundingRadius: 30,
  },
};

export const GoldConstants = {
  realRadius: 50,
};

export const gameState: Record<number, GameState> = {}; // represents all active games

export const getGame = (gameId: number): GameState => {
  return gameState[gameId];
};

export const getTeamId = (game: GameState, userId: string): number => {
  return game.playerToTeamId[userId];
};

export const getPlayer = (game: GameState, userId: string): Player => {
  return game.players[userId];
};

export const getTower = (game: GameState, towerId: number): Tower => {
  return game.towers[towerId];
};

export const getMinion = (game: GameState, minionId: number): Minion => {
  return game.minions[minionId];
};

// const ID_1 = "61e4e1bf335ba570cd3f5f6a";
// const TEAM_1 = 0;
// const START_TOWER_ID_1 = 0;
// const START_TOWER_1: Tower = {
//   health: 50,
//   location: { x: 200, y: 375 },
//   size: Size.Small,
//   enemyMinionIds: [],
// };
// const PLAYER_1: Player = {
//   gold: 50,
//   towerIds: [START_TOWER_ID_1],
//   minionIds: [],
//   clickState: ClickState.Tower,
//   towerClickedId: -1,
//   sizeClicked: Size.Small,
//   showInfo: false,
//   inGame: true,
// };
// const ID_2 = "61e7121c513458dd1dbcdc13";
// const TEAM_2 = 1;
// const START_TOWER_ID_2 = 1;
// const START_TOWER_2: Tower = {
//   health: 50,
//   location: { x: 1300, y: 375 },
//   size: Size.Small,
//   enemyMinionIds: [],
// };
// const PLAYER_2: Player = {
//   gold: 50,
//   towerIds: [START_TOWER_ID_2],
//   minionIds: [],
//   clickState: ClickState.Tower,
//   towerClickedId: -1,
//   sizeClicked: Size.Small,
//   showInfo: false,
//   inGame: true,
// };
// export const gameState: Record<number, GameState> = {
//   0: {
//     timer: new Date(),
//     winnerId: null,
//     towers: { [START_TOWER_ID_1]: START_TOWER_1, [START_TOWER_ID_2]: START_TOWER_2 },
//     maxTowerId: 1,
//     minions: {},
//     maxMinionId: 0,
//     players: { [ID_1]: PLAYER_1, [ID_2]: PLAYER_2 },
//     playerToTeamId: { [ID_1]: TEAM_1, [ID_2]: TEAM_2 },
//   },
// };
// const gameOfPlayer: Record<string, number> = new Map(); // TODO map player id to game id

// export const getGameOfPlayer = (userId: string): GameState => {
//   const gameId = gameOfPlayer.get(userId) ?? assert.fail();
//   return gameState.get(gameId) ?? assert.fail();
// };
