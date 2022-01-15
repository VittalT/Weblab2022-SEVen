import { couldStartTrivia, formatDiagnosticsWithColorAndContext } from "typescript";

/** helper enums */
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

/** constants */
type TowerInfo = {
  health: number;
  healthRegenRate: number;
  goldRate: number;
  cost: number;
  minAdjBuildRadius: number;
  maxAdjBuildRadius: number;
  hitRadius: number;
};
const towerInfo: Map<Size, TowerInfo> = new Map<Size, TowerInfo>();

type minionInfo = {
  damageRate: number;
  cost: number;
  speed: number;
};
const minionInfo: Map<Size, minionInfo> = new Map<Size, minionInfo>();

type Point = {
  x: number;
  y: number;
};

/** game state */
type Tower = {
  health: number;
  location: Point;
  size: Size;
};

type Minion = {
  location: Point;
  targetLocation: Point;
  direction: number;
  size: Size;
  targetTower: string | null; // id
};

type Player = {
  gold: number;
  towers: Array<Tower>;
  minions: Array<Minion>;
  clickState: ClickState;
  towerClicked: string; // id
  showInfo: boolean;
  inGame: boolean;
};

type Game = {
  timer: Date;
  winner: string | null;
  players: Map<string, Player>;
};

const gameState: Map<string, Game> = new Map<string, Game>();
// represents all active games

/** game logic */

const gameOfPlayer = (user_id: string): string => {
  return "";
};

const getPlayer = (user_id: string): Player => {
  const game_id = gameOfPlayer(user_id);
  return gameState.get(game_id).players.get(user_id);
};

const toggleInfo = (user_id: string) => {
  const player = getPlayer(user_id);
  player.showInfo = !player.showInfo;
};

const distance = (x1: number, y1: number, x2: number, y2: number): number => {
  return Math.pow(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2), 0.5);
};

const closeEnough = (user_id: string, x: number, y: number, maxDist: number): boolean => {
  const player = getPlayer(user_id);
  for (const tower of player.towers) {
    if (distance(tower.location.x, tower.location.y, x, y) <= maxDist) {
      return true;
    }
  }
  return false;
};

const farEnough = (user_id: string, x: number, y: number, minDist: number): boolean => {
  const player = getPlayer(user_id);
  for (const tower of player.towers) {
    if (distance(tower.location.x, tower.location.y, x, y) < minDist) {
      return false;
    }
  }
  return true;
};

const buildTower = (user_id: string, towerSize: Size, x: number, y: number) => {
  const player = getPlayer(user_id);
  const towerSizeInfo = towerInfo.get(towerSize);
  if (
    towerSizeInfo.cost <= player.gold &&
    closeEnough(user_id, x, y, towerSizeInfo.maxAdjBuildRadius) &&
    farEnough(user_id, x, y, towerSizeInfo.minAdjBuildRadius)
  ) {
    player.gold -= towerSizeInfo.cost;
    const newTower: Tower = {
      health: towerSizeInfo.health,
      location: { x, y },
      size: towerSize,
    };
    player.towers.push(newTower);
  }
};

const destroyTower = (user_id: string, towerIndex: number) => {
  const player = getPlayer(user_id);
  player.towers.splice(towerIndex, 1);
  // assign remaining enemy minions to a new tower
};

const angle = (loc1, loc2): number => {
  return Math.atan2(loc2.y, loc2.x) - Math.atan2(loc1.y, loc1.x);
};

const addMinion = (
  user_id: string,
  minionSize: Size,
  allyTowerLoc: Point,
  enemyTowerLoc: Point
) => {
  const player = getPlayer(user_id);
  const minionSizeInfo = minionInfo.get(minionSize);
  if (minionSizeInfo.cost <= player.gold) {
    player.gold -= minionSizeInfo.cost;
    const newMinion: Minion = {
      location: allyTowerLoc,
      targetLocation: enemyTowerLoc,
      direction: angle(allyTowerLoc, enemyTowerLoc),
      size: minionSize,
      targetTower: "0",
    };
    player.minions.push(newMinion);
  }
};

const destroyMinion = (user_id: string, minionIndex: number) => {
  const player = getPlayer(user_id);
  player.minions.splice(minionIndex, 1);
};

const handleBoardClick = (user_id: string, x: number, y: number) => {
  const game_id = gameOfPlayer(user_id);
  gameState.get(game_id).players.get(user_id).clickState = click;
  gameState.get(game_id).players.get(user_id).towerClicked = towerClickedId;
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
