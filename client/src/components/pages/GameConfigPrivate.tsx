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

const GameConfigPrivate = (props: Props) => {
  const [userId, setUserId] = useState<string>("");
  const [isPrivate, setIsPrivate] = useState<string>("");
  const [gameCode, setGameCode] = useState<string>("");
  const [mapId, setmapId] = useState<string>("");
  const [creatorId, setcreatorId] = useState<string>("");
  const [creatorName, setcreatorName] = useState<string>("");
  const [playersIds, setplayersIds] = useState<Array<string>>([""]);
  const [playersNames, setPlayersNames] = useState<Array<string>>([""]);

  const generateCode = (length: number) => {
    let result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };

  const createPrivateGame = async () => {
    const gameCode = generateCode(5);
    await post("/api/createGame", {
      is_private: "private",
      game_code: gameCode,
      map_id: "default for now",
    });
  };

  useEffect(() => {
    async function performThings() {
      const createGame = await createPrivateGame();

      const response = await get("/api/getGame", { creator_id: props.passedUserId });
      console.log(response.toString());

      setIsPrivate(response.is_private);
      setGameCode(response.game_code);
      setmapId(response.map_id);
      setcreatorId(response.creator_id);
      setplayersIds(Array.from(response.players_ids));

      const data = await get("/api/getUserName", { userId: response.creator_id });
      setcreatorName(data.userName);

      const playerIds = Array.from(response.players_ids);
      let playersNamesArray = new Array<string>();
      for (let i = 0; i < playerIds.length; i++) {
        const data = await get("/api/getUserName", { userId: playerIds[i] });
        playersNamesArray.push(data.userName);
      }
      setPlayersNames(playersNamesArray);
    }

    performThings();

    return () => {
      post("/api/destroyGame", { creator_id: props.passedUserId });
    };
  }, []);

  return (
    <>
      <div className="GameConfig-container">
        <h3 className="GameConfig-header">MINION BATTLE</h3>
        <div> game type: {isPrivate} </div>
        <div> lobby owner: {creatorName} </div>
        <div> curent players: {playersNames.toString()} </div>
        <div> game code: {gameCode} </div>
        <div> current map (TO DO: add option to switch): {mapId} </div>
        <div> start game button (TO DO: implement this) </div>
      </div>
      <BackButton destPath="/findgame" />
    </>
  );
};

export default GameConfigPrivate;
