import assert from "assert";
import Point from "../../shared/Point";
import Minion from "../../shared/Minion";
import Tower from "../../shared/Tower";
import {
  towerConstants,
  minionConstants,
  GoldConstants,
  canvasScaleFactors,
} from "../../shared/constants";
import { GameUpdateData } from "../../shared/types";
import { get } from "./utilities";
import GameMapModel, { GameMap } from "../../server/models/Map";

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
  initials: string,
  scaleFactor: number
) => {
  const drawLoc = tower.location.scale(scaleFactor);
  const towerRadius = towerConstants[tower.size].hitRadius * scaleFactor;

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

const drawMinion = (
  context: CanvasRenderingContext2D,
  minion: Minion,
  teamId: number,
  scaleFactor: number
) => {
  const drawLoc = minion.location.scale(scaleFactor);
  const minionRadius = minionConstants[minion.size].boundingRadius * scaleFactor;

  // draw triangle
  const color = colors[teamId];
  fillTriangle(context, drawLoc, minionRadius, minion.direction, color);
};

const drawGoldMine = (
  context: CanvasRenderingContext2D,
  goldMineLoc: Point,
  scaleFactor: number
) => {
  const drawLoc = goldMineLoc.scale(scaleFactor);
  const goldRadius = GoldConstants.realRadius * scaleFactor;

  // draw circle
  const color = "#FFD700"; // gold
  fillCircle(context, drawLoc, goldRadius, color);
};

const drawTimer = (context: CanvasRenderingContext2D, numMilliSeconds: number) => {
  const rawSeconds = Math.round(numMilliSeconds / 1000);
  const numMinutes = Math.floor(rawSeconds / 60);
  const numSeconds = rawSeconds - numMinutes * 60;
  let numSecondDisplay = numSeconds.toString();
  if (numSecondDisplay.length === 1) {
    numSecondDisplay = "0" + numSecondDisplay;
  }
  const displayString = numMinutes.toString() + ":" + numSecondDisplay;
  context.font = "25px serif";
  context.textAlign = "center";
  context.fillStyle = "black";
  context.fillText(displayString, 800, 35);
};

/** main draw */
export const drawCanvas = (gameUpdateData: GameUpdateData) => {
  // get the canvas element
  console.log(gameUpdateData);
  const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
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

  const scaleFactor = canvasScaleFactors.game;

  // display all towers, minions, and gold
  for (const [userId, player] of Object.entries(gameUpdateData.players)) {
    const teamId = gameUpdateData.playerToTeamId[userId];
    for (const minionId of player.minionIds) {
      const minion = gameUpdateData.minions[minionId];
      drawMinion(context, minion, teamId, scaleFactor);
    }
  }
  for (const goldMineLoc of gameUpdateData.goldMineLocs) {
    drawGoldMine(context, goldMineLoc, scaleFactor);
  }

  for (const [userId, player] of Object.entries(gameUpdateData.players)) {
    const teamId = gameUpdateData.playerToTeamId[userId];
    for (const towerId of player.towerIds) {
      const tower = gameUpdateData.towers[towerId];
      drawTower(context, tower, teamId, getInitials(userId), scaleFactor);
    }
  }

  drawTimer(context, gameUpdateData.time);
};

export const drawMapPreview = async (gameMapId: string) => {
  // get the canvas element
  const canvas = document.getElementById("preview-canvas") as HTMLCanvasElement;
  if (!canvas) return;
  const context = canvas.getContext("2d") ?? assert.fail();

  // clear the canvas to white
  context.fillStyle = "#d4d4d4";
  context.fillRect(0, 0, canvas.width, canvas.height);

  const scaleFactor = canvasScaleFactors.mapPreview;

  const data = await get("/api/getGameMapFromId", {
    gameMapId: gameMapId,
  });
  if (data.successful) {
    const map = data.gameMap;
    const goldMines = map.gold_mines;
    for (const goldMine of goldMines) {
      const goldMineLoc = new Point(goldMine.x, goldMine.y);
      drawGoldMine(context, goldMineLoc, scaleFactor);
    }
  }
};
