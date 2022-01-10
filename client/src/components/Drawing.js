/**
 * Draw a dot with a black outline with the given radius
 *
 * @param canvas canvas to draw on
 * @param radius the radius of the dot
 * @param x x position of center of the dot
 * @param y y position of center of the dot
 */
export const drawTower = (canvas, x, y, radius) => {
  const context = canvas.getContext("2d");
  context.save();

  context.beginPath();
  context.arc(x, y, radius, 0, 2 * Math.PI);
  context.closePath();

  context.strokeStyle = "black";
  context.stroke();
  context.restore();
};
