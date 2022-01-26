import React, { useState, useEffect } from "react";

import "../../utilities.css";
import "./CreateMap.css";

import BackButton from "../modules/BackButton";

import Button from "@mui/material/Button";

import User from "../../../../shared/User";
import { get } from "../../utilities";
import { navigate } from "@reach/router";

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
import {
  towerConstants,
  GoldConstants,
  canvasDimensions,
  canvasScaleFactors,
} from "../../../../shared/constants";

type CreateMapProps = RouteComponentProps & {
  userId: string;
  userName: string;
  forceNavigate: () => void;
};

const CreateMap = (props: CreateMapProps) => {
  const [mapName, setMapName] = useState<string>("");
  const [creatorName, setCreatorName] = useState<string>(props.userName);
  const [numPlayers, setNumPlayers] = useState<number>(0);
  const [goldMines, setGoldMines] = useState<Point[]>([]);
  const [towers, setTowers] = useState<Point[]>([]);

  const scaleFactor = canvasScaleFactors.createMap;
  const realWidth = canvasDimensions.width;
  const realHeight = canvasDimensions.height;
  const canvasWidth = realWidth * scaleFactor;
  const canvasHeight = realHeight * scaleFactor;

  let canvas: HTMLElement;

  useEffect(() => {
    // import User from "../../../../shared/User";
    // import { get, post } from "../../utilities";
    // import { Router, RouteComponentProps, navigate } from "@reach/router";
    get("/api/whoami").then((user: User) => {
      if (user._id === undefined) {
        navigate("/");
      }
    });

    props.forceNavigate();

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
        newGoldMines.push(new Point(event.offsetX / scaleFactor, event.offsetY / scaleFactor));
        if (numPlayers === 2 || numPlayers === 4) {
          newGoldMines.push(
            new Point(
              realWidth - event.offsetX / scaleFactor,
              realHeight - event.offsetY / scaleFactor
            )
          );
        }
        if (numPlayers === 4) {
          newGoldMines.push(
            new Point(realWidth - event.offsetX / scaleFactor, event.offsetY / scaleFactor)
          );
          newGoldMines.push(
            new Point(event.offsetX / scaleFactor, realHeight - event.offsetY / scaleFactor)
          );
        }

        for (const newGoldMine of newGoldMines) {
          for (const goldMine of goldMines.concat(newGoldMines)) {
            if (
              newGoldMine !== goldMine &&
              newGoldMine.distanceTo(goldMine) < 2 * GoldConstants.realRadius
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
          const drawLoc = new Point(newGoldMine.x * scaleFactor, newGoldMine.y * scaleFactor);
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
          <h1 className="Creation-gameTitle u-textCenter u-gameHeader">Create a Map</h1>
        </div>
        {numPlayers === 0 ? (
          <div className="configurables">
            <div className="Creation-configHeader">Want to Make a Symmetric Map?</div>
            <div className="Creation-centered">
              <div>
                <Button
                  size="large"
                  sx={{
                    marginTop: 1,
                    marginBottom: 1,
                    fontSize: 30,
                    width: 350,
                    borderRadius: 3,
                    fontFamily: "Odibee Sans",
                    backgroundColor: "#ff8ba0",
                    "&:hover": {
                      backgroundColor: "#e76682",
                    },
                  }}
                  variant="contained"
                  onClick={() => handleNumPlayerChange(3)}
                >
                  No Symmetry
                </Button>
              </div>
              <div>
                <Button
                  size="large"
                  sx={{
                    marginTop: 1,
                    marginBottom: 1,
                    fontSize: 30,
                    width: 350,
                    borderRadius: 3,
                    fontFamily: "Odibee Sans",
                    backgroundColor: "#ff8ba0",
                    "&:hover": {
                      backgroundColor: "#e76682",
                    },
                  }}
                  variant="contained"
                  onClick={() => handleNumPlayerChange(2)}
                >
                  2 Player Symmetry
                </Button>
              </div>
              <div>
                <Button
                  size="large"
                  sx={{
                    marginTop: 1,
                    marginBottom: 1,
                    fontSize: 30,
                    width: 350,
                    borderRadius: 3,
                    fontFamily: "Odibee Sans",
                    backgroundColor: "#ff8ba0",
                    "&:hover": {
                      backgroundColor: "#e76682",
                    },
                  }}
                  variant="contained"
                  onClick={() => handleNumPlayerChange(4)}
                >
                  4 Player Symmetry
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="u-flex">
            <div className="Creation-subContainer">
              <canvas
                id="create-canvas"
                className="Creation-canvasItem u-pointer"
                width={canvasWidth}
                height={canvasHeight}
              />
              <div className="Creation-subtitle">
                Click in the canvas above to add gold mines! Gold mines cannot intersect.
              </div>
            </div>
            <div className="Creation-subContainer">
              <div>
                <div className="configurablesX">
                  <h1 className="Creation-configHeaderX">Creator Name</h1>
                  <input
                    type="text"
                    placeholder={props.userName}
                    value={creatorName}
                    onChange={handleCreatorChange}
                    className="Creation-input"
                  />
                </div>
                <div className="configurablesX">
                  <h1 className="Creation-configHeaderX">Map Name</h1>
                  <input
                    type="text"
                    placeholder="New Map"
                    value={mapName}
                    onChange={handleMapNameChange}
                    className="Creation-input"
                  />
                </div>
                <div className="Creation-buttonContainer">
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
