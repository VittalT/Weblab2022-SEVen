export class Tower {
  public health: number;
  public location: Point;
  public size: Size;
  public enemyMinionIds: Array<number>; // don't emit

  public constructor(health: number, location: Point, size: Size, enemyMinionIds: Array<number>) {
    this.health = health;
    this.location = location;
    this.size = size;
    this.enemyMinionIds = enemyMinionIds;
  }
}
