import React, { useState, useEffect } from "react";
import "../../utilities.css";
import { drawTower } from "../Drawing.js";
import "./Game.css";

/**
 * Define the "App" component
 */
const Game = () => {
  useEffect(() => {
    const canvas = document.getElementById("canvas");
    canvas.addEventListener("click", (event) => {
      drawTower(canvas, event.offsetX, event.offsetY, 30);
    });
  }, []);
  return <canvas id="canvas" width="512" height="512" className="Game-canvas"></canvas>;
};

export default Game;
