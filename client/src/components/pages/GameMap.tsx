import React, { useState, useEffect } from "react";

import "../../utilities.css";
import "../../input";
import "./GameMap.css";
import { socket, clickGameMap } from "../../client-socket";
import { drawCanvas } from "../../canvasManager";
import { Router, RouteComponentProps } from "@reach/router";
import assert from "assert";

type GameMapProps = {
  width: number;
  height: number;
  gameCode: string;
};

const GameMap = (props: GameMapProps) => {
  useEffect(() => {
    const canvas = document.getElementById("game-canvas") ?? assert.fail();
    canvas.addEventListener("click", (event: MouseEvent) => {
      // console.log(`A ${event.offsetX} ${event.offsetY}`);
      clickGameMap(props.gameCode, event.offsetX, event.offsetY);
    });
  }, []);

  return (
    <>
      <canvas id="game-canvas" width={props.width} height={props.height} />
    </>
  );
};

export default GameMap;
