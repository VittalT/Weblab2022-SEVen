import React, { useState, useEffect } from "react";
import { Link } from "@reach/router";
import "../../utilities.css";
import "./MapPanel.css";
import GameMapModel, { GameMap } from "../../../../server/models/Map";
import { canvasDimensions, canvasScaleFactors } from "../../../../shared/constants";
import assert from "assert";
import { drawMapPreview } from "../../canvasManager";
// import { drawCreateCanvas }

type MapPanelProps = {
  maps: GameMap[];
  gameMapId: string;
  isHost: boolean;
  onClickGameMap: (id: string, name: string) => void;
};

const MapPanel = (props: MapPanelProps) => {
  const scaleFactor = canvasScaleFactors.mapPreview;
  const mapPreviewDimensions = {
    width: canvasDimensions.width * scaleFactor,
    height: canvasDimensions.height * scaleFactor,
  };

  useEffect(() => {
    drawMapPreview(props.gameMapId);
  }, [props.gameMapId]);

  return (
    <div className="u-flexColumn">
      {props.isHost ? (
        <div className="u-flexRow">
          {props.maps.map((gameMap: GameMap, i) => (
            <button
              className={`GamePanel-button ${
                gameMap._id === props.gameMapId
                  ? "MapPanel-button_selected"
                  : "MapPanel-button_not_selected"
              }`}
              key={i}
              onClick={() => props.onClickGameMap(gameMap._id, gameMap.name)}
            >
              <p className="GamePanel-text"> {gameMap.name} </p>
            </button>
          ))}
        </div>
      ) : (
        <></>
      )}
      <canvas
        id="preview-canvas"
        width={mapPreviewDimensions.width}
        height={mapPreviewDimensions.height}
      />
    </div>
  );
};

export default MapPanel;
