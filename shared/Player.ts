import { ClickState, Size } from "./enums";

class Player {
  public gold: number;
  public towerIds: Array<number>;
  public minionIds: Array<number>;
  public clickState: ClickState; // don't emit
  public towerClickedId: number; // don't emit
  public sizeClicked: Size;
  public showInfo: boolean;
  public inGame: boolean;

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
  }
}

export default Player;
