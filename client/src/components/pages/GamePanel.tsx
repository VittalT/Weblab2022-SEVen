import React, { useState, useEffect } from "react";

import "../../utilities.css";
import "../../input";
import "./GamePanel.css";
import { socket, clickGamePanelButton } from "../../client-socket";
import { drawCanvas } from "../../canvasManager";
import { Router, RouteComponentProps } from "@reach/router";
import Gold from "./Gold";
import assert from "assert";
import { post } from "../../utilities";
import { ClickState, Size } from "../../../../shared/enums";

type GameProps = {
  width: number;
  height: number;
  userId: string;
  gameCode: string;
  gold: number;
  //   towerConstants: TowerConstants;
  //   minionConstants: MinionConstants;
};

const GamePanel = (props: GameProps) => {
  const towerSizes = [Size.Small, Size.Medium, Size.Large];
  const minionSizes = [Size.Small, Size.Medium, Size.Large];

  return (
    <>
      <div className="GamePanel-body">
        <Gold amount={Math.round(props.gold)} />
        {towerSizes.map((size, i) => (
          <button
            className="GamePanel-button"
            key={i}
            onClick={() => clickGamePanelButton(props.gameCode, ClickState.Tower, size)}
          >
            <p className="GamePanel-text"> {size} Tower </p>
          </button>
        ))}
        {minionSizes.map((size, i) => (
          <button
            className="GamePanel-button"
            key={i}
            onClick={() => clickGamePanelButton(props.gameCode, ClickState.Minion, size)}
          >
            <p className="GamePanel-text"> {size} Minion </p>
          </button>
        ))}
        <button
          className="GamePanel-button"
          onClick={() => clickGamePanelButton(props.gameCode, ClickState.Explosion, Size.Small)}
        >
          <p className="GamePanel-text"> Explosion </p>
        </button>
      </div>
    </>
  );
};

export default GamePanel;
