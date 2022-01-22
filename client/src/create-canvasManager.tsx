import assert from "assert";
import { fillCircle } from "./canvasManager";

let canvas: HTMLCanvasElement;
let scaleFactor: number = 2;

let goldDrawRadius: number = GoldConstants.realRadius / 2;
let goldColor: string = "#FFFF00";

export const drawGoldMine = (coord: Point) => {
  canvas = document.getElementById("create-canvas") as HTMLCanvasElement;
  if (!canvas) return;
  console.log("drawing");
  const context = canvas.getContext("2d") ?? assert.fail();
  fillCircle(context, coord, goldDrawRadius / scaleFactor, goldColor);
};

export const drawCreateCanvas = () => {
  canvas = document.getElementById("create-canvas") as HTMLCanvasElement;
  if (!canvas) return;
  const context = canvas.getContext("2d") ?? assert.fail();

  context.fillStyle = "#C4C4C4";
  context.fillRect(0, 0, canvas.width, canvas.height);
};
