import React, { useState, useEffect } from "react";

import "../../utilities.css";
import "../../input";
import "./GameMap.css";
import { socket, clickGameMap } from "../../client-socket";
import { drawCanvas } from "../../canvasManager";
import { Router, RouteComponentProps } from "@reach/router";
import assert from "assert";
import { moveCursor } from "../../client-socket";

type GameMapProps = {
  width: number;
  height: number;
  gameCode: string;
  userId: string;
};

const GameMap = (props: GameMapProps) => {
  useEffect(() => {
    const canvas = document.getElementById("game-canvas") ?? assert.fail();
    canvas.addEventListener("click", (event: MouseEvent) => {
      // console.log(`A ${event.offsetX} ${event.offsetY}`);
      clickGameMap(props.gameCode, event.offsetX, event.offsetY, props.userId);
    });
  }, [props.gameCode]);

  useEffect(() => {
    const canvas = document.getElementById("game-canvas") ?? assert.fail();
    const handleMouseMove = (event: MouseEvent) => {
      moveCursor(props.gameCode, event.offsetX, event.offsetY, props.userId);
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    return () => {
      canvas.addEventListener("mousemove", handleMouseMove);
    };
  }, [props.gameCode]);

  return (
    <>
      <canvas
        id="game-canvas"
        className="GameMap-canvas"
        width={props.width}
        height={props.height}
      />
    </>
  );
};

export default GameMap;
