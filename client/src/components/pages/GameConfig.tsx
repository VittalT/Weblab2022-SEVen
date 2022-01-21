import React, { useState, useEffect } from "react";
import "../../utilities.css";
import { get, post } from "../../utilities";
import "./GameConfig.css";
import User from "../../../../shared/User";

import NavigationButton from "../modules/NavigationButton";

import { Router, RouteComponentProps, navigate } from "@reach/router";

import BackButton from "../modules/BackButton";
import { socket } from "../../client-socket";

interface URLProps extends RouteComponentProps {
  passedGameCode: string;
  joinRoom: (userId: string, gameCode: string) => void;
  leaveRoom: (userId: string, gameCode: string) => void;
}

type Props = URLProps & {
  passedUserId: string;
};

const GameConfig = (props: Props) => {
  const [userId, setUserId] = useState<string>("");
  const [gameType, setGameType] = useState<string>("bop");
  const [gameCode, setGameCode] = useState<string>("");
  const [hostName, setHostName] = useState<string>("");
  const [playerNames, setPlayerNames] = useState<Array<string>>([""]);
  const [hostId, setHostId] = useState<string>("");

  const [playersIds, setplayersIds] = useState<Array<string>>([""]);
  const [mapId, setmapId] = useState<string>("");
  const [creatorName, setcreatorName] = useState<string>("");

  const updateLobbyData = (data: {
    gameType: string;
    gameCode: string;
    hostName: string;
    hostId: string;
    playerNames: Array<string>;
  }) => {
    setGameType(data.gameType);
    setGameCode(data.gameCode);
    setHostName(data.hostName);
    setHostId(data.hostId);
    setPlayerNames(data.playerNames);
    console.log("function updatelobby data ran");
  };

  const leaveCurrentGame = async () => {
    const data = await post("/api/leaveGame", { userId: props.passedUserId, gameCode: gameCode });
    const receivedGameCode = data.gameCode;
    await props.leaveRoom(props.passedUserId, receivedGameCode);
    navigate("/findgame");
  };

  const startGame = () => {
    socket.emit("startGameTrigger", { gameCode: gameCode });
  };

  const navToGame = () => {
    navigate("/game");
  };

  useEffect(() => {
    socket.on("updateLobbies", updateLobbyData);
    socket.on("startGame", navToGame);

    const doThings = async () => {
      // using gamecode associated with app, populate page with lobby info
      const data = await get("/api/getCurrRoomGameCode");
      const currGameCode = data.gameCode;
      setGameCode(data.gameCode);
      if (currGameCode !== "NONE") {
        const roomJoined = props.joinRoom(props.passedUserId, currGameCode);
        const data = await post("/api/getLobbyInfo", { gameCode: currGameCode });
        console.log(data);
        const lobbyData = await updateLobbyData(data);
      } else {
        navigate("/findgame");
      }
    };

    doThings();
  }, []);

  // *either you are the host or waiting to start
  return (
    <>
      <div className="GameConfig-container">
        <h3 className="GameConfig-header">MINION BATTLE</h3>
        <button onClick={leaveCurrentGame}>LEAVE THIS GAME</button>
        <div> GAME CONFIG </div>
        <div> game type: {gameType} </div>
        <div> game code: {gameCode} </div>
        <div> *game owner: {hostName} </div>
        <div> curent players: {playerNames.toString()} </div>
        <div> current map (TO DO: add option to switch): {mapId} </div>
        <div> start game button (TO DO: implement this) </div>
        {props.passedUserId === hostId ? (
          <button onClick={startGame}>START</button>
        ) : (
          <div>{"Waiting for " + hostName + " to start the game... "}</div>
        )}
      </div>
    </>
  );
};

export default GameConfig;
