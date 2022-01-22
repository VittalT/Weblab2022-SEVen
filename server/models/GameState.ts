import assert from "assert";

const ID_1 = "61e4e1bf335ba570cd3f5f6a";
const TEAM_1 = 0;
const START_TOWER_ID_1 = 0;
const START_TOWER_1: Tower = {
  health: 50,
  location: new Point(200, 375),
  size: Size.Small,
  enemyMinionIds: [],
};
const PLAYER_1: Player = {
  gold: 50,
  towerIds: [START_TOWER_ID_1],
  minionIds: [],
  clickState: ClickState.Tower,
  towerClickedId: -1,
  sizeClicked: Size.Small,
  showInfo: false,
  inGame: true,
};
const ID_2 = "61e7121c513458dd1dbcdc13";
const TEAM_2 = 1;
const START_TOWER_ID_2 = 1;
const START_TOWER_2: Tower = {
  health: 50,
  location: new Point(1300, 375),
  size: Size.Small,
  enemyMinionIds: [],
};
const PLAYER_2: Player = {
  gold: 50,
  towerIds: [START_TOWER_ID_2],
  minionIds: [],
  clickState: ClickState.Tower,
  towerClickedId: -1,
  sizeClicked: Size.Small,
  showInfo: false,
  inGame: true,
};
export const gameState: Record<number, GameState> = {
  0: {
    timer: new Date(),
    winnerId: null,
    towers: { [START_TOWER_ID_1]: START_TOWER_1, [START_TOWER_ID_2]: START_TOWER_2 },
    maxTowerId: 1,
    minions: {},
    maxMinionId: 0,
    players: { [ID_1]: PLAYER_1, [ID_2]: PLAYER_2 },
    playerToTeamId: { [ID_1]: TEAM_1, [ID_2]: TEAM_2 },
  },
};
