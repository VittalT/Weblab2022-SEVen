import React, { useState, useEffect } from "react";
import "../../utilities.css";
import { get, post } from "../../utilities";
import "./GameConfig.css";
import User from "../../../../shared/User";

import NavigationButton from "../modules/NavigationButton";

import { Router, RouteComponentProps } from "@reach/router";

import BackButton from "../modules/BackButton";

type Props = RouteComponentProps & {
  passedUserId: string;
};

const GameConfig = (props: Props) => {
  const [userId, setUserId] = useState<string>("");
  const [isPrivate, setIsPrivate] = useState<string>("");
  const [gameCode, setGameCode] = useState<string>("");
  const [mapId, setmapId] = useState<string>("");
  const [creatorId, setcreatorId] = useState<string>("");
  const [playersIds, setplayersIds] = useState<Array<string>>([""]);

  useEffect(() => {
    console.log(typeof props.passedUserId);
    get("/api/getGame", { creatorId: props.passedUserId }).then((response) => {
      console.log("successfully called get request");
      if (response.msg !== "Error") {
        console.log(response.toString());
        console.log(response.isPrivate);
        setIsPrivate(response.isPrivate);
        setGameCode(response.gameCode);
        setmapId(response.mapId);
        setcreatorId(response.creatorId);
        console.log(response.playersIds);
        setplayersIds(response.playersIds);
      } else {
        console.log("Error");
      }
    });
  }, []);

  return (
    <>
      <div className="GameConfig-container">
        <h3 className="GameConfig-header">MINION BATTLE</h3>
        <div> game type: {isPrivate} </div>
        <div> game code: {gameCode} </div>
        <div> curent players: </div>
        <div> current map (TO DO: add option to switch): {mapId} </div>
        <div> start game button (TO DO: implement this) </div>
      </div>
      <BackButton destPath="/findgame" />
    </>
  );
};

export default GameConfig;
