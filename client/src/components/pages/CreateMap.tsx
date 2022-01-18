import React, { useState, useEffect } from "react";

import "../../utilities.css";
import "./CreateMap.css";

import BackButton from "../modules/BackButton";
import { Point } from "../../../../server/models/GameState";

import { Router, RouteComponentProps } from "@reach/router";
//import { drawCreateCanvas } from "../../canvasManager";
import { post } from "../../utilities";
import { isNonNullChain } from "typescript";
import assert from "assert";

type CreateMapProps = RouteComponentProps & {
  userId: string;
};

const CreateMap = (props: CreateMapProps) => {
  const [addGoldToggled, setAddGoldToggled] = useState<boolean>(false);
  const [mapName, setMapName] = useState<string>("New Map");
  const [creatorName, setCreatorName] = useState<string>(props.userId);
  const [numPlayers, setNumPlayers] = useState<number>(2);
  const [goldMines, setGoldMines] = useState<Point[]>([]);
  const [towers, setTowers] = useState<Point[]>([]);

  // let canvas = document.getElementById("create-canvas") ?? assert.fail("missing canvas");

  const canvasWidth = 200;
  const canvasHeight = 200;

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
    post("/api/createMap", mapInfo).then(() => {
      console.log("Added map");
    });
  };

  return (
    <>
      <div className="Creation-titleContainer">
        <h1 className="Creation-gameTitle u-textCenter">Minion Battle</h1>
      </div>
      <div className="u-flex">
        <div className="Creation-subContainer">
          <canvas id="create-canvas" width={canvasWidth} height={canvasHeight} />
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
      <BackButton text="BACK" destPath="/" />
    </>
  );
};

export default CreateMap;
