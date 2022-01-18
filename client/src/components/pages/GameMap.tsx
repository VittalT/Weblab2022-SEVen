import React, { useState, useEffect } from "react";

import "../../utilities.css";
import "../../input";
import "./Game.css";
import { socket, clickGameMap } from "../../client-socket";
import { drawCanvas } from "../../canvasManager";
import { Router, RouteComponentProps } from "@reach/router";
import {
  Size,
  MinionConstants,
  TowerConstants,
  GameState,
} from "../../../../server/models/GameState";
import assert from "assert";

type GameMapProps = {
  width: number;
  height: number;
  gameId: number;
};

const GameMap = (props: GameMapProps) => {
  const canvas: HTMLCanvasElement = (
    <canvas id="game-canvas" width={props.width} height={props.height} />
  ) as unknown as HTMLCanvasElement;

  useEffect(() => {
    canvas.addEventListener("click", (event: MouseEvent) => {
      // replace ⭐ with O or circle emoji to draw a blank
      clickGameMap(props.gameId, event.offsetX, event.offsetY);
    });
  }, []);

  return <div>{canvas}</div>;
};

export default GameMap;
