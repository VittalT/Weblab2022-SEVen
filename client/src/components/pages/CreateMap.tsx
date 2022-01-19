import React, { useState, useEffect } from "react";

import "../../utilities.css";
import "./CreateMap.css";

import BackButton from "../modules/BackButton";
import { Point, GoldConstants, towerConstants } from "../../../../server/models/GameState";

import { Router, RouteComponentProps } from "@reach/router";
//import { drawCreateCanvas } from "../../canvasManager";
import { post } from "../../utilities";
import { isNonNullChain } from "typescript";
import assert from "assert";
import { drawCreateCanvas, drawGoldMine } from "../../create-canvasManager";
import { off } from "process";

type CreateMapProps = RouteComponentProps & {
  userId: string;
};

const CreateMap = (props: CreateMapProps) => {
  const [mapName, setMapName] = useState<string>("");
  const [creatorName, setCreatorName] = useState<string>(props.userId);
  const [numPlayers, setNumPlayers] = useState<number>(2);
  const [goldMines, setGoldMines] = useState<Point[]>([]);
  const [towers, setTowers] = useState<Point[]>([]);

  const scaleFactor = 2;
  const realWidth = 1600;
  const realHeight = 750;
  const canvasWidth = realWidth / scaleFactor;
  const canvasHeight = realHeight / scaleFactor;

  let canvas: HTMLElement;

  const getDistance = (a: Point, b: Point) => {
    return Math.pow(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2), 0.5);
  };

  useEffect(() => {
    canvas = document.getElementById("create-canvas") ?? assert.fail();
    drawCreateCanvas();
    console.log("init");
  }, []);

  useEffect(() => {
    canvas = document.getElementById("create-canvas") ?? assert.fail();
    const handleClick = (event: MouseEvent) => {
      console.log("click");
      let officialCoordFirst: Point = {
        x: scaleFactor * event.offsetX,
        y: scaleFactor * event.offsetY,
      };
      let officialCoordSecond: Point = {
        x: realWidth - scaleFactor * event.offsetX,
        y: realHeight - scaleFactor * event.offsetY,
      };
      if (getDistance(officialCoordFirst, officialCoordSecond) < 2 * GoldConstants.realRadius)
        return;
      for (let i = 0; i < goldMines.length; i++) {
        if (getDistance(officialCoordFirst, goldMines[i]) < 2 * GoldConstants.realRadius) return;
      }
      for (let i = 0; i < towers.length; i++) {
        if (
          getDistance(officialCoordFirst, towers[i]) <
          GoldConstants.realRadius + towerConstants.Medium.minAdjBuildRadius
        )
          return;
      }
      setGoldMines([...goldMines, officialCoordFirst, officialCoordSecond]);
      let drawCoordFirst: Point = { x: event.offsetX, y: event.offsetY };
      let drawCoordSecond: Point = {
        x: canvasWidth - event.offsetX,
        y: canvasHeight - event.offsetY,
      };
      drawGoldMine(drawCoordFirst);
      drawGoldMine(drawCoordSecond);
      console.log(goldMines.length);
    };
    canvas.addEventListener("click", handleClick);
    return () => {
      canvas.removeEventListener("click", handleClick);
    };
  }, [goldMines]);

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
      creator_name: creatorName,
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
      <div className="overallDiv">
        <div className="Creation-titleContainer">
          <h1 className="Creation-gameTitle u-textCenter">Minion Battle</h1>
        </div>
        <div className="u-flex">
          <div className="Creation-subContainer">
            <canvas id="create-canvas" width={canvasWidth} height={canvasHeight} />
            <div className="Creation-button u-pointer">Add gold</div>
          </div>
          <div className="Creation-subContainer">
            <div>
              <div className="configurables">
                <h1>Creator Name</h1>
                <input
                  type="text"
                  placeholder={props.userId}
                  value={creatorName}
                  onChange={handleCreatorChange}
                  className="Creation-input"
                />
              </div>
              <div className="configurables">
                <h1>Map Name</h1>
                <input
                  type="text"
                  placeholder="New Map"
                  value={mapName}
                  onChange={handleMapNameChange}
                  className="Creation-input"
                />
              </div>
              <div className="configurables">
                <form>
                  <button
                    type="submit"
                    className="Creation-button u-pointer"
                    value="Save Map"
                    onClick={handleSaveMap}
                    formAction="/"
                  >
                    Save Map
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
        <BackButton text="BACK" destPath="/" />
      </div>
    </>
  );
};

export default CreateMap;
