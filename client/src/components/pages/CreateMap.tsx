import React, { useState, useEffect } from "react";

import "../../utilities.css";
import "./CreateMap.css";

import NavigationButton from "../modules/NavigationButton";
import BackButton from "../modules/BackButton";

import { Router, RouteComponentProps } from "@reach/router";
import { drawCanvas } from "../../canvasManager";
import { post } from "../../utilities";

type CreateMapProps = RouteComponentProps & {
  userId: string;
};

const CreateMap = (props: CreateMapProps) => {
  const [addGoldToggled, setAddGoldToggled] = useState(false);
  const [mapName, setMapName] = useState("New Map");
  const [creatorName, setCreatorName] = useState(props.userId);
  const [numPlayers, setNumPlayers] = useState(2);
  const [goldMines, setGoldMines] = useState([]);
  const [towers, setTowers] = useState([]);

  const canvasWidth = 800;
  const canvasHeight = 800;

  const handleClick = () => {};

  const toggleAddGold = () => {
    setAddGoldToggled(!addGoldToggled);
  };

  const handleCreatorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCreatorName(event.target.value);
  };

  const handleMapNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMapName(event.target.value);
  };

  const handleSaveMap = () => {
    const mapInfo = {
      name: mapName,
      creator_id: props.userId,
      num_players: numPlayers,
      gold_mines: goldMines,
      towers: towers,
      created: Date.now(),
    };
    post("/api/maps", mapInfo);
  };

  return (
    <>
      <BackButton destPath="/homescreen" />
      <div className="Creation-titleContainer">
        <h1 className="Creation-gameTitle u-textCenter">Minion Battle</h1>
      </div>
      <div className="u-flex">
        <div className="Creation-subContainer">
          <canvas
            id="create-canvas"
            width={canvasWidth}
            height={canvasHeight}
            onClick={handleClick}
          />
          <button className="Creation-button u-pointer" onClick={toggleAddGold}>
            Add gold
          </button>
        </div>
        <div className="Creation-subContainer">
          <div>
            <input
              type="text"
              placeholder={props.userId}
              value={creatorName}
              onChange={handleCreatorChange}
              className="Creation-input"
            />
            <input
              type="text"
              placeholder="New Map"
              value={mapName}
              onChange={handleMapNameChange}
              className="Creation-input"
            />
            <button
              type="submit"
              className="Creation-button u-pointer"
              value="Save Map"
              onClick={handleSaveMap}
            >
              Save Map
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateMap;
