import assert from "assert";
/** helper enums */
export enum ClickState {
  Tower,
  Minion,
  MinionFirstTower,
  Explosion,
}

export enum Size {
  Small,
  Medium,
  Large,
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
};

export type Point = {
  x: number;
  y: number;
};

/** game state */
export type Tower = {
  health: number;
  location: Point;
  size: Size;
  enemyMinionIds: Set<number>; // don't emit
};

export type Minion = {
  location: Point;
  targetLocation: Point; // don't emit
  direction: number;
  size: Size;
  targetTowerId: number | null; // don't emit
  reachedTarget: boolean; // don't emit
};

export type Player = {
  gold: number;
  towerIds: Set<number>;
  minionIds: Set<number>;
  clickState: ClickState; // don't emit
  towerClickedId: number; // don't emit
  sizeClicked: Size;
  showInfo: boolean;
  inGame: boolean;
};

export type GameState = {
  timer: Date;
  winnerId: string | null;
  towers: Map<number, Tower>; // id to tower
  maxTowerId: number;
  minions: Map<number, Minion>; // id to minion
  maxMinionId: number;
  players: Map<string, Player>; // id to player
  playerToTeamId: Map<string, number>; // playerId to teamId
};

export const towerConstants: Map<Size, TowerConstants> = new Map([
  [
    Size.Small,
    {
      health: 50,
      healthRegenRate: 3,
      goldRate: 3,
      cost: 50,
      minAdjBuildRadius: 100,
      maxAdjBuildRadius: 200,
      hitRadius: 50,
    },
  ],
  [
    Size.Medium,
    {
      health: 100,
      healthRegenRate: 5,
      goldRate: 5,
      cost: 100,
      minAdjBuildRadius: 150,
      maxAdjBuildRadius: 300,
      hitRadius: 100,
    },
  ],
  [
    Size.Large,
    {
      health: 200,
      healthRegenRate: 10,
      goldRate: 10,
      cost: 200,
      minAdjBuildRadius: 250,
      maxAdjBuildRadius: 500,
      hitRadius: 200,
    },
  ],
]);
export const minionConstants: Map<Size, MinionConstants> = new Map([
  [
    Size.Small,
    {
      damageRate: 5,
      cost: 10,
      speed: 400,
    },
  ],
  [
    Size.Medium,
    {
      damageRate: 10,
      cost: 25,
      speed: 300,
    },
  ],
  [
    Size.Large,
    {
      damageRate: 20,
      cost: 50,
      speed: 200,
    },
  ],
]);

export const gameState: Map<number, GameState> = new Map<number, GameState>(); // represents all active games
// const gameOfPlayer: Map<string, number> = new Map(); // TODO map player id to game id

// export const getGameOfPlayer = (userId: string): GameState => {
//   const gameId = gameOfPlayer.get(userId) ?? assert.fail();
//   return gameState.get(gameId) ?? assert.fail();
// };

export const getGame = (gameId: number): GameState => {
  return gameState.get(gameId) ?? assert.fail();
};

export const getTeamId = (game: GameState, userId: string): number => {
  return game.playerToTeamId.get(userId) ?? assert.fail();
};

export const getPlayer = (game: GameState, userId: string): Player => {
  return game.players.get(userId) ?? assert.fail();
};

export const getTower = (game: GameState, towerId: number): Tower => {
  return game.towers.get(towerId) ?? assert.fail();
};

export const getMinion = (game: GameState, minionId: number): Minion => {
  return game.minions.get(minionId) ?? assert.fail();
};
