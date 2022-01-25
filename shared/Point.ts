class Point {
  public x: number;
  public y: number;

  public constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public toString() {
    return `(${this.x}, ${this.y})`;
  }

  public angleTo(other: Point): number {
    return Math.atan2(other.y - this.y, other.x - this.x);
  }

  public distanceTo(other: Point): number {
    return Math.pow(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2), 0.5);
  }

  public copy() {
    return new Point(this.x, this.y);
  }

  public sum(other: Point) {
    return new Point(this.x + other.x, this.y + other.y);
  }

  public scaleBy(factor: number) {
    return new Point(this.x * factor, this.y * factor);
  }
}

export default Point;
