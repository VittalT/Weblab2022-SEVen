import React, { useState, useEffect } from "react";
import "../../utilities.css";
import "./GameWaiting.css";
import { get, post } from "../../utilities";
import assert from "assert";
import NavigationButton from "../modules/NavigationButton";

import { Router, RouteComponentProps } from "@reach/router";

import BackButton from "../modules/BackButton";
import { isAssertionExpression } from "typescript";

type Props = RouteComponentProps & {
  passedUserId: string;
};

const GameWaiting = (props: Props) => {
  const [userId, setUserId] = useState<string>("");
  const [isPrivate, setIsPrivate] = useState<string>("");
  const [gameCode, setGameCode] = useState<string>("");
  const [mapId, setmapId] = useState<string>("");
  const [creatorId, setcreatorId] = useState<string>("");
  const [creatorName, setcreatorName] = useState<string>("");
  const [playersIds, setplayersIds] = useState<Array<string>>([""]);
  const [playersNames, setPlayersNames] = useState<Array<string>>([""]);

  useEffect(() => {
    async function performThings() {
      const gameCodeThing = props.location!.state;
      const bop = gameCodeThing.gameCode ?? assert.fail("bop");

      const response = await get("/api/getGameByCreatorId", { creator_id: props.passedUserId });
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
      //delete user from database
    };
  }, []);

  return (
    <>
      <div className="GameConfig-container">
        <h3 className="GameConfig-header">MINION BATTLE</h3>
        <div> GAME WAITING </div>
        <div> game type: {isPrivate} </div>
        <div> game code: {gameCode} </div>
        <div> *game owner: {creatorName} </div>
        <div> curent players: {playersNames.toString()} </div>
        <div> current map (TO DO: just display it): {mapId} </div>
      </div>
      <BackButton destPath="/findgame" />
    </>
  );
};

export default GameWaiting;
