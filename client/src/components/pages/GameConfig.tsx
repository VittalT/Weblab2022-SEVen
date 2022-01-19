import React, { useState, useEffect } from "react";
import "../../utilities.css";
import { get, post } from "../../utilities";
import "./GameConfig.css";
import User from "../../../../shared/User";

import NavigationButton from "../modules/NavigationButton";

import { Router, RouteComponentProps } from "@reach/router";

import BackButton from "../modules/BackButton";
import { socket } from "../../client-socket";

interface URLProps extends RouteComponentProps {
  gameCode?: string;
}

type Props = URLProps & {
  passedUserId: string;
};

const GameConfig = (props: Props) => {
  const [gameType, setGameType] = useState<string>("bop");
  const [gameCode, setGameCode] = useState<string>("");
  const [hostName, setHostName] = useState<string>("");
  const [playerNames, setPlayerNames] = useState<Array<string>>([""]);

  const [playersIds, setplayersIds] = useState<Array<string>>([""]);
  const [mapId, setmapId] = useState<string>("");
  const [creatorName, setcreatorName] = useState<string>("");

  const startGame = () => {
    post("/api/startGame", { gameId: gameCode, userIds: playersIds });
  };

  const updateLobbyData = (data: {
    gameType: string;
    gameCode: string;
    hostName: string;
    playerNames: Array<string>;
  }) => {
    setGameType(data.gameType);
    setGameCode(data.gameCode);
    setHostName(data.hostName);
    setPlayerNames(data.playerNames);
  };

  useEffect(() => {
    socket.on("updateLobbies", updateLobbyData);
  }, []);

  // *either you are the host or waiting to start
  return (
    <>
      <div className="GameConfig-container">
        <h3 className="GameConfig-header">MINION BATTLE</h3>
        <div> GAME CONFIG </div>
        <div> game type: {gameType} </div>
        <div> game code: {gameCode} </div>
        <div> *game owner: {hostName} </div>
        <div> curent players: {playerNames.toString()} </div>
        <div> current map (TO DO: add option to switch): {mapId} </div>
        <div> start game button (TO DO: implement this) </div>
        <NavigationButton destPath="/game" text="START" onClickFunction={startGame} />
      </div>
      <BackButton text="BACK" destPath="/findgame" />
    </>
  );
};

export default GameConfig;
