import React, { useState, useEffect } from "react";

import "../../utilities.css";
import "./CreateMap.css";

import BackButton from "../modules/BackButton";

import { Router, RouteComponentProps } from "@reach/router";
//import { drawCreateCanvas } from "../../canvasManager";
import { post } from "../../utilities";
import { isNonNullChain } from "typescript";
import assert from "assert";
import { drawCreateCanvas, drawGoldMine } from "../../create-canvasManager";
import { off } from "process";
import Point from "../../../../shared/Point";
import Minion from "../../../../shared/Minion";
import Tower from "../../../../shared/Tower";
import { towerConstants, GoldConstants } from "../../../../shared/constants";

type CreateMapProps = RouteComponentProps & {
  userId: string;
  userName: string;
};

const CreateMap = (props: CreateMapProps) => {
  const [mapName, setMapName] = useState<string>("");
  const [creatorName, setCreatorName] = useState<string>(props.userName);
  const [numPlayers, setNumPlayers] = useState<number>(0);
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
    if (numPlayers !== 0) {
      canvas = document.getElementById("create-canvas") ?? assert.fail();
      drawCreateCanvas();
      console.log("init");
    }
  }, [numPlayers]);

  useEffect(() => {
    if (numPlayers !== 0) {
      canvas = document.getElementById("create-canvas") ?? assert.fail();
      const handleClick = (event: MouseEvent) => {
        console.log("click");
        const newGoldMines: Array<Point> = [];
        newGoldMines.push(new Point(scaleFactor * event.offsetX, scaleFactor * event.offsetY));
        newGoldMines.push(
          new Point(
            realWidth - scaleFactor * event.offsetX,
            realHeight - scaleFactor * event.offsetY
          )
        );
        if (numPlayers === 4) {
          newGoldMines.push(
            new Point(realWidth - scaleFactor * event.offsetX, scaleFactor * event.offsetY)
          );
          newGoldMines.push(
            new Point(scaleFactor * event.offsetX, realHeight - scaleFactor * event.offsetY)
          );
        }
        for (const newGoldMine of newGoldMines) {
          for (const goldMine of goldMines.concat(newGoldMines)) {
            if (
              newGoldMine !== goldMine &&
              getDistance(newGoldMine, goldMine) < 2 * GoldConstants.realRadius
            )
              return;
          }
        }
        // for (let i = 0; i < towers.length; i++) {
        //   if (
        //     getDistance(newGoldMineReflected, towers[i]) <
        //     GoldConstants.realRadius + towerConstants.Medium.minAdjBuildRadius
        //   )
        //     return;
        // }
        setGoldMines([...goldMines, ...newGoldMines]);
        for (const newGoldMine of newGoldMines) {
          const drawLoc = new Point(newGoldMine.x / scaleFactor, newGoldMine.y / scaleFactor);
          drawGoldMine(drawLoc);
        }
        console.log(goldMines.length);
      };
      canvas.addEventListener("click", handleClick);
      return () => {
        canvas.removeEventListener("click", handleClick);
      };
    }
  }, [numPlayers, goldMines]);

  const handleCreatorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCreatorName(event.target.value);
  };

  const handleMapNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMapName(event.target.value);
  };

  const handleNumPlayerChange = (playerCount: number) => {
    setNumPlayers(playerCount);
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
      <div className="u-gameContainer">
        <div className="Creation-titleContainer">
          <h1 className="Creation-gameTitle u-textCenter u-gameHeader">Minion Battle</h1>
        </div>
        {numPlayers === 0 ? (
          <div className="configurables">
            <h1 className="Creation-configHeader">Number of Players</h1>
            <div>
              <button onClick={() => handleNumPlayerChange(2)}>2</button>
              <button onClick={() => handleNumPlayerChange(4)}>4</button>
            </div>
          </div>
        ) : (
          <div className="u-flex">
            <div className="Creation-subContainer">
              <canvas id="create-canvas" width={canvasWidth} height={canvasHeight} />
              <div className="Creation-button">Add gold</div>
            </div>
            <div className="Creation-subContainer">
              <div>
                <div className="configurables">
                  <h1 className="Creation-configHeader">Creator Name</h1>
                  <input
                    type="text"
                    placeholder={props.userName}
                    value={creatorName}
                    onChange={handleCreatorChange}
                    className="Creation-input"
                  />
                </div>
                <div className="configurables">
                  <h1 className="Creation-configHeader">Map Name</h1>
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
        )}
        <BackButton text="Back" destPath="/" />
      </div>
    </>
  );
};

export default CreateMap;
