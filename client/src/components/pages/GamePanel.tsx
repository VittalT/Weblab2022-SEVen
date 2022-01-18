import React, { useState, useEffect } from "react";

import "../../utilities.css";
import "../../input";
import "./Game.css";
import { socket, clickGamePanelButton } from "../../client-socket";
import { drawCanvas } from "../../canvasManager";
import { Router, RouteComponentProps } from "@reach/router";
import {
  ClickState,
  Size,
  MinionConstants,
  TowerConstants,
  GameState,
} from "../../../../server/models/GameState";
import Gold from "./Gold";
import assert from "assert";
import { post } from "../../utilities";

type GameProps = {
  width: number;
  height: number;
  userId: string;
  gameId: number;
  gold: number;
  towerConstants: TowerConstants;
  minionConstants: MinionConstants;
};

const GamePanel = (props: GameProps) => {
  useEffect(() => {
    //
  }, []);

  const towerSizes = [Size.Small, Size.Medium, Size.Large];
  const minionSizes = [Size.Small, Size.Medium, Size.Large];

  return (
    <>
      <div className="Game-body">
        <Gold amount={props.gold} />
        {towerSizes.map((size, i) => (
          <button
            key={i}
            onClick={() => clickGamePanelButton(props.gameId, ClickState.Tower, size)}
          >
            {size} Tower
          </button>
        ))}
        {minionSizes.map((size, i) => (
          <button
            key={i}
            onClick={() => clickGamePanelButton(props.gameId, ClickState.Minion, size)}
          >
            {size} Minion
          </button>
        ))}
        <button
          onClick={() => clickGamePanelButton(props.gameId, ClickState.Explosion, Size.Small)}
        >
          Explosion
        </button>
      </div>
    </>
  );
};

export default GamePanel;
