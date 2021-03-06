import { playerConstants } from "./constants";
import { ClickState, Size } from "./enums";
import Point from "./Point";
import Tower from "./Tower";

class Player {
  public gold: number;
  public towerIds: Array<number>;
  public minionIds: Array<number>;
  public clickState: ClickState; // don't emit
  public towerClickedId: number; // don't emit
  public sizeClicked: Size;
  public showInfo: boolean;
  public inGame: boolean;
  public lastTowerPlacedTime: number;
  public tombstones: Array<{ time: number; tower: Tower }>;
  public cursorLoc: Point;
  public canPlaceTower: boolean;
  public canExplode: boolean;
  public hoverAllyTower: Tower;
  public prevRating: number;
  public rating: number;

  public constructor(
    gold: number,
    towerIds: Array<number>,
    minionIds: Array<number>,
    clickState: ClickState,
    towerClickedId: number,
    sizeClicked: Size,
    showInfo: boolean,
    inGame: boolean
  ) {
    this.gold = gold;
    this.towerIds = towerIds;
    this.minionIds = minionIds;
    this.clickState = clickState;
    this.towerClickedId = towerClickedId;
    this.sizeClicked = sizeClicked;
    this.showInfo = showInfo;
    this.inGame = inGame;
    this.lastTowerPlacedTime = Date.now() - playerConstants.towerCooldown;
    this.tombstones = [];
    this.cursorLoc = new Point(-1000, -1000);
    this.canPlaceTower = false;
    this.canExplode = false;
    this.hoverAllyTower = new Tower(-1, new Point(-1000, -1000), Size.Small, []);
    this.prevRating = 1200;
    this.rating = 1200;
  }
}

export default Player;
