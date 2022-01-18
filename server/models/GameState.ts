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
export type TowerInfo = {
  health: number;
  healthRegenRate: number;
  goldRate: number;
  cost: number;
  minAdjBuildRadius: number;
  maxAdjBuildRadius: number;
  hitRadius: number;
};

export type MinionInfo = {
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

export const towerInfo: Map<Size, TowerInfo> = new Map<Size, TowerInfo>();
export const minionInfo: Map<Size, MinionInfo> = new Map<Size, MinionInfo>();

export const gameState: Map<number, GameState> = new Map<number, GameState>(); // represents all active games
const gameOfPlayer: Map<string, number> = new Map(); // TODO map player id to game id

export const getGameOfPlayer = (userId: string): GameState => {
  const gameId = gameOfPlayer.get(userId) ?? assert.fail();
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
