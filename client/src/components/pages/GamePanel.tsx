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
import Switch from "@material-ui/core/Switch";

type GameProps = {
  width: number;
  height: number;
  userId: string;
  gameCode: string;
  gold: number;
  //   towerConstants: TowerConstants;
  //   minionConstants: MinionConstants;
};

const towerSizes = [Size.Small, Size.Medium, Size.Large];
const minionSizes = [Size.Small, Size.Medium, Size.Large];

const GamePanel = (props: GameProps) => {
  const [showInfo, setShowInfo] = useState(true);

  const toggleShowInfo = () => {
    setShowInfo(!showInfo);
  };

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
            {showInfo ? (
              <div>
                <span className="GamePanel-buttonTitle">{"" + size + " Tower"}</span>
                <span className="GamePanel-buttonInfo">
                  {towerConstants[size].cost +
                    " G | " +
                    towerConstants[size].health +
                    " H | " +
                    towerConstants[size].goldRate * 1000 +
                    " G/S"}
                </span>
              </div>
            ) : (
              <span className="GamePanel-buttonTitle GamePanel-hideInfo">
                {"" + size + " Tower"}
              </span>
            )}
          </div>
        ))}
        {minionSizes.map((size, i) => (
          <div
            className="GamePanel-button GamePanel-minionButton"
            key={i}
            onClick={() => clickGamePanelButton(props.gameCode, ClickState.Minion, size)}
          >
            {showInfo ? (
              <div>
                <span className="GamePanel-buttonTitle">{"" + size + " Minion"}</span>
                <span className="GamePanel-buttonInfo">
                  {minionConstants[size].cost +
                    " G | " +
                    minionConstants[size].damageRate * 1000 +
                    " D/S"}
                </span>
              </div>
            ) : (
              <div className="GamePanel-buttonTitle GamePanel-hideInfo">
                {"" + size + " Minion"}
              </div>
            )}
          </div>
        ))}
        <div
          className="GamePanel-button GamePanel-explosionButton"
          onClick={() => clickGamePanelButton(props.gameCode, ClickState.Explosion, Size.Small)}
        >
          {showInfo ? (
            <div>
              <span className="GamePanel-buttonTitle">{"Explosion"}</span>
              <span className="GamePanel-buttonInfo">{explosionConstants.cost + " G"}</span>
            </div>
          ) : (
            <span className="GamePanel-buttonTitle GamePanel-hideInfo">{"Explosion"}</span>
          )}
        </div>
        <div className="GamePanel-button GamePanel-infoButton u-flexColumn">
          <div>Info</div>
          <div className="u-flexRow u-flex-alignCenter">
            <p>Hide</p> <Switch defaultChecked onClick={toggleShowInfo} /> <p>Show</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default GamePanel;
