import React, { useState, useEffect } from "react";
import { Link } from "@reach/router";
import "../../utilities.css";
import "./MapPanel.css";
import GameMapModel, { GameMap } from "../../../../server/models/Map";

type MapPanelProps = {
  maps: GameMap[];
  gameMapId: string;
  onClickGameMap: (id: string, name: string) => void;
};

const MapPanel = (props: MapPanelProps) => {
  return (
    <div className="GamePanel-body">
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
  );
};

export default MapPanel;
