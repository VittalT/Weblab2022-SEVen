import assert from "assert";
import Point from "../../shared/Point";
import Minion from "../../shared/Minion";
import Tower from "../../shared/Tower";
import { towerConstants, minionConstants, GoldConstants } from "../../shared/constants";
import { GameUpdateData } from "../../shared/types";

let canvas: HTMLCanvasElement;
/** utils */

// converts a coordinate in a normal X Y plane to canvas coordinates
// const convertCoord = (loc: Point): Point => {
//   return {
//     x: loc.x, // canvas.width / 2 + loc.x,
//     y: canvas.height - loc.y, // canvas.height / 2 - loc.y,
//   };
// };

const colors: Array<string> = [
  "#EE6C4D", // orange
  "#98C1D9", // light blue
  "#08A721", // light green
  "#CFD215", // brown-ish yellow
];

// fills a circle at a given x, y canvas coord with radius and color
export const fillCircle = (
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
  return new Point(point.radius * Math.cos(point.angle), point.radius * Math.sin(point.angle));
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

const drawTower = (
  context: CanvasRenderingContext2D,
  tower: Tower,
  teamId: number,
  initials: string
) => {
  const drawLoc = tower.location;
  const towerRadius = towerConstants[tower.size].hitRadius;

  // draw circle
  const color = colors[teamId];
  fillCircle(context, drawLoc, towerRadius, color);

  // draw health bar
  const totalHealth = towerConstants[tower.size].health;
  const fracHealth = tower.health / totalHealth;
  fillHealthBar(context, drawLoc, towerRadius, fracHealth);

  context.font = "18px serif";
  context.textAlign = "center";
  context.fillStyle = "black";
  context.fillText(initials, drawLoc.x, drawLoc.y);
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
  const drawLoc = minion.location;
  const minionRadius = minionConstants[minion.size].boundingRadius;

  // draw triangle
  const color = colors[teamId];
  fillTriangle(context, drawLoc, minionRadius, minion.direction, color);
};

const drawGoldMine = (context: CanvasRenderingContext2D, goldMineLoc: Point) => {
  const drawLoc = goldMineLoc;
  const goldRadius = GoldConstants.realRadius;

  // draw circle
  const color = "#FFD700"; // gold
  fillCircle(context, drawLoc, goldRadius, color);
};

/** main draw */
export const drawCanvas = (gameUpdateData: GameUpdateData) => {
  // get the canvas element
  canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
  if (!canvas) return;
  const context = canvas.getContext("2d") ?? assert.fail();

  // clear the canvas to white
  context.fillStyle = "white";
  context.fillRect(0, 0, canvas.width, canvas.height);

  const idToName = gameUpdateData.idToName;

  const getInitials = (userId: string) => {
    const userName = idToName[userId];
    const splitted = userName.split(" ");
    let initials = "";
    for (const word of splitted) {
      if (word.length > 0) {
        initials += word[0];
      }
    }
    return initials;
  };

  // display all towers, minions, and gold
  for (const [userId, player] of Object.entries(gameUpdateData.players)) {
    const teamId = gameUpdateData.playerToTeamId[userId];
    for (const minionId of player.minionIds) {
      const minion = gameUpdateData.minions[minionId];
      drawMinion(context, minion, teamId);
    }
  }

  for (const [userId, player] of Object.entries(gameUpdateData.players)) {
    const teamId = gameUpdateData.playerToTeamId[userId];
    for (const towerId of player.towerIds) {
      const tower = gameUpdateData.towers[towerId];
      drawTower(context, tower, teamId, getInitials(userId));
    }
  }

  for (const goldMineLoc of gameUpdateData.goldMineLocs) {
    drawGoldMine(context, goldMineLoc);
  }
};
