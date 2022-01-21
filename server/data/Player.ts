export class Player {
  public gold: number;
  public towerIds: Array<number>;
  public minionIds: Array<number>;
  public clickState: ClickState; // don't emit
  public towerClickedId: number; // don't emit
  public sizeClicked: Size;
  public showInfo: boolean;
  public inGame: boolean;
}
