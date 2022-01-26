import assert from "assert";
import { fillCircle } from "./canvasManager";
import { canvasScaleFactors, GoldConstants } from "../../shared/constants";
import Point from "../../shared/Point";

let scaleFactor = canvasScaleFactors.createMap;
let goldColor: string = "#FFFF00";

export const drawGoldMine = (coord: Point) => {
  const canvas = document.getElementById("create-canvas") as HTMLCanvasElement;
  if (!canvas) return;
  const context = canvas.getContext("2d") ?? assert.fail();
  const goldDrawRadius = GoldConstants.realRadius * scaleFactor;
  fillCircle(context, coord, goldDrawRadius, goldColor);
};

export const drawCreateCanvas = () => {
  const canvas = document.getElementById("create-canvas") as HTMLCanvasElement;
  if (!canvas) return;
  const context = canvas.getContext("2d") ?? assert.fail();

  context.fillStyle = "#C4C4C4";
  context.fillRect(0, 0, canvas.width, canvas.height);
};
