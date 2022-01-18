import assert from "assert";
import {
  Size,
  Point,
  Tower,
  Minion,
  Player,
  GameState,
  towerInfo,
  minionInfo,
  gameState,
  getTeamId,
  getPlayer,
  getTower,
  getMinion,
} from "../../server/models/GameState";

let canvas: HTMLCanvasElement;
/** utils */

// converts a coordinate in a normal X Y plane to canvas coordinates
const convertCoord = (loc: Point): Point => {
  return {
    x: loc.x, // canvas.width / 2 + loc.x,
    y: canvas.height - loc.y, // canvas.height / 2 - loc.y,
  };
};

const colors: Array<string> = [
  "EE6C4D", // orange
  "98C1D9", // light blue
  "08A721", // light green
  "CFD215", // brown-ish yellow
];

// fills a circle at a given x, y canvas coord with radius and color
const fillCircle = (
  context: CanvasRenderingContext2D,
  loc: Point,
  radius: number,
  color: string
) => {
  context.beginPath();
  context.arc(loc.x, loc.y, radius, 0, 2 * Math.PI, false);
  context.fillStyle = color;
  context.fill();
};

type Polar = {
  radius: number;
  angle: number;
};

const polarToCartesian = (point: Polar): Point => {
  return {
    x: point.radius * Math.cos(point.angle),
    y: point.radius * Math.sin(point.angle),
  };
};

// fills a circle at a given x, y canvas coord with radius and color
const fillTriangle = (
  context: CanvasRenderingContext2D,
  loc: Point,
  size: number,
  dir: number,
  color: string
) => {
  context.beginPath();
  const offset1 = polarToCartesian({ radius: size, angle: dir });
  const offset2 = polarToCartesian({ radius: size, angle: dir + (2 * Math.PI) / 3 });
  const offset3 = polarToCartesian({ radius: size, angle: dir - (2 * Math.PI) / 3 });
  context.moveTo(loc.x + offset1.x, loc.y + offset1.y);
  context.lineTo(loc.x + offset2.x, loc.y + offset2.y);
  context.lineTo(loc.x + offset3.x, loc.y + offset3.y);
  context.fillStyle = color;
  context.fill();
};

/** drawing functions */

const drawTower = (context: CanvasRenderingContext2D, tower: Tower, teamId: number) => {
  const drawLoc = convertCoord(tower.location);

  // draw circle
  const color = colors[teamId];
  fillCircle(context, drawLoc, tower.size, color);

  // draw health bar
  context.fillStyle = "green";
  const totalHealth = (towerInfo.get(tower.size) ?? assert.fail()).health;
  const fracHealth = tower.health / totalHealth;
  fillHealthBar(context, drawLoc, tower.size, fracHealth);
};

const fillHealthBar = (
  context: CanvasRenderingContext2D,
  loc: Point,
  size: number,
  fracHealth: number
) => {
  context.fillStyle = "red";
  context.fillRect(loc.x - 0.5 * size, loc.y + 0.25 * size, size, 0.25 * size);

  context.fillStyle = "green";
  context.fillRect(loc.x - 0.5 * size, loc.y + 0.25 * size, fracHealth * size, 0.25 * size);
};

const drawMinion = (context: CanvasRenderingContext2D, minion: Minion, teamId: number) => {
  const drawLoc = convertCoord(minion.location);

  // draw triangle
  const color = colors[teamId];
  fillTriangle(context, drawLoc, minion.size, minion.direction, color);
};

/** main draw */
export const drawCanvas = (gameState: GameState) => {
  // get the canvas element
  canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
  if (!canvas) return;
  const context = canvas.getContext("2d") ?? assert.fail();

  // clear the canvas to white
  context.fillStyle = "white";
  context.fillRect(0, 0, canvas.width, canvas.height);

  // display all towers and minions
  for (const [userId, player] of gameState.players) {
    const teamId = getTeamId(gameState, userId);
    for (const towerId of player.towerIds) {
      const tower = getTower(gameState, towerId);
      drawTower(context, tower, teamId);
    }
    for (const minionId of player.minionIds) {
      const minion = getMinion(gameState, minionId);
      drawMinion(context, minion, teamId);
    }
  }
};
