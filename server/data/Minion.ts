class Minion {
  public location: Point;
  public targetLocation: Point; // don't emit
  public direction: number;
  public size: Size;
  public targetTowerId: number | null; // don't emit
  public reachedTarget: boolean; // don't emit

  public constructor(
    location: Point,
    targetLocation: Point,
    direction: number,
    size: Size,
    targetTowerId: number | null,
    reachedTarget: boolean
  ) {
    this.location = location;
    this.targetLocation = targetLocation;
    this.direction = direction;
    this.size = size;
    this.targetTowerId = targetTowerId;
    this.reachedTarget = reachedTarget;
  }
}
