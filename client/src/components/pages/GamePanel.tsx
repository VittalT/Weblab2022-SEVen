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
import { towerConstants, minionConstants, explosionConstants } from "../../../../shared/constants";

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
          <div
            className="GamePanel-button GamePanel-towerButton"
            key={i}
            onClick={() => clickGamePanelButton(props.gameCode, ClickState.Tower, size)}
          >
            <span id="content1">{"" + size + " Tower"}</span>
            <span id="content2">
              {towerConstants[size].cost +
                " G | " +
                towerConstants[size].health +
                " H | " +
                towerConstants[size].goldRate * 1000 +
                " G/S"}
            </span>
          </div>
        ))}
        {minionSizes.map((size, i) => (
          <div
            className="GamePanel-button GamePanel-minionButton"
            key={i}
            onClick={() => clickGamePanelButton(props.gameCode, ClickState.Minion, size)}
          >
            <span id="content1">{"" + size + " Minion"}</span>
            <span id="content2">
              {minionConstants[size].cost +
                " G | " +
                minionConstants[size].damageRate * 1000 +
                " D/S"}
            </span>
          </div>
        ))}
        <div
          className="GamePanel-button GamePanel-explosionButton"
          onClick={() => clickGamePanelButton(props.gameCode, ClickState.Explosion, Size.Small)}
        >
          <span id="content1">{"Explosion"}</span>
          <span id="content2">{explosionConstants.cost + " G"}</span>
        </div>
      </div>
    </>
  );
};

export default GamePanel;
